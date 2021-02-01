import Phaser from 'phaser';
import GameScene from './scenes/gamescence';
import TestScene from './scenes/test'
import Demo from './scenes/temp1'

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
  scene: [GameScene,TestScene,Demo]
};

const game = new Phaser.Game(config);