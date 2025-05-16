-- Table: public.Category

-- DROP TABLE IF EXISTS public."Category";

CREATE TABLE IF NOT EXISTS public."Category"
(
    id integer NOT NULL DEFAULT nextval('"Category_id_seq"'::regclass),
    name text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Category"
    OWNER to "user";

    -- Table: public.Event

    -- DROP TABLE IF EXISTS public."Event";

    CREATE TABLE IF NOT EXISTS public."Event"
    (
        id integer NOT NULL DEFAULT nextval('"Event_id_seq"'::regclass),
        name text COLLATE pg_catalog."default" NOT NULL,
        description text COLLATE pg_catalog."default" NOT NULL,
        date timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isPaid" boolean NOT NULL DEFAULT false,
        price double precision,
        "organizerId" integer NOT NULL,
        "venueId" integer,
        image text COLLATE pg_catalog."default",
        CONSTRAINT "Event_pkey" PRIMARY KEY (id),
        CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId")
            REFERENCES public."User" (id) MATCH SIMPLE
            ON UPDATE CASCADE
            ON DELETE RESTRICT,
        CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId")
            REFERENCES public."Venue" (id) MATCH SIMPLE
            ON UPDATE CASCADE
            ON DELETE SET NULL
    )

    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public."Event"
        OWNER to "user";


