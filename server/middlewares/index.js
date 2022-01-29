const { verifyAccessToken, clearCookie } = require("../controllers/functions/token");
const { userFindOne } = require("../controllers/functions/sequelize");
const {
  DBERROR,
  TranslateFromAreaNameToAreaInfo,
  TranslateFromSportNameToSportInfo,
} = require("../controllers/functions/utility");
const AUTH_ERROR = { message: "Authentication Error" };

module.exports = {
  isAuth: async (req, res, next) => {
    const accessToken = req.cookies.jwt;
    if (!accessToken) {
      return res.status(403).json(AUTH_ERROR);
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      clearCookie(res);
      return res.status(403).json(AUTH_ERROR);
    }
    const foundUser = await userFindOne({ id: decoded.id });
    if (!foundUser) {
      clearCookie(res);
      return res.status(403).json(AUTH_ERROR);
    }
    res.locals.userId = foundUser.dataValues.id;
    res.locals.type = foundUser.dataValues.type;
    res.locals.token = accessToken;
    return next();
  },

  checkPermission: async (req, res, next) => {
    if (res.locals.userId !== req.params.userId) {
      return res.status(400).json({ message: "You don't have permission" });
    }
    next();
  },
  createConditionsForSearching: (req, res, next) => {
    const { sportName, areaName, time, date, totalNum } = req.query;
    const areaId = TranslateFromAreaNameToAreaInfo(areaName)?.id;
    const sportInfo = TranslateFromSportNameToSportInfo(sportName);
    let sInfo;
    if (sportInfo) {
      sInfo = { ...sportInfo };
      delete sInfo.id;
    }
    res.locals.gathering = {
      time,
      date,
      totalNum,
      areaId,
      sportId: sportInfo?.id,
    };
    res.locals.conditions = { ...req.query, ...sInfo };
    next();
  },
  checkToCreateGathering: (req, res, next) => {
    const {
      title,
      description,
      placeName,
      latitude,
      longitude,
      date,
      time,
      timeDescription,
      totalNum,
      areaName,
      sportName,
    } = req.body;
    if (
      !(
        title &&
        description &&
        placeName &&
        latitude &&
        longitude &&
        date &&
        time &&
        timeDescription &&
        totalNum &&
        areaName &&
        sportName
      )
    ) {
      return res.status(400).json({ message: "Incorrect format" });
    }
    const { userId } = res.locals;
    const {
      id: sportId,
      sportName: sName,
      sportEmoji,
    } = TranslateFromSportNameToSportInfo(req.body.sportName);
    const areaId = TranslateFromAreaNameToAreaInfo(req.body.areaName).id;
    res.locals.setGatheringInfo = {
      title,
      description,
      placeName,
      latitude,
      longitude,
      date,
      time,
      timeDescription,
      totalNum,
      currentNum: 1,
      creatorId: userId,
      sportId,
      areaId,
    };

    res.locals.sportInfo = { sportId, sportName: sName, sportEmoji };
    next();
  },
};
