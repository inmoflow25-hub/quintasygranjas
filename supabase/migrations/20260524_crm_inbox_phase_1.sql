-- CRM / Meta Inbox - Phase 1
-- Safe additive migration: creates new tables only.
-- Does not modify checkout, orders, GHL, MercadoPago, or existing customer flows.

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  display_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  normalized_phone text,
  lifecycle_status text not null default 'lead',
  source text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_contact_channels (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  channel text not null check (
    channel in ('whatsapp', 'instagram', 'messenger', 'web', 'email', 'phone')
  ),
  external_user_id text not null,
  external_business_id text,
  external_page_id text,
  external_phone_number_id text,
  username text,
  display_name text,
  raw_profile jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, external_user_id)
);

create table if not exists public.crm_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  channel_id uuid references public.crm_contact_channels(id) on delete set null,
  channel text not null check (
    channel in ('whatsapp', 'instagram', 'messenger', 'web', 'email', 'phone')
  ),
  external_thread_id text,
  status text not null default 'open' check (
    status in ('open', 'pending', 'closed', 'archived')
  ),
  priority text not null default 'normal' check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  assigned_admin_id uuid references public.admins(id) on delete set null,
  source text,
  campaign_id text,
  campaign_name text,
  ad_id text,
  ad_name text,
  last_message_at timestamptz,
  closed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  channel text not null check (
    channel in ('whatsapp', 'instagram', 'messenger', 'web', 'email', 'phone')
  ),
  direction text not null check (direction in ('inbound', 'outbound')),
  external_message_id text,
  sender_external_id text,
  recipient_external_id text,
  message_type text not null default 'text',
  text text,
  media_url text,
  status text not null default 'received',
  sent_by_admin_id uuid references public.admins(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  external_created_at timestamptz
);

create table if not exists public.crm_conversation_assignments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  assigned_admin_id uuid not null references public.admins(id) on delete cascade,
  assigned_by_admin_id uuid references public.admins(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'released')),
  assigned_at timestamptz not null default now(),
  released_at timestamptz
);

create table if not exists public.crm_conversation_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  admin_id uuid references public.admins(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_contact_tags (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  tag_id uuid not null references public.crm_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (contact_id, tag_id)
);

create table if not exists public.crm_meta_webhook_events (
  id uuid primary key default gen_random_uuid(),
  channel text check (channel in ('whatsapp', 'instagram', 'messenger', 'unknown')),
  object_type text,
  external_event_id text,
  external_message_id text,
  payload jsonb not null,
  processed boolean not null default false,
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

-- Pipeline base para reemplazar GHL después.
-- Todavía no automatiza nada; sólo deja lista la estructura.

create table if not exists public.crm_pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.crm_pipelines(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now(),
  unique (pipeline_id, name)
);

create table if not exists public.crm_contact_pipeline_status (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  pipeline_id uuid not null references public.crm_pipelines(id) on delete cascade,
  stage_id uuid not null references public.crm_pipeline_stages(id) on delete restrict,
  assigned_admin_id uuid references public.admins(id) on delete set null,
  entered_stage_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contact_id, pipeline_id)
);

-- Indexes para velocidad del inbox y matching de contactos.

create index if not exists idx_crm_contacts_user_id
on public.crm_contacts(user_id);

create index if not exists idx_crm_contacts_email
on public.crm_contacts(lower(email));

create index if not exists idx_crm_contacts_normalized_phone
on public.crm_contacts(normalized_phone);

create index if not exists idx_crm_contacts_last_seen_at
on public.crm_contacts(last_seen_at desc);

create index if not exists idx_crm_contact_channels_contact_id
on public.crm_contact_channels(contact_id);

create index if not exists idx_crm_contact_channels_external_business
on public.crm_contact_channels(channel, external_business_id);

create index if not exists idx_crm_contact_channels_external_page
on public.crm_contact_channels(channel, external_page_id);

create index if not exists idx_crm_contact_channels_external_phone
on public.crm_contact_channels(channel, external_phone_number_id);

create index if not exists idx_crm_conversations_contact_id
on public.crm_conversations(contact_id);

create index if not exists idx_crm_conversations_status
on public.crm_conversations(status);

create index if not exists idx_crm_conversations_assigned_admin_id
on public.crm_conversations(assigned_admin_id);

create index if not exists idx_crm_conversations_last_message_at
on public.crm_conversations(last_message_at desc);

create index if not exists idx_crm_conversations_channel_status
on public.crm_conversations(channel, status);

create index if not exists idx_crm_messages_conversation_created
on public.crm_messages(conversation_id, created_at desc);

create index if not exists idx_crm_messages_contact_created
on public.crm_messages(contact_id, created_at desc);

create index if not exists idx_crm_messages_external_message_id
on public.crm_messages(channel, external_message_id);

create index if not exists idx_crm_assignments_conversation_id
on public.crm_conversation_assignments(conversation_id);

create index if not exists idx_crm_assignments_admin_status
on public.crm_conversation_assignments(assigned_admin_id, status);

create index if not exists idx_crm_webhook_events_processed
on public.crm_meta_webhook_events(processed, received_at);

create index if not exists idx_crm_webhook_events_external_message
on public.crm_meta_webhook_events(channel, external_message_id);

create index if not exists idx_crm_contact_pipeline_contact
on public.crm_contact_pipeline_status(contact_id);

create index if not exists idx_crm_contact_pipeline_stage
on public.crm_contact_pipeline_status(stage_id);

-- Pipeline inicial.

insert into public.crm_pipelines (name, is_default)
select 'Ventas Quintas y Granjas', true
where not exists (
  select 1
  from public.crm_pipelines
  where is_default = true
);

insert into public.crm_pipeline_stages (
  pipeline_id,
  name,
  order_index,
  is_won,
  is_lost
)
select
  p.id,
  stage.name,
  stage.order_index,
  stage.is_won,
  stage.is_lost
from public.crm_pipelines p
cross join (
  values
    ('Nuevo lead', 10, false, false),
    ('Respondido', 20, false, false),
    ('Zona validada', 30, false, false),
    ('Catalogo enviado', 40, false, false),
    ('Pedido iniciado', 50, false, false),
    ('Pago pendiente', 60, false, false),
    ('Compra confirmada', 70, true, false),
    ('Recompra', 80, false, false),
    ('Perdido', 90, false, true)
) as stage(name, order_index, is_won, is_lost)
where p.is_default = true
  and not exists (
    select 1
    from public.crm_pipeline_stages s
    where s.pipeline_id = p.id
      and s.name = stage.name
  );
