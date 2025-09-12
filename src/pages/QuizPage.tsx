import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trophy, Clock, Target, Award, Play, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Mock quiz data - in a real app, this would come from the database
const QUIZ_DATA = {
  id: 'plant-identification-basic',
  title: 'Plant Identification Basics',
  description: 'Test your knowledge of common medicinal plants',
  difficulty: 1,
  questions: [
    {
      id: 1,
      type: 'multiple-choice',
      question: 'Which plant is known as the "village pharmacy" in India?',
      questionHi: 'भारत में किस पौधे को "गाँव की दवाखाना" कहा जाता है?',
      options: ['Aloe Vera', 'Neem', 'Turmeric', 'Tulsi'],
      optionsHi: ['एलोवेरा', 'नीम', 'हल्दी', 'तुलसी'],
      correctAnswer: 1,
      explanation: 'Neem is called the "village pharmacy" because of its numerous medicinal properties.',
      explanationHi: 'नीम को "गाँव की दवाखाना" इसलिए कहा जाता है क्योंकि इसके कई औषधीय गुण हैं।'
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: 'What is the active compound in turmeric that gives it anti-inflammatory properties?',
      questionHi: 'हल्दी में कौन सा सक्रिय यौगिक है जो इसे सूजनरोधी गुण देता है?',
      options: ['Curcumin', 'Allicin', 'Aloin', 'Gingerol'],
      optionsHi: ['करक्यूमिन', 'एलिसिन', 'एलोइन', 'जिंजेरोल'],
      correctAnswer: 0,
      explanation: 'Curcumin is the main active compound in turmeric responsible for its golden color and anti-inflammatory properties.',
      explanationHi: 'करक्यूमिन हल्दी का मुख्य सक्रिय यौगिक है जो इसके सुनहरे रंग और सूजनरोधी गुणों के लिए जिम्मेदार है।'
    },
    {
      id: 3,
      type: 'multiple-choice',
      question: 'Which part of the Aloe Vera plant is primarily used for medicinal purposes?',
      questionHi: 'एलोवेरा के पौधे का कौन सा भाग मुख्यतः औषधीय उद्देश्यों के लिए उपयोग किया जाता है?',
      options: ['Roots', 'Flowers', 'Gel from leaves', 'Seeds'],
      optionsHi: ['जड़ें', 'फूल', 'पत्तियों का जेल', 'बीज'],
      correctAnswer: 2,
      explanation: 'The clear gel inside Aloe Vera leaves contains the healing compounds used for skin treatment and other medicinal purposes.',
      explanationHi: 'एलोवेरा की पत्तियों के अंदर का साफ जेल त्वचा के इलाज और अन्य औषधीय उद्देश्यों के लिए उपयोग होने वाले चिकित्सक यौगिक हैं।'
    }
  ]
};

const QuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());

  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (!quizCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizCompleted, startTime]);

  const question = QUIZ_DATA.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_DATA.questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUIZ_DATA.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setQuizCompleted(true);
    const finalScore = score + (selectedAnswer === question.correctAnswer ? 1 : 0);
    
    // Save quiz results to database if user is logged in
    if (user) {
      // This would typically save to the database
      console.log('Saving quiz results:', {
        userId: user.id,
        quizId: QUIZ_DATA.id,
        score: finalScore,
        totalQuestions: QUIZ_DATA.questions.length,
        timeSpent: timeElapsed
      });
    }

    // Show completion toast
    toast({
      title: "Quiz Completed!",
      description: `You scored ${finalScore}/${QUIZ_DATA.questions.length}`,
    });
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

  if (quizCompleted) {
    const finalScore = score;
    const percentage = Math.round((finalScore / QUIZ_DATA.questions.length) * 100);
    
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
                Great job completing the quiz!
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
                    /{QUIZ_DATA.questions.length}
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
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Retake Quiz
                </Button>
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-gradient-garden hover:opacity-90"
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-garden-emerald">
              {language === 'hi' ? QUIZ_DATA.title : QUIZ_DATA.title}
            </h1>
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
          
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Question {currentQuestion + 1} of {QUIZ_DATA.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-botanical">
          <CardHeader>
            <CardTitle className="text-xl">
              {language === 'hi' ? question.questionHi : question.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="grid gap-3">
              {question.options.map((option, index) => {
                const optionText = language === 'hi' ? question.optionsHi[index] : option;
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
                  {language === 'hi' ? question.explanationHi : question.explanation}
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
                  {currentQuestion === QUIZ_DATA.questions.length - 1 
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