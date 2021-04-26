const express = require("express");
const app = express();
const port = 5000;

//mongoose를 사용하여 mongoDB 연결하기
const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://worl1126:jaeki@8840@loginlogout.mharp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB Connected!!!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("반갑다잉~"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
