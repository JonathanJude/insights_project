import { useCallback, useEffect } from 'react';
import { NavigationItemData } from '../components/layout/NavigationItem';
import { useNavigationStore } from '../stores/navigationStore';

interface UseKeyboardNavigationProps {
  navigationItems: NavigationItemData[];
  isOpen?: boolean;
}

export const useKeyboardNavigation = ({ 
  navigationItems, 
  isOpen = true 
}: UseKeyboardNavigationProps) => {
  const { focusedItemId, setFocusedItem, expandedSections, toggleSection } = useNavigationStore();

  // Flatten navigation items for easier keyboard navigation
  const flattenItems = useCallback((items: NavigationItemData[], level = 0): Array<{ item: NavigationItemData; level: number }> => {
    const flattened: Array<{ item: NavigationItemData; level: number }> = [];
    
    items.forEach(item => {
      flattened.push({ item, level });
      
      if (item.subItems && expandedSections.includes(item.id)) {
        flattened.push(...flattenItems(item.subItems, level + 1));
      }
    });
    
    return flattened;
  }, [expandedSections]);

  const flatItems = flattenItems(navigationItems);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const currentIndex = focusedItemId 
      ? flatItems.findIndex(({ item }) => item.id === focusedItemId)
      : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < flatItems.length - 1 ? currentIndex + 1 : 0;
        setFocusedItem(flatItems[nextIndex]?.item.id || null);
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : flatItems.length - 1;
        setFocusedItem(flatItems[prevIndex]?.item.id || null);
        break;

      case 'ArrowRight':
        if (focusedItemId) {
          const currentItem = flatItems.find(({ item }) => item.id === focusedItemId)?.item;
          if (currentItem?.subItems && !expandedSections.includes(currentItem.id)) {
            event.preventDefault();
            toggleSection(currentItem.id);
          }
        }
        break;

      case 'ArrowLeft':
        if (focusedItemId) {
          const currentItem = flatItems.find(({ item }) => item.id === focusedItemId)?.item;
          if (currentItem?.subItems && expandedSections.includes(currentItem.id)) {
            event.preventDefault();
            toggleSection(currentItem.id);
          }
        }
        break;

      case 'Enter':
      case ' ':
        if (focusedItemId) {
          event.preventDefault();
          const currentItem = flatItems.find(({ item }) => item.id === focusedItemId)?.item;
          
          if (currentItem?.href) {
            // Navigate to the link
            window.location.href = currentItem.href;
          } else if (currentItem?.subItems) {
            // Toggle expansion
            toggleSection(currentItem.id);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        setFocusedItem(null);
        break;

      case 'Home':
        event.preventDefault();
        setFocusedItem(flatItems[0]?.item.id || null);
        break;

      case 'End':
        event.preventDefault();
        setFocusedItem(flatItems[flatItems.length - 1]?.item.id || null);
        break;
    }
  }, [isOpen, focusedItemId, flatItems, setFocusedItem, toggleSection, expandedSections]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Focus management
  const focusItem = useCallback((itemId: string) => {
    setFocusedItem(itemId);
    
    // Focus the actual DOM element
    const element = document.querySelector(`[data-navigation-id="${itemId}"]`) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, [setFocusedItem]);

  const clearFocus = useCallback(() => {
    setFocusedItem(null);
  }, [setFocusedItem]);

  return {
    focusedItemId,
    focusItem,
    clearFocus,
    flatItems,
  };
};