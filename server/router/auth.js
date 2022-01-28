const express = require("express");
const router = express.Router();
const {
  validNickname,
  validEmail,
  signup,
  certifyEmail,
  signin,
  me,
  signout,
  guestSignin,
  googleSignin,
  kakaoSignin,
} = require("../controllers/auth");
const { isAuth } = require("../middlewares");
// 닉네임과 이메일 중복 검사를 미들웨어 => 서비스로 옮겨야합니다.

router.get("/nickname/:nickname", validNickname); // (1)
router.get("/email/:email", validEmail); // (1)
router.get("/me", isAuth, me);
router.post("/signin", signin);
router.get("/signout", signout);
router.post("/signup", signup); // (1)
router.get("/certification/:authKey", certifyEmail);
router.post("/guest", guestSignin);
router.post("/google", googleSignin);
router.post("/kakao", kakaoSignin);
module.exports = router;
