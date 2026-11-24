// __tests__/tasksService.test.js

import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/tasksRepository.js", () => ({
  isValidId: jest.fn(() => true),
  getAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn((data) => ({
    _id: "fake-id",
    ...data,
    deadline: data.deadline ? new Date(data.deadline) : null,
  })),
  updateById: jest.fn(),
  removeById: jest.fn(),
}));

jest.unstable_mockModule("../repositories/usersRepository.js", () => ({
  findById: jest.fn(),
}));

const { listTasks, createTask, updateTask, deleteTask, togglePriority, toggleCompleted } =
  await import("../services/tasksService.js");
const { getAll, findById, updateById, removeById, create } = await import("../repositories/tasksRepository.js");
const usersRepository = await import("../repositories/usersRepository.js");

describe("listTasks", () => {
  test("listTasks returns all tasks", async () => {
    getAll.mockResolvedValueOnce([
      {
        _id: "fake-id",
        title: "T",
        description: "D",
        assignee: "AS",
        completed: false,
        status: "not started",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
        priority: "PT",
        deadline: new Date("2026-11-22"),
        ownerId: { toString: () => "alice-id" },
      },
    ]);
    usersRepository.findById.mockResolvedValueOnce({ role: "farmer" });

    const result = await listTasks({ id: "cranjis-id" });

    expect(usersRepository.findById).toHaveBeenCalledWith("cranjis-id");
    expect(result[0]).toEqual({
      id: "fake-id",
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      completed: false,
      status: "not started",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: "2026-11-22",
      isOwner: false,
      isMgr: false,
    });
    expect(getAll).toHaveBeenCalled();
  });

  test("listTasks returns an empty array when there are no tasks", async () => {
    getAll.mockResolvedValueOnce([]);

    // no logged-in user
    const result = await listTasks();

    expect(result).toEqual([]);
    expect(getAll).toHaveBeenCalled();
  });
});

describe("createTask", () => {
  test("createTask rejects a missing title", async () => {
    const result = await createTask({}, { id: "cranjis-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("createTask rejects an empty title", async () => {
    const result = await createTask({ title: "   " }, { id: "travis-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("createTask rejects a title that is not a string", async () => {
    const result = await createTask({ title: 123 }, { id: "bob-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("createTask accepts a title of 60 characters", async () => {
    const result = await createTask({ title: "a".repeat(60) }, { id: "dominic-id" });

    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalled();
  });

  test("createTask rejects a title longer than 60 characters", async () => {
    const result = await createTask({ title: "a".repeat(61) }, { id: "beatrice-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("createTask accepts null optional text fields", async () => {
    const result = await createTask(
      {
        title: "T",
        description: "D",
        assignee: "AS",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
        priority: "PT",
        description: null,
      },
      { id: "cranjis-id" },
    );

    expect(result.ok).toBe(true);
    expect(create).toHaveBeenCalled();
  });

  test("createTask rejects optional text fields that are not strings", async () => {
    const result = await createTask(
      {
        title: "T",
        description: 123,
        assignee: "AS",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
        priority: "PT",
      },
      { id: "cranjis-id" },
    );

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("createTask rejects an invalid deadline", async () => {
    const result = await createTask(
      {
        title: "T",
        description: "D",
        assignee: "AS",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
        priority: "PT",
        deadline: "not-a-date",
      },
      { id: "cranjis-id" },
    );

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("createTask saves a valid task and returns its DTO", async () => {
    const result = await createTask(
      {
        title: "T",
        description: "D",
        assignee: "AS",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
      },
      { id: "cranjis-id" },
    );

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      id: "fake-id",
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      deadline: null,
    });
    expect(create).toHaveBeenCalled();
  });
});

describe("updateTask", () => {
  test("updateTask returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await updateTask(
      "000000000000000000000000",
      {
        title: "new",
      },
      { id: "cranjis-id" },
    );

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
    expect(findById).toHaveBeenCalled();
  });

  test("updateTask rejects invalid task data", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "old",
      ownerId: { toString: () => "cranjis-id" },
    });

    const result = await updateTask(
      "fake-id",
      {
        title: "",
      },
      { id: "cranjis-id" },
    );

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
    expect(findById).toHaveBeenCalled();
  });

  test("updateTask updates an existing task", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "old",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      ownerId: { toString: () => "austin-id" },
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "new",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: null,
      ownerId: { toString: () => "austin-id" },
    });

    const result = await updateTask(
      "fake-id",
      {
        title: "new",
      },
      { id: "austin-id" },
    );

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      id: "fake-id",
      title: "new",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: null,
    });
    expect(updateById).toHaveBeenCalledWith("fake-id", expect.objectContaining({ title: "new" }));
  });

  test("manager succeeds on updating another user's task", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "T",
      description: "D",
      completed: false,
      assignee: "old",
      status: "not started",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: null,
      ownerId: { toString: () => "alice-id" },
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "T",
      description: "D",
      completed: false,
      assignee: "new",
      status: "not started",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: null,
      ownerId: { toString: () => "alice-id" },
    });

    usersRepository.findById.mockResolvedValueOnce({ role: "manager" });

    const result = await updateTask(
      "fake-id",
      {
        title: "T",
        description: "D",
        completed: false,
        assignee: "new",
        status: "not started",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
        priority: "PT",
        deadline: null,
      },
      { id: "bob-id" },
    );

    expect(usersRepository.findById).toHaveBeenCalledWith("bob-id");
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      id: "fake-id",
      title: "T",
      description: "D",
      completed: false,
      status: "not started",
      assignee: "new",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: null,
    });
    expect(updateById).toHaveBeenCalledWith("fake-id", expect.objectContaining({ assignee: "new" }));
  });
});

