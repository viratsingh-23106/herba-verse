import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trophy, Clock, Target, Award, Play, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Quiz data structure type
interface QuizData {
  id: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  difficulty?: number;
  questions: Array<{
    id: number;
    type: string;
    question: string;
    questionHi?: string;
    options: string[];
    optionsHi?: string[];
    correctAnswer: number;
    explanation: string;
    explanationHi?: string;
  }>;
}

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Auto-generate quiz on component mount
  useEffect(() => {
    generateAIQuiz();
  }, []);

  useEffect(() => {
    if (!quizCompleted && quizData) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizCompleted, startTime, quizData]);

  const question = quizData?.questions[currentQuestion];
  const progress = quizData ? ((currentQuestion + 1) / quizData.questions.length) * 100 : 0;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!question) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    if (!quizData || !question) return;
    setQuizCompleted(true);
    const finalScore = score + (selectedAnswer === question.correctAnswer ? 1 : 0);
    
    // Save quiz results to database if user is logged in
    if (user) {
      console.log('Saving quiz results:', {
        userId: user.id,
        quizId: quizData.id,
        score: finalScore,
        totalQuestions: quizData.questions.length,
        timeSpent: timeElapsed
      });
    }

    toast({
      title: "Quiz Completed!",
      description: `You scored ${finalScore}/${quizData.questions.length}`,
    });
  };

  const generateAIQuiz = async () => {
    setIsGeneratingAI(true);
    try {
      if (!isInitialLoad) {
        toast({
          title: "Generating AI Quiz...",
          description: "Please wait while we create a new quiz for you",
        });
      }
      
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          topic: 'medicinal plants and their uses',
          difficulty: 'medium',
          numQuestions: 5
        }
      });

      if (error) throw error;

      if (data?.success && data?.quiz) {
        // Map AI response to expected format
        const mappedQuiz: QuizData = {
          id: 'ai-generated-quiz',
          title: data.quiz.title_en || 'Medicinal Plants Quiz',
          titleHi: data.quiz.title_hi,
          description: data.quiz.description_en,
          descriptionHi: data.quiz.description_hi,
          difficulty: 2,
          questions: data.quiz.questions.map((q: any, index: number) => ({
            id: index + 1,
            type: 'multiple-choice',
            question: q.question_en,
            questionHi: q.question_hi,
            options: q.options,
            optionsHi: q.options_hi,
            correctAnswer: q.correct_answer,
            explanation: q.explanation_en,
            explanationHi: q.explanation_hi
          }))
        };

        setQuizData(mappedQuiz);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setScore(0);
        setShowExplanation(false);
        setQuizCompleted(false);
        setTimeElapsed(0);
        
        if (!isInitialLoad) {
          toast({
            title: "AI Quiz Ready!",
            description: "Your personalized quiz has been generated",
          });
        }
        setIsInitialLoad(false);
      } else {
        throw new Error('Invalid quiz data received');
      }
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI quiz. Please try again.",
        variant: "destructive",
      });
      setIsInitialLoad(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Loading state
  if (isInitialLoad || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-subtle pt-16 pb-16 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-botanical">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto" />
              <h2 className="text-xl font-semibold">Generating Your Quiz...</h2>
              <p className="text-muted-foreground">
                AI is creating a personalized medicinal plants quiz for you
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const finalScore = score;
    const percentage = Math.round((finalScore / quizData.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-subtle pt-16 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-botanical">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-garden rounded-full">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-garden-emerald">
                {t('quiz.completed')}
              </CardTitle>
              <CardDescription className="text-lg">
                {language === 'hi' ? quizData.titleHi || quizData.title : quizData.title}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold">
                  <span className={getScoreColor(percentage)}>
                    {finalScore}
                  </span>
                  <span className="text-muted-foreground">
                    /{quizData.questions.length}
                  </span>
                </div>
                <div className="text-xl text-muted-foreground">
                  {percentage}% Correct
                </div>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Time: {formatTime(timeElapsed)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Accuracy: {percentage}%
                  </div>
                </div>
              </div>

              {/* Performance Badges */}
              <div className="space-y-3">
                <h3 className="font-semibold text-center">Achievement Unlocked:</h3>
                <div className="flex justify-center gap-2 flex-wrap">
                  {percentage === 100 && (
                    <Badge className="bg-yellow-500 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      Perfect Score!
                    </Badge>
                  )}
                  {percentage >= 80 && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Excellent Knowledge
                    </Badge>
                  )}
                  {timeElapsed < 120 && (
                    <Badge className="bg-blue-500 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      Speed Master
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                <Button 
                  onClick={generateAIQuiz}
                  disabled={isGeneratingAI}
                  className="bg-gradient-garden hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGeneratingAI ? 'Generating...' : 'Generate New Quiz'}
                </Button>
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                >
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Quiz Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-garden-emerald">
              {language === 'hi' ? (quizData.titleHi || quizData.title) : quizData.title}
            </h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={generateAIQuiz}
                disabled={isGeneratingAI}
                size="sm"
                className="bg-gradient-garden hover:opacity-90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingAI ? 'Generating...' : 'AI Quiz'}
              </Button>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeElapsed)}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  {score}/{currentQuestion + (showExplanation ? 1 : 0)}
                </div>
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-botanical">
          <CardHeader>
            <CardTitle className="text-xl">
              {language === 'hi' ? (question.questionHi || question.question) : question.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="grid gap-3">
              {question.options.map((option, index) => {
                const optionText = language === 'hi' ? (question.optionsHi?.[index] || option) : option;
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                
                let buttonClass = "w-full p-4 text-left border rounded-lg transition-all ";
                
                if (showExplanation) {
                  if (isCorrect) {
                    buttonClass += "bg-green-50 border-green-500 text-green-700";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-red-50 border-red-500 text-red-700";
                  } else {
                    buttonClass += "border-border text-muted-foreground";
                  }
                } else if (isSelected) {
                  buttonClass += "bg-primary/10 border-primary text-primary";
                } else {
                  buttonClass += "border-border hover:border-primary hover:bg-primary/5";
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{optionText}</span>
                      {showExplanation && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800 text-sm">
                  {language === 'hi' ? (question.explanationHi || question.explanation) : question.explanation}
                </p>
              </div>
            )}

            {/* Navigation */}
            {showExplanation && (
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNextQuestion}
                  className="bg-gradient-garden hover:opacity-90"
                >
                  {currentQuestion === quizData.questions.length - 1 
                    ? 'Complete Quiz' 
                    : t('quiz.next')
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPage;
