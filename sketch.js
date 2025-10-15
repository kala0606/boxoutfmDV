// Mappa instance
let mappa;
let myMap;
let canvas;

// Data
let artistCities = [];
let csvData;
let eventsData = [];
let genresData = [];
let selectedGenre = 'all';

// New Delhi - The single venue for all events
const VENUE = {
    name: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090
};

// World city coordinates
const cityCoordinates = {
    // India
    'New Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Goa': { lat: 15.2993, lng: 74.1240 },
    
    // USA
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Vancouver': { lat: 49.2827, lng: -123.1207 },
    
    // Europe
    'London': { lat: 51.5074, lng: -0.1278 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Prague': { lat: 50.0755, lng: 14.4378 },
    'Tromsø': { lat: 69.6492, lng: 18.9553 },
    
    // Middle East
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Tel Aviv': { lat: 32.0853, lng: 34.7818 },
    
    // Asia Pacific
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Seoul': { lat: 37.5665, lng: 126.9780 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Melbourne': { lat: -37.8136, lng: 144.9631 },
    
    // Africa
    'Lagos': { lat: 6.5244, lng: 3.3792 },
    'Cape Town': { lat: -33.9249, lng: 18.4241 },
    'Johannesburg': { lat: -26.2041, lng: 28.0473 },
    
    // South America
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
    'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 }
};

// Map options - World view
const options = {
    lat: 20,
    lng: 20,
    zoom: 1,
    style: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
};

// Visualization settings
let showLabels = true;
let hoveredCity = null;
let selectedCity = null;
let selectedArtist = null;
let artistsData = {};
let pulseAnimation = 0;

function preload() {
    // Load CSV data
    csvData = loadTable('BO.csv', 'csv', 'header');
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    
    // Create Mappa instance
    mappa = new Mappa('Leaflet');
    
    // Create tile map
    myMap = mappa.tileMap(options);
    myMap.overlay(canvas);
    
    // Process CSV data
    processData();
    
    // Setup UI controls
    setupControls();
}

function draw() {
    clear();
    
    // Update animation
    pulseAnimation += 0.05;
    
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
        if (city && city !== '' && cityCoordinates[city]) {
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
    
    // Populate genre dropdown
    populateGenreDropdown();
    
    // Populate artist dropdown
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
    const pos = myMap.latLngToPixel(VENUE.lat, VENUE.lng);
    
    // Check if mouse is hovering
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let isHovered = d < 30;
    
    // Calculate total events
    let totalEvents = eventsData.length;
    let filteredEvents = selectedGenre === 'all' ? totalEvents : 
        eventsData.filter(e => e.genres.includes(selectedGenre)).length;
    
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
    
    // Draw venue icon (star)
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text('★', pos.x, pos.y - 2);
    
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
    const pos = myMap.latLngToPixel(city.lat, city.lng);
    
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
    const venuePos = myMap.latLngToPixel(VENUE.lat, VENUE.lng);
    const cityPos = myMap.latLngToPixel(city.lat, city.lng);
    
    // Only draw if not the same city
    if (city.name === VENUE.name) return;
    
    // Line opacity based on selection
    let opacity = selectedCity === city ? 150 : 60;
    let lineWeight = selectedCity === city ? 2.5 : 1.5;
    
    // Draw connecting line
    stroke(236, 72, 153, opacity);
    strokeWeight(lineWeight);
    line(cityPos.x, cityPos.y, venuePos.x, venuePos.y);
    
    // Draw animated dots (flowing from city to New Delhi)
    if (selectedCity === null || selectedCity === city) {
        let dots = selectedCity === city ? 4 : 2;
        for (let i = 0; i < dots; i++) {
            let t = (i / dots + pulseAnimation * 0.15) % 1;
            let x = lerp(cityPos.x, venuePos.x, t);
            let y = lerp(cityPos.y, venuePos.y, t);
            
            fill(236, 72, 153, opacity + 60);
            noStroke();
            circle(x, y, selectedCity === city ? 5 : 3);
        }
    }
}

function drawArtistConnection() {
    // Draw connection for selected artist
    if (!selectedArtist || !selectedArtist.homeCity) return;
    
    const venuePos = myMap.latLngToPixel(VENUE.lat, VENUE.lng);
    
    if (!cityCoordinates[selectedArtist.homeCity]) return;
    
    const homeCityCoord = cityCoordinates[selectedArtist.homeCity];
    const homeCityPos = myMap.latLngToPixel(homeCityCoord.lat, homeCityCoord.lng);
    
    // Draw highlighted connection
    stroke(255, 215, 0, 180);
    strokeWeight(3.5);
    line(homeCityPos.x, homeCityPos.y, venuePos.x, venuePos.y);
    
    // Draw animated dots
    let dots = 5;
    for (let i = 0; i < dots; i++) {
        let t = (i / dots + pulseAnimation * 0.2) % 1;
        let x = lerp(homeCityPos.x, venuePos.x, t);
        let y = lerp(homeCityPos.y, venuePos.y, t);
        
        fill(255, 215, 0, 220);
        noStroke();
        circle(x, y, 7);
    }
}

function populateGenreDropdown() {
    const dropdown = document.getElementById('genre-dropdown');
    if (!dropdown) return;
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add genres to dropdown
    for (let genre of genresData) {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1);
        dropdown.appendChild(option);
    }
    
    // Add change event listener
    dropdown.addEventListener('change', function() {
        selectedGenre = this.value;
        selectedCity = null;
        selectedArtist = null;
        updateInfoPanel(null);
    });
}

function populateArtistDropdown() {
    const dropdown = document.getElementById('artist-dropdown');
    if (!dropdown) return;
    
    // Get unique artists from events
    let artistSet = new Set();
    eventsData.forEach(event => {
        if (event.artist && event.artist.trim() !== '') {
            artistSet.add(event.artist);
        }
    });
    
    // Sort artists alphabetically
    const sortedArtists = Array.from(artistSet).sort((a, b) => 
        a.localeCompare(b)
    );
    
    // Clear existing options
    dropdown.innerHTML = '<option value="">-- Select Artist --</option>';
    
    // Add artists to dropdown
    for (let artist of sortedArtists) {
        const option = document.createElement('option');
        option.value = artist;
        option.textContent = artist;
        dropdown.appendChild(option);
    }
    
    // Add change event listener
    dropdown.addEventListener('change', function() {
        if (this.value === '') {
            selectedArtist = null;
            selectedCity = null;
            updateInfoPanel(null);
        } else {
            // Get artist data
            let artistEvents = eventsData.filter(e => e.artist === this.value);
            let artistCity = artistEvents[0]?.city || '';
            
            selectedArtist = {
                name: this.value,
                homeCity: artistCity,
                eventCount: artistEvents.length
            };
            selectedCity = null;
            updateArtistInfoPanel(selectedArtist);
        }
    });
}

function updateArtistInfoPanel(artist) {
    const infoDiv = document.getElementById('city-info');
    
    if (artist) {
        let artistEvents = eventsData.filter(e => e.artist === artist.name);
        
        // Get genres
        let genreSet = new Set();
        artistEvents.forEach(e => e.genres.forEach(g => genreSet.add(g)));
        let genresHtml = Array.from(genreSet).length > 0 ? 
            Array.from(genreSet).map(g => 
                `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; font-size: 11px; color: #c4b5fd;">${g}</span>`
            ).join('') : 'N/A';
        
        infoDiv.innerHTML = `
            <p class="city-name">${artist.name}</p>
            <p style="font-size: 12px; color: #ffd700; margin-top: 5px;">🎤 Artist Profile</p>
            <p><strong>Home City:</strong> ${artist.homeCity || 'Unknown'}</p>
            <p><strong>Total Events:</strong> ${artistEvents.length}</p>
            <p><strong>Genres:</strong><br/>${genresHtml}</p>
            <p style="font-size: 11px; color: #c4c4e0; margin-top: 10px;">Gold line shows artist's journey to New Delhi</p>
        `;
    } else {
        infoDiv.innerHTML = '';
    }
}

function mousePressed() {
    let filteredCities = getFilteredCities();
    
    // Check if New Delhi (venue) was clicked
    const venuePos = myMap.latLngToPixel(VENUE.lat, VENUE.lng);
    let dVenue = dist(mouseX, mouseY, venuePos.x, venuePos.y);
    
    if (dVenue < 30) {
        selectedCity = null;
        selectedArtist = null;
        updateVenueInfo();
        return;
    }
    
    // Check if an artist city was clicked
    for (let city of filteredCities) {
        const pos = myMap.latLngToPixel(city.lat, city.lng);
        let baseSize = map(city.artistCount, 1, 50, 8, 25);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < baseSize + 5) {
            selectedCity = selectedCity === city ? null : city;
            selectedArtist = null;
            updateInfoPanel(city);
            return;
        }
    }
    
    // Clear selection if clicked elsewhere
    selectedCity = null;
    selectedArtist = null;
    updateInfoPanel(null);
}

