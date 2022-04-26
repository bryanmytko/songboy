const logger = require('pino')({ prettyPrint: true });

const { MSG_SKIP, MSG_SKIP_FAIL } = require('../util/messages');
const Playlist = require('../models/playlist');

module.exports = async params => {
  const { queue, message } = params;
  const playlist = await Playlist.findOne({ title: 'default' });

  if(!playlist) return;
  if(!playlist.songs) return message.channel.send(MSG_SKIP_FAIL);

  const skipped = playlist.songs[0];
  const updated = await Playlist.findOneAndUpdate({ title: 'default' }, { $pop: { songs: -1 } }, { new: true });

  /* Its removing first AND last song. db call returns correct so
    the dispatcher end is removing last song somewhere */  
  try {
   /// for (const value of queue.values()) value.connection.dispatcher.end();
    message.channel.send(MSG_SKIP(skipped.title));
  } catch (e) {
    logger.error(e);
  }
};
