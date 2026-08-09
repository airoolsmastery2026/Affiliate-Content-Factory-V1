-- Video OS publisher + analytics + learning migration.
-- Apply to the dedicated Video OS Supabase project before production isolation is considered complete.

create table if not exists public.video_os_metrics (
  id bigserial primary key,
  job_id text not null references public.video_os_jobs(id) on delete cascade,
  platform text not null,
  views bigint not null default 0 check (views >= 0),
  impressions bigint not null default 0 check (impressions >= 0),
  avg_watch_pct numeric not null default 0 check (avg_watch_pct between 0 and 1),
  completion_rate numeric not null default 0 check (completion_rate between 0 and 1),
  engagement_rate numeric not null default 0 check (engagement_rate between 0 and 1),
  ctr numeric not null default 0 check (ctr between 0 and 1),
  conversion_rate numeric not null default 0 check (conversion_rate between 0 and 1),
  performance_score numeric not null default 0 check (performance_score between 0 and 100),
  raw jsonb not null default '{}'::jsonb,
  measured_at timestamptz not null default now(),
  unique(job_id, platform)
);

alter table public.video_os_metrics enable row level security;
revoke all on public.video_os_metrics from anon, authenticated;

create or replace function public.video_os_mark_published(
  p_job_id text, p_access_token text, p_platform text, p_external_id text, p_external_url text
) returns table(job_id text, stage text, status text, result jsonb)
language plpgsql security definer set search_path=public,extensions
as $$
declare
  v_job public.video_os_jobs%rowtype;
  v_result jsonb;
begin
  select * into v_job from public.video_os_jobs where id=p_job_id;
  if not found or v_job.access_token_hash <> encode(extensions.digest(coalesce(p_access_token,'')::text, 'sha256'::text), 'hex') then
    raise exception 'job_not_found';
  end if;
  if v_job.status not in ('qa_passed','scheduled','published') then raise exception 'publish_gate_rejected'; end if;
  if coalesce(v_job.qa_score,0) < 80 then raise exception 'qa_score_below_publish_threshold'; end if;
  v_result := jsonb_set(coalesce(v_job.result,'{}'::jsonb), '{publication}', jsonb_build_object(
    'platform',lower(trim(p_platform)), 'externalId',p_external_id, 'url',p_external_url, 'publishedAt',now()
  ), true);
  update public.video_os_jobs set status='published', stage='published', result=v_result, updated_at=now() where id=p_job_id;
  return query select p_job_id, 'published'::text, 'published'::text, v_result;
end $$;

create or replace function public.video_os_record_metrics(
  p_job_id text, p_access_token text, p_platform text, p_metrics jsonb
) returns table(job_id text, stage text, status text, performance_score numeric, learned_signal numeric)
language plpgsql security definer set search_path=public,extensions
as $$
declare
  v_job public.video_os_jobs%rowtype;
  v_watch numeric := greatest(0, least(1, coalesce((p_metrics->>'avgWatchPct')::numeric, 0)));
  v_completion numeric := greatest(0, least(1, coalesce((p_metrics->>'completionRate')::numeric, 0)));
  v_engagement numeric := greatest(0, least(1, coalesce((p_metrics->>'engagementRate')::numeric, 0)));
  v_ctr numeric := greatest(0, least(1, coalesce((p_metrics->>'ctr')::numeric, 0)));
  v_conversion numeric := greatest(0, least(1, coalesce((p_metrics->>'conversionRate')::numeric, 0)));
  v_score numeric;
  v_signal numeric;
begin
  select * into v_job from public.video_os_jobs where id=p_job_id;
  if not found or v_job.access_token_hash <> encode(extensions.digest(coalesce(p_access_token,'')::text, 'sha256'::text), 'hex') then
    raise exception 'job_not_found';
  end if;
  if v_job.status not in ('published','measured','learned') then raise exception 'job_not_published'; end if;
  v_score := round((v_completion*35 + v_watch*25 + v_engagement*15 + v_ctr*10 + v_conversion*15), 2);
  v_signal := round(greatest(-20, least(20, (v_score - 60) / 2)), 2);
  insert into public.video_os_metrics(job_id,platform,views,impressions,avg_watch_pct,completion_rate,engagement_rate,ctr,conversion_rate,performance_score,raw,measured_at)
  values (p_job_id, lower(trim(p_platform)), greatest(0,coalesce((p_metrics->>'views')::bigint,0)), greatest(0,coalesce((p_metrics->>'impressions')::bigint,0)), v_watch,v_completion,v_engagement,v_ctr,v_conversion,v_score,p_metrics,now())
  on conflict on constraint video_os_metrics_job_id_platform_key do update set
    views=excluded.views, impressions=excluded.impressions, avg_watch_pct=excluded.avg_watch_pct,
    completion_rate=excluded.completion_rate, engagement_rate=excluded.engagement_rate, ctr=excluded.ctr,
    conversion_rate=excluded.conversion_rate, performance_score=excluded.performance_score, raw=excluded.raw, measured_at=now();
  update public.video_os_jobs set status='learned', stage='learned',
    loop=jsonb_set(jsonb_set(coalesce(loop,'{}'::jsonb), '{performanceScore}', to_jsonb(v_score), true), '{learnedSignal}', to_jsonb(v_signal), true),
    updated_at=now() where id=p_job_id;
  return query select p_job_id, 'learned'::text, 'learned'::text, v_score, v_signal;
end $$;

revoke all on function public.video_os_mark_published(text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.video_os_record_metrics(text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.video_os_mark_published(text,text,text,text,text) to anon;
grant execute on function public.video_os_record_metrics(text,text,text,jsonb) to anon;
