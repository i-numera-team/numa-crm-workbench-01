
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  company: string;
}

interface AgentClientSelectorProps {
  selectedClient: string;
  onClientSelect: (value: string) => void;
  clientList: Client[];
}

export function AgentClientSelector({ selectedClient, onClientSelect, clientList }: AgentClientSelectorProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="client-select" className="mb-2 block">Select Client</Label>
          <Select
            value={selectedClient}
            onValueChange={onClientSelect}
          >
            <SelectTrigger id="client-select">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clientList.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.company})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
