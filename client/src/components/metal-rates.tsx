import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Clock, MapPin, Crown, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

export function MetalRatesDisplay() {
  const { data: rates, isLoading, error } = useQuery<MetalRate[]>({
    queryKey: ["/api/metal-rates"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-gradient">Live Metal Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading live rates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !rates) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-gradient">Live Metal Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-8">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Unable to load metal rates</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group rates by market and metal
  const groupedRates = rates.reduce((acc, rate) => {
    const key = `${rate.market}-${rate.metal}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(rate);
    return acc;
  }, {} as Record<string, MetalRate[]>);

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    if (currency === 'BHD') {
      return `${num.toFixed(3)} BHD`;
    } else if (currency === 'INR') {
      return `₹${num.toFixed(0)}`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const getLastUpdated = (rates: MetalRate[]) => {
    const mostRecent = rates.reduce((latest, rate) => {
      return new Date(rate.lastUpdated) > new Date(latest.lastUpdated) ? rate : latest;
    });
    return mostRecent.lastUpdated;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Object.entries(groupedRates).map(([key, metalRates]) => {
        const [market, metal] = key.split('-');
        const lastUpdated = getLastUpdated(metalRates);
        
        return (
          <div key={key} className="metal-rates-card">
            <div className="p-6 bg-gradient-to-br from-purple-50/80 to-amber-50/80 dark:from-purple-950/80 dark:to-amber-950/80 border-b border-gold/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full premium-gradient float-animation">
                    {metal === 'GOLD' ? (
                      <Crown className="h-6 w-6 text-white" />
                    ) : (
                      <Star className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gradient">
                      {metal === 'GOLD' ? '🥇 Gold Rates' : '🥈 Silver Rates'}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {market} Market
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="glass-effect border-gold/30 text-gold">
                    LIVE
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {metalRates
                .sort((a, b) => {
                  if (metal === 'GOLD') {
                    const purityOrder = { '24K': 0, '22K': 1, '18K': 2 };
                    return (purityOrder[a.purity as keyof typeof purityOrder] || 999) - 
                           (purityOrder[b.purity as keyof typeof purityOrder] || 999);
                  }
                  return a.purity.localeCompare(b.purity);
                })
                .map((rate) => (
                  <div key={rate.id} className="luxury-card p-5 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gradient">{rate.purity}</h4>
                      <Badge variant="secondary" className="premium-gradient text-white text-xs pulse-gold">
                        LIVE
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Indian Rupees</p>
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 shimmer">
                            ₹{parseFloat(rate.pricePerGramInr).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">per gram</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Bahraini Dinar</p>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 shimmer">
                            {parseFloat(rate.pricePerGramBhd).toFixed(3)} BD
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">per gram</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        USD: ${parseFloat(rate.pricePerGramUsd).toFixed(2)} per gram
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="px-6 pb-6">
              <div className="text-xs text-muted-foreground text-center pt-4 border-t border-gold/20 space-y-1">
                <p className="font-medium">✨ Market rates as of August 19, 2025</p>
                <p>Prices may vary based on market conditions and purity verification</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}