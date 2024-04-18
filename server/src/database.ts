import fs from "fs";
import { MongoClient } from "mongodb";
import { execAsync, isOnline } from "../../tslib/utils";

const database_name = "codemanager";
const database_dump_path = ".dump/db";

const MONGO_MAIN_SERVER_URL = process.env.MONGO_MAIN_SERVER_URL;
const MONGO_BACKUP_SERVER_URL = process.env.MONGO_BACKUP_SERVER_URL;

export const mainClient = new MongoClient(MONGO_MAIN_SERVER_URL);
const backupClient = new MongoClient(MONGO_BACKUP_SERVER_URL);

export const getAvailableClient = async () =>
  (await isOnline()) ? mainClient : backupClient;

export async function watchDatabase() {
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
