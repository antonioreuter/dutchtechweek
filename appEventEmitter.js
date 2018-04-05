const EventEmitter = require('events');

const START_QUERY_DATA_EVENT = 'START_QUERY_DATA_EVENT';
const GAME_STOPPED = 'GAME_STOPPED';
const GAME_OVER = 'GAME_OVER';
const CHANGE_DATA_EVENT = 'CHANGE_DATA_EVENT';
const START_COUNTDOWN_EVENT = 'START_COUNTDOWN_EVENT';
const STOP_COUNTDOWN_EVENT = 'STOP_COUNTDOWN_EVENT';
const UPDATE_COUNTDOWN_EVENT = 'UPDATE_COUNTDOWN_EVENT';
const INIT_BMP_EVENT = 'INIT_BMP_EVENT';
const WINNER_FOUND_EVENT = 'WINNER_FOUND_EVENT';

class AppEventEmitter extends EventEmitter {}

const appEventEmitter = new AppEventEmitter();

module.exports = {
  appEventEmitter,
  START_QUERY_DATA_EVENT,
  GAME_STOPPED,
  GAME_OVER,
  CHANGE_DATA_EVENT,
  START_COUNTDOWN_EVENT,
  STOP_COUNTDOWN_EVENT,
  UPDATE_COUNTDOWN_EVENT,
  INIT_BMP_EVENT,
  WINNER_FOUND_EVENT
};