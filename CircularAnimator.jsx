/**
 * CircularAnimator.jsx - Adobe After Effects Script
 * 
 * This script creates a dockable panel that allows users to create circular motion animations
 * for multiple layers in After Effects. It provides a controller-based system where users can:
 * - Create controller layers with customizable parameters
 * - Apply circular motion expressions to selected layers
 * - Control timing, radius, revolutions, and layer delays
 * - Clean up all controllers and expressions
 * 
 * Features:
 * - Interactive UI with dropdown for controller selection
 * - Real-time parameter control via sliders
 * - Staggered animation timing based on layer index
 * - Automatic expression generation and application
 * - Cleanup functionality for project maintenance
 * 
 * Author: Adobe Scripts Collection
 * Version: 1.0
 * Compatible with: Adobe After Effects CC and later
 */

// Create a dockable panel UI
(function(thisObj) {
    var globalRefreshFunction = null; // Global reference to refresh function for cross-function communication

    /**
     * Builds the main user interface for the circular motion tool
     * @param {Object} thisObj - The context object (Panel or Window)
     * @returns {Object} The created UI window/panel
     */
    function buildUI(thisObj) {
        // Create window or use existing panel
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Circular Motion Tool", undefined, { resizeable: true });
        
        // Add title with styling
        var titleText = win.add("statictext", undefined, "Circular Motion Controller");
        titleText.graphics.foregroundColor = titleText.graphics.newPen(titleText.graphics.PenType.SOLID_COLOR, [0.2, 0.4, 0.8], 1);
        
        // Add workflow tooltip section
        win.add("statictext", undefined, "");
        var tooltipGroup = win.add("group");
        tooltipGroup.add("statictext", undefined, "📋 Workflow:");
        tooltipGroup.add("statictext", undefined, "1. Create New Controller");
        tooltipGroup.add("statictext", undefined, "2. Select layers to animate");
        tooltipGroup.add("statictext", undefined, "3. Choose controller from dropdown");
        tooltipGroup.add("statictext", undefined, "4. Apply Circular Motion Expression");
        tooltipGroup.add("statictext", undefined, "");
        tooltipGroup.add("statictext", undefined, "💡 Note: Layer index affects timing");
        tooltipGroup.add("statictext", undefined, "   (Layer 1 starts first, Layer 2 after delay, etc.)");
        
        win.add("statictext", undefined, "");
        
        // Create controller button
        var createControllerBtn = win.add("button", undefined, "Create New Controller");
        createControllerBtn.onClick = function() {
            app.beginUndoGroup("Create New Controller");
            createNewController();
            app.endUndoGroup();
        };

        win.add("statictext", undefined, "");
        win.add("statictext", undefined, "Select Controller:");
        
        // Create controller selection dropdown with responsive size
        var controllerDropdown = win.add("dropdownlist", [0, 0, 150, 25], []);
        controllerDropdown.selection = 0;
        
        /**
         * Refreshes the controller list in the dropdown
         * Shows controller names with attached layer counts
         */
        function refreshControllerList() {
            controllerDropdown.removeAll();
            var comp = app.project.activeItem;
            if (comp && comp instanceof CompItem) {
                var controllers = getAllControllers(comp);
                for (var i = 0; i < controllers.length; i++) {
                    var controller = controllers[i];
                    var attachedLayers = countAttachedLayers(comp, controller.name);
                    var displayName = controller.name + " (" + attachedLayers + " layers)";
                    controllerDropdown.add("item", displayName);
                }
                // Select the most recent controller if available
                if (controllers.length > 0) {
                    controllerDropdown.selection = controllers.length - 1;
                }
            }
        }
        
        // Store the refresh function globally so it can be called from other functions
        globalRefreshFunction = refreshControllerList;
        
        // Refresh list when composition changes
        win.addEventListener("activate", refreshControllerList);
        
        // Apply expression button
        var btn = win.add("button", undefined, "Apply Circular Motion Expression");
        btn.onClick = function() {
            app.beginUndoGroup("Apply Circular Motion Expression");
            applyExpressionToSelectedLayers(controllerDropdown);
            app.endUndoGroup();
        };

        win.add("statictext", undefined, "");
        
        // Cleanup button
        var cleanupBtn = win.add("button", undefined, "Clean Up All Controllers");
        cleanupBtn.onClick = function() {
            app.beginUndoGroup("Clean Up All Controllers");
            cleanupAllControllers();
            app.endUndoGroup();
        };

        // Initial refresh
        refreshControllerList();

        // Make UI responsive
        win.layout.layout(true);
        win.layout.resize();
        
        // Handle resize events for responsive design
        win.addEventListener("resize", function() {
            win.layout.resize();
            win.layout.layout(true);
        });

        return win;
    }

    /**
     * Removes all controllers and their associated expressions from the composition
     * This function cleans up the entire circular motion system
     */
    function cleanupAllControllers() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var controllersToDelete = [];
        var layersToClean = [];

        // Find all controllers and layers with expressions
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name.indexOf("Controller") === 0) {
                controllersToDelete.push(layer);
            } else {
                try {
                    var positionExpr = layer.property("Position").expression;
                    var scaleExpr = layer.property("Scale").expression;
                    // Check if layer has circular motion expressions
                    if ((positionExpr && positionExpr.indexOf("thisComp.layer(\"Controller") !== -1) ||
                        (scaleExpr && scaleExpr.indexOf("thisComp.layer(\"Controller") !== -1)) {
                        layersToClean.push(layer);
                    }
                } catch (e) {
                    // No expression, continue
                }
            }
        }

        // Remove expressions from all layers
        for (var j = 0; j < layersToClean.length; j++) {
            try {
                layersToClean[j].property("Position").expression = "";
                layersToClean[j].property("Scale").expression = "";
            } catch (e) {
                // Continue if expression removal fails
            }
        }

        // Delete all controller layers
        for (var k = 0; k < controllersToDelete.length; k++) {
            try {
                controllersToDelete[k].remove();
            } catch (e) {
                // Continue if deletion fails
            }
        }

        // Refresh the dropdown
        if (globalRefreshFunction) {
            globalRefreshFunction();
        }

        alert("Cleaned up " + layersToClean.length + " layer(s) and deleted " + controllersToDelete.length + " controller(s).\n\nAll position and scale expressions have been removed and controllers deleted.");
    }

    /**
     * Counts how many layers are attached to a specific controller
     * @param {CompItem} comp - The composition to search in
     * @param {string} controllerName - Name of the controller to count attachments for
     * @returns {number} Number of layers attached to the controller
     */
    function countAttachedLayers(comp, controllerName) {
        var count = 0;
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name.indexOf("Controller") !== 0) { // Skip controller layers
                try {
                    var positionExpr = layer.property("Position").expression;
                    if (positionExpr && positionExpr.indexOf("thisComp.layer(\"" + controllerName + "\")") !== -1) {
                        count++;
                    }
                } catch (e) {
                    // Expression might not exist, continue
                }
            }
        }
        return count;
    }

    /**
     * Gets all controller layers from the composition
     * @param {CompItem} comp - The composition to search in
     * @returns {Array} Array of controller layers
     */
    function getAllControllers(comp) {
        var controllers = [];
        // Search from top to bottom to get controllers in layer order
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name.indexOf("Controller") === 0) {
                controllers.push(layer);
            }
        }
        return controllers;
    }

    /**
     * Creates a new controller layer with sliders for circular motion parameters
     * The controller is a null layer that contains expression controls
     */
    function createNewController() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        // Generate a unique controller name
        var controllerName = generateUniqueControllerName(comp);
        
        // Create the controller layer (null layer)
        var controllerLayer = comp.layers.addNull();
        controllerLayer.name = controllerName;
        controllerLayer.label = 9; // Blue label for easy identification
        
        // Add sliders to the controller for parameter control
        addSlidersToController(controllerLayer);

        // Refresh the dropdown list to include the new controller
        if (globalRefreshFunction) {
            globalRefreshFunction();
        }

        alert("Created new controller: " + controllerName + "\n\nNow select layers and use 'Apply Circular Motion Expression' to bind them to this controller.");
    }

    /**
     * Generates a unique name for a new controller
     * @param {CompItem} comp - The composition to check for existing names
     * @returns {string} Unique controller name
     */
    function generateUniqueControllerName(comp) {
        var baseName = "Controller";
        var counter = 1;
        var controllerName = baseName;
        
        // Check if name already exists and increment counter if needed
        while (controllerNameExists(comp, controllerName)) {
            controllerName = baseName + " " + counter;
            counter++;
        }
        
        return controllerName;
    }

    /**
     * Checks if a controller name already exists in the composition
     * @param {CompItem} comp - The composition to search in
     * @param {string} name - The name to check
     * @returns {boolean} True if name exists, false otherwise
     */
    function controllerNameExists(comp, name) {
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).name === name) {
                return true;
            }
        }
        return false;
    }

    /**
     * Applies circular motion expressions to selected layers
     * Creates complex expressions that control position and scale based on controller parameters
     * @param {Object} controllerDropdown - The dropdown containing controller selection
     */
    function applyExpressionToSelectedLayers(controllerDropdown) {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select at least one layer before applying circular motion expression.");
            return;
        }

        // Get selected controller from dropdown
        if (controllerDropdown.items.length === 0) {
            alert("No controllers found. Please create a controller first.");
            return;
        }

        var selectedControllerName = controllerDropdown.selection.text;
        // Extract the actual controller name (remove the layer count part)
        var actualControllerName = selectedControllerName.split(" (")[0];
        
        var controllerLayer = null;
        
        // Find the selected controller layer
        for (var i = 1; i <= comp.numLayers; i++) {
            if (comp.layer(i).name === actualControllerName) {
                controllerLayer = comp.layer(i);
                break;
            }
        }

        if (!controllerLayer) {
            alert("Selected controller not found: " + actualControllerName);
            return;
        }

        var controllerName = controllerLayer.name;
        
        // Complex expression for circular motion position
        // This expression creates a spiral motion with growth and rotation
        var expression = 
            "var controller = thisComp.layer(\"" + controllerName + "\");\n" +
            "var growDuration = controller.effect(\"Grow Duration\")(\"Slider\");\n" +
            "var maxRadius = controller.effect(\"Max Radius\")(\"Slider\");\n" +
            "var revolutionsPerSecond = controller.effect(\"Revolutions Per Second\")(\"Slider\");\n" +
            "var layerDelay = controller.effect(\"Layer Delay\")(\"Slider\");\n" +
            "var indexOffset = (index - 1) * layerDelay;\n" +
            "var t = time - indexOffset;\n" +
            "var compCenter = [thisComp.width / 2, thisComp.height / 2];\n" +
            "var growthFactor = clamp(t / growDuration, 0, 1);\n" +
            "growthFactor = easeOut(growthFactor, 0, 1);\n" +
            "var radius = maxRadius * growthFactor;\n" +
            "var angle = t * revolutionsPerSecond * 2 * Math.PI;\n" +
            "var x = Math.cos(angle) * radius;\n" +
            "var y = Math.sin(angle) * radius;\n" +
            "compCenter + [x, y];";

        // Expression for scale animation (grows from 0 to 100%)
        var scaleExpression = 
            "var controller = thisComp.layer(\"" + controllerName + "\");\n" +
            "var growDuration = controller.effect(\"Grow Duration\")(\"Slider\");\n" +
            "var layerDelay = controller.effect(\"Layer Delay\")(\"Slider\");\n" +
            "var indexOffset = (index - 1) * layerDelay;\n" +
            "var t = time - indexOffset;\n" +
            "var scaleFactor = clamp(t / growDuration, 0, 1);\n" +
            "scaleFactor = easeOut(scaleFactor, 0, 1);\n" +
            "var scale = scaleFactor * 100;\n" +
            "[scale, scale];";

        // Apply expressions to all selected layers
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            try {
                layer.property("Position").expression = expression;
                layer.property("Scale").expression = scaleExpression;
            } catch (e) {
                alert("Failed to apply expression to: " + layer.name);
            }
        }

        // Refresh the dropdown to show updated layer counts
        if (globalRefreshFunction) {
            globalRefreshFunction();
        }

        alert("Applied circular motion and scale expressions to " + selectedLayers.length + " layer(s) using controller: " + controllerName);
    }

    /**
     * Finds the most recently created controller in the composition
     * @param {CompItem} comp - The composition to search in
     * @returns {Layer|null} The most recent controller layer or null if none found
     */
    function findMostRecentController(comp) {
        var controllers = [];
        
        // Find all controller layers
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.name.indexOf("Controller") === 0) {
                controllers.push(layer);
            }
        }
        
        if (controllers.length === 0) {
            return null;
        }
        
        // Return the most recently created controller (highest index)
        return controllers[controllers.length - 1];
    }

    /**
     * Adds slider controls to a controller layer
     * These sliders control the circular motion parameters
     * @param {Layer} controllerLayer - The controller layer to add sliders to
     */
    function addSlidersToController(controllerLayer) {
        // Define the sliders we need with their default values
        var sliders = [
            { name: "Grow Duration", value: 2 },           // How long the animation grows
            { name: "Max Radius", value: 200 },            // Maximum radius of the circular motion
            { name: "Revolutions Per Second", value: 0.1 }, // Speed of rotation
            { name: "Layer Delay", value: 0.2 }            // Delay between layers starting
        ];

        // Add sliders to the controller layer
        for (var s = 0; s < sliders.length; s++) {
            var effect = controllerLayer.property("Effects").addProperty("ADBE Slider Control");
            effect.name = sliders[s].name;
            effect.property("Slider").setValue(sliders[s].value);
        }
    }

    // Initialize the UI
    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) {
        myPanel.center();
        myPanel.show();
    }

})(this);

