import cron from "node-cron";
import Medication from "../models/medicationModel";
import moment from "moment-timezone";

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
