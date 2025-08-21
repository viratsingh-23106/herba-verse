import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface PlantRecommendation {
  plantId: string;
  plantName: string;
  confidence: number;
  reasoning: string;
  usage: string;
  precautions: string;
  matchedSymptoms?: string[];
}

interface AIResponse {
  query: string;
  conditions: string[];
  recommendations: PlantRecommendation[];
  disclaimer: string;
}

const AISuggestions = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResponse | null>(null);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-plant-suggestions', {
        body: { 
          query: query.trim(),
          userId: user?.id 
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResults(data);
      
      if (data.recommendations?.length === 0) {
        toast({
          title: "No recommendations found",
          description: "Try describing your symptoms differently or be more specific.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('AI Suggestions Error:', err);
      setError(err.message || 'Failed to get recommendations');
      toast({
        title: "Error",
        description: "Failed to get plant recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlantClick = (plantId: string) => {
    navigate(`/plant/${plantId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-garden rounded-full shadow-garden">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('ai.askAboutHealth')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Describe your health concerns and get personalized medicinal plant recommendations powered by AI
          </p>
        </div>

        {/* Query Form */}
        <Card className="mb-8 shadow-botanical">
          <CardHeader>
            <CardTitle className="text-xl text-garden-emerald">
              {t('ai.askAboutHealth')}
            </CardTitle>
            <CardDescription>
              Be specific about your symptoms for better recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('ai.placeholder')}
                className="text-lg py-3 border-border focus:border-primary"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="w-full bg-gradient-garden hover:opacity-90 text-white font-medium py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  t('ai.getRecommendations')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Identified Conditions */}
            {results.conditions?.length > 0 && (
              <Card className="shadow-botanical">
                <CardHeader>
                  <CardTitle className="text-xl text-garden-emerald">
                    Identified Health Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plant Recommendations */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {t('ai.recommendations')}
              </h2>
              
              {results.recommendations?.length > 0 ? (
                <div className="grid gap-6">
                  {results.recommendations.map((recommendation, index) => (
                    <Card 
                      key={index} 
                      className="shadow-botanical hover:shadow-garden transition-all duration-300 cursor-pointer group"
                      onClick={() => handlePlantClick(recommendation.plantId)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-garden-emerald group-hover:text-primary-glow transition-colors">
                              {recommendation.plantName}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-sm text-muted-foreground">
                                {t('ai.confidence')}:
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={recommendation.confidence * 100} 
                                  className="w-20 h-2"
                                />
                                <span className="text-sm font-medium">
                                  {Math.round(recommendation.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Why recommended:</h4>
                            <p className="text-muted-foreground text-sm">{recommendation.reasoning}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-foreground mb-1">How to use:</h4>
                            <p className="text-muted-foreground text-sm">{recommendation.usage}</p>
                          </div>

                          {recommendation.precautions && (
                            <div>
                              <h4 className="font-medium text-destructive mb-1">Precautions:</h4>
                              <p className="text-destructive text-sm">{recommendation.precautions}</p>
                            </div>
                          )}

                          {recommendation.matchedSymptoms?.length > 0 && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2">Matched symptoms:</h4>
                              <div className="flex flex-wrap gap-1">
                                {recommendation.matchedSymptoms.map((symptom, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {symptom}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-botanical">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No specific plant recommendations found for your query. 
                      Try describing your symptoms differently.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Disclaimer */}
            {results.disclaimer && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {results.disclaimer}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;