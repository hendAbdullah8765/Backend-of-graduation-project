// nodemailer
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1- create transeporter (servise that will send email)
  const transeporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, //if secure false port= 587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2- define email options
  const mailOpts = {
    from: "SAVE_ME APP <savemeproject175@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3- send email
  await transeporter.sendMail(mailOpts);
};

module.exports = sendEmail;
