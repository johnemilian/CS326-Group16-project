import bcrypt from "bcrypt";
import { Ok, Err } from "../result.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toUserDto } from "../dtos/userDto.js";

const SALT_ROUNDS = 12;
const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt only reads the first 72 bytes of a password.
const MAX_PASSWORD_BYTES = 72;
const LOGIN_FAILED = "Username or password is incorrect.";

// Compared against when the username does not exist, so a login for an
// unknown user takes as long as one with a wrong password and the response
// time does not reveal which usernames exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

const asText = (value) => (typeof value === "string" ? value : "");

// Only username, email and password are read from the form. Anything else in
// the body (role included) is ignored, so every new account is a "farmer".
export const signup = async (data) => {
  const username = asText(data.username).trim();
  const email = asText(data.email).trim();
  const password = asText(data.password);

  if (!USERNAME_PATTERN.test(username))
    return Err({ status: 400, message: "Username must be 3 to 30 letters, numbers, dots, dashes or underscores." });
  if (email && !EMAIL_PATTERN.test(email)) return Err({ status: 400, message: "Email address is not valid." });
  if (password.length < MIN_PASSWORD_LENGTH)
    return Err({ status: 400, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES)
    return Err({ status: 400, message: `Password must be at most ${MAX_PASSWORD_BYTES} characters.` });

  if (await usersRepository.findByUsername(username))
    return Err({ status: 409, message: "That username is already taken." });
  if (email && (await usersRepository.findByEmail(email)))
    return Err({ status: 409, message: "That email is already in use." });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const user = await usersRepository.create({ username, email: email || undefined, passwordHash });
    return Ok(toUserDto(user));
  } catch (error) {
    // Two signups for the same name at the same moment: the unique index catches the second.
    if (error.code === 11000) return Err({ status: 409, message: "That username or email is already in use." });
    throw error;
  }
};

export const login = async (data) => {
  const username = asText(data.username).trim();
  const password = asText(data.password);
  const user = username ? await usersRepository.findByUsername(username) : null;
  const matches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !matches) return Err({ status: 401, message: LOGIN_FAILED });
  return Ok(toUserDto(user));
};

export const findUser = async (id) => {
  if (!usersRepository.isValidId(id)) return null;
  const user = await usersRepository.findById(id);
  return user ? toUserDto(user) : null;
};
