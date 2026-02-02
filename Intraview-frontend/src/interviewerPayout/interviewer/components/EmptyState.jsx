import React from 'react';
import { FileX, Search, AlertCircle } from 'lucide-react';

/**
 * EmptyState Component
 * Reusable empty state for lists and tables
 */
const EmptyState = ({ 
  icon: Icon = FileX,
  title = 'No data found',
  description = 'There are no items to display.',
  action = null,
  variant = 'default' // 'default' | 'search' | 'error'
}) => {
  const variantConfig = {
    default: {
      iconClass: 'text-gray-400 dark:text-gray-600',
      titleClass: 'text-gray-900 dark:text-white',
      descClass: 'text-gray-600 dark:text-gray-400',
    },
    search: {
      iconClass: 'text-blue-400 dark:text-blue-600',
      titleClass: 'text-gray-900 dark:text-white',
      descClass: 'text-gray-600 dark:text-gray-400',
    },
    error: {
      iconClass: 'text-red-400 dark:text-red-600',
      titleClass: 'text-gray-900 dark:text-white',
      descClass: 'text-gray-600 dark:text-gray-400',
    },
  };

  const config = variantConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 ${config.iconClass}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${config.titleClass}`}>
        {title}
      </h3>
      <p className={`text-sm text-center max-w-md mb-6 ${config.descClass}`}>
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
