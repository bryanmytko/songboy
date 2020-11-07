const textToSpeech = require('@google-cloud/text-to-speech');
const { Readable } = require('stream');

const { TTS_LEADS } = require('./messages');

const client = new textToSpeech.TextToSpeechClient();

const ttsLead = async (message, song) => {
  const name = message.author.username;
  const leads = TTS_LEADS(song, name);
  const text = leads[Math.floor(Math.random() * leads.length)];

  const request = {
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  const stream = new Readable();
  stream.push(response.audioContent);
  stream.push(null);

  return stream;
};

module.exports = {
  ttsLead,
};
