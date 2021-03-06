const express = require("express");
const DB = require("./config/db");
const ejs = require("ejs");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

const app = express();
DB();

const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(","),
};

app.use(cors(corsOptions));

//template engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));
app.use("/api/files", require("./routes/files"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

// SMTP_HOST=smtp-relay.sendinblue.com
// SMTP_PORT=587
// MAIL_USER=aniket.nsit.2000@gmail.com
// MAIL_PASS=U8w6HnFdErChKW7g
