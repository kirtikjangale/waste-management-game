import Phaser from 'phaser';
import createPanel from '../ui-elements/create-table'
import {wastes, recycleFacts} from '../store'
import createLabel from '../ui-elements/create-dump'
import createAnims from '../ui-elements/create-anims'

let cursors;
let player;
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
let text1;
let text2;
let gameEnd=false;

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

class GameScene extends Phaser.Scene {

	constructor() {
		super({key : 'gameScene'});
	}

	preload() {
        this.load.image('preloaderBar', './assets/images/loading-bar.png');
        this.load.image("tiles", "./assets/tilesets/tuxmon-sample-32px-extruded.png");
        this.load.tilemapTiledJSON("map", "./assets/tilemaps/map.json");
        this.load.atlas("atlas", "./assets/atlas/atlas.png", "../assets/atlas/atlas.json");
        this.load.image("garbage", "./assets/images/garbage1.png");
        this.load.image("dumping", "./assets/images/dumping3.png");
        this.load.scenePlugin({
          key: 'rexuiplugin',
          url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
          sceneKey: 'rexUI'
        });
        this.load.image('plastic', "./assets/images/recycle-plant.png");
        this.load.image('cottonwaste',"./assets/images/cottonwaste.png")
        this.load.image('plasticbottle',"./assets/images/plasticbottle.png")
        this.load.image('siliconwaste',"./assets/images/siliconwaste.png")
        this.load.image('glasscontainer',"./assets/images/glasscontainer.png")
        this.load.image('aluminium',"./assets/images/aluminium.png")
        this.load.image('kitchenwaste',"./assets/images/kitchenwaste.png")
        this.load.image('batteries',"./assets/images/batteries.png")
        this.load.image('wires',"./assets/images/wires.png")
        this.load.image('cardboard',"./assets/images/cardboard.png")
        this.load.image('organic',"./assets/images/organic.png")
        this.load.image('ewaste1',"./assets/images/ewaste1.png")
        this.load.image('ewaste2',"./assets/images/ewaste2.png")
        this.load.image('foodwaste1',"./assets/images/foodwaste1.png")
        this.load.image('foodwaste',"./assets/images/foodwaste.png")
        this.load.image('softdrinks',"./assets/images/softdrinks.png")
      }
      

    create() {

        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("tileset6", "tiles");
      
        const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
        aboveLayer.setDepth(10);
        worldLayer.setCollisionByProperty({ collides: true });
      
        garbageLayer = map.getObjectLayer("Garbage")['objects']
        dumpingLayer = map.getObjectLayer("Dumping")['objects']
        recycleLayer = map.getObjectLayer("Plastic")['objects']
      
        const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
      
        player = this.physics.add
          .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
          .setSize(30, 40)
          .setOffset(0, 24);
        this.physics.add.collider(player, worldLayer);
       

        garbages = this.physics.add.staticGroup();
        garbageLayer.forEach(object => {
          var _id = 0;
          let obj = garbages.create(object.x, object.y, "garbage"); 
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
              obj.amt = getRandomInt(10,100);;
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
          obj.capacity = getRandomInt(30,300);
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
        createAnims(anims);
      
        const camera = this.cameras.main;
        camera.startFollow(player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      
        cursors = this.input.keyboard.createCursorKeys();
      
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
        
        var expand = true;
        var pausebutton = this.rexUI.add.buttons({
            x: 1300, y: 40,
            width: 200,
            orientation: 'y',

            buttons: [
                this.createButton(this, 'Pause'),
            ],

            space: {
                left: 10, right: 10, top: 40, bottom: 30, 
                item: 3
            },
            expand: expand
        })
        .layout().setScrollFactor(0).setDepth(30)
            // .drawBounds(this.add.graphics(), 0xff0000)
        var scene = this;
        pausebutton
            .on('button.click', function (button, index, pointer, event) {
              this.scene.scene.start("menuScene");
            })

        
      }

      createButton (scene, text) {
        return scene.rexUI.add.label({
            width: 40,
            height: 40,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_LIGHT).setScrollFactor(0).setDepth(30),
            text: scene.add.text(0, 0, text, {
                fontSize: 18
            }).setScrollFactor(0).setDepth(30),
            space: {
                left: 10,
                right: 10,
                
            },
            align: 'center'
        }).setScrollFactor(0).setDepth(30);
    }

    update(time, delta) {

      if(gameEnd){
        text2.setText(`health: 0`)
        player.destroy(player.x,player.y);
        location.reload();
        return;
      }

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
      
        if(health <= 0.5 && gameEnd==false){

          gameEnd=true;
          var toast = this.rexUI.add.toast({
            x: 700,
            y: 300,

            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY).setScrollFactor(0).setDepth(30),
            text: this.add.text(0, 0, '', {
                fontSize: '24px'
            }).setScrollFactor(0).setDepth(30),
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
          }).setScrollFactor(0).setDepth(30)
          
          toast.show("Sorry You Lost the game! We hope you try again Bye Bye");

          
        }
        
          
      }


	// end() {
		
	// }


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
    bar.scaleX = percentage/100;
  }
  
  function hitGarbage(scene,obj) {
  
  
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
      height: 240,
  
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
        height: 280,
  
        scrollMode: 1,
  
        background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),
  
        panel: {
            child: createPanel(scene, data, "icon"),
            // mask: {
            //     padding: 1
            // },
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
    scene.input.setDraggable(label)
    var click = scene.rexUI.add.click(label.getElement('icon'), { threshold: 10 })
        .on('click', function () {
  
          
          scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
              gameObject.x = dragX;
              gameObject.y = dragY;
              gameObject.setDepth(50);
          });
  
          scene.input.on('drop', function (pointer, gameObject, dropZone) {
           
            if(dropZone.name === label.getElement("icon").name){
              
              health = Math.min(health+3,100);
              gameObject.x = dropZone.x;
              gameObject.y = dropZone.y;
              gameObject.scaleDownDestroy(100);
              const id = label.getElement("icon")._id;
              
              var amt = 0;
            
              obj.garbageCont = obj.garbageCont.filter((elem) => {
                if(elem._id === id) amt = elem.amt;
                return elem._id !== id;
              })
              gscore[dropZone.name] += amt;
            }else{
              health -= 2;
              gameObject.x = gameObject.input.dragStartX,
              gameObject.y = gameObject.input.dragStartY
            }
  
          });
  
          if (!label.getTopmostSizer().isInTouching()) {
              return;
          }
  
          var category = label.getParentSizer().name;
        });
    })
    
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
              toast.displayTime = amt*100;
              toast.show(`Dumping ${amt} of biowaste please be patient...`);
              gscore.biowaste -= amt;
              obj.capacity -= amt;
              health = Math.min(health+10, 100);
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
              hold: Math.min(3000+100*gscore.packaging,5000),
              out: 200
            }
          })
          if(gscore.packaging+gscore.ewaste === 0){
            toast.show("Sorry! you don't have any waste to dump!");
          }else{
            health = Math.min(health+10, 100);
            toast.show(` ${gscore.packaging+gscore.ewaste} amount of packaging/ewaste is in the process of recycling please be patient...`);
            gscore.packaging = 0;
            gscore.ewaste = 0;
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
  
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

export default GameScene;
