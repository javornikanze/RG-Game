import { mat4, vec3 } from "../lib/gl-matrix-module.js";
import { Utils } from "./Utils.js";
import { Node } from "./Node.js";

export class Camera extends Node {
  constructor(options = {}) {
    super(options);
    this.projection = mat4.create();
    Utils.init(this, this.constructor.defaults, options);
    this.updateProjection();
    //this.mousemoveHandler = this.mousemoveHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

  updateProjection() {
    mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
  }

  update(dt) {
    const c = this;
    const forward = vec3.set(vec3.create(), 0, -1, -1);
    const right = vec3.set(vec3.create(), Math.sqrt(2), 0, 0);

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

    this.updateMatrix();
  }

  /*enable() {
    //document.addEventListener("mousemove", this.mousemoveHandler);
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

  disable() {
    //document.removeEventListener("mousemove", this.mousemoveHandler);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keyup", this.keyupHandler);

    for (let key in this.keys) {
      this.keys[key] = false;
    }
  }*/

  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }
}
