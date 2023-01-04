import { Node } from "./Node.js";

export class Tile extends Node {
  constructor(options, enemies, t, type) {
    super(options);
    this.type = type;
    this.scale = enemies.scale;
    this.mesh = enemies.mesh;
    this.translation = t;

    this.updateMatrix();
  }

}
