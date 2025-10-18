import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'node:fs';
import * as path from 'node:path';
import pLimit from 'p-limit';

import { GoogleSearchService } from '../services/google-search.service';

// Configure dotenv to load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Types
interface Place {
  title: string;
  street: string;
  postalCode: string;
  description?: string;
  reviews?: Array<{ rating: number; text: string; date?: string }>;
  openingHours?: OpeningHour[];
  rating?: number;
  skip?: boolean;
  [key: string]: unknown;
}

interface ProcessingOptions {
  batchSize?: number;
  maxConcurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
  model?: 'gemini-2.5-pro-preview-05-06';
  temperature?: number;
  topK?: number;
  topP?: number;
  enableGrounding?: boolean;
  searchTimeout?: number;
}

interface PromptTemplate {
  intro: string;
  structure: string[];
  style: string[];
}

interface OpeningHour {
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
}

class ProcessingError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

// Constants
const DEFAULT_OPTIONS: Required<ProcessingOptions> = {
  batchSize: 10,
  maxConcurrent: 3,
  retryAttempts: 3,
  retryDelay: 1000,
  model: 'gemini-2.5-pro-preview-05-06',
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  enableGrounding: true,
  searchTimeout: 5000,
};

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    intro: 'Create a unique, engaging description that captures the essence of',
    structure: [
      "Begin with an attention-grabbing introduction that positions the facility in Malaysia's healthcare landscape",
      'Develop a narrative around the patient experience and professional excellence',
      "Conclude with practical details while highlighting the facility's integration with the local community",
    ],
    style: [
      'Use vibrant, professional language',
      'Focus on creating a welcoming, trustworthy tone',
      'Emphasize the unique aspects of the facility',
    ],
  },
  {
    intro: 'Paint a compelling picture of the healthcare experience at',
    structure: [
      "Open with the facility's unique value proposition and specialization",
      'Explore the patient journey through facilities and services',
      'Round off with location benefits and accessibility advantages',
    ],
    style: [
      'Employ descriptive, yet precise medical terminology',
      'Maintain an authoritative but approachable voice',
      "Highlight the facility's role in the community",
    ],
  },
  {
    intro: 'Tell the story of excellence and care provided at',
    structure: [
      'Start with what makes this healthcare facility stand out',
      'Illustrate the quality of care through facilities and patient experiences',
      'Connect the practical aspects with the surrounding neighborhood',
    ],
    style: [
      'Balance technical expertise with readable content',
      'Create a narrative that builds trust',
      'Emphasize convenience and accessibility',
    ],
  },
];

// Utilities
function removeNewlineFromBeginning(str: string): string {
  return str.replace(/^\\n+/, '');
}

function formatTime(time: string | null): string {
  if (!time) return 'Closed';

  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return minutes === '00' ? `${hour12} ${ampm}` : `${hour12}:${minutes} ${ampm}`;
}

function formatTimeSlot(openTime: string | null, closeTime: string | null): string {
  if (!openTime || !closeTime) return 'Closed';

  const open = formatTime(openTime);
  const close = formatTime(closeTime);

  // Only remove AM/PM if both times are in the same period
  if (open.includes('AM') && close.includes('AM')) {
    return `${open.replace(' AM', '')} - ${close}`;
  }
  if (open.includes('PM') && close.includes('PM')) {
    return `${open.replace(' PM', '')} - ${close}`;
  }

  // Keep AM/PM when times span across periods
  return `${open} - ${close}`;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  attempts: number,
  delayMs: number,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (attempts <= 1) throw error;
    await delay(delayMs);
    return retryOperation(operation, attempts - 1, delayMs);
  }
}

// Google AI Configuration
function createGoogleAIClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new ProcessingError('Google AI API key is not configured');
  }

  return new GoogleGenerativeAI(apiKey);
}

