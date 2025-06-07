const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const locationRoutes = require('./routes/locationRoutes');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb+srv://ravi:123@cluster0.cmygjfn.mongodb.net/gps_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'gps_secret_key', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const io = require('socket.io')(server);
app.set('io', io);

app.use('/', locationRoutes);