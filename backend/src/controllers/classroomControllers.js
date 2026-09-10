const db = require("../config/db");

// Get All Classrooms
const getAllClassrooms = (req, res) => {
    const sql = "SELECT * FROM classrooms";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(result);
    });
};

// Get Classroom By ID
const getClassroomById = (req, res) => {
    const id = req.params.id;
    const sql =
        "SELECT * FROM classrooms WHERE classroom_id=?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(result);
    });
};

// Create Classroom
const createClassroom = (req, res) => {
    const {
        room_no,
        rows_count,
        cols_count,
        capacity
    } = req.body;
    const sql =
        `INSERT INTO classrooms
        (room_no, rows_count, cols_count, capacity)
        VALUES (?, ?, ?, ?)`;
    db.query(
        sql,
        [
            room_no,
            rows_count,
            cols_count,
            capacity
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.status(201).json({
                message: "Classroom added successfully",
                classroomId: result.insertId
            });
        }
    );
};

// Update Classroom
const updateClassroom = (req, res) => {
    const id = req.params.id;
    const {
        room_no,
        rows_count,
        cols_count,
        capacity
    } = req.body;
    const sql =
        `UPDATE classrooms
         SET room_no=?,
             rows_count=?,
             cols_count=?,
             capacity=?
         WHERE classroom_id=?`;
    db.query(
        sql,
        [
            room_no,
            rows_count,
            cols_count,
            capacity,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.status(200).json({
                message: "Classroom updated successfully"
            });
        }
    );
};

// Delete Classroom
const deleteClassroom = (req, res) => {
    const id = req.params.id;
    const sql =
        "DELETE FROM classrooms WHERE classroom_id=?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json({
            message: "Classroom deleted successfully"
        });
    });
};

// Get Classroom Availability for an exam (checks overlapping exam time conflicts)
const getClassroomAvailability = (req, res) => {
    const examId = req.params.examId;

    const examQuery = `
        SELECT 
            exam_id, 
            exam_name, 
            subject_name, 
            exam_date, 
            TIME_FORMAT(start_time, '%H:%i') AS start_time, 
            TIME_FORMAT(end_time, '%H:%i') AS end_time 
        FROM exams 
        WHERE exam_id = ?
    `;

    db.query(examQuery, [examId], (err, exams) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (exams.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });

        const currentExam = exams[0];

        const conflictQuery = `
            SELECT DISTINCT
                c.classroom_id,
                c.room_no,
                e.exam_id,
                e.exam_name,
                e.subject_name,
                e.subject_code,
                e.exam_date,
                TIME_FORMAT(e.start_time, '%H:%i') AS start_time,
                TIME_FORMAT(e.end_time, '%H:%i') AS end_time
            FROM seat_assignments sa
            JOIN seating_plans sp ON sa.plan_id = sp.plan_id
            JOIN exams e ON sp.exam_id = e.exam_id
            JOIN classrooms c ON sa.classroom_id = c.classroom_id
            WHERE e.exam_id != ?
              AND e.exam_date = ?
              AND e.start_time < ?
              AND e.end_time > ?
        `;

        db.query(conflictQuery, [examId, currentExam.exam_date, currentExam.end_time, currentExam.start_time], (conflictErr, occupied) => {
            if (conflictErr) return res.status(500).json({ success: false, message: conflictErr.message });

            res.status(200).json({
                success: true,
                examId: Number(examId),
                exam: currentExam,
                occupiedClassrooms: occupied.map(r => ({
                    classroomId: r.classroom_id,
                    roomNo: r.room_no,
                    occupiedBy: {
                        examId: r.exam_id,
                        examName: r.exam_name,
                        subjectName: r.subject_name,
                        subjectCode: r.subject_code,
                        startTime: r.start_time,
                        endTime: r.end_time
                    }
                }))
            });
        });
    });
};

module.exports = {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    getClassroomAvailability
};