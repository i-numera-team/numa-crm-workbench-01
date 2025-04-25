
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type Notification = {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
  title?: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Nous utilisons mockData temporairement, mais ici on pourrait
        // récupérer les notifications depuis Supabase
        const mockNotifications: Notification[] = [
          {
            id: '1',
            userId: user.id,
            message: 'Votre devis a été approuvé par l\'administrateur',
            type: 'success',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/quotes/QT005',
            title: 'Devis approuvé'
          },
          {
            id: '2',
            userId: user.id,
            message: 'Bienvenue sur la plateforme i-numa!',
            type: 'info',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            title: 'Bienvenue'
          }
        ];
        
        // Si l'utilisateur est admin, ajoutons une notification concernant un devis à approuver
        if (user.role === 'admin') {
          mockNotifications.push({
            id: '3',
            userId: user.id,
            message: 'Un nouveau devis a été créé et est en attente d\'approbation',
            type: 'warning',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            link: '/quotes/QT002',
            title: 'Nouveau devis'
          });
        }
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Configuration d'un canal temps réel pour les notifications (simulé pour l'instant)
    const channel = supabase
      .channel('public:notifications')
      .on('broadcast', { event: 'new_notification' }, payload => {
        if (payload.payload.userId === user.id) {
          const newNotification = payload.payload as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(count => count + 1);
          
          // Afficher un toast pour la nouvelle notification
          toast.success(newNotification.message, {
            description: newNotification.title || 'Nouvelle notification'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => {
      if (notification.id === notificationId && !notification.read) {
        setUnreadCount(count => count - 1);
        return { ...notification, read: true };
      }
      return notification;
    }));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.read) {
      setUnreadCount(count => count + 1);
    }
    
    // Affichage d'un toast pour la nouvelle notification
    toast.success(newNotification.message, {
      description: newNotification.title || 'Nouvelle notification'
    });
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification
  };
}
