
interface LineItem {
  offre: string;
  description: string;
  prix: number;
  quantite: number;
  montant: number;
}

interface QuoteLineItemsProps {
  lineItems: LineItem[];
}

export function QuoteLineItems({ lineItems }: QuoteLineItemsProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center mb-4 rounded-xl border-[2px] border-red-400">
        <div className="w-1/6 py-7 px-4 text-left text-xs font-bold">Offre</div>
        <div className="w-2/6 py-7 px-4 text-left text-xs font-bold">Description de l'offre</div>
        <div className="w-1/6 py-7 px-4 text-xs font-bold">Frais de création</div>
        <div className="w-1/6 py-5 px-4 text-right text-xs font-bold">Abonnements par mois</div>
        <div className="w-1/6 py-7 px-4 text-right text-xs font-bold">Quantité</div>
      </div>

      {lineItems.map((item, index) => (
        <div key={index} className="flex items-center border-[2px] border-gray-400 rounded-md">
          <div className="w-1/6 py-2 px-4 text-xs">{item.offre}</div>
          <div className="w-2/6 py-2 px-4 text-xs">{item.description}</div>
          <div className="w-1/6 py-2 px-4 text-right text-xs">{item.prix}€</div>
          <div className="w-1/6 py-2 px-4 text-right text-xs">-</div>
          <div className="w-1/6 py-2 px-4 text-right text-xs">{item.quantite}</div>
        </div>
      ))}
    </div>
  );
}
