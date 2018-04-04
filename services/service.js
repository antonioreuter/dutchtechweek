const TDRService = require('./tdrService');

class Service {
  constructor(config) {
    this.config = Object.assign({}, config);
  }

  query(startTimeMS, endTimeMS) {
    return Promise.reject('Please define the query function');
  }
}

const createService = (serviceConfig) => {
  if (serviceConfig.type === 'tdr') {
    return new TDRService(serviceConfig);
  }
  throw Error("Unknown service type");
};

module.exports = {
  Service,
  createService,
}