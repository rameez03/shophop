const uuidv4 = require('uuid/v4');
const path = require('path');

class Rename {
  constructor(folder) {
    this.folder = folder;
  }
  async save(buffer) {
    const filename = Rename.filename();
    const filepath = this.filepath(filename);
    
    return filename;
  }
  static filename() {
    return `${uuidv4()}.pdf`;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`)
  }
}
module.exports = Rename;