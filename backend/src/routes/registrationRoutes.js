const express = require("express");
const router = express.Router();

const {
    getAllRegistrations,
    getRegistrationById,
    getRegistrationsByExam,
    createRegistration,
    createBulkRegistrations,
    deleteRegistration,
    deleteRegistrationByStudentAndExam,
    deleteBulkRegistrations,
    getRegistrationDetails
} = require("../controllers/registrationController");

router.get("/", getAllRegistrations);
router.get("/details", getRegistrationDetails);
router.get("/exam/:examId", getRegistrationsByExam);
router.get("/:id", getRegistrationById);

router.post("/", createRegistration);
router.post("/bulk", createBulkRegistrations);
router.post("/bulk-delete", deleteBulkRegistrations);

router.delete("/exam/:examId/student/:studentId", deleteRegistrationByStudentAndExam);
router.delete("/:id", deleteRegistration);

module.exports = router;