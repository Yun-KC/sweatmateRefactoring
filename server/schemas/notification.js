const mongoose = require("mongoose");
// type = ["welcome", "new", "ban", "join", "leave", "done", "notice"]
const { Schema } = mongoose;
const {
  Types: { ObjectId },
} = Schema;
const notificationListSchema = new Schema(
  {
    id: {
      type: ObjectId,
      required: true,
    },
    gatheringId: {
      type: Number,
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: null,
    },
    target: {
      type: String,
      default: null,
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { _id: false }
);
const notificationSchema = new Schema(
  {
    // mysql 유저의 uuid 값을 넣어줌
    _id: {
      type: String,
      required: true,
    },
    // 알림목록들
    notification: [notificationListSchema],
  },
  { versionKey: false }
);

notificationSchema.statics.createNotice = async function (userList, notificationInfo) {
  const { id, gatheringId, type, url, target, message, title } = notificationInfo;
  // 타입 new와 gatheringId 에 대한 알림이 이미 있다면 알림이 추가되지 않는다.
  if (type === "new") {
    await this.updateMany(
      {
        _id: userList,
        notification: { $not: { $elemMatch: { $and: [{ type: "new" }, { gatheringId }] } } },
      },
      { $push: { notification: { id, gatheringId, type, url, target, title, message } } }
    );
  } else {
    await this.updateMany(
      {
        _id: userList,
      },
      { $push: { notification: { id, gatheringId, type, url, target, title, message } } }
    );
  }
};
notificationSchema.statics.signup = async function (userId) {
  await this.create({
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
};

notificationSchema.statics.removeUser = async function (userId) {
  await this.remove({ _id: userId });
};

module.exports = mongoose.model("Notification", notificationSchema);
