-- ATHAQ LIVE PRODUCTS + SECURE ADMIN AUTH
-- Run all of this in Supabase SQL Editor.

create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null, sku text not null unique, category text not null default 'Premium Dates',
 price numeric(12,2) not null default 0, stock integer not null default 0, quality text not null default '★★★★★',
 description text default '', image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select to anon, authenticated using (true);

drop policy if exists "Only ATHAQ admin can insert products" on public.products;
create policy "Only ATHAQ admin can insert products" on public.products for insert to authenticated with check ((select auth.jwt()->>'email') = 'xshazam023@gmail.com');
drop policy if exists "Only ATHAQ admin can update products" on public.products;
create policy "Only ATHAQ admin can update products" on public.products for update to authenticated using ((select auth.jwt()->>'email') = 'xshazam023@gmail.com') with check ((select auth.jwt()->>'email') = 'xshazam023@gmail.com');
drop policy if exists "Only ATHAQ admin can delete products" on public.products;
create policy "Only ATHAQ admin can delete products" on public.products for delete to authenticated using ((select auth.jwt()->>'email') = 'xshazam023@gmail.com');

insert into storage.buckets (id,name,public) values ('product-images','product-images',true) on conflict (id) do update set public=true;
drop policy if exists "Public can view ATHAQ product images" on storage.objects;
create policy "Public can view ATHAQ product images" on storage.objects for select to anon,authenticated using (bucket_id='product-images');
drop policy if exists "Only ATHAQ admin can upload product images" on storage.objects;
create policy "Only ATHAQ admin can upload product images" on storage.objects for insert to authenticated with check (bucket_id='product-images' and (select auth.jwt()->>'email')='xshazam023@gmail.com');
drop policy if exists "Only ATHAQ admin can update product images" on storage.objects;
create policy "Only ATHAQ admin can update product images" on storage.objects for update to authenticated using (bucket_id='product-images' and (select auth.jwt()->>'email')='xshazam023@gmail.com') with check (bucket_id='product-images' and (select auth.jwt()->>'email')='xshazam023@gmail.com');
drop policy if exists "Only ATHAQ admin can delete product images" on storage.objects;
create policy "Only ATHAQ admin can delete product images" on storage.objects for delete to authenticated using (bucket_id='product-images' and (select auth.jwt()->>'email')='xshazam023@gmail.com');


