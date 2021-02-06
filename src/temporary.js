const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

function createNumberBar(scene){
    var numberBar = scene.rexUI.add.numberBar({
        x: 1000,
        y: 100,
        width: 300, // Fixed width

        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),

        icon: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),

        slider: {
            // width: 120, // Fixed width
            track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY),
            indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),
            input: 'click',
        },

        text: scene.add.text(0, 0, '').setFixedSize(35, 0),

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,

            icon: 10,
            slider: 10,
        },

        valuechangeCallback: function (value, oldValue, numberBar) {
            numberBar.text = Math.round(Phaser.Math.Linear(0, 100, value));
        },
    })
    .layout();

    return numberBar;
}

    
module.exports = createNumberBar;