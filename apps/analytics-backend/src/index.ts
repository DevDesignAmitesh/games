import { redisManager } from "@repo/redis/redis";

async function main() {
  const data = await redisManager.pop("analytics_worker");

  console.log("data from queue", data);

  if (!data) {
  } else {
    // update db like below (mostly)
    /**
     *
     * await prisma.analytics.upsert({
     *
     * where: { totalUsers: data.totalUsers },
     * create: { totalUsers: data.totalUsers },
     * update: { totalUsers: data.totalUsers }
     *
     * })
     */
  }
}

setInterval(main, 3000);
