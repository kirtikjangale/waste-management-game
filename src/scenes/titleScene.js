const { default: GameScene } = require("./gameScene");

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;
let sounds={}
var content = `The city is under danger and Misa(The character) wants to protect it by segregating garbage and doing the right thing with it. What is the right thing? Well to Know that you have to play the game. Note that your health is continuously decreasing so to collect health you have to dump the garbage.     After all waste in the game is dumped and you are still alive then congrats you have won the game!!!`;

class TitleScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'titleScene'
        })
    }

    preload() { 
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
 
        this.load.image('nextPage', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/arrow-down-left.png');
        this.load.audio('gadiwala', "./assets/SoundEffects/gadiwala.mp3");
    }

    create() {
        this.game.scene.stop("homeScene");

        sounds.gadiwala = this.sound.add('gadiwala', {
            mute: false,
            volume: 0.1,
            rate: 1,
            loop: true,
            delay:200
          });

        sounds.gadiwala.play();

        createTextBox(this, 300, 100, {
                wrapWidth: 650,
            })
            .start(content, 70);

            var expand = true;
            var button = this.rexUI.add.buttons({
                x: 700, y: 400,
                width: 200,
                orientation: 'x',
    
                buttons: [
                    this.createButton(this, 'Play/Resume Game'),
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
            button
                .on('button.click', function (button, index, pointer, event) {
                    sounds.gadiwala.stop();
                    this.scene.scene.start("gameScene");
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

    clickButton() {
        this.scene.switch('gameScene');
    }

    update() {}
}


const GetValue = Phaser.Utils.Objects.GetValue;
var createTextBox = function (scene, x, y, config) {
    var wrapWidth = GetValue(config, 'wrapWidth', 0);
    var fixedWidth = GetValue(config, 'fixedWidth', 0);
    var fixedHeight = GetValue(config, 'fixedHeight', 0);
    var textBox = scene.rexUI.add.textBox({
            x: x,
            y: y,

            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY)
                .setStrokeStyle(2, COLOR_LIGHT),

            icon: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_DARK),

            // text: getBuiltInText(scene, wrapWidth, fixedWidth, fixedHeight),
            text: getBBcodeText(scene, wrapWidth, fixedWidth, fixedHeight),

            action: scene.add.image(0, 0, 'nextPage').setTint(COLOR_LIGHT).setVisible(false),

            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
                icon: 10,
                text: 10,
            }
        })
        .setOrigin(0)
        .layout();

    textBox
        .setInteractive()
        .on('pointerdown', function () {
            var icon = this.getElement('action').setVisible(false);
            this.resetChildVisibleState(icon);
            if (this.isTyping) {
                this.stop(true);
            } else {
                this.typeNextPage();
            }
        }, textBox)
        .on('pageend', function () {
            if (this.isLastPage) {
                return;
            }

            var icon = this.getElement('action').setVisible(true);
            this.resetChildVisibleState(icon);
            icon.y -= 30;
            var tween = scene.tweens.add({
                targets: icon,
                y: '+=30', // '+=100'
                ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 500,
                repeat: 0, // -1: infinity
                yoyo: false
            });
        }, textBox)
    //.on('type', function () {
    //})

    return textBox;
}

var getBuiltInText = function (scene, wrapWidth, fixedWidth, fixedHeight) {
    return scene.add.text(0, 0, '', {
            fontSize: '20px',
            wordWrap: {
                width: wrapWidth
            },
            maxLines: 3
        })
        .setFixedSize(fixedWidth, fixedHeight);
}

var getBBcodeText = function (scene, wrapWidth, fixedWidth, fixedHeight) {
    return scene.rexUI.add.BBCodeText(0, 0, '', {
        fixedWidth: fixedWidth,
        fixedHeight: fixedHeight,

        fontSize: '20px',
        wrap: {
            mode: 'word',
            width: wrapWidth
        },
        maxLines: 3
    })
}

module.exports = TitleScene;