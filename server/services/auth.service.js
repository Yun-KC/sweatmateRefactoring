const {
  findOneOfUser,
  createUser,
  updateAuthorizedUser,
} = require("../repositories/auth.repository");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const { saltRounds } = require("../config").bcrypt;
const { createException } = require("../exceptions");

module.exports = {
  checkNickname: async (nickname) => {
    const userInfo = await findOneOfUser({ nickname });
    if (userInfo) {
      throw createException({ message: `${nickname} already exists`, statusCode: 400 });
    }
  },
  checkEmail: async (email) => {
    const userInfo = await findOneOfUser({ email });
    if (userInfo) {
      throw createException({ message: `${email} already exists`, statusCode: 400 });
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
      throw createException({ message: "Fail to create user", statusCode: 500 });
    }
  },
  certifyEmailByAuthKey: async (authKey) => {
    const userInfo = await findOneOfUser({ authKey });
    if (!userInfo) {
      throw createException({ message: "인증 시간이 초과되었습니다.", statusCode: 400 });
    }
    await updateAuthorizedUser(userInfo.dataValues.id);
    return userInfo.dataValues;
  },
  signin: async (email, password) => {
    const userInfo = await findOneOfUser({ email });
    if (!userInfo) {
      throw createException({ message: "Invalid email or password", statusCode: 401 });
    }
    if (!userInfo.dataValues.authStatus) {
      throw createException({ message: "Need to verify your email first", statusCode: 400 });
    }
    const isValidPassword = await bcrypt.compare(password, userInfo.dataValues.password);
    if (!isValidPassword) {
      throw createException({ message: "Invalid email or password", statusCode: 401 });
    }
    return userInfo;
  },
};
