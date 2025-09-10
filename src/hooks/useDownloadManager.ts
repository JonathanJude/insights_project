import { useCallback, useState } from 'react';
import type { DownloadItem } from '../components/ui/DownloadManager';

/**
 * Hook for managing download operations and tracking download progress
 */
export const useDownloadManager = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  /**
   * Add a new download to the queue
   */
  const addDownload = useCallback((
    filename: string,
    format: string,
    size: string = 'Unknown'
  ): string => {
    const id = `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newDownload: DownloadItem = {
      id,
      filename,
      format,
      size,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    };

    setDownloads(prev => [newDownload, ...prev]);
    return id;
  }, []);

  /**
   * Update download progress
   */
  const updateDownloadProgress = useCallback((id: string, progress: number) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { 
            ...download, 
            progress: Math.min(100, Math.max(0, progress)),
            status: progress >= 100 ? 'completed' : 'downloading'
          }
        : download
    ));
  }, []);

  /**
   * Mark download as completed
   */
  const completeDownload = useCallback((id: string, downloadUrl?: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { 
            ...download, 
            status: 'completed',
            progress: 100,
            downloadUrl
          }
        : download
    ));
  }, []);

  /**
   * Mark download as failed
   */
  const failDownload = useCallback((id: string, error: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { 
            ...download, 
            status: 'failed',
            error
          }
        : download
    ));
  }, []);

  /**
   * Start download process
   */
  const startDownload = useCallback((id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { 
            ...download, 
            status: 'downloading',
            progress: 0
          }
        : download
    ));
  }, []);

  /**
   * Retry a failed download
   */
  const retryDownload = useCallback((id: string) => {
    setDownloads(prev => prev.map(download => 
      download.id === id 
        ? { 
            ...download, 
            status: 'pending',
            progress: 0,
            error: undefined
          }
        : download
    ));
  }, []);

  /**
   * Remove a download from the list
   */
  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
  }, []);

  /**
   * Clear all downloads
   */
  const clearAllDownloads = useCallback(() => {
    setDownloads([]);
  }, []);

  /**
   * Clear completed downloads
   */
  const clearCompletedDownloads = useCallback(() => {
    setDownloads(prev => prev.filter(download => download.status !== 'completed'));
  }, []);

  /**
   * Get download by ID
   */
  const getDownload = useCallback((id: string): DownloadItem | undefined => {
    return downloads.find(download => download.id === id);
  }, [downloads]);

  /**
   * Get downloads by status
   */
  const getDownloadsByStatus = useCallback((status: DownloadItem['status']): DownloadItem[] => {
    return downloads.filter(download => download.status === status);
  }, [downloads]);

  /**
   * Get download statistics
   */
  const getDownloadStats = useCallback(() => {
    const total = downloads.length;
    const pending = downloads.filter(d => d.status === 'pending').length;
    const downloading = downloads.filter(d => d.status === 'downloading').length;
    const completed = downloads.filter(d => d.status === 'completed').length;
    const failed = downloads.filter(d => d.status === 'failed').length;
    const active = pending + downloading;

    return {
      total,
      pending,
      downloading,
      completed,
      failed,
      active
    };
  }, [downloads]);

  /**
   * Simulate download progress (for demo purposes)
   */
  const simulateDownload = useCallback(async (
    id: string,
    duration: number = 3000,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      startDownload(id);
      
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        
        updateDownloadProgress(id, progress);
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          completeDownload(id);
          resolve();
        }
      }, 100);

      // Simulate potential failure (5% chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          failDownload(id, 'Network error occurred');
          reject(new Error('Download failed'));
        }, Math.random() * duration);
      }
    });
  }, [startDownload, updateDownloadProgress, completeDownload, failDownload]);

  /**
   * Download file with progress tracking
   */
  const downloadFile = useCallback(async (
    filename: string,
    format: string,
    content: string | Blob,
    mimeType: string = 'text/plain'
  ): Promise<string> => {
    const downloadId = addDownload(filename, format, 'Calculating...');
    
    try {
      startDownload(downloadId);
      
      // Calculate file size
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      const size = `${(blob.size / 1024).toFixed(1)} KB`;
      
      // Update size
      setDownloads(prev => prev.map(download => 
        download.id === downloadId 
          ? { ...download, size }
          : download
      ));

      // Simulate progress for user feedback
      for (let progress = 0; progress <= 100; progress += 10) {
        updateDownloadProgress(downloadId, progress);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Create download URL
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Complete download
      completeDownload(downloadId, url);
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000); // 1 minute
      
      return downloadId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      failDownload(downloadId, errorMessage);
      throw error;
    }
  }, [addDownload, startDownload, updateDownloadProgress, completeDownload, failDownload]);

  /**
   * Batch download multiple files
   */
  const batchDownload = useCallback(async (
    files: Array<{
      filename: string;
      format: string;
      content: string | Blob;
      mimeType?: string;
    }>
  ): Promise<string[]> => {
    const downloadIds: string[] = [];
    
    for (const file of files) {
      try {
        const id = await downloadFile(
          file.filename,
          file.format,
          file.content,
          file.mimeType
        );
        downloadIds.push(id);
      } catch (error) {
        console.error(`Failed to download ${file.filename}:`, error);
      }
    }
    
    return downloadIds;
  }, [downloadFile]);

  /**
   * Export download history
   */
  const exportDownloadHistory = useCallback(() => {
    const history = downloads.map(download => ({
      filename: download.filename,
      format: download.format,
      size: download.size,
      status: download.status,
      createdAt: download.createdAt.toISOString(),
      error: download.error
    }));

    const csvContent = [
      'Filename,Format,Size,Status,Created At,Error',
      ...history.map(item => 
        `"${item.filename}","${item.format}","${item.size}","${item.status}","${item.createdAt}","${item.error || ''}"`
      )
    ].join('\n');

    downloadFile('download-history.csv', 'csv', csvContent, 'text/csv');
  }, [downloads, downloadFile]);

  return {
    // State
    downloads,
    
    // Actions
    addDownload,
    updateDownloadProgress,
    completeDownload,
    failDownload,
    startDownload,
    retryDownload,
    removeDownload,
    clearAllDownloads,
    clearCompletedDownloads,
    
    // Utilities
    getDownload,
    getDownloadsByStatus,
    getDownloadStats,
    
    // Download operations
    downloadFile,
    batchDownload,
    simulateDownload,
    exportDownloadHistory
  };
};

export default useDownloadManager;