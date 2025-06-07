const express = require('express');
const router = express.Router();
const controller = require('../controllers/locationController');

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) => {
  req.session.userId = req.body.userId;
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

router.use((req, res, next) => {
  if (!req.session.userId) return res.redirect('/login');
  next();
});

router.get('/', controller.getLocations);
router.post('/update', controller.postLocation);

module.exports = router;