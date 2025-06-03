
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AuditAction = 
  | 'tournament_created'
  | 'tournament_updated'
  | 'tournament_deleted'
  | 'team_added'
  | 'team_removed'
  | 'round_created'
  | 'draw_generated'
  | 'scores_updated'
  | 'user_role_changed';

interface AuditLogEntry {
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  details?: Record<string, any>;
  ip_address?: string;
}

/**
 * Hook for logging administrative actions for audit trail
 * Tracks important changes for security and compliance
 */
export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async (entry: AuditLogEntry) => {
    if (!user) return;

    try {
      const auditEntry = {
        user_id: user.id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        details: entry.details || {},
        ip_address: entry.ip_address || 'unknown',
        timestamp: new Date().toISOString()
      };

      // For now, log to console - implement database logging later
      console.log('Audit Log:', auditEntry);

      // TODO: Implement database audit logging
      // const { error } = await supabase
      //   .from('audit_logs')
      //   .insert(auditEntry);

      // if (error) {
      //   console.error('Failed to log audit entry:', error);
      // }
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  };

  return {
    logAction
  };
}
