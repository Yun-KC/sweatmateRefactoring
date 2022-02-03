const { findOneOfUser, createUser } = require("../repositories/auth.repository");
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const { saltRounds } = require("../config").bcrypt;

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
  createUserAndReturnAuthKey: async ({ email, password, nickname }) => {
    const hashed = await bcrypt.hash(password, saltRounds);
    const authKey = uuid().split("-").join("");
    try {
      await createUser({
        id: uuid(),
        nickname,
        email,
        password: hashed,
        authKey,
      });
      return authKey;
    } catch (err) {
      return null;
    }
  },
};
