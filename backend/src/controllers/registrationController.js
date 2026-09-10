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

// Get registrations for a specific exam
const getRegistrationsByExam = (req, res) => {
    const examId = req.params.examId;

    const sql = `
        SELECT 
            er.registration_id AS registrationId,
            s.student_id AS studentId,
            s.roll_no AS rollNo,
            s.first_name AS firstName,
            s.last_name AS lastName,
            CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS studentName,
            d.department_name AS departmentName,
            d.department_code AS departmentCode,
            s.section,
            s.semester
        FROM exam_registrations er
        JOIN students s ON er.student_id = s.student_id
        JOIN departments d ON s.department_id = d.department_id
        WHERE er.exam_id = ?
        ORDER BY s.roll_no;
    `;

    db.query(sql, [examId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.status(200).json(results);
    });
};

// Create bulk registrations
const createBulkRegistrations = (req, res) => {
    const { exam_id, student_ids } = req.body;

    if (!exam_id || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: "exam_id and a non-empty student_ids array are required."
        });
    }

    const values = student_ids.map(sId => [Number(exam_id), Number(sId)]);

    const sql = `
        INSERT IGNORE INTO exam_registrations (exam_id, student_id)
        VALUES ?
    `;

    db.query(sql, [values], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        res.status(201).json({
            success: true,
            message: `Successfully registered ${result.affectedRows} student(s) to the exam.`,
            affectedRows: result.affectedRows
        });
    });
};

// Delete registration by student and exam
const deleteRegistrationByStudentAndExam = (req, res) => {
    const { examId, studentId } = req.params;

    const sql = "DELETE FROM exam_registrations WHERE exam_id = ? AND student_id = ?";

    db.query(sql, [examId, studentId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        res.status(200).json({
            success: true,
            message: "Student registration removed successfully"
        });
    });
};

// Bulk delete registrations
const deleteBulkRegistrations = (req, res) => {
    const { exam_id, student_ids } = req.body;

    if (!exam_id || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: "exam_id and student_ids array are required."
        });
    }

    const sql = "DELETE FROM exam_registrations WHERE exam_id = ? AND student_id IN (?)";

    db.query(sql, [exam_id, student_ids], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }

        res.status(200).json({
            success: true,
            message: `Successfully removed ${result.affectedRows} registration(s).`,
            affectedRows: result.affectedRows
        });
    });
};

module.exports = {
    getAllRegistrations,
    getRegistrationById,
    getRegistrationsByExam,
    createRegistration,
    createBulkRegistrations,
    deleteRegistration,
    deleteRegistrationByStudentAndExam,
    deleteBulkRegistrations,
    getRegistrationDetails
};