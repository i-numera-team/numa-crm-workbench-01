
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

export default function Settings() {
  const [notif, setNotif] = useState(true);
  const [lang, setLang] = useState('fr');
  const [loading, setLoading] = useState(false);

  // Simulation de sauvegarde
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Paramètres enregistrés !");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      <form onSubmit={handleSave}>
        <Card className="p-6 space-y-4 dark:bg-[#222537]">
          <div className="flex items-center justify-between">
            <span>Notifications par e-mail</span>
            <Button
              type="button"
              variant={notif ? 'default' : 'outline'}
              onClick={() => setNotif(n => !n)}
              className={notif ? 'bg-numa-500 hover:bg-numa-600' : ''}
            >
              {notif ? 'Activées' : 'Désactivées'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span>Langue de l’interface</span>
            <select
              className="border rounded p-2 bg-background text-foreground dark:bg-[#181925] dark:text-white"
              value={lang}
              onChange={e => setLang(e.target.value)}
              disabled
            >
              <option value="fr">Français</option>
            </select>
          </div>
          <div>
            <Button className="mt-4 bg-numa-500 hover:bg-numa-600 w-full" type="submit" disabled={loading}>
              {loading ? "En cours..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
