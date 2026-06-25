const express = require("express");
const router = express.Router();

const { getSeatingInput } = require("../controllers/seatingController");

router.get("/input/:examId", getSeatingInput);

module.exports = router;