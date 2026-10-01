-- =========================================================
-- MEMORA CUSTOMER SYSTEM FINAL
-- =========================================================


-- =========================================================
-- ORDER ADDRESS SNAPSHOT
-- =========================================================

alter table public.orders
add column if not exists shipping_address_id uuid;

alter table public.orders
add column if not exists shipping_label text;

alter table public.orders
add column if not exists shipping_recipient_name text;

alter table public.orders
add column if not exists shipping_phone text;

alter table public.orders
add column if not exists shipping_province text;

alter table public.orders
add column if not exists shipping_city text;

alter table public.orders
add column if not exists shipping_district text;

alter table public.orders
add column if not exists shipping_village text;

alter table public.orders
add column if not exists shipping_postal_code text;

alter table public.orders
add column if not exists shipping_address_line text;

alter table public.orders
add column if not exists shipping_landmark text;


-- =========================================================
-- AUTH USER UNIQUE CUSTOMER
-- =========================================================

create unique index if not exists
uq_customers_auth_user_id
on public.customers(auth_user_id)
where auth_user_id is not null;


-- =========================================================
-- TABLE PRIVILEGES
-- =========================================================

grant select
on public.orders
to authenticated;

grant select
on public.order_items
to authenticated;

grant select
on public.order_status_history
to authenticated;

grant select
on public.shipping
to authenticated;

grant select
on public.shipping_history
to authenticated;

grant select
on public.payments
to authenticated;


-- =========================================================
-- ORDERS RLS
-- =========================================================

alter table public.orders
enable row level security;

drop policy if exists
"customers can read own orders"
on public.orders;

create policy
"customers can read own orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.customers c
    where c.id = orders.customer_id
      and c.auth_user_id = auth.uid()
  )
);


-- =========================================================
-- ORDER ITEMS RLS
-- =========================================================

alter table public.order_items
enable row level security;

drop policy if exists
"customers can read own order items"
on public.order_items;

create policy
"customers can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c
      on c.id = o.customer_id
    where o.id = order_items.order_id
      and c.auth_user_id = auth.uid()
  )
);


-- =========================================================
-- ORDER STATUS HISTORY RLS
-- =========================================================

alter table public.order_status_history
enable row level security;

drop policy if exists
"customers can read own order history"
on public.order_status_history;

create policy
"customers can read own order history"
on public.order_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c
      on c.id = o.customer_id
    where o.id = order_status_history.order_id
      and c.auth_user_id = auth.uid()
  )
);


-- =========================================================
-- SHIPPING RLS
-- =========================================================

alter table public.shipping
enable row level security;

drop policy if exists
"customers can read own shipping"
on public.shipping;

create policy
"customers can read own shipping"
on public.shipping
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c
      on c.id = o.customer_id
    where o.id = shipping.order_id
      and c.auth_user_id = auth.uid()
  )
);


-- =========================================================
-- SHIPPING HISTORY
-- =========================================================

alter table public.shipping_history
enable row level security;

drop policy if exists
"customers can read own shipping history"
on public.shipping_history;

create policy
"customers can read own shipping history"
on public.shipping_history
for select
to authenticated
using (
  exists (
    select 1
    from public.shipping s
    join public.orders o
      on o.id = s.order_id
    join public.customers c
      on c.id = o.customer_id
    where s.id = shipping_history.shipping_id
      and c.auth_user_id = auth.uid()
  )
);


-- =========================================================
-- PAYMENT RLS
-- =========================================================

alter table public.payments
enable row level security;

drop policy if exists
"customers can read own payments"
on public.payments;

create policy
"customers can read own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c
      on c.id = o.customer_id
    where o.id = payments.order_id
      and c.auth_user_id = auth.uid()
  )
);


-- =========================================================
-- FIX EXISTING DUPLICATE CUSTOMER SAFETY
--
-- Kalau checkout lama membuat customer baru dengan email sama,
-- order akan diarahkan kembali ke customer yang memiliki Auth ID.
-- =========================================================

create or replace function public.memora_fix_order_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_customer public.customers%rowtype;
  correct_customer_id uuid;
begin

  select *
  into current_customer
  from public.customers
  where id = new.customer_id;

  if current_customer.id is null then
    return new;
  end if;

  if current_customer.auth_user_id is not null then
    return new;
  end if;

  if current_customer.email is null then
    return new;
  end if;

  select c.id
  into correct_customer_id
  from public.customers c
  where lower(c.email) = lower(current_customer.email)
    and c.auth_user_id is not null
  order by c.created_at asc
  limit 1;

  if correct_customer_id is not null then
    new.customer_id := correct_customer_id;
  end if;

  return new;

end;
$$;


drop trigger if exists
trg_memora_fix_order_customer
on public.orders;

create trigger
trg_memora_fix_order_customer

before insert
on public.orders

for each row
execute function public.memora_fix_order_customer();


-- =========================================================
-- VERIFICATION
-- =========================================================

select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
  and column_name like 'shipping_%'
order by ordinal_position;

