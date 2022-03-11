const logger = require('pino')({ prettyPrint: true });

const { playSong } = require('../util/player');

module.exports = async (params) => {
  // signature:
  // playlist, message, queue, queueConstruct.songs[0], message.guild
  // playSong(params);
  logger.info('This is where i join the last channel and start playing the playlist.')
};
