// Mappa instance
let mappa;
let myMap;
let canvas;

// Data
let cityData = [];
let tier2CityData = [];
let csvData;
let gigsData = [];

// City coordinates for India
const cityCoordinates = {
    // Venue Cities (Metro)
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    
    // Tier 2 Cities - North
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Chandigarh': { lat: 30.7333, lng: 76.7794 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
    'Dehradun': { lat: 30.3165, lng: 78.0322 },
    'Amritsar': { lat: 31.6340, lng: 74.8723 },
    'Shimla': { lat: 31.1048, lng: 77.1734 },
    'Udaipur': { lat: 24.5854, lng: 73.7125 },
    
    // Tier 2 Cities - West
    'Goa': { lat: 15.2993, lng: 74.1240 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Nashik': { lat: 19.9975, lng: 73.7898 },
    'Nasik': { lat: 19.9975, lng: 73.7898 },
    'Surat': { lat: 21.1702, lng: 72.8311 },
    'Vadodara': { lat: 22.3072, lng: 73.1812 },
    'Nagpur': { lat: 21.1458, lng: 79.0882 },
    'Indore': { lat: 22.7196, lng: 75.8577 },
    'Lonavala': { lat: 18.7539, lng: 73.4066 },
    'Aurangabad': { lat: 19.8762, lng: 75.3433 },
    
    // Tier 2 Cities - South
    'Kochi': { lat: 9.9312, lng: 76.2673 },
    'Coimbatore': { lat: 11.0168, lng: 76.9558 },
    'Mysore': { lat: 12.2958, lng: 76.6394 },
    'Mangalore': { lat: 12.9141, lng: 74.8560 },
    'Pondicherry': { lat: 11.9416, lng: 79.8083 },
    'Madurai': { lat: 9.9252, lng: 78.1198 },
    'Vishakhapatnam': { lat: 17.6869, lng: 83.2185 },
    'Vijayawada': { lat: 16.5062, lng: 80.6480 },
    'Tirupati': { lat: 13.6288, lng: 79.4192 },
    'Warangal': { lat: 17.9689, lng: 79.5941 },
    'Hubli': { lat: 15.3647, lng: 75.1240 },
    
    // Tier 2 Cities - East
    'Shillong': { lat: 25.5788, lng: 91.8933 },
    'Guwahati': { lat: 26.1445, lng: 91.7362 },
    'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'Patna': { lat: 25.5941, lng: 85.1376 },
    'Ranchi': { lat: 23.3441, lng: 85.3096 },
    'Darjeeling': { lat: 27.0410, lng: 88.2663 },
    'Siliguri': { lat: 26.7271, lng: 88.3953 },
    'Agartala': { lat: 23.8315, lng: 91.2868 },
    'Cuttack': { lat: 20.5124, lng: 85.8829 },
    'Raipur': { lat: 21.2514, lng: 81.6296 }
};

// Map options
const options = {
    lat: 22.5,
    lng: 79.0,
    zoom: 5,
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
    csvData = loadTable('boxoutimpact.csv', 'csv', 'header');
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
    
    // Draw tier 2 city markers first (in background)
    for (let tier2City of tier2CityData) {
        drawTier2CityMarker(tier2City);
    }
    
    // Draw connections between cities
    if (selectedCity) {
        drawConnections();
    }
    
    // Draw artist connections if artist is selected
    if (selectedArtist) {
        drawArtistConnections();
    }
    
    // Draw main venue city markers (on top)
    for (let city of cityData) {
        drawCityMarker(city);
    }
}

function processData() {
    // First, collect all gigs data
    for (let i = 0; i < csvData.getRowCount(); i++) {
        gigsData.push({
            gigNo: csvData.getString(i, 'Gig No'),
            venue: csvData.getString(i, 'Venue'),
            artistCity: csvData.getString(i, 'Artist City'),
            artistFollowing: parseInt(csvData.getString(i, 'Artist Following')) || 0,
            venueGathering: parseInt(csvData.getString(i, 'Venue Gathering')) || 0,
            artist: csvData.getString(i, 'Artist')
        });
    }
    
    // Aggregate data by venue city
    const venueCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad'];
    let cityStats = {};
    let tier2Stats = {};
    
    for (let city in cityCoordinates) {
        if (venueCities.includes(city)) {
            cityStats[city] = {
                name: city,
                lat: cityCoordinates[city].lat,
                lng: cityCoordinates[city].lng,
                gigs: new Set(),
                artists: [],
                totalGathering: 0,
                totalFollowers: 0,
                artistCities: {},
                gigsList: [],
                isVenue: true
            };
        } else {
            tier2Stats[city] = {
                name: city,
                lat: cityCoordinates[city].lat,
                lng: cityCoordinates[city].lng,
                artistCount: 0,
                venuesPlayedAt: {},
                artists: [],
                totalFollowers: 0,
                isVenue: false
            };
        }
    }
    
    // Process each row
    for (let entry of gigsData) {
        let venue = entry.venue;
        let artistCity = entry.artistCity;
        
        // Track venue city data
        if (cityStats[venue]) {
            cityStats[venue].gigs.add(entry.gigNo);
            cityStats[venue].artists.push(entry.artist);
            cityStats[venue].totalFollowers += entry.artistFollowing;
            
            // Track artist home cities
            if (artistCity) {
                if (!cityStats[venue].artistCities[artistCity]) {
                    cityStats[venue].artistCities[artistCity] = 0;
                }
                cityStats[venue].artistCities[artistCity]++;
            }
            
            // Group by gig
            let gigIndex = cityStats[venue].gigsList.findIndex(g => g.gigNo === entry.gigNo);
            if (gigIndex === -1) {
                cityStats[venue].gigsList.push({
                    gigNo: entry.gigNo,
                    artists: [entry.artist],
                    gathering: entry.venueGathering,
                    totalFollowers: entry.artistFollowing
                });
                cityStats[venue].totalGathering += entry.venueGathering;
            } else {
                cityStats[venue].gigsList[gigIndex].artists.push(entry.artist);
                cityStats[venue].gigsList[gigIndex].totalFollowers += entry.artistFollowing;
            }
        }
        
        // Track tier 2 city data (where artists came from)
        if (tier2Stats[artistCity]) {
            tier2Stats[artistCity].artistCount++;
            tier2Stats[artistCity].artists.push(entry.artist);
            tier2Stats[artistCity].totalFollowers += entry.artistFollowing;
            
            if (!tier2Stats[artistCity].venuesPlayedAt[venue]) {
                tier2Stats[artistCity].venuesPlayedAt[venue] = 0;
            }
            tier2Stats[artistCity].venuesPlayedAt[venue]++;
        }
    }
    
    // Convert venue cities to array
    for (let city in cityStats) {
        let stats = cityStats[city];
        stats.gigCount = stats.gigs.size;
        stats.uniqueArtists = [...new Set(stats.artists)].length;
        stats.avgGathering = stats.gigCount > 0 ? Math.round(stats.totalGathering / stats.gigCount) : 0;
        cityData.push(stats);
    }
    
    // Convert tier 2 cities to array (only those with artists)
    for (let city in tier2Stats) {
        let stats = tier2Stats[city];
        if (stats.artistCount > 0) {
            stats.uniqueArtists = [...new Set(stats.artists)].length;
            stats.venueCount = Object.keys(stats.venuesPlayedAt).length;
            tier2CityData.push(stats);
        }
    }
    
    // Build artists data
    for (let entry of gigsData) {
        let artistName = entry.artist;
        
        if (!artistsData[artistName]) {
            artistsData[artistName] = {
                name: artistName,
                homeCity: entry.artistCity,
                venues: {},
                totalGigs: 0,
                totalFollowers: entry.artistFollowing
            };
        }
        
        if (!artistsData[artistName].venues[entry.venue]) {
            artistsData[artistName].venues[entry.venue] = 0;
        }
        artistsData[artistName].venues[entry.venue]++;
        artistsData[artistName].totalGigs++;
    }
    
    // Populate artist dropdown
    populateArtistDropdown();
}

function drawCityMarker(city) {
    // Convert lat/lng to pixel position
    const pos = myMap.latLngToPixel(city.lat, city.lng);
    
    // Check if mouse is hovering over city
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let baseSize = map(city.gigCount, 0, 25, 20, 45);
    let isHovered = d < baseSize;
    
    if (isHovered) {
        hoveredCity = city;
    }
    
    // Determine marker size and color based on gig count
    let markerSize = baseSize;
    let markerColor;
    
    if (selectedCity === city) {
        markerSize = baseSize + 10 + sin(pulseAnimation) * 5;
        markerColor = color(167, 139, 250, 220); // Light purple when selected
    } else if (isHovered) {
        markerSize = baseSize + 8;
        markerColor = color(196, 181, 253, 200); // Lighter purple on hover
    } else {
        markerSize = baseSize + sin(pulseAnimation + cityData.indexOf(city)) * 3;
        markerColor = color(139, 92, 246, 180); // Purple default
    }
    
    // Draw outer glow
    noStroke();
    fill(markerColor.levels[0], markerColor.levels[1], markerColor.levels[2], 50);
    circle(pos.x, pos.y, markerSize + 15);
    
    // Draw main marker
    fill(markerColor);
    stroke(255);
    strokeWeight(2);
    circle(pos.x, pos.y, markerSize);
    
    // Draw inner dot
    fill(255);
    noStroke();
    circle(pos.x, pos.y, markerSize * 0.3);
    
    // Draw gig count in center
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(markerSize * 0.25); // Reduced font size
    textStyle(BOLD);
    text(city.gigCount, pos.x, pos.y);
    
    // Draw city label
    if (showLabels || isHovered || selectedCity === city) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textAlign(CENTER, CENTER);
        textSize(14);
        textStyle(BOLD);
        text(city.name, pos.x, pos.y - markerSize - 15);
        
        // Show gig count below
        textSize(11);
        textStyle(NORMAL);
        text(city.gigCount + ' gigs', pos.x, pos.y + markerSize + 15);
    }
}

