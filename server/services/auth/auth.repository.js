const { User } = require("../../models");
module.exports = {
  // findOneOfUser는 매개변수로 쿼리 목록, 제외할 속성을 매개변수로 받습니다.
  findOneOfUser: async (queries, exclude = []) => {
    return await User.findOne({
      where: { ...queries },
      attributes: { exclude: [...exclude] },
    });
  },
};
