const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

require("dotenv").config();

// provide a gmail to sent emails from
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  //   // body of the email
  let email = {
    body: {
      name: username,
      intro:
        text || "Welcome to UChat! We're very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  let emailBody = MailGenerator.generate(email);

  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject,
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .send({ msg: "You should receive an email from us." });
  } catch (err) {
    res
      .status(500)
      .send({ error: "Sorry, an error occured, please try again later!" });
  }
};

module.exports = registerMail;
