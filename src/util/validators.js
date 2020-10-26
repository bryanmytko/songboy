const { ACCEPTED_CHANNELS, PREFIX } = require('./constants');
const { MSG_INVALID_CHANNEL } = require('./messages');
const randomImage = require('./random_image');

const validMessage = (message) => {
  if (!message.content.startsWith(PREFIX)) return false;

  if (!ACCEPTED_CHANNELS.includes(message.channel.name)) {
    message
      .channel
      .send(MSG_INVALID_CHANNEL, { files: [randomImage()] });

    return false;
  }

  return true;
};

const validVoiceChannel = (message) => message
  && message.member
  && message.member.voice
  && message.member.voice.channel;

module.exports = {
  validMessage,
  validVoiceChannel,
};
