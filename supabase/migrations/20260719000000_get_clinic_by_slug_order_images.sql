DROP FUNCTION IF EXISTS get_clinic_by_slug CASCADE;

CREATE OR REPLACE FUNCTION get_clinic_by_slug(slug_input text, status_input text, review_limit integer)
RETURNS json AS $$
DECLARE
  clinic_record json;
BEGIN
  SELECT json_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'description', c.description,
    'postal_code', c.postal_code,
    'address', c.address,
    'neighborhood', c.neighborhood,
    'phone', c.phone,
    'email', c.email,
    'website', c.website,
    'latitude', c.latitude,
    'longitude', c.longitude,
    'rating', c.rating,
    'review_count', c.review_count,
    'featured_video', c.featured_video,
    'youtube_url', c.youtube_url,
    'facebook_url', c.facebook_url,
    'instagram_url', c.instagram_url,
    'source', c.source,
    'is_permanently_closed', c.is_permanently_closed,
    'open_on_public_holidays', c.open_on_public_holidays,
    'is_active', c.is_active,
    'is_featured', c.is_featured,
    'area', json_build_object(
      'id', a.id,
      'name', a.name,
      'slug', a.slug
    ),
    'state', json_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug
    ),
    'doctors', (
      SELECT json_agg(json_build_object(
        'id', d.id,
        'name', d.name,
        'slug', d.slug
      ))
      FROM clinic_doctor_relations cdr
      JOIN clinic_doctors d ON d.id = cdr.doctor_id
      WHERE cdr.clinic_id = c.id
    ),
    'hours', (
      SELECT json_agg(json_build_object(
        'day_of_week', h.day_of_week,
        'open_time', h.open_time,
        'close_time', h.close_time
      ))
      FROM clinic_hours h
      WHERE h.clinic_id = c.id
    ),
    'special_hours', (
      SELECT json_agg(json_build_object(
        'date', sh.date,
        'is_closed', sh.is_closed,
        'open_time', sh.open_time,
        'close_time', sh.close_time
      ))
      FROM clinic_special_hours sh
      WHERE sh.clinic_id = c.id
    ),
    'services', (
      SELECT json_agg(json_build_object(
        'id', s.id,
        'name', s.name,
        'slug', s.slug
      ))
      FROM clinic_service_relations csr
      JOIN clinic_services s ON s.id = csr.service_id
      WHERE csr.clinic_id = c.id
    ),
    'images', (
      SELECT json_agg(image_row)
      FROM (
        SELECT json_build_object(
          'id', ci.id,
          'image_url', ci.image_url,
          'imagekit_file_id', ci.imagekit_file_id,
          'display_order', ci.display_order
        ) AS image_row
        FROM clinic_images ci
        WHERE ci.clinic_id = c.id
        ORDER BY ci.display_order ASC, ci.created_at ASC
      ) sub
    ),
    'reviews', (
      SELECT json_agg(r)
      FROM (
        SELECT json_build_object(
          'author_name', cr.author_name,
          'rating', cr.rating,
          'email', cr.email,
          'text', cr.text,
          'review_time', cr.review_time,
          'status', cr.status
        ) AS r
        FROM clinic_reviews cr
        WHERE cr.clinic_id = c.id AND cr.status = 'approved'
        ORDER BY cr.review_time DESC
        LIMIT review_limit
      ) sub
    )
  )
  INTO clinic_record
  FROM clinics c
  LEFT JOIN areas a ON c.area_id = a.id
  LEFT JOIN states s ON c.state_id = s.id
  WHERE c.slug = slug_input AND c.is_active = true AND c.status = status_input;

  RETURN clinic_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
