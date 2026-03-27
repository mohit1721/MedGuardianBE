const cron = require("node-cron");
const Medication = require("../models/medicationModel");
const moment = require("moment-timezone");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = moment().tz("Asia/Kolkata").startOf("day").toDate();
    
    const result = await Medication.deleteMany({ expiryDate: { $lt: today } });

    console.log(`Deleted ${result.deletedCount} expired medications.`);
  } catch (error) {
    console.error("Error deleting expired medications:", error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

module.exports = {};
