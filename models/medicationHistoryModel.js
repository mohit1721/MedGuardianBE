const mongoose = require("mongoose");

const medicationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Medication", required: true },
  taken: { type: Boolean, default: false }, // Whether the user took the medication on that day
  date: { type: Date, default: Date.now }, // Date for the log entry (automatically set to the current date)
});

module.exports = mongoose.model("MedicationHistory", medicationHistorySchema);
