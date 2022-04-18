const logger = require('pino')({ prettyPrint: true });

const { MSG_QUEUE_EMPTY, MSG_QUEUE_CURRENT } = require('../util/messages');
const Playlist = require('../models/playlist');

module.exports = async params => {
  const { queue, message } = params;
  const serverQueue = queue.get(message.guild.id);
  const playlist = await Playlist.findOne({ title: 'default' });

  try {
    if (!playlist.songs) {
      message.channel.send(MSG_QUEUE_EMPTY);
    } else {
      const songs = playlist.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n');
      message.channel.send(MSG_QUEUE_CURRENT(songs));
    }
  } catch (e) {
    logger.error(e);
  }
};
