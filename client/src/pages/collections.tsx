import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/lib/currency';
import { Product } from '@shared/schema';
import { ProductFilters as IProductFilters } from '@shared/cart-schema';
import ProductCard from '@/components/product-card';

import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import Header from '@/components/header';
import Footer from '@/components/footer';
import WhatsAppFloat from '@/components/whatsapp-float';
import { ArrowLeft, Crown, Star, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionsPageProps {
  material?: string;
  category?: string;
}

// Categories from admin product form - same as in mobile-bottom-nav.tsx  
const HOME_CATEGORIES = {
  'rings': { name: 'Rings', subcategories: ['Engagement Rings', 'Wedding Bands', 'Fashion Rings', 'Cocktail Rings', 'Promise Rings', 'Birthstone Rings'] },
  'necklaces': { name: 'Necklaces', subcategories: ['Chains', 'Chokers', 'Lockets', 'Beaded Necklaces', 'Collars', 'Long Necklaces/Opera Chains', 'Multi-layered Necklaces'] },
  'pendants': { name: 'Pendants', subcategories: ['Solitaire', 'Halo', 'Cluster', 'Heart', 'Cross', 'Initial', 'Diamond', 'Gemstone', 'Pearl', 'Bridal', 'Minimalist', 'Traditional'] },
  'earrings': { name: 'Earrings', subcategories: ['Stud Earrings', 'Hoop Earrings', 'Drop Earrings', 'Dangle Earrings', 'Ear Cuffs', 'Huggie Earrings'] },
  'bracelets': { name: 'Bracelets', subcategories: ['Cuff', 'Tennis', 'Charm', 'Chain', 'Beaded', 'Link', 'Bolo', 'Leather', 'Diamond', 'Gemstone', 'Pearl', 'Bridal', 'Minimalist', 'Traditional'] },
  'bangles': { name: 'Bangles', subcategories: ['Classic', 'Kada', 'Cuff', 'Openable', 'Adjustable', 'Charm', 'Diamond', 'Gemstone', 'Pearl', 'Bridal', 'Minimalist', 'Traditional', 'Temple', 'Kundan', 'Polki', 'Navratna'] },
  'watches': { name: 'Watches', subcategories: ["Men's Watches", "Women's Watches", 'Smartwatches', 'Luxury Watches', 'Sport Watches'] },
  'mens': { name: "Men's Jewellery", subcategories: ['Rings', 'Bracelets', 'Necklaces', 'Cufflinks', 'Tie Clips'] },
  'children': { name: "Children's Jewellery", subcategories: ["Kids' Rings", "Kids' Necklaces", "Kids' Earrings", "Kids' Bracelets"] }
};

export default function CollectionsPage({ material, category }: CollectionsPageProps) {
  const [location, setLocation] = useLocation();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('BHD');
  const [filters, setFilters] = useState<IProductFilters>({
    material: material, // Set initial filter based on material
    category: category // Set initial filter based on category
  });
  const [sortBy, setSortBy] = useState<string>('latest');
  const [selectedMobileFilters, setSelectedMobileFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dynamic items per page based on screen size
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280 ? 15 : 6; // Desktop: 5x3=15, Mobile: 3x2=6
    }
    return 15;
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Update items per page on window resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const newItemsPerPage = getItemsPerPage();
        if (newItemsPerPage !== itemsPerPage) {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1); // Reset to first page when changing layout
        }
      };
      
      // Set initial value
      setItemsPerPage(getItemsPerPage());
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [itemsPerPage]);

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filter and sort products based on current filters
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

    // Apply category filter from mobile nav
    if (filters.category && filters.category !== 'ALL_CATEGORIES') {
      // If the selected category is a subcategory (not a main category), filter by subcategory
      const isMainCategory = Object.keys(HOME_CATEGORIES).some(key => 
        key.toLowerCase() === filters.category?.toLowerCase()
      );
      
      if (isMainCategory) {
        // Filter by main category
        filtered = filtered.filter(product => 
          product.category?.toLowerCase() === filters.category?.toLowerCase()
        );
      } else {
        // Filter by subcategory, but also ensure we're in the right main category context
        filtered = filtered.filter(product => {
          // If we have a current main category context, respect it
          if (category) {
            return product.category?.toLowerCase() === category.toLowerCase() && 
                   product.subCategory?.toLowerCase() === filters.category?.toLowerCase();
          }
          // Otherwise just filter by subcategory
          return product.subCategory?.toLowerCase() === filters.category?.toLowerCase();
        });
      }
    }

    // Apply mobile filters
    if (selectedMobileFilters.length > 0) {
      filtered = filtered.filter(product => {
        // Check material filters
        const materialFilters = selectedMobileFilters.filter(f => 
          ['Diamond', 'Gold', 'Gemstone', 'Uncut Diamond', 'Platinum', 'Silver', 'Gold Coins', 'Pearl'].includes(f)
        );
        if (materialFilters.length > 0) {
          const hasMatchingMaterial = materialFilters.some(mat => {
            const productMaterial = product.material?.toLowerCase() || '';
            const productCategory = product.category?.toLowerCase() || '';
            const materialLower = mat.toLowerCase();
            
            // Map filter to product material/category
            if (materialLower === 'gold' && (productMaterial.includes('gold') || productCategory.includes('gold'))) return true;
            if (materialLower === 'silver' && (productMaterial.includes('silver') || productCategory.includes('silver'))) return true;
            if (materialLower === 'diamond' && (productMaterial.includes('diamond') || productCategory.includes('diamond'))) return true;
            if (materialLower === 'platinum' && (productMaterial.includes('platinum') || productCategory.includes('platinum'))) return true;
            if (materialLower === 'pearl' && (productMaterial.includes('pearl') || productCategory.includes('pearl'))) return true;
            if (materialLower === 'gemstone' && (productMaterial.includes('gemstone') || productCategory.includes('gemstone'))) return true;
            
            return productMaterial.includes(materialLower) || productCategory.includes(materialLower);
          });
          if (!hasMatchingMaterial) return false;
        }

        // Check price range filters
        const priceFilters = selectedMobileFilters.filter(f => f.includes('₹'));
        if (priceFilters.length > 0) {
          const price = parseFloat(product.priceInr);
          const hasMatchingPrice = priceFilters.some(range => {
            if (range === '₹5000 - ₹10000') return price >= 5000 && price <= 10000;
            if (range === '₹10000 - ₹20000') return price >= 10000 && price <= 20000;
            if (range === '₹20000 - ₹50000') return price >= 20000 && price <= 50000;
            if (range === '₹50000 - ₹100000') return price >= 50000 && price <= 100000;
            if (range === '₹100000+') return price >= 100000;
            return false;
          });
          if (!hasMatchingPrice) return false;
        }

        // Check weight filters
        const weightFilters = selectedMobileFilters.filter(f => f.includes('g'));
        if (weightFilters.length > 0) {
          const weight = parseFloat(product.grossWeight || '0');
          const hasMatchingWeight = weightFilters.some(range => {
            if (range === 'Under 5g') return weight < 5;
            if (range === '5g - 10g') return weight >= 5 && weight <= 10;
            if (range === '10g - 20g') return weight >= 10 && weight <= 20;
            if (range === 'Above 20g') return weight > 20;
            return false;
          });
          if (!hasMatchingWeight) return false;
        }

        return true;
      });
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
            return a.name.localeCompare(b.name); // Can be enhanced with actual rating logic
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

    // Apply mobile sorting
    if (sortBy && sortBy !== 'latest') {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return parseFloat(selectedCurrency === 'INR' ? a.priceInr : a.priceBhd) -
              parseFloat(selectedCurrency === 'INR' ? b.priceInr : b.priceBhd);
          case 'price_desc':
            return parseFloat(selectedCurrency === 'INR' ? b.priceInr : b.priceBhd) -
              parseFloat(selectedCurrency === 'INR' ? a.priceInr : a.priceBhd);
          case 'discount':
            return a.name.localeCompare(b.name);
          case 'featured':
            return b.stock - a.stock;
          case 'rating':
            return a.name.localeCompare(b.name);
          case 'latest':
          default:
            return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
        }
      });
    }

    return filtered;
  }, [allProducts, filters, selectedCurrency, sortBy, selectedMobileFilters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

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

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-0.5 sm:px-4">
          <div className="w-full">
            {/* Products Section */}
            <div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6 items-start">
                  {[...Array(itemsPerPage)].map((_, i) => (
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
                      Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </p>
                    <p className="text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-0.5 sm:gap-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6 items-start" data-testid="grid-products">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currency={selectedCurrency}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2"
                      >
                        Previous
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10 h-10"
                            style={currentPage === page ? {
                              background: 'linear-gradient(135deg, #881337 0%, #7f1d1d 100%)',
                              color: 'white'
                            } : {}}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2"
                      >
                        Next
                      </Button>
                    </div>
                  )}

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12" data-testid="empty-products">
                      <div className="text-6xl mb-4">💍</div>
                      <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                      <Button
                        onClick={() => {
                          setFilters({ material });
                          setCurrentPage(1);
                        }}
                        variant="outline"
                        data-testid="button-clear-filters"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        onCategorySelect={(category) => {
          setFilters({ ...filters, category });
          setCurrentPage(1);
        }}
        onSortChange={(sort) => {
          setSortBy(sort);
          setCurrentPage(1);
        }}
        onFilterChange={(selectedFilters) => {
          setSelectedMobileFilters(selectedFilters);
          setCurrentPage(1);
        }}
        activeFilters={selectedMobileFilters.length + Object.keys(filters).filter(key => {
          const value = filters[key as keyof IProductFilters];
          return value !== undefined && value !== '' && value !== 'ALL_CATEGORIES' && 
                 value !== 'ALL_MATERIALS' && value !== 'DEFAULT_SORT';
        }).length}
        sortBy={sortBy}
        currentMainCategory={category}
      />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}