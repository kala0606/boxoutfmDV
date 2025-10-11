// Custom Vector Map for World
let worldGeoJSON;
let csvData;
let artistCities = [];
let eventsData = [];
let genresData = [];
let selectedGenre = 'all';
let selectedArtist = null;
let countryStats = {};

// New Delhi - The single venue for all events
const VENUE = {
    name: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090
};

// Map projection settings
let centerLat = 20.0;
let centerLng = 40.0;
let zoom = 10; // Scale factor (smaller for world view)
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let hasDragged = false;
let clickedOnInteractive = false;
let lastMouseX, lastMouseY;

// Pinch zoom variables
let lastPinchDist = 0;
let isPinching = false;

// Visualization settings
let selectedCity = null;
let hoveredCity = null;
let pulseAnimation = 0;
let showLabels = true;

// Particle system
let particles = [];

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

// Particle class for firecracker burst animation
class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        // Random burst in all 360 directions
        let angle = random(TWO_PI);
        let speed = random(3, 8);
        this.velocity = createVector(cos(angle) * speed, sin(angle) * speed);
        this.birthTime = millis();
        this.lifetime = random(2000, 4000); // Live for 2-4 seconds
        this.size = random(3, 7);
        // Random pink or purple color
        this.color = random() > 0.5 ? color(236, 72, 153) : color(168, 85, 247); // pink or purple
    }
    
    update() {
        // Simple movement - just add velocity
        this.position.add(this.velocity);
    }
    
    display() {
        // Calculate opacity based on lifetime - fade out
        let age = millis() - this.birthTime;
        let opacity = map(age, 0, this.lifetime, 255, 0);
        opacity = constrain(opacity, 0, 255);
        
        // Draw particle as a small square
        push();
        translate(this.position.x, this.position.y);
        
        // Apply color with opacity
        let c = color(red(this.color), green(this.color), blue(this.color), opacity);
        fill(c);
        noStroke();
        rectMode(CENTER);
        square(0, 0, this.size);
        
        pop();
    }
    
    isDead() {
        return millis() - this.birthTime > this.lifetime;
    }
}

function spawnParticles(x, y, count = 50) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

// Function to draw gradient lines from yellow to purple
function drawGradientLine(x1, y1, x2, y2, weight, opacity) {
    let steps = 20; // Number of gradient segments
    
    for (let i = 0; i < steps; i++) {
        let t1 = i / steps; // Current segment start
        let t2 = (i + 1) / steps; // Current segment end
        
        // Calculate positions for this segment
        let x1_seg = lerp(x1, x2, t1);
        let y1_seg = lerp(y1, y2, t1);
        let x2_seg = lerp(x1, x2, t2);
        let y2_seg = lerp(y1, y2, t2);
        
        // Interpolate color from yellow to purple based on segment position
        let r = lerp(255, 139, t1); // 255->139 (yellow to purple red)
        let g = lerp(255, 92, t1);  // 255->92 (yellow to purple green) 
        let b = lerp(0, 246, t1);   // 0->246 (yellow to purple blue)
        
        stroke(r, g, b, opacity);
        strokeWeight(weight);
        line(x1_seg, y1_seg, x2_seg, y2_seg);
    }
}

function preload() {
    // Load GeoJSON and CSV data
    worldGeoJSON = loadJSON('world.geojson');
    csvData = loadTable('BO.csv', 'csv', 'header');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Shift map 15% to the right to visually center it (more ocean on right than left)
    offsetX = width * 0.25;
    
    // Process CSV data
    processData();
    
    // Setup UI controls
    setupControls();
    
    // Initialize the info panel with default view (all genres)
    updateGenreInfoPanel();
}

