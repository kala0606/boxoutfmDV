// Custom Vector Map for India
let indiaGeoJSON;
let csvData;
let gigsData = [];
let cityData = [];
let tier2CityData = [];

// Map projection settings
let centerLat = 22.5;
let centerLng = 79.0;
let zoom = 600; // Scale factor
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX, lastMouseY;

// Visualization settings
let selectedCity = null;
let hoveredCity = null;
let pulseAnimation = 0;
let showLabels = true;

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

function preload() {
    // Load GeoJSON and CSV data
    indiaGeoJSON = loadJSON('india.geojson');
    csvData = loadTable('boxoutimpact.csv', 'csv', 'header');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Process CSV data
    processData();
    
    // Setup UI controls
    setupControls();
}

function draw() {
    // Background
    background(240, 245, 250); // Light blue-grey
    
    // Update animation
    pulseAnimation += 0.05;
    
    // Draw India map
    drawIndiaMap();
    
    // Draw tier 2 city markers
    for (let tier2City of tier2CityData) {
        drawTier2CityMarker(tier2City);
    }
    
    // Draw connections
    if (selectedCity) {
        drawConnections();
    }
    
    // Draw main venue city markers
    for (let city of cityData) {
        drawCityMarker(city);
    }
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
    
    // Draw each state
    for (let feature of indiaGeoJSON.features) {
        // Draw state fill
        fill(255, 255, 255); // White fill
        stroke(200, 210, 220); // Light grey borders
        strokeWeight(1);
        
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
            
            if (artistCity) {
                if (!cityStats[venue].artistCities[artistCity]) {
                    cityStats[venue].artistCities[artistCity] = 0;
                }
                cityStats[venue].artistCities[artistCity]++;
            }
            
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
        
        // Track tier 2 city data
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
    
    // Convert to arrays
    for (let city in cityStats) {
        let stats = cityStats[city];
        stats.gigCount = stats.gigs.size;
        stats.uniqueArtists = [...new Set(stats.artists)].length;
        stats.avgGathering = stats.gigCount > 0 ? Math.round(stats.totalGathering / stats.gigCount) : 0;
        cityData.push(stats);
    }
    
    for (let city in tier2Stats) {
        let stats = tier2Stats[city];
        if (stats.artistCount > 0) {
            stats.uniqueArtists = [...new Set(stats.artists)].length;
            stats.venueCount = Object.keys(stats.venuesPlayedAt).length;
            tier2CityData.push(stats);
        }
    }
}

function drawCityMarker(city) {
    const pos = latLngToPixel(city.lat, city.lng);
    
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let baseSize = map(city.gigCount, 0, 25, 20, 45);
    let isHovered = d < baseSize;
    
    if (isHovered) {
        hoveredCity = city;
    }
    
    let markerSize = baseSize;
    let markerColor;
    
    if (selectedCity === city) {
        markerSize = baseSize + 10 + sin(pulseAnimation) * 5;
        markerColor = color(255, 152, 0, 200);
    } else if (isHovered) {
        markerSize = baseSize + 8;
        markerColor = color(76, 175, 80, 200);
    } else {
        markerSize = baseSize + sin(pulseAnimation + cityData.indexOf(city)) * 3;
        markerColor = color(33, 150, 243, 180);
    }
    
    // Outer glow
    noStroke();
    fill(markerColor.levels[0], markerColor.levels[1], markerColor.levels[2], 50);
    circle(pos.x, pos.y, markerSize + 15);
    
    // Main marker
    fill(markerColor);
    stroke(255);
    strokeWeight(2);
    circle(pos.x, pos.y, markerSize);
    
    // Inner dot
    fill(255);
    noStroke();
    circle(pos.x, pos.y, markerSize * 0.3);
    
    // Gig count
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(markerSize * 0.4);
    textStyle(BOLD);
    text(city.gigCount, pos.x, pos.y);
    
    // Labels
    if (showLabels || isHovered || selectedCity === city) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textSize(14);
        textStyle(BOLD);
        text(city.name, pos.x, pos.y - markerSize - 15);
        
        textSize(11);
        textStyle(NORMAL);
        text(city.gigCount + ' gigs', pos.x, pos.y + markerSize + 15);
    }
}

