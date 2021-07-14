//TODO: Add 'No user' on unequipping the watch (not on body)
//TODO: Refactor / Separate
import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";

import { display } from "display"; //turned off/on
import { HeartRateSensor } from "heart-rate"; //bpm
import { BodyPresenceSensor } from "body-presence"; //onWrist

import { me as appbit } from "appbit"; //part of using today
import { today } from "user-activity"; //steps, elevation, goals, ...
import { user } from "user-profile"; //resting heart rate, gender, age, bmr, stride, weight, height, ...
//also heartRateZone: Returns: "out-of-range" or "fat-burn" or "cardio" or "peak" or "below-custom" or "custom" or "above-custom"

//GPS
//import { geolocation } from "geolocation";

//Battery
import { battery } from "power";

// Update the clock every minute
clock.granularity = "minutes";

const Console = document.getElementById("console");

// Get a handle on the <text> element
const clockLabel = document.getElementById("clock");
const dateLabel = document.getElementById("date");

const vaultBoy = document.getElementById("vault-boy");

//const latitude = document.getElementById("latitude");
//const longitude = document.getElementById("longitude");
//const heading = document.getElementById("heading");

const lvl = document.getElementById("lvl");

const steps = document.getElementById("steps");
const minutes = document.getElementById("minutes");
const burn = document.getElementById("burn");
const distance = document.getElementById("distance");
const elevation = document.getElementById("elevation");
const rhr = document.getElementById("resting");
const wt = document.getElementById("weight");

const bars = document.getElementsByClassName("v");


// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  clockLabel.text = `${hours}:${mins}`;
}

/*--- Sensors ---*/

const sensors = [];

const hrmData = document.getElementById("heart");

if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    hrmData.text = hrm.heartRate ? hrm.heartRate + " bpm" : 0;
  });
  sensors.push(hrm);
  hrm.start();
} else {
  hrmData.style.display = "{ ... }";
}


//Todo: Condition this with onWrist
if (appbit.permissions.granted("access_activity")) {
  /*--- Today ---*/
  let steps = document.getElementById("steps");
  let minutes = document.getElementById("minutes");
  let burn = document.getElementById("burn");
  let distance = document.getElementById("distance");
  let elevation = document.getElementById("elevation");

  steps.text = today.adjusted.steps + " stp";
  minutes.text = today.adjusted.activeZoneMinutes.total + " min";
  burn.text = today.adjusted.calories + " kcal";
  distance.text = today.adjusted.distance/1000 + " km";
  elevation.text = today.adjusted.elevationGain + " flr";

}

/*--- Is the watch on the creature? ---*/

if (BodyPresenceSensor) {
  console.log("This device has a BodyPresenceSensor!");
  const bodyPresence = new BodyPresenceSensor();
  bodyPresence.addEventListener("reading", () => {
    console.log(`The device is ${bodyPresence.present ? '' : 'not - TODO: Add a no user thing on watch if on while not on'} on the user's body.`);
  });
  bodyPresence.start();
} else {
  console.log("This device does NOT have a BodyPresenceSensor!");
}

/*--- Stop ---*/
display.addEventListener("change", () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
});