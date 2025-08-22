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

const categories: Category[] = [
  {
    name: 'Diamond',
    subcategories: ['Diamond Rings', 'Diamond Necklaces', 'Diamond Earrings', 'Diamond Pendants', 'Diamond Bracelets']
  },
  {
    name: 'Gold',
    subcategories: ['Gold Rings', 'Gold Necklaces', 'Gold Earrings', 'Gold Pendants', 'Gold Bracelets', 'Gold Bangles']
  },
  {
    name: 'Gemstone',
    subcategories: ['Gemstone Rings', 'Gemstone Necklaces', 'Gemstone Earrings', 'Gemstone Pendants']
  },
  {
    name: 'Uncut Diamond',
    subcategories: ['Uncut Diamond Rings', 'Uncut Diamond Pendants', 'Uncut Diamond Earrings']
  },
  {
    name: 'Platinum',
    subcategories: ['Platinum Rings', 'Platinum Necklaces', 'Platinum Bracelets']
  },
  {
    name: 'Gold Coins',
    subcategories: ['Investment Coins', 'Collectible Coins', 'Religious Coins']
  },
  {
    name: 'Silver',
    subcategories: ['Silver Rings', 'Silver Necklaces', 'Silver Earrings', 'Silver Pendants', 'Silver Bracelets', 'Silver Bangles']
  },
  {
    name: 'Watches',
    subcategories: ['Men\'s Watches', 'Women\'s Watches', 'Luxury Watches', 'Smart Watches']
  },
  {
    name: 'Jewellery',
    subcategories: ['Rings', 'Necklaces', 'Earrings', 'Pendants', 'Bracelets', 'Bangles']
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
      // Navigate to collections page for this category
      window.location.href = `/collections/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
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
          <div className="flex-1 overflow-y-auto">
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
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg"
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
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg"
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