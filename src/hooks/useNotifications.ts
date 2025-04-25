
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
        
        // Récupération des notifications depuis Supabase
        const { data: notificationsData, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Erreur lors du chargement des notifications:', error);
          return;
        }
        
        // Conversion des données Supabase au format attendu par l'application
        const formattedNotifications: Notification[] = notificationsData.map(n => ({
          id: n.id,
          userId: n.user_id,
          message: n.message,
          type: n.type as 'info' | 'success' | 'warning' | 'error',
          read: n.read || false,
          createdAt: n.created_at,
          link: n.link,
          title: n.title
        }));
        
        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Configuration d'un canal temps réel pour les notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const newNotification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            message: payload.new.message,
            type: payload.new.type as 'info' | 'success' | 'warning' | 'error',
            read: payload.new.read || false,
            createdAt: payload.new.created_at,
            link: payload.new.link,
            title: payload.new.title
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(count => count + 1);
          
          // Afficher un toast pour la nouvelle notification
          toast.success(newNotification.message, {
            description: newNotification.title || 'Nouvelle notification'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    // Mettre à jour l'état local
    const notificationToUpdate = notifications.find(n => n.id === notificationId);
    if (notificationToUpdate && !notificationToUpdate.read) {
      setNotifications(notifications.map(notification => {
        if (notification.id === notificationId) {
          setUnreadCount(count => count - 1);
          return { ...notification, read: true };
        }
        return notification;
      }));
      
      // Mettre à jour dans Supabase
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      // Mettre à jour l'état local
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
      
      // Mettre à jour dans Supabase
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user?.id) return;
    
    try {
      // Insérer dans Supabase
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          title: notification.title,
          link: notification.link
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Erreur lors de l\'ajout de la notification:', error);
        return;
      }
      
      // La notification sera ajoutée à l'état via le canal temps réel
      console.log('Notification créée avec succès:', data);
      
      // Affichage d'un toast pour la nouvelle notification
      toast.success(notification.message, {
        description: notification.title || 'Nouvelle notification'
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la notification:', error);
    }
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