function draw() {
    // Background - Near black (ocean)
    background(10, 10, 10); // Near black
    
    // Update animation
    pulseAnimation += 0.05;
    
    // Draw world map
    drawIndiaMap();
    
    // Get filtered artist cities based on selected genre
    let filteredCities = getFilteredCities();
    
    // Only one visualization mode at a time:
    // Priority: Artist > New Delhi All > City > Genre
    
    if (selectedArtist) {
        // Artist mode: Show only artist connection and circles
        drawConcentricCircles();
        drawArtistConnection();
    } else if (selectedCity === 'NEW_DELHI_ALL') {
        // Show all connections when New Delhi is clicked
        for (let city of filteredCities) {
            drawConnectionToVenue(city);
        }
    } else if (selectedCity && selectedCity !== 'NEW_DELHI_ALL') {
        // City mode: Show only selected city connection
        drawConnectionToVenue(selectedCity);
    } else if (selectedGenre !== 'all') {
        // Genre mode: Show all cities for that genre
        for (let city of filteredCities) {
            drawConnectionToVenue(city);
        }
    }
    
    // Draw artist city markers
    for (let city of filteredCities) {
        drawArtistCityMarker(city);
    }
    
    // Draw New Delhi (venue) marker on top
    drawVenueMarker();
    
    // Update and draw particles
    for (let particle of particles) {
        particle.update();
        particle.display();
    }
    
    // Remove dead particles
    particles = particles.filter(particle => !particle.isDead());
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
    
    // Find max artist count for normalization
    let maxArtists = 0;
    for (let country in countryStats) {
        maxArtists = max(maxArtists, countryStats[country].artistCount);
    }
    
    // Draw each country
    for (let feature of worldGeoJSON.features) {
        let countryName = feature.properties.NAME || feature.properties.name || feature.properties.NAME_EN || feature.properties.NAME_0 || feature.properties.ADMIN;
        
        // Map GeoJSON country names to CSV country names
        let countryMapping = {
            'United States of America': 'United States',
            'United Kingdom': 'United Kingdom',
            'India': 'India'
        };
        
        // Check if we need to map the country name
        let csvCountryName = countryMapping[countryName] || countryName;
        
        // Default very dark grey fill for land
        let fillColor = color(25, 25, 28); // Very dark grey
        
        // Check if this country has artist data
        if (countryStats[csvCountryName] && countryStats[csvCountryName].artistCount > 0) {
            // Use logarithmic scale to make differences more noticeable
            // Cap at 50 artists so countries with fewer artists show more distinction
            let cappedMax = min(maxArtists, 50);
            let artistCount = min(countryStats[csvCountryName].artistCount, cappedMax);
            
            // Use log scale for better visual distribution
            let logCount = log(artistCount + 1);
            let logMax = log(cappedMax + 1);
            let intensity = map(logCount, 0, logMax, 0.2, 1);
            intensity = constrain(intensity, 0.2, 1);
            
            // Use purple color (139, 92, 246) with varying alpha
            let alpha = int(intensity * 200); // Alpha from ~40 to 200
            fillColor = color(139, 92, 246, alpha);
        }
        
        fill(fillColor);
        stroke(10, 10, 12); // Same as ocean (near black)
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
        let artist = csvData.getString(i, 'Artist').trim();
        let eventTitle = csvData.getString(i, 'Event Title');
        let city = csvData.getString(i, 'City').trim();
        let country = csvData.getString(i, 'Country').trim();
        let genres = csvData.getString(i, 'Genre(s)');
        let year = csvData.getString(i, 'Year');
        
        // Skip empty rows or rows without artist
        if (!artist || artist === '') continue;
        
        // Normalize artist name to handle case variations
        artist = artist.toLowerCase();
        
        // Parse genres
        let genreList = [];
        if (genres && genres.trim() !== '') {
            // Remove quotes and clean up genre string
            let cleanGenres = genres.replace(/['"]/g, '').trim();
            // Split by both comma and slash, then flatten the array
            let allGenreStrings = cleanGenres.split(/[,/]/).map(g => g.trim().toLowerCase()).filter(g => g);
            genreList = allGenreStrings;
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
        
        // Aggregate by country
        if (country && country !== '') {
            if (!countryStats[country]) {
                countryStats[country] = {
                    name: country,
                    artistCount: 0,
                    artists: [],
                    events: 0
                };
            }
            
            countryStats[country].artistCount++;
            countryStats[country].artists.push(artist);
            countryStats[country].events++;
        }
        
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
    
    // Calculate unique artists for countries
    for (let country in countryStats) {
        countryStats[country].uniqueArtists = [...new Set(countryStats[country].artists)].length;
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
    
    // Simple size with slight animation
    let starSize = 12;
    if (isHovered) {
        starSize = 14;
    }
    
    // Draw New Delhi marker as a rotating star with orange color
    push();
    translate(pos.x, pos.y);
    rotate(pulseAnimation * 0.05); // Slow rotation
    
    // Draw star
    fill(255, 165, 0); // Orange color
    noStroke();
    
    beginShape();
    for (let i = 0; i < 5; i++) {
        // Outer point
        let angle1 = TWO_PI / 5 * i - HALF_PI;
        let x1 = cos(angle1) * starSize;
        let y1 = sin(angle1) * starSize;
        vertex(x1, y1);
        
        // Inner point
        let angle2 = TWO_PI / 5 * i - HALF_PI + TWO_PI / 10;
        let x2 = cos(angle2) * starSize * 0.4;
        let y2 = sin(angle2) * starSize * 0.4;
        vertex(x2, y2);
    }
    endShape(CLOSE);
    
    pop();
}

function drawArtistCityMarker(city) {
    // Convert lat/lng to pixel position
    const pos = latLngToPixel(city.lat, city.lng);
    
    // Check if mouse is hovering over city
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let baseSize = map(city.artistCount, 1, 50, 6, 18);
    let isHovered = d < baseSize + 5;
    
    if (isHovered) {
        hoveredCity = city;
    }
    
    // Determine marker size
    let markerSize = baseSize;
    if (selectedCity === city) {
        markerSize = baseSize + 4;
    } else if (isHovered) {
        markerSize = baseSize + 3;
    }
    
    // Draw city marker with design colors
    noStroke();
    fill(255); // White for city markers
    circle(pos.x, pos.y, markerSize);
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
        let opacity = 120;
        let lineWeight = 1.5;
        
        // Draw connecting line with yellow-to-purple gradient
        drawGradientLine(cityPos.x, cityPos.y, venuePos.x, venuePos.y, lineWeight, opacity);
        
        // Draw animated dots (flowing from city to New Delhi)
        let dots = 2;
        for (let i = 0; i < dots; i++) {
            let t = (i / dots + pulseAnimation * 0.15) % 1;
            let x = lerp(cityPos.x, venuePos.x, t);
            let y = lerp(cityPos.y, venuePos.y, t);
            
            fill(255, opacity + 80);
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
        drawGradientLine(cityPos.x, cityPos.y, venuePos.x, venuePos.y, 2, 200);
        
        // Draw animated dots along straight line
        let dots = 4;
        for (let i = 0; i < dots; i++) {
            let t = (i / dots + pulseAnimation * 0.15) % 1;
            let x = lerp(cityPos.x, venuePos.x, t);
            let y = lerp(cityPos.y, venuePos.y, t);
            
            fill(255, 240);
            noStroke();
            circle(x, y, 4);
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
        
        // Draw the curved line with gradient using quadratic bezier
        noFill();
        strokeWeight(1.5);
        
        // Draw smooth curved line with gradient starting and ending exactly at city centers
        let segments = 20;
        for (let i = 0; i < segments; i++) {
            let t1 = i / segments; // Current segment start
            let t2 = (i + 1) / segments; // Current segment end
            
            // Calculate current and next points on the curve
            let x1 = pow(1 - t1, 2) * cityPos.x + 2 * (1 - t1) * t1 * controlX + pow(t1, 2) * venuePos.x;
            let y1 = pow(1 - t1, 2) * cityPos.y + 2 * (1 - t1) * t1 * controlY + pow(t1, 2) * venuePos.y;
            
            let x2 = pow(1 - t2, 2) * cityPos.x + 2 * (1 - t2) * t2 * controlX + pow(t2, 2) * venuePos.x;
            let y2 = pow(1 - t2, 2) * cityPos.y + 2 * (1 - t2) * t2 * controlY + pow(t2, 2) * venuePos.y;
            
            // Interpolate color from yellow to purple based on position
            let r = lerp(255, 139, t1); // 255->139 (yellow to purple red)
            let g = lerp(255, 92, t1);  // 255->92 (yellow to purple green) 
            let b = lerp(0, 246, t1);   // 0->246 (yellow to purple blue)
            
            stroke(r, g, b, 160);
            line(x1, y1, x2, y2);
        }
        
        // Draw animated dots along the curve
        let dots = 3;
        for (let j = 0; j < dots; j++) {
            let t = (j / dots + pulseAnimation * 0.15 + i * 0.1) % 1;
            
            // Calculate position on the bezier curve
            let x = pow(1 - t, 2) * cityPos.x + 2 * (1 - t) * t * controlX + pow(t, 2) * venuePos.x;
            let y = pow(1 - t, 2) * cityPos.y + 2 * (1 - t) * t * controlY + pow(t, 2) * venuePos.y;
            
            fill(255, 200);
            noStroke();
            circle(x, y, 4);
        }
    }
}

function drawArtistConnection() {
    if (!selectedArtist) return;
    
    // Find all events for the selected artist
    let artistEvents = eventsData.filter(e => e.artist === selectedArtist);
    
    if (artistEvents.length === 0 || !artistEvents[0].city || !cityCoordinates[artistEvents[0].city]) return;
    
    // Get the artist's city (first event city)
    let artistCity = artistEvents[0].city;
    const cityPos = latLngToPixel(cityCoordinates[artistCity].lat, cityCoordinates[artistCity].lng);
    const venuePos = latLngToPixel(VENUE.lat, VENUE.lng);
    
    // Draw single white line for selected artist
    stroke(255, 255, 255, 220); // Pure white
    strokeWeight(3);
    line(cityPos.x, cityPos.y, venuePos.x, venuePos.y);
    
    // Draw animated dots (white)
    let dots = 5;
    for (let i = 0; i < dots; i++) {
        let t = (i / dots + pulseAnimation * 0.2) % 1;
        let x = lerp(cityPos.x, venuePos.x, t);
        let y = lerp(cityPos.y, venuePos.y, t);
        
        fill(255, 255, 255, 240); // Pure white dots
        noStroke();
        circle(x, y, 6);
    }
}

function drawConcentricCircles() {
    if (!selectedArtist) return;
    
    // Find all events for the selected artist
    let artistEvents = eventsData.filter(e => e.artist === selectedArtist);
    let gigCount = artistEvents.length;
    
    if (gigCount === 0 || !artistEvents[0].city || !cityCoordinates[artistEvents[0].city]) return;
    
    // Get artist's city position
    let artistCity = artistEvents[0].city;
    const cityPos = latLngToPixel(cityCoordinates[artistCity].lat, cityCoordinates[artistCity].lng);
    
    // Draw concentric circles based on gig count
    // More gigs = more circles
    let numCircles = min(gigCount, 10); // Cap at 10 circles for visual clarity
    
    push();
    noFill();
    
    for (let i = 1; i <= numCircles; i++) {
        // Calculate circle properties
        let radius = i * 15; // Each circle is 15 pixels apart
        let animatedRadius = radius + sin(pulseAnimation + i * 0.3) * 3; // Slight pulsing effect
        
        // Draw glow effect (yellow) - multiple layers for stronger glow
        for (let j = 3; j >= 1; j--) {
            let glowAlpha = map(j, 1, 3, 80, 20) * map(i, 1, numCircles, 1, 0.5);
            stroke(255, 255, 0, glowAlpha); // Yellow glow
            strokeWeight(6 - j * 1.5);
            circle(cityPos.x, cityPos.y, animatedRadius * 2);
        }
        
        // Draw main circle with gradient from yellow to purple/pink
        let t = i / numCircles;
        let r = lerp(255, 139, t); // Yellow to purple red
        let g = lerp(255, 92, t);  // Yellow to purple green
        let b = lerp(0, 246, t);   // Yellow to purple blue
        
        // Opacity stays higher - less transparent
        let alpha = map(i, 1, numCircles, 240, 160);
        
        stroke(r, g, b, alpha);
        strokeWeight(2.5);
        circle(cityPos.x, cityPos.y, animatedRadius * 2);
    }
    
    pop();
}

function mousePressed() {
    handlePress();
}

// Handle both mouse and touch presses
function handlePress() {
    // Check if mouse is over the left panel - don't process map clicks
    const panel = document.getElementById('main-panel');
    if (panel) {
        const rect = panel.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
            return; // Click is on panel, ignore
        }
    }
    
    // Reset flags
    hasDragged = false;
    clickedOnInteractive = false;
    
    // Check if clicking on New Delhi venue
    const venuePos = latLngToPixel(VENUE.lat, VENUE.lng);
    let d = dist(mouseX, mouseY, venuePos.x, venuePos.y);
    if (d < 30) {
        clickedOnInteractive = true; // Mark that we clicked on something interactive
        isDragging = false; // Don't treat as drag
        
        // Spawn firecracker particles from New Delhi
        spawnParticles(venuePos.x, venuePos.y, 50);
        
        // Clear artist and genre selections
        selectedArtist = null;
        selectedGenre = 'all';
        
        // Reset dropdowns
        const artistDropdown = document.getElementById('artist-dropdown');
        if (artistDropdown) artistDropdown.value = '';
        const genreDropdown = document.getElementById('genre-dropdown');
        if (genreDropdown) genreDropdown.value = 'all';
        
        // Toggle showing all connections when clicking New Delhi
        if (selectedCity === 'NEW_DELHI_ALL') {
            selectedCity = null; // Hide all connections
        } else {
            selectedCity = 'NEW_DELHI_ALL'; // Special marker for showing all
        }
        updateVenueInfo();
        return;
    }
    
    // Check artist cities
    for (let city of artistCities) {
        const pos = latLngToPixel(city.lat, city.lng);
        let baseSize = map(city.artistCount, 1, 50, 8, 25);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < baseSize + 5) {
            clickedOnInteractive = true; // Mark that we clicked on something interactive
            isDragging = false; // Don't treat as drag
            
            // Clear artist and genre selections
            selectedArtist = null;
            selectedGenre = 'all';
            
            // Reset dropdowns
            const artistDropdown = document.getElementById('artist-dropdown');
            if (artistDropdown) artistDropdown.value = '';
            const genreDropdown = document.getElementById('genre-dropdown');
            if (genreDropdown) genreDropdown.value = 'all';
            
            selectedCity = selectedCity === city ? null : city;
            updateInfoPanel(city);
            return;
        }
    }
    
    // Start dragging - but don't clear selections yet
    // Will only clear if no drag actually happens (on mouseReleased)
    isDragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
}

// Add explicit touch support
function touchStarted() {
    // Check if touch is on the panel - allow default scrolling
    const panel = document.getElementById('main-panel');
    if (panel) {
        const rect = panel.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
            return true; // Allow default scrolling on panel
        }
    }
    
    // Check for multi-touch (pinch zoom)
    if (touches && touches.length === 2) {
        isPinching = true;
        isDragging = false;
        hasDragged = false;
        clickedOnInteractive = true; // Prevent reset on release
        // Calculate initial distance between two touches
        let touch1 = touches[0];
        let touch2 = touches[1];
        lastPinchDist = dist(touch1.x, touch1.y, touch2.x, touch2.y);
        console.log('Pinch started, distance:', lastPinchDist);
        return false;
    }
    
    isPinching = false;
    handlePress();
    return false; // Prevent default behavior on map
}

function mouseReleased() {
    handleRelease();
}

function handleRelease() {
    // Just reset the drag flags - don't clear selections
    isDragging = false;
    hasDragged = false;
    clickedOnInteractive = false;
}

// Add explicit touch end support
function touchEnded() {
    // Check if touch is on the panel - allow default scrolling
    const panel = document.getElementById('main-panel');
    if (panel) {
        const rect = panel.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
            return true; // Allow default behavior on panel
        }
    }
    
    // Reset pinch state when touches end
    if (!touches || touches.length < 2) {
        if (isPinching) {
            console.log('Pinch ended');
        }
        isPinching = false;
        lastPinchDist = 0;
    }
    
    handleRelease();
    return false; // Prevent default behavior on map
}

function mouseDragged() {
    handleDrag();
}

function handleDrag() {
    if (isDragging) {
        // Mark that dragging has occurred
        hasDragged = true;
        
        let deltaX = mouseX - lastMouseX;
        let deltaY = mouseY - lastMouseY;
        
        offsetX += deltaX;
        offsetY += deltaY;
        
        // Constrain panning to actual map edges - prevent showing empty space
        // Tight constraints based on the actual map projection bounds
        let maxOffsetX = zoom * 150;  // Very tight horizontal limit
        let maxOffsetY = zoom * 50;  // Very tight vertical limit
        
        offsetX = constrain(offsetX, -maxOffsetX, maxOffsetX);
        offsetY = constrain(offsetY, -maxOffsetY, maxOffsetY);
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;
    }
}

// Add explicit touch move support
function touchMoved() {
    // Check if touch is on the panel - allow default scrolling
    const panel = document.getElementById('main-panel');
    if (panel) {
        const rect = panel.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
            return true; // Allow default scrolling on panel
        }
    }
    
    // Handle pinch zoom
    if (touches && touches.length === 2 && isPinching) {
        let touch1 = touches[0];
        let touch2 = touches[1];
        let currentDist = dist(touch1.x, touch1.y, touch2.x, touch2.y);
        
        if (lastPinchDist > 0) {
            // Calculate zoom change based on distance change
            let distChange = currentDist - lastPinchDist;
            let zoomChange = distChange * 0.1; // Adjust sensitivity
            
            let oldZoom = zoom;
            zoom += zoomChange;
            zoom = constrain(zoom, 10, 500);
            
            console.log('Pinching: old zoom:', oldZoom.toFixed(1), 'new zoom:', zoom.toFixed(1));
            
            // Apply constraints to offset after zoom
            let maxOffsetX = zoom * 150;
            let maxOffsetY = zoom * 50;
            offsetX = constrain(offsetX, -maxOffsetX, maxOffsetX);
            offsetY = constrain(offsetY, -maxOffsetY, maxOffsetY);
        }
        
        lastPinchDist = currentDist;
        return false;
    }
    
    // Single touch - handle dragging
    handleDrag();
    return false; // Prevent default behavior on map
}

function mouseWheel(event) {
    // Check if mouse is over the left panel
    const panel = document.getElementById('main-panel');
    if (panel) {
        const rect = panel.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
            // Mouse is over the panel, allow default scrolling
            return true;
        }
    }
    
    // Mouse is over the map, zoom with scroll
    let zoomChange = -event.delta * 0.3;
    zoom += zoomChange;
    zoom = constrain(zoom, 10, 500);
    
    // Apply constraints to offset after zoom to keep map in bounds
    // Tight constraints based on the actual map projection bounds
    let maxOffsetX = zoom * 150;  // Horizontal limit
    let maxOffsetY = zoom * 50;  // Vertical limit
    
    offsetX = constrain(offsetX, -maxOffsetX, maxOffsetX);
    offsetY = constrain(offsetY, -maxOffsetY, maxOffsetY);
    
    return false; // Prevent page scrolling on map
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
            <p><strong>Unique Artists:</strong> ${city.uniqueArtists}</p>
            <p><strong>Events:</strong> ${city.events}</p>
            ${genreHtml ? `<div class="genres-section"><p><strong>Genres:</strong></p>${genreHtml}</div>` : ''}
            <p class="artists-list"><strong>Artists:</strong><br/>${artistNames}</p>
        `;
    } else {
        infoDiv.innerHTML = '';
    }
}

function updateGenreInfoPanel() {
    const infoDiv = document.getElementById('city-info');
    
    if (selectedGenre === 'all') {
        // Show overall stats when "all" is selected
        updateVenueInfo();
        return;
    }
    
    // Filter events by selected genre
    let genreEvents = eventsData.filter(e => e.genres.includes(selectedGenre));
    
    if (genreEvents.length === 0) {
        infoDiv.innerHTML = `
            <p class="city-name">${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)}</p>
            <p style="color: #ec4899;">No artists found for this genre.</p>
        `;
        return;
    }
    
    // Group artists by city
    let citiesMap = {};
    genreEvents.forEach(event => {
        if (!event.city || !cityCoordinates[event.city]) return;
        
        if (!citiesMap[event.city]) {
            citiesMap[event.city] = {
                city: event.city,
                country: event.country,
                artists: new Set()
            };
        }
        citiesMap[event.city].artists.add(event.artist);
    });
    
    // Convert to array and sort by number of artists (descending)
    let citiesArray = Object.values(citiesMap).map(city => ({
        ...city,
        artistCount: city.artists.size,
        artistList: Array.from(city.artists).sort()
    })).sort((a, b) => b.artistCount - a.artistCount);
    
    // Get total stats
    let totalArtists = [...new Set(genreEvents.map(e => e.artist))].length;
    let totalCities = citiesArray.length;
    let totalEvents = genreEvents.length;
    
    // Build HTML for cities and artists
    let citiesHtml = citiesArray.map(city => {
        let artistsText = city.artistList.join(', ');
        return `
            <div style="margin-bottom: 12px; padding: 8px; background: rgba(236, 72, 153, 0.1); border-left: 2px solid rgba(236, 72, 153, 0.5); border-radius: 4px;">
                <p style="margin: 0; font-weight: bold; color: #ec4899;">${city.city}, ${city.country}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #fbbf24;">${city.artistCount} artist${city.artistCount > 1 ? 's' : ''}</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #e0e0e0;">${artistsText}</p>
            </div>
        `;
    }).join('');
    
    infoDiv.innerHTML = `
        <p class="city-name">${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)}</p>
        <p style="font-size: 12px; color: #a855f7; margin-top: 5px;">★ Genre Overview</p>
        <p><strong>Total Artists:</strong> ${totalArtists}</p>
        <p><strong>Total Events:</strong> ${totalEvents}</p>
        <p><strong>Cities:</strong> ${totalCities}</p>
        <div style="margin-top: 15px;">
            <p><strong>Artists by City:</strong></p>
            ${citiesHtml}
        </div>
    `;
}

function updateArtistInfoPanel(artistName) {
    const infoDiv = document.getElementById('city-info');
    
    // Get all events for this artist
    let artistEvents = eventsData.filter(e => e.artist === artistName);
    
    if (artistEvents.length === 0) {
        infoDiv.innerHTML = `
            <p class="city-name">${artistName}</p>
            <p style="color: #ec4899;">No information found for this artist.</p>
        `;
        return;
    }
    
    // Get artist details
    let gigsPlayed = artistEvents.length;
    let city = artistEvents[0].city;
    let country = artistEvents[0].country;
    
    // Get all unique genres for this artist
    let allGenres = new Set();
    artistEvents.forEach(event => {
        event.genres.forEach(genre => allGenres.add(genre));
    });
    let genresList = Array.from(allGenres).sort();
    
    // Build genres HTML
    let genresHtml = genresList.map(genre => 
        `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; font-size: 11px; color: #a855f7;">${genre}</span>`
    ).join('');
    
    // Get event titles
    let eventTitles = [...new Set(artistEvents.map(e => e.eventTitle))].sort();
    let eventsHtml = eventTitles.map(title => 
        `<div style="margin: 4px 0; padding: 4px 8px; background: rgba(236, 72, 153, 0.1); border-radius: 4px; font-size: 11px; color: #e0e0e0;">${title}</div>`
    ).join('');
    
    infoDiv.innerHTML = `
        <p class="city-name">${artistName}</p>
        <p style="font-size: 12px; color: #fbbf24; margin-top: 5px;">★ Artist Profile</p>
        <p><strong>From:</strong> ${city}, ${country}</p>
        <p><strong>Gigs Played:</strong> ${gigsPlayed}</p>
        <div style="margin-top: 12px;">
            <p><strong>Genres:</strong></p>
            <div style="margin-top: 5px;">${genresHtml}</div>
        </div>
        <div style="margin-top: 15px;">
            <p><strong>Events Performed:</strong></p>
            ${eventsHtml}
        </div>
    `;
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
        selectedArtist = null;
        
        // Reset artist dropdown
        const artistDropdown = document.getElementById('artist-dropdown');
        if (artistDropdown) {
            artistDropdown.value = '';
        }
        
        updateGenreInfoPanel();
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
            // Clear other selections
            selectedCity = null;
            selectedGenre = 'all';
            
            // Reset genre dropdown
            const genreDropdown = document.getElementById('genre-dropdown');
            if (genreDropdown) {
                genreDropdown.value = 'all';
            }
            
            // Show artist info panel
            updateArtistInfoPanel(selectedArtist);
            
            // Find the artist's city for positioning
            let artistEvent = eventsData.find(e => e.artist === selectedArtist);
            if (artistEvent && artistEvent.city) {
                let city = artistCities.find(c => c.name === artistEvent.city);
                if (city) {
                    selectedCity = city;
                }
            }
        } else {
            // Clear selection
            selectedCity = null;
            updateGenreInfoPanel();
        }
    });
}

function setupControls() {
    // Setup genre and artist dropdowns (buttons removed)
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

