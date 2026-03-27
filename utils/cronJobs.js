import cron from "node-cron";
import moment from "moment-timezone";
import medicationModel from "../models/medicationModel";

cron.schedule("0 0 * * *", async () => {
  try {
    const today = moment().tz("Asia/Kolkata").startOf("day").toDate();
    
    const result = await medicationModel.deleteMany({ expiryDate: { $lt: today } });

    console.log(`Deleted ${result.deletedCount} expired medications.`);
  } catch (error) {
    console.error("Error deleting expired medications:", error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

module.exports = {};
