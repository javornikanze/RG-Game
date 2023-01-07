import { Node } from "./Node.js";

export class Crop extends Node {
  constructor(options, model, t, type, models) {
    super(options);
    this.type = type;
    this.scale = model.scale;
    this.mesh = model.mesh;
    this.translation = t;
    this.models = models;
    this.spawn_time = Date.now();
    this.state = 0;
    this.updateMatrix();
    this.random_update_time = Math.random() * 5000 + 1000;    
  }

  update() {
    if(Date.now() - this.spawn_time > this.random_update_time && this.state <= 2) {
        this.spawn_time = Date.now();        
        this.mesh = this.models[this.state].mesh;
        this.scale = this.models[this.state].scale;
        this.state += 1;    
        this.updateMatrix();
    }
  }
}
