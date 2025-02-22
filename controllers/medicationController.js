const Medication = require("../models/medicationModel");
const MedicationHistory = require("../models/medicationHistoryModel");

const { sendEmail } = require("../config/nodemailerConfig");
const emailTemplateAdd = require("../mailTemplates/emailTemplateAdd")
const moment = require("moment-timezone");
// Add Medication
const addMedication = async (req, res) => {
  try {
    const { name, dosage, time, startDate, duration, reminderEnabled } = req.body;
    if (!name || !dosage || !time || !startDate || !duration) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
  }
 
   // Ensure time is an array, format each time properly in AM/PM
   const formattedTimes = Array.isArray(time)
   ? time.map(t => moment(t, ["h:mm A"]).tz("Asia/Kolkata").format("hh:mm A"))
   : [moment(time, ["h:mm A"]).tz("Asia/Kolkata").format("hh:mm A")];

    const newMedication = new Medication({
      userId: req.user.id,
      name,
      dosage,
      time: formattedTimes, // Store array of formatted times,
      startDate,
      duration,
      reminderEnabled,
    });

    await newMedication.save();

    // Send email after successfully adding medication
    const emailContent = emailTemplateAdd(
      name, 
      dosage, 
      // time, 
      formattedTimes.join(", "), // Convert array to string for email
      startDate, 
      duration, 
      reminderEnabled
    );

    await sendEmail(
      req.user.email, // Assuming user email is available in req.user.email
      "Medication Added Successfully",
      emailContent 
    );

   return res.status(201).json({ success: true, newMedication, message: "Medication added and email sent successfully" });
  } catch (error) {
   return res.status(500).json({success: false, message: "Server Error" });
  }
};


// Get User Medications
const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id }).sort({ createdAt: -1 });;
   return res.json({success: true, medications});
  } catch (error) {
   return res.status(500).json({success:false, error: "Server Error" });
  }
};

// // Update Medication
const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) return res.status(404).json({ error: "Medication not found" });

    Object.assign(medication, req.body);
    await medication.save();
    res.json({ message: "Medication updated successfully", medication });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
 
