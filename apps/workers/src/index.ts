import { prisma } from "@repo/db/db";
import { redisManager } from "@repo/redis/redis";

async function main() {
  const response = await redisManager.pop("bodmas:game");

  if (!response) {
    console.log("nothing");
    return;
  }

  const { acceptedBy, createdBy, gameId } = JSON.parse(response);

  const [acceptor, creator, bodmasGame] = await Promise.all([
    prisma.user.findFirst({
      where: { id: acceptedBy },
    }),
    prisma.user.findFirst({
      where: { id: createdBy },
    }),
    prisma.bodmasGame.findFirst({
      where: { id: gameId },
    }),
  ]);

  if (!bodmasGame || !acceptor || !creator) return;

  prisma.$transaction(async (tx) => {
    await tx.bodmasGamePlayer.create({
      data: {
        userId: acceptor.id,
        bodmasGameId: bodmasGame.id,
      },
    });

    await tx.bodmasGame.update({
      where: { id: bodmasGame.id },
      data: { status: "IN_PROGRESS", startTime: new Date() },
    });

    await tx.user.update({
      where: { id: acceptor.id },
      data: { status: "PLAYING" },
    });

    await tx.user.update({
      where: { id: creator.id },
      data: { status: "PLAYING" },
    });
  });
}

setInterval(main, 3000);
