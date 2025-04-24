
import { User } from "@/types/auth";

interface QuoteHeaderProps {
  user: User | null;
}

export function QuoteHeader({ user }: QuoteHeaderProps) {
  return (
    <div className="relative mb-6 h-[300px] bg-no-repeat bg-cover bg-top" 
         style={{ backgroundImage: "url('/images/inum.png')" }}>
      <div className="left-[100px] top-[100px] bg text-white p-4 rounded-t-md relative items-center">
        <h1 className="text-xl font-bold text-[25px]">
          Devis n° {Math.floor(Math.random() * 10000).toString().padStart(7, '0')}
        </h1>
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
  );
}
