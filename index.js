const express = require("express");
const app = express();
const PORT = 5000;
const bodyParser = require("body-parser");
const { User } = require("./models/User");

const config = require("./config/key");

app.use(bodyParser.urlencoded({ extended: true }));
// application이 json 타입으로 된것을 분석해서 가져오기
app.use(bodyParser.json());

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

app.post("/register", (req, res) => {
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

const handleListening = () =>
  console.log(`✅  Listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);
