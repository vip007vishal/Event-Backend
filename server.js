
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const Razorpay = require('razorpay');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS
  }
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query("INSERT INTO users (name,email,password,is_verified) VALUES (?,?,?,false)",
    [name, email, hashed],
    (err) => {
      if (err) return res.status(500).send(err);
      const otp = Math.floor(100000 + Math.random() * 900000);
      db.query("INSERT INTO otp (email,code) VALUES (?,?)", [email, otp]);
      transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: "Your OTP",
        text: `Your OTP is ${otp}`
      });
      res.json({ message: "OTP sent" });
    });
});

// Verify OTP
app.post('/api/verify', (req, res) => {
  const { email, otp } = req.body;
  db.query("SELECT * FROM otp WHERE email=? AND code=?", [email, otp], (err, result) => {
    if (result.length > 0) {
      db.query("UPDATE users SET is_verified=true WHERE email=?", [email]);
      db.query("DELETE FROM otp WHERE email=?", [email]);
      res.json({ message: "Verified" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  });
});

// Get Events
app.get('/api/events', (req, res) => {
  db.query("SELECT * FROM events", (err, result) => {
    res.json(result);
  });
});

// Create Payment Order
app.post('/api/create-order', async (req, res) => {
  const { amount } = req.body;
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR"
  });
  res.json(order);
});

app.listen(5000, () => console.log("Server running on port 5000"));
