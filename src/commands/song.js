const ytdl = require('ytdl-core');
const logger = require('pino')({ prettyPrint: true });
const YouTube = require('simple-youtube-api');
const Entities = require('html-entities').XmlEntities;

const {
  MSG_ADDED_TO_QUEUE, MSG_INVALID_VOICE_CHANNEL, MSG_QUEUE_EMPTY,
  MSG_YOUTUBE_ERROR, MSG_YOUTUBE_NOT_FOUND, MSG_PLAYING, MSG_FINISHED_PLAYING,
} = require('../util/messages');
const { DEFAULT_VOLUME, YOUTUBE_WATCH_URL } = require('../util/constants');
const { sanitizeParams } = require('../util/sanitizers');
const { validVoiceChannel } = require('../util/validators');
const { ttsLead } = require('../util/tts');
const Playlist = require('../models/playlist');

const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();

const playSong = async (playlist, message, queue, song, guild) => {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return serverQueue.textChannel.send(MSG_QUEUE_EMPTY);
  }

  try {
    const foundSong = await ytdl(song.url, { filter: 'audioonly' });
    const ttsStream = await ttsLead(message, song.title); // Get a lead in from the "DJ"

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
            playlist.songs.pop();
            await Playlist.findOneAndUpdate({ title: 'default' }, { songs: playlist.songs });
            serverQueue.messages.shift();
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

module.exports = async (params) => {
  const {
    playlist,
    queue,
    message,
    input,
  } = params;
  const textChannel = message.channel;

  if (!validVoiceChannel(message)) return textChannel.send(MSG_INVALID_VOICE_CHANNEL);

  const voiceChannel = message.member.voice.channel;
  const serverQueue = queue.get(message.guild.id);
  const cleanParams = sanitizeParams(input);
  let results;

  try {
    results = await youtube.searchVideos(cleanParams, 1);
  } catch (e) {
    logger.error(e);
    return message.channel.send(MSG_YOUTUBE_ERROR);
  }

  if (Array.isArray(results) && !results.length) {
    return message.channel.send(MSG_YOUTUBE_NOT_FOUND);
  }

  const song = {
    url: `${YOUTUBE_WATCH_URL}${results[0].id}`,
    title: entities.decode(results[0].title),
    img: results[0].thumbnails.high.url,
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel,
      voiceChannel,
      connection: null,
      songs: playlist.songs,
      messages: [],
      volume: DEFAULT_VOLUME,
      playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    playlist.songs.push(song);
    await Playlist.findOneAndUpdate({ title: 'default' }, { songs: playlist.songs });
    queueConstruct.messages.push(message);

    const connection = await voiceChannel.join();
    queueConstruct.connection = connection;

    return playSong(playlist, message, queue, queueConstruct.songs[0], message.guild);
  }

  playlist.songs.push(song);
  await Playlist.findOneAndUpdate({ title: 'default' }, { songs: playlist.songs });
  serverQueue.messages.push(message);
  return message.channel.send(MSG_ADDED_TO_QUEUE(song.title));
};
