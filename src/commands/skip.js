const logger = require('pino')({ prettyPrint: true });

const { MSG_SKIP, MSG_SKIP_FAIL } = require('../util/messages');
const Playlist = require('../models/playlist');

module.exports = async params => {
  const { state, message } = params;
  const playlist = await Playlist.findOne({ title: 'default' });

  if(!playlist || !playlist.songs) return;
  if(!playlist.songs.length) return message.channel.send(MSG_SKIP_FAIL);

  const skipped = playlist.songs[0];
  
  try {
    const connection = state.get('connection');

    connection.player.dispatcher.end();
    message.channel.send(MSG_SKIP(skipped.title));
  } catch (e) {
    logger.error(e);
  }
};
