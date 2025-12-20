
import { z } from "zod";
export const createMessageSchema =z.object({
    channelId:z.string(),
    content:z.string().min(1).max(2000),
    imageUrl:z.string().url().optional().or(z.literal("")),
    threadId:z.string().optional(),
})

export const updateMessageSchema =z.object({
    messageId:z.string(),
    content:z.string().min(1).max(2000).optional(),
})

export const toggleReactionSchema =z.object({
    messageId:z.string(),
    emoji:z.string().min(1).max(100),
})

export const GroupReactionSchema=z.object({
    emoji:z.string(),
    count:z.number(),
    reactedByMe:z.boolean(),
});

export type createMessageSchemaType = z.infer<typeof createMessageSchema>;
export type updateMessageSchemaType = z.infer<typeof updateMessageSchema>;
export type toggleReactionSchemaType = z.infer<typeof toggleReactionSchema>;
export type GroupReactionSchemaType = z.infer<typeof GroupReactionSchema>;