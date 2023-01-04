import { GUI } from "../lib/dat.gui.module.js";
import { Application } from "../common/engine/Application.js";
import { vec3 } from "../lib/gl-matrix-module.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Player } from "./Player.js";
import { Tile } from "./Tile.js";
import { Crop } from "./Crop.js";

class App extends Application {
  constructor(canvas, glOptions) {
    super(canvas, glOptions);
    this.guiData = new Object();

    Object.assign(this.guiData, {
      mapSelection: 55,
    });
  }
  async start() {
    this.loader = new GLTFLoader();
    await this.loader.load("../common/models/textures/untitled.gltf");

    this.scene = await this.loader.loadScene(this.loader.defaultScene);
    this.camera = await this.loader.loadNode("Camera");

    
    this.scene.players = [];
    this.scene.tiles = [];
    this.scene.crops = [];
    
    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }
    
    this.player_model = await this.loader.loadNode("eggplant2");
    this.grass_tile_model = await this.loader.loadNode("tile0");
    this.farm_tile_model = await this.loader.loadNode("tile1");
    this.seed_model = await this.loader.loadNode("seeds");
    this.crops_models = {
      pumpkin: [await this.loader.loadNode("pumpkin0"), await this.loader.loadNode("pumpkin1"), await this.loader.loadNode("pumpkin2")],
      salad: [await this.loader.loadNode("salad0"), await this.loader.loadNode("salad1"), await this.loader.loadNode("salad2")],
      wheat: [await this.loader.loadNode("wheat0"), await this.loader.loadNode("wheat1"), await this.loader.loadNode("wheat2")],
      eggplant: [await this.loader.loadNode("eggplant0"), await this.loader.loadNode("eggplant1"), await this.loader.loadNode("eggplant2")],
      carrot: [await this.loader.loadNode("carrot0"), await this.loader.loadNode("carrot1"), await this.loader.loadNode("carrot2")],
      beetroot: [await this.loader.loadNode("beetroot0"), await this.loader.loadNode("beetroot1"), await this.loader.loadNode("beetroot2")]
    };

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    this.renderer.prepareNode(this.player_model);


    this.resize();

    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );

    this.addPlayer();
    this.n_of_tiles = 4;
    this.addTiles();    
    
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

  addTiles() {    
   const t = 0;
   for(let i = 0; i < this.n_of_tiles; i++) {
    let arr = new Array();
    let crop_arr = new Array();
    for(let j = 0; j < this.n_of_tiles; j++) {      
      let p = new Tile(
        t,
        this.grass_tile_model,
        Object.create([i * 2, 1.45, j * 2]),
        "grass"
      );
      arr.push(p);
      crop_arr.push(null);      
    }
    this.scene.tiles.push(arr);
    this.scene.crops.push(crop_arr);
   }   
  }

  addPlayer() {
    //console.log(this.enemies);
    const t = Object.create(this.player_model.translation);
    let p = new Player(
      t,
      this.player_model
    );
    this.scene.players.push(p);
  }

  enableCamera() {
    this.canvas.requestPointerLock();
  }

  pointerlockchangeHandler() {
    if (!this.camera) {
      return;
    }

    if (document.pointerLockElement === this.canvas) {
      this.camera.enable();
    } else {
      this.camera.disable();
    }
  }

  update() {
    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;
    if (this.scene) {
      if (this.camera) {
        this.camera.update(dt);
      }

      for (const player of this.scene.players) {
        player.update(dt, t);
      }
      
      for (const crop_row of this.scene.crops) {
        for (const crop of crop_row) {
          if (crop != null)
            crop.update();
        }
      }

      //console.log(this.scene.enemies);

      if (this.physics) {
        this.physics.updateMatrix();
      }   
      
      if (this.keys["Space"]) {
        //console.log(parseInt(this.scene.players[0].translation[0]), parseInt(this.scene.players[0].translation[2]));
        let i = Math.round(this.scene.players[0].translation[0] / 2);
        let j = Math.round(this.scene.players[0].translation[2] / 2);
        if(0 <= i && i < this.n_of_tiles && 0 <= j && j < this.n_of_tiles) {
          console.log(i, j);
          if(this.scene.tiles[i][j].type == "grass") {
            let t = 0;
            this.scene.tiles[i][j] = new Tile(
              t,
              this.farm_tile_model,
              Object.create([i * 2, 1.45, j * 2]),
              "farm"
            );
          }
          else if(this.scene.tiles[i][j].type == "farm") {
            let random_type = Object.keys(this.crops_models)[Math.round(Math.random() * (Object.keys(this.crops_models).length - 1))];
            console.log(random_type);
            let t = 0;
            this.scene.crops[i][j] = new Crop(
              t,
              this.seed_model,
              Object.create([i * 2, 1.6, j * 2]),
              random_type,
              this.crops_models[random_type]
            );
          }
          this.keys["Space"] = false;
        }
      }
    }    
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
      if (this.scene.tiles) {
        this.scene.tiles.forEach(row => {
          this.renderer.renderNodeArray(row, this.camera);
        });        
      }

      if (this.scene.crops) {
        let arr = []
        this.scene.crops.forEach(row => {
          row.forEach(element => {
            if(element != null) {
              arr.push(element)
              //this.renderer.renderNode(element, this.camera);
            }
          });          
        });
        this.renderer.renderNodeArray(arr, this.camera);        
      }

      if (this.scene.players) {
        this.renderer.renderNodeArray(this.scene.players, this.camera);
      }
    }

  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const aspectRatio = w / h;

    if (this.camera) {
      this.camera.camera.aspect = aspectRatio;
      this.camera.camera.updateMatrix();
    }
  }
  
  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }

}
window.onload = function () {
  const canvas = document.querySelector("canvas");

  const app = new App(canvas);
  //const gui = new GUI();
  //gui.add(app, "enableCamera");
};



