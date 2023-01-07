import { GUI } from "../lib/dat.gui.module.js";
import { Application } from "../common/engine/Application.js";
import { vec3 } from "../lib/gl-matrix-module.js";

import { GLTFLoader } from "./GLTFLoader.js";
import { Renderer } from "./Renderer.js";
import { Player } from "./Player.js";
import { Tile } from "./Tile.js";
import { Crop } from "./Crop.js";
import { Door } from "./Door.js";

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

    this.hotbar_selector = document.getElementsByClassName("selector");    
    this.hotbar = [["hoe", 1]];
    this.hotbar_index = 0;
    this.money = 100;

    this.carrot_icon = document.getElementById("carrot_icon");
    this.pumpkin_icon = document.getElementById("pumpkin_icon");
    this.wheat_icon = document.getElementById("wheat_icon");
    this.eggplant_icon = document.getElementById("eggplant_icon");
    this.beetroot_icon = document.getElementById("beetroot_icon");
    this.salad_icon = document.getElementById("salad_icon");
    this.hoe_icon = document.getElementById("hoe_icon");

    this.shop_carrot = document.getElementById("shop_carrot");
    this.shop_pumpkin = document.getElementById("shop_pumpkin");
    this.shop_wheat = document.getElementById("shop_wheat");
    this.shop_eggplant = document.getElementById("shop_eggplant");
    this.shop_beetroot = document.getElementById("shop_beetroot");
    this.shop_salad = document.getElementById("shop_salad");
    this.shop_sell = document.getElementById("sell");
    this.shop_money = document.getElementById("shop_money"); 
    this.ui_money = document.getElementById("money");
    this.ui_money.innerHTML = this.money;
    this.shop = document.getElementById("shop");

    this.shop_carrot.addEventListener('click', (e) => this.buyItem(e, 25));
    this.shop_pumpkin.addEventListener('click', (e) => this.buyItem(e, 50));
    this.shop_wheat.addEventListener('click', (e) => this.buyItem(e, 10));
    this.shop_eggplant.addEventListener('click', (e) => this.buyItem(e, 50));
    this.shop_beetroot.addEventListener('click', (e) => this.buyItem(e, 25));
    this.shop_salad.addEventListener('click', (e) => this.buyItem(e, 10));
    this.shop_sell.addEventListener('click', (e) => this.sellItems(e));


    this.counters = [document.getElementById("c1"), document.getElementById("c2"), document.getElementById("c3"), document.getElementById("c4"), document.getElementById("c5"), document.getElementById("c6"), document.getElementById("c7"), document.getElementById("c8"), document.getElementById("c9")]

    this.shop_bg = document.getElementById("shop_bg");
    
    this.scene.players = [];
    this.scene.tiles = [];
    this.scene.crops = [];
    this.scene.doors = [];
    this.scene.fences = [];
    
    
    if (!this.scene || !this.camera) {
      throw new Error("Scene or Camera not present in glTF");
    }

    if (!this.camera.camera) {
      throw new Error("Camera node does not contain a camera reference");
    }
    
    this.player_model = await this.loader.loadNode("Player0");
    this.grass_tile_model = await this.loader.loadNode("tile0");
    this.farm_tile_model = await this.loader.loadNode("tile1");
    this.seed_model = await this.loader.loadNode("seeds");
    this.door_model = await this.loader.loadNode("Barndoor");
    this.fence_model = await this.loader.loadNode("fence");
    this.fence_model2 = await this.loader.loadNode("fence1");
    this.crops_models = {
      pumpkin: [await this.loader.loadNode("pumpkin0"), await this.loader.loadNode("pumpkin1"), await this.loader.loadNode("pumpkin2")],
      salad: [await this.loader.loadNode("salad0"), await this.loader.loadNode("salad1"), await this.loader.loadNode("salad2")],
      wheat: [await this.loader.loadNode("wheat0"), await this.loader.loadNode("wheat1"), await this.loader.loadNode("wheat2")],
      eggplant: [await this.loader.loadNode("eggplant0"), await this.loader.loadNode("eggplant1"), await this.loader.loadNode("eggplant2")],
      carrot: [await this.loader.loadNode("carrot0"), await this.loader.loadNode("carrot1"), await this.loader.loadNode("carrot2")],
      beetroot: [await this.loader.loadNode("beetroot0"), await this.loader.loadNode("beetroot1"), await this.loader.loadNode("beetroot2")]
    };
    
    this.player_models = [];
    for(let i = 0; i < 8; i++) {
      this.player_models.push(await this.loader.loadNode("Player" + i));
    }

    this.renderer = new Renderer(this.gl);
    this.renderer.prepareScene(this.scene);
    //this.renderer.prepareNode(this.player_model);


    this.resize();

    this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
    document.addEventListener(
      "pointerlockchange",
      this.pointerlockchangeHandler
    );

    this.addPlayer();
    this.n_of_rows = 5;
    this.n_of_columns = 11;
    this.addTiles();
    this.addFences();
    this.addDoor();  
    
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);
    this.keys = {};
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
  }

 

  buyItem(e, cost) {
    let type = e.target.getAttribute('value');
    let found = false;
    for(let i = 0; i < this.hotbar.length; i++) {      
      if(this.hotbar[i][0] == type) {
        if(this.money >= cost) {
          this.hotbar[i][1] += 1;
          found = true;
          this.money -= cost;
          this.ui_money.innerHTML = this.money;
          break;
        }
      }      
    }
    if(!found) {
      if(this.money >= cost) {
        this.hotbar.push([type, 1]);
        this.money -= cost;
        this.ui_money.innerHTML = this.money;

      }
    }
  }

  sellItems() {    
    this.money += parseInt(document.getElementById("shop_money").innerHTML);
    this.hotbar = [["hoe", 1]];
    document.getElementById("money").innerHTML = this.money;
  }

  addTiles() {    
   const t = 0;
   for(let i = 0; i < this.n_of_columns; i++) {
    let arr = new Array();
    let crop_arr = new Array();
    for(let j = 0; j < this.n_of_rows; j++) {      
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

  addTileRow() {    
    const t = 0;
    
    for(let i = 0; i < this.n_of_columns; i++) {
      this.scene.crops[i].push(null);
      this.scene.tiles[i].push(new Tile(
        t,
        this.grass_tile_model,
        Object.create([i * 2, 1.45, (this.n_of_rows- 1) * 2]),
        "grass"
      ));  
    }
  
    }   

    addTileLine() {
      const t = 0;
      let arr = new Array();
      let crop_arr = new Array();
      for(let i = 0; i < this.n_of_rows; i++) {
       arr.push(new Tile(
         t,
         this.grass_tile_model,
         Object.create([(this.n_of_columns - 1) * 2, 1.45, i * 2]),
         "grass"
       ));
       crop_arr.push(null);      
      }        
      this.scene.tiles.push(arr);
      this.scene.crops.push(crop_arr);
    }

  addFences() {    
    const t = 0;
    for(let i = 0; i < this.n_of_rows; i++) {     
       let p = new Tile(
         t,
         this.fence_model2,
         Object.create([-1.1, 1.45, i * 2]),
         "fence",
         [0, 0, 0, 0]
       ); 
       this.scene.fences.push(p); 

       p = new Tile(
        t,
        this.fence_model2,
        Object.create([this.n_of_columns * 2 - 0.85, 1.45, i * 2]),
        "fence",
        [0, 0, 0, 0]
      ); 
      this.scene.fences.push(p); 
    for(let i = 0; i < this.n_of_columns; i++) {  
      let p = new Tile(
        t,
        this.fence_model,
        Object.create([i * 2, 1.45, -1.2]),
        "fence",
        [0, 0, 0, 0]
      ); 
      this.scene.fences.push(p);  

      p = new Tile(
        t,
        this.fence_model,
        Object.create([i * 2, 1.45, this.n_of_rows * 2 - 0.85]),
        "fence",
        [0, 0, 0, 0]
      ); 
      this.scene.fences.push(p); 
      }             
    }     
  }   
   

  addPlayer() {
    const t = Object.create(this.player_model.translation);
    let p = new Player(
      t,
      this.player_model,
      this.player_models
    );
    this.scene.players.push(p);
  }

  addDoor() {
    const t = Object.create(this.door_model.translation);
    let p = new Door(
      t,
      this.door_model,
      Object.create([6, 2.2, 0])
    );
    this.scene.doors.push(p);

    p = new Door(
      t,
      this.door_model,
      Object.create([10, 2.2, 0])
    );
    this.scene.doors.push(p);
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

  openDoors() {
    if (this.scene.doors[0].translation[0] > 5) {
      this.scene.doors[0].translation[0] -= 0.05;
    }
    else {
      this.shop.style.display = "initial";
      let money = 0;
      for(let i = 1; i < this.hotbar.length; i++) {
        switch(this.hotbar[i][0]) {
          case "salad": money += 6 * this.hotbar[i][1]; break;
          case "wheat": money += 6 * this.hotbar[i][1]; break;
          case "beetroot": money += 20 * this.hotbar[i][1]; break;
          case "carrot": money += 20 * this.hotbar[i][1]; break;
          case "eggplant": money += 45 * this.hotbar[i][1]; break;
          case "pumpkin": money += 45 * this.hotbar[i][1]; break;
        }
      }
      this.shop_money.innerHTML = money; 
    }      
    if (this.scene.doors[1].translation[0] < 11) {
      this.scene.doors[1].translation[0] += 0.05;
    }
    this.scene.doors[0].updateMatrix();
    this.scene.doors[1].updateMatrix();
  }

  closeDoors() {
    this.shop.style.display = "none";

    if (this.scene.doors[0].translation[0] < 6) {
      this.scene.doors[0].translation[0] += 0.05;
    }      
    if (this.scene.doors[1].translation[0] > 10) {
      this.scene.doors[1].translation[0] -= 0.05;
    }
    this.scene.doors[0].updateMatrix();
    this.scene.doors[1].updateMatrix();
  }

  update() {   

    const t = (this.time = Date.now());
    const dt = (this.time - this.startTime) * 0.001;
    this.startTime = this.time;
    if (this.scene) {
      if (this.hotbar) {
        this.carrot_icon.style.display = "none";
        this.salad_icon.style.display = "none";
        this.eggplant_icon.style.display = "none";
        this.wheat_icon.style.display = "none";
        this.beetroot_icon.style.display = "none";
        this.pumpkin_icon.style.display = "none";
        this.hoe_icon.style.display = "none"
        for(let i = 0; i < 9; i++) {
          this.counters[i].style.display = "none";
        }

        for(let i = 0; i < this.hotbar.length; i++) {
          if(this.hotbar[i][1] > 1){
            this.counters[i].innerHTML = this.hotbar[i][1];            
            this.counters[i].style.display = "initial";
          }
          if(this.hotbar[i][1] > 99999){
            this.counters[i].innerHTML = "99999+";            
            this.counters[i].style.display = "initial";
          }
          if(this.hotbar[i][0] == "hoe") {
            this.hoe_icon.style.display = "initial";
            this.hoe_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";            
          }
          if(this.hotbar[i][0] == "carrot") {
            this.carrot_icon.style.display = "initial";
            this.carrot_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";
          }
          if(this.hotbar[i][0] == "salad") {
            this.salad_icon.style.display = "initial";
            this.salad_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";
          }
          if(this.hotbar[i][0] == "eggplant") {
            this.eggplant_icon.style.display = "initial";
            this.eggplant_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";
          }
          if(this.hotbar[i][0] == "wheat") {
            this.wheat_icon.style.display = "initial";
            this.wheat_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";
          }
          if(this.hotbar[i][0] == "beetroot") {
            this.beetroot_icon.style.display = "initial";
            this.beetroot_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";
          }
          if(this.hotbar[i][0] == "pumpkin") {
            this.pumpkin_icon.style.display = "initial";
            this.pumpkin_icon.style.left = " calc(50vw - 432px + calc("+ i +" * 92px)";
          }
        } 
      }

      if (this.hotbar_selector) {
        for(let i = 1; i < 10; i++) {
          if(this.keys["Digit" + i]) {
            this.hotbar_index = i - 1;
            this.hotbar_selector[0].style.left = " calc(50vw - 432px + calc("+ (i - 1) +" * 92px)";
          }
        }        
      }     

      for (const player of this.scene.players) {       
        player.update(dt, t, this.n_of_tiles);
        if (this.camera && !player.stop) {
          this.camera.update(dt);
        }
        //console.log(player.translation[0] - this.camera.translation[0], player.translation[1] -this.camera.translation[1], player.translation[2]-this.camera.translation[2]);   
      }
      

         
      
      for (const crop_row of this.scene.crops) {
        for (const crop of crop_row) {
          if (crop != null)
            crop.update();
        }
      }

      if (this.physics) {
        this.physics.updateMatrix();
      }   
      
      let i = Math.round(this.scene.players[0].translation[0] / 2);
      let j = Math.round(this.scene.players[0].translation[2] / 2);

      if((i >= 3 && i <= 7) && (j == 0 || j == 1)) {
        this.openDoors();
      }
      else {
        this.closeDoors();
      }
      
      if (this.keys["KeyK"]) {
        this.n_of_rows += 1;
        this.addTileRow();
        this.scene.fences = [];        
        this.addFences();
        this.keys["KeyK"] = false;
      }

      
      if (this.keys["KeyL"]) {
        this.n_of_columns += 1;
        this.addTileLine();
        this.scene.fences = [];        
        this.addFences();
        this.keys["KeyL"] = false;
      }
      

      if (this.keys["Space"]) {
        if(0 <= i && i < this.n_of_tiles && 0 <= j && j < this.n_of_tiles) {
          if(this.scene.tiles[i][j].type == "grass") {
            let t = 0;
            let type = 0;
            if(this.hotbar[this.hotbar_index]) {
              type = this.hotbar[this.hotbar_index][0];
            }
            if(type == "hoe") {
              this.scene.tiles[i][j] = new Tile(
                t,
                this.farm_tile_model,
                Object.create([i * 2, 1.45, j * 2]),
                "farm"
              );
            }
          }
          else if(this.scene.tiles[i][j].type == "farm") {            
            if(this.scene.crops[i][j] == null) {
              let type = 0;
              if(this.hotbar[this.hotbar_index]) {
                type = this.hotbar[this.hotbar_index][0];
              }
              if(Object.keys(this.crops_models).includes(type)) {
                let t = 0;
                this.scene.crops[i][j] = new Crop(
                  t,
                  this.seed_model,
                  Object.create([i * 2, 1.6, j * 2]),
                  type,
                  this.crops_models[type]
                );
                this.hotbar[this.hotbar_index][1] -= 1;
                if(this.hotbar[this.hotbar_index][1] == 0) {
                  this.hotbar.splice(this.hotbar_index, 1);
                }
              }
            }
            else {             
              if(this.hotbar_index == 0 && this.scene.crops[i][j].state == 3) {                
                let found = false;
                let type = this.scene.crops[i][j].type;
                for(let i = 0; i < this.hotbar.length; i++) {    
                  if(this.hotbar[i][0] == type) {
                    this.hotbar[i][1] += parseInt(Math.random() * 3) + 1;
                    found = true;
                    break;
                  }      
                }
                if(!found) {
                  this.hotbar.push([type, parseInt(Math.random() * 3) + 1]);
                }
                this.scene.crops[i][j] = null;
              }              
            }
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
      if (this.scene.doors) {
        this.renderer.renderNodeArray(this.scene.doors, this.camera);
      }
      if (this.scene.fences) {
        this.renderer.renderNodeArray(this.scene.fences, this.camera);
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



