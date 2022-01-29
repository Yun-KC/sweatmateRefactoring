const { verifyAccessToken, clearCookie } = require("../../controllers/functions/token");
const AUTH_ERROR = { message: "Authentication Error" };
const { userFindOne } = require("../../controllers/functions/sequelize");

module.exports = {
  validateBodyForSignup: (req, res, next) => {
    const { email, nickname, password } = req.body;
    if (!(email && password && nickname)) {
      return res.status(400).json({ message: "Incorrect format" });
    }
    return next();
  },
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
};
