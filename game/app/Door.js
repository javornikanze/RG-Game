import { Node } from "./Node.js";

export class Door extends Node {
  constructor(options, model, t) {
    super(options);
    this.scale = model.scale;
    this.mesh = model.mesh;
    this.translation = t;

    this.updateMatrix();
  }

}
