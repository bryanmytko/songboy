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
const { ttsLead } = require('../util/tts');

const playSong = async (message, queue, song, guild, ttsStream) => {
    const serverQueue = queue.get(guild.id);
  
    if(!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return serverQueue.textChannel.send(MSG_QUEUE_EMPTY);
    }

    if(!serverQueue.connection) {
      const connection = await message.member.voice.channel.join();
      serverQueue.connection = connection;
    }
  
    try {
      const foundSong = await ytdl(song.url, { filter: 'audioonly' });
      return serverQueue
        .connection
        .play(ttsStream)
        .on('finish', () => {
          const dispatcher = serverQueue
            .connection
            .play(foundSong)
            .on('finish', async () => {
              logger.info(MSG_FINISHED_PLAYING(song.title));
              const updatedPlaylist = await Playlist
                .findOneAndUpdate({ title: 'default' }, { $pop: { songs: 1 } }, { new: true });
              const ttsStream = await ttsLead(song.requester, song.title);

              playSong(serverQueue.messages[0], queue, updatedPlaylist.songs[0], guild, ttsStream);
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

  module.exports = {
    playSong,
  };