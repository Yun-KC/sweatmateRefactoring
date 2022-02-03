const notificationModel = require("../schemas/notification");
const mongoose = require("mongoose");

module.exports = {
  createNotificationOfUser: async function (userId) {
    await notificationModel.create({
      _id: userId,
      notification: [
        {
          id: mongoose.Types.ObjectId(),
          gatheringId: null,
          type: "welcome",
          url: `users/${userId}`,
          target: null,
          title: null,
          message: "sweatmate에 오신 걸 환영합니다. 마이페이지로 이동해 프로필을 바꿔보세요!",
        },
      ],
    });
  },
};
