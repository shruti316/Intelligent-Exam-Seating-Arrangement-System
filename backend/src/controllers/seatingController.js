const db = require("../config/db");

const getSeatingInput = (req, res) => {

    const examId = req.params.examId;

    const studentQuery = `
        SELECT
            s.student_id AS studentId,
            s.roll_no AS rollNo,
            d.department_code AS department,
            s.section
        FROM exam_registrations er
        JOIN students s
            ON er.student_id = s.student_id
        JOIN departments d
            ON s.department_id = d.department_id
        WHERE er.exam_id = ?;
    `;

    db.query(studentQuery, [examId], (err, students) => {

        if (err) {
            return res.status(500).json(err);
        }

        const roomQuery = `
            SELECT
                classroom_id AS classroomId,
                room_no AS roomNo,
                rows_count AS rowCount,
                cols_count AS colCount
            FROM classrooms;
        `;

        db.query(roomQuery, (err, rooms) => {

            if (err) {
                return res.status(500).json(err);
            }

            const formattedRooms = rooms.map(room => ({
                classroomId: room.classroomId,
                roomNo: room.roomNo,
                rows: room.rowCount,
                cols: room.colCount
            }));

            res.json({
                examId: Number(examId),
                students,
                rooms: formattedRooms
            });

        });

    });

};

module.exports = {
    getSeatingInput
};