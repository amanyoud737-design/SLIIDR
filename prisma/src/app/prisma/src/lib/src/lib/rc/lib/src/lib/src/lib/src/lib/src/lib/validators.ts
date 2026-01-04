import { z } from "zod";

export const SlideImageSchema = z.object({
  type: z.literal("image"),
  url: z.string().min(1),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number()
});

export const SlideTitleSchema = z.object({
  type: z.literal("title"),
  text: z.string(),
  font: z.string(),
  fontSize: z.number()
});

export const SlideBulletsSchema = z.object({
  type: z.literal("bullets"),
  items: z.array(z.string()),
  font: z.string(),
  fontSize: z.number()
});

export const SlideSchema = z.object({
  bgColor: z.string().optional(),
  items: z.array(z.union([SlideTitleSchema, SlideBulletsSchema, SlideImageSchema]))
});
