import { ReactNode } from 'react';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Error Alert Component
export const ErrorAlert = ({ title = 'Error', message, onDismiss }: { 
  title?: string, 
  message: string, 
  onDismiss?: () => void 
}) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
        <p className="mt-1 text-sm text-red-700">{message}</p>
      </div>
      {onDismiss && (
        <div className="ml-auto flex-shrink-0">
          <button
            className="bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  </div>
);

// Success Alert Component
export const SuccessAlert = ({ title = 'Success', message, onDismiss }: { 
  title?: string, 
  message: string, 
  onDismiss?: () => void 
}) => (
  <div className="bg-green-50 border border-green-200 rounded-md p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-green-800">{title}</h3>
        <p className="mt-1 text-sm text-green-700">{message}</p>
      </div>
      {onDismiss && (
        <div className="ml-auto flex-shrink-0">
          <button
            className="bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
            onClick={onDismiss}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  </div>
);

// Card Component
export const Card = ({ 
  children, 
  className = '', 
  hover = false 
}: { 
  children: ReactNode, 
  className?: string, 
  hover?: boolean 
}) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}>
    {children}
  </div>
);

// Badge Component
export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md' 
}: { 
  children: ReactNode, 
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info',
  size?: 'sm' | 'md' | 'lg'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

// Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ''
}: {
  children: ReactNode,
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost',
  size?: 'sm' | 'md' | 'lg',
  disabled?: boolean,
  loading?: boolean,
  onClick?: () => void,
  type?: 'button' | 'submit' | 'reset',
  className?: string
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

// Copy Button Component
export const CopyButton = ({ 
  text, 
  className = '' 
}: { 
  text: string, 
  className?: string 
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors ${className}`}
    >
      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Copy
    </button>
  );
};

// Stats Component
export const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend
}: {
  title: string,
  value: string | number,
  subtitle?: string,
  icon?: ReactNode,
  trend?: 'up' | 'down' | 'neutral'
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className={`text-xs ${trend ? trendColors[trend] : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};