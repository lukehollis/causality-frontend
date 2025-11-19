import "server-only";

import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import type { AppUsage } from "../usage";
import { db } from ".";
import type { Suggestion } from "./schema";
import {
  chat,
  document,
  experiment,
  message,
  stream,
  suggestion,
  user,
  vote,
} from "./schema";
import { generateHashedPassword } from "./utils";

export async function getChatById(params: { id: string }) {
  const items = await db.select().from(chat).where(eq(chat.id, params.id));
  return items[0];
}

export async function getMessagesByChatId(params: { id: string }) {
  return db
    .select()
    .from(message)
    .where(eq(message.chatId, params.id))
    .orderBy(message.createdAt);
}

export async function getMessageById(params: { id: string }) {
  return db.select().from(message).where(eq(message.id, params.id));
}

export async function getChatsByUserId(params: {
  userId: string;
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}) {
  const whereConditions = [eq(chat.userId, params.userId)];

  if (params.startingAfter) {
    whereConditions.push(lt(chat.createdAt, new Date(params.startingAfter)));
  }

  if (params.endingBefore) {
    whereConditions.push(lt(chat.createdAt, new Date(params.endingBefore)));
  }

  return db
    .select()
    .from(chat)
    .where(and(...whereConditions))
    .orderBy(desc(chat.createdAt))
    .limit(params.limit ?? 10);
}

export async function getUser(email: string) {
  return db.select().from(user).where(eq(user.email, email));
}

export async function createGuestUser() {
  return db
    .insert(user)
    .values({
      email: `guest_${crypto.randomUUID()}@example.com`,
    })
    .returning();
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);
  return db
    .insert(user)
    .values({
      email,
      password: hashedPassword,
    })
    .returning();
}

// export async function getDocumentsByChatId(params: { chatId: string }) {
//   return db.select().from(document).where(eq(document.chatId, params.chatId));
// }

export async function getDocumentById(params: { id: string }) {
  const items = await db
    .select()
    .from(document)
    .where(eq(document.id, params.id));
  return items[0];
}

export async function getDocumentsById(params: { id: string }) {
  return db
    .select()
    .from(document)
    .where(eq(document.id, params.id))
    .orderBy(document.createdAt);
}

export async function deleteDocumentsByIdAfterTimestamp(params: {
  id: string;
  timestamp: Date;
}) {
  return db
    .delete(document)
    .where(
      and(eq(document.id, params.id), gt(document.createdAt, params.timestamp))
    );
}

export async function getFeedbackByMessageId(params: { messageId: string }) {
  return db.select().from(vote).where(eq(vote.messageId, params.messageId));
}

export async function getExperimentByChatId(params: { chatId: string }) {
  const items = await db
    .select()
    .from(experiment)
    .where(
      and(
        eq(experiment.chatId, params.chatId),
        eq(experiment.status, "completed")
      )
    )
    .orderBy(desc(experiment.createdAt))
    .limit(1);
  return items[0];
}

export async function deleteMessagesByChatIdAfterTimestamp(params: {
  chatId: string;
  timestamp: Date;
}) {
  return db
    .delete(message)
    .where(
      and(
        eq(message.chatId, params.chatId),
        gt(message.createdAt, params.timestamp)
      )
    );
}

export async function updateChatVisibilityById(params: {
  chatId: string;
  visibility: "private" | "public";
}) {
  return db
    .update(chat)
    .set({ visibility: params.visibility })
    .where(eq(chat.id, params.chatId));
}

export async function getSuggestionsByDocumentId(params: {
  documentId: string;
}) {
  return db
    .select()
    .from(suggestion)
    .where(eq(suggestion.documentId, params.documentId))
    .orderBy(suggestion.createdAt);
}

export async function getVotesByChatId(params: { chatId: string }) {
  return db.select().from(vote).where(eq(vote.chatId, params.chatId));
}

export async function voteMessage(params: {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}) {
  return db
    .insert(vote)
    .values({
      chatId: params.chatId,
      messageId: params.messageId,
      isUpvoted: params.isUpvoted,
    })
    .onConflictDoUpdate({
      target: [vote.chatId, vote.messageId],
      set: { isUpvoted: params.isUpvoted },
    });
}

export async function deleteAllChatsByUserId(params: { userId: string }) {
  return db.delete(chat).where(eq(chat.userId, params.userId));
}

export async function createStreamId(params: {
  streamId: string;
  chatId: string;
}) {
  return db.insert(stream).values({
    id: params.streamId,
    chatId: params.chatId,
    createdAt: new Date(),
  });
}

export async function getStreamIdsByChatId(params: { chatId: string }) {
  const streams = await db
    .select()
    .from(stream)
    .where(eq(stream.chatId, params.chatId))
    .orderBy(stream.createdAt);
  return streams.map((s) => s.id);
}

export async function deleteChatById(params: { id: string }) {
  return db.delete(chat).where(eq(chat.id, params.id));
}

export async function getMessageCountByUserId(params: {
  id: string;
  differenceInHours: number;
}) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - params.differenceInHours);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(message)
    .leftJoin(chat, eq(message.chatId, chat.id))
    .where(and(eq(chat.userId, params.id), gt(message.createdAt, startDate)));

  return Number(result[0]?.count ?? 0);
}

export async function saveChat(params: {
  id: string;
  userId: string;
  title: string;
  visibility: "private" | "public";
}) {
  return db.insert(chat).values({
    id: params.id,
    userId: params.userId,
    title: params.title,
    visibility: params.visibility,
    createdAt: new Date(),
  });
}

export async function saveMessages(params: {
  messages: Array<{
    id: string;
    chatId: string;
    role: string;
    parts: any;
    attachments: any;
    createdAt: Date;
  }>;
}) {
  return db.insert(message).values(params.messages);
}

export async function updateChatLastContextById(params: {
  chatId: string;
  context: AppUsage;
}) {
  return db
    .update(chat)
    .set({ lastContext: params.context })
    .where(eq(chat.id, params.chatId));
}

export async function saveDocument(params: {
  id: string;
  title: string;
  content: string;
  kind: "text" | "code" | "image" | "sheet" | "experiment";
  userId: string;
}) {
  return db
    .insert(document)
    .values({
      id: params.id,
      title: params.title,
      content: params.content,
      kind: params.kind,
      userId: params.userId,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [document.id, document.createdAt],
      set: {
        title: params.title,
        content: params.content,
      },
    });
}

export async function saveSuggestions(params: {
  suggestions: Array<
    Omit<Suggestion, never> & {
      userId: string;
      createdAt: Date;
      documentCreatedAt: Date;
    }
  >;
}) {
  return db.insert(suggestion).values(params.suggestions);
}
