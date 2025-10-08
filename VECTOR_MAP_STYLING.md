# Vector Map Customization Guide

Your new vector map (`index_vector.html`) gives you **complete control** over every visual element!

## 🎨 Map Styling Options

### Background Color
In `sketch_vector.js`, line ~104:
```javascript
background(240, 245, 250); // Light blue-grey
```
Change to:
- `background(20, 25, 30)` - Dark theme
- `background(255, 250, 240)` - Warm white
- `background(230, 255, 230)` - Mint green

### India Map Fill & Borders
In `sketch_vector.js`, line ~120-122:
```javascript
fill(255, 255, 255); // White fill - CUSTOMIZE THIS
stroke(200, 210, 220); // Light grey borders - CUSTOMIZE THIS
strokeWeight(1); // Border thickness
```

**Examples:**
```javascript
// Dark theme map
fill(40, 45, 50);
stroke(60, 65, 70);

// Colorful map
fill(230, 255, 230); // Mint green
stroke(100, 150, 100); // Dark green borders

// Minimal white
fill(255);
stroke(220);

// No borders (clean look)
fill(255);
noStroke(); // Remove borders completely
```

### State-Level Customization
You can color each state differently! In `drawFeature()` function:
```javascript
function drawFeature(feature) {
    let stateName = feature.properties.NAME_1; // Get state name
    
    // Color states differently
    if (stateName === 'Maharashtra') {
        fill(255, 200, 200); // Light red
    } else if (stateName === 'Karnataka') {
        fill(200, 255, 200); // Light green
    } else {
        fill(255, 255, 255); // Default white
    }
    
    // Rest of the code...
}
```

## 🎯 Marker Customization

### Venue City Markers (Large Blue Circles)
In `drawCityMarker()` function, line ~344-352:

**Default colors:**
```javascript
if (selectedCity === city) {
    markerColor = color(255, 152, 0, 200); // Orange when selected
} else if (isHovered) {
    markerColor = color(76, 175, 80, 200); // Green when hovered
} else {
    markerColor = color(33, 150, 243, 180); // Blue default
}
```

**Custom examples:**
```javascript
// Purple theme
markerColor = color(156, 39, 176, 180); // Purple

// Red theme
markerColor = color(244, 67, 54, 180); // Red

// Gold theme
markerColor = color(255, 193, 7, 180); // Gold
```

### Tier 2 City Markers (Small Orange Dots)
In `drawTier2CityMarker()` function, line ~392-400:

```javascript
markerColor = color(255, 152, 0, 150); // Orange - CHANGE THIS
```

Examples:
```javascript
markerColor = color(156, 39, 176, 150); // Purple dots
markerColor = color(0, 188, 212, 150); // Cyan dots
markerColor = color(244, 67, 54, 150); // Red dots
```

## 🔗 Connection Lines

### Artist to Venue Connections
In `drawConnections()` function, line ~442-448:

```javascript
// Metro artists (blue lines)
stroke(33, 150, 243, 120);

// Tier 2 artists (orange lines)
stroke(255, 152, 0, 100);

// Tier 2 to venue (green lines)
stroke(76, 175, 80, 120);
```

**Make it your own:**
```javascript
// All purple theme
stroke(156, 39, 176, 120);

// Gradient effect (requires more code)
// Rainbow lines (requires more code)

// Thicker lines
strokeWeight(5);

// Dashed lines (requires custom function)
```

## 🎭 Advanced Customizations

### 1. Gradient Map Background
```javascript
function draw() {
    // Vertical gradient
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(color(230, 245, 255), color(255, 250, 240), inter);
        stroke(c);
        line(0, y, width, y);
    }
    
    // Then draw map
    drawIndiaMap();
    // ...
}
```

### 2. Glow Effects on Hover
```javascript
function drawCityMarker(city) {
    // Add multiple glow layers
    if (isHovered) {
        for (let i = 5; i > 0; i--) {
            fill(76, 175, 80, 20);
            noStroke();
            circle(pos.x, pos.y, markerSize + i * 10);
        }
    }
    // ... rest of marker code
}
```

