'use strict';

import { readFile } from 'fs/promises';
import WebSocket from 'ws';
import os from 'os';

var VelocidroneClient = {
    ws: {},
    settings: {},

    initialise: async (settingsPath, messageCallback, openCallback, closeCallback, errorCallback) => {
        VelocidroneClient.settings = JSON.parse((await readFile(settingsPath)).toString());
        let ip = VelocidroneClient.settings.localIP;
        if(ip == null) {
            ip = VelocidroneClient.getLocalIpAddress();
        }
        VelocidroneClient.ws = new WebSocket(`ws://${ip}:60003/velocidrone`);

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
    },

    getLocalIpAddress: ()=> {
        const networkInterfaces = os.networkInterfaces();
        let ipAddress = null;
      
        // Iterate through each network interface
        Object.keys(networkInterfaces).forEach((interfaceName) => {
          const interfaces = networkInterfaces[interfaceName];
      
          // Iterate through each interface
          interfaces.forEach((iface) => {
            // Check if the interface is IPv4 and not a loopback
            if (iface.family === 'IPv4' && !iface.internal) {
              ipAddress = iface.address;
            }
          });
        });
      
        return ipAddress;
      }
}

export default VelocidroneClient;