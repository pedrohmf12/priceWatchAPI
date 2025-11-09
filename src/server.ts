import Fastify from "fastify";

const PORT = 3000;

const server = Fastify({
  logger: true,
});

server.get("/health", async () => {
  return { status: "ok" };
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
