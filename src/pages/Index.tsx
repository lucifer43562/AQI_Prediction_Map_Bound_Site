import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AQIMap from "@/components/AQIMap";
import AQICharts from "@/components/AQICharts";
import ModelPredictions from "@/components/ModelPredictions";
import { MapPin, BarChart, Brain, Database } from "lucide-react";

export interface AQIStation {
  station: string;
  lat: number;
  lon: number;
  aqi: number;
  pm25?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  so2?: number;
  o3?: number;
  timestamp?: string;
}

const Index = () => {
  const [stations, setStations] = useState<AQIStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const { toast } = useToast();

  const fetchAQIData = async (token: string) => {
    if (!token) {
      toast({
        title: "API Token Required",
        description: "Please enter your WAQI API token to fetch data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch stations within India bounds
      const latlng = "6.554,68.176,35.674,97.395"; // India bounds
      const stationsResponse = await fetch(
        `https://api.waqi.info/map/bounds?token=${token}&latlng=${latlng}`
      );
      
      if (!stationsResponse.ok) {
        throw new Error("Failed to fetch stations");
      }

      const stationsData = await stationsResponse.json();
      
      if (stationsData.status !== "ok") {
        throw new Error("Invalid API response");
      }

      const stationsList = stationsData.data || [];
      const aqiStations: AQIStation[] = [];

      // Fetch detailed data for all stations (like Python code)
      const limitedStations = stationsList;
      
      for (const station of limitedStations) {
        try {
          const detailResponse = await fetch(
            `https://api.waqi.info/feed/@${station.uid}/?token=${token}`
          );
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            
            if (detailData.status === "ok" && detailData.data.aqi) {
              const data = detailData.data;
              const iaqi = data.iaqi || {};
              
              aqiStations.push({
                station: station.station?.name || "Unknown",
                lat: station.lat,
                lon: station.lon,
                aqi: data.aqi,
                pm25: iaqi.pm25?.v,
                pm10: iaqi.pm10?.v,
                co: iaqi.co?.v,
                no2: iaqi.no2?.v,
                so2: iaqi.so2?.v,
                o3: iaqi.o3?.v,
                timestamp: data.time?.s,
              });
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching data for station ${station.uid}:`, error);
        }
      }

      setStations(aqiStations);
      toast({
        title: "Data Fetched Successfully",
        description: `Retrieved data for ${aqiStations.length} stations`,
      });
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch AQI data. Please check your API token.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent animate-pulse">
            🌍 AQI Vision Map 🌍
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-time Air Quality Index monitoring and prediction system for Indian cities. 
            Analyze pollution patterns and get ML-powered insights with beautiful visualizations.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-gradient-to-r from-electric-blue to-cyber-purple bg-clip-text text-transparent font-semibold">🔵 Real-time Data</span>
            <span className="bg-gradient-to-r from-neon-green to-electric-blue bg-clip-text text-transparent font-semibold">🟢 AI Predictions</span>
            <span className="bg-gradient-to-r from-sunset-orange to-coral-pink bg-clip-text text-transparent font-semibold">🟡 Interactive Maps</span>
          </div>
        </div>

        {/* API Token Input */}
        <Card className="card-glow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="h-6 w-6 text-accent" />
              🔐 API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="password"
                placeholder="Enter your WAQI API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="flex-1 border-primary/30 focus:border-primary"
              />
              <Button 
                variant="glow"
                onClick={() => fetchAQIData(apiToken)}
                disabled={loading}
                className="sm:min-w-[120px]"
              >
                {loading ? "🔄 Loading..." : "🚀 Fetch Data"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Get your free API token from{" "}
              <a 
                href="https://aqicn.org/api/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 transition-colors underline"
              >
                WAQI API 🔗
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        {stations.length > 0 && (
          <Tabs defaultValue="map" className="space-y-6">
            <TabsList className="responsive-tabs p-1 bg-card/50 backdrop-blur-sm border border-primary/20">
              <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-white transition-all duration-300">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">🗺️ Map View</span>
                <span className="sm:hidden">Map</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-neon-green data-[state=active]:text-white transition-all duration-300">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">📊 Analytics</span>
                <span className="sm:hidden">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyber-purple data-[state=active]:to-electric-blue data-[state=active]:text-white transition-all duration-300">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">🤖 AI Predictions</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sunset-orange data-[state=active]:to-coral-pink data-[state=active]:text-white transition-all duration-300">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">📊 Raw Data</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <AQIMap stations={stations} />
            </TabsContent>

            <TabsContent value="charts">
              <AQICharts stations={stations} />
            </TabsContent>

            <TabsContent value="predictions">
              <ModelPredictions stations={stations} />
            </TabsContent>

            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Station Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Station</th>
                          <th className="text-left p-2">AQI</th>
                          <th className="text-left p-2">PM2.5</th>
                          <th className="text-left p-2">PM10</th>
                          <th className="text-left p-2">CO</th>
                          <th className="text-left p-2">NO2</th>
                          <th className="text-left p-2">SO2</th>
                          <th className="text-left p-2">O3</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.map((station, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{station.station}</td>
                            <td className="p-2">{station.aqi}</td>
                            <td className="p-2">{station.pm25 || "-"}</td>
                            <td className="p-2">{station.pm10 || "-"}</td>
                            <td className="p-2">{station.co || "-"}</td>
                            <td className="p-2">{station.no2 || "-"}</td>
                            <td className="p-2">{station.so2 || "-"}</td>
                            <td className="p-2">{station.o3 || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {stations.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                Enter your WAQI API token above to start fetching AQI data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;