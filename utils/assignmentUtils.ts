import { cardServices } from '@/services/cardService';
import { User } from '@/types/User';

export async function fetchCardAssignments(cardIds: string[]): Promise<Record<string, string[]>> {
  const assignments: Record<string, string[]> = {};
  
  for (const cardId of cardIds) {
    const members = await cardServices.getCardMembers(cardId);
    if (Array.isArray(members)) {
      assignments[cardId] = members
        .filter((member: any): member is User => 
          typeof member === 'object' && 
          member !== null && 
          typeof member.id === 'string'
        )
        .map(member => member.id);
    }
  }
  return assignments;
}

export async function handleUserAssignment(
  cardId: string | null, 
  userId: string, 
  assignedMembers: Record<string, string[]>
): Promise<Record<string, string[]>> {
  if (!cardId) {
    throw new Error('Aucune carte sélectionnée');
  }

  const currentAssignments = assignedMembers[cardId] || [];
  const isAssigned = currentAssignments.includes(userId);

  if (isAssigned) {
    await cardServices.removeMemberFromCard(cardId, userId);
    return {
      ...assignedMembers,
      [cardId]: currentAssignments.filter(id => id !== userId)
    };
  } else {
    await cardServices.addMemberToCard(cardId, userId);
    return {
      ...assignedMembers,
      [cardId]: [...currentAssignments, userId]
    };
  }
}
