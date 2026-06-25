const db = require("../config/db");

// Get all registrations
const getAllRegistrations = (req, res) => {

    const sql = "SELECT * FROM exam_registrations";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Get registration by ID
const getRegistrationById = (req, res) => {

    const id = req.params.id;

    const sql =
        "SELECT * FROM exam_registrations WHERE registration_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Create registration
const createRegistration = (req, res) => {

    const {
        exam_id,
        student_id
    } = req.body;

    const sql =
        `INSERT INTO exam_registrations
        (exam_id, student_id)
        VALUES (?, ?)`;

    db.query(
        sql,
        [exam_id, student_id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Registration created successfully"
            });
        }
    );
};

// Delete registration
const deleteRegistration = (req, res) => {

    const id = req.params.id;

    const sql =
        "DELETE FROM exam_registrations WHERE registration_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            message: "Registration deleted successfully"
        });
    });
};

const getRegistrationDetails = (req, res) => {

    const sql = `
        SELECT
            er.registration_id,
            s.student_id,
            s.roll_no,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            e.exam_id,
            e.exam_name,
            e.subject_code,
            e.subject_name,
            e.exam_date
        FROM exam_registrations er
        JOIN students s
            ON er.student_id = s.student_id
        JOIN exams e
            ON er.exam_id = e.exam_id
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

module.exports = {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    deleteRegistration,
    getRegistrationDetails
};