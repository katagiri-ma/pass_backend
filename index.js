const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const knex = require("./knex");
const userInfo = require("./items");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
app.use(express.json());

const url =
  process.env.DEVELOPMENT_FRONTEND_URL || process.env.PRODUCTION_FRONTEND_URL;
app.use(cors({ origin: url })); //Need confirm to Frontend

// app.use(cors({ origin: 'http://localhost:5173' })); //Need confirm to Frontend
// app.use(cors({ origin: "https://lenzzzz-frontend.onrender.com" })); //Need confirm to Frontend
// app.use(cors({ origin: 'https://lenzzzz-frontend-cgi6.onrender.com' })); //Need confirm to Frontend

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // secret: "",
    resave: false,
    saveUninitialized: false,
  })
  // session()
);
app.use(flash());

//Controllre Func : Start
const userInfoFunc = async (req, res) => {
  const userId = Number(req.params.id);
  const info = await userInfo.getById(userId);
  console.log("userId", userId);
  res.status(200).send(info);
};

const registrationFunc = async (req, res) => {
  // console.log("req.body", req.body);
  const {
    id,
    user_id,
    purchase_date,
    warranty_number,
    warranty_unit,
    product_name,
    retailer,
    warranty_photo,
    product_photo,
  } = req.body;

  const appDate = await userInfo.save({
    id,
    user_id,
    purchase_date,
    warranty_number,
    warranty_unit,
    product_name,
    retailer,
    warranty_photo,
    product_photo,
  });

  res.status(201).send("追加しました");
};

const loginFunc = async (req, res) => {
  const { user_name, password } = req.body;
  // console.log("req::::::", req)
  console.log("bodyより受信", user_name, password);
  const loginId = await userInfo.getByUserPass(user_name, password);
  if (!loginId) {
    res.status(400).send("NG");
  } else {
    res.status(200).send(loginId);
  }
};
//End : Controller Func

const passport = require("passport");
const LocalStrategy = require("passport-local");
// authorization
require("./passport")(app);
//API : Start
app.get("/items/:id", userInfoFunc);
app.post("/registrations", registrationFunc);
// app.post("/login", loginFunc); //passport.js適用で要らなくなるはず

app.use(passport.session());

app.post(
  "/login",
  // loginFunc,
  passport.authenticate("local", {
    successRedirect: "/items",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
//End : API

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
