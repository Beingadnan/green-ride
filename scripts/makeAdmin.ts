import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// User Schema
const UserSchema = new mongoose.Schema({
  phoneE164: String,
  phone: String,
  country: String,
  name: String,
  email: String,
  role: String,
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function makeAdmin(phoneNumber: string) {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected to MongoDB");

    // Format phone to E.164 (add +91 if not present)
    let phoneE164 = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      phoneE164 = `+91${phoneNumber.replace(/\D/g, "")}`;
    }

    console.log(`🔍 Looking for user with phone: ${phoneE164}`);

    // Find user by phone
    const user = await User.findOne({ phoneE164 });

    if (!user) {
      console.log("❌ User not found. Please login first to create your account.");
      console.log("📱 After logging in, run this script again.");
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name || "No name"} (${user.phoneE164})`);
    console.log(`📋 Current role: ${user.role}`);

    if (user.role === "admin") {
      console.log("✅ User is already an admin!");
      process.exit(0);
    }

    // Update to admin
    user.role = "admin";
    await user.save();

    console.log("🎉 SUCCESS! User promoted to admin.");
    console.log("🔐 You can now access /admin/dashboard");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Get phone number from command line arguments
const phoneArg = process.argv[2];

if (!phoneArg) {
  console.log("❌ Please provide a phone number");
  console.log("Usage: npm run make-admin 9142108321");
  process.exit(1);
}

makeAdmin(phoneArg);

