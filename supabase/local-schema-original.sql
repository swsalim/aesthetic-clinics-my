-- States Table
create table if not exists states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Add index for slug column in states table
create index if not exists idx_states_slug on states using btree (slug);

create or replace trigger handle_modified_states BEFORE
update on states for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for states table
alter table states enable row level security;

-- Areas Table
create table if not exists areas (
  id uuid primary key default gen_random_uuid(),
  state_id uuid references states(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now()),
  unique(state_id, slug)
);

-- Add index for slug column in areas table
create index if not exists idx_areas_slug on areas using btree (slug);

create or replace trigger handle_modified_areas BEFORE
update on areas for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for areas table
alter table areas enable row level security;

-- Clinics Table
create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  state_id uuid references states(id),
  area_id uuid references areas(id),
  name text not null,
  slug text not null unique,
  description text,
  website text,
  email text,
  place_id text,
  address text,
  neighborhood text,
  city text,
  postal_code text,
  phone text,
  images text[],
  location geography(Point, 4326),
  latitude numeric,
  longitude numeric,
  rating numeric,
  review_count int,
  source text default 'manual',
  facebook_url text,
  instagram_url text,
  youtube_url text,
  featured_video text,
  open_on_public_holidays boolean default false,
  is_permanently_closed boolean default false,
  is_featured boolean default false,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinics BEFORE
update on clinics for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinics table
alter table clinics enable row level security;

