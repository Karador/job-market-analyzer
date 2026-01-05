const fs = require('fs');

function appendJsonl(path, objects = []) {
  const stream = fs.createWriteStream(path, { flags: 'a' });

  for (const obj of objects) {
    stream.write(JSON.stringify(obj) + '\n');
  }

  stream.end();
}

module.exports = { appendJsonl };
