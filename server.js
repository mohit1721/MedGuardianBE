
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const scheduleEmails = require("./utils/scheduleEmails");
const userRoutes = require("./routes/userRoutes");
const medicationRoutes = require("./routes/medicationRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());
// process.env.TZ = "Asia/Kolkata";  // 🔥 Server ka global timezone fix
// console.log("✅ Server Timezone Set to IST:", new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

app.use("/api/auth", userRoutes);
app.use("/api/medications", medicationRoutes);
// Start the reminder service (cron job)
scheduleEmails(); // This starts the cron job to check for reminders every minute

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
