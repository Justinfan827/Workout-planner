create table "public"."merchant_keys" (
    "uuid" uuid not null default gen_random_uuid(),
    "ansa_merchant_secret_key" text not null,
    "merchant_uuid" uuid not null
);


alter table "public"."merchant_keys" enable row level security;

create table "public"."merchants" (
    "uuid" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "ansa_merchant_uuid" uuid not null default gen_random_uuid(),
    "ansa_merchant_name" text not null
);


alter table "public"."merchants" enable row level security;

create table "public"."user_merchants" (
    "uuid" uuid not null default gen_random_uuid(),
    "user_uuid" uuid not null,
    "merchant_uuid" uuid not null
);


alter table "public"."user_merchants" enable row level security;

create table "public"."users" (
    "uuid" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "email" text not null,
    "first_name" text,
    "last_name" text
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX merchant_keys_merchant_uuid_key ON public.merchant_keys USING btree (merchant_uuid);

CREATE UNIQUE INDEX merchant_keys_pkey ON public.merchant_keys USING btree (uuid);

CREATE UNIQUE INDEX merchants_ansa_merchant_uuid_key ON public.merchants USING btree (ansa_merchant_uuid);

CREATE UNIQUE INDEX merchants_pkey ON public.merchants USING btree (uuid);

CREATE UNIQUE INDEX user_merchants_pkey ON public.user_merchants USING btree (uuid);

CREATE UNIQUE INDEX user_merchants_user_uuid_key ON public.user_merchants USING btree (user_uuid);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (uuid);

alter table "public"."merchant_keys" add constraint "merchant_keys_pkey" PRIMARY KEY using index "merchant_keys_pkey";

alter table "public"."merchants" add constraint "merchants_pkey" PRIMARY KEY using index "merchants_pkey";

alter table "public"."user_merchants" add constraint "user_merchants_pkey" PRIMARY KEY using index "user_merchants_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."merchant_keys" add constraint "merchant_keys_merchant_uuid_fkey" FOREIGN KEY (merchant_uuid) REFERENCES merchants(uuid) ON DELETE CASCADE not valid;

alter table "public"."merchant_keys" validate constraint "merchant_keys_merchant_uuid_fkey";

alter table "public"."merchant_keys" add constraint "merchant_keys_merchant_uuid_key" UNIQUE using index "merchant_keys_merchant_uuid_key";

alter table "public"."merchants" add constraint "merchants_ansa_merchant_uuid_key" UNIQUE using index "merchants_ansa_merchant_uuid_key";

alter table "public"."user_merchants" add constraint "user_merchants_merchant_uuid_fkey" FOREIGN KEY (merchant_uuid) REFERENCES merchants(uuid) ON DELETE CASCADE not valid;

alter table "public"."user_merchants" validate constraint "user_merchants_merchant_uuid_fkey";

alter table "public"."user_merchants" add constraint "user_merchants_user_uuid_fkey" FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE not valid;

alter table "public"."user_merchants" validate constraint "user_merchants_user_uuid_fkey";

alter table "public"."user_merchants" add constraint "user_merchants_user_uuid_key" UNIQUE using index "user_merchants_user_uuid_key";

create policy "Enable read access for anon"
on "public"."merchants"
as permissive
for select
to anon
using (true);


create policy "Enable users to view all rows"
on "public"."merchants"
as permissive
for select
to authenticated
using (true);


create policy "Enable read access for anon"
on "public"."user_merchants"
as permissive
for select
to anon
using (true);


create policy "Enable users to view all rows"
on "public"."user_merchants"
as permissive
for select
to authenticated
using (true);


create policy "Enable read access for anon user"
on "public"."users"
as permissive
for select
to anon
using (true);


create policy "Enable users to view all rows"
on "public"."users"
as permissive
for select
to authenticated
using (true);


CREATE OR REPLACE FUNCTION public.handle_new_user ()
    RETURNS TRIGGER
    AS $$
BEGIN
    INSERT INTO public.users (uuid, email)
        VALUES (NEW.id, NEW.email);
    RETURN new;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_delete_user ()
    RETURNS TRIGGER
    AS $$
BEGIN
    DELETE FROM public.users
    WHERE uuid = OLD.id;
    RETURN old;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user ();

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_delete_user ();

