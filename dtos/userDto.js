// What the rest of the app sees of a user. passwordHash never leaves the
// repository and service layers.
export const toUserDto = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
});
