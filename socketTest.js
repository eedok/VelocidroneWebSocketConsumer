'use strict';

import fs from "node:fs";
import WebSocket from 'ws';

var currentHeatData = [];

fs.readFile("settings.json", "utf-8", (err, data) => {

  if (err) {
    console.error(err);
    return;
  }

  var settings = JSON.parse(data);

  const ws = new WebSocket(`ws://${settings.localIP}:60003/velocidrone`);
  
  function heartBeat()
  {
    ws.send("");
    setTimeout(heartBeat, 10000);
  }

  ws.on('error', console.error);

  ws.on('open', function open() {
    console.log("connected");
    heartBeat();
  });

  ws.on('message', function message(data) {
    /*
    //Uncomment this block if you just want to see the raw websocket data
    console.log('received: %s', data);
    return;
    */
    if(data.length == 0) return;
    var raceData = JSON.parse(data);
    if(raceData["racestatus"] != null) {
      if(raceData["racestatus"]["raceAction"] == "start")
      {
        console.log("start new race");
        currentHeatData = [];
      }
    }
    else if(raceData["racedata"] != null){
      for(let pilotName of Object.keys(raceData["racedata"]))
      {
        let pilotData = raceData["racedata"][pilotName];
        var pilot = currentHeatData.find(e => e.name == pilotName);
        if(pilot == null) {
          var pilot = {"name": pilotName,
                      "holeshot": pilotData.time,
                      "laps": [pilotData.time],
                      "lap": pilotData.lap,
                      "finished": pilotData.finished};
          currentHeatData.push(pilot);
          console.log(`Holeshot ${pilotName} ${pilot.holeshot}`);
        } else {
          if(pilot.lap != pilotData.lap) {
            pilot.laps.push(pilotData.time);
            pilot.lap = pilotData.lap;
            const lapLength = pilot.laps.length;
            const lapTime = pilot.laps[lapLength - 1] - pilot.laps[lapLength - 2];
            console.log(`Lap ${pilotName} ${lapTime}`);
          }
          if(pilot.finished != pilotData.finished){
            pilot.finished = pilotData.finished;
            pilot.laps.push(pilotData.time);
            pilot.lap = pilotData.lap;
            const lapLength = pilot.laps.length;
            const lapTime = pilot.laps[lapLength - 1] - pilot.laps[lapLength - 2];
            console.log(`Lap ${pilotName} ${lapTime}`);
            console.log(`${pilotName} finished in ${pilotData.time}`);
          }
        }
      }
    } else {
      // console.log('received: %s', data);
    }
  });

  ws.on("close", function finished(code, reason) {
    console.log("closed: %s", reason)
  })

});