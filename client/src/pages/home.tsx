import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ProductCard from '@/components/product-card';
import ProductFilters from '@/components/product-filters';
import WhatsAppFloat from '@/components/whatsapp-float';
import CategoryNavigation from '@/components/category-navigation';
import { Button } from '@/components/ui/button';
import { Product } from '@shared/schema';
import { Currency } from '@/lib/currency';
import { ProductFilters as IProductFilters } from '@shared/cart-schema';
import { ArrowRight, Star, Sparkles, Crown, Gem } from "lucide-react";

export default function Home() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('BHD');
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
      // Can be enhanced based on product featured status
      filtered = filtered.filter(product => product.stock > 0);
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

  // Get category-specific products
  const goldProducts = useMemo(() => 
    allProducts.filter(product => 
      product.material?.includes('GOLD') || 
      product.category === 'RINGS' || 
      product.category === 'NECKLACES_CHAINS'
    ).slice(0, 8), [allProducts]
  );

  const silverProducts = useMemo(() => 
    allProducts.filter(product => 
      product.material?.includes('SILVER') ||
      product.category === 'ANKLETS_TOE_RINGS'
    ).slice(0, 8), [allProducts]
  );

  const diamondProducts = useMemo(() => 
    allProducts.filter(product => 
      product.material?.includes('DIAMOND') ||
      product.category === 'BRIDAL_COLLECTIONS'
    ).slice(0, 8), [allProducts]
  );

  const newArrivals = useMemo(() => 
    [...allProducts].sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    ).slice(0, 8), [allProducts]
  );

  return (
    <div className="min-h-screen bg-white" data-testid="page-home" style={{ backgroundColor: '#ffffff' }}>
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Category Navigation - Moved to top above hero section */}
      <CategoryNavigation />

      {/* Hero Section */}
      <section className="py-20 bg-white" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Discover jewelry for every
          </h1>
          <h2 className="text-3xl md:text-5xl font-light text-gray-700 mb-8">
            occasion and style
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Exquisite handcrafted jewelry with traditional artistry and modern elegance
          </p>
        </div>
      </section>

      {/* Gold Section */}
      <section className="py-28 surface-gradient relative overflow-hidden" data-testid="section-gold">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.03)_0%,transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <Crown className="h-12 w-12 text-gray-700 mr-6" />
              <h2 className="text-6xl font-bold text-gradient">Gold Collection</h2>
              <Crown className="h-12 w-12 text-gray-700 ml-6" />
            </div>
            <div className="w-32 h-1 premium-gradient mx-auto mb-8 rounded-full"></div>
            <p className="text-3xl text-gray-700 font-light">22K & 18K gold jewelry with intricate designs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {goldProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={selectedCurrency}
              />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="glass-effect border-2 border-gray-300 text-gray-800 hover:text-black px-12 py-4 text-lg rounded-full elegant-shadow-lg transition-all duration-500 hover:scale-110 hover:border-gray-400">
              View All Gold Jewelry <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Silver Section */}
      <section className="py-28 silver-gradient relative overflow-hidden" data-testid="section-silver">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.1)_0%,transparent_50%,rgba(0,0,0,0.02)_100%)]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <Star className="h-12 w-12 text-gray-700 mr-6" />
              <h2 className="text-6xl font-bold text-gradient">Silver Collection</h2>
              <Star className="h-12 w-12 text-gray-700 ml-6" />
            </div>
            <div className="w-32 h-1 premium-gradient mx-auto mb-8 rounded-full"></div>
            <p className="text-3xl text-gray-700 font-light">Sterling silver jewelry with contemporary elegance</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {silverProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={selectedCurrency}
              />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="glass-effect border-2 border-gray-300 text-gray-800 hover:text-black px-12 py-4 text-lg rounded-full elegant-shadow-lg transition-all duration-500 hover:scale-110 hover:border-gray-400">
              View All Silver Jewelry <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Diamond Section */}
      <section className="py-28 surface-gradient relative overflow-hidden" data-testid="section-diamond">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,0,0,0.01)_0deg,transparent_60deg,rgba(0,0,0,0.02)_120deg,transparent_180deg)]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <Gem className="h-12 w-12 text-gray-700 mr-6" />
              <h2 className="text-6xl font-bold text-gradient">Diamond Collection</h2>
              <Gem className="h-12 w-12 text-gray-700 ml-6" />
            </div>
            <div className="w-32 h-1 premium-gradient mx-auto mb-8 rounded-full"></div>
            <p className="text-3xl text-gray-700 font-light">Brilliant diamonds for life's precious moments</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {diamondProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={selectedCurrency}
              />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="glass-effect border-2 border-gray-300 text-gray-800 hover:text-black px-12 py-4 text-lg rounded-full elegant-shadow-lg transition-all duration-500 hover:scale-110 hover:border-gray-400">
              View All Diamond Jewelry <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-28 silver-gradient relative overflow-hidden" data-testid="section-new-arrivals">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-8">
              <Sparkles className="h-12 w-12 text-gray-700 mr-6" />
              <h2 className="text-6xl font-bold text-gradient">New Arrivals</h2>
              <Sparkles className="h-12 w-12 text-gray-700 ml-6" />
            </div>
            <div className="w-32 h-1 premium-gradient mx-auto mb-8 rounded-full"></div>
            <p className="text-3xl text-gray-700 font-light">Latest additions to our exclusive collection</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={selectedCurrency}
              />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" className="glass-effect border-2 border-gray-300 text-gray-800 hover:text-black px-12 py-4 text-lg rounded-full elegant-shadow-lg transition-all duration-500 hover:scale-110 hover:border-gray-400">
              View All New Arrivals <ArrowRight className="ml-4 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* All Products Section with Filters */}
      <section className="py-32 surface-gradient relative overflow-hidden" id="products" data-testid="section-products">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.01)_0px,transparent_2px,transparent_10px,rgba(0,0,0,0.01)_12px)]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <h2 className="text-7xl font-bold text-gradient mb-6">Complete Collection</h2>
            <div className="w-40 h-1 premium-gradient mx-auto mb-10 rounded-full"></div>
            <p className="text-3xl text-gray-700 font-light">Browse our entire jewelry catalog</p>
          </div>

          <div className="lg:flex lg:gap-8">
            <aside className="lg:w-1/4 mb-8 lg:mb-0">
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </aside>

            <main className="lg:w-3/4">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-64 bg-gray-300"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-300 mb-2"></div>
                        <div className="h-4 bg-gray-300 mb-2 w-3/4"></div>
                        <div className="h-6 bg-gray-300"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                      Showing {filteredProducts.length} of {allProducts.length} products
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-products">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currency={selectedCurrency}
                      />
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12" data-testid="empty-products">
                      <div className="text-6xl mb-4">💍</div>
                      <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                      <Button
                        onClick={() => setFilters({})}
                        variant="outline"
                        data-testid="button-clear-filters"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}