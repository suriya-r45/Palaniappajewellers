import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Heart, 
  Crown, 
  Gem, 
  Watch,
  Users,
  Baby,
  Sparkles,
  Star,
  Palette,
  Wrench
} from 'lucide-react';

const categoryIcons = {
  rings: Crown,
  necklaces: Sparkles,
  earrings: Star,
  bracelets: Heart,
  watches: Watch,
  mens: Users,
  children: Baby,
  materials: Gem,
  collections: Palette,
  custom: Wrench
};

const categories = [
  {
    id: 'rings',
    name: 'Rings',
    subcategories: [
      'Engagement Rings',
      'Wedding Bands', 
      'Fashion Rings',
      'Cocktail Rings',
      'Promise Rings',
      'Birthstone Rings'
    ]
  },
  {
    id: 'necklaces',
    name: 'Necklaces & Pendants',
    subcategories: [
      'Chains',
      'Lockets',
      'Statement Necklaces',
      'Pendant Necklaces',
      'Chokers',
      'Layered Necklaces'
    ]
  },
  {
    id: 'earrings', 
    name: 'Earrings',
    subcategories: [
      'Stud Earrings',
      'Hoop Earrings',
      'Drop Earrings',
      'Dangle Earrings',
      'Ear Cuffs',
      'Huggie Earrings'
    ]
  },
  {
    id: 'bracelets',
    name: 'Bracelets & Bangles',
    subcategories: [
      'Charm Bracelets',
      'Bangles',
      'Cuff Bracelets',
      'Chain Bracelets',
      'Tennis Bracelets'
    ]
  },
  {
    id: 'watches',
    name: 'Watches',
    subcategories: [
      "Men's Watches",
      "Women's Watches",
      'Smartwatches',
      'Luxury Watches',
      'Sport Watches'
    ]
  },
  {
    id: 'mens',
    name: "Men's Jewellery",
    subcategories: [
      'Rings',
      'Bracelets', 
      'Necklaces',
      'Cufflinks',
      'Tie Clips'
    ]
  },
  {
    id: 'children',
    name: "Children's Jewellery",
    subcategories: [
      "Kids' Rings",
      "Kids' Necklaces",
      "Kids' Earrings",
      "Kids' Bracelets"
    ]
  },
  {
    id: 'materials',
    name: 'Materials',
    subcategories: [
      'Gold Jewellery',
      'Silver Jewellery',
      'Platinum Jewellery',
      'Diamond Jewellery',
      'Gemstone Jewellery',
      'Pearl Jewellery'
    ]
  },
  {
    id: 'collections',
    name: 'Collections',
    subcategories: [
      'Bridal Collection',
      'Vintage Collection',
      'Contemporary Collection',
      'Minimalist Collection',
      'Celebrity Collection'
    ]
  },
  {
    id: 'custom',
    name: 'Custom Jewellery',
    subcategories: [
      'Design Your Own',
      'Engraving Services',
      'Repairs & Restorations'
    ]
  }
];

export default function CategoryNavigation() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleCategoryClick = (categoryName: string) => {
    // Scroll to products section and filter by category
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    console.log('Navigate to category:', categoryName);
  };

  const handleSubcategoryClick = (subcategoryName: string) => {
    // Scroll to products section and filter by subcategory
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    console.log('Navigate to subcategory:', subcategoryName);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden" data-testid="section-category-navigation" style={{ backgroundColor: '#ffffff' }}>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.02)_25%,transparent_25%),linear-gradient(-45deg,rgba(0,0,0,0.02)_25%,transparent_25%)] bg-[size:60px_60px]"></div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold text-gradient mb-6">Explore Our Collections</h2>
          <div className="w-24 h-1 premium-gradient mx-auto mb-8 rounded-full"></div>
          <p className="text-2xl text-gray-700 font-light">Browse our exquisite collection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons] || Crown;
            const isExpanded = expandedCategory === category.id;
            
            return (
              <Card 
                key={category.id} 
                className="card-hover glass-effect border-0"
                data-testid={`category-card-${category.id}`}
              >
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full p-0 h-auto justify-start hover:bg-transparent"
                    onClick={() => toggleCategory(category.id)}
                    data-testid={`button-toggle-${category.id}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-3 text-gray-600" />
                        <div className="text-left">
                          <h3 className="font-semibold text-black text-sm">{category.name}</h3>
                          <p className="text-xs text-gray-500">{category.subcategories.length} types</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </Button>

                  {isExpanded && (
                    <div className="mt-4 pl-8 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      {category.subcategories.map((subcategory, subIndex) => (
                        <Button
                          key={subIndex}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start p-1 h-auto text-xs text-gray-600 hover:text-black hover:bg-gray-50"
                          onClick={() => handleSubcategoryClick(subcategory)}
                          data-testid={`button-subcategory-${category.id}-${subIndex}`}
                        >
                          • {subcategory}
                        </Button>
                      ))}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleCategoryClick(category.name)}
                        data-testid={`button-view-all-${category.id}`}
                      >
                        View All {category.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button 
            className="premium-button px-16 py-5 text-xl rounded-full elegant-shadow-lg transition-all duration-500"
            data-testid="button-browse-all"
            onClick={() => {
              const productsSection = document.getElementById('products');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Browse All Categories
          </Button>
        </div>
      </div>
    </section>
  );
}