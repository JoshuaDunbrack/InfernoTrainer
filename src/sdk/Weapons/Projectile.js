'use strict';
import chebyshev from "chebyshev";
import { Weapon } from "./Weapon";

export default class Projectile {
  /*
    This should take the player and mob object, and do chebyshev on the size of them
  */
  constructor(damage, from, to, attackStyle, forceSWOnly) {
    this.damage = Math.floor(damage);
    this.fromLocation = from.location;
    this.toLocation = to.location;
    this.distance = 999999;

    if (Weapon.isMeleeAttackStyle(attackStyle)){
      this.distance = 0;
      this.delay = 0;
      return;
    }

    if (forceSWOnly){
      // Things like ice barrage calculate distance to SW tile only
      this.distance = chebyshev([this.fromLocation.x, this.fromLocation.y], [this.toLocation.x, this.toLocation.y]);
    }else{
      for (let yy = 0; yy < to.size; yy++){
        for (let xx = 0; xx < to.size; xx++){
          this.distance = Math.min(this.distance, chebyshev([this.fromLocation.x, this.fromLocation.y], [this.toLocation.x + xx, this.toLocation.y - yy]));
        }  
      }
  
    }    
    this.delay = Math.floor(1 + (3 + this.distance) / 6);
  }
}