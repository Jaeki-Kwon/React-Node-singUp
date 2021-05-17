const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 20,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 4,
  },
  lastname: {
    type: String,
    maxlength: 20,
  },
  // 관리자와 user 확인하기 위하여
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  // token 유효기간
  tokenExp: {
    type: Number,
  },
});

// index.js에서 31번째 줄에서 save 하기 전 해주는 작업
userSchema.pre("save", function (next) {
  var user = this;
  console.log("user", user);
  if (user.isModified("password")) {
    // 비밀번호 암호화 하기
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      // hash : 암호화 된 비밀번호
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainpassword 와 암호화된 비밀번호 가 같은 지...
  var user = this;
  console.log("USER", user);
  bcrypt.compare(plainPassword, user.password, function (err, isMatch) {
    console.log("plainPassword", plainPassword);
    console.log("user.password", user.password);
    console.log("Hi");
    console.log("isMatch", isMatch);
    console.log(err);
    if (err) return cb(err, isMatch);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;
  // jsonwebtoken 이용하여 토큰 생성
  // user._id + 'secretToken' = token
  // 'secretToken'을 디코딩하면 user._id
  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  // 토큰을 decode한다.
  jwt.verify(token, "secretToken", function (err, decode) {
    // 유저 아이디를 이용해서 유저를 찾은 다음
    // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decode, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
