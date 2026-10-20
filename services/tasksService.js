import { Ok, Err } from "../result.js";
import { getAll, findById, create, updateById, removeById } from "../repositories/tasksRepository.js";
import { toTaskDto } from "../dtos/taskDto.js";

const textFields = ["description", "station", "assigner", "assignee", "prerequisites"];

const validateTask = (data) => {
  const { title, deadline } = data;
  if (!title) return Err({ status: 400, message: "title is required" });
  if (typeof title !== "string") return Err({ status: 400, message: "title must be text" });
  if (!title.trim())
    return Err({
      status: 400,
      message: "Title must contain non-whitespace characters.",
    });
  if (title.length > 60)
    return Err({
      status: 400,
      message: "Title at most 60 characters, please.",
    });
  for (const field of textFields) {
    if (data[field] != null && typeof data[field] !== "string")
      return Err({ status: 400, message: `${field} must be text` });
  }
  if (deadline && Number.isNaN(new Date(deadline).getTime()))
    return Err({ status: 400, message: "deadline must be a valid date" });

  const task = { title, deadline: deadline ? new Date(deadline) : null };
  for (const field of textFields) task[field] = data[field];
  return Ok(task);
};

export const listTasks = async () => (await getAll()).map(toTaskDto);

export const createTask = async (data) => {
  const result = validateTask(data);
  if (!result.ok) return result;
  return Ok(toTaskDto(await create(result.value)));
};

export const updateTask = async (id, data) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Task not found" });

  const result = validateTask(data);
  if (!result.ok) return result;
  return Ok(toTaskDto(await updateById(id, result.value)));
};

export const deleteTask = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Task not found" });
  await removeById(id);
  return Ok(null);
};

export const togglePriority = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Task not found" });
  const updated = await updateById(id, { priority: !existing.priority });
  return Ok(toTaskDto(updated));
};
