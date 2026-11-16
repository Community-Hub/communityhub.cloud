import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { ContactBand } from "@/components/contact-band";
import { FrameSlider } from "@/components/product-section";
import { SiteFooter } from "@/components/site-footer";
import { type SlideFrame } from "@/lib/content";
import { productIcon } from "@/lib/product-icons";
import { PhoneWalkthrough } from "@/components/phone-walkthrough";
import { PlayPauseButton, useAutoplay } from "@/components/play-pause";
import { cn } from "@/lib/utils";
import { imageSize } from "@/lib/image-dimensions";
import { pc } from "@/lib/page-content";
import { copy } from "@/lib/copy";
import { DEMO_HREF } from "@/lib/links";
import { site } from "@/lib/site";

export type ProductSlide = {
  label: string;
  title: string;
  frameTitle?: string;
  text?: string;
  icon?: string;
  src?: string;
  fit?: "cover" | "contain";
  alt?: string;
  caption?: string;
  captionAbove?: boolean;
  legend?: string;
  embed?: string;
  partnerHeader?: string;
  displayFrame?: "screen" | "phone";
  nativeSize?: boolean;
  presentation?: boolean;
  voices?: boolean;
  images?: SlideFrame["images"];
  frames?: SlideFrame[];
  phoneWalkthrough?: boolean;
  wide?: boolean;
  live?: { href: string; label: string };
  features?: { title: string; body: string }[];
  steps?: { title: string; body: string }[];
  links?: { href: string; label: string; note: string }[];
};

function Walkthrough() {
  const [playing, setPlaying] = useAutoplay();
  return <div className="relative" data-box-frame>
    <PhoneWalkthrough running={playing} />
    <div className="absolute bottom-2 right-2"><PlayPauseButton playing={playing} onToggle={() => setPlaying(p => !p)} labels={{pause: "Pause animation", play: "Play animation"}} /></div>
  </div>;
}

