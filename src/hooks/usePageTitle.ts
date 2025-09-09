import { useEffect } from 'react';

/**
 * Custom hook to update the document title
 * @param title - The title to set for the page
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const baseTitle = 'Insights Intelligence';
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;
  }, [title]);
};