const request = require('request');
const moment = require('moment');
const Service = require('./service');
const getToken = require('../iam').getToken;
const interpreter = require('../interpreter');

class TDRService extends Service {
  constructor(config) {
    super(config);
  }

  queryTDR(token) {
    const options = {
      method: 'GET',
      json: true,
      url: `${this.config.url}/DataItem`,
      qs: { 
        organization: this.config.organization,
        dataType: this.config.datatype
      },
      headers: { 
        'cache-control': 'no-cache',
        authorization: `Bearer ${token}`,
        'content-type': '*',
        'api-version': '3' 
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`TDR error, status code: ${response.statusCode}`));
        }

        return resolve(body);
      });
    });
  }

  query(startTimeMS, endTimeMS) {
    return getToken(this.config.iamUrl,this.config.oAuthClient, this.config.oAuthClientPassword,
      this.config.username, this.config.password)
      .then((token) => {
        // console.log('Token: ', token);
        return this.queryTDR(token);
      })
      .then((response) => {
        const resources = response.entry.map(x => x.resource);
        const transformedResources = resources.map(x => ({
          id: x.id,
          playerID: x.device.value,
          timestamp: moment(x.creationTimestamp).unix(),
          data: x.data.data
        }));
        interpreter.addRecords(transformedResources);
        return Promise.resolve();
      })
      .catch((error) => {
        console.error('Error', error);
        return Promise.resolve([]);
      });
  }
}

module.exports = TDRService;