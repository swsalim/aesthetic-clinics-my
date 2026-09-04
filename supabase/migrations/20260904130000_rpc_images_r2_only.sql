-- Image payloads: keep ImageKit columns + add R2 columns (non-breaking).
-- Apply manually in Supabase SQL editor.

CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic_slug(
  clinic_slug_param text,
  status_param text DEFAULT 'approved'::text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  doctors_data jsonb;
BEGIN
  WITH doctor_clinic_data AS (
    SELECT
      cd.id,
      cd.name,
      cd.slug,
      cd.bio,
      cd.specialty,
      cd.qualification,
      cd.featured_video,
      cd.is_active,
      cd.is_featured,
      cd.status,
      cd.created_at,
      cd.modified_at,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cdi.id,
              'image_url', cdi.image_url,
              'imagekit_file_id', cdi.imagekit_file_id,
              'r2_url', cdi.r2_url,
              'r2_key', cdi.r2_key
            ) ORDER BY cdi.display_order ASC
          )
          FROM clinic_doctor_images cdi
          WHERE cdi.doctor_id = cd.id
        ),
        '[]'::jsonb
      ) AS images,
      jsonb_agg(
        jsonb_build_object(
          'clinic_id', c.id,
          'clinics', jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'address', c.address,
            'neighborhood', c.neighborhood,
            'postal_code', c.postal_code,
            'phone', c.phone,
            'email', c.email,
            'latitude', c.latitude,
            'longitude', c.longitude,
            'rating', c.rating,
            'review_count', c.review_count,
            'is_permanently_closed', c.is_permanently_closed,
            'is_featured', c.is_featured,
            'open_on_public_holidays', c.open_on_public_holidays,
            'images', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', ci.id,
                    'image_url', ci.image_url,
                    'imagekit_file_id', ci.imagekit_file_id,
                    'r2_url', ci.r2_url,
                    'r2_key', ci.r2_key
                  ) ORDER BY ci.display_order ASC
                )
                FROM clinic_images ci
                WHERE ci.clinic_id = c.id
              ),
              '[]'::jsonb
            ),
            'area', CASE
              WHEN a.id IS NOT NULL THEN
                jsonb_build_object('name', a.name)
              ELSE NULL
            END,
            'state', CASE
              WHEN s.id IS NOT NULL THEN
                jsonb_build_object('name', s.name)
              ELSE NULL
            END
          )
        )
      ) AS clinic_doctor_relations
    FROM clinic_doctors cd
    INNER JOIN clinic_doctor_relations cdr ON cd.id = cdr.doctor_id
    INNER JOIN clinics c ON cdr.clinic_id = c.id
    LEFT JOIN areas a ON c.area_id = a.id
    LEFT JOIN states s ON c.state_id = s.id
    WHERE cd.is_active = true
      AND cd.status = status_param
      AND c.slug = clinic_slug_param
    GROUP BY cd.id, cd.name, cd.slug, cd.bio, cd.specialty, cd.qualification,
             cd.featured_video, cd.is_active, cd.is_featured,
             cd.status, cd.created_at, cd.modified_at
    ORDER BY cd.name ASC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', dcd.id,
      'name', dcd.name,
      'slug', dcd.slug,
      'bio', dcd.bio,
      'specialty', dcd.specialty,
      'qualification', dcd.qualification,
      'images', dcd.images,
      'featured_video', dcd.featured_video,
      'is_active', dcd.is_active,
      'is_featured', dcd.is_featured,
      'status', dcd.status,
      'created_at', dcd.created_at,
      'modified_at', dcd.modified_at,
      'clinic_doctor_relations', dcd.clinic_doctor_relations
    )
  )
  INTO doctors_data
  FROM doctor_clinic_data dcd;

  RETURN COALESCE(doctors_data, '[]'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_nearby_clinics(
  clinic_latitude double precision,
  clinic_longitude double precision,
  radius_km double precision,
  result_limit integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  latitude numeric,
  longitude numeric,
  distance_km double precision,
  area_id uuid,
  area_name text,
  area_slug text,
  state_id uuid,
  state_name text,
  state_slug text,
  address text,
  neighborhood text,
  city text,
  postal_code text,
  phone text,
  rating numeric,
  open_on_public_holidays boolean,
  is_permanently_closed boolean,
  is_featured boolean,
  is_active boolean,
  status text,
  hours jsonb,
  images jsonb
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.latitude,
    c.longitude,
    ST_Distance(
      ST_Point(clinic_longitude, clinic_latitude)::geography,
      ST_Point(c.longitude, c.latitude)::geography
    ) / 1000 AS distance_km,
    c.area_id,
    a.name AS area_name,
    a.slug AS area_slug,
    c.state_id,
    s.name AS state_name,
    s.slug AS state_slug,
    c.address,
    c.neighborhood,
    c.city,
    c.postal_code,
    c.phone,
    c.rating,
    c.open_on_public_holidays,
    c.is_permanently_closed,
    c.is_featured,
    c.is_active,
    c.status,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'day_of_week', ch.day_of_week,
          'open_time', ch.open_time::text,
          'close_time', ch.close_time::text
        ) ORDER BY ch.day_of_week
      ) FILTER (WHERE ch.id IS NOT NULL),
      '[]'::jsonb
    ) AS hours,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', cdi.id,
            'image_url', cdi.image_url,
            'imagekit_file_id', cdi.imagekit_file_id,
            'r2_url', cdi.r2_url,
            'r2_key', cdi.r2_key
          ) ORDER BY cdi.display_order ASC
        )
        FROM clinic_images cdi
        WHERE cdi.clinic_id = c.id
      ),
      '[]'::jsonb
    ) AS images
  FROM clinics c
  LEFT JOIN areas a ON c.area_id = a.id
  LEFT JOIN states s ON c.state_id = s.id
  LEFT JOIN clinic_hours ch ON c.id = ch.clinic_id
  WHERE c.latitude IS NOT NULL
    AND c.longitude IS NOT NULL
    AND c.status = 'approved'
    AND c.is_active = true
    AND ST_DWithin(
      ST_Point(clinic_longitude, clinic_latitude)::geography,
      ST_Point(c.longitude, c.latitude)::geography,
      radius_km * 1000
    )
  GROUP BY
    c.id, c.name, c.slug, c.latitude, c.longitude, c.area_id, c.state_id,
    a.name, a.slug, s.name, s.slug, c.address, c.neighborhood,
    c.city, c.postal_code, c.rating, c.open_on_public_holidays,
    c.is_permanently_closed, c.is_featured, c.is_active, c.status
  ORDER BY ST_Distance(
    ST_Point(clinic_longitude, clinic_latitude)::geography,
    ST_Point(c.longitude, c.latitude)::geography
  ) / 1000
  LIMIT result_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_ranged_area_metadata_by_slug(
  area_slug text,
  from_index integer,
  to_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  area_record jsonb;
  clinics_array jsonb;
  total_clinics int;
BEGIN
  -- Full area row (includes legacy image fields + r2_*) plus nested state with both.
  SELECT to_jsonb(a) || jsonb_build_object(
    'state', jsonb_build_object(
      'name', s.name,
      'slug', s.slug,
      'thumbnail_image', s.thumbnail_image,
      'banner_image', s.banner_image,
      'image', s.image,
      'imagekit_file_id', s.imagekit_file_id,
      'r2_url', s.r2_url,
      'r2_key', s.r2_key
    )
  )
  INTO area_record
  FROM areas a
  JOIN states s ON s.id = a.state_id
  WHERE a.slug = area_slug;

  IF area_record IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*)
  INTO total_clinics
  FROM clinics c
  WHERE c.area_id = (SELECT id FROM areas WHERE slug = area_slug)
    AND c.status = 'approved';

  SELECT jsonb_agg(clinic_data)
  INTO clinics_array
  FROM (
    SELECT jsonb_build_object(
      'name', c.name,
      'slug', c.slug,
      'description', c.description,
      'status', c.status,
      'postal_code', c.postal_code,
      'address', c.address,
      'phone', c.phone,
      'rating', c.rating,
      'is_featured', c.is_featured,
      'is_permanently_closed', c.is_permanently_closed,
      'open_on_public_holidays', c.open_on_public_holidays,
      'modified_at', c.modified_at,
      'area', jsonb_build_object('name', a.name),
      'state', jsonb_build_object('name', s.name),
      'hours', (
        SELECT jsonb_agg(jsonb_build_object(
          'day_of_week', h.day_of_week,
          'open_time', h.open_time,
          'close_time', h.close_time
        ))
        FROM clinic_hours h
        WHERE h.clinic_id = c.id
      ),
      'special_hours', (
        SELECT jsonb_agg(jsonb_build_object(
          'date', sh.date,
          'is_closed', sh.is_closed,
          'open_time', sh.open_time,
          'close_time', sh.close_time
        ))
        FROM clinic_special_hours sh
        WHERE sh.clinic_id = c.id
      ),
      'images', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cdi.id,
              'image_url', cdi.image_url,
              'imagekit_file_id', cdi.imagekit_file_id,
              'r2_url', cdi.r2_url,
              'r2_key', cdi.r2_key
            ) ORDER BY cdi.display_order ASC
          )
          FROM clinic_images cdi
          WHERE cdi.clinic_id = c.id
        ),
        '[]'::jsonb
      )
    ) AS clinic_data
    FROM clinics c
    JOIN areas a ON a.id = c.area_id
    JOIN states s ON s.id = c.state_id
    WHERE c.area_id = (SELECT id FROM areas WHERE slug = area_slug)
      AND c.status = 'approved'
    ORDER BY c.modified_at DESC
    OFFSET from_index
    LIMIT (to_index - from_index + 1)
  ) AS clinic_list;

  RETURN area_record || jsonb_build_object(
    'clinics', coalesce(clinics_array, '[]'::jsonb),
    'total_clinics', total_clinics
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_ranged_doctor_by_state_slug(
  state_slug_param text,
  from_index_param integer,
  to_index_param integer,
  status_param text DEFAULT 'approved'::text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  total_count bigint;
  doctors_data jsonb;
BEGIN
  SELECT COUNT(DISTINCT cd.id)
  INTO total_count
  FROM clinic_doctors cd
  INNER JOIN clinic_doctor_relations cdr ON cd.id = cdr.doctor_id
  INNER JOIN clinics c ON cdr.clinic_id = c.id
  INNER JOIN states s ON c.state_id = s.id
  WHERE cd.is_active = true
    AND cd.status = status_param
    AND s.slug = state_slug_param;

  WITH doctor_base AS (
    SELECT DISTINCT
      cd.id,
      cd.name,
      cd.slug,
      cd.bio,
      cd.specialty,
      cd.qualification,
      cd.featured_video,
      cd.is_active,
      cd.is_featured,
      cd.status,
      cd.created_at,
      cd.modified_at
    FROM clinic_doctors cd
    INNER JOIN clinic_doctor_relations cdr ON cd.id = cdr.doctor_id
    INNER JOIN clinics c ON cdr.clinic_id = c.id
    INNER JOIN states s ON c.state_id = s.id
    WHERE cd.is_active = true
      AND cd.status = status_param
      AND s.slug = state_slug_param
    ORDER BY cd.modified_at DESC
    OFFSET from_index_param
    LIMIT (to_index_param - from_index_param + 1)
  ),
  doctor_with_clinics AS (
    SELECT
      db.*,
      jsonb_agg(
        jsonb_build_object(
          'clinic_id', c.id,
          'clinics', jsonb_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'address', c.address,
            'neighborhood', c.neighborhood,
            'postal_code', c.postal_code,
            'phone', c.phone,
            'email', c.email,
            'latitude', c.latitude,
            'longitude', c.longitude,
            'rating', c.rating,
            'review_count', c.review_count,
            'is_permanently_closed', c.is_permanently_closed,
            'is_featured', c.is_featured,
            'open_on_public_holidays', c.open_on_public_holidays,
            'images', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', ci.id,
                    'image_url', ci.image_url,
                    'imagekit_file_id', ci.imagekit_file_id,
                    'r2_url', ci.r2_url,
                    'r2_key', ci.r2_key
                  ) ORDER BY ci.display_order ASC
                )
                FROM clinic_images ci
                WHERE ci.clinic_id = c.id
              ),
              '[]'::jsonb
            ),
            'area', CASE
              WHEN a.id IS NOT NULL THEN
                jsonb_build_object('name', a.name, 'slug', a.slug)
              ELSE NULL
            END,
            'states', jsonb_build_object('name', s.name, 'slug', s.slug)
          )
        )
      ) AS clinic_doctor_relations
    FROM doctor_base db
    INNER JOIN clinic_doctor_relations cdr ON db.id = cdr.doctor_id
    INNER JOIN clinics c ON cdr.clinic_id = c.id
    INNER JOIN states s ON c.state_id = s.id
    LEFT JOIN areas a ON c.area_id = a.id
    WHERE s.slug = state_slug_param
    GROUP BY db.id, db.name, db.slug, db.bio, db.specialty, db.qualification,
             db.featured_video, db.is_active, db.is_featured,
             db.status, db.created_at, db.modified_at
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', dwc.id,
      'name', dwc.name,
      'slug', dwc.slug,
      'bio', dwc.bio,
      'specialty', dwc.specialty,
      'qualification', dwc.qualification,
      'images', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cdi.id,
              'image_url', cdi.image_url,
              'imagekit_file_id', cdi.imagekit_file_id,
              'r2_url', cdi.r2_url,
              'r2_key', cdi.r2_key
            ) ORDER BY cdi.display_order ASC
          )
          FROM clinic_doctor_images cdi
          WHERE cdi.doctor_id = dwc.id
        ),
        '[]'::jsonb
      ),
      'featured_video', dwc.featured_video,
      'is_active', dwc.is_active,
      'is_featured', dwc.is_featured,
      'status', dwc.status,
      'created_at', dwc.created_at,
      'modified_at', dwc.modified_at,
      'clinic_doctor_relations', dwc.clinic_doctor_relations
    )
  )
  INTO doctors_data
  FROM doctor_with_clinics dwc;

  RETURN jsonb_build_object(
    'data', COALESCE(doctors_data, '[]'::jsonb),
    'count', total_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_ranged_state_metadata_by_slug(
  state_slug text,
  from_index integer,
  to_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  state_record jsonb;
  clinics_array jsonb;
  total_clinics int;
BEGIN
  -- Full state row (includes legacy image fields + r2_*).
  SELECT to_jsonb(s) || jsonb_build_object(
    'areas', (
      SELECT jsonb_agg(jsonb_build_object(
        'name', a.name,
        'slug', a.slug,
        'state', jsonb_build_object(
          'name', s.name,
          'slug', s.slug
        )
      ))
      FROM areas a
      WHERE a.state_id = s.id
    )
  )
  INTO state_record
  FROM states s
  WHERE s.slug = state_slug;

  IF state_record IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*)
  INTO total_clinics
  FROM clinics c
  WHERE c.state_id = (SELECT id FROM states WHERE slug = state_slug)
    AND c.status = 'approved';

  SELECT jsonb_agg(clinic_data)
  INTO clinics_array
  FROM (
    SELECT jsonb_build_object(
      'name', c.name,
      'slug', c.slug,
      'description', c.description,
      'status', c.status,
      'postal_code', c.postal_code,
      'address', c.address,
      'phone', c.phone,
      'rating', c.rating,
      'is_featured', c.is_featured,
      'is_permanently_closed', c.is_permanently_closed,
      'open_on_public_holidays', c.open_on_public_holidays,
      'modified_at', c.modified_at,
      'area', jsonb_build_object('name', a.name),
      'state', jsonb_build_object('name', s.name),
      'hours', (
        SELECT jsonb_agg(jsonb_build_object(
          'day_of_week', h.day_of_week,
          'open_time', h.open_time,
          'close_time', h.close_time
        ))
        FROM clinic_hours h
        WHERE h.clinic_id = c.id
      ),
      'special_hours', (
        SELECT jsonb_agg(jsonb_build_object(
          'date', sh.date,
          'is_closed', sh.is_closed,
          'open_time', sh.open_time,
          'close_time', sh.close_time
        ))
        FROM clinic_special_hours sh
        WHERE sh.clinic_id = c.id
      ),
      'images', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', cdi.id,
              'image_url', cdi.image_url,
              'imagekit_file_id', cdi.imagekit_file_id,
              'r2_url', cdi.r2_url,
              'r2_key', cdi.r2_key
            ) ORDER BY cdi.display_order ASC
          )
          FROM clinic_images cdi
          WHERE cdi.clinic_id = c.id
        ),
        '[]'::jsonb
      )
    ) AS clinic_data
    FROM clinics c
    JOIN areas a ON a.id = c.area_id
    JOIN states s ON s.id = c.state_id
    WHERE c.state_id = (SELECT id FROM states WHERE slug = state_slug)
      AND c.status = 'approved'
    ORDER BY c.modified_at DESC
    OFFSET from_index
    LIMIT (to_index - from_index + 1)
  ) AS clinic_list;

  RETURN state_record || jsonb_build_object(
    'clinics', coalesce(clinics_array, '[]'::jsonb),
    'total_clinics', total_clinics
  );
END;
$function$;
