-- Community Hub editing backend (CMS).
--
-- cms_content   one row per edited thing: a text, a link, an image, an alt text, a
--               hidden section, or a whole list (add / remove / reorder). Absent row = the
--               code default shows. Keys are described in src/lib/cms/core.ts.
-- cms_revisions append-only history: who changed what, when, the old value and the new one.
-- cms_*         Better Auth tables for the admin sign-in only (kept apart from any other
--               auth tables the template may have). Column names are camelCase and quoted
--               because Better Auth queries them that way.

create table if not exists cms_content (
  key text primary key,
  value text not null,
  updated_by text not null,
  updated_at timestamptz not null default now()
);

create table if not exists cms_revisions (
  id bigserial primary key,
  key text not null,
  old_value text,
  new_value text,
  action text not null check (action in ('edit', 'revert', 'reset')),
  actor_email text not null,
  reverted_from bigint,
  batch text,
  created_at timestamptz not null default now()
);
create index if not exists cms_revisions_key_idx on cms_revisions (key, id desc);
create index if not exists cms_revisions_batch_idx on cms_revisions (batch);
create index if not exists cms_revisions_recent_idx on cms_revisions (id desc);

create table if not exists cms_user (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists cms_session (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references cms_user ("id") on delete cascade
);
create index if not exists cms_session_user_idx on cms_session ("userId");

create table if not exists cms_account (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references cms_user ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null
);
create index if not exists cms_account_user_idx on cms_account ("userId");

create table if not exists cms_verification (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists cms_rate_limit (
  "id" text not null primary key,
  "key" text not null unique,
  "count" integer not null,
  "lastRequest" bigint not null
);
