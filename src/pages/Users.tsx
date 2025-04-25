
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Simulation de données d’utilisateurs
type User = {
  id: number;
  nom: string;
  email: string;
  role: 'client' | 'agent' | 'admin';
};

const fakeUsers: User[] = [
  { id: 1, nom: 'Alice Martin', email: 'alice@exemple.com', role: 'client' },
  { id: 2, nom: 'Bob Durand', email: 'bob@exemple.com', role: 'agent' },
  { id: 3, nom: 'Eve Admin', email: 'eve@exemple.com', role: 'admin' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(fakeUsers);
  }, []);

  const handlePromote = (id: number) => {
    setUsers(users =>
      users.map(u =>
        u.id === id ? { ...u, role: 'admin' } : u
      )
    );
    toast.success('Utilisateur promu administrateur');
  };

  const handleDelete = (id: number) => {
    setUsers(users => users.filter(u => u.id !== id));
    toast.success('Utilisateur supprimé');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      <Card className="p-4">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Nom</th>
              <th>E-mail</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user =>
              <tr key={user.id} className="border-b">
                <td className="py-2">{user.nom}</td>
                <td>{user.email}</td>
                <td>
                  {user.role === 'client'
                    ? 'Client'
                    : user.role === 'agent'
                      ? 'Agent'
                      : 'Administrateur'}
                </td>
                <td>
                  <div className="flex gap-2">
                    {user.role !== 'admin' && (
                      <Button size="sm" onClick={() => handlePromote(user.id)}>
                        Promouvoir
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
