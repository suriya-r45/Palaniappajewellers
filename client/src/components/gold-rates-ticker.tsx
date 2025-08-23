import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetalRate {
  id: string;
  metal: "GOLD" | "SILVER";
  purity: string;
  pricePerGramInr: string;
  pricePerGramBhd: string;
  pricePerGramUsd: string;
  market: "INDIA" | "BAHRAIN";
  source: string;
  lastUpdated: string;
}

export default function GoldRatesTicker() {
  const { data: rates = [], isLoading } = useQuery<MetalRate[]>({
    queryKey: ['/api/metal-rates'],
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  if (isLoading || rates.length === 0) {
    return (
      <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-2 overflow-hidden relative" data-testid="ticker-gold-rates">
        <div className="animate-pulse text-center py-1">
          <span className="text-sm font-medium">Loading live metal rates...</span>
        </div>
      </div>
    );
  }

  // Group rates by market and metal for display
  const chennaiGold22K = rates.find(r => r.market === 'INDIA' && r.metal === 'GOLD' && r.purity === '22K');
  const chennaiGold18K = rates.find(r => r.market === 'INDIA' && r.metal === 'GOLD' && r.purity === '18K');
  const chennaiSilver = rates.find(r => r.market === 'INDIA' && r.metal === 'SILVER');
  const bahrainGold22K = rates.find(r => r.market === 'BAHRAIN' && r.metal === 'GOLD' && r.purity === '22K');
  const bahrainGold18K = rates.find(r => r.market === 'BAHRAIN' && r.metal === 'GOLD' && r.purity === '18K');
  const bahrainSilver = rates.find(r => r.market === 'BAHRAIN' && r.metal === 'SILVER');

  const lastUpdateTime = rates.length > 0 ? new Date(rates[0].lastUpdated).toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '';

  const tickerItems = [
    // Chennai (India) Rates
    { 
      label: 'Chennai Gold 22K', 
      price: chennaiGold22K ? parseFloat(chennaiGold22K.pricePerGramInr) : 0, 
      unit: '₹/g', 
      trend: 'up',
      market: 'Chennai'
    },
    { 
      label: 'Chennai Gold 18K', 
      price: chennaiGold18K ? parseFloat(chennaiGold18K.pricePerGramInr) : 0, 
      unit: '₹/g', 
      trend: 'up',
      market: 'Chennai'
    },
    { 
      label: 'Chennai Silver', 
      price: chennaiSilver ? parseFloat(chennaiSilver.pricePerGramInr) : 0, 
      unit: '₹/g', 
      trend: 'up',
      market: 'Chennai'
    },
    // Bahrain Rates
    { 
      label: 'Bahrain Gold 22K', 
      price: bahrainGold22K ? parseFloat(bahrainGold22K.pricePerGramBhd) : 0, 
      unit: 'BHD/g', 
      trend: 'up',
      market: 'Bahrain'
    },
    { 
      label: 'Bahrain Gold 18K', 
      price: bahrainGold18K ? parseFloat(bahrainGold18K.pricePerGramBhd) : 0, 
      unit: 'BHD/g', 
      trend: 'up',
      market: 'Bahrain'
    },
    { 
      label: 'Bahrain Silver', 
      price: bahrainSilver ? parseFloat(bahrainSilver.pricePerGramBhd) : 0, 
      unit: 'BHD/g', 
      trend: 'up',
      market: 'Bahrain'
    },
    { 
      label: 'Last Updated', 
      price: lastUpdateTime, 
      unit: '', 
      trend: null,
      market: ''
    }
  ];

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-2 overflow-hidden relative border-b border-yellow-500" data-testid="ticker-gold-rates">
      <div className="animate-scroll whitespace-nowrap">
        <div className="inline-flex items-center space-x-8">
          {tickerItems.map((item, index) => (
            <div key={index} className="inline-flex items-center space-x-2 min-w-max">
              <span className="font-semibold text-sm">{item.label}:</span>
              <span className="font-bold text-sm">
                {typeof item.price === 'number' && item.price > 0 ? 
                  (item.unit.includes('BHD') ? item.price.toFixed(3) : item.price.toFixed(0)) : 
                  item.price
                }
              </span>
              <span className="text-xs opacity-90">{item.unit}</span>
              {item.trend && (
                <div className="inline-flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-300" />
                </div>
              )}
            </div>
          ))}
          {/* Duplicate items for seamless scrolling */}
          {tickerItems.map((item, index) => (
            <div key={`dup-${index}`} className="inline-flex items-center space-x-2 min-w-max">
              <span className="font-semibold text-sm">{item.label}:</span>
              <span className="font-bold text-sm">
                {typeof item.price === 'number' && item.price > 0 ? 
                  (item.unit.includes('BHD') ? item.price.toFixed(3) : item.price.toFixed(0)) : 
                  item.price
                }
              </span>
              <span className="text-xs opacity-90">{item.unit}</span>
              {item.trend && (
                <div className="inline-flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}