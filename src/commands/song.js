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

const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();

const playSong = async (message, queue, song, guild) => {
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
            serverQueue.messages.shift();
            playSong(serverQueue.messages[0], queue, serverQueue.songs[0], guild);
          })
          .on('error', (e) => {
            logger.error(MSG_YOUTUBE_ERROR);
            logger.error('Dispatcher error: ', e);
            serverQueue.songs.shift();
            serverQueue.messages.shift();
            playSong(serverQueue.messages[0], queue, serverQueue.songs[0], guild);
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
  const { queue, message, input } = params;
  const textChannel = message.channel;

  if (!validVoiceChannel(message)) return textChannel.send(MSG_INVALID_VOICE_CHANNEL);

  const voiceChannel = message.member.voice.channel;
  const serverQueue = queue.get(message.guild.id);
  const cleanParams = sanitizeParams(input);
  let results;

  try {
    /* DMX */
    const dmxSongs = [
      'DMX where the hood at',
      'DMX what these bitches want',
      'DMX ruff ryders anthem',
      'DMX party up',
      'DMX we right here',
      'DMX the rain',
      'DMX slippin',
      'DMX limp bizkit',
      'DMX here we go again',
      'DMX money cahs hoes',
      'DMX stop being greedy',
      'DMX grand finale',
      'DMX its all good',
      'DMX get at me dog',
      'DMX whats my name',
      'DMX x gon give it to ya',
      'DMX how its goin down',
      'DMX one more road to cross',
      'DMX get it on the floor',
      'DMX damien',
      'DMX who we be',
      'DMX no love for me',
      'DMX blackout',
    ];

    const dmxSong = dmxSongs[Math.floor(Math.random() * dmxSongs.length)];

    results = await youtube.searchVideos(`${dmxSong} lyrics`, 1);
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
      songs: [],
      messages: [],
      volume: DEFAULT_VOLUME,
      playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);
    queueConstruct.messages.push(message);

    const connection = await voiceChannel.join();
    queueConstruct.connection = connection;

    return playSong(message, queue, queueConstruct.songs[0], message.guild);
  }

  serverQueue.songs.push(song);
  serverQueue.messages.push(message);
  return message.channel.send(MSG_ADDED_TO_QUEUE(song.title));
};
