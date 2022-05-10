const logger = require('pino')({ prettyPrint: true });

const { DEFAULT_VOLUME } = require('../util/constants');
const Player = require('../util/player');

module.exports = async (params) => {
  const { playlist, message, queue } = params;
  params.source = 'reconnect';
  const queueConstruct = {
    textChannel: message.channel,
    voiceChannel: message.member.voice.channel,
    connection: null,
    songs: playlist.songs,
    messages: [],
    volume: DEFAULT_VOLUME,
    playing: true,
  };

  queue.set(message.guild.id, queueConstruct);

  logger.info('Reconnecting and resuming playlist.');

  return Player.addSong(params);
  //playSong(message, queue, playlist.songs[0], message.guild, ttsLead);
};
