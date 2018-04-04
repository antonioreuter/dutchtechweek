const { appEventEmitter, CHANGE_DATA_EVENT, CHANGE_DATA_SCREEN_EVENT, CHANGE_DATA_LAMPS_EVENT } = require('./appEventEmitter');
const config = require('./config.json');

class Interpreter {
  constructor() {
    this.data = new Map();
  }

  addRecords(records) {
    const oldSize = this.data.size;
    records.forEach((x) => {
      this.data.set(x.id, x);
    });
    const currentSize = this.data.size;
    if (oldSize !== currentSize) {
      const playerPayload = this.computePlayers();
      const screenPayload = playerPayload.map(x => ({
        playerID: x.playerID,
        data: {
          bpm: `${x.data.bpm} bpm`,
          spo2: `${x.data.spo2}%`
        }
      }));
      const lightPayload = playerPayload.map(x => ({
        playerID: x.playerID,
        lightBulbID: '',
        data: x.data
      }));
      appEventEmitter.emit(CHANGE_DATA_EVENT, Array.from(this.data.values()));
      appEventEmitter.emit(CHANGE_DATA_SCREEN_EVENT, screenPayload);
      appEventEmitter.emit(CHANGE_DATA_LAMPS_EVENT, lightPayload);
    }
  }

  computePlayers() {
    const items = Array.from(this.data.values());
    const playerData = new Map();
    const result = [];
    items.forEach((x) => {
      if (!playerData.has(x.playerID)) {
        playerData.set(x.playerID, x);
      } else {
        const currentLatest = playerData.get(x.playerID);
        if (currentLatest.timestamp < x.timestamp) {
          playerData.set(x.playerID, x);
        }
      }

    });
    return Array.from(playerData.values());
  }
}

const interpreter = new Interpreter();

module.exports = interpreter;