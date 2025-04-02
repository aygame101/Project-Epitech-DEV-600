export type Board = {
    id: string;
    name: string;
    desc?: string;
    url: string;
    idOrganization?: string;
    prefs?: {
      backgroundImage?: string;
    };
    closed?: boolean;
  };
