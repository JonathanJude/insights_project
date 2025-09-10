import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface NavigationItemData {
  id: string;
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSolid?: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    color: 'green' | 'blue' | 'yellow' | 'red' | 'indigo' | 'purple';
  };
  enhanced?: boolean;
  subItems?: NavigationItemData[];
  emoji?: string;
}

interface NavigationItemProps {
  item: NavigationItemData;
  onLinkClick?: () => void;
  level?: number;
  className?: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  onLinkClick,
  level = 0,
  className = ''
}) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Check if current item or any sub-item is active
  const isActive = item.href ? location.pathname === item.href : false;
  const hasActiveSubItem = item.subItems?.some(subItem => 
    subItem.href && location.pathname === subItem.href
  );
  
  // Auto-expand if has active sub-item
  useEffect(() => {
    if (hasActiveSubItem) {
      setIsExpanded(true);
    }
  }, [hasActiveSubItem]);

  const handleToggle = () => {
    if (item.subItems && item.subItems.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (item.subItems && item.subItems.length > 0) {
          handleToggle();
        } else if (item.href) {
          // Navigate to the link
          window.location.href = item.href;
        }
        break;
      case 'ArrowRight':
        if (item.subItems && item.subItems.length > 0 && !isExpanded) {
          setIsExpanded(true);
        }
        break;
      case 'ArrowLeft':
        if (item.subItems && item.subItems.length > 0 && isExpanded) {
          setIsExpanded(false);
        }
        break;
    }
  };

  const getBadgeClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const renderContent = () => {
    const Icon = isActive && item.iconSolid ? item.iconSolid : item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const indentClass = level > 0 ? `ml-${level * 4}` : '';
    
    const contentClasses = `
      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
      ${level === 0 ? '' : 'ml-6'}
      ${
        isActive
          ? level === 0
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400'
            : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-r-2 border-purple-700 dark:border-purple-400'
          : 'text-primary hover:text-primary hover:bg-secondary hover:translate-x-1'
      }
      ${className}
    `;

    const content = (
      <>
        {/* Icon or Emoji */}
        {item.emoji ? (
          <span className="mr-3 text-lg transition-transform group-hover:scale-110">
            {item.emoji}
          </span>
        ) : Icon ? (
          <Icon
            className={`
              mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-105
              ${
                isActive
                  ? level === 0
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-purple-500 dark:text-purple-400'
                  : 'text-secondary group-hover:text-primary'
              }
            `}
          />
        ) : null}

        {/* Name */}
        <span className="flex-1">{item.name}</span>

        {/* Enhanced indicator */}
        {item.enhanced && (
          <span className="mr-2 text-sm transition-transform group-hover:scale-110">✨</span>
        )}

        {/* Badge */}
        {item.badge && (
          <span className={`
            ml-2 text-xs px-2 py-1 rounded-full font-medium shadow-sm transition-transform group-hover:scale-105
            ${getBadgeClasses(item.badge.color)}
          `}>
            {item.badge.text}
          </span>
        )}

        {/* Expand/Collapse Icon */}
        {hasSubItems && (
          <div className="ml-2 transition-transform duration-200 ease-in-out">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </div>
        )}
      </>
    );

    if (item.href && !hasSubItems) {
      return (
        <Link
          to={item.href}
          onClick={onLinkClick}
          className={contentClasses}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="menuitem"
          aria-label={`Navigate to ${item.name}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        onClick={hasSubItems ? handleToggle : undefined}
        className={`${contentClasses} w-full text-left`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="menuitem"
        aria-expanded={hasSubItems ? isExpanded : undefined}
        aria-haspopup={hasSubItems ? 'menu' : undefined}
        aria-label={hasSubItems ? `${isExpanded ? 'Collapse' : 'Expand'} ${item.name}` : item.name}
      >
        {content}
      </button>
    );
  };

  return (
    <div ref={itemRef} className="navigation-item">
      {renderContent()}
      
      {/* Sub-items */}
      {item.subItems && item.subItems.length > 0 && (
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded 
              ? 'max-h-96 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}
          role="menu"
          aria-label={`${item.name} submenu`}
        >
          <div className="space-y-1 pb-2">
            {item.subItems.map((subItem) => (
              <NavigationItem
                key={subItem.id}
                item={subItem}
                onLinkClick={onLinkClick}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationItem;