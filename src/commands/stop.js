const stopSong = async function(message, serverQueue) {
  if(!serverQueue) return;

  serverQueue.textChannel.send(`RIP in pieces SongBot...`);
  serverQueue.songs = [];
  serverQueue.voiceChannel.leave();
  queue.delete(message.guild.id);
}
