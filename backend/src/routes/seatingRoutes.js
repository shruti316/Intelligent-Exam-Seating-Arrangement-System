const express = require("express");
const router = express.Router();

const {
    getSeatingInput,
    generateSeating
} = require("../controllers/seatingController");

router.get("/input/:examId", getSeatingInput);
router.post("/generate", generateSeating);

module.exports = router;