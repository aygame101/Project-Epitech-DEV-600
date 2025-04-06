import trelloApi from './trelloApi';
import { Workspace, WorkspaceMember } from '../types/Workspace';

class WorkspaceService {
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const organizations = await trelloApi.get('members/me/organizations', {
        fields: 'name,displayName,desc,url,website'
      });

      return organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        displayName: org.displayName,
        description: org.desc,
        url: org.url,
        website: org.website
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des Workspaces', error);
      throw error;
    }
  }

  async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    try {
      const newOrg = await trelloApi.post('organizations', {
        displayName: workspaceData.displayName,
        desc: workspaceData.description,
        name: workspaceData.name
      });

      return {
        id: newOrg.id,
        name: newOrg.name,
        displayName: newOrg.displayName,
        description: newOrg.desc
      };
    } catch (error) {
      console.error('Erreur lors de la création du Workspace', error);
      throw error;
    }
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const members = await trelloApi.get(`organizations/${workspaceId}/members`, {
        fields: 'fullName,username,email,avatarHash,memberType'
      });

      return members.map((member: any) => ({
        id: member.id,
        fullName: member.fullName,
        username: member.username,
        email: member.email,
        avatarUrl: member.avatarHash 
          ? `https://trello-members.s3.amazonaws.com/${member.avatarHash}/30.png`
          : null,
        memberType: member.memberType
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des membres', error);
      throw error;
    }
  }
}

export default new WorkspaceService();