// Processing Functions
async function generateDescription(
  place: Place,
  genAI: GoogleGenerativeAI,
  options: Required<ProcessingOptions>,
): Promise<string> {
  // Initialize Google Search service if grounding is enabled
  let searchService: GoogleSearchService | null = null;
  let searchResults = '';

  if (options.enableGrounding) {
    try {
      searchService = new GoogleSearchService();

      // Search for clinic information with timeout
      const searchPromise = Promise.all([
        searchService.searchClinic(place.title, `${place.street}, ${place.postalCode}`),
        searchService.searchClinicReviews(place.title, `${place.street}, ${place.postalCode}`),
        searchService.searchClinicServices(place.title, `${place.street}, ${place.postalCode}`),
      ]);

      const [clinicResults, reviewResults, serviceResults] = await Promise.race([
        searchPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Search timeout')), options.searchTimeout),
        ),
      ]);

      // Combine and format search results
      const allResults = [...clinicResults, ...reviewResults, ...serviceResults];
      searchResults = searchService.formatSearchResults(allResults);

      console.log(`🔍 Found ${allResults.length} search results for: ${place.title}`);
    } catch (error) {
      console.warn(`⚠️ Google Search grounding failed for ${place.title}:`, error);
      searchResults = 'No recent online information available.';
    }
  }
  // Calculate average rating if reviews exist
  const avgRating = place.reviews?.length
    ? (
        place.reviews.reduce((sum, review) => sum + review.rating, 0) / place.reviews.length
      ).toFixed(1)
    : place.rating?.toFixed(1);

  // Get the most recent reviews
  const recentReviews = place.reviews
    ?.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);

  // Format opening hours for the prompt
  const hoursByDay = place.openingHours?.reduce<Record<string, string[]>>(
    (acc: Record<string, string[]>, { day_of_week, open_time, close_time }: OpeningHour) => {
      const day = day_of_week.charAt(0).toUpperCase() + day_of_week.slice(1);
      const timeSlot = formatTimeSlot(open_time, close_time);

      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(timeSlot);
      return acc;
    },
    {},
  );

  const formattedHours = hoursByDay
    ? Object.entries(hoursByDay)
        .map(([day, times]) => `${day}: ${times.join(', ')}`)
        .join('\n')
    : 'Opening hours not available';

  // Select a random prompt template
  const template = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)];

  const prompt = `${template.intro} "${place.title}", a healthcare facility at ${place.street}, ${place.postalCode}, ${place.state} Malaysia.

Key Information:
${avgRating ? `★ Rating: ${avgRating}/5` : ''}
${formattedHours ? `⏰ Hours:\n${formattedHours}` : ''}
${recentReviews?.length ? `💬 Recent Feedback:${recentReviews.map((review) => `\n• "${(review.text ?? 'No text provided').slice(0, 100)}..."`).join('')}` : ''}
${searchResults ? `🔍 Recent Online Information:\n${searchResults}` : ''}

Writing Focus:
1. ${template.structure[0]}
2. ${template.structure[1]}
3. ${template.structure[2]}
4. ${template.style[0]}
5. ${template.style[1]}
6. ${template.style[2]}
7. Incorporate location details and neighborhood details naturally but avoid displaying full address and country
8. Include distinctive features and specializations
9. Optimize for local SEO with creative location mentions
10. If available, integrate patient feedback in a narrative style and be neutral and objective
11. Use the recent online information to enhance accuracy and relevance of the description

Location Context: ${place.street}, ${place.postalCode}, ${place.state} Malaysia`;

  const systemMessage = `You are an expert medical content writer and SEO specialist with deep knowledge of Malaysia's healthcare system. Your task is to create unique, engaging, and SEO-optimized descriptions for medical facilities.

Writing Guidelines:
- Write distinctive narratives that highlight each facility's unique attributes
- Construct varied sentence patterns and dynamic paragraph transitions
- Employ precise medical terminology while ensuring readability
- Begin with impactful location-specific introductions (avoid clichés like "nestled in" or "beacon of")
- Weave geographical context naturally into the narrative
- Present technical expertise in clear, accessible language
- Identify and emphasize distinguishing features
- Prioritize active voice and specific descriptions over generic phrases
- Maintain clinical professionalism while showcasing personality
- Include patient testimonials strategically within the narrative
- Adapt writing style to reflect medical specializations
- Match tone to facility type (e.g., authoritative for hospitals, personable for family clinics)
- When recent online information is provided, use it to enhance accuracy and provide current, relevant details
- Integrate search results naturally without directly quoting them
- Use search information to verify and supplement existing data

Output Format:
- Three distinct, well-flowing paragraphs
- Wrap each paragraph with <p></p> tags
- No additional formatting or line breaks
- Natural integration of key information
- Varied paragraph structures
- Engaging transitions between paragraphs`;

  return retryOperation(
    async () => {
      const model = genAI.getGenerativeModel({
        model: options.model,
        generationConfig: {
          temperature: options.temperature,
          topK: options.topK,
          topP: options.topP,
          maxOutputTokens: 800,
        },
      });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemMessage }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'I understand. I will follow these guidelines to create engaging and SEO-optimized descriptions for medical facilities.',
              },
            ],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new ProcessingError('Gemini response did not contain expected content');
      }

      return removeNewlineFromBeginning(text);
    },
    options.retryAttempts,
    options.retryDelay,
  );
}

