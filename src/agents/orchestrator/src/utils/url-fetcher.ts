/**
 * URL Fetcher Utility
 *
 * Fetches and parses web content using Jina Reader API
 * (Free, no authentication required, converts HTML to clean Markdown)
 */

import { createLogger } from '../../../../utils/logger';

const logger = createLogger('URLFetcher');

export interface URLFetchResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  excerpt?: string;
  error?: string;
}

/**
 * Fetch URL content using Jina Reader API
 *
 * Jina Reader API: https://r.jina.ai/{url}
 * - Free, no API key needed
 * - Converts HTML to clean Markdown
 * - Removes ads, navigation, footers
 * - Extracts main content only
 *
 * @param url - The URL to fetch
 * @returns Parsed content as markdown
 */
export async function fetchURLContent(url: string): Promise<URLFetchResult> {
  try {
    // Validate URL
    let parsedURL: URL;
    try {
      parsedURL = new URL(url);
    } catch (e) {
      return {
        success: false,
        url,
        error: 'Invalid URL format'
      };
    }

    logger.info('Fetching URL content', { url: parsedURL.toString() });

    // Use Jina Reader API
    const jinaURL = `https://r.jina.ai/${parsedURL.toString()}`;

    const response = await fetch(jinaURL, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown' // Request markdown format
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');

    let content: string;
    let title: string | undefined;

    if (contentType?.includes('application/json')) {
      // JSON response with metadata
      const data = await response.json();
      content = data.content || data.text || data.markdown || '';
      title = data.title;
    } else {
      // Plain text/markdown response
      content = await response.text();
    }

    // Extract title from markdown if not provided
    if (!title) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }

    // Create excerpt (first 300 chars)
    const excerpt = content.substring(0, 300).trim() + (content.length > 300 ? '...' : '');

    logger.info('URL content fetched successfully', {
      url: parsedURL.toString(),
      contentLength: content.length,
      hasTitle: !!title
    });

    return {
      success: true,
      url: parsedURL.toString(),
      title,
      content,
      excerpt
    };

  } catch (error: any) {
    logger.error('URL fetch failed', {
      url,
      error: error.message
    });

    return {
      success: false,
      url,
      error: error.message || 'Failed to fetch URL'
    };
  }
}

/**
 * Extract URLs from text using regex
 */
export function extractURLs(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  return matches || [];
}

/**
 * Check if message contains URLs
 */
export function containsURL(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  return urlRegex.test(text);
}
