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
                message: "Classroom added successfully"
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

module.exports = {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom
};