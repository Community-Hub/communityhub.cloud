import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { copy } from "@/lib/copy";

const VENUES = [
  { name: "Oberlin College", community: "oberlin", display: "149", remote: "custom/oc-carbon-neutral-admissions" },
  { name: "Great Lakes Science Center", community: "glsc", display: "112", remote: "106" },
] as const;

export function PhoneControl({ venueIndex }: { venueIndex: number }) {
  const current = VENUES[venueIndex];
  const [session, setSession] = useState("");
  useEffect(() => setSession(crypto.randomUUID()), []);
  const row = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, narrow: false });
  const [qr, setQr] = useState("");
  const screen = `https://config.communityhub.cloud/digital-signage/web-view/web-session?slideShow=true&communitySubdomain=${current.community}&displayId=${current.display}&webEmbbed=true&webSesssionId=${session}&activePage=1`;
  const phone = `https://${current.community}.communityhub.cloud/digital-signage/remote/${current.remote}?webSesssionId=${session}&standalone`;
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    QRCode.toDataURL(phone, { width: 360, margin: 4, errorCorrectionLevel: "M" }).then(url => {
      if (!cancelled) setQr(url);
    }).catch(() => { if (!cancelled) setQr(""); });
    return () => { cancelled = true; };
  }, [phone, session]);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => setSize({width: el.clientWidth, height: el.clientHeight, narrow: window.innerWidth < 768});
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  // Include the phone's border in the fit calculation; never force a minimum
  // height larger than the space left below the heading and QR code.
  const ratio = 390 / 844;
  const pairH = Math.max(0, Math.min((size.width - 16 - 12 * (1 - ratio)) / (16 / 9 + ratio), size.height));
  const screenW = size.narrow ? size.width : pairH * (16 / 9);
  const screenH = screenW * 9 / 16;
  const phoneW = size.narrow ? Math.min(size.width, 332) : (pairH - 12) * ratio + 12;
  const controllerHeight = size.narrow ? 440 : 844;
  const phoneH = size.narrow ? (phoneW - 12) / 390 * controllerHeight + 12 : pairH;
  const phoneScale = Math.max(0, (phoneW - 12) / 390);

  return (
    <div data-controller-demo className="flex h-auto shrink-0 min-h-0 min-w-0 w-full flex-col gap-3 rounded-xl border border-pine/45 bg-paper p-3 md:h-full md:gap-4 md:p-5">
      <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <img src={copy.digitalSignage.PhoneControl.img_src1} alt="" className="size-10 shrink-0 object-contain" />
            <h2 className="min-w-0 flex-1 t-h2 max-md:text-2xl"><span className="md:hidden">Choose what plays</span><span className="hidden md:inline">{copy.digitalSignage.PhoneControl.h21}</span></h2>
          </div>
          <p className="mt-2 t-small text-ink/70">{current.name}</p>
          <p className="mt-2 max-w-xl t-body">At a digital sign, you can scan its QR code with your phone or use the controller beside it to choose what appears on the screen.</p>
          <p className="mt-2 t-body font-bold text-pine md:mt-3 md:text-2xl">Try it — this demo is live.</p>
          <p className="mt-1 max-w-xl t-body"><span className="md:hidden">Tap a topic below and watch the screen change.</span><span className="hidden md:inline">{copy.digitalSignage.PhoneControl.p1}</span></p>

        </div>
        {qr && <figure className="hidden shrink-0 md:block">
          <a href={phone} target="_blank" rel="noopener noreferrer" aria-label="Open this demo’s phone controller"><img data-controller-qr src={qr} alt="QR code to open the controller for this demo" className="size-32" /></a>
          <figcaption className="mt-1 max-w-32 t-small text-center">Scan to control this screen with your phone.</figcaption>
        </figure>}

      </div>
      <div ref={row} data-controller-pair role="group" aria-label="Phone controller and display" className="flex min-w-0 w-full shrink-0 flex-col items-center gap-4 md:min-h-0 md:flex-1 md:shrink md:flex-row md:items-start">
        <div data-demo-display className="relative shrink-0 overflow-hidden rounded-md bg-paper ring-1 ring-pine/45" style={{width: screenW, height: screenH}}>
          {session && size.width > 0 && <iframe key={screen} title={`${current.name} story display`} src={screen} tabIndex={-1} className="pointer-events-none absolute top-0 left-0 origin-top-left border-0" style={{width: 1280, height: 720, transform: `scale(${screenW / 1280})`}} />}
        </div>
        <div data-demo-controller className="relative shrink-0 overflow-hidden rounded-[1.3rem] border-[6px] border-pine bg-paper" style={{width: phoneW, height: phoneH}}>
          {session && size.width > 0 && <iframe key={phone} title={`${current.name} story controller`} src={phone} className="absolute top-0 left-0 origin-top-left border-0" style={{width: 390, height: controllerHeight, transform: `scale(${phoneScale})`}} />}
        </div>
      </div>
    </div>
  );
}
