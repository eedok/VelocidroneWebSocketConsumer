'use strict';

import { readFile } from 'fs/promises';
import WebSocket from 'ws';

var VelocidroneClient = {
    ws: {},
    settings: {},

    initialise: async (settingsPath, messageCallback, openCallback, closeCallback, errorCallback) => {
        VelocidroneClient.settings = JSON.parse((await readFile(settingsPath)).toString());

        VelocidroneClient.ws = new WebSocket(`ws://${VelocidroneClient.settings.localIP}:60003/velocidrone`);

        VelocidroneClient.ws.on('error', console.error);
        if (errorCallback !== undefined) {
            VelocidroneClient.ws.on('error', errorCallback);
        }

        VelocidroneClient.ws.on('open', function open() {
            VelocidroneClient.heartBeat();
            console.log("connected");
        });
        if (openCallback !== undefined){
            VelocidroneClient.ws.on('open', openCallback);
        }

        VelocidroneClient.ws.on("close", function finished(code, reason) {
            console.log("closed: %s", reason)
        })
        if (closeCallback !== undefined){
            VelocidroneClient.ws.on("close", closeCallback);
        }

        VelocidroneClient.ws.on('message', messageCallback);
    },

    heartBeat: () => {
        VelocidroneClient.ws.send("");
        setTimeout(VelocidroneClient.heartBeat, 10000);
    }
}

export default VelocidroneClient;