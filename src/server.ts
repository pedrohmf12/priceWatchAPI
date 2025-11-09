import Fastify from "fastify";
import { searchRoutes } from "./routes/search.routes.js";

const server = Fastify({
  logger: true,
});

// Health check
server.get("/health", async () => {
  return { status: "ok" };
});

// Registra as rotas
await server.register(searchRoutes);

// Iniciar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
