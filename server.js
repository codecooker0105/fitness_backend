// app.js
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use('/api/member', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
