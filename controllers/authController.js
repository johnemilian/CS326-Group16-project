// controllers/authController.js

import * as authService from "../services/authService.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// express-session's methods take callbacks; these wrap them so the handlers can await.
const regenerate = (req) =>
  new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
const save = (req) => new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
const destroy = (req) =>
  new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));

// A fresh session id on every login, so an id someone saw before login
// (session fixation) is useless afterwards.
const startSession = async (req, user, rememberMe) => {
  await regenerate(req);
  req.session.userId = user.id;
  // Without "remember me" the cookie has no expiry and goes away when the browser closes.
  if (rememberMe) req.session.cookie.maxAge = THIRTY_DAYS_MS;
  await save(req);
};

export const showLogin = (req, res) => {
  if (req.user) return res.redirect("/tasks");
  res.render("login", { title: "Log in", error: null, username: "" });
};

export const login = async (req, res) => {
  const body = req.body ?? {};
  const result = await authService.login(body);
  if (!result.ok) {
    res.status(result.error.status).render("login", {
      title: "Log in",
      error: result.error.message,
      username: typeof body.username === "string" ? body.username : "",
    });
    return;
  }
  await startSession(req, result.value, body.rememberMe === "on");
  res.redirect("/tasks");
};

export const showSignup = (req, res) => {
  if (req.user) return res.redirect("/tasks");
  res.render("createUser", { title: "Sign up", error: null, username: "", email: "" });
};

export const signup = async (req, res) => {
  const body = req.body ?? {};
  const result = await authService.signup(body);
  if (!result.ok) {
    res.status(result.error.status).render("createUser", {
      title: "Sign up",
      error: result.error.message,
      username: typeof body.username === "string" ? body.username : "",
      email: typeof body.email === "string" ? body.email : "",
    });
    return;
  }
  await startSession(req, result.value, false);
  res.redirect("/tasks");
};

export const logout = async (req, res) => {
  await destroy(req);
  res.clearCookie("sid");
  res.redirect("/login");
};
