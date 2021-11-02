module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "area",
      [
        { id: 1, areaName: "강남구" },
        { id: 2, areaName: "강동구" },
        { id: 3, areaName: "강서구" },
        { id: 4, areaName: "강북구" },
        { id: 5, areaName: "관악구" },
        { id: 6, areaName: "광진구" },
        { id: 7, areaName: "구로구" },
        { id: 8, areaName: "금천구" },
        { id: 9, areaName: "노원구" },
        { id: 10, areaName: "동대문구" },
        { id: 11, areaName: "도봉구" },
        { id: 12, areaName: "동작구" },
        { id: 13, areaName: "마포구" },
        { id: 14, areaName: "서대문구" },
        { id: 15, areaName: "성동구" },
        { id: 16, areaName: "성북구" },
        { id: 17, areaName: "서초구" },
        { id: 18, areaName: "송파구" },
        { id: 19, areaName: "영등포구" },
        { id: 20, areaName: "용산구" },
        { id: 21, areaName: "양천구" },
        { id: 22, areaName: "은평구" },
        { id: 23, areaName: "종로구" },
        { id: 24, areaName: "중구" },
        { id: 25, areaName: "중랑구" },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("area", null, {});
  },
};
