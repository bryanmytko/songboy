const mongoose = require('mongoose');

const model = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  songs: [{
    url: String,
    title: String,
    img: String,
  }],
});

module.exports = new mongoose.model('Playlist', model);
