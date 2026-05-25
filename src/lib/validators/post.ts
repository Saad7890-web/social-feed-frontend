import { z } from "zod";

export const postComposerSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something before posting.")
    .max(5000, "Post text is too long."),
  visibility: z.enum(["public", "private"]),
});

export type PostComposerValues = z.infer<typeof postComposerSchema>;
