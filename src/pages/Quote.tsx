
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

interface LineItemType {
  offre: string;
  description: string;
  prix: number;
  quantite: number;
  montant: number;
}

export default function Quote() {
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  
  const lineItems: LineItemType[] = cartItems.map(item => ({
    offre: item.offerTitle,
    description: item.offerTitle,
    prix: item.price,
    quantite: item.quantity,
    montant: item.price * item.quantity
  }));
  
  const tva = totalPrice * 0.2;
  const totalTTC = totalPrice + tva;
  
  const currentDate = new Date().toLocaleDateString('fr-FR');
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg print:shadow-none [&_*]:text-gray-900 dark:[&_*]:text-gray-900">
        <div className="p-8 print:p-0">
          {/* Section En-tête */}
          <div className="relative mb-6 h-[300px] bg-no-repeat bg-cover bg-top" 
               style={{ backgroundImage: "url('/images/inum.png')" }}>
            <div className="left-[100px] top-[100px] bg text-white p-4 rounded-t-md relative items-center">
              <h1 className="text-xl font-bold text-[25px]">Devis n° {Math.floor(Math.random() * 10000).toString().padStart(7, '0')}</h1>
            </div>
            
            <div className="relative mt-[200px] left-[350px] justify-between pt-2 pb-4">
              <div className="w-1/2"></div>
              <div className="w-1/2 text-right z-10 relative pr-4 pt-2">
                <p className="text-xs">131, continental Dr, Suite 305 Newark, DE 19713</p>
                <p className="text-xs">T: (+1)302 896 8008</p>
                <div className="flex justify-end">
                  <p className="text-xs">Lot 81, Les 4 chemins, Casablanca, Maroc</p>
                </div>
                <p className="text-xs">+33 9 86 40 63</p>
                <p className="text-xs">www.i-numeros.com</p>
              </div>
            </div>
          </div>

          {/* Section Informations Client */}
          <div className="mb-6">
            <div className="flex flex-col">
              <h2 className="font-bold text-base">Client: {user?.name}</h2>
              <p className="uppercase text-xs text-gray-700">{user?.company}</p>
              <p className="text-xs">{user?.phone || '-'}</p>
              <p className="text-xs text-blue-600">{user?.email}</p>
            </div>
          </div>

          {/* Éléments du devis */}
          <div className="mb-6 space-y-4">
            {/* En-tête */}
            <div className="flex items-center mb-4 rounded-xl border-[2px] border-red-400">
              <div className="w-1/6 py-7 px-4 text-left text-xs font-bold">Offre</div>
              <div className="w-2/6 py-7 px-4 text-left text-xs font-bold">Description de l'offre</div>
              <div className="w-1/6 py-7 px-4 text-xs font-bold">Frais de création</div>
              <div className="w-1/6 py-5 px-4 text-right text-xs font-bold">Abonnements par mois</div>
              <div className="w-1/6 py-7 px-4 text-right text-xs font-bold">Quantité</div>
            </div>

            {/* Corps */}
            {lineItems.map((item, index) => (
              <div key={index} className="flex items-center border-[2px] border-gray-400 rounded-md">
                <div className="w-1/6 py-2 px-4 text-xs">{item.offre}</div>
                <div className="w-2/6 py-2 px-4 text-xs">{item.description}</div>
                <div className="w-1/6 py-2 px-4 text-right text-xs">{item.prix}€</div>
                <div className="w-1/6 py-2 px-4 text-right text-xs">-</div>
                <div className="w-1/6 py-2 px-4 text-right text-xs">{item.quantite}</div>
              </div>
            ))}

            {/* Pied */}
            <div className="flex items-center border border-gray-400 rounded-md">
              <div className="w-5/6 py-2 px-4 text-right text-xs font-bold border-r border-gray-400">Total HT</div>
              <div className="w-1/6 py-2 px-4 text-right text-xs font-bold">{totalPrice}€ HT</div>
            </div>
          </div>

          {/* Section Total */}
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

          {/* Section Paiement et Signature */}
          <div className="flex justify-between">
            <div className="w-1/2">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#2B3266] mb-1">Informations de paiement</h3>
                <p className="text-xs">Paiement par virement bancaire</p>
                <p className="text-xs">Banque : BMCE</p>
                <p className="text-xs">IBAN : FR76-0000-0000-0105-6378-2010-104</p>
                <p className="text-xs">BIC : BMOIMABC</p>
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
      </div>
    </div>
  );
}
