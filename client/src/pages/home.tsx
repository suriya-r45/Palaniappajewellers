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

  // Get category-specific products based on actual saved data with exclusive filtering
  const goldProducts = useMemo(() => 
    allProducts.filter(product => {
      // Only show in gold section if specifically gold-related
      const isGoldMaterial = product.material?.includes('GOLD');
      const isGoldSubCategory = product.subCategory === 'Gold Jewellery';
      const isDiamondSubCategory = product.subCategory === 'Diamond Jewellery';
      
      // Exclude if it's specifically diamond jewelry
      if (isDiamondSubCategory) return false;
      
      return isGoldMaterial || isGoldSubCategory ||
        (product.category === 'rings' && isGoldMaterial) ||
        (product.category === 'necklaces' && isGoldMaterial);
    }).slice(0, 4), [allProducts]
  );

  const silverProducts = useMemo(() => 
    allProducts.filter(product => {
      const isSilverMaterial = product.material?.includes('SILVER');
      const isSilverSubCategory = product.subCategory === 'Silver Jewellery';
      
      return isSilverMaterial || isSilverSubCategory;
    }).slice(0, 4), [allProducts]
  );

  const diamondProducts = useMemo(() => 
    allProducts.filter(product => {
      // Only show in diamond section if specifically diamond-related
      const isDiamondMaterial = product.material?.includes('DIAMOND');
      const isDiamondSubCategory = product.subCategory === 'Diamond Jewellery';
      const isBridalCollection = product.subCategory === 'Bridal Collection';
      
      return isDiamondMaterial || isDiamondSubCategory || isBridalCollection;
    }).slice(0, 4), [allProducts]
  );


  return (
    <div className="min-h-screen" data-testid="page-home" style={{ background: 'linear-gradient(135deg, #fdfbf7 0%, #fff9e6 100%)' }}>
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />

      {/* Category Navigation - Moved to top above hero section */}
      <CategoryNavigation />



      {/* Gold Section */}
      <section className="py-16" data-testid="section-gold" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
              <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Gold Collection</h2>
              <Crown className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
            </div>
            <p className="text-xl text-black">22K & 18K gold jewelry with intricate designs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
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
            <Button variant="outline" className="border-2 px-8 py-3 text-lg" style={{ borderColor: '#b8860b', color: '#8b4513' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8860b'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b4513'; }}>
              View All Gold Jewelry <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="h-px bg-black"></div>

      {/* Silver Section */}
      <section className="py-16" data-testid="section-silver" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Star className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
              <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Silver Collection</h2>
              <Star className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
            </div>
            <p className="text-xl text-black">Sterling silver jewelry with contemporary elegance</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
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
            <Button variant="outline" className="border-2 px-8 py-3 text-lg" style={{ borderColor: '#b8860b', color: '#8b4513' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8860b'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b4513'; }}>
              View All Silver Jewelry <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="h-px bg-black"></div>

      {/* Diamond Section */}
      <section className="py-16" data-testid="section-diamond" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Gem className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
              <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#8b4513' }}>Diamond Collection</h2>
              <Gem className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
            </div>
            <p className="text-xl text-black">Brilliant diamonds for life's precious moments</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
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
            <Button variant="outline" className="border-2 px-8 py-3 text-lg" style={{ borderColor: '#b8860b', color: '#8b4513' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b8860b'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8b4513'; }}>
              View All Diamond Jewelry <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* All Products Section with Filters */}
      <section className="py-16 bg-white" id="products" data-testid="section-products">
        <div className="container mx-auto px-4">
          {/* <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-6">Complete Collection</h2>
          </div> */}

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