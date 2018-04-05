const moment = require('moment');
const config = require('./config.json');
const createService = require('./services/createService');
const lightUtils = require('./lightUtils');
const { appEventEmitter, START_QUERY_DATA_EVENT, GAME_STOPPED, START_COUNTDOWN_EVENT, STOP_COUNTDOWN_EVENT, UPDATE_COUNTDOWN_EVENT, WINNER_FOUND_EVENT, GAME_OVER } = require('./appEventEmitter');

class Control {
  constructor() {
    this.isRunning = false;
    this.intervalID = null;
    this.timeoutID = null;
    this.dataServices = config.services.map(serviceConfig => createService(serviceConfig));
    appEventEmitter.on(WINNER_FOUND_EVENT, (data) => {
      this.stop(GAME_OVER, data);
    });
  }

  resetRequestCounter(subtractionS = 0) {
    this.requestCount = 0;
    this.handledRequestCount = 0;
    const timestamp = moment().subtract(subtractionS, 'seconds');
    this.dataServices.forEach(x => x.resetLastQueryTimestamp(timestamp));
  }

  clearTimeouts() {
    if (this.intervalID !== null) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    }
    if (this.timeoutID !== null) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
    }
  }

  start() {
    if (this.isRunning) {
      console.error('Cannot start the game, game is already running');
    }
    this.isRunning = true;
    this.clearTimeouts();
    setTimeout(() => {
      this.startCountdown();
    }, config.countdownDelayMS);
  }
  
  startCountdown() {
    appEventEmitter.emit(START_COUNTDOWN_EVENT);
    this.resetRequestCounter(5);    
    this.countdownUpdate(moment().valueOf(), config.countdownS + 1);
  }

  countdownUpdate(startTime, lastCount) {
    if (!this.isRunning) {
      return;
    }
    const durationMS = moment().valueOf() - startTime;
    const count = Math.max(0, config.countdownS - Math.floor(durationMS / 1000.0));
    if (count !== lastCount) {
      appEventEmitter.emit(UPDATE_COUNTDOWN_EVENT, {
        count,
        brightness: lightUtils.calculateBrightness(count)
      });
    }
    if (durationMS > config.countdownS * 1000.0) {
      this.stopCountdown();
      return;
    }
    const requestPromises = [];
    this.dataServices.forEach((x) => {
      requestPromises.push(x.query().then(() => Promise.resolve()).catch(() => Promise.resolve()));
    });
    Promise.all(requestPromises)
      .then(() => {
        if (this.isRunning) {
          this.timeoutID = setTimeout(() => {
            this.countdownUpdate(startTime, count);
          }, config.countdownIntervalMS);
        }
      })
      .catch(err => {
        console.error('Huge bullshit has happened');
        this.stopCountdown();
      });
  }

  stopCountdown() {
    if (!this.isRunning) {
      return;
    }
    appEventEmitter.emit(STOP_COUNTDOWN_EVENT);
    setTimeout(() => {
      this.startQuery();
    }, config.countdownDelayMS);
  }

  startQuery() {
    if (!this.isRunning) {
      return;
    }
    appEventEmitter.emit(START_QUERY_DATA_EVENT);
    this.resetRequestCounter();
    this.clearTimeouts();      
    this.invervalID = setInterval(() => {
      this.tick();
    }, config.queryIntervalMS);
  }

  tick() {
    if (!this.isRunning) {
      return;
    }
    this.dataServices.forEach((x) => {
      this.requestCount++;
      x.query()
        .then(() => {
          this.handledRequestCount++;
        })
        .catch(() => {
          this.handledRequestCount++;
        });
    });
  }

  waitForQueries(event = GAME_STOPPED, eventPayload = undefined, limit = 15) {
    setTimeout(() => {
      if (this.handledRequestCount >= this.requestCount || limit <= 0) {
        appEventEmitter.emit(event, eventPayload);
      } else {
        this.waitForQueries(event, eventPayload, limit - 1);
      }
    }, 100);
  }

  stop(event = GAME_STOPPED, eventPayload = undefined) {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    this.clearTimeouts();
    this.waitForQueries(event, eventPayload);
  }
}

const control = new Control();

module.exports = control;