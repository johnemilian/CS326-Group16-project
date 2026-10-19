import { Ok, Err } from "../result.js";
import { getAll, findById, create, updateById, removeById } from "../repositories/tasksRepository.js";
import { toTaskDto } from "../dtos/taskDto.js";

const validateTask = ({ title, description }) => {
  if (!title) return Err({ status: 400, message: "title is required" });
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
  return Ok({ title, description });
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
