import type { Collection, Filter } from "mongodb";
import { encryptDiaryContent } from "@/lib/diaryCrypto";
import type { DiaryDoc } from "@/lib/mongo";

export async function migrateLegacyDiaryEntry(
  diary: Collection<DiaryDoc>,
  entry: DiaryDoc | null | undefined
) {
  if (!entry || !entry.content || entry.contentEncryptionVersion === 1) return;

  const encrypted = encryptDiaryContent(entry.content, entry.userId, entry.dateKey);
  const filter: Filter<DiaryDoc> = entry._id
    ? { _id: entry._id, content: { $exists: true }, contentEncryptionVersion: { $exists: false } }
    : {
        userId: entry.userId,
        dateKey: entry.dateKey,
        content: { $exists: true },
        contentEncryptionVersion: { $exists: false },
      };

  await diary.updateOne(filter, {
    $set: { ...encrypted, updatedAt: entry.updatedAt || new Date().toISOString() },
    $unset: { content: "" },
  });

  Object.assign(entry, encrypted);
  delete entry.content;
}

export async function migrateLegacyDiaryEntries(
  diary: Collection<DiaryDoc>,
  entries: DiaryDoc[]
) {
  await Promise.all(entries.map((entry) => migrateLegacyDiaryEntry(diary, entry)));
}
