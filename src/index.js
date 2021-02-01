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

//
  let score=0;
  let text;
//

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

  // garbage = this.make.image({
  //   x: garbagePoint.x, 
  //   y: garbagePoint.y, 
  //   key: "garbage",
  //   scale:{
  //     x: 0.3,
  //     y: 0.3
  //   },
  //   add: true
  // });
  zone = this.add.zone(garbagePoint.x, garbagePoint.y, "garbage")
        .setSize(100, 100);
  // // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.world.enable(zone);
  zone.body.setAllowGravity(false);
  zone.body.moves = false;
  this.physics.add.collider(player, worldLayer);

  collider = this.physics.add.overlap(player, zone, function (){
    collider.active = false;
    console.log("in here");
    // hitGarbage(garbage);
  }, null, this);

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
}
//show(garbage){
//}

function hitGarbage(garbage) {
  var dialog = this.rexUI.add.dialog({
    x: garbage.x,
    y: garbage.y,
    width: 500,

    background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

    title: createLabel(this, 'Title').setDraggable(),

    toolbar: [
        createLabel(this, 'O'),
        createLabel(this, 'X')
    ],

    leftToolbar: [
        createLabel(this, 'A'),
        createLabel(this, 'B')
    ],  

    content: createLabel(this, 'Content'),

    description: createLabel(this, 'Description'),

    choices: [
        createLabel(this, 'Choice0'),
        createLabel(this, 'Choice1'),
        createLabel(this, 'Choice2')
    ],

    actions: [
        createLabel(this, 'Action0'),
        createLabel(this, 'Action1')
    ],

    space: {
        left: 20,
        right: 20,
        top: -20,
        bottom: -20,

        title: 25,
        titleLeft: 30,
        content: 25,
        description: 25,
        descriptionLeft: 20,
        descriptionRight: 20,
        choices: 25,

        toolbarItem: 5,
        choice: 15,
        action: 15,
    },

    expand: {
        title: false,
        // content: false,
        // description: false,
        // choices: false,
        // actions: true,
    },

    align: {
        title: 'center',
        // content: 'left',
        // description: 'left',
        // choices: 'left',
        actions: 'right', // 'center'|'left'|'right'
    },

    click: {
        mode: 'release'
    }
  })
  .setDraggable('background')   // Draggable-background
  .layout()
// .drawBounds(this.add.graphics(), 0xff0000)
  .popUp(1000);

  var tween = this.tweens.add({
    targets: dialog,
    scaleX: 1,
    scaleY: 1,
    ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
    duration: 1000,
    repeat: 0, // -1: infinity
    yoyo: false
});

  this.print = this.add.text(0, 0, '');
  dialog
    .on('button.click', function (button, groupName, index, pointer, event) {
        this.print.text += groupName + '-' + index + ': ' + button.text + '\n';
    }, this)
    .on('button.over', function (button, groupName, index, pointer, event) {
        button.getElement('background').setStrokeStyle(1, 0xffffff);
    })
    .on('button.out', function (button, groupName, index, pointer, event) {
        button.getElement('background').setStrokeStyle();
    });
  console.log("player collided with garbage!");
  
}

var createLabel = function (scene, text) {
  return scene.rexUI.add.label({
      width: 40, // Minimum width of round-rectangle
      height: 40, // Minimum height of round-rectangle
    
      background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3),

      text: scene.add.text(0, 0, text, {
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
    {   collider.active = true;
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