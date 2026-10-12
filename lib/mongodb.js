import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

if (!dbName) {
  throw new Error("Please define the MONGODB_DB environment variable in .env.local");
}

let cached = global._mongoClientPromise;

if (!cached) {
  const client = new MongoClient(uri);
  cached = global._mongoClientPromise = client.connect();
}

export async function getMongoClient() {
  return cached;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function getEventsCollection() {
  const db = await getDb();
  const collection = db.collection("events");
  await ensureIndexes(collection);
  return collection;
}

async function ensureIndexes(collection) {
  await collection.createIndexes([
    {
      key: { sessionId: 1, timestamp: 1 },
      name: "sessionId_timestamp",
      background: true,
    },
    {
      key: { pageUrl: 1, eventType: 1 },
      name: "pageUrl_eventType",
      background: true,
    },
    {
      key: { timestamp: -1 },
      name: "timestamp_desc",
      background: true,
    },
  ]);
}
