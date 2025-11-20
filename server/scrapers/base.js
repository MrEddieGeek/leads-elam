import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Base scraper class with common functionality
 */
export class BaseScraper {
  constructor(name) {
    this.name = name;
    this.delay = parseInt(process.env.SCRAPING_DELAY) || 2000;
    this.userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  /**
   * Fetch HTML content from a URL
   */
  async fetchHTML(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        },
        timeout: 10000
      });

      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Wait for a specified time
   */
  async wait(ms = this.delay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean and normalize text
   */
  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Extract email from text
   */
  extractEmail(text) {
    if (!text) return null;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const match = text.match(emailRegex);
    return match ? match[1] : null;
  }

  /**
   * Extract phone from text (Mexican phone numbers)
   */
  extractPhone(text) {
    if (!text) return null;
    // Mexican phone number patterns
    const phoneRegex = /(?:\+?52[\s.-]?)?(?:\d{2,3}[\s.-]?)?\d{3,4}[\s.-]?\d{4}/;
    const match = text.match(phoneRegex);
    return match ? this.cleanText(match[0]) : null;
  }

  /**
   * Abstract method to be implemented by child classes
   */
  async scrape(params) {
    throw new Error('scrape() method must be implemented by child class');
  }
}

export default BaseScraper;
