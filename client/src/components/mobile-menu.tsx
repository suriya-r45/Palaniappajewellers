import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const categories = [
  'Diamond',
  'Gold', 
  'Gemstone',
  'Uncut Diamond',
  'Platinum',
  'Gold Coins',
  'Silver',
  'Watches',
  'Gifts',
  'Jewellery',
  'Gift Cards',
  'Gold Rate'
];

export default function MobileMenu({ isOpen, onToggle }: MobileMenuProps) {
  const { user } = useAuth();

  const handleCategoryClick = (category: string) => {
    console.log('Navigate to category:', category);
    onToggle(); // Close menu after selection
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onToggle}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Categories List */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="text-base font-medium text-gray-900">
                    {category}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
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
                  onClick={onToggle}
                >
                  Close Menu
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link href="/login" className="flex-1">
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3"
                    onClick={onToggle}
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3"
                    onClick={onToggle}
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