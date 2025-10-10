// Custom Vector Map for World
let worldGeoJSON;
let csvData;
let artistCities = [];
let eventsData = [];
let genresData = [];
let selectedGenre = 'all';
let selectedArtist = null;

// New Delhi - The single venue for all events
const VENUE = {
    name: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090
};

// Map projection settings
let centerLat = 20.0;
let centerLng = 40.0;
let zoom = 20; // Scale factor (smaller for world view)
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

// Visualization settings
let selectedCity = null;
let hoveredCity = null;
let pulseAnimation = 0;
let showLabels = true;

// World city coordinates
const cityCoordinates = {
    // India
    'New Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Bengaluru': { lat: 12.9716, lng: 77.5946 }, // Alternative name for Bangalore
    'Goa': { lat: 15.2993, lng: 74.1240 },
    'Goa ': { lat: 15.2993, lng: 74.1240 }, // With space
    'Chandigarh': { lat: 30.7333, lng: 76.7794 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Guwahati': { lat: 26.1445, lng: 91.7362 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Jalandhar': { lat: 31.3260, lng: 75.5762 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    
    // USA
    'New York': { lat: 40.7128, lng: -74.0060 },
    'New York ': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Vancouver': { lat: 49.2827, lng: -123.1207 },
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'Richmond': { lat: 37.5407, lng: -77.4360 },
    'New Orleans': { lat: 29.9511, lng: -90.0715 },
    'Toronto': { lat: 43.6532, lng: -79.3832 },
    
    // Europe
    'London': { lat: 51.5074, lng: -0.1278 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Prague': { lat: 50.0755, lng: 14.4378 },
    'prague ': { lat: 50.0755, lng: 14.4378 },
    'Tromsø': { lat: 69.6492, lng: 18.9553 },
    'Bergen': { lat: 60.3913, lng: 5.3221 },
    'Oslo': { lat: 59.9139, lng: 10.7522 },
    'Leeds': { lat: 53.8008, lng: -1.5491 },
    'Leicester': { lat: 52.6369, lng: -1.1398 },
    'Lancashire': { lat: 53.7632, lng: -2.7044 },
    'Derry': { lat: 54.9966, lng: -7.3086 },
    'Bristol': { lat: 51.4545, lng: -2.5879 },
    'Manchester': { lat: 53.4808, lng: -2.2426 },
    'Edinburgh': { lat: 55.9533, lng: -3.1883 },
    'Croydon': { lat: 51.3762, lng: -0.0982 },
    'Geneva': { lat: 46.2044, lng: 6.1432 },
    'Lisbon': { lat: 38.7223, lng: -9.1393 },
    'Milan': { lat: 45.4642, lng: 9.1900 },
    'Tuscany': { lat: 43.7711, lng: 11.2486 },
    'Bratislava': { lat: 48.1486, lng: 17.1077 },
    'Valencia': { lat: 39.4699, lng: -0.3763 },
    'Łódź': { lat: 51.7592, lng: 19.4560 },
    
    // Middle East & Asia
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Dubai ': { lat: 25.2048, lng: 55.2708 },
    'Tel Aviv': { lat: 32.0853, lng: 34.7818 },
    'Doha': { lat: 25.2854, lng: 51.5310 },
    'Colombo': { lat: 6.9271, lng: 79.8612 },
    'Kathmandu': { lat: 27.7172, lng: 85.3240 },
    'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
    
    // Asia Pacific
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Seoul': { lat: 37.5665, lng: 126.9780 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Melbourne': { lat: -37.8136, lng: 144.9631 },
    'Auckland': { lat: -36.8485, lng: 174.7633 },
    'Perth': { lat: -31.9505, lng: 115.8605 },
    'Bali': { lat: -8.3405, lng: 115.0920 },
    'Manila': { lat: 14.5995, lng: 120.9842 },
    'Phillipines': { lat: 14.5995, lng: 120.9842 },
    
    // Africa
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Cape Town': { lat: -33.9249, lng: 18.4241 },
    'Johannesburg': { lat: -26.2041, lng: 28.0473 },
    'Tunisia': { lat: 33.8869, lng: 9.5375 },
    
    // South America
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
    'Mexico City': { lat: 19.4326, lng: -99.1332 },
    
    // Caribbean
    'Kingston': { lat: 17.9712, lng: -76.7928 },
    
    // UK Regions
    'South Wales': { lat: 51.4816, lng: -3.1791 },
    'Scotland': { lat: 56.4907, lng: -4.2026 },
    'Norfolk': { lat: 52.6309, lng: 1.2974 },
    
    // Middle East & North Africa
    'UAE': { lat: 25.2048, lng: 55.2708 },
    'UAE ': { lat: 25.2048, lng: 55.2708 }
};

function preload() {
    // Load GeoJSON and CSV data
    worldGeoJSON = loadJSON('world.geojson');
    csvData = loadTable('BO.csv', 'csv', 'header');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Process CSV data
    processData();
    
    // Setup UI controls
    setupControls();
}

function draw() {
    // Background - Dark gradient
    background(15, 23, 42); // Dark blue
    
    // Update animation
    pulseAnimation += 0.05;
    
    // Draw world map
    drawIndiaMap();
    
    // Get filtered artist cities based on selected genre
    let filteredCities = getFilteredCities();
    
    // Draw connections from artist cities to New Delhi
    for (let city of filteredCities) {
        if (selectedCity === city || selectedCity === null) {
            drawConnectionToVenue(city);
        }
    }
    
    // Draw artist connections if artist is selected
    if (selectedArtist) {
        drawArtistConnection();
    }
    
    // Draw artist city markers
    for (let city of filteredCities) {
        drawArtistCityMarker(city);
    }
    
    // Draw New Delhi (venue) marker on top
    drawVenueMarker();
}

// Mercator projection: convert lat/lng to pixel coordinates
function latLngToPixel(lat, lng) {
    // Simple Mercator projection
    let x = (lng - centerLng) * zoom + width / 2 + offsetX;
    let y = (centerLat - lat) * zoom + height / 2 + offsetY;
    return { x, y };
}

function drawIndiaMap() {
    push();
    
    // Draw each country
    for (let feature of worldGeoJSON.features) {
        // Draw country fill - Dark theme
        fill(30, 41, 59); // Dark blue-grey fill
        stroke(71, 85, 105); // Lighter grey borders
        strokeWeight(0.8);
        
        drawFeature(feature);
    }
    
    pop();
}

function drawFeature(feature) {
    let geometry = feature.geometry;
    
    if (geometry.type === 'Polygon') {
        drawPolygon(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
        for (let polygon of geometry.coordinates) {
            drawPolygon(polygon);
        }
    }
}

function drawPolygon(coordinates) {
    for (let ring of coordinates) {
        beginShape();
        for (let coord of ring) {
            let pos = latLngToPixel(coord[1], coord[0]);
            vertex(pos.x, pos.y);
        }
        endShape(CLOSE);
    }
}

function processData() {
    let cityStats = {};
    let allGenres = new Set();
    
    // Process each row from CSV
    for (let i = 0; i < csvData.getRowCount(); i++) {
        let artist = csvData.getString(i, 'Artist ').trim();
        let eventTitle = csvData.getString(i, 'Event Title');
        let city = csvData.getString(i, 'City').trim();
        let country = csvData.getString(i, 'Country ').trim();
        let genres = csvData.getString(i, 'Genre(s)');
        let year = csvData.getString(i, 'Year');
        
        // Skip empty rows or rows without artist
        if (!artist || artist === '') continue;
        
        // Normalize artist name to handle case variations
        artist = artist.toLowerCase();
        
        // Parse genres
        let genreList = [];
        if (genres && genres.trim() !== '') {
            genreList = genres.split('/').map(g => g.trim().toLowerCase()).filter(g => g);
            genreList.forEach(g => allGenres.add(g));
        }
        
        // Store event data
        eventsData.push({
            artist: artist,
            eventTitle: eventTitle,
            city: city,
            country: country,
            genres: genreList,
            year: year
        });
        
        // Aggregate by artist city
        if (city && city !== '' && city !== 'New Delhi' && cityCoordinates[city]) {
            if (!cityStats[city]) {
                cityStats[city] = {
                    name: city,
                    country: country,
                    lat: cityCoordinates[city].lat,
                    lng: cityCoordinates[city].lng,
                    artistCount: 0,
                    artists: [],
                    events: 0,
                    genres: {}
                };
            }
            
            cityStats[city].artistCount++;
            cityStats[city].artists.push(artist);
            cityStats[city].events++;
            
            // Track genres for this city
            genreList.forEach(genre => {
                if (!cityStats[city].genres[genre]) {
                    cityStats[city].genres[genre] = 0;
                }
                cityStats[city].genres[genre]++;
            });
        }
    }
    
    // Convert to array and calculate unique artists
    for (let city in cityStats) {
        let stats = cityStats[city];
        stats.uniqueArtists = [...new Set(stats.artists)].length;
        artistCities.push(stats);
    }
    
    // Convert genres set to sorted array
    genresData = ['all', ...Array.from(allGenres).sort()];
    
    // Populate genre dropdown if it exists
    populateGenreDropdown();
    
    // Populate artist dropdown if it exists
    populateArtistDropdown();
}

function getFilteredCities() {
    if (selectedGenre === 'all') {
        return artistCities;
    }
    
    return artistCities.filter(city => {
        return city.genres[selectedGenre] > 0;
    });
}

function drawVenueMarker() {
    // Draw New Delhi as the main venue
    const pos = latLngToPixel(VENUE.lat, VENUE.lng);
    
    // Check if mouse is hovering
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let isHovered = d < 30;
    
    // Calculate total unique events
    let uniqueEventTitles = [...new Set(eventsData.map(e => e.eventTitle))];
    let totalEvents = uniqueEventTitles.length;
    let filteredEvents = selectedGenre === 'all' ? totalEvents : 
        uniqueEventTitles.filter(eventTitle => {
            let eventData = eventsData.find(e => e.eventTitle === eventTitle);
            return eventData && eventData.genres.includes(selectedGenre);
        }).length;
    
    // Animated size
    let markerSize = 50 + sin(pulseAnimation) * 8;
    if (isHovered) {
        markerSize += 10;
    }
    
    // Draw outer glow
    noStroke();
    fill(255, 215, 0, 60);
    circle(pos.x, pos.y, markerSize + 25);
    
    // Draw main marker
    fill(255, 215, 0, 240);
    stroke(255);
    strokeWeight(3);
    circle(pos.x, pos.y, markerSize);
    
    // Draw inner circle
    fill(139, 92, 246, 200);
    noStroke();
    circle(pos.x, pos.y, markerSize * 0.6);
    
    // Draw venue icon (star) - removed per user request
    
    // Draw label
    if (showLabels || isHovered) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textSize(16);
        textStyle(BOLD);
        text('NEW DELHI', pos.x, pos.y - markerSize - 25);
        
        textSize(12);
        textStyle(NORMAL);
        text(filteredEvents + ' Events', pos.x, pos.y + markerSize + 20);
    }
}

function drawArtistCityMarker(city) {
    // Convert lat/lng to pixel position
    const pos = latLngToPixel(city.lat, city.lng);
    
    // Check if mouse is hovering over city
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let baseSize = map(city.artistCount, 1, 50, 8, 25);
    let isHovered = d < baseSize + 5;
    
    if (isHovered) {
        hoveredCity = city;
    }
    
    // Determine marker size and color
    let markerSize = baseSize;
    let markerColor;
    
    if (selectedCity === city) {
        markerSize = baseSize + 8 + sin(pulseAnimation) * 4;
        markerColor = color(236, 72, 153, 240); // Bright pink when selected
    } else if (isHovered) {
        markerSize = baseSize + 6;
        markerColor = color(251, 182, 206, 220); // Light pink on hover
    } else {
        markerSize = baseSize + sin(pulseAnimation + artistCities.indexOf(city) * 0.3) * 2;
        markerColor = color(236, 72, 153, 180); // Pink default
    }
    
    // Draw outer glow
    noStroke();
    fill(236, 72, 153, 50);
    circle(pos.x, pos.y, markerSize + 12);
    
    // Draw main marker
    fill(markerColor);
    stroke(255);
    strokeWeight(2);
    circle(pos.x, pos.y, markerSize);
    
    // Draw inner dot
    fill(255, 255, 255, 220);
    noStroke();
    circle(pos.x, pos.y, markerSize * 0.4);
    
    // Draw city label
    if (showLabels || isHovered || selectedCity === city) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textAlign(CENTER, CENTER);
        textSize(11);
        textStyle(BOLD);
        text(city.name, pos.x, pos.y - markerSize - 12);
        
        // Show artist count
        textSize(9);
        textStyle(NORMAL);
        text(city.artistCount + ' artists', pos.x, pos.y + markerSize + 12);
    }
}

function drawConnectionToVenue(city) {
    // Draw line from artist city to New Delhi
    const venuePos = latLngToPixel(VENUE.lat, VENUE.lng);
    const cityPos = latLngToPixel(city.lat, city.lng);
    
    // Only draw if not the same city
    if (city.name === VENUE.name) return;
    
    if (selectedCity === city) {
        // When selected, draw individual curved lines for each artist
        drawCurvedArtistLines(city, cityPos, venuePos);
    } else {
        // When not selected, draw a single subtle line
        let opacity = 100;
        let lineWeight = 2.2;
        
        // Draw connecting line
        stroke(236, 72, 153, opacity);
        strokeWeight(lineWeight);
        line(cityPos.x, cityPos.y, venuePos.x, venuePos.y);
        
        // Draw animated dots (flowing from city to New Delhi)
        let dots = 2;
        for (let i = 0; i < dots; i++) {
            let t = (i / dots + pulseAnimation * 0.15) % 1;
            let x = lerp(cityPos.x, venuePos.x, t);
            let y = lerp(cityPos.y, venuePos.y, t);
            
            fill(236, 72, 153, opacity + 60);
            noStroke();
            circle(x, y, 3);
        }
    }
}

function drawCurvedArtistLines(city, cityPos, venuePos) {
    // Get unique artists from this city
    let uniqueArtists = [...new Set(city.artists)];
    let numArtists = uniqueArtists.length;
    
    // If only one artist, draw a straight line
    if (numArtists === 1) {
        stroke(236, 72, 153, 200);
        strokeWeight(2.5);
        line(cityPos.x, cityPos.y, venuePos.x, venuePos.y);
        
        // Draw animated dots along straight line
        let dots = 4;
        for (let i = 0; i < dots; i++) {
            let t = (i / dots + pulseAnimation * 0.15) % 1;
            let x = lerp(cityPos.x, venuePos.x, t);
            let y = lerp(cityPos.y, venuePos.y, t);
            
            fill(236, 72, 153, 240);
            noStroke();
            circle(x, y, 5);
        }
        return;
    }
    
    // For multiple artists, draw mirrored curved lines
    // Calculate the midpoint between city and venue
    let midX = (cityPos.x + venuePos.x) / 2;
    let midY = (cityPos.y + venuePos.y) / 2;
    
    // Calculate perpendicular direction for arch spread
    let dx = venuePos.x - cityPos.x;
    let dy = venuePos.y - cityPos.y;
    let distance = dist(cityPos.x, cityPos.y, venuePos.x, venuePos.y);
    
    // Perpendicular vector (rotated 90 degrees) - normalized
    let perpX = -dy / distance;
    let perpY = dx / distance;
    
    // Adaptive base offset based on number of artists and distance
    // More artists = tighter curves, longer distance = tighter curves
    let artistFactor = 1 / sqrt(numArtists); // Reduces as artist count increases
    let distanceFactor = map(distance, 100, 1000, 0.15, 0.08, true); // Tighter for long distances
    let baseOffset = distance * distanceFactor * artistFactor;
    
    // Draw a curved line for each artist
    for (let i = 0; i < numArtists; i++) {
        // Create mirrored distribution:
        // Calculate position relative to center
        let position;
        
        if (numArtists % 2 === 1) {
            // Odd number: center at 0, others at -2, -1, 1, 2, etc.
            let centerIndex = floor(numArtists / 2);
            position = i - centerIndex;
        } else {
            // Even number: positions at -1.5, -0.5, 0.5, 1.5, etc.
            let halfPoint = numArtists / 2;
            position = i - halfPoint + 0.5;
        }
        
        // Calculate perpendicular offset from the direct line
        // Positive position = one side, negative = other side
        let perpendicularOffset = position * baseOffset;
        
        // Calculate control point perpendicular to the line
        let controlX = midX + perpX * perpendicularOffset;
        let controlY = midY + perpY * perpendicularOffset;
        
        // Color variation for each artist line
        let artistColor = lerpColor(
            color(236, 72, 153), // Pink
            color(139, 92, 246), // Purple
            i / max(1, numArtists - 1)
        );
        
        // Draw the curved line using quadratic bezier
        noFill();
        stroke(red(artistColor), green(artistColor), blue(artistColor), 180);
        strokeWeight(2);
        
        // Draw smooth curved line
        beginShape();
        for (let t = 0; t <= 1; t += 0.02) {
            // Quadratic bezier formula
            let x = pow(1 - t, 2) * cityPos.x + 2 * (1 - t) * t * controlX + pow(t, 2) * venuePos.x;
            let y = pow(1 - t, 2) * cityPos.y + 2 * (1 - t) * t * controlY + pow(t, 2) * venuePos.y;
            curveVertex(x, y);
        }
        endShape();
        
        // Draw animated dots along the curve
        let dots = 3;
        for (let j = 0; j < dots; j++) {
            let t = (j / dots + pulseAnimation * 0.15 + i * 0.1) % 1;
            
            // Calculate position on the bezier curve
            let x = pow(1 - t, 2) * cityPos.x + 2 * (1 - t) * t * controlX + pow(t, 2) * venuePos.x;
            let y = pow(1 - t, 2) * cityPos.y + 2 * (1 - t) * t * controlY + pow(t, 2) * venuePos.y;
            
            fill(red(artistColor), green(artistColor), blue(artistColor), 220);
            noStroke();
            circle(x, y, 5);
        }
    }
}

function drawArtistConnection() {
    if (!selectedArtist) return;
    
    // Find all events for the selected artist
    let artistEvents = eventsData.filter(e => e.artist === selectedArtist);
    
    for (let event of artistEvents) {
        if (event.city && cityCoordinates[event.city]) {
            const cityPos = latLngToPixel(cityCoordinates[event.city].lat, cityCoordinates[event.city].lng);
            const venuePos = latLngToPixel(VENUE.lat, VENUE.lng);
            
            // Draw golden line for selected artist
            stroke(255, 215, 0, 200);
            strokeWeight(3);
            line(cityPos.x, cityPos.y, venuePos.x, venuePos.y);
            
            // Draw animated dots (golden)
            let dots = 5;
            for (let i = 0; i < dots; i++) {
                let t = (i / dots + pulseAnimation * 0.2) % 1;
                let x = lerp(cityPos.x, venuePos.x, t);
                let y = lerp(cityPos.y, venuePos.y, t);
                
                fill(255, 215, 0, 240);
                noStroke();
                circle(x, y, 6);
            }
        }
    }
}

function mousePressed() {
    // Check if clicking on New Delhi venue
    const venuePos = latLngToPixel(VENUE.lat, VENUE.lng);
    let d = dist(mouseX, mouseY, venuePos.x, venuePos.y);
    if (d < 30) {
        updateVenueInfo();
        return;
    }
    
    // Check artist cities
    for (let city of artistCities) {
        const pos = latLngToPixel(city.lat, city.lng);
        let baseSize = map(city.artistCount, 1, 50, 8, 25);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < baseSize + 5) {
            selectedCity = selectedCity === city ? null : city;
            updateInfoPanel(city);
            return;
        }
    }
    
    // Start dragging
    isDragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    
    // Clear selection if clicked elsewhere
    selectedCity = null;
    updateInfoPanel(null);
}

function mouseReleased() {
    isDragging = false;
}

function mouseDragged() {
    if (isDragging) {
        offsetX += (mouseX - lastMouseX);
        offsetY += (mouseY - lastMouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
}

function mouseWheel(event) {
    // Zoom with scroll
    let zoomChange = -event.delta * 0.3;
    zoom += zoomChange;
    zoom = constrain(zoom, 10, 500);
    return false; // Prevent page scrolling
}

function mouseMoved() {
    hoveredCity = null;
    
    // Check venue
    const venuePos = latLngToPixel(VENUE.lat, VENUE.lng);
    let d = dist(mouseX, mouseY, venuePos.x, venuePos.y);
    if (d < 30) {
        cursor(HAND);
        return;
    }
    
    // Check artist cities
    for (let city of artistCities) {
        const pos = latLngToPixel(city.lat, city.lng);
        let baseSize = map(city.artistCount, 1, 50, 8, 25);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < baseSize + 5) {
            hoveredCity = city;
            cursor(HAND);
            return;
        }
    }
    
    cursor(ARROW);
}

function updateVenueInfo() {
    const infoDiv = document.getElementById('city-info');
    
    // Calculate total unique events
    let uniqueEventTitles = [...new Set(eventsData.map(e => e.eventTitle))];
    let totalEvents = uniqueEventTitles.length;
    let filteredEvents = selectedGenre === 'all' ? totalEvents : 
        uniqueEventTitles.filter(eventTitle => {
            let eventData = eventsData.find(e => e.eventTitle === eventTitle);
            return eventData && eventData.genres.includes(selectedGenre);
        }).length;
    
    let allArtists = eventsData.map(e => e.artist);
    let uniqueArtists = [...new Set(allArtists)].length;
    
    // Count cities
    let cityCount = artistCities.length;
    
    // Get top genres
    let genreCounts = {};
    eventsData.forEach(e => {
        e.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    });
    let topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    let genresHtml = topGenres.map(([genre, count]) => 
        `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; font-size: 11px; color: #e0e0ff;">${genre} (${count})</span>`
    ).join('');
    
    infoDiv.innerHTML = `
        <p class="city-name">New Delhi</p>
        <p style="font-size: 12px; color: #ffd700; margin-top: 5px;">★ Main Venue</p>
        <p><strong>Total Events:</strong> ${filteredEvents}</p>
        <p><strong>Total Artists:</strong> ${allArtists.length}</p>
        <p><strong>Unique Artists:</strong> ${uniqueArtists}</p>
        <p><strong>Cities Represented:</strong> ${cityCount}</p>
        <p><strong>Top Genres:</strong><br/>${genresHtml}</p>
    `;
}

function updateInfoPanel(city) {
    const infoDiv = document.getElementById('city-info');
    
    if (city) {
        // Get artists from this city
        let cityArtists = eventsData.filter(e => e.city === city.name);
        let artistNames = [...new Set(cityArtists.map(e => e.artist))].join(', ');
        
        // Get genres for this city
        let genreHtml = '';
        let sortedGenres = Object.entries(city.genres)
            .sort((a, b) => b[1] - a[1]);
        
        for (let [genre, count] of sortedGenres) {
            genreHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; font-size: 11px; color: #fbbf24;">${genre} (${count})</span>`;
        }
        
        infoDiv.innerHTML = `
            <p class="city-name">${city.name}</p>
            <p style="font-size: 12px; color: #ec4899; margin-top: 5px;">${city.country}</p>
            <p><strong>Artists:</strong> ${city.artistCount}</p>
            <p><strong>Unique Artists:</strong> ${city.uniqueArtists}</p>
            <p><strong>Events:</strong> ${city.events}</p>
            ${genreHtml ? `<p><strong>Genres:</strong><br/>${genreHtml}</p>` : ''}
            <p style="font-size: 11px; margin-top: 10px;"><strong>Artists:</strong><br/>${artistNames}</p>
        `;
    } else {
        infoDiv.innerHTML = '';
    }
}

function populateGenreDropdown() {
    // Check if dropdown exists
    const dropdown = document.getElementById('genre-dropdown');
    if (!dropdown) return;
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add genres
    genresData.forEach(genre => {
        let option = document.createElement('option');
        option.value = genre;
        option.text = genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1);
        dropdown.appendChild(option);
    });
    
    // Add event listener
    dropdown.addEventListener('change', function() {
        selectedGenre = this.value;
        selectedCity = null;
        updateInfoPanel(null);
    });
}

function populateArtistDropdown() {
    // Check if dropdown exists
    const dropdown = document.getElementById('artist-dropdown');
    if (!dropdown) return;
    
    // Get all unique artists sorted alphabetically
    let allArtists = [...new Set(eventsData.map(e => e.artist))].sort();
    
    // Clear existing options
    dropdown.innerHTML = '<option value="">-- Select Artist --</option>';
    
    // Add artists
    allArtists.forEach(artist => {
        let option = document.createElement('option');
        option.value = artist;
        option.text = artist;
        dropdown.appendChild(option);
    });
    
    // Add event listener
    dropdown.addEventListener('change', function() {
        selectedArtist = this.value || null;
        if (selectedArtist) {
            // Find the artist's city and show info
            let artistEvent = eventsData.find(e => e.artist === selectedArtist);
            if (artistEvent && artistEvent.city) {
                let city = artistCities.find(c => c.name === artistEvent.city);
                if (city) {
                    selectedCity = city;
                    updateInfoPanel(city);
                }
            }
        }
    });
}

function setupControls() {
    document.getElementById('reset-btn').addEventListener('click', () => {
        zoom = 5;
        offsetX = 0;
        offsetY = 0;
        centerLat = 20.0;
        centerLng = 40.0;
        selectedCity = null;
        selectedArtist = null;
        updateInfoPanel(null);
    });
    
    document.getElementById('toggle-labels').addEventListener('click', function() {
        showLabels = !showLabels;
        this.textContent = showLabels ? 'Hide Labels' : 'Show Labels';
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        zoom = 20;
        offsetX = 0;
        offsetY = 0;
        centerLat = 20.0;
        centerLng = 40.0;
        selectedCity = null;
        selectedArtist = null;
        updateInfoPanel(null);
    } else if (key === 'l' || key === 'L') {
        showLabels = !showLabels;
    }
}

