import {
    CheckIcon,
    ClipboardDocumentIcon,
    EnvelopeIcon,
    ShareIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import type { EnhancedShareableState, ShareableLinkOptions } from '../../lib/shareableLinkUtils';
import {
    copyShareableLink,
    EnhancedShareableLinkGenerator,
    generateShareableLink,
    shareViaEmail,
    shareViaSocial
} from '../../lib/shareableLinkUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareableState: Partial<EnhancedShareableState>;
  title?: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareableState,
  title = 'Multi-Dimensional Political Analysis',
  description = 'Explore comprehensive political sentiment analysis with geographic, demographic, and temporal insights.'
}) => {
  const [shareOptions, setShareOptions] = useState<ShareableLinkOptions>({
    includeFilters: true,
    includePreferences: true,
    includeMetadata: true,
    customTitle: title,
    customDescription: description,
    expirationHours: 24 * 7, // 1 week
    compress: true
  });

  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [shortLink, setShortLink] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate links when modal opens or options change
  React.useEffect(() => {
    if (isOpen) {
      generateLinks();
    }
  }, [isOpen, shareOptions]);

  const generateLinks = async () => {
    try {
      setIsGenerating(true);
      setError('');

      // Generate full link
      const fullLink = generateShareableLink(shareableState, shareOptions);
      setGeneratedLink(fullLink);

      // Generate short link
      try {
        const short = await EnhancedShareableLinkGenerator.generateShortLink(shareableState, shareOptions);
        setShortLink(short);
      } catch (err) {
        console.warn('Failed to generate short link:', err);
        setShortLink('');
      }

      // Generate QR code
      const qrUrl = EnhancedShareableLinkGenerator.generateQRCode(fullLink);
      setQrCodeUrl(qrUrl);

    } catch (err) {
      console.error('Failed to generate links:', err);
      setError('Failed to generate shareable links');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async (link: string, type: string) => {
    try {
      await copyShareableLink(link);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleEmailShare = () => {
    try {
      if (!emailRecipient) {
        setError('Please enter an email address');
        return;
      }

      if (!EnhancedShareableLinkGenerator.validateEmail(emailRecipient)) {
        setError('Please enter a valid email address');
        return;
      }

      const subject = emailSubject || `${title} - Shared Analysis`;
      const message = emailMessage || `I've shared a multi-dimensional political analysis with you. Click the link below to view:\n\n${generatedLink}`;

      shareViaEmail(generatedLink, emailRecipient, subject, message);
      setError('');
    } catch (err) {
      setError('Failed to share via email');
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    try {
      shareViaSocial(platform, generatedLink, title, description);
    } catch (err) {
      setError(`Failed to share via ${platform}`);
    }
  };

  const updateShareOptions = (updates: Partial<ShareableLinkOptions>) => {
    setShareOptions(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ShareIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Share Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your multi-dimensional analysis with others
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Share Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Share Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include filters
                  </label>
                  <input
                    type="checkbox"
                    checked={shareOptions.includeFilters}
                    onChange={(e) => updateShareOptions({ includeFilters: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include preferences
                  </label>
                  <input
                    type="checkbox"
                    checked={shareOptions.includePreferences}
                    onChange={(e) => updateShareOptions({ includePreferences: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include metadata
                  </label>
                  <input
                    type="checkbox"
                    checked={shareOptions.includeMetadata}
                    onChange={(e) => updateShareOptions({ includeMetadata: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiration (hours)
                  </label>
                  <select
                    value={shareOptions.expirationHours}
                    onChange={(e) => updateShareOptions({ expirationHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                  >
                    <option value={24}>24 hours</option>
                    <option value={24 * 3}>3 days</option>
                    <option value={24 * 7}>1 week</option>
                    <option value={24 * 30}>1 month</option>
                    <option value={0}>Never expires</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Compress link
                  </label>
                  <input
                    type="checkbox"
                    checked={shareOptions.compress}
                    onChange={(e) => updateShareOptions({ compress: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Generated Links */}
          {!isGenerating && generatedLink && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Shareable Links
              </h3>
              
              {/* Full Link */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                    />
                    <button
                      onClick={() => handleCopyLink(generatedLink, 'full')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {copySuccess === 'full' ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Short Link */}
                {shortLink && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Short Link
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shortLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                      />
                      <button
                        onClick={() => handleCopyLink(shortLink, 'short')}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {copySuccess === 'short' ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QR Code */}
          {qrCodeUrl && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                QR Code
              </h3>
              <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for shareable link"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Scan with your mobile device to open the analysis
              </p>
            </div>
          )}

          {/* Social Sharing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Share on Social Media
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-sm font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center px-4 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-sm font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center justify-center px-4 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
              
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Email Sharing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Share via Email
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Multi-Dimensional Political Analysis - Shared Link"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="I've shared a multi-dimensional political analysis with you..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                />
              </div>
              
              <button
                onClick={handleEmailShare}
                disabled={!emailRecipient}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <EnvelopeIcon className="h-4 w-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Links expire in {shareOptions.expirationHours === 0 ? 'never' : `${shareOptions.expirationHours} hours`}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;