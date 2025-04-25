
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'agent' | 'admin';
  company?: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données des utilisateurs depuis Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, company');
          
        if (error) {
          throw error;
        }
        
        // Convertir les données au format attendu
        const formattedUsers: User[] = data.map(user => ({
          id: user.id,
          name: user.company || user.email.split('@')[0],
          email: user.email,
          role: user.role as 'client' | 'agent' | 'admin',
          company: user.company
        }));
        
        setUsers(formattedUsers);
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        toast.error('Impossible de charger les utilisateurs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handlePromote = async (id: string) => {
    try {
      // Mettre à jour le rôle dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Mettre à jour l'état local
      setUsers(users.map(u => 
        u.id === id ? { ...u, role: 'admin' } : u
      ));
      
      toast.success('Utilisateur promu administrateur');
    } catch (err) {
      console.error('Erreur lors de la promotion de l\'utilisateur:', err);
      toast.error('Impossible de promouvoir l\'utilisateur');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Supprimer l'utilisateur dans Supabase (via la table auth.users)
      // Cela va aussi supprimer le profil grâce à la cascade
      const { error } = await supabase.auth.admin.deleteUser(id);
        
      if (error) {
        throw error;
      }
      
      // Mettre à jour l'état local
      setUsers(users.filter(u => u.id !== id));
      
      toast.success('Utilisateur supprimé');
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      toast.error('Impossible de supprimer l\'utilisateur');
    }
  };

  // Vérifier si l'utilisateur courant est administrateur
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold mb-4">Accès non autorisé</h1>
          <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      
      {loading ? (
        <Card className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
          </div>
        </Card>
      ) : (
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
                  <td className="py-2">{user.name}</td>
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
      )}
    </div>
  );
}
