const cron = require("node-cron");
const Medication = require("./models/Medication");
const nodemailer = require("nodemailer");
const User = require("./models/userModel");

// Configure email transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Function to check and send reminders
const sendReminders = async () => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Convert time to "HH:MM AM/PM" format
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Find medications that match the current time
    const medications = await Medication.find({ time: formattedTime, reminderEnabled: true });

    for (const med of medications) {
      const user = await User.findById(med.userId);
      if (!user || !user.email) continue;

      // Send email reminder
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Medicine Reminder",
        text: `Hello ${user.name},\n\nIt's time to take your medicine: ${med.name} (${med.dosage}).\n\nStay healthy!\n\n- Your Health Assistant`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log(`Reminder sent to ${user.email}: ${info.response}`);
        }
      });
    }
  } catch (error) {
    console.error("Error in reminder service:", error);
  }
};

// Schedule the cron job to run every minute
cron.schedule("* * * * *", sendReminders);

console.log("Reminder service started...");
