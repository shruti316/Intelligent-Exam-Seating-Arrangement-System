const db = require('../config/db');

const getAllDepartments = (req, res) => {
    const sql = "SELECT * FROM departments";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

const getDepartmentById = (req, res) => {
    const id = req.params.id;
    const sql =
      "SELECT * FROM departments WHERE department_id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(result);
    });
};

const createDepartment = (req, res) => {
    const {
        department_name,
        department_code,
        home_zone
    } = req.body;

    if (!department_name || !department_code) {
        return res.status(400).json({
            message: "Department name and code are required"
        });
    }
    const sql =
      `INSERT INTO departments
      (department_name, department_code, home_zone)
      VALUES (?, ?, ?)`;
    db.query(
        sql,
        [department_name, department_code, home_zone],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Department created successfully"
            });
        }
    );
};


const updateDepartment = (req, res) => {
    const id = req.params.id;
    const {
        department_name,
        department_code,
        home_zone
    } = req.body;

    const sql =
      `UPDATE departments
       SET department_name=?,
           department_code=?,
           home_zone=?
       WHERE department_id=?`;
    db.query(
        sql,
        [
            department_name,
            department_code,
            home_zone,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json({
                message: "Department updated successfully"
            });
        }
    );
};



const deleteDepartment = (req, res) => {
    const id = req.params.id;
    const sql =
      "DELETE FROM departments WHERE department_id=?";
    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            message: "Department deleted successfully"
        });
    });
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
