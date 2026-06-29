const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const generateSeating = (examId) => {

    return new Promise((resolve, reject) => {

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
                return reject(err);
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
                    return reject(err);
                }

                const formattedRooms = rooms.map(room => ({
                    classroomId: room.classroomId,
                    roomNo: room.roomNo,
                    rows: room.rowCount,
                    cols: room.colCount
                }));

                const inputData = {
    examId: Number(examId),
    students,
    rooms: formattedRooms
};

// Path to cpp-engine/test/input.json
const inputPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "cpp-engine",
    "test",
    "input.json"
);

fs.writeFileSync(
    inputPath,
    JSON.stringify(inputData, null, 2)
);

resolve(inputData);

            });

        });

    });

};

module.exports = {
    generateSeating
};