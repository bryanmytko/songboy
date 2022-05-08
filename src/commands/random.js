const song = require('./song');
const Song = require('../models/song');

module.exports = async (params) => {
  const count = await Song.countDocuments();
  const randomNumber = Math.floor(Math.random() * count);
  const randomResult = await Song.findOne().skip(randomNumber);

  if(!randomResult) return;

  const newParams = { ...params, input: randomResult.url, source: 'random' };

  song(newParams);
};
