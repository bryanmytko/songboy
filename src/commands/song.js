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

const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();

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
    queueConstruct.messages.push(message);

    const connection = await voiceChannel.join();
    queueConstruct.connection = connection;

    return playSong(playlist, message, queue, queueConstruct.songs[0], message.guild);
  }

  playlist.songs.push(song);
  await Playlist.findOneAndUpdate({ title: 'default' }, {
    songs: playlist.songs,
    message: {
      author: {
        username: message.author.username,
      },
      channel: message.channel,
      guild: {
        id: message.guild.id,
      },
      member: {
        voice: {
          channel: member.voice.channel,
        }
      }
    }
  });
  serverQueue.messages.push(message);
  return message.channel.send(MSG_ADDED_TO_QUEUE(song.title));
};
