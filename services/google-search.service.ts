import axios from 'axios';

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

export class GoogleSearchService {
  private readonly apiKey: string;
  private readonly searchEngineId: string;

  constructor() {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey) {
      throw new Error('Google Search API key is missing');
    }

    if (!searchEngineId) {
      throw new Error('Google Search Engine ID is missing');
    }

    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
  }

  async searchClinic(clinicName: string, location: string): Promise<GoogleSearchResult[]> {
    try {
      const query = `${clinicName} ${location} dental clinic reviews services`;

      const response = await axios.get<GoogleSearchResponse>(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: this.apiKey,
            cx: this.searchEngineId,
            q: query,
            num: 5, // Limit to 5 results for efficiency
            dateRestrict: 'm6', // Restrict to last 6 months for current info
            sort: 'date', // Sort by date to get most recent info
          },
        },
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Google Search API error:', error);
      return [];
    }
  }

  async searchClinicReviews(clinicName: string, location: string): Promise<GoogleSearchResult[]> {
    try {
      const query = `${clinicName} ${location} reviews patient experience`;

      const response = await axios.get<GoogleSearchResponse>(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: this.apiKey,
            cx: this.searchEngineId,
            q: query,
            num: 3, // Limit to 3 results for reviews
            dateRestrict: 'm3', // Restrict to last 3 months for recent reviews
            sort: 'date',
          },
        },
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Google Search API error for reviews:', error);
      return [];
    }
  }

  async searchClinicServices(clinicName: string, location: string): Promise<GoogleSearchResult[]> {
    try {
      const query = `${clinicName} ${location} dental services treatments`;

      const response = await axios.get<GoogleSearchResponse>(
        'https://www.googleapis.com/customsearch/v1',
        {
          params: {
            key: this.apiKey,
            cx: this.searchEngineId,
            q: query,
            num: 3, // Limit to 3 results for services
            dateRestrict: 'm6',
            sort: 'relevance',
          },
        },
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Google Search API error for services:', error);
      return [];
    }
  }

  formatSearchResults(results: GoogleSearchResult[]): string {
    if (!results.length) {
      return 'No recent information found online.';
    }

    return results
      .map((result, index) => {
        const snippet =
          result.snippet.length > 200 ? result.snippet.substring(0, 200) + '...' : result.snippet;

        return `${index + 1}. ${result.title}\n   ${snippet}`;
      })
      .join('\n\n');
  }
}
