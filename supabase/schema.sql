-- Schema for Marmoleria Inventario

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Placas table
create table if not exists public.placas (
    id uuid default uuid_generate_v4() primary key,
    nombre text not null,
    material text not null,
    lote text,
    largo numeric(10, 2) not null,
    ancho numeric(10, 2) not null,
    grosor numeric(10, 2) not null,
    metros_cuadrados_sobrantes numeric(10, 2) not null,
    ubicacion text,
    precio_m2 numeric(10, 2),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)
alter table public.placas enable row level security;

-- Permissive policies for anonymous access during development
create policy "Allow anonymous select on placas"
    on public.placas for select
    to anon
    using (true);

create policy "Allow anonymous insert on placas"
    on public.placas for insert
    to anon
    with check (true);

create policy "Allow anonymous update on placas"
    on public.placas for update
    to anon
    using (true);

create policy "Allow anonymous delete on placas"
    on public.placas for delete
    to anon
    using (true);
