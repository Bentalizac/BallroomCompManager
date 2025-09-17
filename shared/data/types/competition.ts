import { CompEvent } from "./event";

export interface Competition {
  id: string;
  startDate: Date;
  endDate: Date;
  events: CompEvent[];
  name: string;
  //location:
}
