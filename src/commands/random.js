const Player = require('../util/player');
const Song = require('../models/song');
const { validVoiceChannel } = require('../util/validators');  
const { MSG_INVALID_VOICE_CHANNEL } = require('../util/messages');

module.exports = async (params) => {
  const { message } = params;
  const textChannel = message.channel;

  if (!validVoiceChannel(message)) return textChannel.send(MSG_INVALID_VOICE_CHANNEL);

  const count = await Song.countDocuments();
  const randomNumber = Math.floor(Math.random() * count);
  const randomResult = await Song.findOne().skip(randomNumber);

  if(!randomResult) return;

  return Player.addSong({
    ...params,
    author: { username: randomResult.requester },
    input: randomResult.url,
    source: 'random',
  });
};
