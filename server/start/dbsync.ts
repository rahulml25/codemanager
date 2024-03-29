import { MongoClient } from "mongodb";
import { exec } from "child_process";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly MONGO_MAIN_SERVER_URL: string;
      readonly MONGO_BACKUP_SERVER_URL: string;
    }
  }
}

const MONGO_MAIN_SERVER_URL = process.env.MONGO_MAIN_SERVER_URL;
const MONGO_BACKUP_SERVER_URL = process.env.MONGO_BACKUP_SERVER_URL;

const database_name = "codemanager";
const database_dump_path = ".dump/db";

const execAsync = (cmd: string) => {
  return new Promise((resolve) => exec(cmd).on("exit", resolve));
};

export default async function watchDatabase() {
  const client = new MongoClient(MONGO_MAIN_SERVER_URL);
  await client.connect();

  const db = client.db(database_name);
  const changeStream = db.watch();

  changeStream.on("change", async (_change) => {
    if (fs.existsSync(database_dump_path)) {
      await fs.promises.rm("dump", { recursive: true, force: true });
    }

    await execAsync(
      `mongosh --eval "use ${database_name}" --eval "db.dropDatabase()"`
    );

    await execAsync(
      `mongodump --uri="${MONGO_MAIN_SERVER_URL}" --db ${database_name} --out ${database_dump_path}`
    );

    await execAsync(
      `mongorestore --uri="${MONGO_BACKUP_SERVER_URL}" ./${database_dump_path}`
    ).then(() => console.log("DB: COPIED at " + new Date().toUTCString()));
  });
}
