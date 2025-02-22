const express = require("express");
const { getMedications,markAsTaken,getMedicationById,getDoseSchedule,logDailyProgress, addMedication, updateMedication, deleteMedication } = require("../controllers/medicationController");
const authMiddleware = require("../middleware/authMiddleware");
const { calculateMedicationProgress } = require("../controllers/medicationProgressController");

const router = express.Router();

router.get("/", authMiddleware, getMedications);  // Get user's medications
router.post("/", authMiddleware, addMedication);  // Add medication
router.put("/:id", authMiddleware, updateMedication);  // Update medication
router.delete("/:id", authMiddleware, deleteMedication);  // Delete medication
router.put("/mark-as-taken/:medicationId",markAsTaken);
router.get("/:id", authMiddleware, getMedicationById); // Protected route with authentication middleware
router.get('/progress/:id', calculateMedicationProgress );

// Route to log daily medication progress
router.post("/log-progress",authMiddleware, logDailyProgress);
router.get("/dose-schedule",authMiddleware, getDoseSchedule);


module.exports = router;
