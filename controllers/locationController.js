const Location = require('../models/locationModel');

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

exports.getLocations = async (req, res) => {
  const users = await Location.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$userId",
        userId: { $first: "$userId" },
        latitude: { $first: "$latitude" },
        longitude: { $first: "$longitude" },
        timestamp: { $first: "$timestamp" }
      }
    }
  ]);
  res.render('index', { users, userId: req.session.userId });
};

exports.postLocation = async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  if (!userId || !latitude || !longitude) return res.status(400).send("Missing data");

  const lastLocation = await Location.findOne({ userId }).sort({ timestamp: -1 });

  if (lastLocation) {
    const distance = getDistanceFromLatLonInKm(
      lastLocation.latitude, lastLocation.longitude,
      parseFloat(latitude), parseFloat(longitude)
    );
    if (distance < 0.01) return res.send("No significant movement");
  }

  const newLoc = new Location({ userId, latitude, longitude });
  await newLoc.save();

  const io = req.app.get('io');
  io.emit('locationUpdate', { userId, latitude, longitude });

  res.redirect('/');
};