import { z } from "zod";

/**
 *Schemas for competition-related operations, used for getting a comp or for getting all info of a category for a comp
 */
export const getCompetitionInfoSchema = z.object({
  id: z.string(),
});
/**
 * Info to create a comp
 */
export const createCompetitionSchema = z.object({
  name: z.string().min(1, "Competition name is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  location: z.string().optional(),
  description: z.string().optional(),
});