function drawTier2CityMarker(city) {
    // Convert lat/lng to pixel position
    const pos = myMap.latLngToPixel(city.lat, city.lng);
    
    // Check if mouse is hovering
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let baseSize = map(city.artistCount, 1, 20, 6, 12);
    let isHovered = d < baseSize + 5;
    
    // Check if this is the selected artist's home city
    let isArtistHome = selectedArtist && selectedArtist.homeCity === city.name;
    
    // Determine marker size and color
    let markerSize = baseSize;
    let markerColor;
    
    if (isArtistHome) {
        markerSize = baseSize + 10 + sin(pulseAnimation) * 4;
        markerColor = color(255, 215, 0, 240); // Bright gold for artist's home
    } else if (selectedCity === city) {
        markerSize = baseSize + 6 + sin(pulseAnimation) * 3;
        markerColor = color(244, 114, 182, 220); // Bright pink for selected
    } else if (isHovered) {
        markerSize = baseSize + 4;
        markerColor = color(251, 182, 206, 200); // Light pink on hover
    } else {
        markerSize = baseSize + sin(pulseAnimation + tier2CityData.indexOf(city) * 0.5) * 1.5;
        markerColor = color(236, 72, 153, 150); // Pink default
    }
    
    // Draw outer glow
    noStroke();
    if (isArtistHome) {
        fill(255, 215, 0, 80); // Gold glow for artist home
    } else {
        fill(236, 72, 153, 40); // Pink glow
    }
    circle(pos.x, pos.y, markerSize + 8);
    
    // Draw main marker
    fill(markerColor);
    stroke(255);
    strokeWeight(1);
    circle(pos.x, pos.y, markerSize);
    
    // Draw inner dot
    fill(255, 255, 255, 200);
    noStroke();
    circle(pos.x, pos.y, markerSize * 0.4);
    
    // Show city name and info on hover or if selected
    if (isHovered || selectedCity === city) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textAlign(CENTER, CENTER);
        textSize(10);
        textStyle(BOLD);
        text(city.name, pos.x, pos.y - markerSize - 10);
        
        // Show artist count
        textSize(8);
        textStyle(NORMAL);
        text(city.artistCount + ' artists', pos.x, pos.y + markerSize + 10);
    }
}

