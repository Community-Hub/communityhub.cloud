-- Each edit remembers a fingerprint of the code default it was made against. If the code's wording or list
-- changes later, the edit is set aside (shown as "stale" in the editor) instead of landing on the wrong item.
-- Rows saved before this migration have no fingerprint and keep applying as before.
alter table cms_content add column if not exists def_hash text;
