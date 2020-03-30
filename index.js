require('dotenv').config();

const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const Discord = require('discord.js');
const bot = new Discord.Client();

let lock = false;

const QUEUE = [];
const PREFIX = '!song';

bot.on('message', async message => {
  if (!lock) {
    lock = true;
    const voiceChannel = message.member.voice.channel;
    const textChannel = message.channel;

    if(voiceChannel) {
      const msg = message.content;

      if(msg.startsWith('!stop')) {
        // const connection = await voiceChannel.join();
        // const dispatcher = connection.play();
        // dispatcher.pause();
        // dispatcher.destroy();
      }

      if(msg.startsWith(PREFIX)) {
        const searchStr = msg.split(PREFIX)[1].trim();
        const searchResults = await ytsr(searchStr);
        // @TODO check .items[0].duration for less than 10 minutes or something.
        const searchResultUrl = searchResults.items[0].link;

        textChannel.send(`Playing "${searchResults.items[0].title}"`);

        const connection = await voiceChannel.join();
        const foundSong = ytdl(searchResultUrl, { filter: 'audioonly' })
        const dispatcher = connection.play(foundSong);

        dispatcher.resume();
        dispatcher.on('finish', () => {
          console.log('Song done!');
        });
      }
    }

    lock = false;
  }
});

bot.login(process.env.DISCORD_BOT_TOKEN);
