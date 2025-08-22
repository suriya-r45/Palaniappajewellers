import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ProductCard from '@/components/product-card';
import ProductFilters from '@/components/product-filters';
import WhatsAppFloat from '@/components/whatsapp-float';
import { Button } from '@/components/ui/button';
import { Product } from '@shared/schema';
import { Currency } from '@/lib/currency';
import { ProductFilters as IProductFilters } from '@shared/cart-schema';
import { ArrowRight, Star, Sparkles, Crown, Gem, Heart, Watch, Users, Baby, Palette, Wrench } from "lucide-react";
import ringsImage from '@assets/rings_luxury.png';
import pendantsImage from '@assets/pendants_luxury.png';
import earringsImage from '@assets/earrings_luxury.png';
import braceletsImage from '@assets/bracelets_luxury.png';
import necklacesImage from '@assets/necklaces_luxury.png';
import banglesImage from '@assets/bangles_luxury.png';
import watchesImage from '@assets/watches_luxury.png';
import mensJewelryImage from '@assets/mens_jewelry_luxury.png';
import childrenJewelryImage from '@assets/children_jewelry_luxury.png';
import customJewelryImage from '@assets/custom_jewelry_luxury.png';
import collectionsImage from '@assets/collections_luxury.png';
import goldCollectionImage from '@assets/gold_collection_luxury.png';
import silverCollectionImage from '@assets/silver_collection_luxury.png';
import diamondCollectionImage from '@assets/diamond_collection_luxury.png';

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('BHD');

  // Handle "View All" button clicks - navigate to collections page
  const handleViewAllClick = (material: string) => {
    const materialPath = material.toLowerCase();
    window.location.href = `/collections/${materialPath}`;
  };
  const [filters, setFilters] = useState<IProductFilters>({});

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply material filter
    if (filters.material) {
      filtered = filtered.filter(product => product.material === filters.material);
    }

    // Apply price range filter
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filtered = filtered.filter(product => {
        const price = selectedCurrency === 'INR' ? parseFloat(product.priceInr) : parseFloat(product.priceBhd);
        const min = filters.priceMin || 0;
        const max = filters.priceMax || Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Apply weight range filter
    if (filters.weightRange) {
      const [min, max] = filters.weightRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const weight = parseFloat(product.grossWeight || '0');
        return weight >= min && weight <= max;
      });
    }

    // Apply featured filter
    if (filters.featured) {
      // Filter for featured items based on stock and name
      filtered = filtered.filter(product => product.stock > 0 || product.name.toLowerCase().includes('featured'));
    }

    // Apply discount filter
    if (filters.discount) {
      filtered = filtered.filter(product => product.name.toLowerCase().includes('sale') || product.name.toLowerCase().includes('discount'));
    }

    // Apply premium filter
    if (filters.premium) {
      filtered = filtered.filter(product => parseFloat(selectedCurrency === 'INR' ? product.priceInr : product.priceBhd) > 50000);
    }

    // Apply new arrivals filter (last 30 days)
    if (filters.newArrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(product => 
        product.createdAt && new Date(product.createdAt) >= thirtyDaysAgo
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return parseFloat(selectedCurrency === 'INR' ? a.priceInr : a.priceBhd) -
              parseFloat(selectedCurrency === 'INR' ? b.priceInr : b.priceBhd);
          case 'price_desc':
            return parseFloat(selectedCurrency === 'INR' ? b.priceInr : b.priceBhd) -
              parseFloat(selectedCurrency === 'INR' ? a.priceInr : a.priceBhd);
          case 'newest':
            return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'weight_asc':
            return (parseFloat(a.grossWeight || '0') || 0) - (parseFloat(b.grossWeight || '0') || 0);
          case 'weight_desc':
            return (parseFloat(b.grossWeight || '0') || 0) - (parseFloat(a.grossWeight || '0') || 0);
          case 'stock':
            return b.stock - a.stock;
          case 'popular':
            return b.name.localeCompare(a.name); // Can be enhanced with actual popularity metrics
          case 'rating':
            return b.name.localeCompare(a.name); // Can be enhanced with actual rating system
          case 'discount':
            // Enhanced sorting for discounted items
            return b.name.localeCompare(a.name);
          case 'premium':
            // Enhanced sorting for premium items by price desc
            return parseFloat(selectedCurrency === 'INR' ? b.priceInr : b.priceBhd) -
              parseFloat(selectedCurrency === 'INR' ? a.priceInr : a.priceBhd);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [allProducts, filters, selectedCurrency]);

  // Category counts for display
  const getCategoryCount = (category: string) => {
    return allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      // Map display category names to database category names
      const categoryMapping: { [key: string]: string } = {
        'rings': 'RINGS',
        'necklaces': 'NECKLACES', 
        'pendants': 'PENDANTS',
        'earrings': 'EARRINGS',
        'bracelets': 'BRACELETS',
        'bangles': 'BANGLES',
        'watches': 'WATCHES',
        'mens_jewellery': 'MENS_JEWELLERY',
        'mens': 'MENS_JEWELLERY',
        'children_jewellery': 'CHILDRENS_JEWELLERY',
        'children': 'CHILDRENS_JEWELLERY',
        'materials': 'MATERIALS',
        'collections': 'COLLECTIONS',
        'custom_jewellery': 'CUSTOM_JEWELLERY',
        'custom': 'CUSTOM_JEWELLERY',
        'new_arrivals': 'NEW_ARRIVALS',
        'gold_coins': 'GOLD_COINS'
      };
      const dbCategory = categoryMapping[category.toLowerCase()] || category.toUpperCase();
      return product.category === dbCategory;
    }).length;
  };

  const getMaterialCount = (material: string) => {
    return allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      // Use metalType field for broad material categorization instead of material field
      return product.metalType === material;
    }).length;
  };

  // Material-based collections
  const goldProducts = useMemo(() => 
    allProducts.filter(product => product.metalType === 'GOLD').slice(0, 8), 
    [allProducts]
  );

  const silverProducts = useMemo(() => 
    allProducts.filter(product => product.metalType === 'SILVER').slice(0, 8), 
    [allProducts]
  );

  const diamondProducts = useMemo(() => 
    allProducts.filter(product => product.metalType === 'DIAMOND').slice(0, 8), 
    [allProducts]
  );

  // Gold Platted Silver Products - Products with gold plating on silver base
  const goldPlattedSilverProducts = useMemo(() => 
    allProducts.filter(product => 
      product.material?.toLowerCase().includes('gold plated') ||
      product.material?.toLowerCase().includes('gold platted') ||
      product.description?.toLowerCase().includes('gold plated') ||
      product.description?.toLowerCase().includes('gold platted') ||
      (product.metalType === 'SILVER' && 
       (product.material?.toLowerCase().includes('gold') || 
        product.name.toLowerCase().includes('gold plated') ||
        product.name.toLowerCase().includes('gold platted')))
    ).slice(0, 8), 
    [allProducts]
  );

  // New Arrivals - Products specifically tagged as new_arrivals OR recent products
  const newArrivalProducts = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return allProducts
      .filter(product => {
        // First priority: Products specifically tagged with "new_arrivals"
        const isTaggedNewArrival = product.material?.includes('new_arrivals');
        if (isTaggedNewArrival) return true;
        
        // Second priority: Recent products
        const isRecent = product.createdAt && new Date(product.createdAt) > thirtyDaysAgo;
        return isRecent;
      })
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 9);
  }, [allProducts]);


  return (
    <div className="min-h-screen" data-testid="page-home" style={{ background: 'linear-gradient(135deg, #fdfbf7 0%, #fff9e6 100%)' }}>
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />

      {/* Gold Platted Silver Jewellery Section */}
      {goldPlattedSilverProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-gold-platted-silver" style={{ background: 'linear-gradient(135deg, #f8f6e6 0%, #fff2cc 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Gem className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Gold Platted Silver Jewellery</h2>
                  <Gem className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Elegant silver jewelry with luxurious gold finish</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {goldPlattedSilverProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={selectedCurrency}
                    showActions={false}
                  />
                ))}
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-2 px-8 py-3 text-lg" 
                  style={{ borderColor: '#b8860b', color: '#8b4513' }} 
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8860b'; e.currentTarget.style.color = 'white'; }} 
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b4513'; }}
                  onClick={() => handleViewAllClick('gold-plated-silver')}
                >
                  View All Gold Platted Silver <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* Section Separator */}
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* New Arrivals Section */}
      {newArrivalProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-new-arrivals" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Sparkles className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>New Arrivals</h2>
                  <Sparkles className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Discover our latest jewelry additions</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {newArrivalProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={selectedCurrency}
                    showActions={false}
                  />
                ))}
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-2 px-8 py-3 text-lg" 
                  style={{ borderColor: '#b8860b', color: '#8b4513' }} 
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8860b'; e.currentTarget.style.color = 'white'; }} 
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b4513'; }}
                  onClick={() => handleViewAllClick('new-arrivals')}
                >
                  View All New Arrivals <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* Section Separator */}
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Categories Grid Layout */}
      <section className="py-16" data-testid="section-categories" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Explore Our Collections</h2>
            <p className="text-xl text-black mt-4">Discover jewelry for every occasion</p>
          </div>
          
          {/* 3x5 Grid Layout on Mobile, 4x4 on Desktop */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
            {/* Row 1 */}
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('rings')}
              data-testid="category-card-rings"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${ringsImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Rings</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('rings')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('necklaces')}
              data-testid="category-card-necklaces"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${necklacesImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Necklaces</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('necklaces')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('pendants')}
              data-testid="category-card-pendants"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${pendantsImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Pendants</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('pendants')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('earrings')}
              data-testid="category-card-earrings"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${earringsImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Earrings</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('earrings')} items</p>
              </div>
            </div>

            {/* Row 2 */}
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('bracelets')}
              data-testid="category-card-bracelets"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${braceletsImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Bracelets</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('bracelets')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('bangles')}
              data-testid="category-card-bangles"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${banglesImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Bangles</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('bangles')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('watches')}
              data-testid="category-card-watches"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${watchesImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Watches</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('watches')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('mens')}
              data-testid="category-card-mens"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${mensJewelryImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Men's Jewellery</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('mens')} items</p>
              </div>
            </div>

            {/* Row 3 */}
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('children')}
              data-testid="category-card-children"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${childrenJewelryImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Children's Jewellery</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('children')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('custom')}
              data-testid="category-card-custom"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${customJewelryImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Custom Jewellery</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('custom')} items</p>
              </div>
            </div>
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('collections')}
              data-testid="category-card-collections"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url(${collectionsImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Collections</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('collections')} items</p>
              </div>
            </div>
            {/* Row 4 */}
            <div 
              className="rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden bg-gray-50"
              onClick={() => handleViewAllClick('gold_coins')}
              data-testid="category-card-gold-coins"
            >
              <div 
                className="h-24 md:h-32"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1609884261025-5d5f2a9b4ec9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              <div className="p-2 text-center bg-white">
                <h3 className="font-bold text-xs md:text-sm" style={{ color: '#8b4513' }}>Gold Coins</h3>
                <p className="text-xs text-gray-600">{getCategoryCount('gold_coins')} items</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Collection Section */}
      {goldProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-yellow-50 to-orange-50" data-testid="section-gold">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-yellow-600 mr-3" />
                <h2 className="text-4xl font-bold text-black">Gold Collection</h2>
                <Crown className="h-8 w-8 text-yellow-600 ml-3" />
              </div>
              <p className="text-xl text-gray-600">22K & 18K gold jewelry with intricate designs</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {goldProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={selectedCurrency}
                  showActions={false}
                />
              ))}
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                onClick={() => handleViewAllClick('GOLD')}
              >
                View All Gold Jewelry <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Silver Collection Section */}
      {silverProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-gray-50 to-slate-50" data-testid="section-silver">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-gray-600 mr-3" />
                <h2 className="text-4xl font-bold text-black">Silver Collection</h2>
                <Star className="h-8 w-8 text-gray-600 ml-3" />
              </div>
              <p className="text-xl text-gray-600">Sterling silver jewelry with contemporary elegance</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {silverProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={selectedCurrency}
                  showActions={false}
                />
              ))}
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-600 hover:bg-gray-50"
                onClick={() => handleViewAllClick('SILVER')}
              >
                View All Silver Jewelry <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Diamond Collection Section */}
      {diamondProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50" data-testid="section-diamond">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Gem className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-4xl font-bold text-black">Diamond Collection</h2>
                <Gem className="h-8 w-8 text-blue-600 ml-3" />
              </div>
              <p className="text-xl text-gray-600">Brilliant diamonds for life's precious moments</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {diamondProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={selectedCurrency}
                  showActions={false}
                />
              ))}
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => handleViewAllClick('DIAMOND')}
              >
                View All Diamond Jewelry <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}