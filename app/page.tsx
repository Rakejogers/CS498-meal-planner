import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Heart,
  ListChecks,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Logo, LogoMark, Wordmark } from "@/components/logo";
import { Badge, type Tone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { APP_HOME } from "@/lib/auth";
import { getUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Baguette, Eggplant, Jar, Leaves, Tomato } from "./_landing/ingredients";
import { CartPreview, PantryPreview, WeekPreview } from "./_landing/previews";
import { RISE } from "./_landing/motion";
import { Reveal } from "./_landing/reveal";

export default async function Home() {
  const signedIn = Boolean(await getUser());
  const startHref = signedIn ? APP_HOME : "/login?mode=signup";
  const startLabel = signedIn ? "Open Plantry" : "Get started";

  return (
    <>
      <main className="overflow-x-clip">
        <section className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
          {/* Soft color washes drifting behind the content */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
            aria-hidden
          >
            <div className="absolute -top-[20%] -right-[15%] size-[min(42rem,110vw)] animate-drift rounded-full bg-saffron-soft/80 blur-3xl" />
            <div className="absolute -bottom-[25%] left-[10%] size-[min(34rem,90vw)] animate-drift rounded-full bg-sage-soft blur-3xl [animation-delay:-8s] [animation-duration:28s]" />
            <div className="absolute top-[5%] -left-[20%] size-[min(28rem,80vw)] animate-drift rounded-full bg-tomato-soft/50 blur-3xl [animation-direction:alternate-reverse] [animation-duration:18s]" />
          </div>

          <div className="animate-rise">
            <LogoMark
              className="size-24 animate-float sm:size-28"
              sizes="(min-width: 640px) 160px, 136px"
            />
          </div>

          <h1 className="mt-6 animate-rise [animation-delay:120ms]">
            <span className="sr-only">Plantry</span>
            <Wordmark className="w-52 sm:w-72" sizes="(min-width: 640px) 330px, 240px" />
          </h1>

          <p className="mt-10 animate-rise font-display text-3xl leading-[1.1] font-medium [animation-delay:260ms] sm:mt-12 sm:text-4xl">
            Dinner, <em className="font-normal text-primary italic">sorted</em> for the whole week.
          </p>
          <p className="mt-4 max-w-md animate-rise leading-relaxed text-muted-foreground [animation-delay:360ms] sm:text-lg">
            A week of dinners planned around your kitchen, and one tidy grocery list.
          </p>

          <div className="mt-12 flex animate-rise flex-col items-center gap-4 [animation-delay:480ms]">
            <BasketLink href={startHref}>{startLabel}</BasketLink>
            {!signedIn && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className={TEXT_LINK}>
                  Log in
                </Link>
              </p>
            )}
          </div>

          {/* Left out on short screens, where it would crowd the actions. */}
          <a
            href="#how"
            className="absolute bottom-6 inline-flex animate-rise flex-col items-center gap-1 rounded-lg px-3 py-1 text-sm text-muted-foreground transition-colors outline-none [animation-delay:900ms] hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 [@media(max-height:720px)]:hidden"
          >
            See how it works
            <ChevronDown aria-hidden className="size-4 animate-float [animation-duration:2.4s]" />
          </a>
        </section>

        <section
          id="how"
          aria-labelledby="how-heading"
          className="mx-auto max-w-6xl scroll-mt-8 px-6 py-24 text-center sm:py-32"
        >
          <Reveal>
            <h2
              id="how-heading"
              className={cn(
                RISE,
                "mx-auto max-w-3xl font-display text-4xl leading-[1.08] font-medium text-balance sm:text-5xl",
              )}
            >
              From <em className="font-normal text-primary italic">“what&apos;s for dinner?”</em> to
              a full cart.
            </h2>
          </Reveal>

          <Reveal className="relative mt-16 sm:mt-20">
            {/* The path between the steps, drawn as they arrive. */}
            <div
              aria-hidden
              className="absolute top-8 right-[12.5%] left-[12.5%] hidden origin-left scale-x-0 border-t-2 border-dashed border-input transition-transform duration-[1600ms] ease-out group-data-[shown]/reveal:scale-x-100 motion-reduce:transition-none lg:block"
            />
            {/* A marker making the trip from tastes to cart, passing behind each step. */}
            <div
              aria-hidden
              className="absolute top-8 right-[12.5%] left-[12.5%] hidden opacity-0 group-data-[shown]/reveal:animate-travel group-data-[shown]/reveal:[animation-delay:1.8s] lg:block"
            >
              <span className="absolute top-0 left-0 size-2.5 -translate-1/2 rounded-full bg-tomato" />
            </div>
            <ol className="relative grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className={cn(RISE, "group/step flex flex-col items-center")}
                  style={{ animationDelay: `${index * 180}ms` }}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-16 place-items-center rounded-2xl ring-8 ring-background transition-[translate,rotate] duration-300 ease-out group-hover/step:-translate-y-1 group-hover/step:-rotate-6 motion-reduce:transition-none",
                      step.tile,
                    )}
                  >
                    <step.icon className="size-7" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-medium">{step.title}</h3>
                  <p className="mt-1.5 max-w-52 text-sm leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <div className="mx-auto max-w-6xl space-y-24 px-6 pb-24 sm:space-y-36 sm:pb-36">
          <Feature
            id="plan"
            tone="sage"
            eyebrow="The plan"
            title={
              <>
                A week that <Accent>fits together.</Accent>
              </>
            }
            text="Dinners that share ingredients, so you buy less and use it all. Swap any night you like."
            graphic={<WeekPreview />}
          />
          <Feature
            id="kitchen"
            tone="saffron"
            eyebrow="Your kitchen"
            title={
              <>
                It knows what&apos;s <Accent>already home.</Accent>
              </>
            }
            text="No counting jars. Just have, low, or out, and the week is planned around it."
            graphic={<PantryPreview />}
            flip
          />
          <Feature
            id="shop"
            tone="sky"
            eyebrow="The shop"
            title={
              <>
                From list to cart, <Accent>in one go.</Accent>
              </>
            }
            text="Every ingredient matched to a real product at your store. Nothing is added until you say so."
            graphic={<CartPreview />}
          />
        </div>

        <section aria-labelledby="start-heading" className="px-3 pb-3 sm:px-6 sm:pb-6">
          <Reveal className="relative isolate mx-auto flex max-w-6xl flex-col items-center overflow-hidden rounded-[2.5rem] bg-primary px-6 py-20 text-center text-primary-foreground sm:py-28">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              {FLOATING.map(({ Shape, spot, size, delay, drift }) => (
                <div
                  key={spot}
                  className={cn(RISE, "absolute", spot)}
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <Shape className={cn("animate-float", size)} style={drift} />
                </div>
              ))}
            </div>
            <div className={RISE}>
              <LogoMark variant="badge" className="size-16 animate-float" />
            </div>
            <h2
              id="start-heading"
              className={cn(
                RISE,
                "mt-8 font-display text-4xl leading-[1.08] font-medium text-balance [animation-delay:120ms] sm:text-6xl",
              )}
            >
              Plan once. Shop once.
              <br />
              <em className="font-normal text-saffron italic">Eat well all week.</em>
            </h2>
            <div className={cn(RISE, "mt-10 [animation-delay:240ms]")}>
              <Link
                href={startHref}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "group bg-background text-primary hover:bg-background/90 focus-visible:ring-background/40",
                )}
              >
                {startLabel}
                <ArrowRight
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <Logo />
        <p>© Plantry. Made for home cooks.</p>
      </footer>
    </>
  );
}

