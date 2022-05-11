const Player = require('../util/player');
const { validVoiceChannel } = require('../util/validators');  
const { MSG_INVALID_VOICE_CHANNEL } = require('../util/messages');

module.exports = async params => {
  const { message } = params;
  if (!validVoiceChannel(message)) return message.channel.send(MSG_INVALID_VOICE_CHANNEL);

  return Player.addSong({ ...params, source: 'request' });
};
