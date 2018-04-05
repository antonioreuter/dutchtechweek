'use strict'

const electron = require('electron');
const url = require('url');
const path = require('path');
const control = require('./control');
const lampHue = require('./lampHue');
const { appEventEmitter, START_QUERY_DATA_EVENT, GAME_STOPPED, CHANGE_DATA_EVENT, UPDATE_COUNTDOWN_EVENT, GAME_OVER } = require('./appEventEmitter');


const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;

app.commandLine.appendSwitch('remote-debugging-port', '8315')
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')

app.on('ready', () => {
    console.log('Starting the application...');
    mainWindow = new BrowserWindow({ width: 1000, height: 800, backgroundColor: '#CCCCCC' });
    mainWindow.loadURL(`file://${__dirname}/mainWindow.html`);

    
    mainWindow.on('closed', () => {
        console.log('quit! bye, bye...');
        app.quit();
    });
});

ipcMain.on('game:start', (event, val) => {
    console.log('Sending message to START the game...');
    lampHue.resetLamps();
    control.start();
});

ipcMain.on('game:stop', (event, val) => {
    console.log('Sending message to STOP the game...');
    lampHue.resetLamps();
    control.stop();
});


appEventEmitter.on(GAME_OVER, (data) => {
    console.log('Game over');
    const winnerID = data.playerID;
    mainWindow.webContents.send(GAME_OVER, { winner: winnerID });

    lampHue.resetLamps();
    lampHue.colorLoop(data.lightBulbID);
});

appEventEmitter.on(GAME_STOPPED, () => {
    console.log('Game stopped for real this time.');
});


appEventEmitter.on(CHANGE_DATA_EVENT, (data) => {
    console.log(`Updating the screen with the latest data: ${JSON.stringify(data)}`);

    if (data !== undefined) {
        mainWindow.webContents.send('screen:update', data);

        data.forEach(element => {
            lampHue.emitPlayerLampSignal(element.lightBulbID, element.color);
        });
    }
});

appEventEmitter.on(UPDATE_COUNTDOWN_EVENT, (data) => {
    console.log(`Counting down... ${JSON.stringify(data)}`);
    if (data !== undefined) {
        data.count = (data.count !== 0) ? data.count : 'ready';

        mainWindow.webContents.send('screen:countdown', data.count);

        lampHue.emitSignalLampSignal(data.brightness);
    }
});
