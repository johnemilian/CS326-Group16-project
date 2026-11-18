import { Ok, Err } from "../result.js";
import { getAll, findById, create, updateById, removeById } from "../repositories/tasksRepository.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toTaskDto } from "../dtos/taskDto.js";

const isOwnerOrMgr = async (entry, actorId) => {
  if (entry.ownerId.toString() === actorId) return true;
  const account = await usersRepository.findById(actorId);
  return ["admin", "manager"].includes(account?.role);
};
const isMgr = async (entry, actorId) => {
  const account = await usersRepository.findById(actorId);
  return ["admin", "manager"].includes(account?.role);
};

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

export const createTask = async (data, actor) => {
  const result = validateTask(data);
  if (!result.ok) return result;
  return Ok(toTaskDto(await create({ ...result.value, ownerId: actor.id })));
};

export const getTaskForEdit = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  if (!(await isOwnerOrMgr(existing, actor.id))) {
    return Err({ status: 403, message: "You do not have permission to modify this task." });
  }
  return Ok(toTaskDto(existing));
};

export const updateTask = async (id, data, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Task not found" });
  if (!(await isOwnerOrMgr(existing, actor.id))) {
    return Err({ status: 403, message: "You do not have permission to modify this task." });
  }

  const result = validateTask(data);
  if (!result.ok) return result;
  return Ok(toTaskDto(await updateById(id, result.value)));
};

export const deleteTask = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Task not found" });
  if (!(await isOwnerOrMgr(existing, actor.id))) {
    return Err({ status: 403, message: "No, you are not authorized to delete this task." });
  }
  await removeById(id);
  return Ok(null);
};

export const togglePriority = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Task not found" });
  if (!(await isMgr(existing, actor.id))) {
    return Err({ status: 403, message: "Must be manager to toggle priority of this task." });
  }
  const updated = await updateById(id, { priority: !existing.priority });
  return Ok(toTaskDto(updated));
};
