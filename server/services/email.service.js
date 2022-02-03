const nodemailer = require("nodemailer");
const emailFormat = require("../views/emailFormat");
const { googleId, googlePassword } = require("../config").email;

const mailSender = {
  sendGmail: async function ({ email, nickname, subject, authKey }) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      prot: 587,
      host: "smtp.gmail.com",
      secure: false,
      requireTLS: true,
      auth: {
        user: googleId,
        pass: googlePassword,
      },
    });
    const mailOptions = {
      from: googleId,
      to: email,
      subject: subject,
      html: emailFormat(authKey, nickname),
    };
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
};

module.exports = mailSender;
