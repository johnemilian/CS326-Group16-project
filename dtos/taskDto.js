export const toTaskDto = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  priority: task.priority,
});
