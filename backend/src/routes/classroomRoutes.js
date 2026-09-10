const express = require("express");
const router = express.Router();
const {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    getClassroomAvailability
} = require("../controllers/classroomControllers");

router.get("/", getAllClassrooms);

router.get("/availability/:examId", getClassroomAvailability);

router.get("/:id", getClassroomById);

router.post("/", createClassroom);

router.put("/:id", updateClassroom);

router.delete("/:id", deleteClassroom);

module.exports = router;