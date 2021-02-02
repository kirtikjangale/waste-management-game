import Phaser from 'phaser';
// const height = window.innerHeight;

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
let garbage;
let zone;
let collider;
let dialog;
//
  let score=0;
  let text;
//

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

function preload() {
  this.load.image("tiles", "./assets/tilesets/tuxmon-sample-32px-extruded.png");
   // this.load.tilemapTiledJSON("map", "./assets/tilemaps/trial.json");
  // this.load.tilemapTiledJSON("map", "./assets/tilemaps/city3.json");
  this.load.tilemapTiledJSON("map", "./assets/tilemaps/map7.json");
  // // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // // the player animations (walking left, walking right, etc.) in one image. For more info see:
  // //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  // //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "./assets/atlas/atlas.png", "../assets/atlas/atlas.json");
  this.load.image("garbage", "./assets/images/garbage.png");
  this.load.scenePlugin({
    key: 'rexuiplugin',
    url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
    sceneKey: 'rexUI'
  });
}

function create() {
  
  const map = this.make.tilemap({ key: "map" });


  // // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // // Phaser's cache (i.e. the name you used in preload)
  //const tileset = map.addTilesetImage("tileset4", "tiles");
  const tileset = map.addTilesetImage("tileset6", "tiles");
  // // // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
  const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

  
  worldLayer.setCollisionByProperty({ collides: true });

  

  // // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"

  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
  const garbagePoint = map.findObject("Objects", obj => obj.name === "Garbage");
  // // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 24);

  garbage = this.make.image({
    x: garbagePoint.x, 
    y: garbagePoint.y, 
    key: "garbage",
    scale:{
      x: 0.3,
      y: 0.3
    },
    add: true
  });

  zone = this.add.zone(garbagePoint.x, garbagePoint.y, "garbage")
        .setSize(100, 100);
  // // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.world.enable(zone);
  zone.body.setAllowGravity(false);
  zone.body.moves = false;
  this.physics.add.collider(player, worldLayer);

  collider = this.physics.add.overlap(player, zone, hitGarbage, null, this);

  // this.physics.add.collider(player, garbage, hitGarbage, null, this);
  // // Create the player's walking animations from the texture atlas. These are stored in the global
  // // animation manager so any sprite can access them.
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

  // // Help text that has a "fixed" position on the screen
  

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


  text = this.add
  .text(16, 16, 'Arrow keys to move\nScore:0', {
    font: "18px monospace",
    fill: "#000000",
    padding: { x: 20, y: 10 },
    backgroundColor: "#ffffff"
  })
  .setScrollFactor(0)
  .setDepth(30);

            

}//end create()
//show(garbage){
//}

function hitGarbage() {
  collider.active = false;
//   dialog = this.rexUI.add.dialog({
//     x: garbage.x,
//     y: garbage.y,
//     width: 500,

//     background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

//     title: createLabel(this, 'Title').setDraggable(),

//     toolbar: [
//         createLabel(this, 'O'),
//         createLabel(this, 'X')
//     ],

//     leftToolbar: [
//         createLabel(this, 'A'),
//         createLabel(this, 'B')
//     ],  

//     content: createLabel(this, 'Content'),

//     description: createLabel(this, 'Description'),

//     choices: [
//         createLabel(this, 'Choice0'),
//         createLabel(this, 'Choice1'),
//         createLabel(this, 'Choice2')
//     ],

//     actions: [
//         createLabel(this, 'Action0'),
//         createLabel(this, 'Action1')
//     ],

//     space: {
//         left: 20,
//         right: 20,
//         top: -20,
//         bottom: -20,

//         title: 25,
//         titleLeft: 30,
//         content: 25,
//         description: 25,
//         descriptionLeft: 20,
//         descriptionRight: 20,
//         choices: 25,

//         toolbarItem: 5,
//         choice: 15,
//         action: 15,
//     },

//     expand: {
//         title: false,
//         // content: false,
//         // description: false,
//         // choices: false,
//         // actions: true,
//     },

//     align: {
//         title: 'center',
//         // content: 'left',
//         // description: 'left',
//         // choices: 'left',
//         actions: 'right', // 'center'|'left'|'right'
//     },

//     click: {
//         mode: 'release'
//     }
//   })
//   .setDraggable('background')   // Draggable-background
//   .layout()
// // .drawBounds(this.add.graphics(), 0xff0000)
//   .popUp(1000);

//   var tween = this.tweens.add({
//     targets: dialog,
//     scaleX: 1,
//     scaleY: 1,
//     ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
//     duration: 1000,
//     repeat: 0, // -1: infinity
//     yoyo: false
// });

//   this.print = this.add.text(0, 0, '');
//   dialog
//     .on('button.click', function (button, groupName, index, pointer, event) {
//         this.print.text += groupName + '-' + index + ': ' + button.text + '\n';
//     }, this)
//     .on('button.over', function (button, groupName, index, pointer, event) {
//         button.getElement('background').setStrokeStyle(1, 0xffffff);
//     })
//     .on('button.out', function (button, groupName, index, pointer, event) {
//         button.getElement('background').setStrokeStyle();
//     });
var data = {
  name: 'Rex',
  skills: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
      { name: 'E' },
  ],
  items: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' },
      { name: 'E' },
      { name: 'F' },
      { name: 'G' },
      { name: 'H' },
      { name: 'I' },
      { name: 'J' },
      { name: 'K' },
      { name: 'L' },
      { name: 'M' },
  ],

};

