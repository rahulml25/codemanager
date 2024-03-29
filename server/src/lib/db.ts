import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mainClient = new MongoClient(process.env.MONGO_MAIN_SERVER_URL);
const backupClient = new MongoClient(process.env.MONGO_BACKUP_SERVER_URL);

export async function getDBConnector(): Promise<DBConnector> {
  const isOnline = await fetch("https://www.google.com", { method: "HEAD" })
    .then((res) => res.ok)
    .catch(() => false);

  return {
    dbClient: isOnline ? mainClient : backupClient,
    isOnline,
  };
}

export function getProjectsCol(client: MongoClient) {
  const db = client.db("codemanager");
  const collection = db.collection("projects");
  return collection;
}
