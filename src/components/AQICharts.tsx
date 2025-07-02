import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from "recharts";
import { AQIStation } from "@/pages/Index";

interface AQIChartsProps {
  stations: AQIStation[];
}

const AQICharts = ({ stations }: AQIChartsProps) => {
  // Prepare data for AQI distribution
  const aqiDistribution = stations.reduce((acc: Record<string, number>, station) => {
    const level = getAQILevel(station.aqi);
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const aqiDistributionData = Object.entries(aqiDistribution).map(([level, count]) => ({
    level,
    count,
    color: getAQIColor(getAQIValue(level))
  }));

  // Top 10 stations by AQI
  const topStations = [...stations]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 10)
    .map(station => ({
      station: station.station.length > 15 ? station.station.substring(0, 15) + "..." : station.station,
      aqi: station.aqi,
      color: getAQIColor(station.aqi)
    }));

  // Pollutant correlation data
  const pollutantData = stations
    .filter(s => s.pm25 && s.pm10 && s.aqi)
    .map(station => ({
      pm25: station.pm25,
      pm10: station.pm10,
      aqi: station.aqi,
      station: station.station
    }));

  // Average pollutants by AQI category
  const categoryAverages = stations.reduce((acc: Record<string, { total: number; count: number; pm25: number; pm10: number; no2: number; o3: number }>, station) => {
    const level = getAQILevel(station.aqi);
    if (!acc[level]) {
      acc[level] = { total: 0, count: 0, pm25: 0, pm10: 0, no2: 0, o3: 0 };
    }
    acc[level].total += station.aqi;
    acc[level].count += 1;
    if (station.pm25) acc[level].pm25 += station.pm25;
    if (station.pm10) acc[level].pm10 += station.pm10;
    if (station.no2) acc[level].no2 += station.no2;
    if (station.o3) acc[level].o3 += station.o3;
    return acc;
  }, {});

  const pollutantAverageData = Object.entries(categoryAverages).map(([level, data]) => ({
    level,
    avgAQI: Math.round(data.total / data.count),
    avgPM25: Math.round(data.pm25 / data.count),
    avgPM10: Math.round(data.pm10 / data.count),
    avgNO2: Math.round(data.no2 / data.count),
    avgO3: Math.round(data.o3 / data.count)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AQI Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>AQI Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={aqiDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ level, count, percent }) => `${level}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {aqiDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Stations by AQI */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Stations by AQI</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStations} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="station" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="aqi">
                {topStations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PM2.5 vs PM10 Correlation */}
      <Card>
        <CardHeader>
          <CardTitle>PM2.5 vs PM10 Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={pollutantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="pm25" 
                name="PM2.5" 
                label={{ value: 'PM2.5 (μg/m³)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="pm10" 
                name="PM10"
                label={{ value: 'PM10 (μg/m³)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded p-3 shadow-lg">
                        <p className="font-semibold">{data.station}</p>
                        <p>PM2.5: {data.pm25} μg/m³</p>
                        <p>PM10: {data.pm10} μg/m³</p>
                        <p>AQI: {data.aqi}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter dataKey="pm10" fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Pollutants by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Average Pollutants by AQI Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pollutantAverageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgPM25" fill="hsl(var(--primary))" name="PM2.5" />
              <Bar dataKey="avgPM10" fill="hsl(var(--secondary))" name="PM10" />
              <Bar dataKey="avgNO2" fill="hsl(var(--accent))" name="NO2" />
              <Bar dataKey="avgO3" fill="hsl(var(--muted))" name="O3" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#00e400";
  if (aqi <= 100) return "#ffff00";
  if (aqi <= 150) return "#ff7e00";
  if (aqi <= 200) return "#ff0000";
  if (aqi <= 300) return "#8f3f97";
  return "#7e0023";
};

const getAQILevel = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const getAQIValue = (level: string) => {
  switch (level) {
    case "Good": return 25;
    case "Moderate": return 75;
    case "Unhealthy for Sensitive": return 125;
    case "Unhealthy": return 175;
    case "Very Unhealthy": return 250;
    case "Hazardous": return 350;
    default: return 0;
  }
};

export default AQICharts;