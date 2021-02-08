const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

var createPanel = function (scene, data, type) {
    var sizer = scene.rexUI.add.sizer({
        orientation: 'x',
        space: { item: 10 }
    })
        // .add(
        //     createHeader(scene, data), // child
        //     { expand: true }
        // )
        .add(
            createTable(scene, data, 'skills', 1, type), // child
            { expand: true }
        )
        // .add(
        //     createTable(scene, data, 'items', 2), // child
        //     { expand: true }
        // )
    return sizer;
  }
  
  var createHeader = function (scene, data) {
    var title = scene.rexUI.add.label({
        orientation: 'x',
        text: scene.add.text(0, 0, 'Character'),
    });
    var header = scene.rexUI.add.label({
        orientation: 'y',
        icon: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 5, COLOR_LIGHT),
        text: scene.add.text(0, 0, data.name),
  
        space: { icon: 10 }
    });
  
    return scene.rexUI.add.sizer({
        orientation: 'y',
        space: { left: 5, right: 5, top: 5, bottom: 5, item: 10 }
    })
        .addBackground(
            scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
        )
        .add(
            title, // child
            { expand: true, align: 'left' }
        )
        .add(header, // child
            { proportion: 1, expand: true }
        );
  };
  
  var createTable = function (scene, data, key, rows, type) {
    var capKey = key.charAt(0).toUpperCase() + key.slice(1);
    var title = scene.rexUI.add.label({
        orientation: 'x',
        text: scene.add.text(0, 0, capKey),
    });
  
    var items = data[key];
    var columns = Math.ceil(items.length / rows);
    var table = scene.rexUI.add.gridSizer({
        column: columns,
        row: rows,
  
        rowProportions: 1,
        space: { column: 10, row: 10 },
        name: key  // Search this name to get table back
    });
  
    var item, r, c;
    var iconSize = (rows === 1) ? 80 : 40;
    for (var i = 0, cnt = items.length; i < cnt; i++) {
        item = items[i];
        r = i % rows;
        c = (i - r) / rows;
        table.add(
            createIcon(scene, item, iconSize, iconSize, type),
            c,
            r,
            'top',
            0,
            true
        );
    }
  
    return scene.rexUI.add.sizer({
        orientation: 'y',
        space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
    })
        .addBackground(
            scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
        )
        .add(
            title, // child
            0, // proportion
            'left', // align
            0, // paddingConfig
            true // expand
        )
        .add(table, // child
            1, // proportion
            'center', // align
            0, // paddingConfig
            true // expand
        );
  }
  
  var createIcon = function (scene, item, iconWidth, iconHeight, type) {
    if(type==="icon"){
      var label = scene.rexUI.add.label({
          orientation: 'y',
          icon: scene.add.image(0,0,item.image).setScrollFactor(0).setDepth(30).setScale(0.3,0.4),
          text: scene.add.text(0, 0, item.name),
          space: { icon: 3 }
      }).setInteractive();
      //console.log(item.category);
      label.getElement('icon').name = item.category;
      label.getElement('icon')._id = item._id;
    }else if(type==="dropzone"){
      var label = scene.rexUI.add.label({
        orientation: 'y',
        icon: scene.add.zone(0, 0, iconWidth, iconHeight).setRectangleDropZone(iconWidth, iconHeight), 
        text: scene.add.text(0, 0, item.name),
        space: { icon: 3 }
      }).setInteractive();
      label.getElement('icon').name = item.name;
    }
  
    return label;
  };

  module.exports = createPanel