function drawConnections() {
    if (!selectedCity) return;
    
    const selectedPos = myMap.latLngToPixel(selectedCity.lat, selectedCity.lng);
    const metroCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad'];
    
    // Check if selected city is a venue or tier 2 city
    if (selectedCity.isVenue) {
        // VENUE CITY SELECTED: Show where artists came FROM
        let artistCityConnections = {};
        
        for (let [cityName, count] of Object.entries(selectedCity.artistCities)) {
            if (cityCoordinates[cityName] && cityName !== selectedCity.name) {
                artistCityConnections[cityName] = count;
            }
        }
        
        // Draw connections to artist home cities
        for (let [cityName, count] of Object.entries(artistCityConnections)) {
            const cityCoord = cityCoordinates[cityName];
            const pos = myMap.latLngToPixel(cityCoord.lat, cityCoord.lng);
            
            // Determine if metro or tier 2
            let isMetro = metroCities.includes(cityName);
            
                // Draw connecting line
                if (isMetro) {
                    stroke(139, 92, 246, 120); // Purple for metro
                    strokeWeight(2.5);
                } else {
                    stroke(236, 72, 153, 100); // Pink for tier 2
                    strokeWeight(2);
                }
            line(selectedPos.x, selectedPos.y, pos.x, pos.y);
            
            // Draw animated dots (flowing from artist city to venue)
            let dots = 3;
            for (let i = 0; i < dots; i++) {
                let t = (i / dots + pulseAnimation * 0.15) % 1;
                let x = lerp(pos.x, selectedPos.x, t);
                let y = lerp(pos.y, selectedPos.y, t);
                
                    if (isMetro) {
                        fill(139, 92, 246, 180); // Purple dots
                    } else {
                        fill(236, 72, 153, 180); // Pink dots
                    }
                noStroke();
                circle(x, y, 5);
            }
            
            // Draw small marker at artist city
            drawSmallCityMarker(pos, count, cityName, isMetro);
        }
    } else {
        // TIER 2 CITY SELECTED: Show where artists went TO (venues)
        for (let [venueName, count] of Object.entries(selectedCity.venuesPlayedAt)) {
            if (cityCoordinates[venueName]) {
                const venueCoord = cityCoordinates[venueName];
                const pos = myMap.latLngToPixel(venueCoord.lat, venueCoord.lng);
                
                // Draw connecting line (pink for tier 2 to venue)
                stroke(236, 72, 153, 120); // Pink for tier 2 -> venue
                strokeWeight(2.5);
                line(selectedPos.x, selectedPos.y, pos.x, pos.y);
                
                // Draw animated dots (flowing from tier 2 city to venue)
                let dots = 3;
                for (let i = 0; i < dots; i++) {
                    let t = (i / dots + pulseAnimation * 0.15) % 1;
                    let x = lerp(selectedPos.x, pos.x, t);
                    let y = lerp(selectedPos.y, pos.y, t);
                    
                    fill(236, 72, 153, 180); // Pink dots
                    noStroke();
                    circle(x, y, 5);
                }
                
                // Draw marker at venue
                drawSmallCityMarker(pos, count, venueName, true);
            }
        }
    }
}

