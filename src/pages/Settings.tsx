
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Exemple de paramètres utilisateur
export default function Settings() {
  const [notif, setNotif] = useState(true);
  const [lang, setLang] = useState('fr');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span>Notifications par e-mail</span>
          <Button variant={notif ? 'default' : 'outline'} onClick={() => setNotif(n => !n)}>
            {notif ? 'Activées' : 'Désactivées'}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span>Langue de l’interface</span>
          <select
            className="border rounded p-2 bg-background text-foreground"
            value={lang}
            onChange={e => setLang(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>
        <div>
          <Button className="mt-4">Enregistrer les modifications</Button>
        </div>
      </Card>
    </div>
  );
}
