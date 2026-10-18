import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAll = async () => Task.find().lean();

export const findById = async (id) => Task.findById(id).lean();

export const create = async (data) => (await Task.create(data)).toObject();

export const updateById = async (id, data) =>
  Task.findByIdAndUpdate(id, data, { new: true }).lean();

export const removeById = async (id) => {
  await Task.findByIdAndDelete(id);
};
