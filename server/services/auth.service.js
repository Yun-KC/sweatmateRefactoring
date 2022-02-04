const {
  findOneOfUser,
  createUser,
  updateAuthorizedUser,
} = require("../repositories/auth.repository");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const { saltRounds } = require("../config").bcrypt;
const { createError } = require("../exceptions");

module.exports = {
  checkNickname: async (nickname) => {
    const userInfo = await findOneOfUser({ nickname }, []);
    if (userInfo) {
      return true;
    } else {
      return false;
    }
  },
  checkEmail: async (email) => {
    const userInfo = await findOneOfUser({ email }, []);
    if (userInfo) {
      return true;
    } else {
      return false;
    }
  },
  createUserAndReturnUserinfo: async ({ email, password, nickname }) => {
    const hashed = await bcrypt.hash(password, saltRounds);
    const authKey = uuid().split("-").join("");
    try {
      return await createUser({
        id: uuid(),
        nickname,
        email,
        password: hashed,
        authKey,
      });
    } catch {
      return null;
    }
  },
  certifyEmailByAuthKey: async (authKey) => {
    try {
      const userInfo = await findOneOfUser({ authKey });
      if (!userInfo) return null;
      await updateAuthorizedUser(userInfo.dataValues.id);
      return userInfo.dataValues;
    } catch {
      return null;
    }
  },
  signin: async (email, password) => {
    const userInfo = await findOneOfUser({ email });
    if (!userInfo) {
      throw createError({ message: "Invalid email or password", statusCode: 401 });
    }
    if (!userInfo.dataValues.authStatus) {
      throw createError({ message: "Need to verify your email first", statusCode: 400 });
    }
    const isValidPassword = await bcrypt.compare(password, userInfo.dataValues.password);
    if (!isValidPassword) {
      throw createError({ message: "Invalid email or password", statusCode: 401 });
    }
    return userInfo;
  },
};