describe("deleteTask", () => {
  test("deleteTask returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await deleteTask("000000000000000000000000", { id: "cranjis-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
    expect(findById).toHaveBeenCalled();
  });

  test("deleteTask removes an existing task", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: null,
      ownerId: { toString: () => "sally-id" },
    });

    removeById.mockResolvedValueOnce(undefined);

    const result = await deleteTask("fake-id", { id: "sally-id" });

    expect(result.ok).toBe(true);
    expect(result.value).toBeNull();
    expect(removeById).toHaveBeenCalledWith("fake-id");
  });
});

describe("togglePriority", () => {
  test("togglePriority returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await togglePriority("000000000000000000000000", { id: "cranjis-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
    expect(findById).toHaveBeenCalled();
  });

  test("togglePriority changes priority from false to true", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: false,
      ownerId: { toString: () => "rachel-id" },
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: true,
      ownerId: { toString: () => "rachel-id" },
    });

    usersRepository.findById.mockResolvedValueOnce({ role: "manager" });
    const result = await togglePriority("fake-id", { id: "rachel-id" });

    expect(result.ok).toBe(true);
    expect(result.value.priority).toBe(true);
    expect(updateById).toHaveBeenCalledWith("fake-id", { priority: true });
  });

  test("togglePriority changes priority from true to false", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: true,
      ownerId: { toString: () => "robin-id" },
    });

    usersRepository.findById.mockResolvedValueOnce({ role: "manager" });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: false,
    });

    const result = await togglePriority("fake-id", { id: "robin-id" });

    expect(result.ok).toBe(true);
    expect(result.value.priority).toBe(false);
    expect(updateById).toHaveBeenCalledWith("fake-id", { priority: false });
  });
});

describe("toggleCompleted", () => {
  test("toggleCompleted returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await toggleCompleted("000000000000000000000000", { id: "cranjis-id" });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
    expect(findById).toHaveBeenCalled();
  });

  test("toggleCompleted changes completed from false to true", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      completed: false,
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      completed: true,
    });

    const result = await toggleCompleted("fake-id", { id: "jaclyn-id" });

    expect(result.ok).toBe(true);
    expect(result.value.completed).toBe(true);
    expect(updateById).toHaveBeenCalledWith("fake-id", { completed: true });
  });

  test("toggleCompleted changes completed from true to false", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      completed: true,
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      completed: false,
    });

    const result = await toggleCompleted("fake-id", { id: "jaclyn-id" });

    expect(result.ok).toBe(true);
    expect(result.value.completed).toBe(false);
    expect(updateById).toHaveBeenCalledWith("fake-id", { completed: false });
  });
});
