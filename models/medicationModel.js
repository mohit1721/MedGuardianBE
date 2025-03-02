
const mongoose = require("mongoose");
const moment = require("moment");

const medicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  time: { type: [String], required: true }, // Scheduled times per day (e.g., ["07:50 AM", "08:30 PM"])
  startDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // Duration in days
  expiryDate: { type: Date }, // Auto-calculate expiry date

  reminderEnabled: { type: Boolean, default: true },
  takenHistory: [
    {
      date: { type: Date, required: true }, // Stores date
      times: { type: [String] }, // Stores multiple times taken on a given date
    },
  ],
  
});
// Auto-set expiry date before saving
medicationSchema.pre("save", function (next) {
  this.expiryDate = new Date(this.startDate);
  this.expiryDate.setDate(this.expiryDate.getDate() + this.duration);
  next();
});
// Indexing for efficient sorting by creation time ,
// { timestamps: true }
// medicationSchema.index({ createdAt: -1 });
// ✅ Get all scheduled doses for a medication
medicationSchema.methods.getScheduledDoses = function () {
  const doses = [];
  const startDate = moment(this.startDate);

  for (let i = 0; i < this.duration; i++) {
    const doseDate = startDate.clone().add(i, "days").format("DD-MM-YYYY");
    doses.push({ date: doseDate, times: this.time }); // Store date with times
  }
  return doses;
};

// ✅ Calculate taken and skipped days properly
medicationSchema.methods.calculateTakenAndSkippedDays = function () {
  const scheduledDoses = this.getScheduledDoses();
  let takenDays = 0;
  let skippedDays = 0;

  scheduledDoses.forEach(({ date, times }) => {
    const dosesTakenForDay = this.takenHistory.filter(
      (entry) => moment(entry.date).format("DD-MM-YYYY") === date
    );

    const uniqueTimesTaken = new Set(dosesTakenForDay.map((entry) => entry.time));
    if (uniqueTimesTaken.size === times.length) {
      // All scheduled doses were taken -> Count as a full taken day
      takenDays++;
    } else {
      skippedDays++;
    }
  });

  return { takenDays, skippedDays };
};

module.exports = mongoose.model("Medication", medicationSchema);
