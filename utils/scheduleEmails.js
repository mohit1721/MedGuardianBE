
const cron = require("node-cron");
const Medication = require("../models/medicationModel");
const User = require("../models/userModel");
const { sendEmail } = require("../config/nodemailerConfig");
const moment = require("moment");  // Import moment for consistent time formatting
const remainderTemplate = require("../mailTemplates/reminderTemplate");  // Import the reminder email template

// Function to schedule medication reminder emails
const scheduleEmails = () => {
  cron.schedule("* * * * *", async () => { // Runs every minute
    // console.log("🔔 Checking for medication reminders...");

    try {
      // Get current time in 'hh:mm A' format (12-hour with AM/PM)
      const currentTime = moment().format("hh:mm A"); 
      // console.log(`Current Time: ${currentTime}`);  // Log the current time for comparison

      // Find medications with reminders enabled
      const medications = await Medication.find({ reminderEnabled: true });
      // console.log(`Medications found: ${medications.length}`); // Log the number of medications found

      for (const med of medications) {
        // console.log(`Checking medication: ${med.name} for reminder time`);
        // console.log(`Medication Times: ${med.time}`);
// 
        // // Log each medication time for raw comparison
        // med.time.forEach((medTime, index) => {
        //   console.log(`Comparing current time with scheduled time: ${medTime}`);
        // });

        // Check if the current time matches any of the scheduled times for the medication
        if (med.time.some(time => time.trim() === currentTime)) { // Trim spaces if any
          console.log(`Time match found for medication: ${med.name}`);  // Log if the time matches

          const user = await User.findById(med.userId);
          if (!user) {
            console.log(`⚠️ User not found for medication: ${med.name}`);
            continue;
          }
// Generate the reminder email content using the template
const reminderLink = `${process.env.BASE_URL}/dashboard`;
         
          // Generate the reminder email content using the template
          const emailContent = remainderTemplate(
            user.name,               // userName
            med.name,                // medicationName
            med.dosage,              // dosage
            currentTime,             // medicationTime
            reminderLink // reminderLink (can be dynamic if needed)
          );

          // Send reminder email using the template-generated HTML
          await sendEmail(
            user.email,
            `Reminder: Take your medication ${med.name}`,
            emailContent // Use the HTML content from the template
          );

          console.log(`📩 Reminder email sent to ${user.email} for medication ${med.name}`);
        } else {
          // console.log(`No time match for medication: ${med.name}`);
        }
      }
    } catch (error) {
      console.error("❌ Error in medication reminder scheduler:", error);
    }
  });
};

module.exports = scheduleEmails;
