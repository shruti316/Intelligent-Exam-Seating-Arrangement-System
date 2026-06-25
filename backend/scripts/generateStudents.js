const fs = require("fs");

const departments = [1, 2, 3, 4];
const sections = ["A", "B", "C", "D"];

let sql = `-- ===========================================
-- STUDENTS
-- ===========================================

INSERT INTO students
(roll_no, first_name, last_name, department_id, section, semester)
VALUES
`;

const students = [];

for (let i = 1; i <= 220; i++) {

    const rollNo = `23BCS${String(i).padStart(3, "0")}`;

    const firstName = `Student${i}`;

    const lastName = `Test`;

    const department = departments[(i - 1) % departments.length];

    const section = sections[(i - 1) % sections.length];

    students.push(
        `('${rollNo}','${firstName}','${lastName}',${department},'${section}',3)`
    );
}

sql += students.join(",\n");
sql += ";";

fs.writeFileSync("students.sql", sql);

console.log("students.sql generated successfully!");