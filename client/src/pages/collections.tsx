import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/lib/currency';
import { Product } from '@shared/schema';
import { ProductFilters as IProductFilters } from '@shared/cart-schema';
import ProductCard from '@/components/product-card';
import ProductFilters from '@/components/product-filters';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import { ArrowLeft, Crown, Star, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionsPageProps {
  material?: string;
}

export default function CollectionsPage({ material }: CollectionsPageProps) {
  const [location, setLocation] = useLocation();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('BHD');
  const [filters, setFilters] = useState<IProductFilters>({
    material: material // Set initial filter based on material
  });

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filter products based on current filters
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
      filtered = filtered.filter(product => {
        if (filters.material === 'GOLD') {
          return product.material?.includes('GOLD');
        } else if (filters.material === 'SILVER') {
          return product.material?.includes('SILVER');
        } else if (filters.material === 'DIAMOND') {
          return product.material?.includes('DIAMOND');
        }
        return product.material === filters.material;
      });
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

    // Apply advanced filters
    if (filters.featured) {
      // Use stock and name as criteria for featured items
      filtered = filtered.filter(product => product.stock > 0 || product.name.toLowerCase().includes('featured'));
    }

    if (filters.discount) {
      // Filter for items that might be on sale (can be enhanced with actual discount field)
      filtered = filtered.filter(product => product.name.toLowerCase().includes('sale') || product.name.toLowerCase().includes('discount'));
    }

    if (filters.premium) {
      // Filter for premium items based on price threshold
      filtered = filtered.filter(product => parseFloat(selectedCurrency === 'INR' ? product.priceInr : product.priceBhd) > 50000);
    }

    if (filters.newArrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(product => 
        product.createdAt && new Date(product.createdAt) > thirtyDaysAgo
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
          case 'popular':
            return b.name.localeCompare(a.name); // Can be enhanced with actual popularity metrics
          case 'rating':
            return b.name.localeCompare(a.name); // Can be enhanced with actual rating system
          case 'weight_asc':
            return parseFloat(a.grossWeight || '0') - parseFloat(b.grossWeight || '0');
          case 'weight_desc':
            return parseFloat(b.grossWeight || '0') - parseFloat(a.grossWeight || '0');
          case 'stock':
            return (b.stock || 0) - (a.stock || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [allProducts, filters, selectedCurrency]);

  const getCollectionTitle = () => {
    switch (material) {
      case 'GOLD':
        return 'Gold Collection';
      case 'SILVER':
        return 'Silver Collection';
      case 'DIAMOND':
        return 'Diamond Collection';
      default:
        return 'All Collections';
    }
  };

  const getCollectionIcon = () => {
    switch (material) {
      case 'GOLD':
        return Crown;
      case 'SILVER':
        return Star;
      case 'DIAMOND':
        return Gem;
      default:
        return Crown;
    }
  };

  const IconComponent = getCollectionIcon();

  return (
    <div className="min-h-screen" data-testid="page-collections" style={{ background: 'linear-gradient(135deg, #fdfbf7 0%, #fff9e6 100%)' }}>
      <Header
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />

      {/* Collection Header */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <IconComponent className="h-8 w-8 mr-4" style={{ color: '#b8860b' }} />
              <h1 className="text-3xl md:text-5xl font-bold" style={{ color: '#8b4513' }}>
                {getCollectionTitle()}
              </h1>
              <IconComponent className="h-8 w-8 ml-4" style={{ color: '#b8860b' }} />
            </div>
            <p className="text-xl text-black mb-6">
              Explore our complete {material?.toLowerCase()} jewelry collection
            </p>
          </div>
        </div>
      </section>

      {/* Products Section with Filters */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
                        onClick={() => setFilters({ material })}
                        variant="outline"
                        data-testid="button-clear-filters"
                      >
                        Clear Filters
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