'use strict';
import _ from 'lodash';
import Constants from "./Constants";
import ControlPanel from './ControlPanel';
import LineOfSight from './LineOfSight';
import Pathing from './Pathing';
import Point from './Point';

export default class Stage {

  constructor(selector, width, height) {
    this.frameCounter = 0;
    this.heldDown = 6;
    this.controlPanel = null;
    this.player = null;
    this.entities = [];
    this.mobs = [];

    this.map = document.getElementById(selector);
    this.ctx = this.map.getContext("2d");
    this.map.width = Constants.tileSize * width;
    this.map.height = Constants.tileSize * height;

    this.grid = document.getElementById("grid");
    this.gridCtx = this.grid.getContext("2d");
    this.grid.width = Constants.tileSize * width;
    this.grid.height = Constants.tileSize * height;
    this.hasCalcedGrid = false;


    this.width = width;
    this.height = height;

    this.map.addEventListener('mousedown', this.mapClick.bind(this));
  }

  getContext() {
    return this.ctx;
  }

  setPlayer(player) {
    this.player = player;
  }

  setControlPanel(controlPanel){
    this.controlPanel = controlPanel;
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    _.remove(this.entities, entity);
  }

  addMob(mob) {
    this.mobs.push(mob);
  }

  removeMob(mob) {
    _.remove(this.mobs, mob);
  }

  startTicking() {
    setInterval(this.gameLoop.bind(this), Constants.tickMs / Constants.framesPerTick); 
  }

  gameLoop() {
    let t = performance.now();
    if (this.frameCounter === 0 && this.heldDown <=0) {
      this.timeBetweenTicks = t - this.lastT;
      this.lastT = t;

      this.player.setPrayers(ControlPanel.controls.PRAYER.getCurrentActivePrayers());

      this.entities.forEach((entity) => entity.tick(this));

      this.mobs.forEach((mob) => mob.movementStep(this));
      this.mobs.forEach((mob) => mob.attackStep(this));

      this.player.movementStep(this);
      this.player.attackStep(this);

      this.tickTime = performance.now() - t;
    }
    let t2 = performance.now();
    this.draw(this.frameCounter / Constants.framesPerTick);
    this.drawTime = performance.now() - t2;
    this.frameCounter++;
    if (this.frameCounter >= Constants.framesPerTick) {
      this.fps = this.frameCounter / this.timeBetweenTicks * 1000;
      this.frameCounter = 0;
    }
    this.frameTime = performance.now() - t;
  }

  mapClick(e) {
    let x = e.offsetX;
    let y = e.offsetY;
    x = Math.floor(x / Constants.tileSize);
    y = Math.floor(y / Constants.tileSize);
    if (x > this.width || y > this.height) { // Can we not go negative?
      return;
    }

    // maybe this should live in the player class? seems very player related in current form.
    this.player.seeking = false;
    const mob = Pathing.collidesWithAnyMobs(this, x, y, 1);
    if (mob) {
      this.player.seeking = mob;
    }else{
      this.player.moveTo(x, y);
    }
  }

  draw(framePercent) {
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = "black";

    this.controlPanel.draw(this);

    if (!this.hasCalcedGrid){
      // This is a GIGANTIC performance improvement ... 
      this.gridCtx.fillRect(0, 0, this.map.width, this.map.height);
      for (var i = 0; i < this.map.width * this.map.height; i++) {
        this.gridCtx.fillStyle = (i % 2) ? "#100" : "#210";
        this.gridCtx.fillRect(
          i % this.width * Constants.tileSize, 
          Math.floor(i / this.width) * Constants.tileSize, 
          Constants.tileSize, 
          Constants.tileSize
        );
      }
      this.hasCalcedGrid = true;
    }

    this.ctx.drawImage(this.grid, 0, 0);
    // Draw all things on the map
    this.entities.forEach((entity) => entity.draw(this, framePercent));

    if (this.heldDown <= 0){
      this.mobs.forEach((mob) => mob.draw(this, framePercent));
    }
    this.player.draw(this, framePercent);
    
    
    // Performance info
    this.ctx.fillStyle = "#FFFF0066";
    this.ctx.font = "16px OSRS";
    this.ctx.fillText(`FPS: ${Math.round(this.fps * 100) / 100}`, 0, 16);
    this.ctx.fillText(`TBT: ${Math.round(this.timeBetweenTicks)}ms`, 0, 32);
    this.ctx.fillText(`TT: ${Math.round(this.tickTime)}ms`, 0, 48);
    this.ctx.fillText(`FT: ${Math.round(this.frameTime)}ms`, 0, 64);
    this.ctx.fillText(`DT: ${Math.round(this.drawTime)}ms`, 0, 80);
    this.ctx.fillText(`Wave: ${this.wave}`, 0, 96);

    if (this.heldDown){

      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "72px OSRS";
      this.ctx.textAlign="center";
      this.ctx.fillText(`GET READY...${this.heldDown}`, this.map.width / 2, this.map.height / 2 - 50);
      this.ctx.textAlign="left";
  
    }
  }
}