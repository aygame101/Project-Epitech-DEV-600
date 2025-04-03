export type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  cardId?: string;
};

export type Checklist = {
  id: string;
  title: string;
  items: ChecklistItem[];
};

export type Card = {
  id: string;
  name: string;
  desc?: string;
  idList: string;
  idBoard: string;
  dueDate?: string; // ISO date string
  startDate?: string; // ISO date string
  reminders?: string[]; // Array of ISO date strings
  labels?: Array<{
    id: string;
    name?: string;
    color: string;
  }>;
  checklists?: Checklist[];
};
