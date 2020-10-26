const { MSG_STOP } = require('../util/messages');

module.exports = async (params) => {
  const { queue, message } = params;
  const serverQueue = queue.get(message.guild.id);

  if (!serverQueue) return;

  serverQueue.textChannel.send(MSG_STOP);
  serverQueue.songs = [];
  serverQueue.voiceChannel.leave();
  queue.delete(message.guild.id);
};
