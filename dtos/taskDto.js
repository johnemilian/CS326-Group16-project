export const toTaskDto = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  station: task.station,
  assigner: task.assigner,
  assignee: task.assignee,
  priority: task.priority,
  deadline: task.deadline ? task.deadline.toISOString().slice(0, 10) : null,
  prerequisites: task.prerequisites,
});

// For the page only, never for a JSON answer: the task plus whether the
// person looking at it may change it, so task.ejs shows Edit and Delete only
// to them. ownerId itself still never leaves the server.
export const toTaskView = (task, isOwnerOrMgr, isMgr) => ({ ...toTaskDto(task), isOwnerOrMgr, isMgr });
