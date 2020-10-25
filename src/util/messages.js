module.exports = {
  MSG_NON_VALID_URL: 'That does not seem to be a valid URL pogChamp. Searching anyway...',
  MSG_CONNECTED: 'Song Boy has connected!',
  MSG_DISCONNECTED: 'Song Boy has been disconnected. This is probably not a good thing.',
  MSG_INVALID_COMMAND: (command) => `:skull: That is not a valid command: \`!${command}\` :skull:`,
  MSG_INVALID_CHANNEL: 'Try using one of the acceptable Song Boy channels!',
  MSG_INVALID_VOICE_CHANNEL: ':speak_no_evil: You need to be in a Song Boy voice channel to hear music.',
  MSG_ADDED_TO_QUEUE: (song) => `"${song}" added to the queue.`,
  MSG_QUEUE_EMPTY: 'Queue is empty. Song Boy is out of music :frowning:',
  MSG_FINSIHED_PLAYING: (song) => `Finished playing "${song}"`,
  MSG_YOUTUBE_ERROR: 'Something went wrong with YouTube and/or ytdl.',
  MSG_PLAYING: (song) => `Song Boy is playing "${song}"`,
};
