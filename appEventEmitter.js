const EventEmitter = require('events');

const START_QUERY_DATA_EVENT = 'start';
const STOP_QUERY_DATA_EVENT = 'stop';
const CHANGE_DATA_EVENT = 'change_data';

class AppEventEmitter extends EventEmitter {}

const appEventEmitter = new AppEventEmitter();

module.exports = {
  appEventEmitter,
  START_QUERY_DATA_EVENT,
  STOP_QUERY_DATA_EVENT,
  CHANGE_DATA_EVENT
};