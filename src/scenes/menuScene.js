import HomeScene from "./homeScene";

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'menuScene'
        })
    }

    preload() { 
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
 
        this.load.image('nextPage', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/arrow-down-left.png');
    }

    create() {
        var expand = true;
        var accessibility = this.rexUI.add.buttons({
            x: 700, y: 300,
            width: 200,
            orientation: 'y',

            buttons: [
                this.createButton(this, 'Play'),
                this.createButton(this, 'End'),
                this.createButton(this, 'Instructions')
            ],

            space: {
                left: 10, right: 10, top: 180, bottom: 30, 
                item: 3
            },
            expand: expand
        })
            .layout().setScrollFactor(0).setDepth(30)
            // .drawBounds(this.add.graphics(), 0xff0000)

            var scene = this;
        accessibility
            .on('button.click', function (button, index, pointer, event) {
              if(button.text === "Play"){
                    this.scene.scene.start("gameScene");
              } 
              else if(button.text === "End"){
                    location.reload();
              }
              else{
                this.scene.scene.start("titleScene");
              } 
            })
    }

    createButton (scene, text) {
        return scene.rexUI.add.label({
            width: 40,
            height: 40,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_LIGHT),
            text: scene.add.text(0, 0, text, {
                fontSize: 18
            }),
            space: {
                left: 10,
                right: 10,
            },
            align: 'center'
        });
    }

    update() {}

}

export default MenuScene;