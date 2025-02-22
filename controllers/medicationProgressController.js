const Medication = require('../models/medicationModel');  // Import Medication model

const calculateMedicationProgress = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🔍 Fetching medication progress for ID: ${id}`);

    const medication = await Medication.findById(id);
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }
    console.log("🔄 Updated takenHistory:", medication.takenHistory);

    
    if (!Array.isArray(medication.takenHistory)) {
      medication.takenHistory = [];
    }

    const totalDoses = (medication.time?.length || 0) * medication.duration;
    let takenDays = 0, totalDosesTaken = 0, dailyProgress = [];

    for (let i = 0; i < medication.duration; i++) {
      const doseDate = new Date(medication.startDate);
      doseDate.setDate(doseDate.getDate() + i);
      doseDate.setHours(0, 0, 0, 0); // Ensure time is removed 
      console.log(`🕒 Checking for Date: ${doseDate.toISOString().split("T")[0]}`);

      const totalDosesForDay = Array.isArray(medication.time) ? medication.time.length : 0;
      if (totalDosesForDay === 0) continue;

      const takenEntry = medication.takenHistory.find((entry) => {
        const entryDate = new Date(entry.date); // Ensure Date object
        entryDate.setHours(0, 0, 0, 0); // Normalize time for matching
        return entryDate.getTime() === doseDate.getTime();

        // return entryDate.toISOString().split("T")[0] === doseDate.toISOString().split("T")[0];
      });

      let dosesTaken = takenEntry?.times?.length || 0;
      takenDays += Math.max(0, dosesTaken / totalDosesForDay);
      totalDosesTaken += Math.max(0, dosesTaken);

      dailyProgress.push({
        date: doseDate.toISOString().split("T")[0],
        dosesTaken,
        totalDoses: totalDosesForDay,
        dosesSkipped: Math.max(0, totalDosesForDay - dosesTaken),
      });
    }

    const skippedDays = Math.max(0, medication.duration - Math.floor(takenDays));

    console.log("📊 Daily Progress:", dailyProgress);
    console.log("✅ Taken Days:", takenDays, "⏳ Skipped Days:", skippedDays);
    console.log("💊 Total Doses Taken:", totalDosesTaken, "/", totalDoses);

    res.status(200).json({
      medication,
      takenDays,
      totalDosesTaken,
      totalDoses,
      skippedDays,
      dailyProgress,
    });

  } catch (error) {
    console.error("❌ Error calculating medication progress:", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// module.exports = { calculateMedicationProgress };
module.exports = { calculateMedicationProgress };
