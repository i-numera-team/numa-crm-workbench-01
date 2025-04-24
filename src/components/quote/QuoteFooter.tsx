
interface BankDetails {
  bankName: string;
  iban: string;
  bic: string;
}

interface QuoteFooterProps {
  bankDetails: BankDetails;
  onAcceptQuote: () => void;
}

export function QuoteFooter({ bankDetails, onAcceptQuote }: QuoteFooterProps) {
  const currentDate = new Date().toLocaleDateString('fr-FR');

  return (
    <>
      <div className="flex justify-between">
        <div className="w-1/2">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#2B3266] mb-1">Informations de paiement</h3>
            <p className="text-xs">Paiement par virement bancaire</p>
            <p className="text-xs">Banque : {bankDetails.bankName || 'En attente'}</p>
            <p className="text-xs">IBAN : {bankDetails.iban || 'En attente'}</p>
            <p className="text-xs">BIC : {bankDetails.bic || 'En attente'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-[#2B3266] mb-1">Termes & conditions</h3>
            <p className="text-xs">Ce devis est valable 7 jours à compter de sa date d'émission</p>
          </div>
        </div>
        
        <div className="w-1/3 border border-red-400 rounded-md p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Date : {currentDate}</span>
          </div>
          <div className="border-b pb-20 border-gray-400 pt-2">
            <span className="text-sm text-gray-600">Signature :</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => window.print()}
          className="print:hidden"
        >
          Télécharger le PDF
        </Button>
        <Button 
          onClick={onAcceptQuote}
          className="bg-green-600 hover:bg-green-700 text-white print:hidden"
        >
          Accepter le devis
        </Button>
      </div>
    </>
  );
}
