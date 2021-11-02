const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const { userFindOne, createUser, getUniqueNickname } = require("./functions/sequelize");
const { sendGmail } = require("./functions/mail");
const { DBERROR } = require("./functions/utility");
const { generateAccessToken, setCookie, clearCookie } = require("./functions/token");
const {
  bcrypt: { saltRounds },
  google,
  kakao,
} = require("../config");
const emailForm = require("../views/emailFormat");
/*
  스케줄러 구성요소, 매 24시간마다 모임일정이 지난 게더링들 done = 1;
  매 24시간마다 예상하지 못한 서버 재실행에 의해서 사라진 셋타임함수들을 대비해서
  게스트의 createdAt이 24시간이 지난 유저에 대해서 삭제 
  이메일 인증이 1시간이 지난  유저 삭제
*/
const guestTable = {};

module.exports = {
  validNickname: async (req, res) => {
    return res.status(200).json({ message: "Valid nickname" });
  },
  validEmail: async (req, res) => {
    return res.status(200).json({ message: "Valid Email" });
  },
  signup: async (req, res) => {
    const { email, password, nickname } = req.body;

    const hashed = await bcrypt.hash(password, saltRounds);
    const authKey = Math.random().toString(36).slice(2);

    try {
      await createUser({
        id: uuid(),
        nickname,
        email,
        password: hashed,
        authKey,
      });

      setTimeout(async () => {
        const userInfo = await userFindOne({ authKey });
        if (!userInfo.dataValues.authStatus) {
          await userInfo.destroy();
          console.log(userInfo.dataValues, "유저 정보가 삭제되었습니다.");
        }
      }, 60 * 60 * 1000);

      sendGmail({
        toEmail: email,
        subject: "안녕하세요 Sweatmate입니다.",
        html: emailForm(authKey),
      });

      return res.status(201).json({ message: "1시간 이내에 이메일 인증을 진행해주세요" });
    } catch (err) {
      DBERROR(res, err);
    }
  },
  certifyEmail: async (req, res) => {
    const { authKey } = req.params;
    try {
      const userInfo = await userFindOne({ authKey });
      if (!userInfo) return res.status(400).send("인증 시간이 초과되었습니다.");
      userInfo.update({ authStatus: 1, authKey: null });
      const token = generateAccessToken(userInfo.dataValues.id, userInfo.dataValues.type);
      setCookie(res, token);
      return res.redirect(`${process.env.CLIENT_URL}`);
    } catch (err) {
      DBERROR(res, err);
    }
  },
  signin: async (req, res) => {
    const { email, password } = req.body;
    try {
      const foundUserByEmail = await userFindOne({ email });
      if (!foundUserByEmail) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!foundUserByEmail.dataValues.authStatus) {
        return res.status(400).json({ message: "Need to verify your email first" });
      }
      const isValidPassword = await bcrypt.compare(password, foundUserByEmail.dataValues.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = generateAccessToken(
        foundUserByEmail.dataValues.id,
        foundUserByEmail.dataValues.type
      );
      setCookie(res, token);
      const { id, image, nickname } = foundUserByEmail.dataValues;
      return res.status(200).json({ id, image, nickname });
    } catch (err) {
      DBERROR(res, err);
    }
  },
  me: async (req, res) => {
    const { userId, type } = res.locals;
    try {
      const userInfo = await userFindOne({ id: userId });
      const { id, image, nickname } = userInfo;
      // 유저가 만약 2시간동안 아무런 요청이 없다면 자동으로 관련 정보 삭제
      if (type === "guest") {
        const setTimeOutId = guestTable[userId];
        clearTimeout(setTimeOutId);
        guestTable[userId] = setTimeout(() => {
          delete guestTable[guestUUID];
          userInfo.destroy();
        }, 7200000);
      }
      return res.status(200).json({ id, image, nickname });
    } catch (err) {
      DBERROR(res, err);
    }
  },
  signout: (req, res) => {
    clearCookie(res);
    return res.status(205).json({ message: "Signed out" });
  },
  guestSignin: async (req, res) => {
    const guestUUID = uuid();
    const guestUser = await createUser({
      id: guestUUID,
      email: guestUUID,
      nickname: guestUUID.split("-")[0],
      authStatus: 1,
      type: "guest",
    });
    const token = generateAccessToken(guestUser.dataValues.id, guestUser.dataValues.type);
    setCookie(res, token);
    const { id, nickname } = guestUser.dataValues;
    guestTable[guestUUID] = setTimeout(() => {
      delete guestTable[guestUUID];
      guestUser.destroy();
    }, 7200000);
    //게스트로그인에 nickname는 UUID 의 첫 번째, 이미지는 미설정시 null 이기 때문에 null을 추가로 넣어줌
    return res.status(200).json({ id, image: null, nickname });
  },
  googleSignin: async (req, res) => {
    axios({
      method: "GET",
      data: "",
    });
  },
  kakaoSignin: async (req, res) => {
    const { kakaoClientId, kakaoClientSecret } = kakao;
    const { authorizationCode } = req.body;
    try {
      const tokenResponse = await axios({
        method: "POST",
        url: "https://kauth.kakao.com/oauth/token",
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        params: {
          grant_type: "authorization_code",
          client_id: kakaoClientId,
          client_secret: kakaoClientSecret,
          code: authorizationCode,
        },
      });
      const { access_token } = tokenResponse.data;
      const kakaoUserInfo = await axios({
        method: "GET",
        url: "https://kapi.kakao.com/v2/user/me",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const {
        profile: { profile_image_url, nickname },
        email,
      } = kakaoUserInfo.data.kakao_account;
      const checkUserByEmail = await userFindOne({ email });
      // 가입은 이메일 인증을 통해서만 가입이 가능하기 때문에 따로 type을 신경쓰지 않아도 됨
      // 이메일이 있다면 그 유저로 로그인
      console.log(checkUserByEmail);
      if (checkUserByEmail) {
        const { id, image, nickname, type } = checkUserByEmail;
        const token = generateAccessToken(id, type);
        setCookie(res, token);
        return res.status(200).json({ id, image, nickname });
      }
      // 이 이메일로 가입된 정보가 없다면 정보를 바탕으로 회원가입을 진행
      //닉네임 중복체크 함수
      const notDuplicationNickname = await getUniqueNickname(nickname);
      const createdUserInfo = await createUser({
        id: uuid(),
        email,
        nickname: notDuplicationNickname,
        image: profile_image_url,
        authStatus: 1,
        type: "kakao",
      });
      const { id, type, image } = createdUserInfo.dataValues;
      const token = generateAccessToken(id, type);
      setCookie(res, token);
      return res.status(201).json({ id, nickname, image });
    } catch (err) {
      DBERROR(res, err);
    }
  },
};
