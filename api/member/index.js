// app.js
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/member/", routes);

app.post("/api/member/test", async (req, res) => {
  const bodyData = JSON.parse(JSON.stringify(req.body));
  const userId = bodyData.user_id;
  const result = await db("users");
  res.json({ userId, result });
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
