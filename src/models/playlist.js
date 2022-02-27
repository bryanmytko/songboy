const mongoose = require('mongoose');

const model = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  songs: [{
    type: String,
    default: [],
  }],
});

module.exports = new mongoose.model('Playlist', model);
