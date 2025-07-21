(function(thisObj) {
    // === Build the UI ===
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Y-Driven Animator", undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];

        // === Info Tooltip ===
        var infoGroup = win.add("group");
        infoGroup.orientation = "row";
        var infoIcon = infoGroup.add("statictext", undefined, "ⓘ");
        infoIcon.graphics.font = ScriptUI.newFont("Arial", "Bold", 16);
        var infoText = infoGroup.add("statictext", undefined, "This script links Scale to the 3D distance from a controller, with remapping and offset.");
        infoText.helpTip = "Applies an expression to selected layers so their Scale is driven by the 3D distance to a controller null. Offset is in frames.";

        // === Controller Section ===
        var ctrlPanel = win.add("panel", undefined, "Controller");
        ctrlPanel.orientation = "column";
        ctrlPanel.alignChildren = ["fill", "top"];
        var createBtn = ctrlPanel.add("button", undefined, "Create Controller");
        createBtn.helpTip = "Create or select the Controller null with required effects.";

        // === Offset Section ===
        var offsetPanel = win.add("panel", undefined, "Offset");
        offsetPanel.orientation = "row";
        offsetPanel.alignChildren = ["left", "center"];
        offsetPanel.add("statictext", undefined, "Offset (frames):");
        var offsetField = offsetPanel.add("edittext", undefined, "0");
        offsetField.characters = 4;
        offsetField.helpTip = "Frame offset for the driven animation.";

        // === Apply Button ===
        var applyBtn = win.add("button", undefined, "Apply Expression");
        applyBtn.alignment = "center";
        applyBtn.helpTip = "Apply the 3D distance-driven expression to selected layers' Scale property.";

        // === Create Controller Functionality ===
        createBtn.onClick = function() {
            app.beginUndoGroup("Create Controller");
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                app.endUndoGroup();
                return;
            }
            var controller = getOrCreateController(comp);
            if (controller) {
                alert('Controller is ready!');
            }
            app.endUndoGroup();
        };

        // === Apply Expression Functionality (Scale only, 3D distance) ===
        applyBtn.onClick = function() {
            app.beginUndoGroup("Apply Y-Driven Expression");
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                app.endUndoGroup();
                return;
            }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                alert("Please select at least one layer.");
                app.endUndoGroup();
                return;
            }
            var offsetFrames = parseInt(offsetField.text, 10);
            if (isNaN(offsetFrames)) offsetFrames = 0;
            var offsetSeconds = comp.frameDuration * offsetFrames;
            var expression = get3DDistanceExpression(offsetSeconds);
            var affectedCount = 0;
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                if (layer.property("Scale")) {
                    layer.property("Scale").expression = expression;
                    affectedCount++;
                }
            }
            app.endUndoGroup();
            // Show summary popup
            showSummaryPopup(affectedCount, offsetFrames);
        };

        win.layout.layout(true);
        return win;
    }

    // === Controller Creation ===
    function getOrCreateController(comp) {
        var ctrl = null;
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).name === "Controller") {
                ctrl = comp.layer(i);
                break;
            }
        }
        if (!ctrl) {
            ctrl = comp.layers.addNull();
            ctrl.name = "Controller";
            ctrl.label = 10; // Cyan
        }
        addOrUpdateEffect(ctrl, "Point Control", "Start Pos", [960, 0]);
        addOrUpdateEffect(ctrl, "Point Control", "End Pos", [960, 1920]);
        addOrUpdateEffect(ctrl, "Slider Control", "Min Value", 0);
        addOrUpdateEffect(ctrl, "Slider Control", "Max Value", 100);
        // Removed Time Offset effect
        return ctrl;
    }

    function addOrUpdateEffect(layer, fxName, label, defaultVal) {
        var fx = layer.property("Effects");
        var prop = fx.property(label);
        if (!prop) {
            var ctrl = fx.addProperty(fxName);
            ctrl.name = label;
            if (ctrl.property(1).canSetExpression) {
                ctrl.property(1).setValue(defaultVal);
            }
        } else {
            // Update value if needed
            if (prop.property(1).canSetExpression && prop.property(1).value !== defaultVal) {
                prop.property(1).setValue(defaultVal);
            }
        }
    }

    // === Expression Generation (Scale only, 3D distance) ===
    function get3DDistanceExpression(userOffset) {
        // userOffset is in seconds
        return 'var ctrl = thisComp.layer("Controller");\n' +
            'if (!ctrl) { value; } else {\n' +
            '  var minVal = ctrl.effect("Min Value")("Slider");\n' +
            '  var maxVal = ctrl.effect("Max Value")("Slider");\n' +
            '  var t = time - ' + userOffset + ';\n' +
            '  var ctrlPos = ctrl.position.valueAtTime(t);\n' +
            '  var layerPos = thisLayer.position.valueAtTime(t);\n' +
            '  if (ctrlPos[0] >= layerPos[0]) {\n' +
            '    [maxVal, maxVal];\n' +
            '  } else {\n' +
            '    var startX = ctrl.effect("Start Pos")("Point")[0];\n' +
            '    var dist = length(ctrlPos - layerPos);\n' +
            '    var maxDist = length([startX, layerPos[1], layerPos.length > 2 ? layerPos[2] : 0] - layerPos);\n' +
            '    var norm = maxDist !== 0 ? clamp(dist / maxDist, 0, 1) : 0;\n' +
            '    var remapped = linear(norm, 0, 1, maxVal, minVal);\n' +
            '    [remapped, remapped, layerPos.length > 2 ? remapped : undefined].filter(function(v){return v!==undefined;});\n' +
            '  }\n' +
            '}';
    }

    // === Summary Popup ===
    function showSummaryPopup(count, offsetFrames) {
        var msg = "Expression applied to " + count + " layer" + (count === 1 ? "" : "s") + "\n";
        msg += "Property: Scale\n";
        msg += "Offset: " + offsetFrames + " frame" + (offsetFrames === 1 ? "" : "s");
        alert(msg, "Y-Driven Animator");
    }

    // === Run the UI ===
    var panel = buildUI(thisObj);
    if (panel instanceof Window) {
        panel.center();
        panel.show();
    }

})(this);
