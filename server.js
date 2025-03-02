
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const scheduleEmails = require("./utils/scheduleEmails");
const userRoutes = require("./routes/userRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
 const cronJobs = require("./utils/cronJobs") //The moment cronJobs.js is imported, the cron job automatically registers and runs on schedule.
dotenv.config();
connectDB();
const corsOptions = {
    origin: ["http://localhost:3000", "https://medguardian.vercel.app"], // ✅ Only allow these origins
    methods: "GET,POST,PUT,DELETE", // ✅ Allowed HTTP methods
    allowedHeaders: "Content-Type,Authorization", // ✅ Allowed headers
    credentials: true, // ✅ Allow cookies if needed
  };
  

  
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
// process.env.TZ = "Asia/Kolkata";  // 🔥 Server ka global timezone fix
// console.log("✅ Server Timezone Set to IST:", new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

app.use("/api/auth", userRoutes);
app.use("/api/medications", medicationRoutes);
// Start the reminder service (cron job)
scheduleEmails(); // This starts the cron job to check for reminders every minute

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
