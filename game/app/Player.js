import { Node } from "./Node.js";
import { vec3, quat } from "../lib/gl-matrix-module.js";

export class Player extends Node {
  constructor(options, enemies) {
    super(options);
    this.scale = enemies.scale;
    this.mesh = enemies.mesh;
    this.translation = Object.create([11, 2, 7]);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);

    this.updateMatrix();
  }

  rotateToY(angle) {
    quat.fromEuler(
      this.rotation,
      (this.rotation[0] * 180) / Math.PI,
      (angle * 180) / Math.PI,
      (this.rotation[2] * 180) / Math.PI
    );  
    this.updateMatrix();
  }

  update(dt) {   
    
    const c = this;
    const right = vec3.set(vec3.create(), 1, 0, -1);
    const forward = vec3.set(vec3.create(), -1, 0, -1);

    // 1: add movement acceleration
    let acc = vec3.create();
    if (this.keys["KeyW"]) {
      vec3.add(acc, acc, forward);
    }
    if (this.keys["KeyS"]) {
      vec3.sub(acc, acc, forward);
    }
    if (this.keys["KeyD"]) {
      vec3.add(acc, acc, right);
    }
    if (this.keys["KeyA"]) {
      vec3.sub(acc, acc, right);
    }

    // 2: update velocity
    vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

    // 3: if no movement, apply friction
    if (!this.keys["KeyW"] && !this.keys["KeyS"] && !this.keys["KeyD"] && !this.keys["KeyA"]) {
      vec3.scale(c.velocity, c.velocity, 1 - c.friction);
    }

    // 4: limit speed
    const len = vec3.len(c.velocity);
    if (len > c.maxSpeed) {
      vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
    }

    vec3.scaleAndAdd(c.translation, c.translation, c.velocity, dt);

    //console.log(c.velocity);
    
    this.rotateToY(-Math.atan2(c.velocity[2], c.velocity[0]) + Math.PI/2);

    this.updateMatrix();
  }  


  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }
}
