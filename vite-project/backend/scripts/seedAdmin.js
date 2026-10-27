import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL;

async function seedAdmin() {
  if (!mongoUri) {
    throw new Error(
      "MongoDB URI is missing from backend/.env"
    );
  }

  const name = process.env.INITIAL_ADMIN_NAME;
  const username =
    process.env.INITIAL_ADMIN_USERNAME?.trim().toLowerCase();
  const email =
    process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!name || !username || !email || !password) {
    throw new Error(
      "Please configure all INITIAL_ADMIN variables in .env"
    );
  }

  if (password.length < 8) {
    throw new Error(
      "Initial admin password must contain at least 8 characters"
    );
  }

  try {
    await mongoose.connect(mongoUri);

    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      console.log(
        "An admin with this username or email already exists."
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await Admin.create({
      name,
      username,
      email,
      passwordHash,
    });

    console.log("Initial admin created successfully.");
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log("Password saved as a hash.");
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin().catch((error) => {
  console.error("Could not create initial admin:", error.message);
  process.exitCode = 1;
});