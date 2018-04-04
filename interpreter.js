const { appEventEmitter } = require('./appEventEmitter');

class Interpreter {
  constructor() {
    this.data = new Map();
  }

  addRecords(records) {
    
  }

  computePlayers() {
    const items = Array.from(this.data.values());
    const playerData = new Map();
    const result = [];
    items.forEach((x) => {
      if (playerData.has(x.playerData))
        playerData.set(item.playerID)
    });
    return result;
  }
}

const interpreter = new Interpreter();

module.exports = interpreter;