import cron from "node-cron";
import { prisma } from "@/db/prisma";

// 每天凌晨 1 点运行清理任务
cron.schedule("0 1 * * *", async () => {
  try {
    console.log("Starting token cleanup job...");

    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // 删除所有过期的 Refresh Token
        },
      },
    });

    console.log(`Cleanup job completed. Deleted ${result.count} expired tokens.`);
  } catch (error) {
    console.error("Error during token cleanup job:", error);
  }
});
