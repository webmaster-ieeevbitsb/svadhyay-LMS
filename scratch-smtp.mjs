import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || "465");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;

console.log("Testing SMTP Connection...");
console.log(`Host: ${host}`);
console.log(`Port: ${port}`);
console.log(`User: ${user}`);
console.log(`Password length: ${pass?.length}`);
console.log(`Password ends with backtick: ${pass?.endsWith('\`')}`);

const transporter = nodemailer.createTransport({
  host,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

transporter.verify(function (error, success) {
  if (error) {
    console.log("Connection failed!");
    console.error(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