async function processPlaces(
  places: Place[],
  genAI: GoogleGenerativeAI,
  options: Required<ProcessingOptions>,
): Promise<Place[]> {
  const limit = pLimit(options.maxConcurrent);
  const batches = Array.from({ length: Math.ceil(places.length / options.batchSize) }, (_, i) =>
    places.slice(i * options.batchSize, (i + 1) * options.batchSize),
  );

  const processedPlaces: Place[] = [];

  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

    const batchResults = await Promise.all(
      batch.map((place) =>
        limit(async () => {
          try {
            if (place.description && place.description.length > 1) return place;
            // if (place.skip) return place;
            const description = await generateDescription(place, genAI, options);
            console.log(`✓ Generated description for: ${place.title}`);

            return { ...place, description };
          } catch (error) {
            console.error(
              `✗ Failed to process ${place.title}:`,
              error instanceof Error ? error.message : error,
            );
            return place;
          }
        }),
      ),
    );

    processedPlaces.push(...batchResults);
  }

  return processedPlaces;
}

// Main Processing Function
async function processFile(inputFilename: string, options: ProcessingOptions = {}): Promise<void> {
  const mergedOptions: Required<ProcessingOptions> = { ...DEFAULT_OPTIONS, ...options };
  const parsedDataDir = path.resolve('./tasks/data/parsedData');

  try {
    // Initialize Google AI client
    const genAI = createGoogleAIClient();

    // Read and parse input file
    const rawdata = fs.readFileSync(path.join(parsedDataDir, inputFilename), 'utf8');
    const places: Place[] = JSON.parse(rawdata);

    console.log(`Starting processing of ${places.length} places...`);

    // Process places
    const processedPlaces = await processPlaces(places, genAI, mergedOptions);

    // Write output
    const outputPath = path.join(parsedDataDir, `final-${path.basename(inputFilename)}`);
    fs.writeFileSync(outputPath, JSON.stringify(processedPlaces, null, 2), 'utf-8');

    console.log(`✓ Processing complete. Output written to: ${outputPath}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
    } else {
      console.error('Processing Error:', error instanceof Error ? error.message : error);
    }
    process.exit(1);
  }
}

// CLI Handler
function main(): void {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command) {
    console.error('Please provide a file name.');
    console.error('Usage: npm run parse-data-gemini <filename> [--disable-grounding]');
    process.exit(1);
  }

  // Parse command line arguments
  const disableGrounding = args.includes('--disable-grounding');

  const filename = `filtered-processed-${command}.json`;

  const options: ProcessingOptions = {
    enableGrounding: !disableGrounding,
  };

  if (disableGrounding) {
    console.log('⚠️ Google Search grounding disabled');
  } else {
    console.log('🔍 Google Search grounding enabled');
  }

  processFile(filename, options).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

main();
