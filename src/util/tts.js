const textToSpeech = require('@google-cloud/text-to-speech');
const { Readable } = require('stream');

const { TTS_LEADS } = require('./messages');
const { VOICES } = require('./constants');

const client = new textToSpeech.TextToSpeechClient();
const voicesPref = [26, 28, 39, 42];

const ttsLead = async (message, song) => {
  const name = message.author.username || '';
  const leads = TTS_LEADS(song, name);
  const text = leads[Math.floor(Math.random() * leads.length)];

  const request = {
    input: { text },
    voice: VOICES[voicesPref[Math.floor(Math.random() * voicesPref.length)]],
    audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
  };

  const [response] = await client.synthesizeSpeech(request);
  const stream = new Readable();
  stream.push(response.audioContent);
  stream.push(null);

  return stream;
};

/* @TODO Refactor this / DRY it out */
const ttsReconnectLead = async () => {
  const request = {
    input: { text: 'Holy shit, I just reconnected and boy are my arms tired.' },
    voice: VOICES[voicesPref[Math.floor(Math.random() * voicesPref.length)]],
    audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
  };

  const [response] = await client.synthesizeSpeech(request);
  const stream = new Readable();
  stream.push(response.audioContent);
  stream.push(null);

  return stream;
}

module.exports = {
  ttsLead,
  ttsReconnectLead
};
