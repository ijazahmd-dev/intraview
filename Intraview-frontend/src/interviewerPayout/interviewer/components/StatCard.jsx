import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Reusable StatCard Component
 * Used across all payout pages for displaying statistics
 * 
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Optional subtitle/description
 * @param {React.ReactNode} icon - Icon component
 * @param {string} trend - 'up' | 'down' | null
 * @param {string} trendValue - Trend percentage or text
 * @param {string} colorClass - Tailwind color class for icon background
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null,
  trendValue = null,
  colorClass = 'bg-primary/10 text-primary',
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>

          {/* Value */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </h3>

          {/* Subtitle or Trend */}
          {subtitle && !trend && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {trend && trendValue && (
            <div className="flex items-center gap-1 text-xs">
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {trendValue}
              </span>
              {subtitle && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
