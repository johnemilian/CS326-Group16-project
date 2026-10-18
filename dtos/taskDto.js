export const toTaskDto = (task) => ({
  id: task._id.toString(),
  title: task.title,
  body: task.body,
  favorite: task.favorite,
});