const TEXT_LINK =
  "rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-4 focus-visible:ring-ring/20";

const STEPS: { title: string; text: string; icon: LucideIcon; tile: string }[] = [
  {
    title: "Share your tastes",
    text: "Likes, dislikes, and who's at the table.",
    icon: Heart,
    tile: "bg-tomato-soft text-tomato-ink",
  },
  {
    title: "Get your week",
    text: "Dinners picked to go together.",
    icon: CalendarDays,
    tile: "bg-sage-soft text-sage-ink",
  },
  {
    title: "See one list",
    text: "Only what you still need to buy.",
    icon: ListChecks,
    tile: "bg-saffron-soft text-saffron-ink",
  },
  {
    title: "Fill your cart",
    text: "Approve it, then check out at your store.",
    icon: ShoppingCart,
    tile: "bg-sky-soft text-sky-ink",
  },
];

// The logo's ingredients loose around the closing panel. Each bobs at its own pace.
const FLOATING = [
  {
    Shape: Leaves,
    spot: "top-8 left-5 -rotate-12 sm:top-[16%] sm:left-[9%]",
    size: "w-10 sm:w-16",
    delay: 200,
    drift: { animationDuration: "7s" },
  },
  {
    Shape: Jar,
    spot: "top-9 right-6 rotate-12 sm:top-[20%] sm:right-[10%]",
    size: "w-7 sm:w-11",
    delay: 320,
    drift: { animationDuration: "6s", animationDelay: "-2s" },
  },
  {
    Shape: Tomato,
    spot: "bottom-8 left-7 sm:bottom-[16%] sm:left-[15%]",
    size: "w-9 sm:w-14",
    delay: 440,
    drift: { animationDuration: "5.5s", animationDelay: "-3.5s" },
  },
  {
    Shape: Eggplant,
    spot: "right-7 bottom-7 rotate-[20deg] sm:right-[15%] sm:bottom-[14%]",
    size: "w-7 sm:w-11",
    delay: 560,
    drift: { animationDuration: "6.5s", animationDelay: "-1s" },
  },
  {
    Shape: Baguette,
    spot: "top-[44%] left-[3%] hidden rotate-[35deg] lg:block",
    size: "w-5",
    delay: 680,
    drift: { animationDuration: "8s", animationDelay: "-4s" },
  },
];

