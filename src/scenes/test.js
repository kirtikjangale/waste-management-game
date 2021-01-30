import Phaser from 'phaser'

let time=0;
let text;

var config = {
    key: 'TestScene',
};

class TestScene extends Phaser.Scene{
    constructor(){
        super(config)
    }

    init(data){
        console.log(data)
    }

    preload(){
        this.load.image('background','../assets/images/boxback.png')
    }
    create(){
       text =  this.add.text(10,10,"testing scene changing")
       this.game.scene.backgroundColor = "#42f5a4"
    }
    update(){
        time+=0.1;
        if(time>100){
            time=0;
            this.game.scene.run('GameScene')
            this.game.scene.sleep('TestScene');
            console.log('debug scene removal');
        }
        text.setText(`Coins: ${time}x`);
    }

}

export default TestScene;