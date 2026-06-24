const db = require("../config/db");

// Get All Exams
const getAllExams = (req, res) => {

    const sql = "SELECT * FROM exams";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Get Exam By ID
const getExamById = (req, res) => {

    const id = req.params.id;

    const sql =
        "SELECT * FROM exams WHERE exam_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Create Exam
const createExam = (req, res) => {

    const {
        exam_name,
        subject_code,
        subject_name,
        semester,
        exam_date,
        start_time,
        end_time,
        status
    } = req.body;

    const sql = `
        INSERT INTO exams
        (
            exam_name,
            subject_code,
            subject_name,
            semester,
            exam_date,
            start_time,
            end_time,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            exam_name,
            subject_code,
            subject_name,
            semester,
            exam_date,
            start_time,
            end_time,
            status
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Exam created successfully"
            });
        }
    );
};

/// Update Exam
const updateExam = (req, res) => {

    const id = req.params.id;

    const {
        exam_name,
        subject_code,
        subject_name,
        semester,
        exam_date,
        start_time,
        end_time,
        status
    } = req.body;

    const sql = `
        UPDATE exams
        SET
            exam_name = ?,
            subject_code = ?,
            subject_name = ?,
            semester = ?,
            exam_date = ?,
            start_time = ?,
            end_time = ?,
            status = ?
        WHERE exam_id = ?
    `;

    db.query(
        sql,
        [
            exam_name,
            subject_code,
            subject_name,
            semester,
            exam_date,
            start_time,
            end_time,
            status,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json({
                message: "Exam updated successfully"
            });
        }
    );
};
// Delete Exam
const deleteExam = (req, res) => {

    const id = req.params.id;

    const sql =
        "DELETE FROM exams WHERE exam_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            message: "Exam deleted successfully"
        });
    });
};

module.exports = {
    getAllExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam
};