const express = require("express");
const router = express.Router();

const {
    getAllSeatingPlans,
    getSeatingPlanById,
    createSeatingPlan,
    getSeatingPlanDetails,
    deleteSeatingPlan
} = require("../controllers/seatingPlanController");

router.get("/", getAllSeatingPlans);
router.get("/details", getSeatingPlanDetails);
router.get("/:id", getSeatingPlanById);
router.post("/", createSeatingPlan);
router.delete("/:id", deleteSeatingPlan);

module.exports = router;