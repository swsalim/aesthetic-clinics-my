import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'node:fs';
import * as path from 'node:path';
import { OpenAI } from 'openai';
import pLimit from 'p-limit';

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
  model?:
    | 'gpt-4'
    | 'gpt-4-1106-preview'
    | 'gpt-3.5-turbo-1106'
    | 'gpt-5'
    | 'gpt-5-mini'
    | 'gpt-5-nano';
  temperature?: number;
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
  model: 'gpt-5-mini',
  temperature: 0.7,
};

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    intro: 'Create a unique, engaging description that captures the essence of',
    structure: [
      "Begin with an attention-grabbing introduction that positions the facility in Malaysia's healthcare landscape",
      'Develop a narrative around the patient experience and professional excellence',
      'Acknowledge patient sentiment—whether positive, mixed, or critical—based on available feedback',
      'Balance strengths with constructive transparency where appropriate',
      "Conclude with practical details while highlighting the facility's integration with the local community",
    ],
    style: [
      'Use vibrant, professional language',
      'Focus on creating a welcoming, trustworthy tone',
      'Emphasize the unique aspects of the facility',
      'Maintain a neutral and professional tone—highlight positives without overstating, and be honest where needed',
      'Avoid marketing fluff; aim for fact-based, trustworthy writing',
    ],
  },
  {
    intro: 'Paint a compelling picture of the healthcare experience at',
    structure: [
      "Open with the facility's unique value proposition and specialization",
      'Explore the patient journey through facilities and services',
      'Acknowledge patient sentiment—whether positive, mixed, or critical—based on available feedback',
      'Balance strengths with constructive transparency where appropriate',
      'Round off with location benefits and accessibility advantages',
    ],
    style: [
      'Employ descriptive, yet precise medical terminology',
      'Maintain an authoritative but approachable voice',
      "Highlight the facility's role in the community",
      'Maintain a neutral and professional tone—highlight positives without overstating, and be honest where needed',
      'Avoid marketing fluff; aim for fact-based, trustworthy writing',
    ],
  },
  {
    intro: 'Tell the story of excellence and care provided at',
    structure: [
      'Start with what makes this healthcare facility stand out',
      'Illustrate the quality of care through facilities and patient experiences',
      'Acknowledge patient sentiment—whether positive, mixed, or critical—based on available feedback',
      'Balance strengths with constructive transparency where appropriate',
      'Connect the practical aspects with the surrounding neighborhood',
    ],
    style: [
      'Balance technical expertise with readable content',
      'Create a narrative that builds trust',
      'Emphasize convenience and accessibility',
      'Maintain a neutral and professional tone—highlight positives without overstating, and be honest where needed',
      'Avoid marketing fluff; aim for fact-based, trustworthy writing',
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

// OpenAI Configuration
function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ProcessingError('OpenAI API key is not configured');
  }

  return new OpenAI({ apiKey });
}

// Processing Functions
async function generateDescription(
  place: Place,
  openai: OpenAI,
  options: Required<ProcessingOptions>,
): Promise<string> {
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

Writing Focus:
1. ${template.structure[0]}
2. ${template.structure[1]}
3. ${template.structure[2]}
4. ${template.structure[3]}
5. ${template.structure[4]}
6. ${template.style[0]}
7. ${template.style[1]}
8. ${template.style[2]}
9. ${template.style[3]}
10. ${template.style[4]}
11. Incorporate location details and neighborhood details naturally but avoid displaying full address and country
12. Include distinctive features and specializations
13. Optimize for local SEO with creative location mentions
14. If available, integrate patient feedback in a narrative style and be neutral and objective

Location Context: ${place.street}, ${place.postalCode}, ${place.state} Malaysia`;

  const systemMessage = `You are an expert medical content writer and SEO specialist with deep knowledge of Malaysia's healthcare system. Your task is to create unique, engaging, objective and SEO-optimized descriptions for medical facilities.

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

Output Format:
- Three short, natural-sounding paragraphs (2–3 sentences each)
- Total length under 150 words
- Wrap each paragraph with <p></p> tags
- Avoid filler or overly long sentences
- No extra formatting or line breaks
- Vary sentence structure to keep it engaging`;

  return retryOperation(
    async () => {
      const response = await openai.chat.completions.create({
        model: options.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 800,
        stream: false,
        n: 1,
      });

      const completionText = response.choices[0]?.message?.content;
      if (!completionText) {
        throw new ProcessingError('OpenAI response did not contain expected content');
      }

      return removeNewlineFromBeginning(completionText);
    },
    options.retryAttempts,
    options.retryDelay,
  );
}

async function processPlaces(
  places: Place[],
  openai: OpenAI,
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
            const description = await generateDescription(place, openai, options);
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
    // Initialize OpenAI client
    const openai = createOpenAIClient();

    // Read and parse input file
    const rawdata = fs.readFileSync(path.join(parsedDataDir, inputFilename), 'utf8');
    const places: Place[] = JSON.parse(rawdata);

    console.log(`Starting processing of ${places.length} places...`);

    // Process places
    const processedPlaces = await processPlaces(places, openai, mergedOptions);

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

  if (!command) {
    console.error('Please provide a file name.');
    process.exit(1);
  }

  const filename = `filtered-processed-${command}.json`;
  processFile(filename).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

main();
