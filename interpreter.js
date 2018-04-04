const { appEventEmitter, CHANGE_DATA_EVENT, START_QUERY_DATA_EVENT, GAME_STOPPED, GAME_OVER, STOP_COUNTDOWN_EVENT, START_COUNTDOWN_EVENT, INIT_BMP_EVENT } 
  = require('./appEventEmitter');
const lightUtils = require('./lightUtils');
const control = require('./control');
const config = require('./config.json');

class Interpreter {
  constructor() {
    this.data = new Map();
    this.initialHeartbeat = new Map();
    this.isQueryingData = false;
    appEventEmitter.on(START_COUNTDOWN_EVENT, () => {
      this.data.clear();
    });
    appEventEmitter.on(STOP_COUNTDOWN_EVENT, () => {
      this.setInitialHeartbeat();
    });
    appEventEmitter.on(START_QUERY_DATA_EVENT, () => {
      this.data.clear();
      this.isQueryingData = true;
    });
    appEventEmitter.on(GAME_STOPPED, () => {
      this.data.clear();
      this.isQueryingData = false;
    });
    appEventEmitter.on(GAME_OVER, () => {
      this.data.clear();
      this.isQueryingData = false;
    });
  }

  addRecords(records) {
    const oldSize = this.data.size;
    records.forEach((x) => {
      this.data.set(x.id, x);
    });
    const currentSize = this.data.size;
    if (oldSize !== currentSize) {
      if (this.isQueryingData) {
        const playerPayload = this.getLatestPlayerData();
        const payload = playerPayload.map(x => ({
          playerID: x.playerID,
          lightBulbID: this.findLightBulbID(x.playerID),
          color: lightUtils.calculateHueColorNumber(this.getInitialHeartbeat(x.playerID), x.data.bpm),
          data: {
            bpm: `${Math.round(x.data.bpm)}`,
            spo2: `${Math.round(x.data.spo2)}%`
          }
        }));
        const winners = payload.filter(x => x.color === 0);
        appEventEmitter.emit(CHANGE_DATA_EVENT, payload);
        if (winners.length > 0) {
          control.stop(GAME_OVER, winners);
        }
      }
    }
  }

  setInitialHeartbeat() {
    this.initialHeartbeat = this.computeInitialHeartbeat();
    const result = Array.from(this.initialHeartbeat.values());
    appEventEmitter.emit(INIT_BMP_EVENT, result);
    console.log('Initial heartbeat', result);
  }

  getInitialHeartbeat(playerID) {
    return this.initialHeartbeat.has(playerID) ? this.initialHeartbeat.get(playerID).averageBPM : 0;
  }

  findLightBulbID(playerID) {
    for (let i = 0; i < config.players.length; i++) {
      let player = config.players[i];
      if (player.id === playerID) {
        return player.lightBulbID;
      }
    }
    return -1;
  }

  computeInitialHeartbeat() {
    const items = Array.from(this.data.values());
    const playerData = new Map();
    items.forEach((x) => {
      if (!playerData.has(x.playerID)) {
        playerData.set(x.playerID, {
          sum: x.data.bpm,
          n: 1,
          minBPM: x.data.bpm,
          maxBPM: x.data.bpm          
        });
      } else {
        const current = playerData.get(x.playerID);
        playerData.set(x.playerID, {
          sum: current.sum + x.data.bpm,
          n: current.n + 1,
          minBPM: Math.min(x.data.bpm, current.minBPM),
          maxBPM: Math.max(x.data.bpm, current.maxBPM)          
        });
      }

    });
    const result = new Map();
    playerData.forEach((value, key) => {
      result.set(key, {
        playerID: key,
        averageBPM: value.sum / value.n,
        minBPM: value.minBPM,
        maxBPM: value.maxBPM
      })
    });
    return result;
  }

  getLatestPlayerData() {
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