const db = require("../config/db");

const getAllStudents = (req, res) => {
    const sql = "SELECT * FROM students";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(result);
    });
};

const getStudentById = (req, res) => {
    const id = req.params.id;
    const sql =
      "SELECT * FROM students WHERE student_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(result);
    });
};


const createStudent = (req, res) => {
    const {
        roll_no,
        first_name,
        last_name,
        department_id,
        section,
        semester
    } = req.body;

    if (
        !roll_no ||
        !first_name ||
        !department_id
    ) {
        return res.status(400).json({
            message: "Required fields missing"
        });
    }

    const sql =
      `INSERT INTO students
      (
        roll_no,
        first_name,
        last_name,
        department_id,
        section,
        semester
      )
      VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [
            roll_no,
            first_name,
            last_name,
            department_id,
            section,
            semester
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Student added successfully"
            });
        }
    );
};


const updateStudent = (req, res) => {
    const id = req.params.id;
    const {
        roll_no,
        first_name,
        last_name,
        department_id,
        section,
        semester
    } = req.body;

    const sql =
      `UPDATE students
       SET roll_no=?,
           first_name=?,
           last_name=?,
           department_id=?,
           section=?,
           semester=?
       WHERE student_id=?`;

    db.query(
        sql,
        [
            roll_no,
            first_name,
            last_name,
            department_id,
            section,
            semester,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json({
                message: "Student updated successfully"
            });
        }
    );
};


const deleteStudent = (req, res) => {
    const id = req.params.id;
    const sql =
      "DELETE FROM students WHERE student_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            message: "Student deleted successfully"
        });
    });
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};