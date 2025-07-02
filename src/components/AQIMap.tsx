import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AQIStation } from "@/pages/Index";

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AQIMapProps {
  stations: AQIStation[];
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#00e400"; // Good
  if (aqi <= 100) return "#ffff00"; // Moderate
  if (aqi <= 150) return "#ff7e00"; // Unhealthy for sensitive
  if (aqi <= 200) return "#ff0000"; // Unhealthy
  if (aqi <= 300) return "#8f3f97"; // Very unhealthy
  return "#7e0023"; // Hazardous
};

const getAQILevel = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const AQIMap = ({ stations }: AQIMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each station
    stations.forEach((station) => {
      if (station.lat && station.lon && station.aqi) {
        const color = getAQIColor(station.aqi);
        const level = getAQILevel(station.aqi);
        
        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${color};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              color: ${station.aqi > 100 ? 'white' : 'black'};
            ">
              ${station.aqi}
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([station.lat, station.lon], { icon: customIcon })
          .addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${station.station}</h3>
            <div style="margin-bottom: 8px;">
              <span style="
                background: ${color}; 
                color: ${station.aqi > 100 ? 'white' : 'black'};
                padding: 2px 8px; 
                border-radius: 4px; 
                font-weight: bold;
              ">
                AQI: ${station.aqi}
              </span>
            </div>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              Level: ${level}
            </p>
            ${station.pm25 ? `<p style="margin: 2px 0; font-size: 12px;">PM2.5: ${station.pm25} μg/m³</p>` : ''}
            ${station.pm10 ? `<p style="margin: 2px 0; font-size: 12px;">PM10: ${station.pm10} μg/m³</p>` : ''}
            ${station.no2 ? `<p style="margin: 2px 0; font-size: 12px;">NO2: ${station.no2} μg/m³</p>` : ''}
            ${station.o3 ? `<p style="margin: 2px 0; font-size: 12px;">O3: ${station.o3} μg/m³</p>` : ''}
            ${station.timestamp ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">Updated: ${station.timestamp}</p>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Fit map to show all markers
    if (stations.length > 0) {
      const group = new L.FeatureGroup(
        stations
          .filter(s => s.lat && s.lon)
          .map(s => L.marker([s.lat, s.lon]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stations]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AQI Stations Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#00e400" }}></div>
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ffff00" }}></div>
              <span>Moderate (51-100)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff7e00" }}></div>
              <span>Unhealthy for Sensitive (101-150)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff0000" }}></div>
              <span>Unhealthy (151-200)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8f3f97" }}></div>
              <span>Very Unhealthy (201-300)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#7e0023" }}></div>
              <span>Hazardous (300+)</span>
            </div>
          </div>
          
          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: "400px" }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AQIMap;