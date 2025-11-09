import { searchMercadoLivre } from "../adapters/mercadolivre.js";
import type { ProductResult } from "../types/search.js";

export class SearchService {
  /**
   * Busca produtos em marketplaces
   */
  async searchProducts(
    query: string,
    stores?: string[]
  ): Promise<ProductResult[]> {
    const results: ProductResult[] = [];

    // Por enquanto só Mercado Livre
    // Depois adicionamos Amazon, Shopee, etc
    const shouldSearchML = !stores || stores.includes("mercadolivre");

    if (shouldSearchML) {
      const mlResults = await searchMercadoLivre(query);
      results.push(...mlResults);
    }

    // Futuramente:
    // if (shouldSearchAmazon) { ... }
    // if (shouldSearchShopee) { ... }

    return results;
  }
}
