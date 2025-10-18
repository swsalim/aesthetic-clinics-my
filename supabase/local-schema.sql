-- States Table
create table if not exists states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  thumbnail_image text,
  banner_image text,
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
  short_description text,
  description text,
  thumbnail_image text,
  banner_image text,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now()),
  unique(state_id, slug)
);

-- Add indexes for areas table
create index if not exists idx_areas_slug on areas using btree (slug);
create index if not exists idx_areas_state_id on areas using btree (state_id);

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
  place_id text not null,
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
  source text constraint clinic_source_check check (source in ('manual', 'imported', 'scraped', 'api')) default 'manual',
  facebook_url text,
  instagram_url text,
  youtube_url text,
  featured_video text,
  open_on_public_holidays boolean default false,
  is_permanently_closed boolean default false,
  is_featured boolean default false,
  is_active boolean default false,
  status text constraint clinic_status_check check (status in ('approved', 'pending', 'rejected', 'suspended')) default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for clinics table
create index if not exists idx_clinics_slug on clinics using btree (slug);
create index if not exists idx_clinics_state_id on clinics using btree (state_id);
create index if not exists idx_clinics_area_id on clinics using btree (area_id);
create index if not exists idx_clinics_location on clinics using gist (location);
create index if not exists idx_clinics_status on clinics using btree (status);
create index if not exists idx_clinics_is_active on clinics using btree (is_active);
create index if not exists idx_clinics_is_featured on clinics using btree (is_featured);
create index if not exists idx_clinics_rating on clinics using btree (rating);

create or replace trigger handle_modified_clinics BEFORE
update on clinics for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinics table
alter table clinics enable row level security;

