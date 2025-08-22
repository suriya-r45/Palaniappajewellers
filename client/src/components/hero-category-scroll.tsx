import { Crown, Star, Heart, Gem, Watch } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

const heroCategories: CategoryItem[] = [
  { id: 'bangle', name: 'Bangle', icon: Heart, color: '#FFD700' },
  { id: 'earring', name: 'Earring', icon: Star, color: '#87CEEB' },
  { id: 'mangalsutra', name: 'Mangalsutra', icon: Gem, color: '#FFB6C1' },
  { id: 'platinum', name: 'Platinum', icon: Crown, color: '#4169E1' },
  { id: 'gold-chain', name: 'Gold Chain', icon: Watch, color: '#FFA07A' },
];

export default function HeroCategoryScroll() {
  const handleCategoryClick = (categoryId: string) => {
    console.log('Navigate to category:', categoryId);
    // Add navigation logic here
  };

  return (
    <section className="py-4 md:py-6 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div 
          className="overflow-x-auto overflow-y-hidden"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            direction: 'rtl'
          }}
        >
          <div className="flex space-x-4 md:space-x-6 pb-2" style={{ width: 'max-content', direction: 'ltr' }}>
            {heroCategories.map((category) => {
              const IconComponent = category.icon;
              
              return (
                <div
                  key={category.id}
                  className="flex flex-col items-center cursor-pointer group flex-shrink-0"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent 
                      className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-sm" 
                    />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-gray-700 text-center group-hover:text-gray-900 transition-colors">
                    {category.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}