/** The italic green phrase that carries a heading. */
function Accent({ children }: { children: React.ReactNode }) {
  return <em className="font-normal text-primary italic">{children}</em>;
}

/** One big idea beside a picture of it. `flip` puts the picture first on wide screens. */
function Feature({
  id,
  tone,
  eyebrow,
  title,
  text,
  graphic,
  flip,
}: {
  id: string;
  tone: Tone;
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  graphic: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
    >
      <Reveal className={cn("text-center lg:text-left", flip && "lg:order-last")}>
        <Badge tone={tone} className={cn(RISE, "px-3 py-1 text-sm")}>
          {eyebrow}
        </Badge>
        <h2
          id={`${id}-heading`}
          className={cn(
            RISE,
            "mt-5 font-display text-4xl leading-[1.08] font-medium text-balance [animation-delay:100ms] sm:text-5xl",
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            RISE,
            "mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground [animation-delay:200ms] lg:mx-0",
          )}
        >
          {text}
        </p>
      </Reveal>
      {graphic}
    </section>
  );
}

// Shared by the ingredients: they tumble in on hover and sink back into the basket after.
const INGREDIENT =
  "absolute translate-y-3 overflow-visible stroke-background stroke-2 opacity-0 [paint-order:stroke] transition duration-200 group-hover:translate-y-0 group-hover:animate-drop-in group-hover:opacity-100 group-hover:transition-none group-focus-visible:translate-y-0 group-focus-visible:animate-drop-in group-focus-visible:opacity-100 group-focus-visible:transition-none";

/** The primary action. On hover the pill squares off into the logo's basket and the ingredients drop in. */
function BasketLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex h-13 min-w-48 items-center justify-center px-7 font-medium text-primary-foreground outline-none select-none"
    >
      {/* In drop order. Later ones sit in front, like the logo's tomato. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
        <Leaves className={cn(INGREDIENT, "-top-9 left-10 w-11 [--drop-spin:-150deg]")} />
        <Jar
          className={cn(
            INGREDIENT,
            "-top-9 left-34 w-8 rotate-3 [--drop-delay:180ms] [--drop-spin:130deg]",
          )}
        />
        <Baguette
          className={cn(
            INGREDIENT,
            "-top-10 left-6 w-5 -rotate-12 [--drop-delay:360ms] [--drop-spin:200deg]",
          )}
        />
        <Eggplant
          className={cn(
            INGREDIENT,
            "-top-9 left-27 w-7.5 rotate-12 [--drop-delay:540ms] [--drop-spin:-170deg]",
          )}
        />
        <Tomato
          className={cn(
            INGREDIENT,
            "-top-8 left-[4.6rem] w-10 [--drop-delay:720ms] [--drop-spin:160deg]",
          )}
        />
      </span>
      <span
        aria-hidden
        className="absolute inset-0 rounded-[1.625rem] bg-primary shadow-sm shadow-primary/20 transition-[border-radius,background-color,box-shadow] duration-300 ease-out group-hover:rounded-t-lg group-hover:bg-tomato group-hover:ring-2 group-hover:shadow-tomato/25 group-hover:ring-background group-focus-visible:rounded-t-lg group-focus-visible:bg-tomato group-focus-visible:ring-4 group-focus-visible:ring-ring/20 group-active:scale-[0.98] motion-reduce:transition-none"
      />
      <span className="relative inline-flex items-center gap-2">
        {children}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
