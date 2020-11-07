const ytdl = require('ytdl-core');
const logger = require('pino')({ prettyPrint: true });
const YouTube = require('simple-youtube-api');
const Entities = require('html-entities').XmlEntities;

const {
  MSG_ADDED_TO_QUEUE, MSG_INVALID_VOICE_CHANNEL, MSG_QUEUE_EMPTY,
  MSG_YOUTUBE_ERROR, MSG_PLAYING, MSG_FINISHED_PLAYING,
} = require('../util/messages');
const { DEFAULT_VOLUME, YOUTUBE_WATCH_URL } = require('../util/constants');
const { sanitizeParams } = require('../util/sanitizers');
const { validVoiceChannel } = require('../util/validators');
const { ttsLead } = require('../util/tts');

const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();

const playSong = async (message, queue, song) => {
  const { guild } = message;
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
          .on('finish', () => {
            logger.info(MSG_FINISHED_PLAYING(song.title));
            serverQueue.songs.shift();
            playSong(message, queue, serverQueue.songs[0]);
          })
          .on('error', (e) => {
            logger.error(MSG_YOUTUBE_ERROR);
            logger.error('Big ERROR', e);
            serverQueue.songs.shift();
            playSong(message, queue, serverQueue.songs[0]);
          });

        dispatcher.setVolume(DEFAULT_VOLUME);
        serverQueue.textChannel.send(MSG_PLAYING(song.title));
        return serverQueue.textChannel.send('', {
          files: [song.img],
        });
      });
  } catch (e) {
    logger.error(MSG_YOUTUBE_ERROR);
    logger.error(e);

    return playSong(message, queue, song); // Try again?
  }
};

module.exports = async (params) => {
  const { queue, message, input } = params;
  const textChannel = message.channel;

  if (!validVoiceChannel(message)) return textChannel.send(MSG_INVALID_VOICE_CHANNEL);

  const voiceChannel = message.member.voice.channel;
  const serverQueue = queue.get(message.guild.id);
  const cleanParams = sanitizeParams(input);
  const results = await youtube.searchVideos(cleanParams, 1);

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
      songs: [],
      volume: DEFAULT_VOLUME,
      playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const connection = await voiceChannel.join();
    queueConstruct.connection = connection;

    return playSong(message, queue, queueConstruct.songs[0]);
  }

  serverQueue.songs.push(song);
  return message.channel.send(MSG_ADDED_TO_QUEUE(song.title));
};
