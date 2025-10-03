import { z } from "zod";

export const getCompetitionSchema = z.object({
  id: z.string(),
});
