
import { User } from "@/types/auth";

interface ClientInfoProps {
  user: User | null;
}

export function ClientInfo({ user }: ClientInfoProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col">
        <h2 className="font-bold text-base">Client: {user?.name}</h2>
        <p className="uppercase text-xs text-gray-700">{user?.company}</p>
        <p className="text-xs">{user?.phone || '-'}</p>
        <p className="text-xs text-blue-600">{user?.email}</p>
      </div>
    </div>
  );
}
