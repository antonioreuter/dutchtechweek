'use strict';

const bridgeUsername = "JrzPZjkxV8DitLMIZ4PVWjv2h2KGFvYbKvPjOQBY";

const hue = require("node-hue-api");
const HueApi = hue.HueApi;
const lightState = hue.lightState;

var bridgeIPAddress;

const displayResult = function (result) {
    console.log(JSON.stringify(result, null, 2));
};

const extractBridgeIpAddress = function(bridge) {
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
    bridgeIPAddress = bridge[0].ipaddress;
    console.log("Bridge: " + bridgeIPAddress);
    return bridgeIPAddress;
}

class LampHue {
    constructor() {
        var self = this;
        hue.nupnpSearch().then(extractBridgeIpAddress).then((bridgeIPAddress) => {
            self.bridgeApi = new HueApi(bridgeIPAddress, bridgeUsername);
        }).done();
    }

    emitSignalLampSignal(signalLampBrightness) {
        const state = lightState.create().on().bri(signalLampBrightness);
        this.sendSignal(2, state);
    }

    emitPlayerLampSignal(player, color) {
        const state = lightState.create().on().hue(color).sat(255).bri(30);
        this.sendSignal(player, state);
    }

    colorLoop(lamp) {
        const state = lightState.create().on().bri(100).colorLoop();
        this.sendSignal(lamp, state);
    }

    resetLamp(lamp) {
        const state = lightState.create().off();
        this.sendSignal(lamp, state);
    }

    resetLamps() {
        for (let i = 1; i < 4; i++) {
            this.resetLamp(i);
        }
    }

    sendSignal(lamp, state) {
        this.bridgeApi.setLightState(lamp, state)
            .then(displayResult)
            .done();
    }
}

module.exports = new LampHue();