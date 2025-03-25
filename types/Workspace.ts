export interface Workspace {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    url?: string;
    website?: string;
    members?: WorkspaceMember[];
  }
  
  export interface WorkspaceMember {
    id: string;
    fullName: string;
    username: string;
    email?: string;
    avatarUrl?: string | null;
    memberType: 'admin' | 'normal' | 'observer';
  }