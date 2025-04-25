
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { mockDataService } from "@/utils/mockData";
import { FolderOpen, File, FileCheck, FileX, Clock } from "lucide-react";

export function RecentActivities() {
  const activities = mockDataService.getActivities(5);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Activités récentes</h3>
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
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <Link to="/activities" className="text-sm text-numa-500 hover:underline">
          Voir toutes les activités
        </Link>
      </div>
    </Card>
  );
}
