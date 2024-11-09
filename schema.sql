create table
  public."Employees" (
    id uuid not null default gen_random_uuid (),
    company_email character varying(200) not null,
    personal_email character varying(200) not null,
    given_name character varying(150) not null,
    surname character varying(100) null,
    citizenship character varying(2) null,
    tax_residence character varying(2) null,
    location character varying(2) null,
    mobile_number character varying(50) null,
    home_address character varying(250) null,
    birth_date date null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    is_active boolean not null default true,
    is_deleted boolean not null default false,
    constraint Employees_pkey primary key (id)
  ) tablespace pg_default;

create unique index if not exists idx_company_email on public."Employees" using btree (company_email) tablespace pg_default;


create table
  public."Clients" (
    id uuid not null default gen_random_uuid (),
    name character varying(255) not null,
    client_code character varying(8) not null,
    address character varying(255) null,
    postal_code character varying(8) null,
    country_code_iso_2 character varying(2) null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    is_active boolean not null default true,
    is_deleted boolean not null default false,
    constraint Clients_pkey primary key (id)
  ) tablespace pg_default;

create unique index if not exists idx_client_code on public."Clients" using btree (client_code) tablespace pg_default;
create unique index if not exists idx_name_country_code on public."Clients" using btree (name, country_code_iso_2) tablespace pg_default;

create table
  public."Projects" (
    id uuid not null default gen_random_uuid (),
    code character varying(50) not null,
    client_id uuid not null,
    currency character varying(6) null,
    contract_owner character varying(50) not null,
    start_date date null,
    end_date date null,
    name character varying(255) not null,
    deal_status text not null,
    billable boolean not null default false,
    engagement_manager_email character varying(255) not null,
    note text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint Projects_pkey primary key (id),
    constraint client_fk foreign key (client_id) references "Clients" (id) on delete cascade
  ) tablespace pg_default;

create unique index if not exists idx_code on public."Projects" using btree (code) tablespace pg_default;

create table
  public."Allocations" (
    id uuid not null default gen_random_uuid (),
    employee_id uuid not null,
    project_id uuid not null,
    start_date date not null,
    end_date date not null,
    allocation_percentage numeric(5,2) not null check (allocation_percentage > 0 and allocation_percentage <= 100),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    is_deleted boolean not null default false,
    constraint Allocations_pkey primary key (id),
    constraint employee_fk foreign key (employee_id) references "Employees" (id) on delete cascade,
    constraint project_fk foreign key (project_id) references "Projects" (id) on delete cascade
  ) tablespace pg_default;

-- Create index for common lookup patterns
create index idx_employee_allocation on public."Allocations" using btree (employee_id, start_date, end_date) tablespace pg_default;
create index idx_project_allocation on public."Allocations" using btree (project_id, start_date, end_date) tablespace pg_default;

-- Create Tenants table
CREATE TABLE public."Tenants" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT Tenants_pkey PRIMARY KEY (id),
    CONSTRAINT unique_subdomain UNIQUE (subdomain)
) TABLESPACE pg_default;

-- Update Employees table
ALTER TABLE public."Employees"
    ADD COLUMN tenant_id UUID NOT NULL REFERENCES public.Tenants(id) ON DELETE CASCADE;

-- Update Clients table
ALTER TABLE public."Clients" 
    ADD COLUMN tenant_id UUID NOT NULL REFERENCES public.Tenants(id) ON DELETE CASCADE;

-- Update Projects table
ALTER TABLE public."Projects"
    ADD COLUMN tenant_id UUID NOT NULL REFERENCES public.Tenants(id) ON DELETE CASCADE;

-- Update Allocations table
ALTER TABLE public."Allocations"
    ADD COLUMN tenant_id UUID NOT NULL REFERENCES public.Tenants(id) ON DELETE CASCADE;

-- Create indexes for tenant lookups
CREATE INDEX ON public."Employees" (tenant_id);
CREATE INDEX ON public."Clients" (tenant_id);
CREATE INDEX ON public."Projects" (tenant_id);
CREATE INDEX ON public."Allocations" (tenant_id);

CREATE TABLE public."UserTenants" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public."Tenants"(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT UserTenants_pkey PRIMARY KEY (id),
    CONSTRAINT unique_user_tenant UNIQUE (user_id, tenant_id)
) TABLESPACE pg_default;