function mouseMoved() {
    hoveredCity = null;
    let filteredCities = getFilteredCities();
    
    // Check if hovering over New Delhi
    const venuePos = myMap.latLngToPixel(VENUE.lat, VENUE.lng);
    if (dist(mouseX, mouseY, venuePos.x, venuePos.y) < 30) {
        cursor(HAND);
        return;
    }
    
    // Check if hovering over an artist city
    for (let city of filteredCities) {
        const pos = myMap.latLngToPixel(city.lat, city.lng);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        let baseSize = map(city.artistCount, 1, 50, 8, 25);
        
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
    
    let filteredEvents = selectedGenre === 'all' ? eventsData : 
        eventsData.filter(e => e.genres.includes(selectedGenre));
    
    // Get unique artists
    let artistSet = new Set();
    filteredEvents.forEach(e => artistSet.add(e.artist));
    
    // Get unique cities
    let citySet = new Set();
    filteredEvents.forEach(e => {
        if (e.city && cityCoordinates[e.city]) citySet.add(e.city);
    });
    
    infoDiv.innerHTML = `
        <p class="city-name">NEW DELHI</p>
        <p style="font-size: 12px; color: #ffd700; margin-top: 5px;">★ Venue</p>
        <p><strong>Total Events:</strong> ${filteredEvents.length}</p>
        <p><strong>Unique Artists:</strong> ${artistSet.size}</p>
        <p><strong>Cities Represented:</strong> ${citySet.size}</p>
        <p style="font-size: 11px; color: #c4c4e0; margin-top: 10px;">Pink lines show artist journeys from their home cities</p>
    `;
}

function updateInfoPanel(city) {
    const infoDiv = document.getElementById('city-info');
    
    if (city) {
        // Get events from this city
        let cityEvents = eventsData.filter(e => e.city === city.name);
        
        // Get unique artists
        let uniqueArtistsList = [...new Set(cityEvents.map(e => e.artist))];
        
        // Get genres
        let genreSet = new Set();
        cityEvents.forEach(e => e.genres.forEach(g => genreSet.add(g)));
        let genresHtml = Array.from(genreSet).length > 0 ? 
            Array.from(genreSet).map(g => 
                `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; font-size: 11px; color: #fbcfe8;">${g}</span>`
            ).join('') : 'N/A';
        
        infoDiv.innerHTML = `
            <p class="city-name">${city.name}</p>
            <p style="font-size: 12px; color: #f472b6; margin-top: 5px;">🎸 Artist City</p>
            <p><strong>Country:</strong> ${city.country || 'N/A'}</p>
            <p><strong>Artists From Here:</strong> ${city.artistCount}</p>
            <p><strong>Unique Artists:</strong> ${city.uniqueArtists}</p>
            <p><strong>Events Played:</strong> ${city.events}</p>
            <p><strong>Genres:</strong><br/>${genresHtml}</p>
            <p style="font-size: 11px; color: #c4c4e0; margin-top: 10px;">Pink line shows connection to New Delhi venue</p>
        `;
    } else {
        infoDiv.innerHTML = '';
    }
}

function setupControls() {
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        myMap.map.setView([20, 20], 2);
        selectedCity = null;
        selectedArtist = null;
        selectedGenre = 'all';
        if (document.getElementById('artist-dropdown')) {
            document.getElementById('artist-dropdown').value = '';
        }
        if (document.getElementById('genre-dropdown')) {
            document.getElementById('genre-dropdown').value = 'all';
        }
        updateInfoPanel(null);
    });
    
    // Toggle labels button
    document.getElementById('toggle-labels').addEventListener('click', function() {
        showLabels = !showLabels;
        this.textContent = showLabels ? 'Hide Labels' : 'Show Labels';
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Keyboard shortcuts
function keyPressed() {
    if (key === 'r' || key === 'R') {
        // Reset view
        myMap.map.setView([20, 20], 2);
        selectedCity = null;
        selectedArtist = null;
        selectedGenre = 'all';
        if (document.getElementById('artist-dropdown')) {
            document.getElementById('artist-dropdown').value = '';
        }
        if (document.getElementById('genre-dropdown')) {
            document.getElementById('genre-dropdown').value = 'all';
        }
        updateInfoPanel(null);
    } else if (key === 'l' || key === 'L') {
        // Toggle labels
        showLabels = !showLabels;
    }
}

