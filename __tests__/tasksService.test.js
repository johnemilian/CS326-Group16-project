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

const { listTasks, createTask, updateTask, deleteTask, togglePriority } =
  await import("../services/tasksService.js");
const { getAll, findById, updateById, removeById } =
  await import("../repositories/tasksRepository.js");

describe("listTasks", () => {
  test("listTasks returns all tasks", async () => {
    getAll.mockResolvedValueOnce([
      {
        _id: "fake-id",
        title: "T",
        description: "D",
        assignee: "AS",
        assigner: "AR",
        station: "S",
        prerequisites: "PR",
        priority: "PT",
        deadline: new Date("2026-11-22"),
      },
    ]);

    const result = await listTasks();

    expect(result[0]).toEqual({
      id: "fake-id",
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: "2026-11-22",
    });
  });

  test("listTasks returns an empty array when there are no tasks", async () => {
    getAll.mockResolvedValueOnce([]);

    const result = await listTasks();

    expect(result).toEqual([]);
  });
});

describe("createTask", () => {
  test("createTask rejects a missing title", async () => {
    const result = await createTask({});

    expect(result.ok).toBe(false);
  });

  test("createTask rejects an empty title", async () => {
    const result = await createTask({ title: "   " });

    expect(result.ok).toBe(false);
  });

  test("createTask rejects a title that is not a string", async () => {
    const result = await createTask({ title: 123 });

    expect(result.ok).toBe(false);
  });

  test("createTask accepts a title of 60 characters", async () => {
    const result = await createTask({ title: "a".repeat(60) });

    expect(result.ok).toBe(true);
  });

  test("createTask rejects a title longer than 60 characters", async () => {
    const result = await createTask({ title: "a".repeat(61) });

    expect(result.ok).toBe(false);
  });

  test("createTask accepts null optional text fields", async () => {
    const result = await createTask({
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      description: null,
    });

    expect(result.ok).toBe(true);
  });

  test("createTask rejects optional text fields that are not strings", async () => {
    const result = await createTask({
      title: "T",
      description: 123,
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
    });

    expect(result.ok).toBe(false);
  });

  test("createTask rejects an invalid deadline", async () => {
    const result = await createTask({
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
      priority: "PT",
      deadline: "not-a-date",
    });

    expect(result.ok).toBe(false);
  });

  test("createTask saves a valid task and returns its DTO", async () => {
    const result = await createTask({
      title: "T",
      description: "D",
      assignee: "AS",
      assigner: "AR",
      station: "S",
      prerequisites: "PR",
    });

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
  });
});

describe("updateTask", () => {
  test("updateTask returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await updateTask("000000000000000000000000", {
      title: "new",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
  });

  test("updateTask rejects invalid task data", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      title: "old",
    });

    const result = await updateTask("fake-id", {
      title: "",
    });

    expect(result.ok).toBe(false);
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
    });

    const result = await updateTask("fake-id", {
      title: "new",
    });

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
  });
});

describe("deleteTask", () => {
  test("deleteTask returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await deleteTask("000000000000000000000000");

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
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
    });

    removeById.mockResolvedValueOnce(undefined);

    const result = await deleteTask("fake-id");

    expect(result.ok).toBe(true);
    expect(result.value).toBeNull();
  });
});

describe("togglePriority", () => {
  test("togglePriority returns a 404-shaped Err when the task does not exist", async () => {
    findById.mockResolvedValueOnce(null);

    const result = await togglePriority("000000000000000000000000");

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(404);
  });

  test("togglePriority changes priority from false to true", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: false,
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: true,
    });

    const result = await togglePriority("fake-id");

    expect(result.ok).toBe(true);
    expect(result.value.priority).toBe(true);
  });

  test("togglePriority changes priority from true to false", async () => {
    findById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: true,
    });

    updateById.mockResolvedValueOnce({
      _id: "fake-id",
      priority: false,
    });

    const result = await togglePriority("fake-id");

    expect(result.ok).toBe(true);
    expect(result.value.priority).toBe(false);
  });
});
