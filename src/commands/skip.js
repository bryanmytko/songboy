const skipSong = async function(serverQueue) {
  if(!serverQueue) return;
  if(!serverQueue.songs.length) serverQueue.textChannel.send('No songs to skip. Queue is empty!');

  try {
    serverQueue.textChannel.send(`SongBot is skipping "${serverQueue.songs[0].title}".`);
    serverQueue.connection.dispatcher.end();
  } catch(e) {
    console.log(e);
  }
}
