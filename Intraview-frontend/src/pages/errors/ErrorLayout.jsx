import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const ErrorLayout = ({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Premium dark gradient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-teal-700/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Animated Icon Container */}
        {Icon && (
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-24 h-24 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl flex items-center justify-center shadow-2xl">
                <Icon className="w-10 h-10 text-teal-400" />
              </div>
            </div>
          </div>
        )}

        {/* Text Content */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md mx-auto">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryAction && (
            <button
              onClick={
                primaryAction.onClick
                  ? primaryAction.onClick
                  : () => navigate(primaryAction.href || '/')
              }
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {primaryAction.icon && <primaryAction.icon className="w-5 h-5" />}
              {primaryAction.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={
                secondaryAction.onClick
                  ? secondaryAction.onClick
                  : () => navigate(secondaryAction.href || -1)
              }
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-gray-300 font-semibold rounded-xl border border-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-5 h-5" />}
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
      
      {/* Brand Footer inside Error pages */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-gray-600 text-sm pointer-events-none">
        <span className="font-semibold text-gray-500">IntraView</span> &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default ErrorLayout;
