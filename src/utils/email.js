import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config({ path: path.resolve("./config/.env") });

export const sendEmail = async ({ to = "", subject = "", html = "" }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_AUTH_USER,
      pass: process.env.GMAIL_USER_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: `'E-commerce'<${GMAIL_AUTH_USER}>`,
    to,
    subject,
    html,
  });
};
