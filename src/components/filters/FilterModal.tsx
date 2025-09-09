import React from 'react';
import FiltersPanel from './FiltersPanel';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Filter Options" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          <FiltersPanel
            isOpen={true}
            onClose={onClose}
            variant="modal"
            showSummary={true}
            className="relative"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterModal;