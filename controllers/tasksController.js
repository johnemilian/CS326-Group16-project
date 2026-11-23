// controllers/tasksController.js

import * as tasksService from "../services/tasksService.js";
import { isValidId } from "../repositories/tasksRepository.js";

export const viewView = async (req, res) => {
  const tasks = await tasksService.listTasks(req.user);
  res.set("X-Total-Count", tasks.length);
  res.status(200).render("viewTasks", { title: "C.A. Farm Tasks", tasks });
};
export const manageView = async (req, res) => {
  const tasks = await tasksService.listTasks(req.user);
  res.set("X-Total-Count", tasks.length);
  res.status(200).render("manageTasks", { title: "Manage Tasks", tasks });
};

// htmx marks its requests with an HX-Request header. Those get an HTML
// fragment (one task card) to swap into the page; anything else gets JSON.
export const create = async (req, res) => {
  const fromHtmx = req.get("HX-Request") === "true";
  const result = await tasksService.createTask(req.body, req.user);
  if (!result.ok) {
    if (fromHtmx) {
      res.status(result.error.status).type("text/plain").send(result.error.message);
    } else {
      res.status(result.error.status).json({ error: result.error.message });
    }
    return;
  }
  if (fromHtmx) {
    res.status(201).render("partials/manageTask", { task: result.value });
    return;
  }
  res.status(201).json(result.value);
};

export const update = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await tasksService.updateTask(id, req.body, req.user);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(200).json(result.value);
};

export const destroy = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await tasksService.deleteTask(id, req.user);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(204).send();
};

export const togglePriority = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await tasksService.togglePriority(id, req.user);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(200).json(result.value);
};

export const toggleCompleted = async (req, res) => {
  const fromHtmx = req.get("HX-Request") === "true";
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await tasksService.toggleCompleted(id);
  if (!result.ok) {
    if (fromHtmx) {
      res.status(result.error.status).render("partials/viewTask", { task: result.value });
      return;
    }
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  if (fromHtmx) {
    res.status(200).render("partials/viewTask", { task: result.value });
    return;
  }
  res.status(200).json(result.value);
};
