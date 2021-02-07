import Phaser from 'phaser';
import createPanel from '../src/ui-elements/create-table'
import {wastes, recycleFacts} from './store'
import createLabel from './ui-elements/create-dump'

const config = {
  type: Phaser.AUTO,
  width: 1400,
  height: 800,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let cursors;
let player;
let showDebug = false;
let activeSprite;
let scrollablePanel;
let dropzonepanel;
let dialogDump;  
let garbageLayer;    
let dumpingLayer;
let recycleLayer;
let garbages;
let dumpZones;
let overlapState=false;
let dumpState = false;
let gscore = {packaging: 0, ewaste: 0, biowaste: 0}
let health = 100;
let Bar;
let overlapRecyclePlant=false;
let recyclePlants;
let dialogRecycle;
//
  let text1;
  let text2;
  let text3;
//

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

function preload() {
  this.load.image('preloaderBar', './assets/images/loading-bar.png');
  this.load.image("tiles", "./assets/tilesets/tuxmon-sample-32px-extruded.png");
   // this.load.tilemapTiledJSON("map", "./assets/tilemaps/trial.json");
  // this.load.tilemapTiledJSON("map", "./assets/tilemaps/city3.json");
  this.load.tilemapTiledJSON("map", "./assets/tilemaps/map6.json");
  // // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // // the player animations (walking left, walking right, etc.) in one image. For more info see:
  // //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  // //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "./assets/atlas/atlas.png", "../assets/atlas/atlas.json");
  this.load.image("garbage", "./assets/images/garbage.png");
  this.load.image("dumping", "./assets/images/dumping.png");
  this.load.scenePlugin({
    key: 'rexuiplugin',
    url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
    sceneKey: 'rexUI'
  });
  this.load.image('plastic', "./assets/images/recycle-plant.png");
  this.load.image('garbage1', "./assets/images/garbage1.png");
  this.load.image('garbage2', "./assets/images/garbage2.png");
  this.load.image('garbage3', "./assets/images/garbage3.png");
  this.load.image('garbage4', "./assets/images/garbage4.png");
}

function create() {
  
  const map = this.make.tilemap({ key: "map" });
  const tileset = map.addTilesetImage("tileset6", "tiles");

  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
  garbageLayer = map.getObjectLayer("Garbage")['objects']
  dumpingLayer = map.getObjectLayer("Dumping")['objects']
  recycleLayer = map.getObjectLayer("Plastic")['objects']

  worldLayer.setCollisionByProperty({ collides: true });
  // // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"

  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
  // const recyclePoint = map.findObject("Plastic", obj => obj.name === "Plastic");

  // recyclePlant = this.physics.add.sprite(recyclePoint.x, recyclePoint.y, "plastic");
  // recyclePlant.scaleX = 0.15;
  // recyclePlant.scaleY = 0.15;

  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 24);

  this.physics.add.collider(player, worldLayer);
  // var lifeTime = this.plugins.get('rexLifeTime').add(gameObject, config);
  garbages = this.physics.add.staticGroup();
  garbageLayer.forEach(object => {
    var _id = 0;
    let obj = garbages.create(object.x, object.y, "garbage4"); 
       obj.scaleX = 0.3;
       obj.scaleY = 0.3;
       obj.setOrigin(0); 
       obj.body.width = object.width; 
       obj.body.height = object.height; 
      //generating random waste object
      const sz = 5;
      let arr = [];
      for(let i=0;i<sz;i++){
        arr.push(Object.assign({}, wastes[Math.floor(Math.random() * wastes.length)]));
      }
      arr.forEach((obj) => {
        obj._id = _id;
        _id+=1;
        obj.amt = 30;
      });
      obj.garbageCont = arr;
  })


  dumpZones = this.physics.add.staticGroup();
  dumpingLayer.forEach(object => {
    let obj = dumpZones.create(object.x, object.y, "dumping");
    obj.scaleX = 0.3;
    obj.scaleY = 0.3;
    obj.setOrigin(0);
    obj.body.width = object.width; 
    obj.body.height = object.height; 
    obj.capacity = getRandomInt(30,60);
  })

  recyclePlants = this.physics.add.staticGroup();
  recycleLayer.forEach(object => {
    let obj = recyclePlants.create(object.x, object.y, "plastic");
    obj.scaleX = 0.3;
    obj.scaleY = 0.3;
    obj.setOrigin(0);
    obj.body.width = object.width;
    obj.body.height = object.height;
  })

  Bar = makeBar(1000,10,0xe74c3c,this);

  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();
  
  // Debug graphics
  this.input.keyboard.once("keydown_D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });

  text1 = this.add
  .text(16, 16, 'Arrow keys to move\n', {
    font: "18px monospace",
    fill: "#000000",
    padding: { x: 20, y: 10 },
    backgroundColor: "#ffffff"
  })
  .setScrollFactor(0)
  .setDepth(30);

  text2 = this.add
  .text(800, 10, 'Arrow keys to move\n', {
    font: "18px monospace",
    fill: "#000000",
    padding: { x: 20, y: 10 },
    backgroundColor: "#ffffff"
  })
  .setScrollFactor(0)
  .setDepth(30);
 
}

function makeBar(x, y,color,scene) {
  //draw the bar
  let bar = scene.add.graphics();
  bar.setScrollFactor(0).setDepth(30)

  //color the bar
  bar.fillStyle(color, 1);

  //fill the bar with a rectangle
  bar.fillRect(0, 0, 100, 30);
  
  //position the bar
  bar.x = x;
  bar.y = y;

  //return the bar
  return bar;
}

function setValue(bar, percentage) {
  //scale the bar
  console.log("here baby");
  bar.scaleX = percentage/100;
}

function hitGarbage(scene,obj) {

 console.log('hit garbage() called')

  var data = {
    skills: obj.garbageCont
  };

  var dropzonedata = {
    skills: [
      { name: 'packaging' },
      { name: 'ewaste' },
      { name: 'biowaste' },
    ],
  }

  dropzonepanel = scene.rexUI.add.scrollablePanel({
    x: 1000,
    y: 300,
    width: 400,
    height: 220,

    scrollMode: 1,

    background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),

    panel: {
        child: createPanel(scene, dropzonedata, "dropzone"),

        mask: {
            padding: 1
        },
    },

    slider: {
        track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
        thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
    },

    scroller: true,

    space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,

        panel: 10,
    }
  })
  .layout().setScrollFactor(0).setDepth(30)

