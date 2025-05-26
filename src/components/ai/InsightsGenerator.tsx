
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users, Trophy, BarChart3, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface Insight {
  id: string;
  type: 'performance' | 'trend' | 'recommendation' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  icon: any;
}

interface InsightsGeneratorProps {
  tournamentId: string;
}

export const InsightsGenerator = ({ tournamentId }: InsightsGeneratorProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newInsights: Insight[] = [
        {
          id: '1',
          type: 'performance',
          title: 'Strong Opening Round Performance',
          description: 'Teams from Oxford and Cambridge showed exceptional performance in Round 1, with average speaker scores 12% above tournament average.',
          severity: 'medium',
          icon: TrendingUp
        },
        {
          id: '2',
          type: 'trend',
          title: 'Government Position Advantage',
          description: 'Government teams won 68% of debates, suggesting motion balance may need adjustment in future rounds.',
          severity: 'high',
          icon: BarChart3
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Judge Allocation Optimization',
          description: 'Consider redistributing judges with higher variance in scoring to ensure consistency across rooms.',
          severity: 'medium',
          icon: Users
        },
        {
          id: '4',
          type: 'warning',
          title: 'Speaker Score Compression',
          description: 'Speaker scores are clustered between 75-80 points. Encourage judges to use the full scoring range.',
          severity: 'high',
          icon: Trophy
        },
        {
          id: '5',
          type: 'performance',
          title: 'Institutional Strength Analysis',
          description: 'LSE teams show consistent improvement across rounds, while Imperial teams peaked in Round 2.',
          severity: 'low',
          icon: Lightbulb
        }
      ];
      
      setInsights(newInsights);
      toast.success("AI insights generated successfully!");
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightColor = (type: Insight['type'], severity: Insight['severity']) => {
    if (severity === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getTypeIcon = (type: Insight['type']) => {
    switch (type) {
      case 'performance': return TrendingUp;
      case 'trend': return BarChart3;
      case 'recommendation': return Lightbulb;
      case 'warning': return Trophy;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Tournament Insights
            </CardTitle>
            <Button
              onClick={generateInsights}
              disabled={isGenerating}
              className="bg-tabby-secondary hover:bg-tabby-secondary/90"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No insights generated yet</h3>
              <p className="text-gray-500">Click "Generate Insights" to analyze tournament data with AI</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => {
                const IconComponent = getTypeIcon(insight.type);
                return (
                  <Card key={insight.id} className={`border ${getInsightColor(insight.type, insight.severity)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <IconComponent className="h-5 w-5 mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.type}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${
                              insight.severity === 'high' ? 'bg-red-50 text-red-700' :
                              insight.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {insight.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
