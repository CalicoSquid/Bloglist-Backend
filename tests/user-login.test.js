const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const api = supertest(app);

const User = require("../models/user");
const helper = require("./test-helper");

describe("User Registration and Authentication:", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("test-password", 10);
    const user = new User({ username: "test-user", passwordHash });

    await user.save();
  });

  test("Test User Registration:", async () => {
    const testUser = {
      username: "CalicoSquid",
      name: "Caleb",
      password: "squidward",
    };

    await api
      .post("/api/users")
      .send(testUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersInDB = await helper.getAllUsers();
    const userInDB = usersInDB.find(
      (user) => user.username === testUser.username
    );

    expect(userInDB).toBeDefined();
    expect(userInDB.username).toBe(testUser.username);
    expect(userInDB.name).toBe(testUser.name);
  });

  test("Test Duplicate User Registration:", async () => {
    const duplicateUser = {
      username: "test-user",
      name: "Caleb",
      password: "squidward",
    };

    const response = await api
      .post("/api/users")
      .send(duplicateUser)
      .expect(400);

    expect(response.body.error).toContain("expected `username` to be unique");
  });

  test("Test Result if User Password is Invalid", async () => {
    const invalidPassword = {
      username: "invalid-pw-user",
      name: "test",
      password: "tp",
    };

    const response = await api
      .post("/api/users")
      .send(invalidPassword)
      .expect(400);

    expect(response.body.error).toEqual(
      "Password must be more than 3 characters in length"
    );
  });

  test("Test Result if Username is Invalid", async () => {
    const invalidUsername = {
      username: "tu",
      name: "test",
      password: "test-password",
    };

    const response = await api
      .post("/api/users")
      .send(invalidUsername)
      .expect(400);

    expect(response.body.error).toContain(
      "User validation failed: username: Path `username` (`tu`) is shorter than the minimum allowed length (3)."
    );
  });

  test("Test User Authentication:", async () => {
    const loginUser = {
      username: "test-user",
      password: "test-password",
    };

    const response = await api.post("/api/login").send(loginUser).expect(200);

    expect(response).toBeDefined();
    expect(response.body.username).toBe("test-user");
    expect(response.body.token).toBeDefined();
  });

  test("Test Invalid User Authentication:", async () => {
    const loginUser = {
      username: "test-user",
      password: "wrong-test-password",
    };

    const response = await api.post("/api/login").send(loginUser).expect(401);

    expect(response.body.error).toBe("invalid username or password");
  });

  test("Test Token Generation on Login:", async () => {
    let token = await helper.loginUser(api, {
      username: "test-user",
      password: "test-password",
    });

    const decodedToken = jwt.verify(token.substring(7), process.env.SECRET);

    expect(decodedToken).toBeDefined();
    expect(decodedToken.username).toBe("test-user");
  });

  test("Test Token Invalidation on Invalid Login:", async () => {
    const loginUser = {
      username: "test-user",
      password: "wrong-test-password",
    };

    const response = await api.post("/api/login").send(loginUser).expect(401);

    const token = response.body.token;
    expect(token).not.toBeDefined();
  });
});

describe("Getting Users List:", () => {
  test("Test Getting Users List:", async () => {
    const listOfAllUsers = await helper.getAllUsers();
   
    const token = await helper.loginUser(api, {
      username: "test-user",
      password: "test-password",
    });

    const users = await api
      .get("/api/users")
      .set("authorization", token)
      .expect(200);
    expect(users.body).toHaveLength(listOfAllUsers.length);
  });

  test("Test Getting Users List With Token:", async () => {
    const token = await helper.loginUser(api, {
      username: "test-user",
      password: "test-password",
    });

    const users = await api
      .get("/api/users")
      .set("authorization", token)
      .expect(200);

    expect(users).toBeDefined();
  });

  test("Test Getting Users List Without Token:", async () => {

    const response = await api.get("/api/users").expect(401);
    console.log(response.body)
    expect(response.body).toBe("Token missing or invalid");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
