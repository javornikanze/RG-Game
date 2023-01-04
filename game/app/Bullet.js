import { vec3, quat } from "../lib/gl-matrix-module.js";
import { Node } from "./Node.js";

export class Bullet extends Node {
  constructor(options, id, enemy, bullets, loc) {
    super(options);
    this.id = id;
    this.bullets = bullets;
    this.translation = options;
    this.loc = loc;
    this.scale = bullets[loc].scale;
    this.mesh = bullets[loc].mesh;
    this.enemy = enemy;
    this.speed = 600;
    this.justSpawned = true;
    this.updateMatrix();
  }

  collision(enemies) {
    let razdalja = 0.2;
    let tmp_razdalja;
    const element = this.enemy;
    tmp_razdalja = vec3.distance(this.translation, element.translation);
    if (tmp_razdalja < razdalja) {
      this.enemy.enemyLvlDown(this.loc);
      return true;
    }
    return false;
  }

  moveToEnemy(dt) {
    let direction = vec3.create();
    let tr = Object.create(this.enemy.translation);
    vec3.sub(direction, this.translation, tr);
    vec3.normalize(direction, direction);
    direction[0] = -direction[0];
    direction[1] = -direction[1];
    direction[2] = -direction[2];
    const velocity = [0, 0, 0];
    let acc = vec3.create();
    vec3.add(acc, acc, direction);

    if (this.justSpawned) {
      vec3.scaleAndAdd(velocity, velocity, acc, dt * 3000);
      this.justSpawned = false;
    } else vec3.scaleAndAdd(velocity, velocity, acc, dt * this.speed);

    vec3.scaleAndAdd(this.translation, this.translation, velocity, dt);
    this.rotateToEnemy(dt);
    this.updateMatrix();
  }

  rotateToEnemy(dt) {
    const enemy = this.enemy;

    if (!enemy) {
      this.target = undefined;
    } else {
      this.target = enemy;
    }
    const TurretDir = [
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    ];

    const EnemyDir = vec3.sub(
      vec3.create(),
      this.translation,
      enemy.translation
    );

    EnemyDir[1] = 0;
    vec3.normalize(EnemyDir, EnemyDir);

    const kot = vec3.angle(TurretDir, EnemyDir);

    this.rotation[1] += kot - Math.PI;

    const newDir = [
      -Math.sin(this.rotation[1]),
      0,
      -Math.cos(this.rotation[1]),
    ];

    const novKot = vec3.angle(newDir, EnemyDir);

    if (0.0001 < kot - novKot) {
      this.rotation[1] -= 2 * (kot - Math.PI);
    }

    quat.fromEuler(
      this.rotation,
      (this.rotation[0] * 180) / Math.PI,
      (this.rotation[1] * 180) / Math.PI,
      (this.rotation[2] * 180) / Math.PI
    );
    this.updateMatrix();
  }
}
