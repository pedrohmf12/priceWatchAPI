import type { FastifyRequest, FastifyReply } from "fastify";
import { SearchRequestSchema, type SearchResponse } from "../types/search.js";
import { SearchService } from "../services/search.service.js";

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * POST /v1/search
   */
  async search(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<SearchResponse> {
    // Valida o body
    const validation = SearchRequestSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        error: "Dados inválidos",
        details: validation.error.message,
      });
    }

    const { query, stores } = validation.data;

    // Chama o service
    const results = await this.searchService.searchProducts(query, stores);

    const response: SearchResponse = {
      query,
      results,
      timestamp: new Date().toISOString(),
    };

    return response;
  }
}
