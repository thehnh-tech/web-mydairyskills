import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = 1;

export type EncryptedDiaryFields = {
  contentCiphertext: string;
  contentIv: string;
  contentTag: string;
  contentHash: string;
  contentEncryptionVersion: number;
};

type DiaryLike = {
  userId?: string;
  dateKey?: string;
  content?: string;
  contentCiphertext?: string;
  contentIv?: string;
  contentTag?: string;
  contentEncryptionVersion?: number;
};

export function encryptDiaryContent(content: string, userId: string, dateKey: string): EncryptedDiaryFields {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  cipher.setAAD(aad(userId, dateKey));
  const ciphertext = Buffer.concat([cipher.update(content, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    contentCiphertext: ciphertext.toString("base64"),
    contentIv: iv.toString("base64"),
    contentTag: tag.toString("base64"),
    contentHash: createHash("sha256").update(content, "utf8").digest("hex"),
    contentEncryptionVersion: VERSION,
  };
}

export function getDiaryContent(entry: DiaryLike | null | undefined): string {
  if (!entry) return "";
  if (entry.contentEncryptionVersion === VERSION && entry.contentCiphertext && entry.contentIv && entry.contentTag) {
    try {
      const userId = entry.userId || "";
      const dateKey = entry.dateKey || "";
      for (const key of decryptionKeys()) {
        try {
          const decipher = createDecipheriv(
            ALGORITHM,
            key,
            Buffer.from(entry.contentIv, "base64")
          );
          decipher.setAAD(aad(userId, dateKey));
          decipher.setAuthTag(Buffer.from(entry.contentTag, "base64"));
          return Buffer.concat([
            decipher.update(Buffer.from(entry.contentCiphertext, "base64")),
            decipher.final(),
          ]).toString("utf8");
        } catch {}
      }
      throw new Error("No configured diary encryption key could decrypt this entry.");
    } catch (error) {
      console.error("[diaryCrypto] failed to decrypt diary entry", {
        dateKey: entry.dateKey,
        error: error instanceof Error ? error.message : String(error),
      });
      return "";
    }
  }
  return entry.content || "";
}

function encryptionKey(): Buffer {
  return deriveKey(encryptionSecrets()[0] || "");
}

function decryptionKeys(): Buffer[] {
  return encryptionSecrets().map(deriveKey);
}

function encryptionSecrets(): string[] {
  const secret =
    process.env.DIARY_ENCRYPTION_KEY ||
    process.env.SESSION_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : "dev-only-diary-encryption-key-change-me-please");

  if (!secret || secret.length < 32) {
    throw new Error("DIARY_ENCRYPTION_KEY or SESSION_PASSWORD must be at least 32 characters.");
  }

  return [
    process.env.DIARY_ENCRYPTION_KEY,
    process.env.SESSION_PASSWORD,
    process.env.NODE_ENV === "production" ? undefined : "dev-only-diary-encryption-key-change-me-please",
  ].filter((value, index, all): value is string => {
    return Boolean(value && value.length >= 32 && all.indexOf(value) === index);
  });
}

function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

function aad(userId: string, dateKey: string): Buffer {
  return Buffer.from(`${userId}:${dateKey}`, "utf8");
}