function drawTier2CityMarker(city) {
    const pos = latLngToPixel(city.lat, city.lng);
    
    let d = dist(mouseX, mouseY, pos.x, pos.y);
    let baseSize = map(city.artistCount, 1, 20, 6, 12);
    let isHovered = d < baseSize + 5;
    
    let markerSize = baseSize;
    let markerColor;
    
    if (selectedCity === city) {
        markerSize = baseSize + 6 + sin(pulseAnimation) * 3;
        markerColor = color(255, 193, 7, 220);
    } else if (isHovered) {
        markerSize = baseSize + 4;
        markerColor = color(255, 167, 38, 200);
    } else {
        markerSize = baseSize + sin(pulseAnimation + tier2CityData.indexOf(city) * 0.5) * 1.5;
        markerColor = color(255, 152, 0, 150);
    }
    
    // Outer glow
    noStroke();
    fill(255, 152, 0, 40);
    circle(pos.x, pos.y, markerSize + 8);
    
    // Main marker
    fill(markerColor);
    stroke(255);
    strokeWeight(1);
    circle(pos.x, pos.y, markerSize);
    
    // Inner dot
    fill(255, 255, 255, 200);
    noStroke();
    circle(pos.x, pos.y, markerSize * 0.4);
    
    // Labels on hover
    if (isHovered || selectedCity === city) {
        fill(255);
        stroke(0);
        strokeWeight(3);
        textAlign(CENTER, CENTER);
        textSize(10);
        textStyle(BOLD);
        text(city.name, pos.x, pos.y - markerSize - 10);
        
        textSize(8);
        textStyle(NORMAL);
        text(city.artistCount + ' artists', pos.x, pos.y + markerSize + 10);
    }
}

