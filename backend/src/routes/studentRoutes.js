const express = require("express");
const router = express.Router();

const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDetails
} = require("../controllers/studentController");

router.get("/", getAllStudents);

router.get("/details", getStudentDetails);

router.get("/:id", getStudentById);

router.post("/", createStudent);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

module.exports = router;