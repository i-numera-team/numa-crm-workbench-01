
import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  description: string;
  color: string;
}

export function StatCard({ icon, title, value, description, color }: StatCardProps) {
  return (
    <Card className="p-6 relative overflow-hidden dark:bg-[#1a1f2c]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-200">{title}</p>
          <p className="text-2xl font-semibold mt-1 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div 
          className="rounded-full p-3 bg-opacity-10" 
          style={{ 
            backgroundColor: `rgba(${
              color === 'blue' ? '59, 130, 246' : 
              color === 'green' ? '34, 197, 94' : 
              color === 'purple' ? '139, 92, 246' : 
              '249, 115, 22'}, 0.1)`
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
