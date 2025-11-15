'use client';

import React, { useState, useEffect } from 'react';
import { LinkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface LinkPreviewProps {
  url: string;
  className?: string;
}

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url, className = '' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract domain from URL
  const domain = url ? new URL(url).hostname : '';

  useEffect(() => {
    if (showPreview && !metadata && !loading) {
      fetchLinkMetadata();
    }
  }, [showPreview]);

  const fetchLinkMetadata = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch metadata from a simple proxy service
      // Note: In production, you'd want to use a proper API or server-side solution
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        const data = await response.json();
        setMetadata(data);
      } else {
        // Fallback: extract basic info from URL
        setMetadata({
          domain: domain,
          title: url.split('/').pop() || url,
        });
      }
    } catch (err) {
      console.error('Failed to fetch link metadata:', err);
      setError('Failed to load preview');
      // Fallback metadata
      setMetadata({
        domain: domain,
        title: url.split('/').pop() || url,
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayUrl = () => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  };

  return (
    <div className="relative inline-block">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline break-all font-medium ${className}`}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <LinkIcon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate flex-1">{getDisplayUrl()}</span>
        <ArrowTopRightOnSquareIcon className="w-3 h-3 flex-shrink-0" />
      </a>

      {/* Preview Tooltip */}
      {showPreview && (
        <div className="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg top-full left-0 mt-2">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium truncate">
                {domain}
              </span>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Metadata */}
            {metadata && !loading && (
              <>
                {metadata.image && (
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                    <img
                      src={metadata.image}
                      alt={metadata.title || 'Link preview'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken images
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {metadata.title && (
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {metadata.title}
                  </h4>
                )}
                
                {metadata.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {metadata.description}
                  </p>
                )}
              </>
            )}

            {/* Visit Link Button */}
            <div className="pt-2 border-t border-gray-100">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                Visit Link
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkPreview;