const { PREFIX } = require('./constants');

module.exports = {
  commandRegex: new RegExp(`^${PREFIX}([^ ]+)\\s*(.*)`, 'i'),
};
