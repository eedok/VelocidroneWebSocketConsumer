import VelocidroneClient  from "./VelocidroneClient.js";

var heatData = [];

function createPilot (pilotData, pilotName) {
    return {"name": pilotName,
            "holeshot": pilotData.time,
            "laps": [pilotData.time],
            "lap": pilotData.lap,
            "finished": pilotData.finished};
  }

function message (data) {
    /*
    //Uncomment this if you want to see raw data from the websocket
    console.log('received: %s', data);
    return;
    */
    
    
    if (data.length == 0) return;

    var raceData = JSON.parse(data);

    if (raceData["racestatus"] != null) {
        console.log(raceData["racestatus"]["raceAction"]);
        if (raceData["racestatus"]["raceAction"] == "start") {
            heatData = [];
        }
    }
    else if (raceData["racedata"] != null) {
        for (let pilotName of Object.keys(raceData["racedata"])) {
            let pilotData = raceData["racedata"][pilotName];
            var pilot = heatData.find(e => e.name == pilotName);

            if (pilot == null) {
                var pilot = createPilot(pilotData, pilotName);
                heatData.push(pilot);
                console.log(`Holeshot ${pilotName} ${pilot.holeshot}`);
            } else {
                if (pilot.lap != pilotData.lap) {
                    pilot.laps.push(pilotData.time);
                    pilot.lap = pilotData.lap;
                    const lapLength = pilot.laps.length;
                    const lapTime = pilot.laps[lapLength - 1] - pilot.laps[lapLength - 2];
                    console.log(`Lap ${pilot.lap -1} ${pilotName} ${lapTime}`);
                }

                if (pilot.finished != pilotData.finished) {
                    pilot.finished = pilotData.finished;
                    pilot.laps.push(pilotData.time);
                    pilot.lap = pilotData.lap;
                    const lapLength = pilot.laps.length;
                    const lapTime = pilot.laps[lapLength - 1] - pilot.laps[lapLength - 2];
                    console.log(`Lap ${pilot.lap} ${pilotName} ${lapTime}`);
                    console.log(`${pilotName} finished in ${pilotData.time}`);
                }
            }
        }
    }
}

await VelocidroneClient.initialise("settings.json", message);