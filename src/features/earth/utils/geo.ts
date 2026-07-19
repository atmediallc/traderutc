export function pointInPolygon(point: [number, number], polygon: [number, number][][]): boolean {
  const [lng, lat] = point;
  let inside = false;
  
  // Outer boundary
  const ring = polygon[0];
  if (!ring || ring.length === 0) return false;
  
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    
    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  // If it's inside the outer ring, check holes
  if (inside) {
    for (let h = 1; h < polygon.length; h++) {
      const hole = polygon[h];
      if (!hole || hole.length === 0) continue;
      let insideHole = false;
      for (let i = 0, j = hole.length - 1; i < hole.length; j = i++) {
        const xi = hole[i][0], yi = hole[i][1];
        const xj = hole[j][0], yj = hole[j][1];
        const intersect = ((yi > lat) !== (yj > lat))
            && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) insideHole = !insideHole;
      }
      if (insideHole) return false;
    }
  }
  
  return inside;
}

interface GeoGeometry {
  type: string;
  coordinates: [number, number][][] | [number, number][][][];
}

interface GeoFeature {
  geometry?: GeoGeometry;
}

export function findCountryAtCoordinate(
  lng: number,
  lat: number,
  countriesGeoJSON: { features?: GeoFeature[] }
): GeoFeature | null {
  if (!countriesGeoJSON?.features) return null;

  for (const feature of countriesGeoJSON.features) {
    const geometry: GeoGeometry | undefined = feature.geometry;
    if (!geometry) continue;
    
    if (geometry.type === 'Polygon') {
      if (pointInPolygon([lng, lat], geometry.coordinates as [number, number][][])) {
        return feature;
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates as [number, number][][][]) {
        if (pointInPolygon([lng, lat], polygon)) {
          return feature;
        }
      }
    }
  }
  
  return null;
}