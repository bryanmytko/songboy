const logger = require('pino')({ prettyPrint: true });

const { MSG_SKIP, MSG_SKIP_FAIL } = require('../util/messages');
const Playlist = require('../models/playlist');

module.exports = async params => {
  const { queue, message } = params;
  const playlist = await Playlist.findOne({ title: 'default' });
  const guildId = message.guild.id || playlist.message.guild.id;

  // These don't match, too tired to figure out why
  console.log('guildId:', message.guild.id)
  console.log('second guildId', playlist.message.guild.id)

  /* Sometimes this server queue doesnt exist. Need to think about why.
   -- works on reconnect
   -- does not work on fresh connect ?
   -- or vice versa now... we can use both g.id to just make sure we have a serverQueue object
   but i do want to grok what is actually happening here */
  const serverQueue = queue.get(guildId);
  console.log('server q', serverQueue)

  if(!playlist) return;
  if(!playlist.songs) message.channel.send(MSG_SKIP_FAIL);

  const skipped = playlist.songs.shift();
  /* @TODO bug where playlist gets wiped on a single skip */
  await playlist.save();

  try {
    message.channel.send(MSG_SKIP(skipped.title));
    // @TODO this only exists on a connection where a song was queued. If we reconnect this is lost
    serverQueue.connection.dispatcher.end();
  } catch (e) {
    logger.error(e);
  }
};
