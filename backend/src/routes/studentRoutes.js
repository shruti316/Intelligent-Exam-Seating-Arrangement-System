const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentDetails,
    uploadStudentCSV
} = require("../controllers/studentController");

router.get("/", getAllStudents);

router.get("/details", getStudentDetails);

router.get("/:id", getStudentById);

router.post("/", createStudent);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

router.post("/upload", upload.single("file"), uploadStudentCSV);

module.exports = router;