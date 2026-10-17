-- Location pages 404'd when a state or city slug matched more than one row.
-- get_ranged_*_metadata_by_slug used SELECT INTO and scalar subqueries, which
-- raise "query returned more than one row". The app treated that error as not
-- found. These replacements read every matching row.

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
  area_ids uuid[];
BEGIN
  -- Full area row (includes legacy image fields + r2_*) plus nested state with both.
  -- A repeated city slug used to abort this function ("query returned more than one row").
  -- Keep the row with the most approved clinics, then load every row that shares
  -- that slug inside the same state.
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
  WHERE a.id = (
    SELECT a2.id
    FROM areas a2
    JOIN states s2 ON s2.id = a2.state_id
    WHERE a2.slug = area_slug
    ORDER BY (
      SELECT count(*) FROM clinics c
      WHERE c.area_id = a2.id AND c.status = 'approved' AND c.is_active = true
    ) DESC, a2.created_at ASC NULLS LAST
    LIMIT 1
  );

  IF area_record IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(array_agg(a.id), ARRAY[]::uuid[])
  INTO area_ids
  FROM areas a
  JOIN states s ON s.id = a.state_id
  WHERE a.slug = area_slug
    AND s.slug = (area_record #>> '{state,slug}');

  SELECT count(*)
  INTO total_clinics
  FROM clinics c
  WHERE c.area_id = ANY(area_ids)
    AND c.status = 'approved'
    AND c.is_active = true;

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
    WHERE c.area_id = ANY(area_ids)
      AND c.status = 'approved'
      AND c.is_active = true
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
  state_ids uuid[];
BEGIN
  -- More than one states row can share a slug. SELECT INTO and
  -- `id = (SELECT id ...)` used to raise "query returned more than one row",
  -- which the app cached as a not-found page for the whole state.
  SELECT COALESCE(array_agg(id), ARRAY[]::uuid[])
  INTO state_ids
  FROM states
  WHERE slug = state_slug;

  IF cardinality(state_ids) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT to_jsonb(s) || jsonb_build_object(
    'areas', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'name', a.name,
        'slug', a.slug,
        'state', jsonb_build_object(
          'name', s.name,
          'slug', s.slug
        )
      ))
      FROM areas a
      WHERE a.state_id = ANY(state_ids)
    ), '[]'::jsonb)
  )
  INTO state_record
  FROM states s
  WHERE s.id = (
    SELECT s2.id
    FROM states s2
    WHERE s2.slug = state_slug
    ORDER BY (
      SELECT count(*) FROM clinics c
      WHERE c.state_id = s2.id AND c.status = 'approved' AND c.is_active = true
    ) DESC, s2.created_at ASC NULLS LAST
    LIMIT 1
  );

  IF state_record IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*)
  INTO total_clinics
  FROM clinics c
  WHERE c.state_id = ANY(state_ids)
    AND c.status = 'approved'
    AND c.is_active = true;

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
    WHERE c.state_id = ANY(state_ids)
      AND c.status = 'approved'
      AND c.is_active = true
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
