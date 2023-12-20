import VelocidroneClient  from "./VelocidroneClient.js";
import * as http from 'http'

import fs from "node:fs";

const RACEDATAKEYNAME = 'racedata';
const RACESTATUSKEYNAME = 'racestatus';
const RACEACTIONKEYNAME = 'raceaction';

var raceStarted = false;

async function message(data){
    var jsonString = data.toString();
    
    if (jsonString.length == 0) return

    var obj = JSON.parse(jsonString);

    var endpoint = null;

    if (obj[RACEDATAKEYNAME] != null && raceStarted == true) {
        endpoint = '/racedata';
    }
    else if (obj[RACESTATUSKEYNAME] != null) {
        endpoint = '/racestatus';

        if(obj.racestatus.raceAction == 'start') {
            raceStarted = true;
        }
        else if(obj.racestatus.raceAction =='abort' || obj.racestatus.raceAction == 'race finished') {
            raceStarted = false;
        }
    }

    if (endpoint){
        await postMessage(endpoint, JSON.stringify(obj));
    }
}

async function postMessage (url, data) {
   
    try {
        var res = await fetch('http://127.0.0.1:3000' + url, {
            method: 'POST',
            body: data,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': '{USERAPIKEY}'
            }
        });
    } catch(error) {
        console.log(error);
    }
}

await VelocidroneClient.initialise("settings.json", message);

//await VelocidroneClient.initialise("settings.json", (data) => {console.log(data.toString());});

// fs.readFile("./VelocidroneWebApp/crashvelocidronetest.txt",  "utf8", async (err, d) => {
//     let dataRows = d.split(/\r?\n/);
//     for (let row in dataRows)
//     {
//         var json = dataRows[row].toString();
        
//         if (json.length == 0) return

//         var data = JSON.parse(json);

//         var endpoint = null;

//         if (data[RACEDATAKEYNAME] != null) {
//             endpoint = '/racedata';
//         }
//         else if (data[RACESTATUSKEYNAME] != null) {
//             endpoint = '/racestatus';
//         }
//         else if (data["racetype"] != null) {
//             endpoint = '/racetype';
//         }

//         if (endpoint){
//             await postMessage(endpoint, JSON.stringify(data));
//         }
//     }

// });