const db = require("../config/db");

// Get All Assignments
const getAllAssignments = (req, res) => {

    const sql = "SELECT * FROM seat_assignments";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Get Assignment By ID
const getAssignmentById = (req, res) => {

    const id = req.params.id;

    const sql =
        "SELECT * FROM seat_assignments WHERE assignment_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Create Assignment
const createAssignment = (req, res) => {

    const {
        plan_id,
        student_id,
        classroom_id,
        row_no,
        col_no,
        seat_label
    } = req.body;

    const sql =
        `INSERT INTO seat_assignments
        (
            plan_id,
            student_id,
            classroom_id,
            row_no,
            col_no,
            seat_label
        )
        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [
            plan_id,
            student_id,
            classroom_id,
            row_no,
            col_no,
            seat_label
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Seat assignment created successfully"
            });
        }
    );
};

// Delete Assignment
const deleteAssignment = (req, res) => {

    const id = req.params.id;

    const sql =
        "DELETE FROM seat_assignments WHERE assignment_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            message: "Seat assignment deleted successfully"
        });
    });
};

const getAssignmentDetails = (req, res) => {

    const sql = `
        SELECT
            sa.assignment_id,
            s.roll_no,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            c.room_no,
            sa.row_no,
            sa.col_no,
            sa.seat_label,
            e.exam_name,
            e.subject_name
        FROM seat_assignments sa
        JOIN students s
            ON sa.student_id = s.student_id
        JOIN classrooms c
            ON sa.classroom_id = c.classroom_id
        JOIN seating_plans sp
            ON sa.plan_id = sp.plan_id
        JOIN exams e
            ON sp.exam_id = e.exam_id
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

module.exports = {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    deleteAssignment,
    getAssignmentDetails
};