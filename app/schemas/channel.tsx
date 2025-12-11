import { z } from "zod";

export function transformChannelName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")     // remove special chars
    .replace(/\s+/g, "-")             // spaces → hyphens
    .replace(/-+/g, "-")              // multiple hyphens → single
    .replace(/^-|-$/g, "");           // trim hyphens
}

export const channelSchema = z.object({
    name: z.string()
        .min(2,"Name must be at least 2 characters long")
        .max(50,"Name must be at most 50 characters long")
        .transform((name,ctx) => {
            const transformedName = transformChannelName(name);
            if (transformedName.length < 2) {
                ctx.addIssue({
                    code: "custom",
                    message: "Transformed name must be at least 2 characters long"
                });
                return z.NEVER;
            }
            return transformedName;
        }),
})

export type ChannelSchemaType = z.infer<typeof channelSchema>;