import { Collection, MongoClient } from "mongodb";

const DATABASE_URI = "mongodb://database:27017";
const DATABASE_NAME = "airetc";
const COLLECTIONS = ["attempts", "problems"] as const;

export function getClient() {
    const client = new MongoClient(DATABASE_URI);
    client.connect();
    return client;
}

export function getDatabase() {
    const client = getClient();
    return client.db(DATABASE_NAME);
}

export function getCollection<T>(
    collection: typeof COLLECTIONS[number]
): Collection<T> {
    const db = getDatabase();
    return db.collection(collection);
}
