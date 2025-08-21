import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Ring category SVG components
const BandRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="20" fill="none" stroke="#D4AF37" strokeWidth="8" />
    <circle cx="30" cy="30" r="15" fill="none" stroke="#FFD700" strokeWidth="2" />
  </svg>
);

const SingleStoneRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="18" fill="none" stroke="#D4AF37" strokeWidth="6" />
    <polygon points="30,15 35,25 25,25" fill="#FF69B4" stroke="#C41E3A" strokeWidth="1" />
    <circle cx="30" cy="30" r="3" fill="#FF1493" />
  </svg>
);

const TwoHeadedRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="18" fill="none" stroke="#D4AF37" strokeWidth="6" />
    <polygon points="25,18 30,25 20,25" fill="#40E0D0" stroke="#008B8B" strokeWidth="1" />
    <polygon points="35,18 40,25 35,25" fill="#40E0D0" stroke="#008B8B" strokeWidth="1" />
  </svg>
);

const EternityRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="18" fill="none" stroke="#D4AF37" strokeWidth="6" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const x = 30 + 12 * Math.cos((angle * Math.PI) / 180);
      const y = 30 + 12 * Math.sin((angle * Math.PI) / 180);
      return <circle key={i} cx={x} cy={y} r="2" fill="#FF1493" />;
    })}
  </svg>
);

const CasualRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="16" fill="none" stroke="#D4AF37" strokeWidth="4" />
    <circle cx="30" cy="22" r="4" fill="#87CEEB" stroke="#4682B4" strokeWidth="1" />
  </svg>
);

const CocktailRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <circle cx="30" cy="30" r="20" fill="none" stroke="#D4AF37" strokeWidth="8" />
    <circle cx="30" cy="22" r="8" fill="#9370DB" stroke="#4B0082" strokeWidth="2" />
    <circle cx="25" cy="28" r="3" fill="#FF69B4" />
    <circle cx="35" cy="28" r="3" fill="#FF69B4" />
  </svg>
);

const BroadRing = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full">
    <ellipse cx="30" cy="30" rx="20" ry="15" fill="none" stroke="#D4AF37" strokeWidth="12" />
    <ellipse cx="30" cy="30" rx="18" ry="13" fill="#FFD700" opacity="0.3" />
  </svg>
);

const ringCategories = [
  // Shop By Style
  {
    section: 'Shop By Style',
    items: [
      { name: 'Bands', image: BandRing },
      { name: 'Single Stone', image: SingleStoneRing },
      { name: 'Two Headed', image: TwoHeadedRing },
      { name: 'Eternity', image: EternityRing }
    ]
  },
  // Wearing Type  
  {
    section: 'Wearing Type',
    items: [
      { name: 'Casual', image: CasualRing },
      { name: 'Cocktail', image: CocktailRing },
      { name: 'Broad Rings', image: BroadRing },
      { name: 'Daily Wear', image: BandRing },
      { name: 'Office Wear', image: SingleStoneRing },
      { name: 'Casual Wear', image: CasualRing },
      { name: 'Party Wear', image: CocktailRing }
    ]
  },
  // Shop By Metal
  {
    section: 'Shop By Metal',
    items: [
      { name: 'Yellow Gold', image: () => <BandRing /> },
      { name: 'Rose Gold', image: () => (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <circle cx="30" cy="30" r="20" fill="none" stroke="#E91E63" strokeWidth="8" />
          <circle cx="30" cy="30" r="15" fill="none" stroke="#F8BBD9" strokeWidth="2" />
        </svg>
      ) },
      { name: 'Two Tone', image: () => (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <path d="M 10 30 A 20 20 0 0 1 50 30" fill="none" stroke="#D4AF37" strokeWidth="8" />
          <path d="M 50 30 A 20 20 0 0 1 10 30" fill="none" stroke="#E91E63" strokeWidth="8" />
        </svg>
      ) },
      { name: 'Three Tone', image: () => (
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <path d="M 10 30 A 20 20 0 0 1 30 10" fill="none" stroke="#D4AF37" strokeWidth="8" />
          <path d="M 30 10 A 20 20 0 0 1 50 30" fill="none" stroke="#E91E63" strokeWidth="8" />
          <path d="M 50 30 A 20 20 0 0 1 10 30" fill="none" stroke="#C0C0C0" strokeWidth="8" />
        </svg>
      ) }
    ]
  }
];

export default function RingsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('Shop By Style');

  const handleItemClick = (itemName: string) => {
    // Scroll to products section and filter by ring type
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    console.log('Filter by ring type:', itemName);
  };

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-rose-50 to-pink-50" data-testid="rings-showcase">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Rings Collection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of rings, from elegant bands to statement pieces
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {ringCategories.map((category) => (
            <Button
              key={category.section}
              variant={selectedCategory === category.section ? "default" : "outline"}
              className={`
                ${selectedCategory === category.section 
                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                  : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                }
              `}
              onClick={() => setSelectedCategory(category.section)}
            >
              {category.section}
            </Button>
          ))}
        </div>

        {/* Ring Categories Grid */}
        {ringCategories.map((category) => (
          selectedCategory === category.section && (
            <div key={category.section} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {category.items.map((item, index) => {
                const ImageComponent = item.image;
                return (
                  <Card 
                    key={index}
                    className="card-hover cursor-pointer border-rose-100 hover:border-rose-300 transition-all duration-300 hover:shadow-lg"
                    onClick={() => handleItemClick(item.name)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center shadow-md p-2">
                          <ImageComponent />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        ))}
      </div>
    </section>
  );
}