import mongoose from "mongoose";

// The roles a user can have. Signup always creates a "farmer"; the only way
// to get another role is the set-role script (see README), so nobody can
// promote themselves through a form.
export const ROLES = ["farmer", "manager", "admin"];

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    // Optional. sparse lets many users leave it out without tripping the unique index.
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "farmer" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
