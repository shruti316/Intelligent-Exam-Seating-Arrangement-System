const express = require("express");
const router = express.Router();

const {
    getAllAssignments,
    getAssignmentById,
    createAssignment,
    getAssignmentDetails,
    deleteAssignment
} = require("../controllers/seatAssignmentController");

router.get("/", getAllAssignments);
router.get("/details", getAssignmentDetails);
router.get("/:id", getAssignmentById);
router.post("/", createAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;