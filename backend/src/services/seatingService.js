const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const { runAllocator } = require("./allocatorService");

const generateSeating = (examId, classroomIds) => {

    return new Promise((resolve, reject) => {

        // ===========================
        // Validate Exam
        // ===========================

        const examQuery = `
            SELECT exam_id
            FROM exams
            WHERE exam_id = ?;
        `;

        db.query(examQuery, [examId], (err, exams) => {

            if (err) return reject(err);

            if (exams.length === 0) {
                return reject(new Error("Exam not found."));
            }

            // ===========================
            // Get Students
            // ===========================

            const studentQuery = `
                SELECT
                    s.student_id AS studentId,
                    s.roll_no AS rollNo,
                    d.department_code AS departmentCode,
                    s.section
                FROM exam_registrations er
                JOIN students s
                    ON er.student_id = s.student_id
                JOIN departments d
                    ON s.department_id = d.department_id
                WHERE er.exam_id = ?;
            `;

            db.query(studentQuery, [examId], (err, students) => {

                if (err) return reject(err);

                if (students.length === 0) {
                    return reject(new Error("No students registered for this exam."));
                }

                // ===========================
                // Get Rooms (Filtered by selected classroomIds if provided)
                // ===========================

                let roomQuery = `
                    SELECT
                        classroom_id AS classroomId,
                        room_no AS roomNo,
                        rows_count AS rowCount,
                        cols_count AS colCount
                    FROM classrooms
                `;

                let roomParams = [];
                if (classroomIds && classroomIds.length > 0) {
                    roomQuery += ` WHERE classroom_id IN (?)`;
                    roomParams.push(classroomIds);
                }

                db.query(roomQuery, roomParams, async (err, rooms) => {

                    if (err) return reject(err);

                    if (rooms.length === 0) {
                        return reject(new Error("No classrooms selected or available."));
                    }

                    const formattedRooms = rooms.map(room => ({
                        classroomId: room.classroomId,
                        roomNo: room.roomNo,
                        rows: room.rowCount,
                        cols: room.colCount
                    }));

                    // ===========================
                    // Capacity Validation
                    // ===========================

                    const totalCapacity = formattedRooms.reduce(
                        (sum, room) => sum + (room.rows * room.cols),
                        0
                    );

                    if (students.length > totalCapacity) {
                        return reject(
                            new Error(`Not enough classroom capacity. Required: ${students.length}, Available: ${totalCapacity}`)
                        );
                    }

                    // ===========================
                    // Generate temp files
                    // ===========================

                    const inputPath = path.join(
                        __dirname,
                        "..",
                        "..",
                        "..",
                        "cpp-engine",
                        `input_${examId}.json`
                    );

                    const outputPath = path.join(
                        __dirname,
                        "..",
                        "..",
                        "..",
                        "cpp-engine",
                        `output_${examId}.json`
                    );

                    const inputData = {
                        students,
                        rooms: formattedRooms
                    };

                    try {
                        // Write input json
                        fs.writeFileSync(
                            inputPath,
                            JSON.stringify(inputData, null, 2)
                        );

                        // Run allocator.exe
                        await runAllocator(inputPath, outputPath, "Snake");

                        // Verify output json exists
                        if (!fs.existsSync(outputPath)) {
                            throw new Error("Allocator output file was not created.");
                        }

                        // Read output json
                        const outputDataRaw = fs.readFileSync(outputPath, "utf8");
                        let outputData;
                        try {
                            outputData = JSON.parse(outputDataRaw);
                        } catch (e) {
                            throw new Error("Allocator output is malformed JSON.");
                        }

                        // Validate engine response status
                        if (!outputData.success && outputData.status === "error") {
                            const errMsg = (outputData.error && outputData.error.message) || outputData.error || "Allocator execution failed.";
                            throw new Error(errMsg);
                        }

                        const assignments = outputData.assignments || [];
                        const summary = outputData.summary || {};

                        // ===========================
                        // Persist to database (Transaction)
                        // ===========================

                        db.beginTransaction((transactionErr) => {
                            if (transactionErr) throw transactionErr;

                            // 1. Delete previous assignments for this exam
                            const deleteAssignmentsQuery = `
                                DELETE sa 
                                FROM seat_assignments sa
                                JOIN seating_plans sp ON sa.plan_id = sp.plan_id
                                WHERE sp.exam_id = ?
                            `;

                            db.query(deleteAssignmentsQuery, [examId], (deleteSaErr) => {
                                if (deleteSaErr) {
                                    return db.rollback(() => { reject(deleteSaErr); });
                                }

                                // 2. Delete previous plans for this exam
                                const deletePlanQuery = `
                                    DELETE FROM seating_plans
                                    WHERE exam_id = ?
                                `;

                                db.query(deletePlanQuery, [examId], (deleteSpErr) => {
                                    if (deleteSpErr) {
                                        return db.rollback(() => { reject(deleteSpErr); });
                                    }

                                    // 3. Create new seating plan with summary stats
                                    const insertPlanQuery = `
                                        INSERT INTO seating_plans
                                        (
                                            exam_id, 
                                            algorithm_version,
                                            total_students,
                                            occupied_seats,
                                            empty_seats,
                                            conflict_count,
                                            execution_time_ms
                                        )
                                        VALUES (?, ?, ?, ?, ?, ?, ?)
                                    `;

                                    const stats = [
                                        examId,
                                        "v1.0-cpp",
                                        summary.totalStudents || students.length,
                                        summary.occupiedSeats || assignments.length,
                                        summary.emptySeats || 0,
                                        summary.totalConflicts || 0,
                                        summary.executionTimeMs || 0.0
                                    ];

                                    db.query(insertPlanQuery, stats, (insertPlanErr, planResult) => {
                                        if (insertPlanErr) {
                                            return db.rollback(() => { reject(insertPlanErr); });
                                        }

                                        const newPlanId = planResult.insertId;

                                        // 4. Batch insert all seat assignments
                                        if (assignments.length === 0) {
                                            db.commit((commitErr) => {
                                                if (commitErr) {
                                                    return db.rollback(() => { reject(commitErr); });
                                                }
                                                cleanupFiles(inputPath, outputPath);
                                                resolve({ success: true, planId: newPlanId, assignments: [] });
                                            });
                                            return;
                                        }

                                        const assignmentValues = assignments.map(a => [
                                            newPlanId,
                                            a.studentId,
                                            a.classroomId,
                                            a.row,
                                            a.col,
                                            a.seatLabel
                                        ]);

                                        const insertAssignmentsQuery = `
                                            INSERT INTO seat_assignments
                                            (
                                                plan_id,
                                                student_id,
                                                classroom_id,
                                                row_no,
                                                col_no,
                                                seat_label
                                            )
                                            VALUES ?
                                        `;

                                        db.query(insertAssignmentsQuery, [assignmentValues], (insertAssignmentsErr) => {
                                            if (insertAssignmentsErr) {
                                                return db.rollback(() => { reject(insertAssignmentsErr); });
                                            }

                                            db.commit((commitErr) => {
                                                if (commitErr) {
                                                    return db.rollback(() => { reject(commitErr); });
                                                }
                                                cleanupFiles(inputPath, outputPath);
                                                resolve({ 
                                                    success: true, 
                                                    planId: newPlanId, 
                                                    assignments,
                                                    summary
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });

                    } catch (serviceErr) {
                        cleanupFiles(inputPath, outputPath);
                        reject(serviceErr);
                    }

                });

            });

        });

    });

};

const cleanupFiles = (inPath, outPath) => {
    try {
        if (fs.existsSync(inPath)) fs.unlinkSync(inPath);
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
    } catch (e) {
        console.error("Cleanup error:", e);
    }
};

module.exports = {
    generateSeating
};