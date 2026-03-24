import { redisManager } from "@repo/redis/redis";

async function main() {
  while (true) {
    const data = await redisManager.pop("analytics_worker");

    if (!data) return;

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


main();