var scrollablePanel = this.rexUI.add.scrollablePanel({
      x: 400,
      y: 300,
      width: 400,
      height: 220,

      scrollMode: 1,

      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),

      panel: {
          child: createPanel(this, data),

          mask: {
              padding: 1
          },
      },

      slider: {
          track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
          thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
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
//.drawBounds(this.add.graphics(), 0xff0000);

// Set icon interactive

this.input.topOnly = false;
var labels = [];
labels.push(...scrollablePanel.getElement('#skills.items', true));
labels.push(...scrollablePanel.getElement('#items.items', true));
var scene = this;
labels.forEach(function (label) {
  if (!label) {
      return;
  }

  var click = scene.rexUI.add.click(label.getElement('icon'), { threshold: 10 })
      .on('click', function () {
          if (!label.getTopmostSizer().isInTouching()) {
              return;
          }
          var category = label.getParentSizer().name;
          score+=1;
          console.log(`${category}:${label.text}\n`)
          text.setText(`Score:${score}`)
      });
})
  
}

var createLabel = function (scene, text) {
  return scene.rexUI.add.label({
      width: 20, // Minimum width of round-rectangle
      height: 20, // Minimum height of round-rectangle
    
      background: scene.add.image(0,0,'garbage').setScrollFactor(0).setDepth(30).setScale(0.1,1),

      text: scene.add.text(0, 0, 'vdlf', {
          fontSize: '24px'
      }),

      space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
      }
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
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");

    score = score+0.1;
    var overlap = checkOverlap(player, zone);
    if (!(overlap.width===0 && overlap.height===0))
    {   
        collider.active = false;
        console.log('Drag the sprites. Overlapping: true');
    }
    else
    {   
        collider.active = true;
        if(dialog){
          dialog.scaleDownDestroy(100);
          dialog = undefined;
        }
        console.log('Drag the sprites. Overlapping: false');
    }
    // console.log(zone.getBounds());
    // console.log(player.getBounds());
    // if(zone.body.touching.none){
    //   console.log(zone.body.debugBodyColor);
    //   zone.body.debugBodyColor = 0x00ffff;
    // }else{
    //   console.log(zone.body.debugBodyColor);
    //   zone.body.debugBodyColor = 0xffff00;
    // }
    // text.setText(`Score:${score}`);
  }
}

var createPanel = function (scene, data) {
  var sizer = scene.rexUI.add.sizer({
      orientation: 'x',
      space: { item: 10 }
  })
      .add(
          createHeader(scene, data), // child
          { expand: true }
      )
      .add(
          createTable(scene, data, 'skills', 1), // child
          { expand: true }
      )
      .add(
          createTable(scene, data, 'items', 2), // child
          { expand: true }
      )
  return sizer;
}

var createHeader = function (scene, data) {
  var title = scene.rexUI.add.label({
      orientation: 'x',
      text: scene.add.text(0, 0, 'Character'),
  });
  var header = scene.rexUI.add.label({
      orientation: 'y',
      icon: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 5, COLOR_LIGHT),
      text: scene.add.text(0, 0, data.name),

      space: { icon: 10 }
  });

  return scene.rexUI.add.sizer({
      orientation: 'y',
      space: { left: 5, right: 5, top: 5, bottom: 5, item: 10 }
  })
      .addBackground(
          scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
      )
      .add(
          title, // child
          { expand: true, align: 'left' }
      )
      .add(header, // child
          { proportion: 1, expand: true }
      );
};

var createTable = function (scene, data, key, rows) {
  var capKey = key.charAt(0).toUpperCase() + key.slice(1);
  var title = scene.rexUI.add.label({
      orientation: 'x',
      text: scene.add.text(0, 0, capKey),
  });

  var items = data[key];
  var columns = Math.ceil(items.length / rows);
  var table = scene.rexUI.add.gridSizer({
      column: columns,
      row: rows,

      rowProportions: 1,
      space: { column: 10, row: 10 },
      name: key  // Search this name to get table back
  });

  var item, r, c;
  var iconSize = (rows === 1) ? 80 : 40;
  for (var i = 0, cnt = items.length; i < cnt; i++) {
      item = items[i];
      r = i % rows;
      c = (i - r) / rows;
      table.add(
          createIcon(scene, item, iconSize, iconSize),
          c,
          r,
          'top',
          0,
          true
      );
  }

  return scene.rexUI.add.sizer({
      orientation: 'y',
      space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
  })
      .addBackground(
          scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
      )
      .add(
          title, // child
          0, // proportion
          'left', // align
          0, // paddingConfig
          true // expand
      )
      .add(table, // child
          1, // proportion
          'center', // align
          0, // paddingConfig
          true // expand
      );
}

var createIcon = function (scene, item, iconWidth, iconHeight) {
  var label = scene.rexUI.add.label({
      orientation: 'y',
      icon: scene.add.image(0,0,'garbage').setScrollFactor(0).setDepth(30).setScale(0.3,0.4),
      text: scene.add.text(0, 0, item.name),

      space: { icon: 3 }
  });

  return label;
};