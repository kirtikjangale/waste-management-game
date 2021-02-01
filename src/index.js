import Phaser from 'phaser';
import GameScene from './scenes/gamescence';

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
  },
  scene: [GameScene]
};

const game = new Phaser.Game(config);
