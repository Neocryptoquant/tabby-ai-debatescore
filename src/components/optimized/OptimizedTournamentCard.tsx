import React from 'react';
import { Link } from "react-router-dom";
import { Calendar, Users, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TournamentCardProps {
  id: string;
  name: string;
  format: string;
  date: string;
  teamCount: number;
  location: string;
  status: "upcoming" | "active" | "completed";
  className?: string;
}

const statusColors = {
  upcoming: "bg-tabby-accent",
  active: "bg-tabby-success",
  completed: "bg-tabby-warning",
} as const;

/**
 * Optimized Tournament Card Component
 * Memoized to prevent unnecessary re-renders when parent components update
 */
export const OptimizedTournamentCard = React.memo<TournamentCardProps>(({ 
  id, 
  name, 
  format, 
  date, 
  teamCount, 
  location, 
  status,
  className
}) => {
  return (
    <div className={cn("tabby-card group", className)}>
      <Link 
        to={`/tournaments/${id}`} 
        className="flex justify-between items-start hover:no-underline"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("tabby-status-circle", statusColors[status])} />
            <span className="text-xs font-medium text-gray-500 capitalize">{status}</span>
          </div>
          <h3 className="font-semibold text-lg group-hover:text-tabby-secondary transition-colors">{name}</h3>
          <div className="tabby-badge-primary mt-2">{format}</div>
        </div>
        <ChevronRight className="text-gray-400 h-5 w-5 group-hover:text-tabby-secondary group-hover:translate-x-1 transition-all" />
      </Link>
      
      <div className="mt-6 space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{date}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-2" />
          <span>{teamCount} Teams</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Globe className="h-4 w-4 mr-2" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
});

OptimizedTournamentCard.displayName = 'OptimizedTournamentCard';