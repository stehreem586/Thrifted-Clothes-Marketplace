-- Chat feature schema for Supabase (Postgres)
-- Run this once in Supabase Dashboard -> SQL Editor

create extension if not exists "pgcrypto";

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references listings(id) on delete set null,
  last_message_text text,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (buyer_id, seller_id, listing_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz default now(),
  read boolean default false
);

create index if not exists idx_messages_chat_created on messages (chat_id, created_at desc);
create index if not exists idx_chats_buyer on chats (buyer_id);
create index if not exists idx_chats_seller on chats (seller_id);

alter table chats enable row level security;
alter table messages enable row level security;

create policy "Users can view their own chats"
  on chats for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can create chats they are part of"
  on chats for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can update their own chats"
  on chats for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can view messages in their chats"
  on messages for select
  using (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and (chats.buyer_id = auth.uid() or chats.seller_id = auth.uid())
    )
  );

create policy "Users can send messages in their chats"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and (chats.buyer_id = auth.uid() or chats.seller_id = auth.uid())
    )
  );

-- Enable realtime streaming on these tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table chats;
