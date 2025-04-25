
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { UserRole } from "@/types/auth";
import { 
  ShoppingBag, FileText, Folder, ShoppingCart, 
  FolderPlus, FilePlus, List, ClipboardCheck, 
  Users, Settings, BarChart3 
} from "lucide-react";

export function QuickActions({ role }: { role: UserRole }) {
  if (role === 'client') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionLink to="/marketplace" icon={<ShoppingBag />} label="Parcourir les offres" />
          <ActionLink to="/quotes" icon={<FileText />} label="Voir les devis" />
          <ActionLink to="/dossiers" icon={<Folder />} label="Mes dossiers" />
          <ActionLink to="/cart" icon={<ShoppingCart />} label="Voir le panier" />
        </div>
      </Card>
    );
  }

  if (role === 'agent') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <ActionLink to="/dossiers/new" icon={<FolderPlus />} label="Nouveau dossier" />
          <ActionLink to="/quotes/draft" icon={<FilePlus />} label="Créer un devis" />
          <ActionLink to="/marketplace" icon={<ShoppingBag />} label="Parcourir les offres" />
          <ActionLink to="/dossiers" icon={<List />} label="Tous les dossiers" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        <ActionLink to="/quotes/pending" icon={<ClipboardCheck />} label="Approbations en attente" />
        <ActionLink to="/users" icon={<Users />} label="Gestion des utilisateurs" />
        <ActionLink to="/marketplace/manage" icon={<Settings />} label="Gérer les offres" />
        <ActionLink to="/reports" icon={<BarChart3 />} label="Voir les rapports" />
      </div>
    </Card>
  );
}

function ActionLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="h-6 w-6 mb-2 text-numa-500">
        {icon}
      </div>
      <span className="text-sm text-center">{label}</span>
    </Link>
  );
}
