const db = require("../config/db");

// Get All Seating Plans
const getAllSeatingPlans = (req, res) => {

    const sql = "SELECT * FROM seating_plans";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Get Seating Plan By ID
const getSeatingPlanById = (req, res) => {

    const id = req.params.id;

    const sql =
        "SELECT * FROM seating_plans WHERE plan_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

// Create Seating Plan
const createSeatingPlan = (req, res) => {

    const {
        exam_id,
        algorithm_version
    } = req.body;

    const sql =
        `INSERT INTO seating_plans
        (exam_id, algorithm_version)
        VALUES (?, ?)`;

    db.query(
        sql,
        [
            exam_id,
            algorithm_version
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Seating plan created successfully"
            });
        }
    );
};

// Delete Seating Plan
const deleteSeatingPlan = (req, res) => {

    const id = req.params.id;

    const sql =
        "DELETE FROM seating_plans WHERE plan_id=?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json({
            message: "Seating plan deleted successfully"
        });
    });
};

const getSeatingPlanDetails = (req, res) => {

    const sql = `
        SELECT
            sp.plan_id,
            sp.algorithm_version,
            sp.generated_at,
            e.exam_id,
            e.exam_name,
            e.subject_code,
            e.subject_name,
            e.exam_date
        FROM seating_plans sp
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
    getAllSeatingPlans,
    getSeatingPlanById,
    createSeatingPlan,
    deleteSeatingPlan,
    getSeatingPlanDetails
};