scrollablePanel = scene.rexUI.add.scrollablePanel({
      x: 400,
      y: 300,
      width: 400,
      height: 220,

      scrollMode: 1,

      background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),

      panel: {
          child: createPanel(scene, data, "icon"),
          mask: {
              padding: 1
          },
      },

      slider: {
          track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
          thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
      },

      // scroller: true,

      space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,

          panel: 10,
      }
  })
  .layout().setScrollFactor(0).setDepth(30)


scene.input.topOnly = false;
var labels = [];
labels.push(...scrollablePanel.getElement('#skills.items', true));

var labelsdropzone = [];
labelsdropzone.push(...dropzonepanel.getElement('#skills.items', true));
// // labels.push(...scrollablePanel.getElement('#items.items', true));

labels.forEach(function (label) {
  if (!label) {
      return;
  }

  var click = scene.rexUI.add.click(label.getElement('icon'), { threshold: 10 })
      .on('click', function () {

        scene.input.setDraggable(label)
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        
        });

        scene.input.on('drop', function (pointer, gameObject, dropZone) {
          // console.log(dropZone.name, label.getElement("icon").name);
          console.log(obj.garbageCont);
          if(dropZone.name === label.getElement("icon").name){
            // console.log("in here 1");
            health -= 1;
            gameObject.x = dropZone.x;
            gameObject.y = dropZone.y;
            gameObject.scaleDownDestroy(100);
            const id = label.getElement("icon")._id;
            console.log(id);
            var amt = 0;
            // console.log(label.getElement("icon").id);
            obj.garbageCont = obj.garbageCont.filter((elem) => {
              if(elem._id === id) amt = elem.amt;
              return elem._id !== id;
            })
            console.log(obj.garbageCont);
            gscore[dropZone.name] += amt;
            console.log(gscore);
          }else{
            health -= 2;
            // console.log("in here 2");
            gameObject.x = gameObject.input.dragStartX,
            gameObject.y = gameObject.input.dragStartY
          }

        });

        if (!label.getTopmostSizer().isInTouching()) {
            return;
        }

        var category = label.getParentSizer().name;
        //console.log(`${category}:${label.text}\n`)
      });
  })
  
}

