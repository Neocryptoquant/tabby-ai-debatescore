
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperationFeedbackProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  className?: string;
}

/**
 * Component that provides visual feedback for database operations
 * Shows loading, success, or error states with appropriate icons and animations
 */
export const OperationFeedback = ({
  status,
  successMessage = "Operation completed successfully",
  errorMessage = "Operation failed",
  loadingMessage = "Processing...",
  className
}: OperationFeedbackProps) => {
  if (status === 'idle') return null;

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-md text-sm font-medium transition-all duration-300",
      {
        "bg-blue-50 text-blue-700 border border-blue-200": status === 'loading',
        "bg-green-50 text-green-700 border border-green-200 animate-fade-in": status === 'success',
        "bg-red-50 text-red-700 border border-red-200": status === 'error',
      },
      className
    )}>
      {status === 'loading' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingMessage}
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="h-4 w-4 animate-scale-in" />
          {successMessage}
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="h-4 w-4" />
          {errorMessage}
        </>
      )}
    </div>
  );
};
