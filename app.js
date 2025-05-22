var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var mysql = require("mysql2");
var cors = require("cors"); // cors 패키지 추가

var app = express();

app.use(cors()); // CORS 미들웨어 사용

// Database connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");
});

// Middleware for API Key Authentication
function authenticateKey(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  if (token === process.env.API_KEY) {
    next(); // if token is valid, proceed
  } else {
    return res.sendStatus(403); // if token is invalid
  }
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Signup endpoint
app.post("/signup", authenticateKey, (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email is required");
  }

  const query = "INSERT INTO signup (email) VALUES (?)";
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error inserting email:", err);
      return res.status(500).send("Error signing up");
    }
    res.status(201).send("Successfully signed up");
  });
});

// Count endpoint
app.get("/count", authenticateKey, (req, res) => {
  const query = "SELECT COUNT(*) AS count FROM signup";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching count:", err);
      return res.status(500).send("Error fetching count");
    }
    res.json({ count: results[0].count });
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // 에러 메시지를 JSON으로 응답
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

module.exports = app;
