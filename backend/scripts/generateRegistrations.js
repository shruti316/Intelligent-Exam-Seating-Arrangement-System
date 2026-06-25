const fs = require("fs");

let sql = `-- ===========================================
-- EXAM REGISTRATIONS
-- ===========================================

INSERT INTO exam_registrations
(student_id, exam_id)
VALUES
`;

const registrations = [];

// Exam 1 -> 180 students
for (let i = 1; i <= 180; i++) {
    registrations.push(`(${i},1)`);
}

// Exam 2 -> 150 students
for (let i = 1; i <= 150; i++) {
    registrations.push(`(${i},2)`);
}

// Exam 3 -> 90 students
for (let i = 1; i <= 90; i++) {
    registrations.push(`(${i},3)`);
}

// Exam 4 -> 220 students
for (let i = 1; i <= 220; i++) {
    registrations.push(`(${i},4)`);
}

sql += registrations.join(",\n");
sql += ";";

fs.writeFileSync("exam_registrations.sql", sql);

console.log("exam_registrations.sql generated successfully!");