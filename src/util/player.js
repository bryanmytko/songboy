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

const playSong = async (playlist, message, queue, song, guild, ttsStream) => {
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
              playlist.songs.pop();
              await Playlist.findOneAndUpdate({ title: 'default' }, { songs: playlist.songs });
              serverQueue.messages.shift();
              playSong(playlist, serverQueue.messages[0], queue, serverQueue.songs[0], guild);
            })
            .on('error', async (e) => {
              logger.error(MSG_YOUTUBE_ERROR);
              logger.error('Dispatcher error: ', e);
              // playlist.songs.pop();
              // await Playlist.findOneAndUpdate({ title: 'default' }, { songs: playlist.songs });
              // serverQueue.messages.shift();
              playSong(playlist, serverQueue.messages[0], queue, serverQueue.songs[0], guild);
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