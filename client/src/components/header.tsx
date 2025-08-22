import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, LogOut, Search, MapPin, Heart, ShoppingCart, Menu, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Currency, CURRENCY_NAMES } from '@/lib/currency';
import CartButton from '@/components/cart/cart-button';
import GoldRatesTicker from '@/components/gold-rates-ticker';
import MobileMenu from '@/components/mobile-menu';
import logoPath from '@assets/Royal_gold_jewelry_collection_e293857a.png';

interface HeaderProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export default function Header({ selectedCurrency, onCurrencyChange }: HeaderProps) {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>


      {/* Main Header */}
      <header className="bg-gradient-to-r from-rose-900 to-red-900 shadow-lg sticky top-0 z-50" data-testid="header-main">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 text-white hover:bg-rose-800"
              >
                <Menu className="h-8 w-8" />
              </Button>
            </div>

            {/* Logo Section */}
            <div className="flex items-center space-x-2 md:space-x-4 ml-2 md:ml-0">
              <Link href="/" className="flex items-center space-x-2 md:space-x-3" data-testid="link-home">
                <div className="w-8 h-8 md:w-16 md:h-16 rounded-full overflow-hidden border border-white">
                  <img 
                    src={logoPath} 
                    alt="Palaniappa Jewellers Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xs md:text-2xl font-bold text-white tracking-wide drop-shadow-sm">PALANIAPPA JEWELLERS</h1>
                  <p className="text-xs text-rose-100 font-medium">Since 2025</p>
                </div>
              </Link>
            </div>

            {/* Right Section Icons */}
            <div className="flex items-center space-x-1 md:space-x-4 text-white">
              {/* Currency/Country */}
              <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px] px-1">
                <Select value={selectedCurrency} onValueChange={onCurrencyChange} data-testid="select-currency">
                  <SelectTrigger className="bg-transparent border-0 text-white hover:text-rose-100 p-0 h-auto transition-colors duration-200 w-full">
                    <div className="flex flex-col items-center cursor-pointer w-full">
                      <span className="text-[9px] md:text-xs whitespace-nowrap mb-0.5">Country</span>
                      <div className="text-center text-[10px] md:text-xs font-medium">
                        <SelectValue />
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR" data-testid="option-inr">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 rounded-sm" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="8" fill="#FF9933"/>
                          <rect y="8" width="24" height="8" fill="#FFFFFF"/>
                          <rect y="16" width="24" height="8" fill="#138808"/>
                          <circle cx="12" cy="12" r="3" fill="#000080"/>
                        </svg>
                        <span>₹ INR</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="BHD" data-testid="option-bhd">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 rounded-sm" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="12" fill="#FFFFFF"/>
                          <rect y="12" width="24" height="12" fill="#CE1126"/>
                          <path d="M0 0 L8 6 L0 12 V8 L4 6 L0 4 Z" fill="#CE1126"/>
                        </svg>
                        <span>BD BHD</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Profile */}
              <div className="flex flex-col items-center px-1">
                {user ? (
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <Link href="/admin">
                        <Button variant="ghost" size="sm" className="text-white hover:text-rose-100 hover:bg-rose-800 transition-all duration-200" data-testid="button-admin-dashboard">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex flex-col items-center text-white hover:text-rose-100 hover:bg-rose-800 p-1 transition-all duration-200"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-xs mt-1">{user.name}</span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <div className="flex flex-col items-center cursor-pointer hover:text-rose-100 transition-colors duration-200">
                      <User className="h-3 w-3 md:h-5 md:w-5" />
                      <span className="text-xs">Profile</span>
                    </div>
                  </Link>
                )}
              </div>

              {/* Wishlist */}
              <div className="hidden md:flex flex-col items-center cursor-pointer hover:text-rose-100 transition-colors duration-200">
                <Heart className="h-3 w-3 md:h-5 md:w-5" />
                <span className="text-xs">Wishlist</span>
              </div>

              {/* Cart */}
              <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px]">
                <CartButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
    </>
  );
}
