# Two Versions Available!

## 🗺️ Version 1: Tile-Based Map (Original)
**File:** `index.html` + `sketch.js`

### Pros:
- ✅ Professional map tiles from Stadia Maps
- ✅ Shows roads, labels, terrain
- ✅ Can easily switch tile providers
- ✅ Familiar map interface
- ✅ Internet required for tiles

### Best For:
- Quick setup
- Detailed geographic context
- Standard map look

---

## 🎨 Version 2: Custom Vector Map (New!)
**File:** `index_vector.html` + `sketch_vector.js`

### Pros:
- ✅ **Full style control** - every color, line, fill
- ✅ **No external dependencies** - works offline
- ✅ **Crisp at any zoom** - true vector graphics
- ✅ **Custom interactions** - drag, zoom, pan
- ✅ **State boundaries visible** - can style each state
- ✅ **Faster** - no tile loading
- ✅ **Customizable** - gradient backgrounds, effects, animations

### Best For:
- Custom branding/design
- Presentation/portfolio work
- Offline use
- Complete creative control

---

## 🚀 Try Both!

**Tile Version:**
Open: http://localhost:8080/index.html

**Vector Version:**
Open: http://localhost:8080/index_vector.html

---

## Quick Comparison

| Feature | Tile Version | Vector Version |
|---------|-------------|----------------|
| Map Detail | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Customization | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Load Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Offline Support | ❌ | ✅ |
| Zoom Quality | ⭐⭐⭐⭐ (pixelates) | ⭐⭐⭐⭐⭐ (vector) |
| Styling Options | Limited | Unlimited |
| File Size | Small | ~22MB (GeoJSON) |

---

## 🎨 Customization Examples

### Vector Version - Easy Color Changes:

**Dark Theme Map:**
```javascript
// In sketch_vector.js
background(20, 25, 30); // Dark background
fill(40, 45, 50); // Dark states
stroke(60, 65, 70); // Subtle borders
```

**Minimalist Map:**
```javascript
background(255); // White
fill(250); // Almost white states
noStroke(); // No borders
```

**Artistic Map:**
```javascript
background(255, 250, 240); // Warm white
fill(255, 240, 220); // Cream
stroke(200, 150, 100); // Brown borders
strokeWeight(2);
```

See `VECTOR_MAP_STYLING.md` for complete guide!

---

## Which Should You Use?

### Use **Tile Version** if:
- You want a traditional map look
- You need detailed geographic features
- You're okay with internet dependency

### Use **Vector Version** if:
- You want custom colors/branding
- You need offline capability
- You're presenting/showcasing
- You want full creative control
- You want to style individual states

---

## 💡 Pro Tip

Start with the **Vector Version** for maximum flexibility!
You can always fall back to tiles if needed.

