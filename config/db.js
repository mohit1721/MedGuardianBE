const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const directUri = process.env.MONGO_URI_DIRECT;

  if (!primaryUri && !directUri) {
    console.error("❌ MongoDB Connection Error: MONGO_URI (or MONGO_URI_DIRECT) is not configured.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(primaryUri || directUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const srvLookupFailed =
      (error && typeof error.message === "string" && error.message.includes("querySrv")) ||
      (error && error.code === "ECONNREFUSED");

    if (srvLookupFailed && directUri && primaryUri) {
      try {
        console.warn("⚠️ SRV lookup failed for MONGO_URI. Retrying with MONGO_URI_DIRECT...");
        const conn = await mongoose.connect(directUri);
        console.log(`✅ MongoDB Connected (direct URI): ${conn.connection.host}`);
        return;
      } catch (directError) {
        console.error("❌ MongoDB Connection Error (direct URI):", directError.message);
        process.exit(1);
      }
    }

    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
