export type Board = {
    id: string;
    name: string;
    desc?: string;
    url: string;
    prefs?: {
      backgroundImage?: string;
    };
  };