'use strict';

import { Pillar } from "./js/Pillar";
import Player from '../../sdk/Player';
import Point from '../../sdk/Point';
import Stage from '../../sdk/Stage';
import { Waves } from "./js/Waves";
import Constants from "../../sdk/Constants";
import ControlPanel from "../../sdk/ControlPanel";
import { Mager } from "./js/mobs/Mager";
import { Ranger } from "./js/mobs/Ranger";
import { Meleer } from "./js/mobs/Meleer";
import { Blob } from "./js/mobs/Blob";
import { Bat } from "./js/mobs/Bat";

// Create stage
const stage = new Stage("map", 29, 30);

const controlPanel = new ControlPanel();

stage.setControlPanel(controlPanel);
controlPanel.setStage(stage);

// Add pillars
Pillar.addPillarsToStage(stage);

// Add player
const player = new Player(new Point(parseInt(getQueryVar("x")) || 17, parseInt(getQueryVar("y")) || 2));
stage.setPlayer(player);

// Add mobs

// Backwards compatibility layer for runelite plugin
const bat = getQueryVar("bat")
const blob = getQueryVar("blob")
const melee = getQueryVar("melee")
const ranger = getQueryVar("ranger")
const mager = getQueryVar("mager")

if (bat || blob || melee || ranger || mager) {
  stage.wave = "imported";

  (JSON.parse(mager) || []).forEach((spawn) => stage.addMob(new Mager(new Point(spawn[0], spawn[1]))));
  (JSON.parse(ranger) || []).forEach((spawn) => stage.addMob(new Ranger(new Point(spawn[0], spawn[1]))));
  (JSON.parse(melee) || []).forEach((spawn) => stage.addMob(new Meleer(new Point(spawn[0], spawn[1]))));
  (JSON.parse(blob) || []).forEach((spawn) => stage.addMob(new Blob(new Point(spawn[0], spawn[1]))));
  (JSON.parse(bat) || []).forEach((spawn) => stage.addMob(new Bat(new Point(spawn[0], spawn[1]))));
  document.getElementById("replayLink").href = `/${window.location.search}`;

}else{

  // Native approach
  const wave = parseInt(getQueryVar("wave")) || 62;
  const spawns = getQueryVar("spawns") ? JSON.parse(decodeURIComponent(getQueryVar("spawns"))) : Waves.getRandomSpawns();

  Waves.spawn(spawns, wave).forEach(stage.addMob.bind(stage));
  stage.wave = wave;


  const encodedSpawn = encodeURIComponent(JSON.stringify(spawns));
  document.getElementById("replayLink").href = `/?wave=${wave}&x=${player.location.x}&y=${player.location.y}&spawns=${encodedSpawn}`;


}

// Start the engine
stage.startTicking();

const timer = setInterval(() => {
  stage.heldDown--; // Release hold down clamps
  if (stage.heldDown <=0){
    clearInterval(timer);
  }
}, 600)

////////////////////////////////////////////////////////////



document.getElementById("playWaveNum").addEventListener("click", function() {
  window.location = `/?wave=${document.getElementById("waveinput").value || wave}`
});



// UI controls
document.getElementById("soundToggle").addEventListener("click", function() {
  Constants.playsAudio = !Constants.playsAudio;
});

document.getElementById("version").innerHTML = "Version " + process.env.COMMIT_REF + " - " + process.env.BUILD_DATE;

// Helpers
function getQueryVar(varName){
  // Grab and unescape the query string - appending an '&' keeps the RegExp simple
  // for the sake of this example.
  var queryStr = unescape(window.location.search) + '&';

  // Dynamic replacement RegExp
  var regex = new RegExp('.*?[&\\?]' + varName + '=(.*?)&.*');

  // Apply RegExp to the query string
  var val = queryStr.replace(regex, "$1");

  // If the string is the same, we didn't find a match - return false
  return val == queryStr ? false : val;
}