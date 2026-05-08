import { MongoClient, type Db, type Collection, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "mydiaryskills";

if (!uri) {
  // Don't crash at import — let routes report the misconfig with a clear error.
  console.warn("[mongo] MONGODB_URI not set; database calls will fail.");
}

// Survive Next.js HMR / module reloads in dev so we don't open a new
// connection pool per change (which is what makes the first hit after a save
// feel slow).
const globalForMongo = globalThis as unknown as {
  __mdsMongoClient?: Promise<MongoClient>;
};

function getClient(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalForMongo.__mdsMongoClient) {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    globalForMongo.__mdsMongoClient = client.connect();
  }
  return globalForMongo.__mdsMongoClient;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}

export type UserDoc = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  timezone: string;
  onboarded: boolean;
  ai: {
    enabled: boolean;
    provider: "groq" | "gemini" | "mock" | "openai";
    shareTextWithProvider: boolean;
    retainHistory: boolean;
    lastConsentedAt: string | null;
  };
  createdAt: string;
};

export type DiaryDoc = {
  _id?: ObjectId;
  userId: string;
  dateKey: string;
  content: string;
  wordCount: number;
  status: "draft" | "saved" | "locked";
  analyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillDoc = {
  _id?: ObjectId;
  userId: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  level: number;
  progress: number;
  entries: number;
  createdAt: string;
  updatedAt: string;
};

export type SuggestionDoc = {
  _id?: ObjectId;
  userId: string;
  dateKey: string;
  provider: string;
  summary: string;
  newSkills: unknown[];
  upgradedSkills: unknown[];
  ignored: unknown[];
  status: "pending" | "reviewed" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
};

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    diary: db.collection<DiaryDoc>("diary_entries"),
    skills: db.collection<SkillDoc>("skills"),
    suggestions: db.collection<SuggestionDoc>("ai_suggestions"),
  };
}

export async function ensureIndexes() {
  const c = await collections();
  await c.users.createIndex({ email: 1 }, { unique: true });
  await c.diary.createIndex({ userId: 1, dateKey: 1 }, { unique: true });
  await c.skills.createIndex({ userId: 1, name: 1 });
  await c.suggestions.createIndex({ userId: 1, dateKey: 1, createdAt: -1 });
}

export { ObjectId };
