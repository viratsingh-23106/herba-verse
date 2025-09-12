import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles } from 'lucide-react';

const AISuggestions = () => {
  const { t } = useLanguage();

  useEffect(() => {
    // Load Pickaxe script if not already loaded
    const existingScript = document.querySelector('script[src="https://studio.pickaxe.co/api/embed/bundle.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://studio.pickaxe.co/api/embed/bundle.js';
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup script on unmount
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

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
            Get personalized medicinal plant recommendations powered by AI
          </p>
        </div>

        {/* Pickaxe Embed */}
        <div className="w-full bg-background rounded-lg shadow-botanical overflow-hidden">
          <div id="deployment-0ef362ae-52dd-4e65-92fa-53d055eeb152" className="w-full min-h-[600px]"></div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;