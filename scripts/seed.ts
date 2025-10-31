/**
 * Database Seed Script
 * 
 * Run this script to populate the database with initial data:
 * npx ts-node scripts/seed.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Import models
import Bus from "@/models/Bus";
import Route from "@/models/Route";
import Trip from "@/models/Trip";
import User from "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Trip.deleteMany({});
    
    // Don't delete users - keep them
    console.log("✅ Cleared old data");

    // Create Buses
    console.log("🚌 Creating buses...");
    const buses = await Bus.create([
      {
        busNumber: "GR-001",
        busName: "Green Express 1",
        type: "AC",
        totalSeats: 61,
        amenities: ["WiFi", "Charging Port", "Water Bottle", "Emergency Exit", "Reading Light"],
        status: "active",
        registrationNumber: "JH01-GR-0001",
      },
      {
        busNumber: "GR-002",
        busName: "Green Express 2",
        type: "AC",
        totalSeats: 61,
        amenities: ["WiFi", "Charging Port", "Water Bottle", "Emergency Exit", "Reading Light"],
        status: "active",
        registrationNumber: "JH01-GR-0002",
      },
      {
        busNumber: "GR-003",
        busName: "Green Express 3",
        type: "AC",
        totalSeats: 61,
        amenities: ["WiFi", "Charging Port", "Water Bottle", "Emergency Exit"],
        status: "active",
        registrationNumber: "JH01-GR-0003",
      },
      {
        busNumber: "GR-004",
        busName: "Green Express 4",
        type: "AC",
        totalSeats: 61,
        amenities: ["WiFi", "Charging Port", "Water Bottle", "Emergency Exit"],
        status: "active",
        registrationNumber: "JH01-GR-0004",
      },
    ]);
    console.log(`✅ Created ${buses.length} buses`);

    // Create Routes
    console.log("🛣️  Creating routes...");
    const routes = await Route.create([
      {
        name: "Jhumri Telaiya to Ranchi",
        from: "Jhumri Telaiya",
        to: "Ranchi",
        distance: 150,
        stops: ["Jhumri Telaiya", "Barhi", "Hazaribagh", "Ramgarh", "Ranchi"],
        estimatedDuration: 3,
        baseFare: 300,
        status: "active",
      },
      {
        name: "Ranchi to Jhumri Telaiya",
        from: "Ranchi",
        to: "Jhumri Telaiya",
        distance: 150,
        stops: ["Ranchi", "Ramgarh", "Hazaribagh", "Barhi", "Jhumri Telaiya"],
        estimatedDuration: 3,
        baseFare: 300,
        status: "active",
      },
    ]);
    console.log(`✅ Created ${routes.length} routes`);

    // Create Trips for next 7 days
    console.log("📅 Creating trips...");
    const trips = [];
    const timings = [
      { startTime: "07:00", endTime: "10:00" },
      { startTime: "11:00", endTime: "14:00" },
      { startTime: "15:00", endTime: "18:00" },
      { startTime: "19:00", endTime: "22:00" },
    ];

    // Generate trips for next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      // Create trips for each route and timing
      for (const route of routes) {
        for (let i = 0; i < timings.length; i++) {
          const timing = timings[i];
          const bus = buses[i % buses.length];

          // Generate available seats (1-61)
          const availableSeats = Array.from({ length: 61 }, (_, i) =>
            (i + 1).toString()
          );

          trips.push({
            routeId: route._id,
            busId: bus._id,
            date: date,
            startTime: timing.startTime,
            endTime: timing.endTime,
            fare: route.baseFare,
            availableSeats: availableSeats,
            bookedSeats: [],
            status: "scheduled",
          });
        }
      }
    }

    await Trip.create(trips);
    console.log(`✅ Created ${trips.length} trips`);

    // Create admin user if doesn't exist
    console.log("👤 Checking admin user...");
    const adminPhone = "9142108321";
    const adminExists = await User.findOne({ phone: adminPhone });
    if (!adminExists) {
      await User.create({
        phone: adminPhone,
        name: "Admin",
        email: "admin@greenride-express.com",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Created admin user");
      console.log("📱 Phone: 9142108321");
      console.log("🔑 OTP: 123456 (development mode)");
      console.log("📧 Email: admin@greenride-express.com");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Buses: ${buses.length}`);
    console.log(`   Routes: ${routes.length}`);
    console.log(`   Trips: ${trips.length}`);
    console.log("\n🚀 You can now start the development server!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();

