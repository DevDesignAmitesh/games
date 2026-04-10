import cluster from "cluster";
import os from "os";
import { app } from ".";

const PORT = 4000;
const cpusLength = os.cpus().length

if (cluster.isPrimary) {
  for (let i = 0; i <= cpusLength; i++) {
    cluster.fork();
  }
  cluster.on("exit", () => cluster.fork());
} else {
  app.listen(PORT, "0.0.0.0", () => console.log("code is running at ", PORT));
}