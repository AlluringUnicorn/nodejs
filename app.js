const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const contactsRouter = require("./routes/api/contacts-routes");
const authRouter = require("./routes/api/auth-routes");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server Error" } = err;
  res.status(status).json({ message });
});

module.exports = app;

// -----------------------------------------------------------------------------

// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const { UKR_NET_EMAIL, UKR_NET_PASSWORD } = process.env;

// const nodemailerConfig = {
//   host: "smtp.ukr.net",
//   port: 465,
//   secure: true,
//   auth: {
//     user: UKR_NET_EMAIL,
//     pass: UKR_NET_PASSWORD,
//   },
// };

// const transport = nodemailer.createTransport(nodemailerConfig);

// const email = {
//   from: UKR_NET_EMAIL,
//   to: "hihoxe5636@devswp.com",
//   subject: "Verify email",
//   html: "<p>Verify email</p>",
// };

// transport
//   .sendMail(email)
//   .then(() => console.log("Email send success"))
//   .catch((error) => console.log(error.message));

// const ElasticEmail = require("@elasticemail/elasticemail-client");
// require("dotenv").config();

// const { ELASTICEMAIL_API_KEY } = process.env;

// const defaultClient = ElasticEmail.ApiClient.instance;

// const { apikey } = defaultClient.authentications;

// apikey.apiKey = ELASTICEMAIL_API_KEY;

// const api = new ElasticEmail.EmailsApi();

// const email = ElasticEmail.EmailMessageData.constructFromObject({
//   Recipients: [new ElasticEmail.EmailRecipient("hihoxe5636@devswp.com")],
//   Content: {
//     Body: [
//       ElasticEmail.BodyPart.constructFromObject({
//         ContentType: "HTML",
//         Content: "<p>Verify email</p>",
//       }),
//     ],
//     Subject: "Verify email",
//     From: "mariakhapun@gmail.com",
//   },
// });

// const callback = function (error, data, response) {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log("API called successfully.");
//   }
// };
// api.emailsPost(email, callback);
