const logger = require('pino')({ prettyPrint: true });
const YouTube = require('simple-youtube-api');
const Entities = require('html-entities').XmlEntities;

const {
  MSG_ADDED_TO_QUEUE, MSG_INVALID_VOICE_CHANNEL,
  MSG_YOUTUBE_ERROR, MSG_YOUTUBE_NOT_FOUND,
} = require('../util/messages');
const { DEFAULT_VOLUME, YOUTUBE_WATCH_URL } = require('../util/constants');
const { sanitizeParams } = require('../util/sanitizers');
const { validVoiceChannel } = require('../util/validators');
const { playSong } = require('../util/player');
const Playlist = require('../models/playlist');
const { ttsLead } = require('../util/tts');

const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();

module.exports = async params => {
  const {
    queue,
    message,
    input,
  } = params;
  const playlist = await Playlist.findOne({ title: 'default' });
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
    requester: message.author.username,
    url: `${YOUTUBE_WATCH_URL}${results[0].id}`,
    title: entities.decode(results[0].title),
    img: results[0].thumbnails.high.url,
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel,
      voiceChannel,
      connection: null,
      messages: [],
      volume: DEFAULT_VOLUME,
      playing: true,
    };

    queue.set(message.guild.id, queueConstruct);
    await Playlist.findOneAndUpdate({ title: 'default' }, {
      songs: [...playlist.songs, song],
      message: {
        channel: message.channel,
        guild: {
          id: message.guild.id,
        },
        member: {
          voice: {
            channel: message.member.voice.channel,
          }
        }
      }
    });
    queueConstruct.messages.push(message);

    const connection = await voiceChannel.join();
    queueConstruct.connection = connection;

    const ttsStream = await ttsLead(message, song.title); // Get a lead in from the "DJ"

    return playSong(message, queue, song, message.guild, ttsStream);
  }

  playlist.songs.push(song);
  await Playlist.findOneAndUpdate({ title: 'default' }, {
    songs: playlist.songs,
    message: {
      channel: message.channel,
      guild: {
        id: message.guild.id,
      },
      member: {
        voice: {
          channel: message.member.voice.channel,
        }
      }
    }
  });
  serverQueue.messages.push(message);
  return message.channel.send(MSG_ADDED_TO_QUEUE(song.title));
};
