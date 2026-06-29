const db = require("../config/db");

const insertSeatAssignments = (planId, assignments) => {

    return new Promise((resolve, reject) => {

        if (!assignments || assignments.length === 0) {
            return resolve();
        }

        const values = assignments.map(assignment => ([
            planId,
            assignment.studentId,
            assignment.classroomId,
            assignment.row,
            assignment.col,
            assignment.seatLabel
        ]));

        const query = `
            INSERT INTO seat_assignments
            (
                plan_id,
                student_id,
                classroom_id,
                row_no,
                col_no,
                seat_label
            )
            VALUES ?
        `;

        db.query(query, [values], (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve(result);

        });

    });

};

module.exports = {
    insertSeatAssignments
};