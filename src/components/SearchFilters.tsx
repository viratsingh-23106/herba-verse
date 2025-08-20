import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onClearFilters: () => void;
}

const filterCategories = {
  'Health Benefits': [
    'Immunity', 'Digestive Health', 'Respiratory Health', 'Skin Care',
    'Anti-inflammatory', 'Antioxidant', 'Pain Relief', 'Mental Health'
  ],
  'Plant Parts': [
    'Leaves', 'Roots', 'Bark', 'Flowers', 'Seeds', 'Fruit', 'Stem'
  ],
  'Preparation': [
    'Tea', 'Powder', 'Oil', 'Extract', 'Fresh', 'Dried', 'Juice'
  ]
};

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  onClearFilters
}: SearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterToggle = (filter: string) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onClearFilters();
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search plants by name, ailment, or scientific name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 h-12 text-base border-border/50 focus:border-primary bg-background/80 backdrop-blur"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="h-10 border-border/50 bg-background/80 backdrop-blur hover:bg-secondary"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {selectedFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Filter Plants</h4>
                {selectedFilters.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {Object.entries(filterCategories).map(([category, options]) => (
                <div key={category} className="space-y-2">
                  <h5 className="text-sm font-medium text-foreground border-b border-border pb-1">
                    {category}
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-secondary/50 p-1 rounded text-sm"
                      >
                        <Checkbox
                          checked={selectedFilters.includes(option)}
                          onCheckedChange={() => handleFilterToggle(option)}
                        />
                        <span className="text-sm text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Badges */}
        {selectedFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                onClick={() => handleFilterToggle(filter)}
              >
                {filter}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}