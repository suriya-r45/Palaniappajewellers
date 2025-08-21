import { eq, and, desc } from "drizzle-orm";
import { db } from "../db.js";
import { metalRates } from "@shared/schema.js";

export class MetalRatesService {
  private static readonly MARKET_RATES = {
    salem_tn: {
      gold_22k: 9180,
      gold_24k: 9844,
      gold_18k: 7383
    },
    bahrain: {
      gold_22k: 38.40,
      gold_24k: 41.00,
      gold_18k: 30.75
    }
  };

  static async fetchExchangeRates() {
    try {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      return {
        INR: data.rates.INR || 83.5,
        BHD: data.rates.BHD || 0.376
      };
    } catch {
      return { INR: 83.5, BHD: 0.376 };
    }
  }

  static async upsertRate(rateData: {
    metal: "GOLD" | "SILVER";
    purity: string;
    pricePerGramInr: string;
    pricePerGramBhd: string;
    pricePerGramUsd: string;
    market: "INDIA" | "BAHRAIN";
    source: string;
  }) {
    try {
      const existingRate = await db
        .select()
        .from(metalRates)
        .where(
          and(
            eq(metalRates.metal_type, rateData.metal),
            eq(metalRates.purity, rateData.purity),
            eq(metalRates.market, rateData.market)
          )
        )
        .limit(1);

      if (existingRate.length > 0) {
        await db
          .update(metalRates)
          .set({
            price_per_gram_inr: rateData.pricePerGramInr,
            price_per_gram_bhd: rateData.pricePerGramBhd,
            price_per_gram_usd: rateData.pricePerGramUsd,
            source: rateData.source,
            last_updated: new Date()
          })
          .where(eq(metalRates.id, existingRate[0].id));
      } else {
        await db.insert(metalRates).values({
          metal_type: rateData.metal,
          purity: rateData.purity,
          rate: parseFloat(rateData.pricePerGramInr), // required
          price_per_gram_inr: rateData.pricePerGramInr,
          price_per_gram_bhd: rateData.pricePerGramBhd,
          price_per_gram_usd: rateData.pricePerGramUsd,
          market: rateData.market,
          source: rateData.source,
          last_updated: new Date()
        });
      }
    } catch (error) {
      console.error("Error upserting metal rate:", error);
      throw error;
    }
  }

  static async fetchLiveRates() {
    try {
      console.log("Updating metal rates...");

      const exchangeRates = await this.fetchExchangeRates();

      const updatePromises = [
        // INDIA - Gold 24K
        this.upsertRate({
          metal: "GOLD",
          purity: "24K",
          pricePerGramInr: this.MARKET_RATES.salem_tn.gold_24k.toString(),
          pricePerGramBhd: (this.MARKET_RATES.salem_tn.gold_24k / (exchangeRates.INR / exchangeRates.BHD)).toFixed(2),
          pricePerGramUsd: (this.MARKET_RATES.salem_tn.gold_24k / exchangeRates.INR).toFixed(2),
          market: "INDIA",
          source: "salem-market-data"
        }),
        // INDIA - Gold 22K
        this.upsertRate({
          metal: "GOLD",
          purity: "22K",
          pricePerGramInr: this.MARKET_RATES.salem_tn.gold_22k.toString(),
          pricePerGramBhd: (this.MARKET_RATES.salem_tn.gold_22k / (exchangeRates.INR / exchangeRates.BHD)).toFixed(2),
          pricePerGramUsd: (this.MARKET_RATES.salem_tn.gold_22k / exchangeRates.INR).toFixed(2),
          market: "INDIA",
          source: "salem-market-data"
        }),
        // INDIA - Gold 18K
        this.upsertRate({
          metal: "GOLD",
          purity: "18K",
          pricePerGramInr: this.MARKET_RATES.salem_tn.gold_18k.toString(),
          pricePerGramBhd: (this.MARKET_RATES.salem_tn.gold_18k / (exchangeRates.INR / exchangeRates.BHD)).toFixed(2),
          pricePerGramUsd: (this.MARKET_RATES.salem_tn.gold_18k / exchangeRates.INR).toFixed(2),
          market: "INDIA",
          source: "salem-market-data"
        }),
        // BAHRAIN - Gold 24K
        this.upsertRate({
          metal: "GOLD",
          purity: "24K",
          pricePerGramInr: (this.MARKET_RATES.bahrain.gold_24k * (exchangeRates.INR / exchangeRates.BHD)).toFixed(0),
          pricePerGramBhd: this.MARKET_RATES.bahrain.gold_24k.toString(),
          pricePerGramUsd: (this.MARKET_RATES.bahrain.gold_24k / exchangeRates.BHD).toFixed(2),
          market: "BAHRAIN",
          source: "bahrain-market-data"
        }),
        // BAHRAIN - Gold 22K
        this.upsertRate({
          metal: "GOLD",
          purity: "22K",
          pricePerGramInr: (this.MARKET_RATES.bahrain.gold_22k * (exchangeRates.INR / exchangeRates.BHD)).toFixed(0),
          pricePerGramBhd: this.MARKET_RATES.bahrain.gold_22k.toString(),
          pricePerGramUsd: (this.MARKET_RATES.bahrain.gold_22k / exchangeRates.BHD).toFixed(2),
          market: "BAHRAIN",
          source: "bahrain-market-data"
        }),
        // BAHRAIN - Gold 18K
        this.upsertRate({
          metal: "GOLD",
          purity: "18K",
          pricePerGramInr: (this.MARKET_RATES.bahrain.gold_18k * (exchangeRates.INR / exchangeRates.BHD)).toFixed(0),
          pricePerGramBhd: this.MARKET_RATES.bahrain.gold_18k.toString(),
          pricePerGramUsd: (this.MARKET_RATES.bahrain.gold_18k / exchangeRates.BHD).toFixed(2),
          market: "BAHRAIN",
          source: "bahrain-market-data"
        })
      ];

      await Promise.all(updatePromises);
      console.log("Metal rates updated successfully!");
    } catch (error) {
      console.error("Error fetching live metal rates:", error);
    }
  }

  static async getLatestRates(market?: "INDIA" | "BAHRAIN") {
    try {
      const query = db.select().from(metalRates).orderBy(desc(metalRates.last_updated));
      if (market) query.where(eq(metalRates.market, market));
      return await query;
    } catch (error) {
      console.error("Error fetching metal rates:", error);
      throw error;
    }
  }

  static async initializeRates() {
    try {
      await this.fetchLiveRates();
      console.log("Initial metal rates loaded");
    } catch (error) {
      console.error("Failed to initialize metal rates:", error);
    }
  }

  static startScheduledUpdates() {
    setInterval(async () => {
      await this.fetchLiveRates();
    }, 6 * 60 * 60 * 1000);
    console.log("Metal rates scheduler started (updates every 6 hours)");
  }
}