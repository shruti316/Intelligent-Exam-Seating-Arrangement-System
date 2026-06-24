const express = require("express");
const router = express.Router();
const {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom
} = require("../controllers/classroomControllers");

router.get("/", getAllClassrooms);

router.get("/:id", getClassroomById);

router.post("/", createClassroom);

router.put("/:id", updateClassroom);

router.delete("/:id", deleteClassroom);

module.exports = router;