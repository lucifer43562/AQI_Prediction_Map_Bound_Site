import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AQIStation } from "@/pages/Index";
import { Brain, TrendingUp, Target, Zap } from "lucide-react";

interface ModelPredictionsProps {
  stations: AQIStation[];
}

interface ModelResult {
  name: string;
  mse: number;
  r2Score: number;
  accuracy: number;
  description: string;
  icon: any;
}

const ModelPredictions = ({ stations }: ModelPredictionsProps) => {
  const [models, setModels] = useState<ModelResult[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);

  // Simulate ML model training and evaluation
  const trainModels = async () => {
    setIsTraining(true);
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock model results based on your Python code results
    const modelResults: ModelResult[] = [
      {
        name: "Random Forest",
        mse: 45.32,
        r2Score: 0.94,
        accuracy: 94,
        description: "Ensemble method using multiple decision trees",
        icon: Target
      },
      {
        name: "XGBoost",
        mse: 38.67,
        r2Score: 0.96,
        accuracy: 96,
        description: "Gradient boosting framework for optimal performance",
        icon: Zap
      },
      {
        name: "Linear Regression",
        mse: 89.12,
        r2Score: 0.78,
        accuracy: 78,
        description: "Simple linear relationship modeling",
        icon: TrendingUp
      },
      {
        name: "K-Nearest Neighbors",
        mse: 67.45,
        r2Score: 0.82,
        accuracy: 82,
        description: "Instance-based learning algorithm",
        icon: Target
      },
      {
        name: "Support Vector Regression",
        mse: 72.89,
        r2Score: 0.81,
        accuracy: 81,
        description: "Non-linear regression using kernel trick",
        icon: Brain
      },
      {
        name: "Decision Tree",
        mse: 54.23,
        r2Score: 0.88,
        accuracy: 88,
        description: "Tree-based decision making model",
        icon: Target
      }
    ];

    setModels(modelResults.sort((a, b) => b.accuracy - a.accuracy));
    
    // Generate predictions for top stations
    const topStations = stations
      .filter(s => s.pm25 && s.pm10)
      .slice(0, 10);
      
    const stationPredictions = topStations.map(station => {
      // Simulate prediction logic
      const baseAQI = station.aqi;
      const noise = (Math.random() - 0.5) * 20;
      const predictedAQI = Math.max(0, Math.round(baseAQI + noise));
      
      return {
        station: station.station,
        currentAQI: station.aqi,
        predictedAQI,
        confidence: Math.round(85 + Math.random() * 15),
        trend: predictedAQI > baseAQI ? "increasing" : "decreasing",
        riskLevel: getAQILevel(predictedAQI)
      };
    });
    
    setPredictions(stationPredictions);
    setIsTraining(false);
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case "Good": return "default";
      case "Moderate": return "secondary";
      case "Unhealthy for Sensitive": return "outline";
      case "Unhealthy": return "destructive";
      case "Very Unhealthy": return "destructive";
      case "Hazardous": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Training Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Model Training & Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Train multiple machine learning models to predict AQI based on pollutant concentrations.
              Models are evaluated using Mean Squared Error (MSE) and R² Score metrics.
            </p>
            <Button 
              onClick={trainModels} 
              disabled={isTraining || stations.length === 0}
              className="w-full"
            >
              {isTraining ? "Training Models..." : "Train ML Models"}
            </Button>
            {isTraining && (
              <Progress value={75} className="w-full" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Model Results */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model, index) => {
            const IconComponent = model.icon;
            return (
              <Card key={model.name} className={index === 0 ? "ring-2 ring-primary" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {model.name}
                    </div>
                    {index === 0 && <Badge variant="default">Best</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accuracy</span>
                      <span className="font-medium">{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">MSE:</span>
                      <div className="font-medium">{model.mse.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">R² Score:</span>
                      <div className="font-medium">{model.r2Score.toFixed(3)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AQI Predictions (Next 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Station</th>
                    <th className="text-left p-3">Current AQI</th>
                    <th className="text-left p-3">Predicted AQI</th>
                    <th className="text-left p-3">Trend</th>
                    <th className="text-left p-3">Risk Level</th>
                    <th className="text-left p-3">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-medium">{pred.station}</td>
                      <td className="p-3">{pred.currentAQI}</td>
                      <td className="p-3 font-medium">{pred.predictedAQI}</td>
                      <td className="p-3">
                        <div className={`flex items-center gap-1 ${
                          pred.trend === "increasing" ? "text-destructive" : "text-green-600"
                        }`}>
                          <TrendingUp 
                            className={`h-4 w-4 ${
                              pred.trend === "decreasing" ? "rotate-180" : ""
                            }`} 
                          />
                          {pred.trend}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={getBadgeVariant(pred.riskLevel)}>
                          {pred.riskLevel}
                        </Badge>
                      </td>
                      <td className="p-3">{pred.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Insights */}
      {models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Model Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Best Performing Model</h4>
                  <p className="text-sm text-muted-foreground">
                    {models[0]?.name} achieved the highest accuracy of {models[0]?.accuracy}% 
                    with an R² score of {models[0]?.r2Score.toFixed(3)}, indicating excellent 
                    predictive performance for AQI forecasting.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Features</h4>
                  <p className="text-sm text-muted-foreground">
                    PM2.5 and PM10 concentrations show the strongest correlation with AQI values. 
                    Location-based features and temporal patterns also contribute significantly 
                    to prediction accuracy.
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Recommendation</h4>
                <p className="text-sm">
                  Based on the model evaluation, we recommend using the <strong>{models[0]?.name}</strong> 
                  model for production AQI predictions due to its superior performance metrics and 
                  robust handling of outliers in the pollution data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelPredictions;