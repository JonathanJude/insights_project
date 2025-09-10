import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useFilterStore } from '../../stores/filterStore';
import MobileFilterModal from './MobileFilterModal';

interface MobileFilterButtonProps {
    showEnhancedFilters?: boolean;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

const MobileFilterButton: React.FC<MobileFilterButtonProps> = ({
    showEnhancedFilters = false,
    className = '',
    variant = 'primary',
    size = 'md'
}) => {
    const isMobile = useIsMobile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { hasActiveFilters, getActiveFilterCount } = useFilterStore();

    // Enhanced filter count (would come from enhanced filter store in real implementation)
    const enhancedFilterCount = 0; // Placeholder
    const totalActiveFilters = getActiveFilterCount() + enhancedFilterCount;

    const getButtonClasses = () => {
        const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 touch-manipulation';

        const sizeClasses = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-2.5 text-base',
            lg: 'px-6 py-3 text-lg'
        };

        const variantClasses = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
            secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-sm',
            outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100'
        };

        return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
    };

    const getBadgeClasses = () => {
        const baseClasses = 'absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full';

        if (totalActiveFilters > 99) {
            return `${baseClasses} px-1`;
        }

        return baseClasses;
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Don't render on desktop unless explicitly needed
    if (!isMobile) {
        return null;
    }

    return (
        <>
            <button
                onClick={handleOpenModal}
                className={`${getButtonClasses()} ${className}`}
                aria-label={`Open filters${totalActiveFilters > 0 ? ` (${totalActiveFilters} active)` : ''}`}
            >
                {/* Filter icon */}
                <svg
                    className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} mr-2`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                </svg>

                <span>
                    {showEnhancedFilters ? 'Enhanced Filters' : 'Filters'}
                </span>

                {/* Enhanced indicator */}
                {showEnhancedFilters && (
                    <span className="ml-1 text-xs">✨</span>
                )}

                {/* Active filter count badge */}
                {totalActiveFilters > 0 && (
                    <span className={getBadgeClasses()}>
                        {totalActiveFilters > 99 ? '99+' : totalActiveFilters}
                    </span>
                )}
            </button>

            {/* Mobile Filter Modal */}
            <MobileFilterModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                showEnhancedFilters={showEnhancedFilters}
            />
        </>
    );
};

// Floating Action Button variant for mobile
export const MobileFilterFAB: React.FC<{
    showEnhancedFilters?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}> = ({
    showEnhancedFilters = false,
    position = 'bottom-right'
}) => {
        const isMobile = useIsMobile();
        const [isModalOpen, setIsModalOpen] = useState(false);
        const { getActiveFilterCount } = useFilterStore();

        const enhancedFilterCount = 0; // Placeholder
        const totalActiveFilters = getActiveFilterCount() + enhancedFilterCount;

        const getPositionClasses = () => {
            const baseClasses = 'fixed z-40';

            switch (position) {
                case 'bottom-left':
                    return `${baseClasses} bottom-6 left-6`;
                case 'bottom-center':
                    return `${baseClasses} bottom-6 left-1/2 transform -translate-x-1/2`;
                case 'bottom-right':
                default:
                    return `${baseClasses} bottom-6 right-6`;
            }
        };

        if (!isMobile) {
            return null;
        }

        return (
            <>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`${getPositionClasses()} w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center justify-center`}
                    aria-label={`Open filters${totalActiveFilters > 0 ? ` (${totalActiveFilters} active)` : ''}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                        />
                    </svg>

                    {/* Active filter count badge */}
                    {totalActiveFilters > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full px-1">
                            {totalActiveFilters > 99 ? '99+' : totalActiveFilters}
                        </span>
                    )}

                    {/* Enhanced indicator */}
                    {showEnhancedFilters && (
                        <span className="absolute -top-1 -left-1 text-xs">✨</span>
                    )}
                </button>

                <MobileFilterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    showEnhancedFilters={showEnhancedFilters}
                />
            </>
        );
    };

// Hook for managing mobile filter state
export const useMobileFilters = () => {
    const isMobile = useIsMobile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { hasActiveFilters, getActiveFilterCount, clearAllFilters } = useFilterStore();

    const openFilters = () => setIsModalOpen(true);
    const closeFilters = () => setIsModalOpen(false);
    const toggleFilters = () => setIsModalOpen(!isModalOpen);

    return {
        isMobile,
        isModalOpen,
        hasActiveFilters: hasActiveFilters(),
        activeFilterCount: getActiveFilterCount(),
        openFilters,
        closeFilters,
        toggleFilters,
        clearAllFilters
    };
};

export default MobileFilterButton;