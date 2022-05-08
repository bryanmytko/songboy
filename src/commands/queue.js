const logger = require('pino')({ prettyPrint: true });

const { MSG_QUEUE_EMPTY, MSG_QUEUE_CURRENT } = require('../util/messages');
const Playlist = require('../models/playlist');

module.exports = async params => {
  const { queue, message } = params;
  const serverQueue = queue.get(message.guild.id);
  const playlist = await Playlist.findOne({ title: 'default' });

  try {
    if (playlist.songs && playlist.songs.length) {
      const songs = playlist.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n');
      return message.channel.send(MSG_QUEUE_CURRENT(songs));
    }
    return message.channel.send(MSG_QUEUE_EMPTY);
  } catch (e) {
    logger.error(e);
  }
};
