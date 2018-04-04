class Service {
  constructor(config) {
    this.config = Object.assign({}, config);
  }

  query(startTimeMS, endTimeMS) {
    return Promise.reject('Please define the query function');
  }
}

module.exports = Service;