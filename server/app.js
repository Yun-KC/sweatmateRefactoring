const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
const config = require("./config");
const mongooseConnect = require("./schemas");
const SocketIO = require("./socket");
require("express-async-errors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./sweatmate.yaml");

const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const gatheringRouter = require("./router/gathering");
const notificationRouter = require("./router/notification");
const chatRouter = require("./router/chat");
const { realTimeUserStatus } = require("./controllers/functions/sequelize");
const app = express();

const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors(corsOption));
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

// // test;
const { User, Gathering, User_gathering } = require("./models");
// const sequelize = require("sequelize");
const {
  ModifyTheCurrentNumOfGathering,
  findOneUser,
  getGatheringIdsByUser,
} = require("./controllers/functions/sequelize");
const { dropUser, deleteImageinTable } = require("./controllers/functions/utility");
const { Sequelize, DataTypes, Model } = require("sequelize");

app.use(async function (req, res) {
  const test = sequelize.define("test", {
    username: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue("username");
        return rawValue ? rawValue.toUpperCase() : null;
      },
    },
  });
  console.log(test);
  const user = test.build({ username: "SuperUser123" });
  console.log(user.username); // 'SUPERUSER123'
  console.log(user.getDataValue("username")); // 'SuperUser123'
  // const a = await User_gathering.findOne({
  //   include: { model: User },
  //   raw: true,
  //   nest: true,
  // });
  // console.log(a);
  // const date = new Date();
  // date.setHours(date.getHours() - 15);
  // const unidentifiedUsers = await User.findAll({
  //   where: { type: "local", authStatus: 0, createdAt: { [Op.lte]: date } },
  //   attributes: ["id"],
  // });
  // unidentifiedUsers.forEach((el) => {
  //   el.destroy();
  // });
  // // 게스트 유저 정보 삭제

  // date.setHours(date.getHours() + 12);
  // const guestUsers = await User.findAll({
  //   where: { type: "guest", createdAt: { [Op.lte]: date } },
  //   attributes: ["id", "image"],
  // });
  // console.log(date);
  // guestUsers.forEach(async (el) => {
  //   const { id: userId, image } = el.dataValues;
  //   console.log(el);
  //   await dropUser(userId, { app });
  //   deleteImageinTable(image);
  //   const gatheringIds = await getGatheringIdsByUser(userId);
  //   await el.destroy();
  //   await ModifyTheCurrentNumOfGathering(gatheringIds);
  // });

  res.status(200).send("무야호");
});
// //test

app.get("/", (req, res) => {
  res.send("Let's Sweatmate!");
});
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/gathering", gatheringRouter);
app.use("/chat", chatRouter);
app.use("/notification", notificationRouter);

app.use((req, res) => {
  res.status(400).json({ message: "Invalid request" });
});
app.use((err, req, res, next) => {
  res.status(500).json({ message: `Something went wrong: ${err}` });
});

const sweatmateServer = app.listen(config.port, async () => {
  console.log(`🚀 Listening on PORT: ${config.port}`);
  mongooseConnect();
  try {
    await sequelize.authenticate();
    app.set("realTime", await realTimeUserStatus());
    SocketIO(sweatmateServer, app);
    require("./schedule")(app);
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
