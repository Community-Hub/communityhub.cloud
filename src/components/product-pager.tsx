import { AppLink } from "@/components/app-link";
import { FrameSlider } from "@/components/product-section";
import { Chapter, Storyboard } from "@/components/storyboard";
import { CHAPTERS, educateBeats, empowerBeats, engageBeats, type SlideFrame } from "@/lib/content";
import { PRICING_HREF } from "@/lib/links";
import { site } from "@/lib/site";
import { PhoneWalkthrough } from "@/components/phone-walkthrough";
import { PlayPauseButton, useAutoplay } from "@/components/play-pause";
import { cn } from "@/lib/utils";

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

/** Each stop explains one capability, with its own evidence, rather than hiding copy in a gallery. */
export function ProductPager({ slides, page }: { slides: ProductSlide[]; page: string }) {
  const home = homeStopFor(page);
  const labels = slides.map(slide => slide.label);
  const ids = labels.map(label => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  return <Storyboard labels={labels} ids={ids}>
    {slides.map((slide, index) => {
      const hasMedia = Boolean(slide.src || slide.embed || slide.voices || slide.images || slide.phoneWalkthrough);
      const frame: SlideFrame = { ...slide, title: slide.frameTitle ?? slide.title, caption: "", fit: slide.fit ?? "contain" };
      const Heading = index === 0 ? "h1" : "h2";
      return <Chapter key={ids[index]} label={slide.label} className="bg-field text-ink">
        <div id={ids[index]} data-allow-scroll className="product-detail-scroll">
          <div className="product-detail-inner">
            {index === 0 && <p className="t-small text-ink/70"><AppLink href="/products" className="inline-flex min-h-8 items-center text-pine underline underline-offset-4">Products and Services</AppLink><span aria-hidden> / </span>{slide.title}</p>}
            <div className={cn("product-detail-layout", hasMedia && !slide.wide && "product-detail-split")}>
              <div className="min-w-0">
                <Heading className="t-h2">{slide.title}</Heading>
                {slide.text && <p className="mt-4 max-w-3xl t-body">{slide.text}</p>}
                {slide.steps && <ol className="mt-5 space-y-4">
                  {slide.steps.map((step, n) => <li key={step.title} className="flex gap-3 t-body"><span className="font-bold text-pine">{n + 1}.</span><div><b>{step.title}</b><p className="mt-1">{step.body}</p></div></li>)}
                </ol>}
                {(index === 0 || slide.live) && <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                  {slide.live && <AppLink href={slide.live.href} className="link">{slide.live.label}</AppLink>}
                  {index === 0 && <AppLink href={site.contactHref} className="link">Contact us</AppLink>}
                </p>}
              </div>
              {hasMedia && <div className={cn("product-detail-media min-w-0", slide.wide && "product-detail-media-wide", slide.phoneWalkthrough && "product-detail-walkthrough", slide.images && "product-detail-controllers", slide.nativeSize && "product-detail-native", page === "/phone-app" && "phone-product-media")}>
                {slide.captionAbove && slide.caption && <p className="mb-3 t-body font-bold">{slide.caption}</p>}
                {slide.phoneWalkthrough ? <Walkthrough /> : page === "/phone-app" && slide.src ? (
                  <img className="phone-product-image" src={slide.src} alt={slide.alt ?? slide.title} />
                ) : page === "/phone-app" && slide.images ? (
                  <div className="phone-controller-examples">{slide.images.map(image => <figure key={image.src}>
                    <img src={image.src} alt={image.alt ?? image.label ?? "Controller"} />
                    <p className="mt-3 t-small">{image.label}</p>
                  </figure>)}</div>
                ) : <FrameSlider frames={[frame]} heading={slide.title} />}
                {!slide.captionAbove && slide.caption && <p className="mt-2 t-small text-ink/70">{slide.caption}</p>}
                {slide.embed && !slide.presentation && !slide.live && <AppLink href={slide.embed} className="link t-small">Open live example</AppLink>}
              </div>}
            </div>
            {slide.features && <ul className="product-detail-features">
              {slide.features.map(feature => <li key={feature.title}><h3 className="t-body font-bold text-pine">{feature.title}</h3><p className="mt-1 t-small">{feature.body}</p></li>)}
            </ul>}
            {slide.links && <>
              <p className="mt-3 max-w-2xl t-body">Bring these tools together for your community.</p>
              <ul className="mt-6 grid gap-5 md:grid-cols-3">
                {slide.links.map(link => <li key={link.href} className="border-t border-pine/30 pt-3"><AppLink href={link.href} className="link t-body">{link.label}</AppLink><p className="mt-1 t-body text-ink/80">{link.note}</p></li>)}
              </ul>
              <div className="mt-8 border-t border-pine/30 pt-5"><h3 className="t-h3">Let’s talk about your community</h3><p className="mt-2 max-w-2xl t-body">Tell us who you want to reach and what you want to share.</p><p className="mt-3 flex flex-wrap gap-x-6"><AppLink href={site.contactHref} className="link">Contact us</AppLink><AppLink href={PRICING_HREF} className="link">Bundles and services</AppLink>{home && <AppLink href={home.href} className="link">{home.label}</AppLink>}</p></div>
            </>}
          </div>
        </div>
      </Chapter>;
    })}
  </Storyboard>;
}
