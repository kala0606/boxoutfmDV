# India City Data Visualization

An interactive map-based visualization system built with p5.js, Mappa, and Leaflet for visualizing city-based datasets from India.

## Features

- 🗺️ **Interactive Map**: Pan, zoom, and explore the map of India
- 📍 **City Markers**: Animated markers sized by number of gigs
- 📊 **Aggregated Data**: Shows total gigs, artists, and audience per city
- 🔗 **Connections**: Click on a city to see connections to other cities
- ℹ️ **Info Panel**: View detailed statistics including:
  - Total gigs hosted
  - Total and unique artists
  - Average gathering size
  - Artist origin cities
  - Total follower reach
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- ⌨️ **Keyboard Shortcuts**: Quick controls for common actions

## Setup

1. Make sure all files are in the same directory:
   - `index.html`
   - `sketch.js`
   - `boxoutimpact.csv`

2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)

   **Note**: Due to browser security restrictions, you need to serve the files through a local server. You can use:
   
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server`
   - VS Code: Use the "Live Server" extension
   
3. Navigate to `http://localhost:8000` (or the appropriate port)

## Usage

### Mouse Controls
- **Click and Drag**: Pan around the map
- **Scroll**: Zoom in/out
- **Click on City Marker**: Select a city and view details
- **Hover over Marker**: Preview city name

### Keyboard Shortcuts
- **R**: Reset view to default (India overview)
- **L**: Toggle city labels on/off

### UI Controls
- **Reset View**: Returns the map to the default India view
- **Toggle Labels**: Show/hide city name labels

## Data Format

The visualization reads from `boxoutimpact.csv` with the following columns:

| Column | Description |
|--------|-------------|
| Gig No | Unique identifier for each gig (multiple rows can share the same gig number) |
| Venue | City name where the gig happened (must match: Mumbai, Bangalore, Delhi, Kolkata, Pune, Hyderabad) |
| Artist City | Artist's home city |
| Artist Following | Number of artist followers |
| Venue Gathering | Total audience size at the gig (same for all artists in a gig) |
| Artist | Artist name |

**Important:** Multiple artists can perform at the same gig. Rows with the same `Gig No` represent different artists who performed at the same event.

### Example Data Structure

```csv
Gig No,Venue,Artist City,Artist Following,Venue Gathering,Artist
1,Mumbai,Mumbai,45000,850,DJ Nucleya
1,Mumbai,Goa,32000,850,Arjun Vagale
1,Mumbai,Bangalore,28000,850,BLOT!
2,Mumbai,Pune,18000,720,Lost Stories
2,Mumbai,Mumbai,38000,720,Sandunes
3,Delhi,Jaipur,48000,950,Anish Sood
```

In this example:
- **Gig 1** at Mumbai had 3 artists - one from Mumbai, one from Goa (tier 2 city), and one from Bangalore, with 850 people attending
- **Gig 2** at Mumbai had 2 artists from Pune and Mumbai, with 720 people in attendance
- **Gig 3** at Delhi was a solo performance by an artist from Jaipur (tier 2 city) with 950 attendees

## Supported Cities

### Venue Cities (with map markers)

The system currently supports these 6 major Indian cities as venues with predefined coordinates:

- Mumbai (19.0760°N, 72.8777°E)
- Bangalore (12.9716°N, 77.5946°E)
- Delhi (28.6139°N, 77.2090°E)
- Kolkata (22.5726°N, 88.3639°E)
- Pune (18.5204°N, 73.8567°E)
- Hyderabad (17.3850°N, 78.4867°E)

### Artist Origin Cities

Artists in the dataset come from these cities (including tier 2 cities):

**Metro Cities:** Mumbai, Bangalore, Delhi, Kolkata, Pune, Hyderabad

**Tier 2 Cities:**
- **North:** Jaipur, Chandigarh, Lucknow, Dehradun, Amritsar, Shimla, Udaipur
- **West:** Goa, Ahmedabad, Nashik, Nasik, Surat, Vadodara, Nagpur, Indore, Lonavala, Aurangabad
- **South:** Kochi, Coimbatore, Mysore, Mangalore, Pondicherry, Madurai, Vishakhapatnam, Vijayawada, Tirupati, Warangal, Hubli
- **East:** Shillong, Guwahati, Bhubaneswar, Patna, Ranchi, Darjeeling, Siliguri, Agartala, Cuttack, Raipur

## Adding More Cities

To add more cities to the visualization:

1. Open `sketch.js`
2. Add the city coordinates to the `cityCoordinates` object:
   ```javascript
   const cityCoordinates = {
       'Mumbai': { lat: 19.0760, lng: 72.8777 },
       'YourCity': { lat: YOUR_LAT, lng: YOUR_LNG },
       // ... more cities
   };
   ```
3. Add the corresponding data in your CSV file

## Customization

### Changing Map Style

Edit the `style` property in `sketch.js`:

```javascript
const options = {
    lat: 22.5,
    lng: 79.0,
    zoom: 5,
    style: 'YOUR_TILE_SERVER_URL'
};
```

Popular tile servers:
- OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- CartoDB Positron: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- CartoDB Dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`

### Changing Colors

Modify the color values in the `drawCityMarker()` function in `sketch.js`:

```javascript
// Selected city
markerColor = color(255, 152, 0, 200); // Orange

// Hovered city
markerColor = color(76, 175, 80, 200); // Green

// Default city
markerColor = color(33, 150, 243, 180); // Blue
```

## Technologies Used

- [p5.js](https://p5js.org/) - Creative coding library
- [Mappa](https://github.com/cvalenzuela/Mappa) - Map library for p5.js
- [Leaflet](https://leafletjs.com/) - Interactive map library
- Stadia Maps - Tile provider

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ⚠️ Supported but touch gestures may vary

## Troubleshooting

**CSV not loading:**
- Make sure you're running a local server (not opening the file directly)
- Check that `boxoutimpact.csv` is in the same directory as `index.html`

**Map not displaying:**
- Check your internet connection (tiles are loaded from external servers)
- Check browser console for errors (F12)

**Cities not showing:**
- Verify that city names in your CSV exactly match the names in `cityCoordinates`
- Check that the CSV header row has the correct column names

## Future Enhancements

Ideas for extending this visualization:
- Add data filters (by artist following, venue size, etc.)
- Implement data clustering for overlapping points
- Add heatmap visualization option
- Export/screenshot functionality
- Timeline slider for temporal data
- Search functionality for cities
- Custom marker styles based on data values

## License

Free to use and modify for your projects.

