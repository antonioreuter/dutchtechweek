const moment = require('moment');
const config = require('./config.json');
const createService = require('./services/createService');
const { appEventEmitter, START_QUERY_DATA_EVENT, STOP_QUERY_DATA_EVENT } = require('./appEventEmitter');

class Control {
  constructor() {
    this.startTimestamp = moment.unix();
    this.queryTimestamp = moment.unix();
    this.isRunning = false;
    this.intervalID = null;
    this.intervalTimeout = config.queryIntervalMS;
    this.dataServices = config.services.map(serviceConfig => createService(serviceConfig));
    this.publishedMessageCount = 0;
    this.handledMessageCount = 0;
  }

  start() {
    this.startTimestamp = moment.unix();
    this.queryTimestamp = this.startTimestamp;
    this.publishedMessageCount = 0;
    this.handledMessageCount = 0;
    this.isRunning = true;
    appEventEmitter.emit(START_QUERY_DATA_EVENT);
    setInterval(() => {
      this.tick();
    }, this.intervalTimeout);
  }

  tick() {
    if (!this.isRunning) {
      return;
    }
    const endTimestamp = moment.unix();
    this.dataServices.forEach((x) => {
      this.publishedMessageCount++;
      x.query(this.queryTimestamp, endTimestamp)
        .then(() => {
          this.handledMessageCount++;
        })
        .catch(() => {
          this.handledMessageCount++;
        });
    });
    this.queryTimestamp = moment.unix();
  }

  waitForQueries() {
    setTimeout(() => {
      if (this.handledMessageCount >= this.publishedMessageCount) {
        appEventEmitter.emit(STOP_QUERY_DATA_EVENT);
      } else {
        this.waitForQueries();
      }
    }, 100);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalID !== null) {
      clearInterval(this.invervalID);
      this.intervalID = null;
    }
    this.waitForQueries();
  }
}

const control = new Control();

module.exports = control;