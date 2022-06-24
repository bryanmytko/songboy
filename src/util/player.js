const logger = require('pino')({ prettyPrint: true });
const ytdl = require('ytdl-core');

const {
  MSG_QUEUE_EMPTY,
  MSG_YOUTUBE_ERROR,
  MSG_PLAYING,
  MSG_FINISHED_PLAYING,
} = require('./messages');
const { DEFAULT_VOLUME } = require('../util/constants');
const Playlist = require('../models/playlist');
const Song = require('../models/song');
const { ttsLead } = require('../util/tts');

const playSong = async (message, queue, song, guild, ttsStream) => {
  const { channel } = message.member.voice;
  const serverQueue = queue.get(guild.id);

  if(!channel.joinable) return;

  if(!serverQueue.connection) {
    const connection = await channel.join();
    serverQueue.connection = connection;
  }

  try {
    const foundSong = await ytdl(song.url, { filter: 'audioonly' });
    const ttsStream = await ttsLead(song);

    return serverQueue
      .connection
      .play(ttsStream)
      .on('finish', () => {
        const dispatcher = serverQueue
          .connection
          .play(foundSong)
          .on('finish', async () => {
            logger.info(MSG_FINISHED_PLAYING(song.title));
            await saveHistory(song);
            const updatedPlaylist = await Playlist
              .findOneAndUpdate({ title: 'default' }, { $pop: { songs: -1 } }, { new: true });
            const newSong = updatedPlaylist.songs[0];

            if(newSong){
              const ttsStream = await ttsLead(newSong);
              return playSong(serverQueue.messages[0], queue, newSong, guild, ttsStream);
            }

            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return serverQueue.textChannel.send(MSG_QUEUE_EMPTY);
          })
          .on('error', async (e) => {
            logger.error(MSG_YOUTUBE_ERROR);
            logger.error('Dispatcher error: ', e);
            throw new Error('Dispatcher error!');
          });

        dispatcher.setVolume(DEFAULT_VOLUME);
        serverQueue.textChannel.send(MSG_PLAYING(song.title));
        return serverQueue.textChannel.send('', {
          files: [song.img],
        });
      });
  } catch (e) {
    logger.error(e);
    return serverQueue.textChannel.send(MSG_YOUTUBE_ERROR);
  }
};

const saveHistory = async song => {
  const blacklistSources = ['random'];

  if(blacklistSources.includes(song.source)) return;

  const record = {
    title: song.title,
    url: song.url,
    requester: song.requester,
    date: new Date(),
  };

  const a = await Song.findOneAndUpdate({ url: song.url }, record, { upsert: true });
};



module.exports = {
  playSong,
};
