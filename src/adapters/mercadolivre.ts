import * as cheerio from "cheerio";
import type { ProductResult } from "../types/search.js";
import { fetchWithRetry } from "../utils/http.js";

export async function searchMercadoLivre(
  query: string
): Promise<ProductResult[]> {
  try {
    const searchUrl = `https://lista.mercadolivre.com.br/${encodeURIComponent(
      query
    )}`;

    console.log("🔍 Buscando no Mercado Livre:", query);

    // Agora usa a função robusta com retry
    const html = await fetchWithRetry(
      searchUrl,
      {},
      {
        maxRetries: 3,
        baseDelay: 1000,
        timeout: 15000,
      }
    );

    console.log("📄 HTML recebido:", html.length, "caracteres");

    const $ = cheerio.load(html);

    const results: ProductResult[] = [];

    $(".ui-search-layout__item").each((index, element) => {
      const title = $(element)
        .find(".poly-component__title-wrapper")
        .text()
        .trim();

      // Pega o preço atual (não o riscado)
      const priceText = $(element)
        .find(".poly-component__price .andes-money-amount__fraction")
        .first()
        .text()
        .trim();

      const url = $(element).find(".poly-component__title").attr("href") || "";

      const price =
        parseFloat(priceText.replace(/\./g, "").replace(",", ".")) || 0;

      const hasFreeShipping = $(element)
        .find(".poly-component__shipping")
        .text()
        .includes("grátis");

      if (title && price > 0) {
        results.push({
          store: "mercadolivre",
          title,
          price,
          shipping: hasFreeShipping ? 0 : -1,
          url,
        });
      }
    });

    console.log("✅ Produtos extraídos:", results.length);
    return results.slice(0, 10);
  } catch (error) {
    console.error("❌ Erro ao buscar no Mercado Livre:", error);
    return [];
  }
}
