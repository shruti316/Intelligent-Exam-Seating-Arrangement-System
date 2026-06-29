const express = require("express");
const router = express.Router();

const {
    getSeatingInput,
    generateSeating,
    getSeatingByExam
} = require("../controllers/seatingController");

router.get("/input/:examId", getSeatingInput);

router.post("/generate", generateSeating);

router.get("/:examId", getSeatingByExam);

module.exports = router;