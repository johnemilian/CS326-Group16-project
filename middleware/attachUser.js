import * as authService from "../services/authService.js";

// Looks up the logged-in user from the session and puts them on req.user
// (for controllers and middleware) and res.locals.user (for every view).
// Both are null when nobody is logged in. The role always comes from the
// database, never from the cookie, so a role change takes effect on the next request.
export const attachUser = async (req, res, next) => {
  const user = req.session.userId ? await authService.findUser(req.session.userId) : null;
  // The account was deleted while the session was still alive.
  if (req.session.userId && !user) delete req.session.userId;
  req.user = user;
  res.locals.user = user;
  next();
};
