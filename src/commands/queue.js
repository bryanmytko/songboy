const listQueue = function(serverQueue) {
  try {
    if(!serverQueue.songs.length) {
      serverQueue.textChannel.send('Queue is empty.');
    } else {
      serverQueue.textChannel.send(`Current queue: \n${serverQueue.songs.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}`);;
    }
  } catch(e) {
    console.log(e);
  }
}
