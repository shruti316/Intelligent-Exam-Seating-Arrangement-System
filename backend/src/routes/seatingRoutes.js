const express = require("express");
const router = express.Router();

const {
    generateSeating,
    getSeatingByExam
} = require("../controllers/seatingController");

router.post("/generate", generateSeating);

router.get("/:examId", getSeatingByExam);

module.exports = router;