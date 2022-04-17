const mongoose = require('mongoose');

const model = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  songs: [{
    requester: String,
    url: String,
    title: String,
    img: String,
  }],
  message: {
    author: {
      username: String,
    },
    channel: String,
    guild: {
      id: Number,
    },
    member: {
      voice: {
        channel: String,
      }
    }
  }
});

module.exports = new mongoose.model('Playlist', model);
