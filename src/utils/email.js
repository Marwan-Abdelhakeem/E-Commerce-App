import nodemailer from "nodemailer";
export const sendEmail = async ({ to = "", subject = "", html = "" }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "marwan.abdelhakeem.ahmed@gmail.com",
      pass: "tgolkpffrczadtqr",
    },
  });
  const info = await transporter.sendMail({
    from: "'E-commerce'<marwan.abdelhakeem.ahmed@gmail.com>",
    to,
    subject,
    html,
  });
};