### 3. Texture/Pattern Fill
```javascript
function drawIndiaMap() {
    push();
    
    // Add texture
    for (let i = 0; i < 1000; i++) {
        stroke(200, 5);
        point(random(width), random(height));
    }
    
    // Then draw states
    // ...
}
```

### 4. Custom State Colors by Data
```javascript
// Color states based on number of gigs
let stateGigCounts = {
    'Maharashtra': 25,
    'Karnataka': 20,
    'Delhi': 22
};

function drawFeature(feature) {
    let stateName = feature.properties.NAME_1;
    let gigCount = stateGigCounts[stateName] || 0;
    
    // Color from white to blue based on gigs
    let blueValue = map(gigCount, 0, 30, 255, 100);
    fill(blueValue, blueValue, 255);
    
    // ...
}
```

## 🎨 Ready-Made Color Schemes

### Dark Theme
```javascript
// Background
background(20, 25, 30);

// Map
fill(40, 45, 50);
stroke(60, 65, 70);

// Venue markers
markerColor = color(100, 200, 255, 200); // Bright blue

// Tier 2 markers
markerColor = color(255, 200, 100, 150); // Warm orange
```

### Pastel Theme
```javascript
// Background
background(250, 245, 255);

// Map
fill(255, 250, 250);
stroke(240, 220, 240);

// Venue markers
markerColor = color(200, 180, 255, 180); // Lavender

// Tier 2 markers
markerColor = color(255, 200, 220, 150); // Pink
```

### Vibrant Theme
```javascript
// Background
background(255, 240, 200);

// Map
fill(255, 255, 240);
stroke(255, 200, 100);
strokeWeight(2);

// Venue markers
markerColor = color(255, 0, 100, 200); // Hot pink

// Tier 2 markers
markerColor = color(0, 255, 200, 180); // Cyan
```

## 🗺️ Map Projection Options

Current projection is simple Mercator. You can implement other projections:

### Albers Equal Area (better for India)
```javascript
function latLngToPixel(lat, lng) {
    // Albers parameters for India
    let lat0 = 22.5; // Standard parallel 1
    let lat1 = 28; // Standard parallel 2
    let lng0 = 79.0; // Central meridian
    
    // Albers projection math here
    // (More complex, but more accurate for India's shape)
}
```

## 📐 Interactive Features

### Tooltip on Hover
```javascript
function draw() {
    // ... existing code
    
    // Show tooltip
    if (hoveredCity) {
        fill(0, 0, 0, 200);
        rect(mouseX + 10, mouseY - 40, 150, 35, 5);
        fill(255);
        noStroke();
        textAlign(LEFT);
        textSize(12);
        text(hoveredCity.name, mouseX + 20, mouseY - 25);
        text(hoveredCity.gigCount + ' gigs', mouseX + 20, mouseY - 12);
    }
}
```

### Click Effects
```javascript
function mousePressed() {
    // Add click animation
    if (clickedOnCity) {
        // Ripple effect
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                // Draw expanding circle
            }, i * 100);
        }
    }
}
```

## 🎬 Animation Ideas

### Pulsing States
```javascript
function drawFeature(feature) {
    let pulse = sin(pulseAnimation + feature.id) * 10;
    fill(255 - pulse, 255 - pulse, 255);
    // ...
}
```

### Rotating Connections
```javascript
// Curved lines between cities
bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);
```

## 💡 Tips

1. **Test incrementally** - Change one thing at a time
2. **Use alpha (4th color value)** for transparency
3. **Map function** is your friend for scaling values
4. **Save presets** - Comment out different themes to switch easily
5. **State properties available** - Check `feature.properties` for state names, IDs, etc.

## 🚀 Next Steps

Want to go further?
- Add satellite imagery overlay
- Implement heat maps
- Add time-based animations
- Create custom legend for your colors
- Export as high-res PNG/SVG

Happy customizing! 🎨

