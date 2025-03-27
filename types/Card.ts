export interface Card {
    id: string;
    title: string;
    description?: string;
    listId: string;
    position: number;
    labels?: Array<{
      id: string;
      color: string;
      name?: string;
    }>;
    
  }