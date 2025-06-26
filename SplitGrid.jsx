/**
 * SplitGrid.jsx - Adobe Photoshop Script
 * 
 * This script creates a dockable panel that allows users to split a Photoshop document
 * into a grid of smaller tiles. It's useful for creating image slices, tile sets,
 * or breaking down large images into manageable pieces.
 * 
 * Features:
 * - Customizable grid dimensions (columns and rows)
 * - Automatic tile generation with sequential naming
 * - JPEG export with high quality settings
 * - Transparent background support
 * - Batch processing of entire document
 * 
 * Use Cases:
 * - Creating sprite sheets for games
 * - Breaking large images into smaller pieces
 * - Generating tile sets for web design
 * - Creating image slices for responsive design
 * 
 * Author: Adobe Scripts Collection
 * Version: 1.0
 * Compatible with: Adobe Photoshop CC and later
 */

// SplitGrid.jsx - ScriptUI Panel for Grid Splitting
(function(thisObj) {
    /**
     * Builds the main user interface for the grid splitting tool
     * @param {Object} thisObj - The context object (Panel or Window)
     * @returns {Object} The created UI window/panel
     */
    function buildUI(thisObj) {
        // Create window or use existing panel
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Split Grid Tool", undefined, { resizeable: true });

        // Add description text
        win.add("statictext", undefined, "Split the active document into a grid of tiles");
        win.add("statictext", undefined, "");

        // Create input group for grid dimensions
        var gridGroup = win.add("group");
        gridGroup.orientation = "row";
        gridGroup.add("statictext", undefined, "Columns:");
        var columnsInput = gridGroup.add("edittext", [0, 0, 40, 20], "4");
        gridGroup.add("statictext", undefined, "Rows:");
        var rowsInput = gridGroup.add("edittext", [0, 0, 40, 20], "3");

        win.add("statictext", undefined, "");

        // Create split button with validation
        var splitBtn = win.add("button", undefined, "Split Document into Grid");
        splitBtn.onClick = function() {
            // Parse and validate input values
            var columns = parseInt(columnsInput.text, 10);
            var rows = parseInt(rowsInput.text, 10);
            if (isNaN(columns) || isNaN(rows) || columns < 1 || rows < 1) {
                alert("Please enter valid numbers for columns and rows.");
                return;
            }
            // Begin undo group for batch operation
            app.beginUndoGroup("Split Document into Grid");
            splitDocument(columns, rows);
            app.endUndoGroup();
        };

        /**
         * Splits the active document into a grid of tiles
         * Creates individual files for each tile with sequential naming
         * @param {number} columns - Number of columns in the grid
         * @param {number} rows - Number of rows in the grid
         */
        function splitDocument(columns, rows) {
            // Get the active document
            var doc = app.activeDocument;
            if (!doc) {
                alert("Please open a document to split.");
                return;
            }
            
            // Calculate document dimensions and tile sizes
            var docWidth = doc.width.as("px");
            var docHeight = doc.height.as("px");
            var tileWidth = docWidth / columns;
            var tileHeight = docHeight / rows;
            
            // Configure save options for high quality JPEG export
            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 12; // Maximum quality
            
            // Process each tile in the grid
            for (var y = 0; y < rows; y++) {
                for (var x = 0; x < columns; x++) {
                    // Calculate tile coordinates
                    var left = x * tileWidth;
                    var top = y * tileHeight;
                    var right = (x + 1) * tileWidth;
                    var bottom = (y + 1) * tileHeight;
                    
                    // Select the tile area
                    doc.selection.select([
                        [left, top],
                        [right, top],
                        [right, bottom],
                        [left, bottom]
                    ]);
                    
                    // Copy the selected tile
                    doc.selection.copy();
                    
                    // Create new document for the tile
                    var newDoc = app.documents.add(
                        tileWidth, 
                        tileHeight, 
                        doc.resolution, 
                        "Slice_" + (y * columns + x + 1), 
                        NewDocumentMode.RGB, 
                        DocumentFill.TRANSPARENT
                    );
                    
                    // Paste the tile content
                    newDoc.paste();
                    
                    // Generate filename with sequential numbering
                    var sliceNumber = y * columns + x + 1;
                    var file = new File(doc.path + "/slice_" + sliceNumber + ".jpg");
                    
                    // Save the tile as JPEG
                    newDoc.saveAs(file, saveOptions, true, Extension.LOWERCASE);
                    
                    // Close the tile document without saving changes
                    newDoc.close(SaveOptions.DONOTSAVECHANGES);
                }
            }
            
            // Notify user of completion
            alert("Done! Slices saved in the same folder as the original document.");
        }

        // Layout the UI elements
        win.layout.layout(true);
        return win;
    }

    // Initialize the UI
    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) myPanel.show();
})(this);