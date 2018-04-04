const { appEventEmitter, CHANGE_DATA_EVENT } = require('./appEventEmitter');
const lightUtils = require('./lightUtils');
const config = require('./config.json');

class Interpreter {
  constructor() {
    this.data = new Map();
    this.initialHeartbeat = 0;
  }

  addRecords(records) {
    const oldSize = this.data.size;
    records.forEach((x) => {
      this.data.set(x.id, x);
    });
    const currentSize = this.data.size;
    if (oldSize !== currentSize) {
      const playerPayload = this.computePlayers();
      const payload = playerPayload.map(x => ({
        playerID: x.playerID,
        lightBulbID: this.findLightBulbID(x.playerID),
        color: lightUtils.calculateHueColorNumber(this.initialHeartbeat, x.data.bpm),
        data: {
          bpm: `${x.data.bpm} bpm`,
          spo2: `${x.data.spo2}%`
        }
      }));
      appEventEmitter.emit(CHANGE_DATA_EVENT, payload);
    }
  }

  computeInitialHearbeat() {
    this.initialHeartbeat = 0;
    this.data.clear();
  }

  findLightBulbID(playerID) {
    for (let i = 0; i < config.players.length; i++) {
      let item = config.players[i];
      if (item.playerID === playerID) {
        return item.lightBulbID;
      }
    }
    return -1;
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