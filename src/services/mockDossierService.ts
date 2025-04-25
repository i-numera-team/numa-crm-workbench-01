
import { Dossier, Comment } from '@/types/mock';

class MockDossierService {
  private dossiers: Dossier[] = [
    {
      id: 'DS001',
      clientId: 'CL001',
      clientName: 'ABC Corp Contact',
      clientEmail: 'contact@abccorp.com',
      company: 'ABC Corp',
      status: 'in-progress',
      agentId: 'AG001',
      agentName: 'John Doe',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-15',
      comments: [
        {
          id: 'COM001',
          authorId: 'AG001',
          authorName: 'John Doe',
          authorRole: 'agent',
          text: 'Initiated contact with client',
          createdAt: '2024-03-01'
        },
        {
          id: 'COM002',
          authorId: 'CL001',
          authorName: 'ABC Corp Contact',
          authorRole: 'client',
          text: 'Interested in premium services',
          createdAt: '2024-03-10'
        }
      ]
    },
    {
      id: 'DS002',
      clientId: 'CL002',
      clientName: 'XYZ Ltd Contact',
      clientEmail: 'contact@xyzltd.com',
      company: 'XYZ Ltd',
      status: 'new',
      agentId: 'AG002',
      agentName: 'Alice Smith',
      createdAt: '2024-03-05',
      updatedAt: '2024-03-05',
      comments: []
    }
  ];

  getDossiers(): Dossier[] {
    return [...this.dossiers];
  }

  getDossiersByClientId(clientId: string): Dossier[] {
    return this.dossiers.filter(dossier => dossier.clientId === clientId);
  }

  getDossierById(id: string): Dossier | null {
    return this.dossiers.find(dossier => dossier.id === id) || null;
  }

  createDossier(dossierData: Partial<Dossier>): Dossier {
    const newDossier: Dossier = {
      id: `DS${(this.dossiers.length + 1).toString().padStart(3, '0')}`,
      clientId: dossierData.clientId || '',
      clientName: dossierData.clientName || '',
      clientEmail: dossierData.clientEmail || '',
      company: dossierData.company || '',
      status: dossierData.status || 'new',
      agentId: dossierData.agentId,
      agentName: dossierData.agentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    this.dossiers.push(newDossier);
    return newDossier;
  }

  updateDossier(id: string, updates: Partial<Dossier>): Dossier | null {
    const index = this.dossiers.findIndex(dossier => dossier.id === id);
    if (index === -1) return null;

    this.dossiers[index] = {
      ...this.dossiers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.dossiers[index];
  }

  deleteDossier(id: string): boolean {
    const initialLength = this.dossiers.length;
    this.dossiers = this.dossiers.filter(dossier => dossier.id !== id);
    return this.dossiers.length < initialLength;
  }

  addComment(dossierId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Dossier | null {
    const dossier = this.getDossierById(dossierId);
    if (!dossier) return null;

    const newComment: Comment = {
      id: `COM${(dossier.comments.length + 1).toString().padStart(3, '0')}`,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorRole: comment.authorRole,
      text: comment.text,
      createdAt: new Date().toISOString()
    };

    dossier.comments.push(newComment);
    dossier.updatedAt = new Date().toISOString();
    return dossier;
  }
}

export const mockDossierService = new MockDossierService();