function makeBar(x, y,color,scene) {
  //draw the bar
  let bar = scene.add.graphics();
  bar.setScrollFactor(0).setDepth(30)

  //color the bar
  bar.fillStyle(color, 1);

  //fill the bar with a rectangle
  bar.fillRect(0, 0, 200, 50);
  
  //position the bar
  bar.x = x;
  bar.y = y;

  //return the bar
  return bar;
}

function setValue(bar,percentage) {
  //scale the bar
  bar.scaleX = health/100;
}

function hitDump(scene, obj){
  dialogDump = scene.rexUI.add.dialog({
      x: obj.x,
      y: obj.y,
  
      background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
  
      title: scene.rexUI.add.label({
          background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
          text: scene.add.text(0, 0, 'Welcome to Composting!', {
              fontSize: '24px'
          }),
          space: {
              left: 15,
              right: 15,
              top: 10,
              bottom: 10
          }
      }),
  
      content: scene.add.text(0, 0, `Do you want to dump?\n\nCapacity: ${obj.capacity}`, {
          fontSize: '24px'
      }),
  
      actions: [
          createLabel(scene, 'Yes'),
          createLabel(scene, 'No')
      ],
  
      space: {
          title: 25,
          content: 25,
          action: 15,
  
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
      },
  
      align: {
          actions: 'right', // 'center'|'left'|'right'
      },
  
      expand: {
          content: false, // Content is a pure text object
      }
  })
      .layout()
      // .drawBounds(scene.add.graphics(), 0xff0000)
      .popUp(1000);
  
  scene.print = scene.add.text(0, 0, '');
  dialogDump
      .on('button.click', function (button, groupName, index) {
        if(button.text === "Yes"){
          var toast = scene.rexUI.add.toast({
            x: obj.x,
            y: obj.y,

            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY),
            text: scene.add.text(0, 0, '', {
                fontSize: '24px'
            }),
            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },
            duration: {
              in: 200,
              hold: 1000,
              out: 200
            }
          })
          if(gscore.biowaste === 0){
            toast.show("Sorry! you don't have any waste to dump!");
          }else{
            var amt = Math.min(obj.capacity, gscore.biowaste);
            console.log(toast);
            toast.displayTime = amt*100;
            toast.show(`Dumping ${amt} of biowaste please be patient...`);
            gscore.biowaste -= amt;
            obj.capacity -= amt;
            health = min(health+5, 100);
          }
        }
        dialogDump.scaleDownDestroy(100);
        dialogDump = undefined;
        if(obj.capacity === 0){
          //loader to be added
          obj.destroy(obj.x, obj.y); 
        }
      }, scene)
      .on('button.over', function (button, groupName, index) {
          button.getElement('background').setStrokeStyle(1, 0xffffff);
      })
      .on('button.out', function (button, groupName, index) {
          button.getElement('background').setStrokeStyle();
      });
  
}

function hitRecycle(scene, recycleFacts, obj){
  
  dialogRecycle = scene.rexUI.add.dialog({
    x: obj.x,
    y: obj.y,

    background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

    title: scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
        text: scene.add.text(0, 0, 'Welcome to Recycling!', {
            fontSize: '24px'
        }),
        space: {
            left: 15,
            right: 15,
            top: 10,
            bottom: 10
        }
    }),

    content: scene.add.text(0, 0, `Do you want to dump?\n\n`, {
        fontSize: '24px'
    }),

    actions: [
        createLabel(scene, 'Yes'),
        createLabel(scene, 'No')
    ],

    space: {
        title: 25,
        content: 25,
        action: 15,

        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
    },

    align: {
        actions: 'right', // 'center'|'left'|'right'
    },

    expand: {
        content: false, // Content is a pure text object
    }
})
    .layout()
    // .drawBounds(scene.add.graphics(), 0xff0000)
    .popUp(1000);