-- Clinic Hours Table
create table if not exists clinic_hours (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time time,
  close_time time,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for clinic_hours table
create index if not exists idx_clinic_hours_clinic_id on clinic_hours using btree (clinic_id);
create index if not exists idx_clinic_hours_day_of_week on clinic_hours using btree (day_of_week);

create or replace trigger handle_modified_clinic_hours BEFORE
update on clinic_hours for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_hours table
alter table clinic_hours enable row level security;

-- Clinic Special Hours Table
create table if not exists clinic_special_hours (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  date date not null,
  open_time time,
  close_time time,
  is_closed boolean default false,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for clinic_special_hours table
create index if not exists idx_clinic_special_hours_clinic_id on clinic_special_hours using btree (clinic_id);
create index if not exists idx_clinic_special_hours_date on clinic_special_hours using btree (date);

create or replace trigger handle_modified_clinic_special_hours BEFORE
update on clinic_special_hours for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_special_hours table
alter table clinic_special_hours enable row level security;

-- Clinic Reviews Table
create table if not exists clinic_reviews (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  author_name text not null,
  rating numeric,
  email text,
  text text,
  review_time timestamp with time zone,
  source text constraint review_source_check check (source in ('manual', 'imported', 'scraped', 'api')) default 'manual',
  status text constraint review_status_check check (status in ('approved', 'pending', 'rejected', 'clinic_deleted', 'clinic_rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for clinic_reviews table
create index if not exists idx_clinic_reviews_clinic_id on clinic_reviews using btree (clinic_id);
create index if not exists idx_clinic_reviews_rating on clinic_reviews using btree (rating);
create index if not exists idx_clinic_reviews_status on clinic_reviews using btree (status);
create index if not exists idx_clinic_reviews_review_time on clinic_reviews using btree (review_time);

create or replace trigger handle_modified_clinic_reviews BEFORE
update on clinic_reviews for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_reviews table
alter table clinic_reviews enable row level security;

-- Clinic Doctors Table
create table if not exists clinic_doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  specialty text,
  bio text,
  images text[],
  qualification text,
  featured_video text,
  is_featured boolean default false,
  is_active boolean default false,
  status text constraint doctor_status_check check (status in ('approved', 'pending', 'rejected', 'suspended')) default 'pending',
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- ALTER TABLE statements for existing clinic_doctors table
-- Run these if the table already exists and you need to modify it:

-- 1. Rename 'image' column to 'images' and change type to text[]
-- ALTER TABLE clinic_doctors RENAME COLUMN image TO images;
-- ALTER TABLE clinic_doctors ALTER COLUMN images TYPE text[] USING images::text[];

-- 2. Add qualification column
-- ALTER TABLE clinic_doctors ADD COLUMN qualification text;

-- Note: If you want to run these ALTER statements, uncomment them above
-- The USING clause is needed when converting from text to text[] to handle existing data

-- Add indexes for clinic_doctors table
create index if not exists idx_clinic_doctors_name on clinic_doctors using btree (name);
create index if not exists idx_clinic_doctors_specialty on clinic_doctors using btree (specialty);

create or replace trigger handle_modified_clinic_doctors BEFORE
update on clinic_doctors for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_doctors table
alter table clinic_doctors enable row level security;

-- Clinic Doctor Relations Table
create table if not exists clinic_doctor_relations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  doctor_id uuid not null references clinic_doctors(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Indexes
create index if not exists idx_clinic_doctor_relations_clinic_id on clinic_doctor_relations (clinic_id);
create index if not exists idx_clinic_doctor_relations_doctor_id on clinic_doctor_relations (doctor_id);
create unique index if not exists idx_clinic_doctor_relations_unique on clinic_doctor_relations (clinic_id, doctor_id);

create or replace trigger handle_modified_clinic_doctor_relations BEFORE
update on clinic_doctor_relations for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_doctor_relations table
alter table clinic_doctor_relations enable row level security;

-- Clinic Services Table
create table if not exists clinic_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc', now()),
  modified_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for clinic_services table
create index if not exists idx_clinic_services_slug on clinic_services using btree (slug);
create index if not exists idx_clinic_services_name on clinic_services using btree (name);

create or replace trigger handle_modified_clinic_services BEFORE
update on clinic_services for EACH row
execute FUNCTION extensions.moddatetime ('modified_at');

-- Auth policies for clinic_services table
alter table clinic_services enable row level security;

-- Clinic Service Relations Table
create table if not exists clinic_service_relations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  service_id uuid not null references clinic_services(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Add indexes for clinic_service_relations table
create index if not exists idx_clinic_service_relations_clinic_id on clinic_service_relations using btree (clinic_id);
create index if not exists idx_clinic_service_relations_service_id on clinic_service_relations using btree (service_id);
create unique index if not exists idx_clinic_service_relations_unique on clinic_service_relations (clinic_id, service_id);

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
  {"name": "Pasir Gudang", "slug": "pasir-gudang"},
  {"name": "Kulai", "slug": "kulai"}
]'::jsonb);

SELECT insert_areas_for_state('kedah', '[
  {"name": "Alor Setar", "slug": "alor-setar"},
  {"name": "Sungai Petani", "slug": "sungai-petani"},
  {"name": "Kulim", "slug": "kulim"},
  {"name": "Langkawi", "slug": "langkawi"},
  {"name": "Baling", "slug": "baling"},
  {"name": "Jitra", "slug": "jitra"},
  {"name": "Gurun", "slug": "gurun"},
  {"name": "Yan", "slug": "yan"},
  {"name": "Pendang", "slug": "pendang"},
  {"name": "Kuala Kedah", "slug": "kuala-kedah"},
  {"name": "Pokok Sena", "slug": "pokok-sena"},
  {"name": "Kuala Nerang", "slug": "kuala-nerang"}
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
  {"name": "Balik Pulau", "slug": "balik-pulau"},
  {"name": "Seberang Perai Utara", "slug": "seberang-perai-utara"}
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
  {"name": "Cyberjaya", "slug": "cyberjaya"},
  {"name": "Banting", "slug": "banting"},
  {"name": "Semenyih", "slug": "semenyih"},
  {"name": "Batu Caves", "slug": "batu-caves"},
  {"name": "Seri Kembangan", "slug": "seri-kembangan"},
  {"name": "Telok Panglima Garang", "slug": "telok-panglima-garang"}
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
  {"name": "Sri Hartamas", "slug": "sri-hartamas"},
  {"name": "Bukit Jalil", "slug": "bukit-jalil"},
  {"name": "Overseas Union Garden", "slug": "overseas-union-garden"},
  {"name": "Sri Petaling", "slug": "sri-petaling"}
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

-- Function to get ranged doctor metadata by state slug
CREATE OR REPLACE FUNCTION get_ranged_doctor_metadata_by_state_slug(
  state_slug_param TEXT,
  from_index_param INT,
  to_index_param INT,
  status_param TEXT DEFAULT 'approved'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  doctor_count INT;
BEGIN
  -- Get total count of doctors in the state
  SELECT COUNT(DISTINCT cd.id)
  INTO doctor_count
  FROM clinic_doctors cd
  INNER JOIN clinic_doctor_relations cdr ON cd.id = cdr.doctor_id
  INNER JOIN clinics c ON cdr.clinic_id = c.id
  INNER JOIN states s ON c.state_id = s.id
  WHERE cd.is_active = true
    AND cd.status = status_param
    AND s.slug = state_slug_param;

  -- Get doctors with pagination
  WITH doctor_data AS (
    SELECT DISTINCT
      cd.id,
      cd.name,
      cd.slug,
      cd.bio,
      cd.specialty,
      cd.qualification,
      cd.images,
      cd.featured_video,
      cd.is_active,
      cd.is_featured,
      cd.status,
      cd.created_at,
      cd.modified_at,
      json_agg(
        json_build_object(
          'clinic_id', c.id,
          'clinics', json_build_object(
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
            'images', c.images,
            'area', json_build_object(
              'name', a.name,
              'slug', a.slug
            ),
            'states', json_build_object(
              'name', s.name,
              'slug', s.slug
            )
          )
        )
      ) FILTER (WHERE c.id IS NOT NULL) AS clinic_doctor_relations
    FROM clinic_doctors cd
    INNER JOIN clinic_doctor_relations cdr ON cd.id = cdr.doctor_id
    INNER JOIN clinics c ON cdr.clinic_id = c.id
    INNER JOIN states s ON c.state_id = s.id
    LEFT JOIN areas a ON c.area_id = a.id
    WHERE cd.is_active = true
      AND cd.status = status_param
      AND s.slug = state_slug_param
    GROUP BY cd.id, cd.name, cd.slug, cd.bio, cd.specialty, cd.qualification,
             cd.images, cd.featured_video, cd.is_active, cd.is_featured, cd.status,
             cd.created_at, cd.modified_at
    ORDER BY cd.modified_at DESC
    LIMIT (to_index_param - from_index_param + 1)
    OFFSET from_index_param
  )
  SELECT json_build_object(
    'data', json_agg(doctor_data.*),
    'count', doctor_count
  )
  INTO result
  FROM doctor_data;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
