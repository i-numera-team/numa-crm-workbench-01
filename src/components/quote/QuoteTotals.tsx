
interface QuoteTotalsProps {
  totalPrice: number;
}

export function QuoteTotals({ totalPrice }: QuoteTotalsProps) {
  const tva = totalPrice * 0.2;
  const totalTTC = totalPrice + tva;

  return (
    <div className="mb-6">
      <div className="flex flex-col items-end">
        <div className="w-1/3">
          <div className="flex justify-between py-1">
            <span className="text-sm">Total HT</span>
            <span className="text-sm font-semibold">{totalPrice}€ HT</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm">TVA (20%)</span>
            <span className="text-sm font-semibold">{tva}€</span>
          </div>
          <div className="flex justify-between py-2 mt-1 bg-[#c41c28] text-white font-bold rounded">
            <span className="text-sm ml-2">Total TTC</span>
            <span className="text-sm mr-2">{totalTTC}€ TTC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
