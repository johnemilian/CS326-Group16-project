// repositories/usersRepository.js

import mongoose from "mongoose";
import User from "../models/userModel.js";

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
export const findById = async (id) => User.findById(id).lean();
export const findByUsername = async (username) => User.findOne({ username: username.toLowerCase() }).lean();
export const findByEmail = async (email) => User.findOne({ email: email.toLowerCase() }).lean();
export const create = async (data) => (await User.create(data)).toObject();
export const setRole = async (username, role) =>
  User.findOneAndUpdate(
    { username: username.toLowerCase() },
    { role },
    { returnDocument: "after", runValidators: true },
  ).lean();
