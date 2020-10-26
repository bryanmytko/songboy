const logger = require('pino')({ prettyPrint: true });

const { MSG_SKIP, MSG_SKIP_FAIL } = require('../util/messages');

module.exports = async (params) => {
  const { queue, message } = params;
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) return;
  if (!serverQueue.songs.length) serverQueue.textChannel.send(MSG_SKIP_FAIL);

  try {
    serverQueue.textChannel.send(MSG_SKIP(serverQueue.songs[0].title));
    serverQueue.connection.dispatcher.end();
  } catch (e) {
    logger.error(e);
  }
};
