import Fastify from "fastify";
import { SearchRequestSchema, SearchResponse } from "./types/search";

const PORT = 3000;

const server = Fastify({
  logger: true,
});

server.get("/health", async () => {
  return { status: "ok" };
});

server.post<{ Body: unknown }>("/v1/search", async (request, response) => {
  // Validate the request body
  const validation = SearchRequestSchema.safeParse(request.body);

  if (!validation.success) {
    return response.status(400).send({
      error: "Invalid data",
      details: validation.error.message,
    });
  }

  const { query, stores } = validation.data;

  // At now, return mocked data
  const mockResults: SearchResponse = {
    query,
    results: [
      {
        store: "mercadolivre",
        title: `${query} - Produto de exemplo`,
        price: 1299.99,
        shipping: 0,
        url: "https://mercadolivre.com.br/exemplo",
      },
      {
        store: "mercadolivre",
        title: `${query} - Outro exemplo`,
        price: 1499.99,
        shipping: 15.9,
        url: "https://mercadolivre.com.br/exemplo2",
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return mockResults;
});

const start = async () => {
  try {
    await server.listen({ port: PORT });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
