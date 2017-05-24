function actionWithType(type, context) {
  var doc = context.document;
  var controller = doc.actionsController();

  if (controller.actionWithName) {
    return controller.actionWithName(type);
  } else if (controller.actionWithID) {
    return controller.actionWithID(type);
  } else {
    return controller.actionForID(type);
  }
}
