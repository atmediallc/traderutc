const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Downloading Natural Earth geojson...');
  const geojsonRes = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
  const geojsonData = await geojsonRes.json();

  console.log('Downloading countries database...');
  const countDbRes = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json');
  const countriesDb = await countDbRes.json();

  const dbMap = {};
  for (const c of countriesDb) {
    const iso2 = c.iso2 ? c.iso2.toUpperCase() : '';
    if (iso2) {
      dbMap[iso2] = {
        capital: c.capital || '',
        timezone: c.timezones && c.timezones[0] ? c.timezones[0].zoneName : 'UTC',
        flag: c.emoji || '',
        population: c.population || null,
        lat: parseFloat(c.latitude),
        lng: parseFloat(c.longitude)
      };
    }
  }

  // Fallbacks for missing entries during lookup
  const nameFallbackMap = {};
  for (const c of countriesDb) {
    nameFallbackMap[c.name.toLowerCase()] = {
      capital: c.capital || '',
      timezone: c.timezones && c.timezones[0] ? c.timezones[0].zoneName : 'UTC',
      flag: c.emoji || '',
      population: c.population || null,
      lat: parseFloat(c.latitude),
      lng: parseFloat(c.longitude)
    };
  }

  console.log('Processing features...');
  const processedFeatures = geojsonData.features.map(f => {
    const props = f.properties;
    const name = props.NAME || props.NAME_LONG || '';
    let iso2 = (props.ISO_A2 || '').toUpperCase();
    if (iso2 === '-99' || !iso2) {
      // Try to find by name
      const foundByName = nameFallbackMap[name.toLowerCase()];
      if (foundByName) {
        iso2 = Object.keys(dbMap).find(k => dbMap[k].timezone === foundByName.timezone) || '';
      }
    }

    const info = dbMap[iso2] || nameFallbackMap[name.toLowerCase()] || {
      capital: '',
      timezone: 'UTC',
      flag: '',
      population: null,
      lat: 0,
      lng: 0
    };

    // Calculate approximate centroid from geometry if lat/lng is 0
    let lat = info.lat;
    let lng = info.lng;
    if (lat === 0 && lng === 0 && f.geometry) {
      // Find average of coords for simple centroid
      let count = 0;
      let sumLat = 0;
      let sumLng = 0;
      const processCoords = (coords) => {
        if (typeof coords[0] === 'number') {
          sumLng += coords[0];
          sumLat += coords[1];
          count++;
        } else {
          coords.forEach(processCoords);
        }
      };
      processCoords(f.geometry.coordinates);
      if (count > 0) {
        lat = sumLat / count;
        lng = sumLng / count;
      }
    }

    // Determine representative timezone based on centroid if still UTC and not in DB
    let timezone = info.timezone;
    if (timezone === 'UTC' && lng !== 0) {
      // Simple lookup/estimate
      const approxOffsetHours = Math.round(lng / 15);
      // Fallback tz formatting not strictly required if we can map or guess
    }

    return {
      type: 'Feature',
      id: iso2 || name,
      properties: {
        name: name,
        code: iso2,
        capital: info.capital,
        timezone: timezone,
        flag: info.flag,
        population: info.population,
        lat: lat,
        lng: lng
      },
      geometry: f.geometry
    };
  });

  const output = {
    type: 'FeatureCollection',
    features: processedFeatures
  };

  const outputDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'countries.json');
  fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
  console.log(`Successfully compiled countries JSON with ${processedFeatures.length} countries to ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
