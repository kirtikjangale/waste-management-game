import { Scene } from "phaser";
import GameScene from "./gameScene";
import TitleScene from './titleScene';

const Random = Phaser.Math.Between;

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

let sounds={};


class HomeScene extends Phaser.Scene {

	constructor() {
		super({key:'homeScene'});
	}

	preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
          });
        this.load.image('background', './assets/images/map6.png');
        this.load.audio('govtsong', "./assets/SoundEffects/swachhbharatsong.mp3");
        
	}


	create() {
        var bg = this.add.sprite(400, 100, 'background');
        bg.setOrigin(0,0);
        var text = this.add.text(600, 50, 'Swachh Bharat Abhiyan!');
        
        
        
        sounds.govtsong = this.sound.add('govtsong', {
            mute: false,
            volume: 0.1,
            rate: 1,
            loop: true,
            delay:200
          });

        sounds.govtsong.play();
        
        var expand = true;
        var startbutton = this.rexUI.add.buttons({
            x: 1300, y: 400,
            width: 200,
            orientation: 'x',

            buttons: [
                this.createButton(this, 'Start Game'),
            ],

            space: {
                left: 10, right: 10, top: 10, bottom: 10, 
                item: 3
            },
            expand: expand
        })
            .layout()
            // .drawBounds(this.add.graphics(), 0xff0000)
            var scene = this;
            startbutton
            .on('button.click', function (button, index, pointer, event) {
                sounds.govtsong.stop();
                this.scene.scene.start("gameScene");
            })

        var instrbutton = this.rexUI.add.buttons({
            x: 100, y: 400,
            width: 200,
            orientation: 'x',

            buttons: [
                this.createButton(this, 'Read Instructions'),
            ],

            space: {
                left: 10, right: 10, top: 10, bottom: 10, 
                item: 3
            },
            expand: expand
        })
            .layout()
            // .drawBounds(this.add.graphics(), 0xff0000)

        instrbutton
            .on('button.click', function (button, index, pointer, event) {
                sounds.govtsong.stop();
                this.scene.scene.start("titleScene");
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

}



export default HomeScene;

// scene.scene.switch(key);
// scene.scene.start(key, data);
// scene.scene.run(key, data);