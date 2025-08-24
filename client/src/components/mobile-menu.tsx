import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight, ChevronLeft, Sparkles, Crown, Diamond, Heart, Watch, Star } from 'lucide-react';
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
  },
  {
    name: 'Mangalsutra',
    subcategories: ['Traditional', 'Contemporary', 'Diamond', 'Gold', 'Long Chain', 'Short Chain', 'Pendant Style', 'Beaded']
  },
  {
    name: 'Nose Jewelry',
    subcategories: ['Nose Rings', 'Nose Studs', 'Septum Rings', 'Traditional', 'Contemporary', 'Diamond', 'Gold', 'Silver']
  },
  {
    name: 'Anklets & Toe Rings',
    subcategories: ['Anklets', 'Toe Rings', 'Chain Anklets', 'Charm Anklets', 'Traditional', 'Contemporary', 'Gold', 'Silver']
  },
  {
    name: 'Bridal Collections',
    subcategories: ['Bridal Sets', 'Wedding Jewelry', 'Engagement Jewelry', 'Traditional Bridal', 'Contemporary Bridal', 'Complete Sets']
  }
];

// Category icons mapping
const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: any } = {
    'Rings': Diamond,
    'Necklaces': Sparkles,
    'Pendants': Heart,
    'Earrings': Star,
    'Bracelets': Crown,
    'Bangles': Crown,
    'Watches': Watch,
    'Men\'s Jewellery': Diamond,
    'Children\'s Jewellery': Star,
    'Materials': Sparkles,
    'Collections': Crown,
    'Custom Jewellery': Heart,
    'New Arrivals': Star,
    'Gold Coins': Diamond,
    'Mangalsutra': Heart,
    'Nose Jewelry': Star,
    'Anklets & Toe Rings': Sparkles,
    'Bridal Collections': Crown
  };
  return iconMap[categoryName] || Sparkles;
};

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
      } else if (category.name === "Anklets & Toe Rings") {
        categoryPath = "anklets-toe-rings";
      } else if (category.name === "Bridal Collections") {
        categoryPath = "bridal-collections";
      } else if (category.name === "Nose Jewelry") {
        categoryPath = "nose-jewelry";
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
      <div className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-white via-rose-50/30 to-white shadow-2xl border-r border-rose-100">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-rose-800 to-red-800 text-white p-6 shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-red-400"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {currentView === 'subcategory' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackClick}
                    className="p-2 mr-3 text-white hover:bg-white/20 rounded-full transition-all duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-rose-200" />
                  <h2 className="text-xl font-bold text-white">
                    {currentView === 'main' ? 'Jewelry Categories' : selectedCategory?.name}
                  </h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetMenu();
                  onToggle();
                }}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>
          
          {/* Categories List */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] bg-gradient-to-b from-transparent to-rose-50/20">
            <div className="py-3">
              {currentView === 'main' ? (
                categories.map((category, index) => {
                  const IconComponent = getCategoryIcon(category.name);
                  return (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 transition-all duration-300 border-b border-rose-100/50 group hover:shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-rose-100 to-red-100 p-2.5 rounded-full mr-4 group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                          <IconComponent className="h-5 w-5 text-rose-700" />
                        </div>
                        <span className="text-base font-semibold text-gray-800 group-hover:text-rose-800 transition-colors duration-200">
                          {category.name}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-rose-400 group-hover:text-rose-600 transition-all duration-200 group-hover:translate-x-1" />
                    </button>
                  );
                })
              ) : (
                selectedCategory?.subcategories?.map((subcategory, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50 transition-all duration-300 border-b border-rose-100/50 group hover:shadow-sm"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-br from-rose-400 to-red-400 rounded-full mr-4 group-hover:shadow-sm transition-all duration-300"></div>
                      <span className="text-base font-medium text-gray-800 group-hover:text-rose-800 transition-colors duration-200">
                        {subcategory}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-rose-400 group-hover:text-rose-600 transition-all duration-200 group-hover:translate-x-1" />
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Login/Sign Up Buttons */}
          <div className="relative p-6 border-t border-rose-200 bg-gradient-to-r from-rose-50 to-red-50">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-200 to-red-200"></div>
            {user ? (
              <div className="text-center">
                <div className="bg-white/80 rounded-lg p-4 mb-3 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="h-5 w-5 text-rose-600 mr-2" />
                    <p className="text-sm font-semibold text-rose-800">
                      Welcome, {user.name}!
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-rose-300 text-rose-800 hover:bg-white/70 font-medium py-3 rounded-lg shadow-sm transition-all duration-200"
                  onClick={() => {
                    resetMenu();
                    onToggle();
                  }}
                >
                  Close Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center">
                    <Diamond className="h-5 w-5 text-rose-600 mr-2" />
                    <p className="text-sm font-medium text-rose-800">Access Your Account</p>
                  </div>
                </div>
                <Link href="/login" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-800 to-red-800 hover:from-rose-900 hover:to-red-900 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => {
                      resetMenu();
                      onToggle();
                    }}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={() => {
                      resetMenu();
                      onToggle();
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
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