
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, File, FileCheck, FileX, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Activity = {
  id: string;
  type: 'dossier_created' | 'quote_sent' | 'quote_signed' | 'quote_rejected' | 'comment_added';
  description: string;
  createdAt: string;
  relatedId?: string;
};

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Pour l'instant, nous utilisons des données simulées
        // Dans une vraie application, vous devriez avoir une table d'activités dans Supabase
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'dossier_created',
            description: 'Nouveau dossier créé pour Client ABC',
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            relatedId: 'DOS001'
          },
          {
            id: '2',
            type: 'quote_sent',
            description: 'Devis envoyé au client XYZ Ltd',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            relatedId: 'QT002'
          },
          {
            id: '3',
            type: 'quote_signed',
            description: 'Devis signé par ABC Corp',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            relatedId: 'QT001'
          },
          {
            id: '4',
            type: 'comment_added',
            description: 'Nouveau commentaire sur le dossier ABC Corp',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            relatedId: 'DOS001'
          },
          {
            id: '5',
            type: 'quote_rejected',
            description: 'Devis rejeté par First Bank',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            relatedId: 'QT003'
          }
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [user]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Activités récentes</h3>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-numa-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-numa-100 text-numa-500">
                {activity.type === 'dossier_created' && <FolderOpen className="h-4 w-4" />}
                {activity.type === 'quote_sent' && <File className="h-4 w-4" />}
                {activity.type === 'quote_signed' && <FileCheck className="h-4 w-4" />}
                {activity.type === 'quote_rejected' && <FileX className="h-4 w-4" />}
                {activity.type === 'comment_added' && <Clock className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 pt-4 border-t">
        <Link to="/activities" className="text-sm text-numa-500 hover:underline">
          Voir toutes les activités
        </Link>
      </div>
    </Card>
  );
}
