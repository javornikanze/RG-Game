import { Node } from "./Node.js";

export class WaterParticle extends Node {
  constructor(options, model, t) {
    super(options);
    let s = Math.random() * 0.02 + 0.01;
    this.scale = [s, s, s];
    this.mesh = model.mesh;
    this.translation = t;
    this.delete_time = Date.now() + Math.random() * 1000;
    this.updateMatrix();
    this.down = true;
    this.x = Math.random() - 0.5;
    this.z = Math.random() - 0.5;
    this.y = 2;
  }

  update(dt) { 
    if(this.down)
        this.translation[1] -= this.y * dt;
    else 
        this.translation[1] += this.y * dt;
        this.y -= 0.1;
    
    this.translation[0] += this.x * dt;
    this.translation[2] += this.z * dt;

    if(this.translation[1] < 1.5) {
        this.down = false;
    }
    this.updateMatrix();
  }

}