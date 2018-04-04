'use strict'

const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;

let mainWindow;

app.commandLine.appendSwitch('remote-debugging-port', '8315')
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1')

app.on('ready', () => {
    mainWindow = new BrowserWindow({ width: 1000, height: 800, backgroundColor: '#CCCCCC' });
    mainWindow.loadURL(`file://${__dirname}/mainWindow.html`);

    
    mainWindow.on('closed', () => {
        app.quit();
    });
});


