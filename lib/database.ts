import { Collection, MongoClient } from "mongodb";
import { getEnv } from "./env";

export const DATABASE_URI = getEnv("DATABASE_URI");
export const DATABASE_NAME = getEnv("DATABASE_NAME");
export const COLLECTIONS = ["attempts", "problems"] as const;

// Singleton MongoDB client instance
let mongoClient: MongoClient | undefined = undefined;

export async function getClient() {
    if (mongoClient) {
        return mongoClient;
    }

    const client = new MongoClient(DATABASE_URI);
    mongoClient = await client.connect();
    return mongoClient;
}

export async function getDatabase() {
    const client = await getClient();
    return client.db(DATABASE_NAME);
}

export async function getCollection<T>(
    collection: typeof COLLECTIONS[number]
): Promise<Collection<T>> {
    const db = await getDatabase();
    return db.collection(collection);
}
