
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("tabby-card flex flex-col", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        {icon && <div className="text-tabby-secondary">{icon}</div>}
      </div>
      
      {trend && (
        <div className="mt-4">
          <div className={cn(
            "flex items-center text-sm font-medium",
            trend.isPositive ? "text-tabby-success" : "text-tabby-danger"
          )}>
            <span className={cn(
              "inline-block mr-1 rounded-full p-1",
              trend.isPositive ? "bg-tabby-success/10" : "bg-tabby-danger/10"
            )}>
              {trend.isPositive ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span>
              {trend.value}% {trend.isPositive ? 'increase' : 'decrease'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
