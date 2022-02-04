const { User } = require("../models");
const { createException } = require("../exceptions");
module.exports = {
  // findOneOfUser는 매개변수로 쿼리 목록, 제외할 속성을 매개변수로 받습니다.
  findOneOfUser: async (queries, exclude = []) => {
    try {
      return await User.findOne({
        where: { ...queries },
        attributes: { exclude: [...exclude] },
      });
    } catch {
      throw createException({ message: "Error occured in database", statusCode: 500 });
    }
  },
  createUser: async (queries) => {
    try {
      return await User.create(queries);
    } catch {
      throw createException({ message: "Error occured in database", statusCode: 500 });
    }
  },
  updateAuthorizedUser: async (userId) => {
    try {
      return await User.update({ authStatus: 1, authKey: null }, { where: { id: userId } });
    } catch {
      throw createException({ message: "Error occured in database", statusCode: 500 });
    }
  },
};
