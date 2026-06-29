const db = require("../config/db");

const getSeatingByExam = (examId) => {

    return new Promise((resolve, reject) => {

        const query = `
            SELECT
                sp.plan_id,
                sp.generated_at,
                sp.algorithm_version,

                s.student_id,
                s.roll_no,
                CONCAT(s.first_name, ' ', s.last_name) AS studentName,
                d.department_code,

                c.room_no,

                sa.row_no,
                sa.col_no,
                sa.seat_label

            FROM seating_plans sp

            JOIN seat_assignments sa
                ON sp.plan_id = sa.plan_id

            JOIN students s
                ON sa.student_id = s.student_id

            JOIN departments d
                ON s.department_id = d.department_id

            JOIN classrooms c
                ON sa.classroom_id = c.classroom_id

            WHERE sp.exam_id = ?

            ORDER BY
                c.room_no,
                sa.row_no,
                sa.col_no;
        `;

        db.query(query, [examId], (err, results) => {

            if (err) {
                return reject(err);
            }

            resolve(results);

        });

    });

};

module.exports = {
    getSeatingByExam
};