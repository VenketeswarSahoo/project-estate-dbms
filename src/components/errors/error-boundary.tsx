"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";

interface ErrorBoundaryError {
  message: string;
  statusCode?: number;
  [key: string]: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
  componentName?: string;
  errorFilter?: (error: unknown) => boolean;
}

/* ---------------------------- Default Fallback UI --------------------------- */
const DefaultFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const message =
    typeof error === "object" && error && "message" in error
      ? (error as any).message
      : "Something went wrong";

  return (
    <div
      className="flex flex-col items-center justify-center w-full text-center px-6 py-8 rounded-2xl border shadow-sm
      border-red-300/40 bg-gradient-to-br from-red-50 to-white
      dark:from-red-950 dark:to-zinc-900 dark:border-red-900/40 transition-colors duration-300"
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
        <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
        Oops! Something went wrong
      </h3>

      <p className="text-sm text-red-600 dark:text-red-400/90 mb-6 max-w-xs leading-relaxed">
        {message || "An unexpected error occurred. Please try again."}
      </p>

      <Button
        size="sm"
        variant="outline"
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 text-sm border-red-300 text-red-700 hover:bg-red-100
          dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors duration-200"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
};

/* ----------------------------- Error Boundary ------------------------------- */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  componentName = "Component",
  onRetry,
  errorFilter,
}) => {
  return (
    <ReactErrorBoundary
      fallbackRender={(fallbackProps) => {
        // Allow error filtering
        if (errorFilter && !errorFilter(fallbackProps.error)) {
          throw fallbackProps.error;
        }
        return fallback ? fallback : <DefaultFallback {...fallbackProps} />;
      }}
      onError={(error, info) => {
        console.error(`❌ Error in ${componentName}:`, error, info);
      }}
      onReset={onRetry}
    >
      {children}
    </ReactErrorBoundary>
  );
};

/* ---------------------------- useErrorBoundary Hook -------------------------- */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<ErrorBoundaryError | null>(null);

  const resetError = () => setError(null);

  const captureError = (error: unknown) => {
    let normalizedError: ErrorBoundaryError = {
      message: "Unknown error occurred",
    };

    if (error instanceof Error) {
      normalizedError = { message: error.message };
    } else if (typeof error === "string") {
      normalizedError = { message: error };
    } else if (typeof error === "object" && error !== null) {
      normalizedError = {
        message:
          "message" in error && typeof (error as any).message === "string"
            ? (error as any).message
            : JSON.stringify(error),
        ...(error as any),
      };
    }

    console.error("❌ Captured error:", normalizedError);
    setError(normalizedError);
  };

  if (error) {
    throw error;
  }

  return { captureError, resetError };
};

/* ---------------------------- HOC: withErrorBoundary ------------------------ */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: Omit<ErrorBoundaryProps, "children">
) => {
  return (props: P) => (
    <ErrorBoundary componentName={componentName} {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

/* ------------------------- HOC: withErrorBoundaryHook ----------------------- */
export const withErrorBoundaryHook = <
  P extends { captureError?: (error: unknown) => void }
>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  return (props: Omit<P, "captureError">) => {
    const { captureError, resetError } = useErrorBoundary();
    return (
      <ErrorBoundary componentName={componentName} onRetry={resetError}>
        <Component {...(props as P)} captureError={captureError} />
      </ErrorBoundary>
    );
  };
};

/* ---------------------- HOC: withErrorBoundaryFallback ---------------------- */
export const withErrorBoundaryFallback = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode,
  componentName?: string,
  options?: Omit<ErrorBoundaryProps, "children" | "fallback">
) => {
  return (props: P) => (
    <ErrorBoundary
      componentName={componentName}
      fallback={fallback}
      {...options}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
};

/* ------------------- HOC: withErrorBoundaryFallbackHook --------------------- */
export const withErrorBoundaryFallbackHook = <
  P extends { captureError?: (error: unknown) => void }
>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode,
  componentName?: string
) => {
  return (props: Omit<P, "captureError">) => {
    const { captureError, resetError } = useErrorBoundary();
    return (
      <ErrorBoundary
        componentName={componentName}
        fallback={fallback}
        onRetry={resetError}
      >
        <Component {...(props as P)} captureError={captureError} />
      </ErrorBoundary>
    );
  };
};
