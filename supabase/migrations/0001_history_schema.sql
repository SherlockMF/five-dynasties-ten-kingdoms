create extension if not exists pgcrypto;

create type copyright_status as enum ('private', 'licensed', 'public');
create type access_scope as enum ('server-only', 'public-metadata');

create table dynasty (id text primary key, name text not null, short_name text not null, category text not null, start_year int not null, end_year int not null, capital text, founder_person_id text, summary text not null, color text not null, source_refs jsonb not null default '[]');
create table person (id text primary key, name text not null, birth_year int, death_year int, roles jsonb not null default '[]', summary text not null, biography text, source_refs jsonb not null default '[]');
alter table dynasty add constraint dynasty_founder_fk foreign key (founder_person_id) references person(id);
create table person_dynasty (person_id text references person(id) on delete cascade, dynasty_id text references dynasty(id) on delete cascade, primary key (person_id, dynasty_id));
create table historical_location (id text primary key, name text not null, longitude double precision not null, latitude double precision not null, modern_reference text, geometry jsonb, source_refs jsonb not null default '[]');
create table historical_event (id text primary key, title text not null, event_type text not null, start_year int not null, end_year int, summary text not null, background text, process text, result text, impact text, disputed_note text, source_refs jsonb not null default '[]');
create table event_person (event_id text references historical_event(id) on delete cascade, person_id text references person(id) on delete cascade, primary key (event_id, person_id));
create table event_dynasty (event_id text references historical_event(id) on delete cascade, dynasty_id text references dynasty(id) on delete cascade, primary key (event_id, dynasty_id));
create table event_location (event_id text references historical_event(id) on delete cascade, location_id text references historical_location(id) on delete cascade, primary key (event_id, location_id));
create table person_relation (id text primary key, source_person_id text references person(id), target_person_id text references person(id), relation_type text not null, description text, start_year int, end_year int, source_refs jsonb not null default '[]');
create table event_relation (id text primary key, source_event_id text references historical_event(id), target_event_id text references historical_event(id), relation_type text not null, description text, disputed_note text, source_refs jsonb not null default '[]');
create table dynasty_succession (id text primary key, predecessor_id text references dynasty(id), successor_id text references dynasty(id), note text, source_refs jsonb not null default '[]');
create table historical_region (id text primary key, dynasty_id text references dynasty(id), valid_from_year int not null, valid_to_year_exclusive int not null, geometry jsonb not null, label_point jsonb not null, temporal_basis text not null default 'year-end', accuracy_level text not null default 'illustrative', version text not null, source_refs jsonb not null default '[]');
