const express = require("express");
const app = express();
const PORT = 5000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

const config = require("./config/key");

app.use(bodyParser.urlencoded({ extended: true }));
// application이 json 타입으로 된것을 분석해서 가져오기
app.use(bodyParser.json());
app.use(cookieParser());

//mongoose를 사용하여 mongoDB 연결하기
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected!!!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("반갑다잉~ 잘가라고~"));

app.get("/api/hello", (req, res) => res.send("안뇽?!"));

app.post("/api/users/register", (req, res) => {
  // 회원가입 할 때 필요한 정보들 client에서 가져오면
  // 그것들을 데이터베이스에 넣기
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  // 1. 요청된 이메일을 데이터베이스에 있는 지 찾는다.
  // 몽고db 내부 함수
  User.findOne({ email: req.body.email }, (err, user) => {
    console.log("유저", user);
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "등록되지 않은 사용자입니다. 이메일을 확인해주세요.",
      });
    }
    // 2. 요청된 이메일이 맞다면 비밀번호가 맞는 지 확인.
    // console.log("user", user);
    user.comparePassword(req.body.password, (err, isMatch) => {
      console.log("err", err);
      console.log("req.body.password", req.body.password);
      console.log("isMatch", isMatch);
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      // 3. 비밀번호까지 맞다면 토큰을 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 쿠키에 저장
        res
          .cookie("x_auth", user.token) //
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user_.id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastmane: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

const handleListening = () =>
  console.log(`✅  Listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);
