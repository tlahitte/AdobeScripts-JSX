(function gridBuilderScriptUI(thisObj) {
    function buildUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Grid Builder", undefined, {resizeable:true});
        myPanel.orientation = "column";
        myPanel.alignChildren = ["fill", "top"];
        myPanel.spacing = 10;
        myPanel.margins = 10;

        myPanel.add("statictext", undefined, "Generate Interview Grid");

        var colsGroup = myPanel.add("group", undefined);
        colsGroup.add("statictext", undefined, "Columns:");
        var colsInput = colsGroup.add("edittext", undefined, "5");
        colsInput.characters = 4;

        var rowsGroup = myPanel.add("group", undefined);
        rowsGroup.add("statictext", undefined, "Rows:");
        var rowsInput = rowsGroup.add("edittext", undefined, "5");
        rowsInput.characters = 4;

        var is3DGroup = myPanel.add("group");
        var is3DCheckbox = is3DGroup.add("checkbox", undefined, "Enable 3D Grid");
        is3DCheckbox.value = false;

        var buildBtn = myPanel.add("button", undefined, "Build Grid");

        buildBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 1) {
                alert("Please select at least one layer to clone.");
                return;
            }

            var cols = parseInt(colsInput.text, 10);
            var rows = parseInt(rowsInput.text, 10);
            var is3D = is3DCheckbox.value;

            if (isNaN(cols) || isNaN(rows) || cols < 1 || rows < 1) {
                alert("Please enter valid positive integers.");
                return;
            }

            app.beginUndoGroup("Create Grid");

            // Setup
            var totalNeeded = cols * rows;
            var sourceLayer = selectedLayers[0];
            var allGridLayers = [sourceLayer];

            for (var i = 1; i < totalNeeded; i++) {
                var dup = sourceLayer.duplicate();
                allGridLayers.push(dup);
            }

            var spacingX = comp.width / cols;
            var spacingY = comp.height / rows;
            var startX = spacingX / 2;
            var startY = spacingY / 2;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    var index = r * cols + c;
                    if (index >= allGridLayers.length) break;

                    var layer = allGridLayers[index];
                    layer.moveToBeginning();

                    if (is3D) {
                        layer.threeDLayer = true;
                        layer.transform.position.setValue([startX + c * spacingX, startY + r * spacingY, 0]);
                    } else {
                        layer.transform.position.setValue([startX + c * spacingX, startY + r * spacingY]);
                    }
                }
            }

            // Create or find Controller
            var controller = null;
            for (var j = 1; j <= comp.numLayers; j++) {
                if (comp.layer(j).name === "Controller") {
                    controller = comp.layer(j);
                    break;
                }
            }

            if (!controller) {
                controller = comp.layers.addNull();
                controller.name = "Controller";
                controller.label = 10;
                controller.motionBlur = false;

                controller.Effects.addProperty("ADBE Slider Control").name = "Max Distance";
                controller.effect("Max Distance")("Slider").setValue(500);

                controller.Effects.addProperty("ADBE Slider Control").name = "Min Scale";
                controller.effect("Min Scale")("Slider").setValue(100);

                controller.Effects.addProperty("ADBE Slider Control").name = "Max Scale";
                controller.effect("Max Scale")("Slider").setValue(150);

                controller.Effects.addProperty("ADBE Slider Control").name = "Z Offset";
                controller.effect("Z Offset")("Slider").setValue(500);
            }

            // Expression for scale (works for both 2D and 3D)
            var scaleExpr =
                'var pos = thisLayer.toWorld([0,0]);\n' +
                'var ctrl = thisComp.layer("Controller");\n' +
                'var ctrlPos = ctrl.toWorld(ctrl.anchorPoint);\n' +
                'var maxDist = ctrl.effect("Max Distance")("Slider");\n' +
                'var minScale = ctrl.effect("Min Scale")("Slider");\n' +
                'var maxScale = ctrl.effect("Max Scale")("Slider");\n' +
                'var dist = length(pos, ctrlPos);\n' +
                'var scaleFactor = ease(dist, 0, maxDist, maxScale, minScale);\n' +
                '[scaleFactor, scaleFactor];';

            // Expression for Z-position
            var zExpr =
                'var pos = thisLayer.toWorld([0,0]);\n' +
                'var ctrl = thisComp.layer("Controller");\n' +
                'var ctrlPos = ctrl.toWorld(ctrl.anchorPoint);\n' +
                'var zOffset = ctrl.effect("Z Offset")("Slider");\n' +
                'var dist = length(pos, ctrlPos);\n' +
                'value + [0, 0, dist / zOffset * 100];';

            for (var k = 0; k < allGridLayers.length; k++) {
                var layer = allGridLayers[k];
                layer.property("Scale").expression = scaleExpr;

                if (is3D) {
                    var posProp = layer.property("Position");
                    posProp.expression = zExpr;
                }
            }

            app.endUndoGroup();
        };

        myPanel.layout.layout(true);
        return myPanel;
    }

    var gridPanel = buildUI(thisObj);
    if (gridPanel instanceof Window) {
        gridPanel.center();
        gridPanel.show();
    }
})(this);