function drawConnections() {
    if (!selectedCity) return;
    
    const selectedPos = latLngToPixel(selectedCity.lat, selectedCity.lng);
    const metroCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad'];
    
    if (selectedCity.isVenue) {
        // VENUE: Show where artists came FROM
        for (let [cityName, count] of Object.entries(selectedCity.artistCities)) {
            if (cityCoordinates[cityName] && cityName !== selectedCity.name) {
                const cityCoord = cityCoordinates[cityName];
                const pos = latLngToPixel(cityCoord.lat, cityCoord.lng);
                
                let isMetro = metroCities.includes(cityName);
                
                // Draw line
                if (isMetro) {
                    stroke(33, 150, 243, 120);
                    strokeWeight(2.5);
                } else {
                    stroke(255, 152, 0, 100);
                    strokeWeight(2);
                }
                line(selectedPos.x, selectedPos.y, pos.x, pos.y);
                
                // Animated dots
                let dots = 3;
                for (let i = 0; i < dots; i++) {
                    let t = (i / dots + pulseAnimation * 0.15) % 1;
                    let x = lerp(pos.x, selectedPos.x, t);
                    let y = lerp(pos.y, selectedPos.y, t);
                    
                    if (isMetro) {
                        fill(33, 150, 243, 180);
                    } else {
                        fill(255, 152, 0, 180);
                    }
                    noStroke();
                    circle(x, y, 5);
                }
                
                // Small marker
                drawSmallCityMarker(pos, count, cityName, isMetro);
            }
        }
    } else {
        // TIER 2: Show where artists went TO
        for (let [venueName, count] of Object.entries(selectedCity.venuesPlayedAt)) {
            if (cityCoordinates[venueName]) {
                const venueCoord = cityCoordinates[venueName];
                const pos = latLngToPixel(venueCoord.lat, venueCoord.lng);
                
                stroke(76, 175, 80, 120);
                strokeWeight(2.5);
                line(selectedPos.x, selectedPos.y, pos.x, pos.y);
                
                // Animated dots
                let dots = 3;
                for (let i = 0; i < dots; i++) {
                    let t = (i / dots + pulseAnimation * 0.15) % 1;
                    let x = lerp(selectedPos.x, pos.x, t);
                    let y = lerp(selectedPos.y, pos.y, t);
                    
                    fill(76, 175, 80, 180);
                    noStroke();
                    circle(x, y, 5);
                }
                
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
        fill(33, 150, 243, 40);
    } else {
        fill(255, 152, 0, 40);
    }
    circle(pos.x, pos.y, markerSize + 8);
    
    // Main marker
    if (isMetro) {
        fill(33, 150, 243, 200);
        stroke(255);
    } else {
        fill(255, 152, 0, 200);
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
    
    // Label on hover
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

function mousePressed() {
    // Check venue cities
    for (let city of cityData) {
        const pos = latLngToPixel(city.lat, city.lng);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < 25) {
            selectedCity = selectedCity === city ? null : city;
            updateInfoPanel(city);
            return;
        }
    }
    
    // Check tier 2 cities
    for (let tier2City of tier2CityData) {
        const pos = latLngToPixel(tier2City.lat, tier2City.lng);
        let baseSize = map(tier2City.artistCount, 1, 20, 6, 12);
        let d = dist(mouseX, mouseY, pos.x, pos.y);
        
        if (d < baseSize + 5) {
            selectedCity = selectedCity === tier2City ? null : tier2City;
            updateInfoPanel(tier2City);
            return;
        }
    }
    
    // Start dragging
    isDragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    
    // Clear selection if clicked elsewhere
    if (!isDragging) {
        selectedCity = null;
        updateInfoPanel(null);
    }
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
    let zoomChange = -event.delta * 0.5;
    zoom += zoomChange;
    zoom = constrain(zoom, 200, 2000);
    return false; // Prevent page scrolling
}

function mouseMoved() {
    hoveredCity = null;
    
    for (let city of cityData) {
        const pos = latLngToPixel(city.lat, city.lng);
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
            
            if (metroList.length > 0) {
                artistCitiesHtml += '<div style="margin-bottom: 8px;"><strong style="font-size: 11px; color: #666;">Metro Cities:</strong><br/>';
                for (let [cityName, count] of metroList) {
                    artistCitiesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: #e3f2fd; border-radius: 12px; font-size: 11px;">${cityName} (${count})</span>`;
                }
                artistCitiesHtml += '</div>';
            }
            
            if (tier2List.length > 0) {
                artistCitiesHtml += '<div><strong style="font-size: 11px; color: #666;">Tier 2 Cities:</strong><br/>';
                for (let [cityName, count] of tier2List) {
                    artistCitiesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: #fff3e0; border-radius: 12px; font-size: 11px;">${cityName} (${count})</span>`;
                }
                artistCitiesHtml += '</div>';
            }
            
            infoDiv.innerHTML = `
                <p class="city-name">${city.name}</p>
                <p style="font-size: 12px; color: #666; margin-top: 5px;">Venue City</p>
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
                venuesHtml += `<span style="display: inline-block; margin: 3px 5px 3px 0; padding: 3px 8px; background: #e8f5e9; border-radius: 12px; font-size: 11px;">${venueName} (${count})</span>`;
            }
            
            infoDiv.innerHTML = `
                <p class="city-name">${city.name}</p>
                <p style="font-size: 12px; color: #ff9800; margin-top: 5px;">Tier 2 City</p>
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
    document.getElementById('reset-btn').addEventListener('click', () => {
        zoom = 600;
        offsetX = 0;
        offsetY = 0;
        centerLat = 22.5;
        centerLng = 79.0;
        selectedCity = null;
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
        zoom = 600;
        offsetX = 0;
        offsetY = 0;
        centerLat = 22.5;
        centerLng = 79.0;
        selectedCity = null;
        updateInfoPanel(null);
    } else if (key === 'l' || key === 'L') {
        showLabels = !showLabels;
    }
}

