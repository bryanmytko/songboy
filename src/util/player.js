const logger = require('pino')({ prettyPrint: true });
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');
const Entities = require('html-entities').XmlEntities;

const {
  MSG_QUEUE_EMPTY,
  MSG_YOUTUBE_ERROR,
  MSG_PLAYING,
  MSG_FINISHED_PLAYING,
  MSG_ADDED_TO_QUEUE,
  MSG_YOUTUBE_NOT_FOUND,
} = require('./messages');
const { DEFAULT_VOLUME, YOUTUBE_WATCH_URL } = require('../util/constants');
const Playlist = require('../models/playlist');
const Song = require('../models/song');
const { ttsLead, ttsRandom, ttsReconnectLead } = require('../util/tts');
const { sanitizeInput } = require('../util/sanitizers');

const youtube = new YouTube(process.env.GOOGLE_API_KEY);
const entities = new Entities();

class Player {
  constructor () {
    this.voiceChannel;
    this.textChannel;
    this.guildId;
  }

  async addSong(params) {
    const { input, message, source, state } = params;
    this.voiceChannel = message.member.voice.channel;
    this.textChannel = message.channel;
    this.guildId = message.guild.id;

    const { channel, author } = message;
    const requester = (author) ? author.username : '';
    const cleanInput = sanitizeInput(input);

    const songResults = await this.searchSong(cleanInput, channel);
    
    if (Array.isArray(songResults) && !songResults.length) {
      return channel.send(MSG_YOUTUBE_NOT_FOUND);
    }

    const foundSong = songResults[0];
    const songObject = {
      requester,
      url: `${YOUTUBE_WATCH_URL}${foundSong.id}`,
      title: entities.decode(foundSong.title),
      img: foundSong.thumbnails.high.url,
      source,
    };

    this.play(songObject, state);
  }

  async searchSong(input) {
    try {
      return youtube.searchVideos(input, 1);
    } catch (e) {
      logger.error(e);
      channel.send(MSG_YOUTUBE_ERROR);
    }
  }

  async getTTSLead(song) {
    switch(song.source) {
      case 'reconnect':
        return await ttsReconnectLead();
      case 'request':
        return await ttsLead(song);
      case 'random':
        return await ttsRandom(song);
      default:
        // @TODO Should be unreachable, but need something better here.
        return await ttsLead();
    }
  }

  async play(song, state) {
    const ttsLead = await this.getTTSLead(song);
    const audio = await ytdl(song.url, { filter: 'audioonly' });
    const playlist = await Playlist.findOne({ title: 'default' });
    let connection = state.get('connection');

    await Playlist.findOneAndUpdate({ title: 'default' }, {
      songs: [...playlist.songs, song],
      message: {
        channel: this.textChannel,
        guild: {
          id: this.guildId,
        },
        member: {
          voice: {
            channel: this.voiceChannel,
          }
        }
      }
    });

    if (!connection) {
      connection = await this.voiceChannel.join();
      state.set('connection', connection);
    }

    try {
      return connection
        .play(ttsLead)
        .on('finish', () => {
          const dispatcher = connection
            .play(audio)
            .on('finish', async () => {
              logger.info(MSG_FINISHED_PLAYING(song.title));
              await this.saveHistory(song);

              const updatedPlaylist = await Playlist
                .findOneAndUpdate({ title: 'default' }, { $pop: { songs: -1 } }, { new: true });
              const newSong = updatedPlaylist.songs[0];

              if(newSong) return this.play(newSong, state);

              logger.info(MSG_FINISHED_PLAYING(song.title));
              this.voiceChannel.leave();
              return this.textChannel.send(MSG_QUEUE_EMPTY);
            })
            .on('error', async (e) => {
              logger.error(MSG_YOUTUBE_ERROR);
              logger.error('Dispatcher error: ', e);
              throw new Error('Dispatcher error!');
            });

          dispatcher.setVolume(DEFAULT_VOLUME);
          this.textChannel.send(MSG_PLAYING(song.title));
          return this.textChannel.send('', {
            files: [song.img],
          });
        });
    } catch (e) {
      logger.error(e);
      return this.textChannel.send(MSG_YOUTUBE_ERROR);
    }

    if (playlist.songs.length) this.textChannel.send(MSG_ADDED_TO_QUEUE(song.title));

    
  };

  async saveHistory(song) {
    const blacklistSources = ['random'];

    if(blacklistSources.includes(song.source)) return;

    const record = {
      title: song.title,
      url: song.url,
      requester: song.requester,
      date: new Date(),
    };

    await Song.findOneAndUpdate({ url: song.url }, record, { upsert: true });
  }
};

module.exports = new Player();
