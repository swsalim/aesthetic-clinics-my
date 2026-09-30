import { ReviewClinicSummary, ReviewWithClinic } from '@/types/clinic';

import { createServerClient } from '@/lib/supabase';

const REVIEW_SELECT =
  'id, clinic_id, author_name, rating, text, email, review_time, source, status, created_at, modified_at, clinic:clinics!clinic_reviews_clinic_id_fkey(id, name, slug)';

type ReviewRow = Omit<ReviewWithClinic, 'clinic'> & {
  clinic: ReviewClinicSummary | ReviewClinicSummary[] | null;
};

function toReviewWithClinic(row: ReviewRow): ReviewWithClinic {
  const clinic = Array.isArray(row.clinic) ? (row.clinic[0] ?? null) : row.clinic;

  return {
    id: row.id,
    clinic_id: row.clinic_id,
    author_name: row.author_name,
    rating: row.rating,
    text: row.text,
    email: row.email,
    review_time: row.review_time,
    source: row.source,
    status: row.status,
    created_at: row.created_at,
    modified_at: row.modified_at,
    clinic,
  };
}

export async function getDashboardReviews(): Promise<ReviewWithClinic[]> {
  const supabase = await createServerClient();
  const pageSize = 1000;
  const reviews: ReviewWithClinic[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('clinic_reviews')
      .select(REVIEW_SELECT)
      .order('review_time', { ascending: false, nullsFirst: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching reviews:', error);
      if (reviews.length === 0) {
        throw new Error('Failed to load reviews');
      }
      break;
    }

    const rows = ((data ?? []) as unknown as ReviewRow[]).map(toReviewWithClinic);
    reviews.push(...rows);

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return reviews;
}

export async function getDashboardReview(id: string): Promise<ReviewWithClinic | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('clinic_reviews')
    .select(REVIEW_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching review:', error);
    return null;
  }

  if (!data) return null;

  return toReviewWithClinic(data as unknown as ReviewRow);
}
