import { copy } from "@/lib/copy";
import { homeStopFor } from "@/components/product-pager";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Chapter, Storyboard } from "@/components/storyboard";
import { AppLink } from "@/components/app-link";
import { PhoneControl } from "@/components/phone-control";
import { engageBeats } from "@/lib/content";
import { site } from "@/lib/site";

export const Route = createFileRoute("/phone-app")({
  component: PhoneApp,
  head: () => ({ meta: [{ title: "Phone App — Community Hub" }] }),
});
const labels = ["Phone App", "Control a sign", "Community on your phone", "Keep exploring"];
const ids = ["phone-app", "control-a-sign", "community-on-your-phone", "keep-exploring"];
function Section({index, children}: {index: number; children: ReactNode}) {
  return <Chapter label={labels[index]} className="bg-field text-ink"><div id={ids[index]} data-allow-scroll className="phone-page-scroll"><div className="phone-page-inner">{children}</div></div></Chapter>;
}
function LivePhoneApp({ visit }: { visit: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="phone-live-app">{width > 0 && <iframe key={visit} title="Oberlin Hub live phone app" src="https://environmentaldashboard.org/nav/" style={{width:750,height:1334,transform:`scale(${width / 750})`}} />}</div>;
}
function PhoneApp() {
  const home = homeStopFor("/phone-app")!;
  const [visit, setVisit] = useState(0);
  return <Storyboard labels={labels} ids={ids}>
    <Section index={0}>
      <p className="mb-4 t-small"><AppLink href="/products" className="link">Products and Services</AppLink> / Phone App</p>
      <div className="phone-page-split">
        <div><h1 className="t-h2">Phone App</h1><p className="mt-5 t-body">{engageBeats.find(b => b.id === "phone")?.body}</p><p className="mt-5"><AppLink href={site.contactHref} className="link">Contact us</AppLink></p></div>
        <figure><figcaption className="mb-3 t-body font-bold">Oberlin — Oberlin College Carbon Neutral Stories</figcaption><img className="phone-intro-photo" src="/assets/phone-workflow/science-center-touchpad.jpg" alt="Visitors beside the Carbon Neutral Stories exhibit and touchpad at Oberlin College" /></figure>
      </div>
      <div className="phone-capabilities">
        <div><h2 className="t-h3">Control a sign</h2><p className="mt-2 t-body">Your phone can choose the content on a nearby display.</p></div>
        <div><h2 className="t-h3">Open a story</h2><p className="mt-2 t-body">A story’s QR code brings its content directly to your phone.</p></div>
        <div><h2 className="t-h3">Browse content</h2><p className="mt-2 t-body">Events, community messages, and dashboards are available on your own screen.</p></div>
      </div>
    </Section>
    <Section index={1}>
      <PhoneControl venueIndex={1} />
    </Section>
    <Section index={2}>
      <div className="phone-page-split phone-browse-layout">
        <div className="phone-browse-copy"><h2 className="t-h2">Your community, on your phone</h2><p className="mt-5 t-body">The phone app also brings community content to your own screen. You can find local events, view Community Voices, and explore resource-use information wherever you are.</p><p className="mt-4 t-body">Each community can customize its app to reflect its communication goals and the content it shares.</p>
          <p className="mt-5 t-body font-bold">Oberlin — Live phone app</p>
          <div className="phone-mascot-cue"><img src="/assets/squirrel-cue-still.png" alt="" /><p className="t-h3">This app works.<br />Try it out. <span aria-hidden="true">→</span></p></div>
          <button type="button" className="link mt-4" onClick={() => setVisit(v => v + 1)}>Back to app home</button>
        </div>
        <div className="phone-hub-example"><LivePhoneApp visit={visit} /></div>
      </div>
    </Section>
    <Section index={3}>
          <div className="min-w-0">
            <h2 className="t-h2">{copy.digitalSignage.DigitalSignage.h27}</h2>
            <ul className="mt-3 space-y-3 t-body md:mt-6 md:space-y-6">
              <li>
                <a className="font-bold text-pine underline" href={copy.digitalSignage.DigitalSignage.a_href1}>{copy.digitalSignage.DigitalSignage.a1}</a>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p11}</p>
              </li>
              <li>
                <AppLink href={home.href} className="font-bold text-pine underline">
                  {home.label}
                </AppLink>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p12}</p>
              </li>
              <li>
                <Link to="/who" className="font-bold text-pine underline">{copy.digitalSignage.DigitalSignage.Link1}</Link>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p13}</p>
              </li>
              <li>
                <Link to="/pricing" className="font-bold text-pine underline">{copy.digitalSignage.DigitalSignage.Link2}</Link>
                <p className="t-body text-ink/70">{copy.digitalSignage.DigitalSignage.p14}</p>
              </li>
            </ul>
          </div>

    </Section>
  </Storyboard>;
}