function drawSmallCityMarker(pos, count, cityName, isMetro) {
    let markerSize = map(count, 1, 10, 8, 16);
    
    // Outer glow
    noStroke();
    if (isMetro) {
        fill(139, 92, 246, 40); // Purple glow
    } else {
        fill(236, 72, 153, 40); // Pink glow
    }
    circle(pos.x, pos.y, markerSize + 8);
    
    // Main marker
    if (isMetro) {
        fill(139, 92, 246, 200); // Purple
        stroke(255);
    } else {
        fill(236, 72, 153, 200); // Pink
        stroke(255);
    }
    strokeWeight(1.5);
    circle(pos.x, pos.y, markerSize);
    
    // Count
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(markerSize * 0.5);
    textStyle(BOLD);
    text(count, pos.x, pos.y);
    
    // City label on hover
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    if (d < markerSize || d < 15) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textSize(11);
        textStyle(NORMAL);
        text(cityName, pos.x, pos.y - markerSize - 8);
    }
}

function drawArtistConnections() {
    if (!selectedArtist || !selectedArtist.homeCity) return;
    
    // Get artist's home city coordinates
    if (!cityCoordinates[selectedArtist.homeCity]) return;
    
    const homeCoord = cityCoordinates[selectedArtist.homeCity];
    const homePos = myMap.latLngToPixel(homeCoord.lat, homeCoord.lng);
    
    // Draw lines to all venues the artist played at
    for (let [venueName, gigCount] of Object.entries(selectedArtist.venues)) {
        if (cityCoordinates[venueName]) {
            const venueCoord = cityCoordinates[venueName];
            const venuePos = myMap.latLngToPixel(venueCoord.lat, venueCoord.lng);
            
            // Draw connecting line (gold for artist journey)
            stroke(255, 215, 0, 150);
            strokeWeight(3);
            line(homePos.x, homePos.y, venuePos.x, venuePos.y);
            
            // Draw animated dots (flowing from home to venue)
            let dots = 4;
            for (let i = 0; i < dots; i++) {
                let t = (i / dots + pulseAnimation * 0.2) % 1;
                let x = lerp(homePos.x, venuePos.x, t);
                let y = lerp(homePos.y, venuePos.y, t);
                
                fill(255, 215, 0, 200);
                noStroke();
                circle(x, y, 6);
            }
            
            // Draw venue marker
            let markerSize = map(gigCount, 1, 5, 10, 18);
            
            // Glow
            noStroke();
            fill(139, 92, 246, 60);
            circle(venuePos.x, venuePos.y, markerSize + 10);
            
            // Main marker
            fill(139, 92, 246, 220);
            stroke(255, 215, 0, 200);
            strokeWeight(2);
            circle(venuePos.x, venuePos.y, markerSize);
            
            // Gig count
            fill(255);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(markerSize * 0.5);
            textStyle(BOLD);
            text(gigCount, venuePos.x, venuePos.y);
        }
    }
}

