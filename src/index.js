import Phaser from 'phaser';
import TitleScene from './scenes/titleScene'
import GameScene from './scenes/gameScene'
import HomeScene from './scenes/homeScene'
import MenuScene from './scenes/menuScene';

var gameScene = new GameScene();
var titleScene = new TitleScene();
var homeScene = new HomeScene();
var menuScene = new MenuScene();

//* Game scene */
const config = {
  type: Phaser.AUTO,
  width: 1400,
  height: 800,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

var game = new Phaser.Game(config);

// load scenes
game.scene.add('titleScene', titleScene);
game.scene.add("gameScene", gameScene);
game.scene.add("homeScene", homeScene);
game.scene.add("menuScene", menuScene);
// start title
game.scene.start('homeScene');