-- To be Reviewed Clinics Table
create table if not exists to_be_reviewed_clinics (
  id uuid primary key default gen_random_uuid(),
  state_id uuid references states(id),
  area_id uuid references areas(id),
  name text not null,
  slug text not null unique,
  description text,
  website text,
  email text,
  place_id text,
  address text,
  neighborhood text,
  city text,
  postal_code text,
  phone text,
  images text[],
  location geography(Point, 4326),
  latitude numeric,
  longitude numeric,
  rating numeric,
  review_count int,
  source text default 'manual',
  facebook_url text,
  instagram_url text,
  youtube_url text,
  featured_video text,
  open_on_public_holidays boolean default false,
  is_permanently_closed boolean default false,
  is_featured boolean default false,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_to_be_reviewed_clinics BEFORE
update on to_be_reviewed_clinics for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for to_be_reviewed_clinics table
alter table to_be_reviewed_clinics enable row level security;

-- Clinic Hours Table
create table if not exists clinic_hours (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  to_be_reviewed_clinic_id uuid references to_be_reviewed_clinics(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinic_hours BEFORE
update on clinic_hours for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_hours table
alter table clinic_hours enable row level security;

-- Clinic Special Hours Table
create table if not exists clinic_special_hours (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  to_be_reviewed_clinic_id uuid references to_be_reviewed_clinics(id) on delete cascade,
  date date not null,
  open_time time,
  close_time time,
  is_closed boolean default false,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinic_special_hours BEFORE
update on clinic_special_hours for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_special_hours table
alter table clinic_special_hours enable row level security;

-- Clinic Reviews Table
create table if not exists clinic_reviews (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  to_be_reviewed_clinic_id uuid references to_be_reviewed_clinics(id) on delete cascade,
  author_name text,
  rating numeric,
  email text,
  text text,
  review_time timestamp with time zone,
  source text default 'manual',
  status text check (status in ('approved', 'pending', 'rejected', 'clinic_deleted', 'clinic_rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinic_reviews BEFORE
update on clinic_reviews for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_reviews table
alter table clinic_reviews enable row level security;

-- Clinic Doctors Table
create table if not exists clinic_doctors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete set null,
  name text not null,
  specialty text,
  bio text,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinic_doctors BEFORE
update on clinic_doctors for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_doctors table
alter table clinic_doctors enable row level security;

-- Clinic Services Table
create table if not exists clinic_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinic_services BEFORE
update on clinic_services for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_services table
alter table clinic_services enable row level security;

-- Clinic Category Relations Table
create table if not exists clinic_service_relations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  service_id uuid references clinic_services(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now())
);

create or replace trigger handle_modified_clinic_service_relations BEFORE
update on clinic_service_relations for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_service_relations table
alter table clinic_service_relations enable row level security;

INSERT INTO clinic_services (name, slug, description)
VALUES
  ('General Dentistry', 'general-dentistry', 'Routine checkups, cleaning, fillings, and basic dental care.'),
  ('Cosmetic Dentistry', 'cosmetic-dentistry', 'Aesthetic treatments such as veneers, whitening, and smile makeovers.'),
  ('Pediatric Dentistry', 'pediatric-dentistry', 'Dental care tailored for children and adolescents.'),
  ('Orthodontics', 'orthodontics', 'Braces, aligners, and bite correction.'),
  ('Periodontics', 'periodontics', 'Treatment of gum diseases and supporting structures of the teeth.'),
  ('Endodontics', 'endodontics', 'Root canal therapy and procedures involving dental pulp.'),
  ('Oral Surgery', 'oral-surgery', 'Surgical procedures like extractions and dental implants.'),
  ('Prosthodontics', 'prosthodontics', 'Restoration of missing teeth with crowns, bridges, and dentures.'),
  ('Dental Implants', 'dental-implants', 'Permanent replacements for missing teeth using titanium posts.'),
  ('Emergency Dentistry', 'emergency-dentistry', 'Urgent dental care for pain, trauma, or sudden issues.'),
  ('Dental X-rays', 'dental-xrays', 'Diagnostic imaging to examine dental and bone structures.'),
  ('Teeth Whitening', 'teeth-whitening', 'Professional whitening treatments to brighten teeth.'),
  ('Invisalign', 'invisalign', 'Clear aligners for teeth straightening as an alternative to braces.'),
  ('Root Canal Treatment', 'root-canal', 'Treatment to save and repair an infected or damaged tooth.'),
  ('Braces', 'braces', 'Metal or ceramic devices used to align and straighten teeth.'),
  ('Veneers', 'veneers', 'Thin custom shells placed over teeth to improve appearance.'),
  ('Wisdom Tooth Extraction', 'wisdom-tooth-extraction', 'Surgical removal of third molars due to impaction or crowding.');

INSERT INTO states (name, slug) VALUES
  ('Johor', 'johor'),
  ('Kedah', 'kedah'),
  ('Kelantan', 'kelantan'),
  ('Malacca', 'malacca'),
  ('Negeri Sembilan', 'negeri-sembilan'),
  ('Pahang', 'pahang'),
  ('Penang', 'penang'),
  ('Perak', 'perak'),
  ('Perlis', 'perlis'),
  ('Sabah', 'sabah'),
  ('Sarawak', 'sarawak'),
  ('Selangor', 'selangor'),
  ('Terengganu', 'terengganu'),
  ('Kuala Lumpur', 'kuala-lumpur'),
  ('Labuan', 'labuan'),
  ('Putrajaya', 'putrajaya');

-- First, create a function that will insert areas for a given state
CREATE OR REPLACE FUNCTION insert_areas_for_state(state_slug TEXT, areas_json JSONB)
RETURNS VOID AS $$
DECLARE
  state_id_val UUID;
  area_rec JSONB;
BEGIN
  -- Get the state ID
  SELECT id INTO state_id_val FROM states WHERE slug = state_slug;

  -- Insert each area
for area_rec IN SELECT * FROM jsonb_array_elements(areas_json)
  LOOP
    INSERT INTO areas (state_id, name, slug)
    VALUES (state_id_val, area_rec->>'name', area_rec->>'slug');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Then call the function for each state
SELECT insert_areas_for_state('johor', '[
  {"name": "Johor Bahru", "slug": "johor-bahru"},
  {"name": "Batu Pahat", "slug": "batu-pahat"},
  {"name": "Kluang", "slug": "kluang"},
  {"name": "Muar", "slug": "muar"},
  {"name": "Segamat", "slug": "segamat"},
  {"name": "Pontian", "slug": "pontian"},
  {"name": "Kota Tinggi", "slug": "kota-tinggi"},
  {"name": "Tangkak", "slug": "tangkak"},
  {"name": "Iskandar Puteri", "slug": "iskandar-puteri"},
  {"name": "Pasir Gudang", "slug": "pasir-gudang"}
]'::jsonb);

SELECT insert_areas_for_state('kedah', '[
  {"name": "Alor Setar", "slug": "alor-setar"},
  {"name": "Sungai Petani", "slug": "sungai-petani"},
  {"name": "Kulim", "slug": "kulim"},
  {"name": "Langkawi", "slug": "langkawi"},
  {"name": "Baling", "slug": "baling"},
  {"name": "Jitra", "slug": "jitra"},
  {"name": "Yan", "slug": "yan"},
  {"name": "Pendang", "slug": "pendang"},
  {"name": "Kuala Kedah", "slug": "kuala-kedah"},
  {"name": "Pokok Sena", "slug": "pokok-sena"}
]'::jsonb);

SELECT insert_areas_for_state('kelantan', '[
  {"name": "Kota Bharu", "slug": "kota-bharu"},
  {"name": "Pasir Mas", "slug": "pasir-mas"},
  {"name": "Tumpat", "slug": "tumpat"},
  {"name": "Tanah Merah", "slug": "tanah-merah"},
  {"name": "Machang", "slug": "machang"},
  {"name": "Kuala Krai", "slug": "kuala-krai"},
  {"name": "Gua Musang", "slug": "gua-musang"},
  {"name": "Pasir Puteh", "slug": "pasir-puteh"},
  {"name": "Bachok", "slug": "bachok"},
  {"name": "Jeli", "slug": "jeli"}
]'::jsonb);

SELECT insert_areas_for_state('malacca', '[
  {"name": "Malacca City", "slug": "malacca-city"},
  {"name": "Ayer Keroh", "slug": "ayer-keroh"},
  {"name": "Batu Berendam", "slug": "batu-berendam"},
  {"name": "Alor Gajah", "slug": "alor-gajah"},
  {"name": "Jasin", "slug": "jasin"},
  {"name": "Masjid Tanah", "slug": "masjid-tanah"},
  {"name": "Merlimau", "slug": "merlimau"},
  {"name": "Bukit Katil", "slug": "bukit-katil"},
  {"name": "Tanjung Kling", "slug": "tanjung-kling"},
  {"name": "Durian Tunggal", "slug": "durian-tunggal"}
]'::jsonb);

SELECT insert_areas_for_state('negeri-sembilan', '[
  {"name": "Seremban", "slug": "seremban"},
  {"name": "Port Dickson", "slug": "port-dickson"},
  {"name": "Nilai", "slug": "nilai"},
  {"name": "Tampin", "slug": "tampin"},
  {"name": "Jempol", "slug": "jempol"},
  {"name": "Kuala Pilah", "slug": "kuala-pilah"},
  {"name": "Rembau", "slug": "rembau"},
  {"name": "Bahau", "slug": "bahau"},
  {"name": "Lukut", "slug": "lukut"},
  {"name": "Sikamat", "slug": "sikamat"}
]'::jsonb);

SELECT insert_areas_for_state('pahang', '[
  {"name": "Kuantan", "slug": "kuantan"},
  {"name": "Bentong", "slug": "bentong"},
  {"name": "Temerloh", "slug": "temerloh"},
  {"name": "Cameron Highlands", "slug": "cameron-highlands"},
  {"name": "Jerantut", "slug": "jerantut"},
  {"name": "Raub", "slug": "raub"},
  {"name": "Pekan", "slug": "pekan"},
  {"name": "Maran", "slug": "maran"},
  {"name": "Rompin", "slug": "rompin"},
  {"name": "Lipis", "slug": "lipis"},
  {"name": "Bera", "slug": "bera"}
]'::jsonb);

SELECT insert_areas_for_state('penang', '[
  {"name": "George Town", "slug": "george-town"},
  {"name": "Bayan Lepas", "slug": "bayan-lepas"},
  {"name": "Gelugor", "slug": "gelugor"},
  {"name": "Butterworth", "slug": "butterworth"},
  {"name": "Bukit Mertajam", "slug": "bukit-mertajam"},
  {"name": "Seberang Jaya", "slug": "seberang-jaya"},
  {"name": "Nibong Tebal", "slug": "nibong-tebal"},
  {"name": "Tanjung Bungah", "slug": "tanjung-bungah"},
  {"name": "Ayer Itam", "slug": "ayer-itam"},
  {"name": "Balik Pulau", "slug": "balik-pulau"}
]'::jsonb);

SELECT insert_areas_for_state('perak', '[
  {"name": "Ipoh", "slug": "ipoh"},
  {"name": "Taiping", "slug": "taiping"},
  {"name": "Teluk Intan", "slug": "teluk-intan"},
  {"name": "Sitiawan", "slug": "sitiawan"},
  {"name": "Batu Gajah", "slug": "batu-gajah"},
  {"name": "Tapah", "slug": "tapah"},
  {"name": "Parit Buntar", "slug": "parit-buntar"},
  {"name": "Lumut", "slug": "lumut"},
  {"name": "Kampar", "slug": "kampar"},
  {"name": "Manjung", "slug": "manjung"}
]'::jsonb);

SELECT insert_areas_for_state('perlis', '[
  {"name": "Kangar", "slug": "kangar"},
  {"name": "Arau", "slug": "arau"},
  {"name": "Padang Besar", "slug": "padang-besar"}
]'::jsonb);

SELECT insert_areas_for_state('sabah', '[
  {"name": "Kota Kinabalu", "slug": "kota-kinabalu"},
  {"name": "Sandakan", "slug": "sandakan"},
  {"name": "Tawau", "slug": "tawau"},
  {"name": "Lahad Datu", "slug": "lahad-datu"},
  {"name": "Keningau", "slug": "keningau"},
  {"name": "Papar", "slug": "papar"},
  {"name": "Beaufort", "slug": "beaufort"},
  {"name": "Ranau", "slug": "ranau"},
  {"name": "Putatan", "slug": "putatan"},
  {"name": "Kudat", "slug": "kudat"}
]'::jsonb);

SELECT insert_areas_for_state('sarawak', '[
  {"name": "Kuching", "slug": "kuching"},
  {"name": "Miri", "slug": "miri"},
  {"name": "Sibu", "slug": "sibu"},
  {"name": "Bintulu", "slug": "bintulu"},
  {"name": "Sarikei", "slug": "sarikei"},
  {"name": "Sri Aman", "slug": "sri-aman"},
  {"name": "Limbang", "slug": "limbang"},
  {"name": "Kapit", "slug": "kapit"},
  {"name": "Mukah", "slug": "mukah"},
  {"name": "Betong", "slug": "betong"}
]'::jsonb);

SELECT insert_areas_for_state('selangor', '[
  {"name": "Shah Alam", "slug": "shah-alam"},
  {"name": "Petaling Jaya", "slug": "petaling-jaya"},
  {"name": "Subang Jaya", "slug": "subang-jaya"},
  {"name": "Klang", "slug": "klang"},
  {"name": "Kajang", "slug": "kajang"},
  {"name": "Ampang", "slug": "ampang"},
  {"name": "Puchong", "slug": "puchong"},
  {"name": "Rawang", "slug": "rawang"},
  {"name": "Bangi", "slug": "bangi"},
  {"name": "Cyberjaya", "slug": "cyberjaya"}
]'::jsonb);

SELECT insert_areas_for_state('terengganu', '[
  {"name": "Kuala Terengganu", "slug": "kuala-terengganu"},
  {"name": "Kuala Nerus", "slug": "kuala-nerus"},
  {"name": "Dungun", "slug": "dungun"},
  {"name": "Kemaman", "slug": "kemaman"},
  {"name": "Marang", "slug": "marang"},
  {"name": "Besut", "slug": "besut"},
  {"name": "Hulu Terengganu", "slug": "hulu-terengganu"},
  {"name": "Setiu", "slug": "setiu"}
]'::jsonb);

SELECT insert_areas_for_state('kuala-lumpur', '[
  {"name": "Bukit Bintang", "slug": "bukit-bintang"},
  {"name": "Cheras", "slug": "cheras"},
  {"name": "Setapak", "slug": "setapak"},
  {"name": "Mont Kiara", "slug": "mont-kiara"},
  {"name": "Bangsar", "slug": "bangsar"},
  {"name": "Titiwangsa", "slug": "titiwangsa"},
  {"name": "Wangsa Maju", "slug": "wangsa-maju"},
  {"name": "Kepong", "slug": "kepong"},
  {"name": "Sentul", "slug": "sentul"},
  {"name": "Sri Hartamas", "slug": "sri-hartamas"}
]'::jsonb);

SELECT insert_areas_for_state('putrajaya', '[
  {"name": "Presint 1", "slug": "presint-1"},
  {"name": "Presint 2", "slug": "presint-2"},
  {"name": "Presint 3", "slug": "presint-3"},
  {"name": "Presint 4", "slug": "presint-4"},
  {"name": "Presint 5", "slug": "presint-5"},
  {"name": "Presint 6", "slug": "presint-6"},
  {"name": "Presint 7", "slug": "presint-7"},
  {"name": "Presint 8", "slug": "presint-8"},
  {"name": "Presint 9", "slug": "presint-9"},
  {"name": "Presint 10", "slug": "presint-10"}
]'::jsonb);

SELECT insert_areas_for_state('labuan', '[
  {"name": "Victoria", "slug": "victoria"},
  {"name": "Batu Arang", "slug": "batu-arang"},
  {"name": "Sungai Lada", "slug": "sungai-lada"}
]'::jsonb);

-- Drop the function after we're done with it
DROP FUNCTION IF EXISTS insert_areas_for_state(TEXT, JSONB);

-- Function to add opening hours for a clinic
CREATE OR REPLACE FUNCTION add_clinic_hours(
  p_clinic_id UUID,
  p_day_of_week INT,
  p_open_time TIME,
  p_close_time TIME
)
RETURNS UUID AS $$
DECLARE
  v_hours_id UUID;
BEGIN
  -- Validate day_of_week
  IF p_day_of_week NOT BETWEEN 0 AND 6 THEN
    RAISE EXCEPTION 'Day of week must be between 0 and 6';
  END IF;

  -- Validate time format and logic
  IF p_open_time IS NOT NULL AND p_close_time IS NOT NULL AND p_open_time >= p_close_time THEN
    RAISE EXCEPTION 'Open time must be before close time';
  END IF;

  -- Check if clinic exists
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = p_clinic_id) THEN
    RAISE EXCEPTION 'Clinic with ID % does not exist', p_clinic_id;
  END IF;

  -- Insert the hours
  INSERT INTO clinic_hours (
    clinic_id,
    day_of_week,
    open_time,
    close_time
  ) VALUES (
    p_clinic_id,
    p_day_of_week,
    p_open_time,
    p_close_time
  ) RETURNING id INTO v_hours_id;

  RETURN v_hours_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add multiple opening hours for a clinic
CREATE OR REPLACE FUNCTION add_clinic_hours_batch(
  p_clinic_id UUID,
  p_hours JSONB
)
RETURNS UUID[] AS $$
DECLARE
  v_hours_id UUID;
  v_hours_ids UUID[];
  v_hour JSONB;
BEGIN
  -- Check if clinic exists
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = p_clinic_id) THEN
    RAISE EXCEPTION 'Clinic with ID % does not exist', p_clinic_id;
  END IF;

  -- Process each hour entry
  FOR v_hour IN SELECT * FROM jsonb_array_elements(p_hours)
  LOOP
    -- Validate day_of_week
    IF (v_hour->>'day_of_week')::INT NOT BETWEEN 0 AND 6 THEN
      RAISE EXCEPTION 'Day of week must be between 0 and 6';
    END IF;

    -- Insert the hours
    INSERT INTO clinic_hours (
      clinic_id,
      day_of_week,
      open_time,
      close_time
    ) VALUES (
      p_clinic_id,
      (v_hour->>'day_of_week')::INT,
      (v_hour->>'open_time')::TIME,
      (v_hour->>'close_time')::TIME
    ) RETURNING id INTO v_hours_id;

    v_hours_ids := array_append(v_hours_ids, v_hours_id);
  END LOOP;

  RETURN v_hours_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION approved_clinic(to_be_reviewed_clinic_id_param uuid)
RETURNS uuid AS $$
DECLARE
    new_clinic_id uuid;
BEGIN
    -- Insert the clinic into clinics table
    INSERT INTO clinics (
        state_id,
        area_id,
        name,
        slug,
        description,
        website,
        email,
        place_id,
        address,
        neighborhood,
        city,
        postal_code,
        phone,
        images,
        location,
        latitude,
        longitude,
        rating,
        review_count,
        source,
        facebook_url,
        instagram_url,
        youtube_url,
        featured_video,
        open_on_public_holidays,
        is_permanently_closed,
        is_featured,
        is_active
    )
    SELECT
        state_id,
        area_id,
        name,
        slug,
        description,
        website,
        email,
        place_id,
        address,
        neighborhood,
        city,
        postal_code,
        phone,
        images,
        location,
        latitude,
        longitude,
        rating,
        review_count,
        source,
        facebook_url,
        instagram_url,
        youtube_url,
        featured_video,
        open_on_public_holidays,
        is_permanently_closed,
        is_featured,
        true
    FROM to_be_reviewed_clinics
    WHERE id = to_be_reviewed_clinic_id_param
    RETURNING id INTO new_clinic_id;

    -- Update the reviews to point to the new clinic and change status to approved
    UPDATE reviews
    SET
        clinic_id = new_clinic_id,
        to_be_reviewed_clinic_id = NULL,
        status = 'approved' -- Update status to approved
    WHERE to_be_reviewed_clinic_id = to_be_reviewed_clinic_id_param;

    -- Delete the clinic from to_be_reviewed_clinics
    DELETE FROM to_be_reviewed_clinics
    WHERE id = to_be_reviewed_clinic_id_param;

    RETURN new_clinic_id;
END;
$$ LANGUAGE plpgsql;
