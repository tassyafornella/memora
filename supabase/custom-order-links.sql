-- ============================================================
-- MEMORA PRIVATE CUSTOM ORDER LINK SYSTEM
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- STUDIO ADMIN TABLE
-- ============================================================

create table if not exists public.memora_studio_admins (

  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  created_at timestamptz
    not null
    default now()

);


alter table public.memora_studio_admins
enable row level security;


-- No direct client policies.
-- Access is handled through SECURITY DEFINER functions.



-- ============================================================
-- CUSTOM ORDER LINKS
-- ============================================================

create table if not exists public.custom_order_links (

  id uuid primary key
    default gen_random_uuid(),

  token text
    not null
    unique,

  customer_name text,

  customer_whatsapp text,

  product_name text
    not null,

  variant_name text,

  custom_items jsonb
    not null
    default '[]'::jsonb,

  quantity_total integer
    not null
    default 1
    check (quantity_total > 0),

  unit_price numeric(14,2)
    not null
    default 0,

  total_price numeric(14,2)
    not null
    default 0,

  admin_note text,

  customer_message text,

  is_active boolean
    not null
    default true,

  max_uses integer
    not null
    default 1
    check (max_uses > 0),

  used_count integer
    not null
    default 0
    check (used_count >= 0),

  expires_at timestamptz,

  used_at timestamptz,

  created_by uuid
    references auth.users(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now()

);


create index if not exists
custom_order_links_token_idx
on public.custom_order_links(token);


create index if not exists
custom_order_links_created_at_idx
on public.custom_order_links(created_at desc);


alter table public.custom_order_links
enable row level security;



-- ============================================================
-- CONFIRMATIONS
-- ============================================================

create table if not exists public.custom_order_confirmations (

  id uuid primary key
    default gen_random_uuid(),

  custom_order_link_id uuid
    not null
    references public.custom_order_links(id)
    on delete cascade,

  customer_name text,

  customer_whatsapp text,

  customer_note text,

  confirmed_at timestamptz
    not null
    default now()

);


alter table public.custom_order_confirmations
enable row level security;



-- ============================================================
-- UPDATED AT
-- ============================================================

create or replace function
public.set_custom_order_updated_at()

returns trigger

language plpgsql

as $$

begin

  new.updated_at = now();

  return new;

end;

$$;


drop trigger if exists
custom_order_links_updated_at
on public.custom_order_links;


create trigger
custom_order_links_updated_at

before update
on public.custom_order_links

for each row

execute function
public.set_custom_order_updated_at();



-- ============================================================
-- ADMIN CHECK
-- ============================================================

create or replace function
public.is_memora_studio_admin()

returns boolean

language sql

stable

security definer

set search_path = public

as $$

  select exists (

    select 1

    from public.memora_studio_admins

    where user_id = auth.uid()

  );

$$;


revoke all
on function public.is_memora_studio_admin()
from public;


grant execute
on function public.is_memora_studio_admin()
to authenticated;



-- ============================================================
-- PUBLIC GET BY TOKEN
--
-- No table SELECT permission is given to anonymous visitors.
-- Visitor must know the exact token.
-- ============================================================

create or replace function
public.get_custom_order_link(
  p_token text
)

returns jsonb

language plpgsql

security definer

set search_path = public

as $$

declare

  v_row public.custom_order_links%rowtype;

  v_status text;

begin

  select *

  into v_row

  from public.custom_order_links

  where token = p_token

  limit 1;


  if not found then

    return jsonb_build_object(
      'found', false,
      'status', 'not_found'
    );

  end if;


  if v_row.is_active = false then

    v_status := 'disabled';

  elsif
    v_row.expires_at is not null
    and v_row.expires_at <= now()
  then

    v_status := 'expired';

  elsif
    v_row.used_count >= v_row.max_uses
  then

    v_status := 'used';

  else

    v_status := 'active';

  end if;


  return jsonb_build_object(

    'found', true,

    'status', v_status,

    'id', v_row.id,

    'customer_name', v_row.customer_name,

    'product_name', v_row.product_name,

    'variant_name', v_row.variant_name,

    'custom_items', v_row.custom_items,

    'quantity_total', v_row.quantity_total,

    'unit_price', v_row.unit_price,

    'total_price', v_row.total_price,

    'customer_message', v_row.customer_message,

    'expires_at', v_row.expires_at

  );

end;

$$;


revoke all
on function public.get_custom_order_link(text)
from public;


grant execute
on function public.get_custom_order_link(text)
to anon, authenticated;



-- ============================================================
-- CONFIRM CUSTOM ORDER
-- ============================================================

create or replace function
public.confirm_custom_order_link(

  p_token text,

  p_customer_name text,

  p_customer_whatsapp text,

  p_customer_note text default null

)

returns jsonb

language plpgsql

security definer

set search_path = public

as $$

declare

  v_link public.custom_order_links%rowtype;

begin

  select *

  into v_link

  from public.custom_order_links

  where token = p_token

  for update;


  if not found then

    raise exception
      'CUSTOM_ORDER_NOT_FOUND';

  end if;


  if v_link.is_active = false then

    raise exception
      'CUSTOM_ORDER_DISABLED';

  end if;


  if
    v_link.expires_at is not null
    and
    v_link.expires_at <= now()
  then

    raise exception
      'CUSTOM_ORDER_EXPIRED';

  end if;


  if
    v_link.used_count >=
    v_link.max_uses
  then

    raise exception
      'CUSTOM_ORDER_USED';

  end if;


  insert into
  public.custom_order_confirmations (

    custom_order_link_id,

    customer_name,

    customer_whatsapp,

    customer_note

  )

  values (

    v_link.id,

    nullif(
      trim(p_customer_name),
      ''
    ),

    nullif(
      trim(p_customer_whatsapp),
      ''
    ),

    nullif(
      trim(p_customer_note),
      ''
    )

  );


  update
  public.custom_order_links

  set

    used_count =
      used_count + 1,

    used_at =
      case
        when used_count + 1 >= max_uses
        then now()
        else used_at
      end

  where id = v_link.id;


  return jsonb_build_object(

    'success', true,

    'message',
    'Pesanan custom berhasil dikonfirmasi.'

  );

end;

$$;


revoke all
on function public.confirm_custom_order_link(
  text,
  text,
  text,
  text
)
from public;


grant execute
on function public.confirm_custom_order_link(
  text,
  text,
  text,
  text
)
to anon, authenticated;



-- ============================================================
-- ADMIN LIST
-- ============================================================

create or replace function
public.admin_list_custom_order_links()

returns setof public.custom_order_links

language plpgsql

security definer

set search_path = public

as $$

begin

  if not public.is_memora_studio_admin() then

    raise exception
      'NOT_AUTHORIZED';

  end if;


  return query

  select *

  from public.custom_order_links

  order by created_at desc;

end;

$$;


revoke all
on function public.admin_list_custom_order_links()
from public;


grant execute
on function public.admin_list_custom_order_links()
to authenticated;



-- ============================================================
-- ADMIN CREATE
-- ============================================================

create or replace function
public.admin_create_custom_order_link(

  p_customer_name text,

  p_customer_whatsapp text,

  p_product_name text,

  p_variant_name text,

  p_custom_items jsonb,

  p_quantity_total integer,

  p_unit_price numeric,

  p_total_price numeric,

  p_admin_note text,

  p_customer_message text,

  p_expires_at timestamptz,

  p_max_uses integer default 1

)

returns public.custom_order_links

language plpgsql

security definer

set search_path = public

as $$

declare

  v_row public.custom_order_links%rowtype;

begin

  if not public.is_memora_studio_admin() then

    raise exception
      'NOT_AUTHORIZED';

  end if;


  if
    trim(
      coalesce(
        p_product_name,
        ''
      )
    ) = ''
  then

    raise exception
      'PRODUCT_REQUIRED';

  end if;


  if
    coalesce(
      p_quantity_total,
      0
    ) <= 0
  then

    raise exception
      'QUANTITY_INVALID';

  end if;


  if
    coalesce(
      p_total_price,
      0
    ) < 0
  then

    raise exception
      'TOTAL_INVALID';

  end if;


  insert into
  public.custom_order_links (

    token,

    customer_name,

    customer_whatsapp,

    product_name,

    variant_name,

    custom_items,

    quantity_total,

    unit_price,

    total_price,

    admin_note,

    customer_message,

    expires_at,

    max_uses,

    created_by

  )

  values (

    encode(
      gen_random_bytes(24),
      'hex'
    ),

    nullif(
      trim(p_customer_name),
      ''
    ),

    nullif(
      trim(p_customer_whatsapp),
      ''
    ),

    trim(p_product_name),

    nullif(
      trim(p_variant_name),
      ''
    ),

    coalesce(
      p_custom_items,
      '[]'::jsonb
    ),

    p_quantity_total,

    coalesce(
      p_unit_price,
      0
    ),

    coalesce(
      p_total_price,
      0
    ),

    nullif(
      trim(p_admin_note),
      ''
    ),

    nullif(
      trim(p_customer_message),
      ''
    ),

    p_expires_at,

    greatest(
      coalesce(
        p_max_uses,
        1
      ),
      1
    ),

    auth.uid()

  )

  returning *

  into v_row;


  return v_row;

end;

$$;


revoke all
on function public.admin_create_custom_order_link(
  text,
  text,
  text,
  text,
  jsonb,
  integer,
  numeric,
  numeric,
  text,
  text,
  timestamptz,
  integer
)
from public;


grant execute
on function public.admin_create_custom_order_link(
  text,
  text,
  text,
  text,
  jsonb,
  integer,
  numeric,
  numeric,
  text,
  text,
  timestamptz,
  integer
)
to authenticated;



-- ============================================================
-- ADMIN TOGGLE
-- ============================================================

create or replace function
public.admin_set_custom_order_active(

  p_id uuid,

  p_is_active boolean

)

returns boolean

language plpgsql

security definer

set search_path = public

as $$

begin

  if not public.is_memora_studio_admin() then

    raise exception
      'NOT_AUTHORIZED';

  end if;


  update
  public.custom_order_links

  set
    is_active = p_is_active

  where id = p_id;


  return found;

end;

$$;


revoke all
on function public.admin_set_custom_order_active(
  uuid,
  boolean
)
from public;


grant execute
on function public.admin_set_custom_order_active(
  uuid,
  boolean
)
to authenticated;



-- ============================================================
-- ADMIN DELETE
-- ============================================================

create or replace function
public.admin_delete_custom_order_link(
  p_id uuid
)

returns boolean

language plpgsql

security definer

set search_path = public

as $$

begin

  if not public.is_memora_studio_admin() then

    raise exception
      'NOT_AUTHORIZED';

  end if;


  delete from
  public.custom_order_links

  where id = p_id;


  return found;

end;

$$;


revoke all
on function public.admin_delete_custom_order_link(uuid)
from public;


grant execute
on function public.admin_delete_custom_order_link(uuid)
to authenticated;


-- ============================================================
-- IMPORTANT:
--
-- SET ADMIN AFTER RUNNING THIS FILE.
--
-- Replace YOUR-STUDIO-EMAIL@example.com with the email
-- used to login to Memora Studio.
-- ============================================================

-- insert into public.memora_studio_admins(user_id)
-- select id
-- from auth.users
-- where email = 'YOUR-STUDIO-EMAIL@example.com'
-- on conflict (user_id) do nothing;

