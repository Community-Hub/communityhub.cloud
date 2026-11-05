import { AppLink } from "@/components/app-link";
import { FrameSlider } from "@/components/product-section";
import { SiteFooter } from "@/components/site-footer";
import { CHAPTERS, educateBeats, empowerBeats, engageBeats, type SlideFrame } from "@/lib/content";
import { PhoneWalkthrough } from "@/components/phone-walkthrough";
import { PlayPauseButton, useAutoplay } from "@/components/play-pause";
import { cn } from "@/lib/utils";
import { imageSize } from "@/lib/image-dimensions";

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
  embed?: string;
  nativeSize?: boolean;
  presentation?: boolean;
  voices?: boolean;
  images?: SlideFrame["images"];
  phoneWalkthrough?: boolean;
  wide?: boolean;
  live?: { href: string; label: string };
  features?: { title: string; body: string }[];
  steps?: { title: string; body: string }[];
  links?: { href: string; label: string; note: string }[];
};

const HOME_CHAPTERS = [
  { id: "engage", name: CHAPTERS[2], beats: engageBeats },
  { id: "educate", name: CHAPTERS[3], beats: educateBeats },
  { id: "motivate", name: CHAPTERS[4], beats: empowerBeats },
] as const;

export function homeStopFor(page: string) {
  for (const chapter of HOME_CHAPTERS) {
    const beat = chapter.beats.find((b) => b.href.split("#")[0] === page);
    if (beat) return { href: `/#${chapter.id}/${beat.id}`, label: `Home: ${chapter.name}` };
  }
  return undefined;
}

function Walkthrough() {
  const [playing, setPlaying] = useAutoplay();
  return <div className="relative" data-box-frame>
    <PhoneWalkthrough running={playing} />
    <div className="absolute bottom-2 right-2"><PlayPauseButton playing={playing} onToggle={() => setPlaying(p => !p)} labels={{pause: "Pause animation", play: "Play animation"}} /></div>
  </div>;
}

/** Each stop explains one capability, with its own evidence, in a continuous vertical page. */
export function ProductPager({ slides, page }: { slides: ProductSlide[]; page: string }) {
  const contentSlides = slides.filter((s) => s.label !== "Keep exploring" && !s.links);
  const ids = contentSlides.map((slide) =>
    slide.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  );

  return (
    <div className="min-h-dvh bg-field text-ink pt-16">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-8 md:px-8 md:py-12">
        {contentSlides.map((slide, index) => {
          const hasMedia = Boolean(
            slide.src || slide.embed || slide.voices || slide.images || slide.phoneWalkthrough,
          );
          const frame: SlideFrame = {
            ...slide,
            title: slide.frameTitle ?? slide.title,
            caption: "",
            fit: slide.fit ?? "contain",
          };
          const Heading = index === 0 ? "h1" : "h2";
          return (
            <section
              key={ids[index]}
              id={ids[index]}
              className={cn(
                "scroll-mt-20",
                index > 0 && "border-t border-pine/20 pt-12",
              )}
            >
              {index === 0 && (
                <p className="mb-4 t-small text-ink/70">
                  <AppLink
                    href="/products"
                    className="inline-flex min-h-8 items-center text-pine underline underline-offset-4"
                  >
                    Products and Services
                  </AppLink>
                  <span aria-hidden> / </span>
                  {slide.title}
                </p>
              )}
              <div
                className={cn(
                  "product-detail-layout",
                  hasMedia && !slide.wide && "product-detail-split",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {index === 0 && slide.icon && (
                      <img src={slide.icon} alt="" className="size-11 shrink-0 object-contain" />
                    )}
                    <Heading className="t-h2">{slide.title}</Heading>
                  </div>
                  {slide.text && <p className="mt-4 max-w-3xl t-body">{slide.text}</p>}
                  {slide.steps && (
                    <ol className="mt-5 space-y-4">
                      {slide.steps.map((step, n) => (
                        <li key={step.title} className="flex gap-3 t-body">
                          <span className="font-bold text-pine">{n + 1}.</span>
                          <div>
                            <b>{step.title}</b>
                            <p className="mt-1">{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {slide.live && (
                    <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                      <AppLink href={slide.live.href} className="link">
                        {slide.live.label}
                      </AppLink>
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
                      <p className="mb-3 t-body font-bold">{slide.caption}</p>
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
                      <FrameSlider frames={[frame]} heading={slide.title} />
                    )}
                    {!slide.captionAbove && slide.caption && (
                      <p className="mt-2 t-small text-ink/70">{slide.caption}</p>
                    )}
                    {slide.embed && !slide.presentation && !slide.live && (
                      <AppLink href={slide.embed} className="link t-small">
                        Open live example
                      </AppLink>
                    )}
                  </div>
                )}
              </div>
              {slide.features && (
                <ul className="product-detail-features">
                  {slide.features.map((feature) => (
                    <li key={feature.title}>
                      <h3 className="t-body font-bold text-pine">{feature.title}</h3>
                      <p className="mt-1 t-small">{feature.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
