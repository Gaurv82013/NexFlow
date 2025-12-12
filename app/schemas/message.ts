import { z } from "zod";
export const createMessageSchema =z.object({
    channelId:z.string(),
    content:z.string().min(1).max(2000),
    imageUrl:z.string().url().optional().or(z.literal("")),
})

export type createMessageSchemaType = z.infer<typeof createMessageSchema>;