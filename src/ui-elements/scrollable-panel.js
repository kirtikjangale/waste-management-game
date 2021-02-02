
scrollablePanel = scene.rexUI.add.scrollablePanel({
    x: 400,
    y: 300,
    width: 400,
    height: 220,

    scrollMode: 1,

    background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),

    panel: {
        child: createPanel(scene, data, "icon"),
        mask: {
            padding: 1
        },
    },

    slider: {
        track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
        thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
    },

    // scroller: true,

    space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,

        panel: 10,
    }
})
.layout().setScrollFactor(0).setDepth(30)
