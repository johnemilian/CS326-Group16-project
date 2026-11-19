import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: false, unique: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ["farmer", "manager", "admin"], default: "farmer" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
