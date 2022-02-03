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
} = require("../controllers/auth.controller");
// (1) 닉네임과 이메일 중복 검사를 미들웨어 => 서비스로 옮겨야합니다.
// (2) req.body에 필요한 인자가 왔는지 확인하는 미들웨어를 작성합니다.
// (3) isAuth의 위치를 auth.middleware로 옮겼습니다.
// (4) 단순히 body의 인자 유무만 체크하는 방식에서 유효성을 라이브러리를 통해 검사하도록 바꿨습니다.
// (5) 회원가입에서 컨트롤과 서비스 부분을 분리했습니다. (이메일 인증과 유저 생성 로직을 서비스로);
const { isAuth } = require("../middlewares/auth/auth.middleware");
const { validateBodyForSignup } = require("../middlewares/auth/auth.validator");
router.get("/nickname/:nickname", validNickname); // (1)
router.get("/email/:email", validEmail); // (1)
router.get("/me", isAuth, me);
router.post("/signin", signin);
router.get("/signout", signout);
router.post("/signup", validateBodyForSignup(), signup); // (1)(2)(4)(5)
router.get("/certification/:authKey", certifyEmail);
router.post("/guest", guestSignin);
router.post("/google", googleSignin);
router.post("/kakao", kakaoSignin);
module.exports = router;
