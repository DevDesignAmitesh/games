import Redis from "ioredis";

const redis = new Redis();

const deleteKeysByPattern = (pattern: string) => {
    return new Promise<void>((resolve, reject) => {
        const stream = redis.scanStream({
            match: pattern
        });
        stream.on("data", (keys: string[]) => {
            if (keys.length) {
                const pipeline = redis.pipeline();
                keys.forEach((key) => {
                    pipeline.del(key);
                });
                pipeline.exec();
            }
        });
        stream.on("end", () => {
            resolve();
        });
        stream.on("error", (e) => {
            reject(e);
        });
    });
};

// "bull" is queue prefix (default), "example" is the name of queue
deleteKeysByPattern("bodmas:game:*").then(() => process.exit(0))