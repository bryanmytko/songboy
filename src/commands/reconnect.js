const logger = require('pino')({ prettyPrint: true });

const playSong = require('../util/play_song');

module.exports = async (params) => {
  // signature:
  // playlist, message, queue, queueConstruct.songs[0], message.guild
  playSong(params);
};
