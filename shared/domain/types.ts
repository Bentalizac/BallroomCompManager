// Domain types for UI consumption with proper Date objects

export interface Venue {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
}

export interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'scheduled' | 'current' | 'completed' | 'cancelled';
}

export interface Competition {
  id: string;
  slug: string;
  name: string;
  startDate: Date;
  endDate: Date;
  venue?: Venue | null;
  events: Event[];
}
