const {
  findOneOfUser,
  createUser,
  updateAuthorizedUser,
} = require("../repositories/auth.repository");
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
    } catch (err) {
      return null;
    }
  },
  certifyEmailByAuthKey: async (authKey) => {
    try {
      const userInfo = await findOneOfUser({ authKey });
      if (!userInfo) return null;
      await updateAuthorizedUser(userInfo.dataValues.id);
      return userInfo.dataValues;
    } catch (err) {
      return null;
    }
  },
};
