// Changes an existing user's role. This is the only way to make a manager or
// an admin: signup always creates a farmer.
//
//   npm run set-role -- <username> <farmer|manager|admin>
import "dotenv/config";
import mongoose from "mongoose";
import { ROLES } from "../models/userModel.js";
import * as usersRepository from "../repositories/usersRepository.js";

const [username, role] = process.argv.slice(2);
if (!username || !ROLES.includes(role)) {
  console.error(`Usage: npm run set-role -- <username> <${ROLES.join("|")}>`);
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI must be set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const user = await usersRepository.setRole(username, role);
  if (!user) {
    console.error(`No user named "${username}". They need to sign up first.`);
    process.exitCode = 1;
  } else {
    console.log(`${user.username} is now ${user.role}.`);
  }
} finally {
  await mongoose.disconnect();
}
