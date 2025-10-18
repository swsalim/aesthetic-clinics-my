import fs from 'node:fs';
import * as path from 'node:path';

import { slugify } from '../lib/utils';

// Types and Interfaces
interface Location {
  lat: number;
  lng: number;
}

interface Review {
  name: string;
  stars: number;
  text: string;
  publishedAtDate: string;
  reviewOrigin: string;
  reviewImageUrls: string[];
  [key: string]: unknown;
}

interface OpeningHour {
  day: string;
  hours: string;
}

interface RawPlaceData {
  title: string;
  website?: string;
  location: Location;
  openingHours: OpeningHour[];
  reviews?: Review[];
  placeId: string;
  phoneUnformatted?: string;
  permanentlyClosed: boolean;
  address: string;
  street: string;
  neighborhood: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
  locatedIn: string;
  reviewsCount: number;
  totalScore: number;
  imageUrls: string;
  [key: string]: string | number | boolean | Location | OpeningHour[] | Review[] | undefined;
}

interface ProcessedOpeningHour {
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
}

interface ProcessedPlaceData {
  title: string;
  website: string;
  latitude: number;
  longitude: number;
  openingHours: ProcessedOpeningHour[];
  placeId: string;
  slug: string;
  skip?: boolean;
  reviewsCount: number;
  totalScore: number;
  reviews?: Review[];
  phone?: string;
  permanentlyClosed: boolean;
  address: string;
  neighborhood: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
  locatedIn: string;
  images: string;
  [key: string]: string | number | boolean | Review[] | ProcessedOpeningHour[] | undefined;
}

const KEYS_TO_DELETE = [
  'popularTimesHistogram',
  'popularTimesLiveText',
  'popularTimesLivePercent',
  'peopleAlsoSearch',
  'additionalInfo',
  'location',
  'subTitle',
  'description',
  'menu',
  'categoryName',
  'locatedIn',
  'plusCode',
  'placeId',
  'categories',
  'cid',
  'imageCategories',
  'searchPageUrl',
  'searchPageLoadedUrl',
  'searchString',
  'scrapedAt',
  'imagesCount',
  'webResults',
  'orderBy',
  'reviewsTags',
  'questionsAndAnswers',
  'updatesFromCustomers',
  'reserveTableUrl',
  'googleFoodUrl',
  'hotelStars',
  'rank',
  'claimThisBusiness',
  'hotelDescription',
  'checkInDate',
  'checkOutDate',
  'similarHotelsNearby',
  'hotelReviewSummary',
  'hotelAds',
  'placesTags',
  'gasPrices',
  'price',
  'phoneUnformatted',
  'temporarilyClosed',
  'fid',
  'reviewsDistribution',
  'additionalOpeningHours',
  'openingHoursBusinessConfirmationText',
  'url',
  'isAdvertisement',
  'language',
  'imageUrl',
  'kgmid',
  'parentPlaceUrl',
  'tableReservationLinks',
  'bookingLinks',
  'userPlaceNote',
  'restaurantData',
  'ownerUpdates',
  'imageUrls',
  'leadsEnrichment',
  'description',
] as const;

// Utility Functions
function parseTimeComponent(time: string): {
  hour: number;
  minute: string;
  meridian?: 'AM' | 'PM';
} {
  const meridianMatch = time.match(/([AP]M)/i);
  const meridian = meridianMatch ? (meridianMatch[0].toUpperCase() as 'AM' | 'PM') : undefined;
  const cleanTime = time.replace(/[AP]M/i, '').trim();
  const [hourStr, minuteStr = '00'] = cleanTime.split(':');

  let hour = parseInt(hourStr, 10);
  if (meridian === 'PM' && hour !== 12) hour += 12;
  else if (meridian === 'AM' && hour === 12) hour = 0;

  return { hour, minute: minuteStr.trim(), meridian };
}

