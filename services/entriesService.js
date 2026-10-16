import { Ok, Err } from "../result.js";
import { getAll, findById, create, updateById, removeById } from "../repositories/entriesRepository.js";
import { toEntryDto } from "../dtos/entryDto.js";

const validateEntry = ({ title, body }) => {
  if (!title || !body) return Err({ status: 400, message: "title and body are required" });
  if (!title.trim() || !body.trim())
    return Err({ status: 400, message: "Title and body must contain non-whitespace characters." });
  if (title.length > 60) return Err({ status: 400, message: "Title at most 60 characters, please." });
  return Ok({ title, body });
};

export const listEntries = async () => (await getAll()).map(toEntryDto);

export const createEntry = async (data) => {
  const result = validateEntry(data);
  if (!result.ok) return result;
  return Ok(toEntryDto(await create(result.value)));
};

export const updateEntry = async (id, data) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });

  const result = validateEntry(data);
  if (!result.ok) return result;
  return Ok(toEntryDto(await updateById(id, result.value)));
};

export const deleteEntry = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  await removeById(id);
  return Ok(null);
};

export const toggleFavorite = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  const updated = await updateById(id, { favorite: !existing.favorite });
  return Ok(toEntryDto(updated));
};