// Delete Medication
const deleteMedication = async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: "Medication deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
const logDailyProgress = async (req, res) => {
  const { medicationId, taken } = req.body; // Taken status sent by the user (True or False)

  try {
    // Find the medication for the user
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }

    // Create a new history log for the day
    const history = new MedicationHistory({
      userId: req.user._id, // Assuming user is authenticated and available
      medicationId: medication._id,
      taken: taken,
    });

    await history.save();

    res.status(200).json({
      message: `Progress for medication ${medication.name} logged successfully.`,
      history: history,
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging daily progress", details: error.message });
  }
};
const getDoseSchedule = async (req, res) => {
  try {
    // Find all medications for the logged-in user
    const medications = await Medication.find({ userId: req.user._id });

    // Calculate all scheduled doses for the medications
    const doses = medications.map(med => {
      return {
        name: med.name,  // Name of the medication
        doses: med.getScheduledDoses(),  // Get the scheduled doses using the helper method
      };
    });

    res.status(200).json({ doses });  // Return the doses in a calendar-friendly format
  } catch (error) {
    res.status(500).json({ error: "Error fetching dose schedule", details: error.message });
  }
};
 

const getMedicationById = async (req, res) => {
  console.log("🔍 Request Params:", req.params); // Debugging log
  console.log("🔍 Extracted ID:", req.params.id, "Type:", typeof req.params.id); // Check ID format

  let { id } = req.params;

  // Validate if ID is properly formatted
  if (!id || typeof id !== "string") {
    console.error("❌ Invalid Medication ID:", id);
    return res.status(400).json({ error: "Invalid Medication ID format." });
  }

  // Convert ID to string if it's an object
  if (typeof id === "object") {
    id = id.toString();
  }

 
  try {
    const medication = await Medication.findById(id);

    if (!medication) {
      return res.status(404).json({ error: "Medication not found." });
    }

    // Calculate taken & skipped days
    const totalDays = medication.duration || 0;
    const takenDays = Array.isArray(medication.takenHistory) ? medication.takenHistory.length : 0;
    const skippedDays = totalDays - takenDays;

    return res.status(200).json({
      ...medication.toObject(),
      takenDays,
      skippedDays,
      totalDays
    });
  } catch (error) {
    console.error("❌ Error fetching medication:", error.message);
    return res.status(500).json({ error: "Error fetching medication", details: error.message });
  }
};

 

// const markAsTaken = async (req, res) => {
//   const { medicationId } = req.params;
//   const { doseTime } = req.body; // Extract the time the user took the dose

//   try {
//     if (!doseTime) {
//       return res.status(400).json({ error: "Time is required to mark medication as taken." });
//     }

//     // Find the medication by ID
//     const medication = await Medication.findById(medicationId);

//     if (!medication) {
//       return res.status(404).json({ error: "Medication not found" });
//     }

//     const today = new Date();
//     const formattedToday = today.toISOString().split("T")[0]; // Format YYYY-MM-DD
//     const formattedTime = moment(doseTime, ["h:mm A"]).format("hh:mm A"); // Ensure correct format

//     // ✅ Check if today's date exists in takenHistory
//     const existingEntry = medication?.takenHistory.find(
//       (entry) => entry.date && entry.date.toISOString().split("T")[0] === formattedToday
//     );

//     if (existingEntry) {
//       // ✅ Check if this specific time has already been marked as taken today
//       if (existingEntry?.takenHistory?.includes(formattedTime)) {
//         return res.status(400).json({ error: `Dose at ${formattedTime} is already marked as taken today.` });
//       }
//       // ✅ Add new time entry for today
//       existingEntry.times.push(formattedTime);
//     } else {
//       // ✅ Create a new entry for today's date with the given time
//       medication.takenHistory.push({
//         date: today,
//         times: [formattedTime],
//       });
//     }

//     // Save the updated medication document
//     await medication.save();

//     // ✅ Recalculate takenDays and skippedDays
//     const takenDays = medication.takenHistory.length;
//     const skippedDays = medication.duration - takenDays;

//     res.status(200).json({
//       message: `Medication ${medication.name} marked as taken at ${formattedTime}.`,
//       medication: { ...medication._doc, takenDays, skippedDays },
//     });
//   } catch (error) {
//     console.error("❌ Error marking medication as taken:", error);
//     res.status(500).json({ error: "Error marking medication as taken", details: error.message });
//   }
// };
// **
// const markAsTaken = async (req, res) => {
//   const { medicationId } = req.params;
//   const { doseTime } = req.body;

//   try {
//     if (!doseTime) {
//       return res.status(400).json({ error: "Time is required to mark medication as taken." });
//     }

//     const medication = await Medication.findById(medicationId);
//     if (!medication) {
//       return res.status(404).json({ error: "Medication not found" });
//     }

//     const formattedToday = moment().format("YYYY-MM-DD"); // Ensure local date
//     const formattedTime = moment(doseTime, ["h:mm A"]).format("hh:mm A");

//     // ✅ Check if today's date exists in takenHistory
//     let existingEntry = medication.takenHistory.find(
//       (entry) => moment(entry.date).format("YYYY-MM-DD") === formattedToday
//     );

//     const totalDosesPerDay = Array.isArray(medication.time) ? medication.time.length : 1; // Prevent errors

//     if (existingEntry) {
//       if (existingEntry.times.includes(formattedTime)) {
//         return res.status(400).json({ error: `Dose at ${formattedTime} is already marked as taken today.` });
//       }
//       if (existingEntry.times.length >= totalDosesPerDay) {
//         return res.status(400).json({
//           error: `You cannot take more than ${totalDosesPerDay} doses today.`,
//         });
//       }
//       existingEntry.times.push(formattedTime);
//     } else {
//       medication.takenHistory.push({
//         date: new Date(), // Store full date
//         times: [formattedTime],
//       });
//     }

//     medication.markModified("takenHistory");
//     await medication.save();

//     // ✅ Ensure takenDays & skippedDays are properly recalculated
//     const takenDays = medication.takenHistory.length;
//     const skippedDays = Math.max(0, (medication.duration || 0) - takenDays);

//     res.status(200).json({
//       message: `Medication ${medication.name} marked as taken at ${formattedTime}.`,
//       medication: { ...medication._doc, takenDays, skippedDays },
//     });
//   } catch (error) {
//     console.error("❌ Error marking medication as taken:", error);
//     res.status(500).json({ error: "Error marking medication as taken", details: error.message });
//   }
// };
// ***


const markAsTaken = async (req, res) => {
  const { medicationId } = req.params;
  const { doseTime } = req.body;

  try {
    if (!doseTime) {
      return res.status(400).json({ error: "Time is required to mark medication as taken." });
    }

    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }

    // const formattedToday = moment().format("DD-MM-YYYY"); // Ensure local date
    const formattedToday = moment().tz("Asia/Kolkata").format("DD-MM-YYYY"); // Use Indian timezone

    const formattedTime = moment(doseTime, ["h:mm A"]).tz("Asia/Kolkata").format("hh:mm A");

    const currentTime = moment().tz("Asia/Kolkata");
   const scheduledTime = moment(`${formattedToday} ${formattedTime}`, "DD-MM-YYYY hh:mm A", "Asia/Kolkata");
  //  console.log("✅ Received doseTime:", doseTime);
  //  console.log("✅ Converted to IST formattedTime:", formattedTime);
  //  console.log("✅ Current Server Time(IST):", currentTime.format("DD-MM-YYYY hh:mm A"));
  //  console.log("✅ Scheduled Dose Time(IST):", scheduledTime.format("DD-MM-YYYY hh:mm A"));
  //  console.log("✅ Time Difference (minutes):", currentTime.diff(scheduledTime, "minutes"));
   
    // ✅ Prevent marking before time
    if (currentTime.isBefore(scheduledTime)) {
      return res.status(400).json({ error: `You cannot mark this dose before ${formattedTime}.` });
    }
    // if (currentTime.diff(scheduledTime, "minutes") < 0) {
    //   return res.status(400).json({ error: `You cannot mark this dose before ${formattedTime}.` });
    // }

    // ✅ Check if today's date exists in takenHistory
    let existingEntry = medication.takenHistory.find(
      (entry) => moment(entry.date).format("DD-MM-YYYY") === formattedToday
    );

    const totalDosesPerDay = Array.isArray(medication.time) ? medication.time.length : 1; // Prevent errors

    if (existingEntry) {
      if (existingEntry.times.includes(formattedTime)) {
        return res.status(400).json({ error: `Dose at ${formattedTime} is already marked as taken today.` });
      }
      if (existingEntry.times.length >= totalDosesPerDay) {
        return res.status(400).json({
          error: `You cannot take more than ${totalDosesPerDay} doses today.`,
        });
      }
      existingEntry.times.push(formattedTime);
    } else {
      medication.takenHistory.push({
        date: new Date(), // Store full date
        times: [formattedTime],
      });
    }

    medication.markModified("takenHistory");
    await medication.save();

    // ✅ Ensure takenDays & skippedDays are properly recalculated
    const takenDays = medication.takenHistory.length;
    const skippedDays = Math.max(0, (medication.duration || 0) - takenDays);

    res.status(200).json({
      message: `Medication ${medication.name} marked as taken at ${formattedTime}.`,
      medication: { ...medication._doc, takenDays, skippedDays },
    });
  } catch (error) {
    console.error("❌ Error marking medication as taken:", error);
    res.status(500).json({ error: "Error marking medication as taken", details: error.message });
  }
};

module.exports = {markAsTaken,getMedicationById ,logDailyProgress, getDoseSchedule,addMedication, getMedications, updateMedication, deleteMedication };
