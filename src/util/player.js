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
  MSG_INVALID_VOICE_CHANNEL,
  MSG_YOUTUBE_NOT_FOUND,
  TTS_RANDOM,
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
  }

  async addSong(params) {
    const { input, message, source, queue } = params;
    this.voiceChannel = message.member.voice.channel;

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

    this.play(songObject);
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

  async play(song) {
    const ttsLead = await this.getTTSLead(song);
    const connection = await this.voiceChannel.join();

    return connection.play(ttsLead);
    //   queueConstruct.connection = connection;
    // const playSong = async (message, queue, song, guild, ttsStream) => {

//   if(!serverQueue.connection) {
//     const connection = await message.member.voice.channel.join();
//     serverQueue.connection = connection;
//   }

//   try {
//     const foundSong = await ytdl(song.url, { filter: 'audioonly' });
//     const ttsStream = await ttsLead(song);

//     return serverQueue
//       .connection
//       .play(ttsStream)
//       .on('finish', () => {
//         const dispatcher = serverQueue
//           .connection
//           .play(foundSong)
//           .on('finish', async () => {
//             logger.info(MSG_FINISHED_PLAYING(song.title));
//             await saveHistory(song);
//             const updatedPlaylist = await Playlist
//               .findOneAndUpdate({ title: 'default' }, { $pop: { songs: -1 } }, { new: true });
//             const newSong = updatedPlaylist.songs[0];

//             if(newSong){
//               const ttsStream = await ttsLead(newSong);
//               return playSong(serverQueue.messages[0], queue, newSong, guild, ttsStream);
//             }

//             serverQueue.voiceChannel.leave();
//             queue.delete(guild.id);
//             return serverQueue.textChannel.send(MSG_QUEUE_EMPTY);
//           })
//           .on('error', async (e) => {
//             logger.error(MSG_YOUTUBE_ERROR);
//             logger.error('Dispatcher error: ', e);
//             throw new Error('Dispatcher error!');
//           });

//         dispatcher.setVolume(DEFAULT_VOLUME);
//         serverQueue.textChannel.send(MSG_PLAYING(song.title));
//         return serverQueue.textChannel.send('', {
//           files: [song.img],
//         });
//       });
//   } catch (e) {
//     logger.error(e);
//     return serverQueue.textChannel.send(MSG_YOUTUBE_ERROR);
//   }
// };
  }




  async saveHistory() {
  //   const blacklistSources = ['random'];

  //   if(blacklistSources.includes(song.source)) return;

  //   const record = {
  //     title: song.title,
  //     url: song.url,
  //     requester: song.requester,
  //     date: new Date(),
  //   };

  //   const a = await Song.findOneAndUpdate({ url: song.url }, record, { upsert: true });
  }

}

module.exports = new Player();


// const playlist = await Playlist.findOne({ title: 'default' });


  // const voiceChannel = message.member.voice.channel;
  // const serverQueue = queue.get(message.guild.id);
  

  // if (!serverQueue) {
  //   const queueConstruct = {
  //     textChannel,
  //     voiceChannel,
  //     connection: null,
  //     messages: [],
  //     volume: DEFAULT_VOLUME,
  //     playing: true,
  //   };

  //   queue.set(message.guild.id, queueConstruct);
  //   await Playlist.findOneAndUpdate({ title: 'default' }, {
  //     songs: [...playlist.songs, song],
  //     message: {
  //       channel: message.channel,
  //       guild: {
  //         id: message.guild.id,
  //       },
  //       member: {
  //         voice: {
  //           channel: message.member.voice.channel,
  //         }
  //       }
  //     }
  //   });
  //   queueConstruct.messages.push(message);

  //   const connection = await voiceChannel.join();
  //   queueConstruct.connection = connection;

  //   return playSong(message, queue, song, message.guild);
  // }

  // playlist.songs.push(song);
  // await Playlist.findOneAndUpdate({ title: 'default' }, {
  //   songs: playlist.songs,
  //   message: {
  //     channel: message.channel,
  //     guild: {
  //       id: message.guild.id,
  //     },
  //     member: {
  //       voice: {
  //         channel: message.member.voice.channel,
  //       }
  //     }
  //   }
  // });
  // serverQueue.messages.push(message);
  // return message.channel.send(MSG_ADDED_TO_QUEUE(song.title));