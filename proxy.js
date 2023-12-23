import VelocidroneClient from "./VelocidroneClient.js";

import fs from "node:fs";

const RACEDATAKEYNAME = 'racedata';
const RACESTATUSKEYNAME = 'racestatus';
const RACEACTIONKEYNAME = 'raceaction';

var raceStarted = false;

var pilotDictionary = {};

async function message(data) {
	var jsonString = data.toString();

	if (jsonString.length == 0 || jsonString[0] !== '{') return

	var obj = JSON.parse(jsonString);

	var endpoint = null;

	if (obj[RACEDATAKEYNAME] != null && shouldSend(obj[RACEDATAKEYNAME])) {
		obj = buildRaceDataForSending(obj);
		endpoint = '/racedata';
	}
	else if (obj[RACESTATUSKEYNAME] != null) {
		endpoint = '/racestatus';

		if (obj.racestatus.raceAction == 'start') {
			raceStarted = true;
			pilotDictionary = {};
		}
		else if (obj.racestatus.raceAction == 'abort' || obj.racestatus.raceAction == 'race finished') {
			raceStarted = false;
		}
	}

	if (endpoint) {
		await postMessage(endpoint, JSON.stringify(obj));
	}
}

function buildRaceDataForSending(data) {
	let returnObj = {};
	returnObj[RACEDATAKEYNAME] = {};

	for (let pilotName of Object.keys(data[RACEDATAKEYNAME])) {
		let pilotData = data[RACEDATAKEYNAME][pilotName];

		let shouldSend = shouldSendForPilot(pilotData);

		if (shouldSend == true && pilotDictionaryHasPilot(pilotName) == false) {
			pilotDictionary[pilotName] = createPilot(pilotData, pilotName);
			returnObj[RACEDATAKEYNAME][pilotName] = data[RACEDATAKEYNAME][pilotName];
		}
		else if (shouldSend == true) {
			pilotDictionary[pilotName].times.push(pilotData.time);
			returnObj[RACEDATAKEYNAME][pilotName] = data[RACEDATAKEYNAME][pilotName];
		}
	}

	return returnObj;
}

function shouldSend(data) {
	if (raceStarted == false) {
		return false;
	}

	for (let pilotName of Object.keys(data)) {
		let pilotData = data[pilotName];

		return shouldSendForPilot(pilotData, pilotName);
	}
}

function shouldSendForPilot(pilotData, pilotName) {
	var pilot = getPilotFromDictionary(pilotName);

	return pilot == null || pilot.times[pilot.times.length - 1] != pilotData.time;
}

function getPilotFromDictionary(pilotName) {
	return pilotDictionaryHasPilot(pilotName) == true ? pilotDictionary[pilotName] : null;
}

function pilotDictionaryHasPilot(pilotName) {
	return pilotDictionary.hasOwnProperty(pilotName) == true;
}

function createPilot(pilotData, pilotName) {
	return {
		"name": pilotName,
		"times": [pilotData.time]
	};
}

async function postMessage(url, data) {

	try {
		var res = await fetch('http://127.0.0.1:3000' + url, {
			method: 'POST',
			body: data,
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': '{USERAPIKEY}'
			}
		});
	} catch (error) {
		console.log(error);
	}
}

await VelocidroneClient.initialise("settings.json", message);

//await VelocidroneClient.initialise("settings.json", (data) => {console.log(data.toString());});

// fs.readFile(".\\V1data-test.txt", "utf16le", async (err, d) => {
// 	if (d === undefined) { return; }
// 	let dataRows = d.split(/\r?\n/);

// 	for (let row in dataRows) {
// 		message(dataRows[row].toString());
// 	}
// });