scene.print = scene.add.text(0, 0, '');
dialogRecycle
    .on('button.click', function (button, groupName, index) {
      if(button.text === "Yes"){

        console.log('jdsjakfhshzkdlkfgdzgdjkbkjhfhfsjlsr')
        var toast = scene.rexUI.add.toast({
          x: obj.x,
          y: obj.y,

          background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY),
          text: scene.add.text(0, 0, '', {
              fontSize: '24px'
          }),
          space: {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
          },
          duration: {
            in: 200,
            hold: 3000+100*gscore.packaging,
            out: 200
          }
        })
        if(gscore.packaging+gscore.ewaste === 0){
          toast.show("Sorry! you don't have any waste to dump!");
        }else{
          health = Math.min(health+10, 100);
          toast.show(`Dumping ${gscore.packaging+gscore.ewaste} amount of packaging waste please be patient...`);
          gscore.packaging = 0;
          gscore.waste = 0;
        }
      }
      dialogRecycle.scaleDownDestroy(100);
      dialogRecycle = undefined;
    }, scene)
    .on('button.over', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle(1, 0xffffff);
    })
    .on('button.out', function (button, groupName, index) {
        button.getElement('background').setStrokeStyle();
    });
  
}

function checkOverlap(spriteA, spriteB) {

  var boundsA = spriteA.getBounds();
  var boundsB = spriteB.getBounds();

  return Phaser.Geom.Rectangle.Intersection(boundsA, boundsB);

}

function update(time, delta) {
  const speed = 500;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);
  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    health -= 0.01;
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    health -= 0.01;
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    health -= 0.01;
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    health -= 0.01;
    player.anims.play("misa-front-walk", true);
  } else {
    health -= 0.01;
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");

    let cnt=0,sz=0;

    recyclePlants.children.entries.forEach((obj) => {
      var overlap = checkOverlap(player,obj);

      sz++;
      if (!(overlap.width===0 && overlap.height===0) && overlapRecyclePlant==false)
      {  
          overlapRecyclePlant=true;
          hitRecycle(this, recycleFacts, obj);  //obj to be changed
      }
      else{
        if((overlap.width===0 && overlap.height===0)) cnt++
        
        if(dialogRecycle && overlapRecyclePlant==false){
          overlapRecyclePlant = false;          
          dialogRecycle.scaleDownDestroy(100);
          dialogRecycle = undefined;
        } 
      
      }
    })
    
    if(cnt==sz && overlapRecyclePlant==true){
      overlapRecyclePlant=false;
    }

    cnt = 0, sz = 0;
    dumpZones.children.entries.forEach((obj) => {
      var overlap = checkOverlap(player, obj);
      
      sz++;
      if (!(overlap.width===0 && overlap.height===0) && dumpState==false)
      {  
          dumpState=true;
          hitDump(this, obj, dialogDump);
      }
      else
      {   
        if((overlap.width===0 && overlap.height===0)) cnt++;

        if(dialogDump && dumpState==false){
          dumpState = false;
          dialogDump.scaleDownDestroy(100);
          dialogDump=undefined
        }
      }
    })

    if(cnt==sz && dumpState==true){
      dumpState=false;
    }
      

    garbages.children.entries.forEach((obj) => {
      if(obj.garbageCont.length === 0){
        obj.destroy(obj.x, obj.y);
      }
    });

    cnt = 0, sz = 0;
    garbages.children.entries.forEach((obj) => {
      var overlap = checkOverlap(player, obj);
      
      sz++;
      if (!(overlap.width===0 && overlap.height===0) && overlapState==false)
      {  
          overlapState=true;
          hitGarbage(this,obj);
      }
      else
      {   
         
          if((overlap.width===0 && overlap.height===0))
            cnt++;
          
          if(scrollablePanel && overlapState==false){
            scrollablePanel.scaleDownDestroy(1);
            scrollablePanel=undefined
          }
  
          if(dropzonepanel && overlapState==false){
            dropzonepanel.scaleDownDestroy(1);
            dropzonepanel=undefined
          }
      }
    })

    if(cnt==sz && overlapState==true)
      overlapState=false;
    
    text1.setText(`Packaging Waste:${gscore.packaging}\nE-Waste:${gscore.ewaste}\nBio-waste:${gscore.biowaste}`);
    text2.setText(`health: ${health.toFixed(2)}`)
  }
  setValue(Bar, health);

  if(health<0){
    health = 100;
  }
    
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}