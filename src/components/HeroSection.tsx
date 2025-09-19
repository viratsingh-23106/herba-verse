import { Button } from '@/components/ui/button';
import { Search, Leaf, BookOpen, Users } from 'lucide-react';
import heroImage from '@/assets/garden-hero.jpg';

interface HeroSectionProps {
  onExplore: () => void;
  onSearch: () => void;
}

export function HeroSection({ onExplore, onSearch }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-garden-emerald/70 to-garden-mint/60 backdrop-blur-[1px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary-foreground/30">
                <Leaf className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -inset-2 bg-primary-foreground/10 rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Herba
              <span className="bg-gradient-to-r from-garden-mint to-accent bg-clip-text text-transparent">
                Verse
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 font-light max-w-2xl mx-auto leading-relaxed">
              Discover the wisdom of traditional herbal medicine through interactive 3D exploration
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <BookOpen className="w-8 h-8 text-primary-foreground mb-3 mx-auto" />
              <h3 className="font-semibold text-primary-foreground mb-2">Scientific Knowledge</h3>
              <p className="text-sm text-primary-foreground/80">
                Evidence-based information from AYUSH datasets and peer-reviewed research
              </p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <Leaf className="w-8 h-8 text-primary-foreground mb-3 mx-auto" />
              <h3 className="font-semibold text-primary-foreground mb-2">3D Plant Models</h3>
              <p className="text-sm text-primary-foreground/80">
                Interactive 3D visualizations to explore plant anatomy and features
              </p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20">
              <Users className="w-8 h-8 text-primary-foreground mb-3 mx-auto" />
              <h3 className="font-semibold text-primary-foreground mb-2">Community Wisdom</h3>
              <p className="text-sm text-primary-foreground/80">
                Share experiences and learn from traditional knowledge keepers
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={onExplore}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-botanical border-0 min-w-[200px]"
            >
              <Leaf className="w-5 h-5 mr-2" />
              Explore Plants
            </Button>
            <Button
              onClick={onSearch}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-primary-foreground/30 text-black hover:bg-primary-foreground/10 backdrop-blur-sm min-w-[200px]"
            >
              <Search className="w-5 h-5 mr-2" />
              Quick Search
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 pt-8 text-primary-foreground/80">
            <div className="text-center">
              <div className="text-2xl font-bold">10+</div>
              <div className="text-sm">Medicinal Plants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">30+</div>
              <div className="text-sm">Health Benefits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm">Languages</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}