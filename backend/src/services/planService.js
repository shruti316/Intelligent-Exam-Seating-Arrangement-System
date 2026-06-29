const db = require("../config/db");

const createSeatingPlan = (examId) => {

    return new Promise((resolve, reject) => {

        const query = `
            INSERT INTO seating_plans
            (exam_id, algorithm_version)
            VALUES
            (?, ?)
        `;

        db.query(
            query,
            [examId, "v1.0"],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve(result.insertId);

            }
        );

    });

};

module.exports = {
    createSeatingPlan
};