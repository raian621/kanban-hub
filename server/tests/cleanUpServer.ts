import { ServerKit } from "../src/createServer";

export default async function cleanUpServer(serverKit:ServerKit) {
  const { server, prisma, prismaSessionStore } = serverKit;

  server.close();
  await prismaSessionStore.shutdown();
  await prisma.$disconnect();
}