function populateArtistDropdown() {
    const dropdown = document.getElementById('artist-dropdown');
    
    // Sort artists by name
    const sortedArtists = Object.values(artistsData).sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    // Add artists to dropdown
    for (let artist of sortedArtists) {
        const option = document.createElement('option');
        option.value = artist.name;
        option.textContent = `${artist.name} (${artist.totalGigs} gigs)`;
        dropdown.appendChild(option);
    }
    
    // Add change event listener
    dropdown.addEventListener('change', function() {
        if (this.value === '') {
            selectedArtist = null;
            selectedCity = null;
            updateInfoPanel(null);
        } else {
            selectedArtist = artistsData[this.value];
            selectedCity = null;
            updateArtistInfoPanel(selectedArtist);
        }
    });
}

function updateArtistInfoPanel(artist) {
    const infoDiv = document.getElementById('city-info');
    
    if (artist) {
        let venuesHtml = '';
        let sortedVenues = Object.entries(artist.venues)
            .sort((a, b) => b[1] - a[1]);
        
        for (let [venueName, count] of sortedVenues) {
            venuesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; font-size: 11px; color: #c4b5fd;">${venueName} (${count})</span>`;
        }
        
        infoDiv.innerHTML = `
            <p class="city-name">${artist.name}</p>
            <p style="font-size: 12px; color: #ffd700; margin-top: 5px;">🎤 Artist Profile</p>
            <p><strong>Home City:</strong> ${artist.homeCity || 'N/A'}</p>
            <p><strong>Total Gigs:</strong> ${artist.totalGigs}</p>
            <p><strong>Total Followers:</strong> ${artist.totalFollowers.toLocaleString()}</p>
            <p><strong>Venues Played:</strong> ${Object.keys(artist.venues).length}</p>
            <p><strong>Venue List:</strong><br/>${venuesHtml}</p>
        `;
    } else {
        infoDiv.innerHTML = '';
    }
}

function mousePressed() {
    // Check if a venue city was clicked (check these first as they're larger)
    for (let city of cityData) {
        const pos = myMap.latLngToPixel(city.lat, city.lng);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < 25) {
            selectedCity = selectedCity === city ? null : city;
            updateInfoPanel(city);
            return;
        }
    }
    
    // Check if a tier 2 city was clicked (always visible now)
    for (let tier2City of tier2CityData) {
        const pos = myMap.latLngToPixel(tier2City.lat, tier2City.lng);
        let baseSize = map(tier2City.artistCount, 1, 20, 6, 12);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < baseSize + 5) {
            selectedCity = selectedCity === tier2City ? null : tier2City;
            updateInfoPanel(tier2City);
            return;
        }
    }
    
    // Check if clicking on connection markers when a city is selected
    if (selectedCity && selectedCity.isVenue) {
        // Check if clicking on artist city markers in connections
        for (let [cityName, count] of Object.entries(selectedCity.artistCities)) {
            if (cityCoordinates[cityName]) {
                const pos = myMap.latLngToPixel(cityCoordinates[cityName].lat, cityCoordinates[cityName].lng);
                let markerSize = map(count, 1, 10, 8, 16);
                let d = dist(mouseX, mouseY, pos.x, pos.y);
                
                if (d < markerSize) {
                    let tier2City = tier2CityData.find(c => c.name === cityName);
                    if (tier2City) {
                        selectedCity = tier2City;
                        updateInfoPanel(tier2City);
                        return;
                    }
                }
            }
        }
    }
    
    // Check if clicking on venue markers when tier 2 city is selected
    if (selectedCity && !selectedCity.isVenue) {
        for (let [venueName, count] of Object.entries(selectedCity.venuesPlayedAt)) {
            if (cityCoordinates[venueName]) {
                const pos = myMap.latLngToPixel(cityCoordinates[venueName].lat, cityCoordinates[venueName].lng);
                let markerSize = map(count, 1, 10, 8, 16);
                let d = dist(mouseX, mouseY, pos.x, pos.y);
                
                if (d < markerSize || d < 25) {
                    let venueCity = cityData.find(c => c.name === venueName);
                    if (venueCity) {
                        selectedCity = venueCity;
                        updateInfoPanel(venueCity);
                        return;
                    }
                }
            }
        }
    }
    
    // Clear selection if clicked elsewhere
    selectedCity = null;
    updateInfoPanel(null);
}

