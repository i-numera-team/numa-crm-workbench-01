
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export function UpcomingEvents() {
  const events = [
    {
      id: '1',
      title: 'Réunion client',
      date: '2025-04-24T10:00:00',
      client: 'ABC Corporation'
    },
    {
      id: '2',
      title: 'Revue de devis',
      date: '2025-04-25T14:30:00',
      client: 'XYZ Ltd'
    },
    {
      id: '3',
      title: 'Démo produit',
      date: '2025-04-29T11:00:00',
      client: 'Johnson Enterprises'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Événements à venir</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-numa-100 text-numa-500">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{event.client}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <Link to="/calendar" className="text-sm text-numa-500 hover:underline">
          Voir le calendrier
        </Link>
      </div>
    </Card>
  );
}
