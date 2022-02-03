const { verifyAccessToken, clearCookie } = require("../../controllers/functions/token");
const { findOneOfUser } = require("../../repositories/auth.repository");
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
    const foundUser = await findOneOfUser({ id: decoded.id });
    if (!foundUser) {
      clearCookie(res);
      return res.status(403).json(AUTH_ERROR);
    }
    res.locals.userId = foundUser.dataValues.id; // (4) 삭제 예정
    res.locals.type = foundUser.dataValues.type; // (4) 삭제 예정
    // res.locals.userInfo에 유저정보를 넣어줍니다.
    res.locals.userInfo = foundUser; // (4) isAuth를 쓰는 모든 컨트롤러에서 userInfo로 유저정보를 컨트롤합니다.
    res.locals.token = accessToken;
    return next();
  },
};
