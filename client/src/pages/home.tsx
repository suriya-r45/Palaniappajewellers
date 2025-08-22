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
import { ArrowRight, Star, Sparkles, Crown, Gem } from "lucide-react";

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

  // Category-based product sections
  const ringsProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'rings';
    }).slice(0, 9), [allProducts]
  );

  const necklacesProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'necklaces';
    }).slice(0, 9), [allProducts]
  );

  const earringsProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'earrings';
    }).slice(0, 9), [allProducts]
  );

  const braceletsProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'bracelets';
    }).slice(0, 9), [allProducts]
  );

  const watchesProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'watches';
    }).slice(0, 9), [allProducts]
  );

  const mensProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'mens';
    }).slice(0, 9), [allProducts]
  );

  const childrenProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'children';
    }).slice(0, 9), [allProducts]
  );

  const collectionsProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'collections';
    }).slice(0, 9), [allProducts]
  );

  const customProducts = useMemo(() => 
    allProducts.filter(product => {
      if (product.material?.includes('new_arrivals')) return false;
      return product.category === 'custom';
    }).slice(0, 9), [allProducts]
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

      {/* Rings Section */}
      {ringsProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-rings" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Rings</h2>
                  <Crown className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Elegant rings for every occasion</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {ringsProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('rings')}
                >
                  View All Rings <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Necklaces & Pendants Section */}
      {necklacesProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-necklaces" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Sparkles className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Necklaces & Pendants</h2>
                  <Sparkles className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Beautiful necklaces and pendants</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {necklacesProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('necklaces')}
                >
                  View All Necklaces <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Earrings Section */}
      {earringsProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-earrings" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Earrings</h2>
                  <Star className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Stunning earrings for every style</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {earringsProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('earrings')}
                >
                  View All Earrings <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Bracelets & Bangles Section */}
      {braceletsProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-bracelets" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Gem className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Bracelets & Bangles</h2>
                  <Gem className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Exquisite bracelets and bangles</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {braceletsProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('bracelets')}
                >
                  View All Bracelets <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Watches Section */}
      {watchesProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-watches" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Watches</h2>
                  <Crown className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Luxury watches for timeless elegance</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {watchesProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('watches')}
                >
                  View All Watches <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Men's Jewellery Section */}
      {mensProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-mens" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Star className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Men's Jewellery</h2>
                  <Star className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Distinguished jewelry for men</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {mensProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('mens')}
                >
                  View All Men's Jewelry <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Children's Jewellery Section */}
      {childrenProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-children" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Sparkles className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Children's Jewellery</h2>
                  <Sparkles className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Safe and beautiful jewelry for kids</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {childrenProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('children')}
                >
                  View All Children's Jewelry <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Collections Section */}
      {collectionsProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-collections" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Gem className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Collections</h2>
                  <Gem className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Exclusive jewelry collections</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {collectionsProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('collections')}
                >
                  View All Collections <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}

      {/* Custom Jewellery Section */}
      {customProducts.length > 0 && (
        <>
          <section className="py-16" data-testid="section-custom" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
                  <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Custom Jewellery</h2>
                  <Crown className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
                </div>
                <p className="text-xl text-black">Personalized jewelry made just for you</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8">
                {customProducts.map((product) => (
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
                  onClick={() => handleViewAllClick('custom')}
                >
                  View All Custom Jewelry <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
          <div className="h-px bg-black"></div>
        </>
      )}


      <Footer />
      <WhatsAppFloat />
    </div>
  );
}