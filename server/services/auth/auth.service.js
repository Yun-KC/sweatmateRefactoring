const { findOneOfUser } = require("./auth.repository");

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
};
