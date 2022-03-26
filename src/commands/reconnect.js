const logger = require('pino')({ prettyPrint: true });

const { DEFAULT_VOLUME } = require('../util/constants');
const { playSong } = require('../util/player');
const { ttsReconnectLead } = require('../util/tts');

module.exports = async (params) => {
  const { playlist, message, queue } = params;
  const queueConstruct = {
    textChannel: message.channel,
    voiceChannel: message.member.voice.channel,
    connection: null,
    songs: playlist.songs,
    messages: [],
    volume: DEFAULT_VOLUME,
    playing: true,
  };

  const ttsLead = await ttsReconnectLead();
  queue.set(message.guild.id, queueConstruct);

  logger.info('Reconnecting and resuming playlist.');

  return playSong(playlist, message, queue, queueConstruct.songs[0], message.guild, ttsLead);
};
