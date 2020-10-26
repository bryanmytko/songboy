const logger = require('pino')({ prettyPrint: true });

const { MSG_QUEUE_EMPTY, MSG_QUEUE_CURRENT } = require('../util/messages');

module.exports = (params) => {
  const { queue, message } = params;
  const serverQueue = queue.get(message.guild.id);

  try {
    if (!serverQueue.songs.length) {
      serverQueue.textChannel.send(MSG_QUEUE_EMPTY);
    } else {
      const songs = serverQueue.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n');
      serverQueue.textChannel.send(MSG_QUEUE_CURRENT(songs));
    }
  } catch (e) {
    logger.error(e);
  }
};
