import type { FastifyInstance } from "fastify";
import { SearchController } from "../controllers/search.controller.js";

export async function searchRoutes(server: FastifyInstance) {
  const searchController = new SearchController();

  // POST /v1/search
  server.post("/v1/search", {
    handler: searchController.search.bind(searchController),
  });
}
