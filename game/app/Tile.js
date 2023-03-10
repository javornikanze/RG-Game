import { Node } from "./Node.js";

export class Tile extends Node {
  constructor(options, model, t, type) {
    super(options);
    this.type = type;
    this.scale = model.scale;
    this.mesh = model.mesh;
    this.translation = t;

    this.updateMatrix();
  }

}