/** The other products in the same group as `page`, so a buyer can keep comparing without going back. */
export function RelatedProducts({ page }: { page: string }) {
  const group = pc.products.GROUPS.find((g) => g.items.some((item) => item.href === page));
  if (!group) return null;
  const others = group.items.filter((item) => item.href !== page);
  if (!others.length) return null;

  return (
    <section aria-labelledby="related-title" className="product-related page page-center">
      <div className="wrap page-body">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="related-title" className="t-h2">
          More in {group.kicker}
        </h2>
        <AppLink href="/products" className="link">
          All products <ArrowRight className="size-4" aria-hidden />
        </AppLink>
      </div>
      <ul className="mt-[clamp(1.5rem,4vh,2.5rem)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((item) => (
          <li key={item.id}>
            <AppLink href={item.href} className="group flex h-full items-start gap-4 rounded-2xl border border-line p-5 transition-colors duration-150 hover:border-pine/30 hover:bg-field">
              <img src={productIcon(item.id)} alt="" className="size-10 shrink-0 object-contain" />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-semibold text-ink group-hover:text-pine">
                  {item.title}
                  <ArrowRight className="size-4 text-leaf transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </span>
                <span className="mt-1 block text-[0.9375rem] leading-snug text-ink/70">{item.blurb}</span>
              </span>
            </AppLink>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}

/** A live example on another site: opens in a new tab so the visitor keeps this page. */
function LiveLink({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  const external = !href.startsWith("/");
  if (!external) {
    return (
      <AppLink href={href} className={primary ? "btn-secondary" : "link"}>
        {label}
      </AppLink>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener" className={primary ? "btn-secondary" : "link"}>
      {label}
      <ArrowUpRight className="size-4" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** Each stop explains one capability, with its own evidence, in a continuous vertical page. */
export function ProductPager({ slides, page }: { slides: ProductSlide[]; page: string }) {
  const contentSlides = slides.filter((s) => s.label !== "Keep exploring" && !s.links);
  const ids = contentSlides.map((slide) =>
    slide.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  );

  return (
    <div className="bg-paper text-ink">
      <main id="main" className="product-main deck">
        {contentSlides.map((slide, index) => {
          const hasMedia = Boolean(
            slide.frames?.length ||
              slide.src ||
              slide.embed ||
              slide.voices ||
              slide.images ||
              slide.phoneWalkthrough,
          );
          const frame: SlideFrame = {
            ...slide,
            title: slide.frameTitle ?? slide.title,
            caption: "",
            fit: slide.fit ?? "contain",
          };
          const sliderFrames = slide.frames && slide.frames.length > 0 ? slide.frames : [frame];
          const liveAction =
            slide.live ??
            (slide.embed && !slide.presentation
              ? { href: slide.embed, label: "Open live example" }
              : undefined);
          const first = index === 0;
          const Heading = first ? "h1" : "h2";
          return (
            <section
              key={ids[index]}
              id={ids[index]}
              className={cn("product-section page page-center", first && "page-first")}
            >
              <div className="wrap page-body">
              {first && (
                <nav aria-label="Breadcrumb" className="mb-6 text-[0.9375rem] text-ink/65">
                  <AppLink href="/products" className="font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
                    Products
                  </AppLink>
                  <span aria-hidden className="px-2 text-ink/35">/</span>
                  <span aria-current="page">{slide.title}</span>
                </nav>
              )}
              <div className={cn("product-detail-layout", hasMedia && !slide.wide && "product-detail-split")}>
                <div className="min-w-0">
                  {first && slide.icon && <img src={slide.icon} alt="" width={56} height={56} className="mb-5 size-14 object-contain" />}
                  <Heading className={first ? "t-h1" : "t-h2"}>{slide.title}</Heading>
                  {slide.text && <p className={cn("max-w-3xl", first ? "mt-5 t-lede" : "mt-4 t-body text-ink/80")}>{slide.text}</p>}
                  {slide.steps && (
                    <ol className="mt-6 space-y-5">
                      {slide.steps.map((step, n) => (
                        <li key={step.title} className="flex gap-4 t-body">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-pale text-sm font-semibold text-pine" data-numbers>
                            {n + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-ink">{step.title}</p>
                            <p className="mt-1 text-ink/80">{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {first && (
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <AppLink href={site.contactHref} className="btn-primary">
                        {copy.siteHeader.SiteHeader.a1}
                      </AppLink>
                      <AppLink href={DEMO_HREF} className="btn-secondary">
                        {copy.siteHeader.SiteHeader.a2}
                      </AppLink>
                    </div>
                  )}
                  {liveAction && (
                    <p className={first ? "mt-5" : "mt-6"}>
                      <LiveLink href={liveAction.href} label={liveAction.label} />
                    </p>
                  )}
                </div>
                {hasMedia && (
                  <div
                    className={cn(
                      "product-detail-media min-w-0",
                      slide.wide && "product-detail-media-wide",
                      slide.phoneWalkthrough && "product-detail-walkthrough",
                      slide.images && "product-detail-controllers",
                      slide.nativeSize && "product-detail-native",
                      page === "/phone-app" && "phone-product-media",
                    )}
                  >
                    {slide.captionAbove && slide.caption && (
                      <p className="mb-3 t-body font-semibold">{slide.caption}</p>
                    )}
                    {slide.phoneWalkthrough ? (
                      <Walkthrough />
                    ) : page === "/phone-app" && slide.src ? (
                      <img
                        className="phone-product-image"
                        src={slide.src}
                        alt={slide.alt ?? slide.title}
                        width={imageSize(slide.src)?.width}
                        height={imageSize(slide.src)?.height}
                      />
                    ) : page === "/phone-app" && slide.images ? (
                      <div className="phone-controller-examples">
                        {slide.images.map((image) => (
                          <figure key={image.src}>
                            <img src={image.src} alt={image.alt ?? image.label ?? "Controller"} />
                            <p className="mt-3 t-small">{image.label}</p>
                          </figure>
                        ))}
                      </div>
                    ) : (
                      <FrameSlider frames={sliderFrames} heading={slide.title} />
                    )}
                    {!slide.captionAbove && slide.caption && !sliderFrames[0]?.legend && (
                      <p className="mt-3 t-small text-ink/70">{slide.caption}</p>
                    )}
                  </div>
                )}
              </div>
              {slide.features && (
                <ul className="product-detail-features">
                  {slide.features.map((feature) => (
                    <li key={feature.title}>
                      <h3 className="text-lg font-semibold text-pine">{feature.title}</h3>
                      <p className="mt-2 t-body text-ink/78">{feature.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </section>
          );
        })}
        <RelatedProducts page={page} />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
