const express = require("express");
const router = express.Router();

const {
    getAllRegistrations,
    getRegistrationById,
    createRegistration,
    deleteRegistration
} = require("../controllers/registrationController");

router.get("/", getAllRegistrations);
router.get("/:id", getRegistrationById);
router.post("/", createRegistration);
router.delete("/:id", deleteRegistration);

module.exports = router;