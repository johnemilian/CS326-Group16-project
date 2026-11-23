import { describe, expect, jest } from "@jest/globals";

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
    hashSync: jest.fn(() => "dummy-hash"),
  },
}));

jest.unstable_mockModule("../repositories/usersRepository.js", () => ({
  isValidId: jest.fn(() => true),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.unstable_mockModule("../dtos/userDto.js", () => ({
  toUserDto: jest.fn((user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
  })),
}));

const { signup, login, findUser } = await import("../services/authService.js");

const bcrypt = (await import("bcrypt")).default;

const { isValidId, findByUsername, findByEmail, findById, create } =
  await import("../repositories/usersRepository.js");

const validUser = {
  _id: "fake-id",
  username: "farmer123",
  email: "farmer@gmail.com",
  passwordHash: "hashed-password",
};

describe("signup", () => {
  test("signup rejects a missing username", async () => {
    const result = await signup({
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup rejects a username shorter than 3 characters", async () => {
    const result = await signup({
      username: "ab",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup rejects a username longer than 30 characters", async () => {
    const result = await signup({
      username: "a".repeat(31),
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup rejects a username containing invalid characters", async () => {
    const result = await signup({
      username: "farmer@123",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup accepts valid username characters", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");
    create.mockResolvedValueOnce(validUser);

    const result = await signup({
      username: "Farmer_123.test",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(true);
  });

  test("signup trims whitespace from username and email", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");
    create.mockResolvedValueOnce(validUser);

    await signup({
      username: " farmer123 ",
      email: " farmer@gmail.com ",
      password: "password123",
    });

    expect(findByUsername).toHaveBeenCalledWith("farmer123");
    expect(findByEmail).toHaveBeenCalledWith("farmer@gmail.com");
  });

  test("signup rejects an invalid email address", async () => {
    const result = await signup({
      username: "farmer123",
      email: "invalid-email",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup rejects a missing password", async () => {
    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup rejects a password shorter than 8 characters", async () => {
    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "1234567",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup accepts a password of 8 characters", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");
    create.mockResolvedValueOnce(validUser);

    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "12345678",
    });

    expect(result.ok).toBe(true);
  });

  test("signup rejects a password longer than 72 bytes", async () => {
    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "a".repeat(73),
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(400);
  });

  test("signup rejects a username that already exists", async () => {
    findByUsername.mockResolvedValueOnce(validUser);

    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(409);
    expect(findByUsername).toHaveBeenCalledWith("farmer123");
  });

  test("signup rejects an email that already exists", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(validUser);

    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(409);
    expect(findByEmail).toHaveBeenCalledWith("farmer@gmail.com");
  });

  test("signup hashes the password before creating a user", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");
    create.mockResolvedValueOnce(validUser);

    await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(create).toHaveBeenCalledWith({
      username: "farmer123",
      email: "farmer@gmail.com",
      passwordHash: "hashed-password",
    });
  });

  test("signup ignores additional fields such as role", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");
    create.mockResolvedValueOnce(validUser);

    await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "password123",
      role: "admin",
    });

    expect(create).toHaveBeenCalledWith({
      username: "farmer123",
      email: "farmer@gmail.com",
      passwordHash: "hashed-password",
    });
  });

  test("signup creates a user and returns its DTO", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");
    create.mockResolvedValueOnce(validUser);

    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      id: "fake-id",
      username: "farmer123",
      email: "farmer@gmail.com",
    });
    expect(create).toHaveBeenCalled();
  });

  test("signup returns a 409 error when a duplicate key error occurs", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");

    create.mockRejectedValueOnce({
      code: 11000,
    });

    const result = await signup({
      username: "farmer123",
      email: "farmer@gmail.com",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(409);
  });

  test("signup rethrows unexpected repository errors", async () => {
    findByUsername.mockResolvedValueOnce(null);
    findByEmail.mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValueOnce("hashed-password");

    create.mockRejectedValueOnce(new Error("Database failure"));

    await expect(
      signup({
        username: "farmer123",
        email: "farmer@gmail.com",
        password: "password123",
      }),
    ).rejects.toThrow("Database failure");
  });
});

describe("login", () => {
  test("login successfully authenticates a user", async () => {
    findByUsername.mockResolvedValueOnce(validUser);
    bcrypt.compare.mockResolvedValueOnce(true);

    const result = await login({
      username: "farmer123",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      id: "fake-id",
      username: "farmer123",
      email: "farmer@gmail.com",
    });
    expect(findByUsername).toHaveBeenCalledWith("farmer123");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashed-password",
    );
  });

  test("login rejects an incorrect password", async () => {
    findByUsername.mockResolvedValueOnce(validUser);
    bcrypt.compare.mockResolvedValueOnce(false);

    const result = await login({
      username: "farmer123",
      password: "wrongpassword",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(401);
    expect(result.error.message).toBe("Username or password is incorrect.");
  });

  test("login rejects a username that does not exist", async () => {
    findByUsername.mockResolvedValueOnce(null);
    bcrypt.compare.mockResolvedValueOnce(false);

    const result = await login({
      username: "unknown",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(401);
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "dummy-hash");
  });

  test("login rejects an empty username", async () => {
    bcrypt.compare.mockResolvedValueOnce(false);

    const result = await login({
      username: "",
      password: "password123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(401);
  });

  test("login trims whitespace from username", async () => {
    findByUsername.mockResolvedValueOnce(validUser);
    bcrypt.compare.mockResolvedValueOnce(true);

    const result = await login({
      username: " farmer123 ",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    expect(findByUsername).toHaveBeenCalledWith("farmer123");
  });

  test("login rejects a missing password", async () => {
    findByUsername.mockResolvedValueOnce(validUser);
    bcrypt.compare.mockResolvedValueOnce(false);

    const result = await login({
      username: "farmer123",
    });

    expect(result.ok).toBe(false);
    expect(result.error.status).toBe(401);
  });

  test("login uses the same error message for an unknown user and wrong password", async () => {
    findByUsername.mockResolvedValueOnce(validUser);
    bcrypt.compare.mockResolvedValueOnce(false);

    const wrongPasswordResult = await login({
      username: "farmer123",
      password: "wrongpassword",
    });

    findByUsername.mockResolvedValueOnce(null);
    bcrypt.compare.mockResolvedValueOnce(false);

    const unknownUserResult = await login({
      username: "unknown",
      password: "password123",
    });

    expect(wrongPasswordResult.error.message).toBe(
      unknownUserResult.error.message,
    );
    expect(wrongPasswordResult.error.status).toBe(401);
    expect(unknownUserResult.error.status).toBe(401);
  });
});

describe("findUser", () => {
  test("findUser returns null when the ID is invalid", async () => {
    isValidId.mockReturnValueOnce(false);

    const result = await findUser("invalid-id");

    expect(result).toBeNull();
    expect(isValidId).toHaveBeenCalledWith("invalid-id");
    expect(findById).not.toHaveBeenCalled();
  });

  test("findUser returns null when the user does not exist", async () => {
    isValidId.mockReturnValueOnce(true);
    findById.mockResolvedValueOnce(null);

    const result = await findUser("fake-id");

    expect(result).toBeNull();
    expect(findById).toHaveBeenCalledWith("fake-id");
  });

  test("findUser returns the user DTO when the user exists", async () => {
    isValidId.mockReturnValueOnce(true);
    findById.mockResolvedValueOnce(validUser);

    const result = await findUser("fake-id");

    expect(result).toEqual({
      id: "fake-id",
      username: "farmer123",
      email: "farmer@gmail.com",
    });
    expect(findById).toHaveBeenCalledWith("fake-id");
  });
});
