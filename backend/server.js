const express = require('express');
require('dotenv').config();

const db = require('./src/config/db');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Intelligent Exam Seating Arrangement System API!');
});

const departmentRoutes =
require("./src/routes/departmentRoutes");
app.use("/api/departments", departmentRoutes);

const studentRoutes =
require("./src/routes/studentRoutes");
app.use("/api/students", studentRoutes);

const classroomRoutes =
require("./src/routes/classroomRoutes");
app.use("/api/classrooms", classroomRoutes);

const examRoutes =
require("./src/routes/examRoutes");
app.use("/api/exams", examRoutes);

const registrationRoutes =
require("./src/routes/registrationRoutes");
app.use("/api/registrations", registrationRoutes);

const seatingPlanRoutes =
require("./src/routes/seatingPlanRoutes");
app.use("/api/seating-plans", seatingPlanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


