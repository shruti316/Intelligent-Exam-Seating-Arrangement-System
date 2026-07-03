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

const getStudentDetails = (req, res) => {

    const sql = `
        SELECT
            s.student_id,
            s.roll_no,
            s.first_name,
            s.last_name,
            s.section,
            s.semester,
            d.department_name,
            d.department_code,
            d.home_zone
        FROM students s
        JOIN departments d
        ON s.department_id = d.department_id
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(200).json(result);
    });
};

const uploadStudentCSV = (req, res) => {
    const { Readable } = require("stream");
    const csv = require("csv-parser");

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    db.query("SELECT department_id, department_code FROM departments", (err, depts) => {
        if (err) {
            return res.status(500).json({ message: "Database error fetching departments", error: err });
        }

        const deptMap = {};
        depts.forEach(d => {
            deptMap[d.department_code.toUpperCase().trim()] = d.department_id;
        });

        const students = [];
        const fileContent = req.file.buffer.toString('utf8');
        const stream = Readable.from(fileContent);

        stream.pipe(csv())
            .on('data', (row) => {
                const keys = Object.keys(row);
                const normalizedRow = {};
                keys.forEach(k => {
                    normalizedRow[k.toLowerCase().replace(/_|\s/g, '')] = row[k];
                });

                const rollNo = normalizedRow.rollno || normalizedRow.roll_no;
                const firstName = normalizedRow.firstname || normalizedRow.first_name;
                const lastName = normalizedRow.lastname || normalizedRow.last_name || '';
                const deptCode = (normalizedRow.departmentcode || normalizedRow.department_code || normalizedRow.department || '').toUpperCase().trim();
                const section = normalizedRow.section || 'A';
                const semester = parseInt(normalizedRow.semester) || 1;

                const deptId = deptMap[deptCode] || null;

                if (rollNo && firstName && deptId) {
                    students.push([
                        rollNo,
                        firstName,
                        lastName,
                        deptId,
                        section,
                        semester
                    ]);
                }
            })
            .on('end', () => {
                if (students.length === 0) {
                    return res.status(400).json({ message: "No valid students found in CSV." });
                }

                const sql = `
                    INSERT INTO students (roll_no, first_name, last_name, department_id, section, semester)
                    VALUES ?
                    ON DUPLICATE KEY UPDATE
                        first_name = VALUES(first_name),
                        last_name = VALUES(last_name),
                        department_id = VALUES(department_id),
                        section = VALUES(section),
                        semester = VALUES(semester)
                `;

                db.query(sql, [students], (insertErr, result) => {
                    if (insertErr) {
                        return res.status(500).json({ message: "Error importing students to database", error: insertErr });
                    }
                    res.status(200).json({
                        success: true,
                        message: `Successfully imported ${students.length} student records.`
                    });
                });
            })
            .on('error', (streamErr) => {
                res.status(500).json({ message: "Error reading CSV file stream", error: streamErr });
            });
    });
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDetails,
    uploadStudentCSV
};