function mouseMoved() {
    hoveredCity = null;
    
    // Check if hovering over a city
    for (let city of cityData) {
        const pos = myMap.latLngToPixel(city.lat, city.lng);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < 25) {
            hoveredCity = city;
            cursor(HAND);
            return;
        }
    }
    
    cursor(ARROW);
}

function updateInfoPanel(city) {
    const infoDiv = document.getElementById('city-info');
    
    if (city) {
        if (city.isVenue) {
            // VENUE CITY INFO
            let artistCitiesHtml = '';
            let sortedCities = Object.entries(city.artistCities)
                .sort((a, b) => b[1] - a[1]);
            
            const metroCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad'];
            let metroList = [];
            let tier2List = [];
            
            for (let [cityName, count] of sortedCities) {
                if (metroCities.includes(cityName)) {
                    metroList.push([cityName, count]);
                } else {
                    tier2List.push([cityName, count]);
                }
            }
            
            // Display metro cities
            if (metroList.length > 0) {
                artistCitiesHtml += '<div style="margin-bottom: 8px;"><strong style="font-size: 11px; color: #a78bfa;">Metro Cities:</strong><br/>';
                for (let [cityName, count] of metroList) {
                    artistCitiesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; font-size: 11px; color: #c4b5fd;">${cityName} (${count})</span>`;
                }
                artistCitiesHtml += '</div>';
            }
            
            // Display tier 2 cities
            if (tier2List.length > 0) {
                artistCitiesHtml += '<div><strong style="font-size: 11px; color: #f472b6;">Tier 2 Cities:</strong><br/>';
                for (let [cityName, count] of tier2List) {
                    artistCitiesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 12px; font-size: 11px; color: #fbcfe8;">${cityName} (${count})</span>`;
                }
                artistCitiesHtml += '</div>';
            }
            
            infoDiv.innerHTML = `
                <p class="city-name">${city.name}</p>
                <p style="font-size: 12px; color: #a78bfa; margin-top: 5px;">🎵 Venue City</p>
                <p><strong>Total Gigs:</strong> ${city.gigCount}</p>
                <p><strong>Total Artists:</strong> ${city.artists.length}</p>
                <p><strong>Unique Artists:</strong> ${city.uniqueArtists}</p>
                <p><strong>Avg. Gathering:</strong> ${city.avgGathering} people</p>
                <p><strong>Total Followers:</strong> ${city.totalFollowers.toLocaleString()}</p>
                <p><strong>Artists From:</strong><br/>${artistCitiesHtml}</p>
            `;
        } else {
            // TIER 2 CITY INFO
            let venuesHtml = '';
            let sortedVenues = Object.entries(city.venuesPlayedAt)
                .sort((a, b) => b[1] - a[1]);
            
            for (let [venueName, count] of sortedVenues) {
                venuesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; font-size: 11px; color: #c4b5fd;">${venueName} (${count})</span>`;
            }
            
            infoDiv.innerHTML = `
                <p class="city-name">${city.name}</p>
                <p style="font-size: 12px; color: #f472b6; margin-top: 5px;">🎸 Artist City</p>
                <p><strong>Artists From Here:</strong> ${city.artistCount}</p>
                <p><strong>Unique Artists:</strong> ${city.uniqueArtists}</p>
                <p><strong>Total Followers:</strong> ${city.totalFollowers.toLocaleString()}</p>
                <p><strong>Venues Played At:</strong> ${city.venueCount}</p>
                <p><strong>Venue List:</strong><br/>${venuesHtml}</p>
            `;
        }
    } else {
        infoDiv.innerHTML = '';
    }
}

function setupControls() {
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        myMap.map.setView([22.5, 79.0], 5);
        selectedCity = null;
        selectedArtist = null;
        document.getElementById('artist-dropdown').value = '';
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
        myMap.map.setView([22.5, 79.0], 5);
        selectedCity = null;
        selectedArtist = null;
        document.getElementById('artist-dropdown').value = '';
        updateInfoPanel(null);
    } else if (key === 'l' || key === 'L') {
        // Toggle labels
        showLabels = !showLabels;
    }
}

