-- The contact form's rate limit, shared by every server that answers /api/contact: one row for each message or demo
-- request the website tried to deliver. Only keyed one-way hashes of the sender's network address and email address
-- are kept, never what they wrote, and rows are deleted after two days.
create table if not exists contact_sends (
  id bigserial primary key,
  sent_at timestamptz not null default now(),
  kind text not null,
  address_hash text not null,
  email_hash text not null
);
create index if not exists contact_sends_address_idx on contact_sends (address_hash, sent_at);
create index if not exists contact_sends_email_idx on contact_sends (email_hash, sent_at);
create index if not exists contact_sends_sent_at_idx on contact_sends (sent_at);
