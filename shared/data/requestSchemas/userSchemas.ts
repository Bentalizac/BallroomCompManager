import { z } from "zod";

import { CompRoles } from "../enums/eventRoles";
export const registerForCompSchema = {
  userId: z.string().uuid(),
  competitionId: z.string().uuid(),
  roles: z.array(z.enum(CompRoles)).min(1),
};
