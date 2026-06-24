const express = require("express");

const router = express.Router();

const {
    getAllExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam
} = require("../controllers/examController");

router.get("/", getAllExams);

router.get("/:id", getExamById);

router.post("/", createExam);

router.put("/:id", updateExam);

router.delete("/:id", deleteExam);

module.exports = router;