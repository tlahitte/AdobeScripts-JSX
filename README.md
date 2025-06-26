# Adobe Scripts Collection

A collection of useful Adobe Creative Suite scripts for After Effects and Photoshop that enhance workflow efficiency and creative capabilities.

## 📁 Scripts Overview

This repository contains two powerful scripts designed to streamline common creative tasks:

### 🎬 CircularAnimator.jsx (After Effects)
A comprehensive circular motion animation tool that creates controller-based spiral animations with customizable parameters.

### 🖼️ SplitGrid.jsx (Photoshop)
A grid splitting utility that breaks down large images into smaller tiles for various creative and technical applications.

---

## 🎬 CircularAnimator.jsx

### Description
CircularAnimator creates sophisticated circular motion animations in After Effects using a controller-based system. It allows you to create spiral animations where multiple layers follow a circular path with staggered timing, growth effects, and customizable parameters.

### Features
- **Controller-Based System**: Create multiple controllers for different animation sets
- **Real-Time Parameter Control**: Adjust timing, radius, rotation speed, and layer delays via sliders
- **Staggered Animation**: Layers start with delays based on their index for cascading effects
- **Growth Animation**: Layers scale from 0% to 100% with smooth easing
- **Interactive UI**: Dropdown selection shows controller status and attached layer counts
- **Cleanup Tools**: Remove all controllers and expressions with one click
- **Undo Support**: All operations support After Effects' undo system

### Installation
1. Download `CircularAnimator.jsx`
2. Place it in your After Effects Scripts folder:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts`
   - **Mac**: `/Applications/Adobe After Effects [version]/Scripts`
3. Restart After Effects
4. Access via `File > Scripts > CircularAnimator.jsx`

### Usage

#### Basic Workflow
1. **Create Controller**: Click "Create New Controller" to add a new animation controller
2. **Select Layers**: Choose the layers you want to animate
3. **Apply Expression**: Select your controller from the dropdown and click "Apply Circular Motion Expression"
4. **Adjust Parameters**: Use the sliders on the controller layer to fine-tune the animation

#### Controller Parameters
- **Grow Duration**: How long the animation grows (seconds)
- **Max Radius**: Maximum radius of the circular motion (pixels)
- **Revolutions Per Second**: Speed of rotation around the circle
- **Layer Delay**: Time delay between layers starting their animation

#### Advanced Features
- **Multiple Controllers**: Create several controllers for different animation groups
- **Layer Index Timing**: Higher layer indices start later (Layer 1 starts first, Layer 2 after delay, etc.)
- **Center-Based Animation**: All animations center around the composition center
- **Expression-Based**: Uses After Effects expressions for real-time parameter control

### Example Use Cases
- **Logo Reveals**: Create spiral logo animations
- **Particle Systems**: Animate multiple particles in circular patterns
- **Text Animations**: Stagger text elements in circular motion
- **Product Showcases**: Rotate products around a central point
- **Abstract Graphics**: Create complex spiral patterns

---

## 🖼️ SplitGrid.jsx

### Description
SplitGrid is a Photoshop utility that automatically splits large documents into a customizable grid of smaller tiles. Perfect for creating sprite sheets, tile sets, or breaking down large images into manageable pieces.

### Features
- **Customizable Grid**: Set any number of columns and rows
- **Automatic Naming**: Sequential file naming (slice_1.jpg, slice_2.jpg, etc.)
- **High Quality Export**: Maximum quality JPEG export
- **Transparent Support**: Maintains transparency in output files
- **Batch Processing**: Processes entire document automatically
- **Path Preservation**: Saves tiles in the same folder as the original document

### Installation
1. Download `SplitGrid.jsx`
2. Place it in your Photoshop Scripts folder:
   - **Windows**: `C:\Program Files\Adobe\Adobe Photoshop [version]\Presets\Scripts`
   - **Mac**: `/Applications/Adobe Photoshop [version]/Presets/Scripts`
3. Restart Photoshop
4. Access via `File > Scripts > SplitGrid.jsx`

### Usage

#### Basic Workflow
1. **Open Document**: Open the image you want to split in Photoshop
2. **Set Grid Size**: Enter the number of columns and rows in the interface
3. **Split**: Click "Split Document into Grid"
4. **Locate Files**: Find your tiles in the same folder as the original document

#### Grid Configuration
- **Columns**: Number of vertical divisions
- **Rows**: Number of horizontal divisions
- **Tile Size**: Automatically calculated based on document dimensions

#### Output Details
- **Format**: JPEG with maximum quality (12)
- **Naming**: `slice_1.jpg`, `slice_2.jpg`, etc. (left-to-right, top-to-bottom)
- **Location**: Same folder as original document
- **Dimensions**: Equal-sized tiles based on grid division

### Example Use Cases
- **Game Development**: Create sprite sheets for 2D games
- **Web Design**: Generate image slices for responsive layouts
- **Print Design**: Break large posters into printable sections
- **Social Media**: Create grid posts for Instagram or other platforms
- **Tile Sets**: Generate texture tiles for 3D applications

---

## 🛠️ Technical Requirements

### CircularAnimator.jsx
- **Software**: Adobe After Effects CC (2018 or later)
- **Platform**: Windows 10/11, macOS 10.14 or later
- **Memory**: 8GB RAM recommended
- **Scripting**: ExtendScript/JavaScript support

### SplitGrid.jsx
- **Software**: Adobe Photoshop CC (2018 or later)
- **Platform**: Windows 10/11, macOS 10.14 or later
- **Memory**: 4GB RAM minimum
- **Scripting**: ExtendScript/JavaScript support

---

## 📝 Usage Notes

### CircularAnimator.jsx
- Controllers are created as null layers with blue labels for easy identification
- Expressions are applied to both Position and Scale properties
- Layer order affects animation timing (top layers start first)
- All operations support After Effects' undo system
- Controllers can be manually adjusted in the timeline

### SplitGrid.jsx
- Original document remains unchanged
- Tiles are saved as separate JPEG files
- File naming follows left-to-right, top-to-bottom order
- Transparent areas are preserved in output files
- Large documents may take time to process

---

## 🔧 Troubleshooting

### CircularAnimator.jsx
**Issue**: "No controllers found"
- **Solution**: Create a new controller first using the "Create New Controller" button

**Issue**: Layers not animating
- **Solution**: Ensure layers are selected before applying expressions

**Issue**: Expression errors
- **Solution**: Check that the controller layer exists and has all required sliders

### SplitGrid.jsx
**Issue**: "Please open a document to split"
- **Solution**: Make sure a document is open and active in Photoshop

**Issue**: Invalid grid dimensions
- **Solution**: Enter positive numbers for both columns and rows

**Issue**: Files not saving
- **Solution**: Ensure you have write permissions in the document's folder

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow existing code style and commenting conventions
- Test scripts in both Windows and macOS environments
- Update documentation for any new features
- Ensure backward compatibility with supported Adobe versions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Adobe Creative Suite scripting community
- ExtendScript documentation and examples
- After Effects and Photoshop user communities

---

## 📞 Support

If you encounter any issues or have questions about these scripts:

1. Check the troubleshooting section above
2. Review the script comments for detailed explanations
3. Open an issue on this repository
4. Ensure you're using a supported version of Adobe software

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Compatibility**: Adobe Creative Suite CC 2018+ 