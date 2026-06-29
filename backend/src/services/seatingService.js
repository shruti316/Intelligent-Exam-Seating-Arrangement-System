const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const generateSeating = (examId) => {

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
                    d.department_code AS department,
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
                // Get Rooms
                // ===========================

                const roomQuery = `
                    SELECT
                        classroom_id AS classroomId,
                        room_no AS roomNo,
                        rows_count AS rowCount,
                        cols_count AS colCount
                    FROM classrooms;
                `;

                db.query(roomQuery, (err, rooms) => {

                    if (err) return reject(err);

                    if (rooms.length === 0) {
                        return reject(new Error("No classrooms available."));
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
                            new Error("Not enough classroom capacity.")
                        );
                    }

                    // ===========================
                    // Generate input.json
                    // ===========================

                    const inputData = {
                        examId: Number(examId),
                        students,
                        rooms: formattedRooms
                    };

                    const inputPath = path.join(
                        __dirname,
                        "..",
                        "..",
                        "..",
                        "cpp-engine",
                        "test",
                        "input.json"
                    );

                    fs.writeFileSync(
                        inputPath,
                        JSON.stringify(inputData, null, 2)
                    );

                    resolve(inputData);

                });

            });

        });

    });

};

module.exports = {
    generateSeating
};