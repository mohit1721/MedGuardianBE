const Medication = require('../models/medicationModel');  // Import Medication model
const moment = require("moment-timezone");

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

const getMedicationInsights = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id }).lean();
    const today = moment().tz("Asia/Kolkata").startOf("day");

    let totalDoses = 0;
    let takenDoses = 0;
    let missedDoses = 0;
    let activeMedications = 0;
    let longestStreak = 0;
    let nextDose = null;

    medications.forEach((medication) => {
      const startDate = moment(medication.startDate).tz("Asia/Kolkata").startOf("day");
      const endDate = startDate.clone().add(medication.duration - 1, "days");

      if (today.isBetween(startDate, endDate, "day", "[]")) {
        activeMedications += 1;
      }

      const historyByDate = new Map(
        (medication.takenHistory || []).map((entry) => [
          moment(entry.date).tz("Asia/Kolkata").format("YYYY-MM-DD"),
          Array.isArray(entry.times) ? entry.times.length : 0,
        ])
      );

      let currentStreak = 0;
      for (let i = 0; i < medication.duration; i++) {
        const date = startDate.clone().add(i, "days");
        const dateKey = date.format("YYYY-MM-DD");
        const scheduledDoses = Array.isArray(medication.time) ? medication.time.length : 0;

        totalDoses += scheduledDoses;
        const takenForDate = historyByDate.get(dateKey) || 0;
        takenDoses += Math.min(takenForDate, scheduledDoses);
        missedDoses += Math.max(0, scheduledDoses - takenForDate);

        if (scheduledDoses > 0 && takenForDate >= scheduledDoses) {
          currentStreak += 1;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }

        if (date.isSame(today, "day") && Array.isArray(medication.time)) {
          medication.time.forEach((scheduledTime) => {
            const doseMoment = moment.tz(
              `${today.format("YYYY-MM-DD")} ${scheduledTime}`,
              "YYYY-MM-DD hh:mm A",
              "Asia/Kolkata"
            );

            if (!doseMoment.isValid()) return;

            const alreadyTakenToday =
              (medication.takenHistory || [])
                .find((entry) => moment(entry.date).tz("Asia/Kolkata").isSame(today, "day"))
                ?.times?.includes(scheduledTime) || false;

            if (doseMoment.isAfter(moment().tz("Asia/Kolkata")) && !alreadyTakenToday) {
              if (!nextDose || doseMoment.isBefore(moment(nextDose.datetime))) {
                nextDose = {
                  medicationId: medication._id,
                  name: medication.name,
                  time: scheduledTime,
                  datetime: doseMoment.toISOString(),
                };
              }
            }
          });
        }
      }
    });

    const adherenceRate = totalDoses > 0 ? Number(((takenDoses / totalDoses) * 100).toFixed(2)) : 0;
    const riskLevel = adherenceRate >= 85 ? "low" : adherenceRate >= 60 ? "medium" : "high";

    return res.status(200).json({
      success: true,
      insights: {
        adherenceRate,
        totalDoses,
        takenDoses,
        missedDoses,
        activeMedications,
        longestStreak,
        riskLevel,
        nextDose,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error", details: error.message });
  }
};

// module.exports = { calculateMedicationProgress };
module.exports = { calculateMedicationProgress, getMedicationInsights };
