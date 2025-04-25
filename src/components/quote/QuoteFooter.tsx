import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

interface BankDetails {
  bankName: string;
  iban: string;
  bic: string;
}

interface QuoteFooterProps {
  bankDetails: BankDetails;
  onAcceptQuote: () => void;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  quoteId?: string;
}

export function QuoteFooter({ bankDetails, onAcceptQuote, status, quoteId }: QuoteFooterProps) {
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const canPrint = status === 'approved' || status === 'signed';
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const handleAcceptQuote = () => {
    // Avant d'appeler onAcceptQuote, nous ajoutons une notification pour l'administrateur
    if (user?.role === 'client' && quoteId) {
      addNotification({
        userId: 'admin', // Dans un vrai système, ce serait l'ID de l'administrateur
        message: `Le devis #${quoteId} a été accepté par ${user.name || 'le client'}`,
        type: 'success',
        read: false,
        link: `/quotes/${quoteId}`,
        title: 'Devis accepté'
      });
    }
    onAcceptQuote();
  };

  const handlePrint = () => {
    const printContent = document.getElementById('quotePrintable');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Devis</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .company { font-weight: bold; font-size: 18px; }
                .info-block { margin-bottom: 15px; }
                .title { font-size: 22px; font-weight: bold; margin: 20px 0; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f3f4f6; }
                .total-row { font-weight: bold; }
                .payment-info { margin-top: 30px; }
                .signature-block { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
                .footer { margin-top: 50px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  return (
    <>
      <div id="quotePrintable" className="print:block">
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
      </div>

      <div className="mt-6 flex justify-end space-x-4 print:hidden">
        {canPrint ? (
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="print:hidden"
          >
            Télécharger le PDF
          </Button>
        ) : (
          <Button 
            variant="outline" 
            disabled
            className="print:hidden cursor-not-allowed"
            title="Le devis doit être approuvé par l'administrateur avant de pouvoir être téléchargé"
          >
            Télécharger le PDF
          </Button>
        )}
        
        {/* Afficher le bouton d'acceptation uniquement pour les clients et si le statut est approuvé */}
        {status === 'approved' && user?.role === 'client' && (
          <Button 
            onClick={handleAcceptQuote}
            className="bg-green-600 hover:bg-green-700 text-white print:hidden"
          >
            Accepter le devis
          </Button>
        )}
      </div>
    </>
  );
}
