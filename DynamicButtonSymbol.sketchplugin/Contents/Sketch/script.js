/*
  Heavily influenced by https://github.com/fuggfuggfugg/sketch-dynamic-button-3.5
*/
@import 'libs/functions.js';

function alert(msg, title) {
  title = title || 'alert';
  var app = [NSApplication sharedApplication];
  [app displayDialog:msg withTitle:title];
}

function getClassName(layer) {
  var klass = [layer class];
  return klass;
}

function isTextLayer(layer) {
  return getClassName(layer) == 'MSTextLayer';
}

function isSymbolLayer(layer) {
  var className = getClassName(layer);
  return className == 'MSSymbolMaster' || className == 'MSSymbolInstance'
}

function findTextLayer(layers) {
  return layers.reduce(function(prev, current) {
    if (isTextLayer(current)) {
      prev = current;
    }

    return prev;
  }, []);
}

function findBackgroundLayer(layer) {
  var layers = layer.parentGroup().layers()
  return layers[0];
}

function findSymbol(layer) {
  if (layer) {
    if (isSymbolLayer(layer)) {
      return layer;
    }

    return findSymbol([layer parentGroup]);
  }

  return null;
}

function getButtonDimensionsForLayer(layer) {
  var frame = [layer frame]
  var layerHeight = [frame height];
  var layerWidth = [frame width];
  var layerX = [frame x];
  var layerY = [frame y];
  var parentLayer = [layer parentGroup];
  var parentFrame = [parentLayer frame];
  var parentHeight = [parentFrame height];
  var parentWidth = [parentFrame width];
  var offsetTop = layerY;
  var offsetBottom = parentHeight - layerHeight - layerY;
  var offsetLeft = layerX;
  var offsetRight = parentWidth - layerWidth - layerX;

  return {
    x: layerX,
    y: layerY,
    width: layerWidth,
    height: layerHeight,
    offsetTop: offsetTop,
    offsetBottom: offsetBottom,
    offsetLeft: offsetLeft,
    offsetRight: offsetRight,
    totalWidth: parentWidth,
    totalHeight: parentHeight
  }
}

function getMasterForSymbol(symbol) {
  if (symbol) {
    return [symbol symbolMaster];
  }

  return null;
}

function getButtonText(symbol) {
  var text = '';

  if (symbol) {
    var overrides = symbol.overrides();
    overrides = [overrides allValues];
    NSLog(@"%@", overrides);

    text = overrides.reduce(function(prev, current) {
      var className = getClassName(current);
      if (className == '__NSCFString' || className == 'NSTaggedPointerString') {
        prev = current
      }

      return prev;
    }, '');
  }

  return text;
}

function getDimensionsForTextLayerWithText(layer, text) {
  var oldTextDimensions = getButtonDimensionsForLayer(layer);
  var symbolTextValue = layer.stringValue();
  layer.setStringValue(text);
  var newTextDimensions = getButtonDimensionsForLayer(layer);

  var dimensions = {
    totalHeight: oldTextDimensions.totalHeight,
    totalWidth: oldTextDimensions.totalWidth + (newTextDimensions.width - oldTextDimensions.width)
  };
  layer.setStringValue(symbolTextValue);

  return dimensions;
}

function createTextLayer(parent, padding) {
  var textLayer = MSTextLayer.new();

  textLayer.setStringValue('Button');
  textLayer.name = 'Button';

  return textLayer;
}

function createBackground(parent, textLayer, padding) {
  var rect = textLayer.rect();
  var style = MSDefaultStyle.defaultStyle();
  var rectShape = MSRectangleShape.alloc().init();
  var container = MSShapeGroup.alloc().init();
  var addedHeight = padding.top + padding.bottom;
  var addedWidth = padding.left + padding.right;
  rectShape.frame = MSRect.rectWithRect(rect);

  container.addLayers([rectShape]);
  container.style().addStylePartOfType(0);
  container.name = 'Background';
  container.resizeToFitChildrenWithOption(1);

  var fill = container.style().fills().firstObject();
  fill.color = MSColor.colorWithRed_green_blue_alpha(.8, .8, .8, 1);

  var frame = [container frame];
  var textHeight = [[textLayer frame] height];
  var textWidth = [[textLayer frame] width];
  [frame setHeight:textHeight + addedHeight];
  [frame  setWidth:textWidth + addedWidth];
  frame.x = -padding.left;
  frame.y = -padding.top;

  return container;
}

function getPaddingFromUser(context) {
  var sketch = context.api();

  var paddingLeft = sketch.getStringFromUser('Padding left', '10');
  var paddingRight = paddingLeft ? sketch.getStringFromUser('Padding right', '10') : null;
  var paddingTop = paddingRight ? sketch.getStringFromUser('Padding top', '10') : null;
  var paddingBottom = paddingTop ? sketch.getStringFromUser('Padding bottom', '10') : null;

  if (paddingLeft && paddingRight && paddingTop && paddingBottom) {
    return {
      top: parseInt(paddingTop, 10),
      right: parseInt(paddingRight, 10),
      bottom: parseInt(paddingBottom, 10),
      left: parseInt(paddingLeft, 10)
    };
  }

  return null;
}

function createButtonSymbol(context) {
  var doc = context.document;
  var page = doc.currentPage();
  var padding = getPaddingFromUser(context);

  // If user cancels one of the dialogs we'll just exit
  if (!padding) {
    return;
  }

  var textLayer = createTextLayer(page, padding);
  var backgroundLayer = createBackground(page, textLayer, padding);

  page.addLayers([backgroundLayer, textLayer]);
  textLayer.setIsSelected(true);
  backgroundLayer.setIsSelected(true);

  var symbolAction = actionWithType('MSCreateSymbolAction', context);
  // If for som reason we can't perform the symbol creation, exit with an alert
  // and rollback the changes we made
  if (!symbolAction.validate()) {
    page.removeLayer_(textLayer);
    page.removeLayer_(backgroundLayer);
    alert('Could not create symbol.', 'Symbol');
    return;
  }

  symbolAction.doPerformAction(nil);
}

function onRun(context) {
  var selection = context.selection;

  if ([selection count] == 0) {
    alert('You need to select a button symbol.', 'Empty selection');
    return;
  }

  var symbol = findSymbol(selection[0]);
  var master = getMasterForSymbol(symbol);

  if (master) {
    var layers = master.layers();
    var layer = findTextLayer(layers);
    var text = getButtonText(symbol);
    var dimensions = getDimensionsForTextLayerWithText(layer, text);
    var frame = [symbol frame];

    [frame setHeight:dimensions.totalHeight]
    [frame setWidth:dimensions.totalWidth]
  }
}

function onCreate(context) {
  createButtonSymbol(context);
}
