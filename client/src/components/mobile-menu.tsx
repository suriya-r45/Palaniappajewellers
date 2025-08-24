import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface Category {
  name: string;
  subcategories?: string[];
  path?: string;
}

// Categories from admin product form - exact same structure as in admin dashboard
const categories: Category[] = [
  {
    name: 'Rings',
    subcategories: ['Engagement Rings', 'Wedding Bands', 'Fashion Rings', 'Cocktail Rings', 'Promise Rings', 'Birthstone Rings']
  },
  {
    name: 'Necklaces',
    subcategories: ['Chains', 'Chokers', 'Lockets', 'Beaded Necklaces', 'Collars', 'Long Necklaces/Opera Chains', 'Multi-layered Necklaces']
  },
  {
    name: 'Pendants',
    subcategories: ['Solitaire', 'Halo', 'Cluster', 'Heart', 'Cross', 'Initial', 'Diamond', 'Gemstone', 'Pearl', 'Bridal', 'Minimalist', 'Traditional']
  },
  {
    name: 'Earrings',
    subcategories: ['Stud Earrings', 'Hoop Earrings', 'Drop Earrings', 'Dangle Earrings', 'Ear Cuffs', 'Huggie Earrings']
  },
  {
    name: 'Bracelets',
    subcategories: ['Cuff', 'Tennis', 'Charm', 'Chain', 'Beaded', 'Link', 'Bolo', 'Leather', 'Diamond', 'Gemstone', 'Pearl', 'Bridal', 'Minimalist', 'Traditional']
  },
  {
    name: 'Bangles',
    subcategories: ['Classic', 'Kada', 'Cuff', 'Openable', 'Adjustable', 'Charm', 'Diamond', 'Gemstone', 'Pearl', 'Bridal', 'Minimalist', 'Traditional', 'Temple', 'Kundan', 'Polki', 'Navratna']
  },
  {
    name: 'Watches',
    subcategories: ['Men\'s Watches', 'Women\'s Watches', 'Smartwatches', 'Luxury Watches', 'Sport Watches']
  },
  {
    name: 'Men\'s Jewellery',
    subcategories: ['Rings', 'Bracelets', 'Necklaces', 'Cufflinks', 'Tie Clips']
  },
  {
    name: 'Children\'s Jewellery',
    subcategories: ['Kids\' Rings', 'Kids\' Necklaces', 'Kids\' Earrings', 'Kids\' Bracelets']
  },
  {
    name: 'Materials',
    subcategories: ['Gold Jewellery', 'Silver Jewellery', 'Platinum Jewellery', 'Diamond Jewellery', 'Gemstone Jewellery', 'Pearl Jewellery']
  },
  {
    name: 'Collections',
    subcategories: ['Bridal Collection', 'Vintage Collection', 'Contemporary Collection', 'Minimalist Collection', 'Celebrity Collection']
  },
  {
    name: 'Custom Jewellery',
    subcategories: ['Design Your Own', 'Engraving Services', 'Repairs & Restorations']
  },
  {
    name: 'New Arrivals',
    subcategories: ['Latest Products', 'Featured Items', 'Trending Now', 'Exclusive Pieces']
  },
  {
    name: 'Gold Coins',
    subcategories: ['Investment', 'Religious', 'Customized', 'Occasion', 'Corporate Gifting', 'Collectible', 'Plain', 'Hallmarked']
  }
];

export default function MobileMenu({ isOpen, onToggle }: MobileMenuProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'subcategory'>('main');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories) {
      setSelectedCategory(category);
      setCurrentView('subcategory');
    } else if (category.path) {
      window.location.href = category.path;
      onToggle();
    } else {
      // Navigate to collections page for this category with proper routing
      let categoryPath = category.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
      
      // Handle special cases for routing
      if (category.name === "Men's Jewellery") {
        categoryPath = "mens";
      } else if (category.name === "Children's Jewellery") {
        categoryPath = "children";
      } else if (category.name === "Gold Coins") {
        categoryPath = "gold-coins";
      } else if (category.name === "New Arrivals") {
        categoryPath = "new-arrivals";
      } else if (category.name === "Custom Jewellery") {
        categoryPath = "custom-jewellery";
      }
      
      window.location.href = `/collections/${categoryPath}`;
      onToggle();
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    // Convert subcategory to URL-friendly format and navigate
    const subcategoryPath = subcategory.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
    window.location.href = `/collections/${subcategoryPath}`;
    onToggle();
  };

  const handleBackClick = () => {
    setCurrentView('main');
    setSelectedCategory(null);
  };

  const resetMenu = () => {
    setCurrentView('main');
    setSelectedCategory(null);
  };

  // Reset menu when closing
  if (!isOpen) {
    if (currentView !== 'main') {
      resetMenu();
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => {
          resetMenu();
          onToggle();
        }}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              {currentView === 'subcategory' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="p-2 mr-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {currentView === 'main' ? 'Categories' : selectedCategory?.name}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetMenu();
                onToggle();
              }}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Categories List */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="py-2">
              {currentView === 'main' ? (
                categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <span className="text-base font-medium text-gray-900">
                      {category.name}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                ))
              ) : (
                selectedCategory?.subcategories?.map((subcategory, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <span className="text-base font-medium text-gray-900">
                      {subcategory}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Login/Sign Up Buttons */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {user ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Welcome, {user.name}!
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    resetMenu();
                    onToggle();
                  }}
                >
                  Close Menu
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link href="/login" className="flex-1">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-800 to-red-800 hover:from-rose-900 hover:to-red-900 text-white font-medium py-3 rounded-lg shadow-md transition-all duration-200"
                    onClick={() => {
                      resetMenu();
                      onToggle();
                    }}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-800 to-red-800 hover:from-rose-900 hover:to-red-900 text-white font-medium py-3 rounded-lg shadow-md transition-all duration-200"
                    onClick={() => {
                      resetMenu();
                      onToggle();
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}