function formatTime(hour: number, minute: string): string {
  return `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function parseTimeRange(timeRange: string): Pick<ProcessedOpeningHour, 'open_time' | 'close_time'> {
  if (timeRange.toLowerCase() === 'closed') {
    return { open_time: null, close_time: null };
  }

  const [start, end] = timeRange.split('to').map((t) => t.trim());
  const startTime = parseTimeComponent(start);
  const endTime = parseTimeComponent(end);

  // If start time has no meridian, use end time's meridian
  if (!startTime.meridian && endTime.meridian) {
    startTime.hour += endTime.meridian === 'PM' && startTime.hour < 12 ? 12 : 0;
  }

  return {
    open_time: formatTime(startTime.hour, startTime.minute),
    close_time: formatTime(endTime.hour, endTime.minute),
  };
}

function processOpeningHours(openingHours: OpeningHour[]): ProcessedOpeningHour[] {
  const processedHours: ProcessedOpeningHour[] = [];

  for (const oh of openingHours) {
    const day = oh.day.toLowerCase();
    const hours = oh.hours;

    if (hours.toLowerCase() === 'closed') {
      processedHours.push({
        day_of_week: day,
        open_time: null,
        close_time: null,
      });
      continue;
    }

    // Split multiple shifts
    const shifts = hours.split(',').map((s) => s.trim());

    for (const shift of shifts) {
      const { open_time, close_time } = parseTimeRange(shift);
      processedHours.push({
        day_of_week: day,
        open_time,
        close_time,
      });
    }
  }

  return processedHours;
}

// Core Processing Functions
function processPlace(place: RawPlaceData): ProcessedPlaceData | null {
  try {
    if (place.openingHours.length === 0) {
      return null;
    }

    const processedPlace: ProcessedPlaceData = {
      title: place.title,
      website: place.website?.includes('healthhub') ? '' : place.website || '',
      latitude: place.location.lat,
      longitude: place.location.lng,
      openingHours: processOpeningHours(place.openingHours),
      slug: slugify(place.title),
      skip: place.website ? true : false,
      placeId: place.placeId || '',
      phone: place.phoneUnformatted || '',
      permanentlyClosed: place.permanentlyClosed,
      address: place.address,
      neighborhood: place.neighborhood,
      city: place.city,
      postalCode: place.postalCode,
      state: place.state,
      countryCode: place.countryCode,
      locatedIn: place.locatedIn,
      reviewsCount: place.reviewsCount,
      totalScore: place.totalScore,
      images: place.imageUrls || '',
    };

    // Keep reviews array if it exists
    if (place.reviews?.length) {
      processedPlace.reviews = place.reviews.map((review) => ({
        name: review.name,
        stars: review.stars,
        text: review.text,
        publishedAtDate: review.publishedAtDate,
        reviewOrigin: review.reviewOrigin,
        reviewImageUrls: review.reviewImageUrls,
      }));
    }

    // Copy any remaining fields that weren't deleted
    Object.entries(place).forEach(([key, value]) => {
      if (
        typeof key === 'string' &&
        !KEYS_TO_DELETE.includes(key as (typeof KEYS_TO_DELETE)[number]) &&
        !(key in processedPlace) &&
        key !== 'reviews'
      ) {
        processedPlace[key] = String(value);
      }
    });

    return processedPlace;
  } catch (error) {
    console.error(`Error processing place "${place.title}":`, error);
    return null;
  }
}

function processData(jsonData: RawPlaceData[]): ProcessedPlaceData[] {
  console.log(`Processing ${jsonData.length} places...`);
  const startTime = Date.now();

  const processedData = jsonData
    .map((place, index) => {
      if ((index + 1) % 100 === 0) {
        console.log(`Processed ${index + 1}/${jsonData.length} places...`);
      }
      return processPlace(place);
    })
    .filter((place): place is ProcessedPlaceData => place !== null);

  const endTime = Date.now();
  console.log(`Processing completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);
  console.log(`Successfully processed ${processedData.length}/${jsonData.length} places`);

  return processedData;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

async function processFile(inputFileName: string): Promise<void> {
  try {
    const inputFileFullPath = path.resolve(inputFileName);
    console.log(`Reading file: ${inputFileFullPath}`);

    const fileContent = await fs.promises.readFile(inputFileFullPath, 'utf-8');
    const jsonData = JSON.parse(fileContent) as RawPlaceData[];

    const processedData = processData(jsonData);

    const parsedDataDir = path.resolve('./tasks/data/parsedData');
    await ensureDirectoryExists(parsedDataDir);

    const outputFileName = `processed-${path.basename(inputFileName)}`;
    const outputFileFullPath = path.join(parsedDataDir, outputFileName);

    await fs.promises.writeFile(
      outputFileFullPath,
      JSON.stringify(processedData, null, 2),
      'utf-8',
    );

    console.log(`Successfully saved processed data to: ${outputFileFullPath}`);
  } catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
  }
}

// Main execution
function main(): void {
  const command = process.argv[2];

  if (!command) {
    console.error('Please provide a file name.');
    process.exit(1);
  }

  const filename = `./tasks/data/${command}.json`;
  processFile(filename).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

main();
