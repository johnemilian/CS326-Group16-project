// dtos/taskDto.js

export const toTaskDto = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  status: task.status,
  completed: task.completed,
  station: task.station,
  assigner: task.assigner,
  assignee: task.assignee,
  priority: task.priority,
  deadline: task.deadline ? task.deadline.toISOString().slice(0, 10) : null,
  prerequisites: task.prerequisites,
});
