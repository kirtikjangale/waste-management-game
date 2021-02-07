function createAnims(anims){
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
}

module.exports = createAnims;