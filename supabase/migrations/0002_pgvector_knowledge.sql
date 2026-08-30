create extension if not exists vector;

create table knowledge_source (id uuid primary key default gen_random_uuid(), source_type text not null, title text not null, episode text, copyright_status copyright_status not null, access_scope access_scope not null default 'server-only', license_notes text, source_reference text, created_at timestamptz not null default now());
create table transcript_chunk (id uuid primary key default gen_random_uuid(), source_id uuid not null references knowledge_source(id) on delete cascade, chunk_text text not null, episode_id text, episode_title text, start_time double precision, end_time double precision, people jsonb not null default '[]', dynasties jsonb not null default '[]', events jsonb not null default '[]', year_start int, year_end int, embedding_model text not null, embedding_dimension int not null, embedding vector(1536), created_at timestamptz not null default now());
create index transcript_chunk_embedding_idx on transcript_chunk using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table knowledge_source enable row level security;
alter table transcript_chunk enable row level security;

create policy "public source metadata only" on knowledge_source for select using (copyright_status in ('licensed', 'public') and access_scope = 'public-metadata');
revoke all on transcript_chunk from anon, authenticated;

create function match_transcript_chunks(query_embedding vector(1536), match_count int, filter_year_start int default null, filter_year_end int default null)
returns table (id uuid, source_id uuid, similarity double precision)
language sql stable security definer set search_path = public
as $$
  select tc.id, tc.source_id, 1 - (tc.embedding <=> query_embedding) as similarity
  from transcript_chunk tc
  where (filter_year_start is null or coalesce(tc.year_end, tc.year_start) >= filter_year_start)
    and (filter_year_end is null or coalesce(tc.year_start, tc.year_end) <= filter_year_end)
  order by tc.embedding <=> query_embedding
  limit greatest(1, least(match_count, 20));
$$;
revoke all on function match_transcript_chunks(vector, int, int, int) from public;
