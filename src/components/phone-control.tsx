import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import QRCode from "qrcode";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { txt } from "@/lib/page-text/phoneControl";

type ControllerTopic = {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  screenUrl: string;
};

const OC_TOPICS: ControllerTopic[] = [
  {
    id: "heating-cooling",
    get label() { return txt.label1; },
    get subtitle() { return txt.subtitle1; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/SIP-Icon.svg",
    screenUrl: "https://docs.google.com/presentation/d/1Wa8Gp961gxbfIDkMCCQL0MKcQSpjpU74D8lO0HezmiY/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "energy",
    get label() { return txt.label2; },
    get subtitle() { return txt.subtitle2; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/electricity_remoteicon.svg",
    screenUrl: "https://docs.google.com/presentation/d/1Jn6-B1LAZ2vSpSsb_nCglBFeg31Ti-6q1Dz4UIlYwdQ/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "water",
    get label() { return txt.label3; },
    get subtitle() { return txt.subtitle3; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/waterusebutton.svg",
    screenUrl: "https://docs.google.com/presentation/d/17GMrrBh083wuFLHhCZ57PVLhSsNF1-ioQQ4_Lra2lf4/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "climate",
    get label() { return txt.label4; },
    get subtitle() { return txt.subtitle4; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/climate_plan_remoteicon.svg",
    screenUrl: "https://docs.google.com/presentation/d/1EvWrV8J_49NQ1ZSZsgA_xg9r9j9vTcvUAC0w_rTDBB4/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "transportation",
    get label() { return txt.label5; },
    get subtitle() { return txt.subtitle5; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/Transport-Icon.svg",
    screenUrl: "https://docs.google.com/presentation/d/1GSdWGNliCmlP7K7UKfBiEs0TcN2ixOplSytrhxj1U7I/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "food",
    get label() { return txt.label6; },
    get subtitle() { return txt.subtitle6; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/Food.svg",
    screenUrl: "https://docs.google.com/presentation/d/16P_x_4QszkF200nllv900KJcMmwyJLUtFAnk82R4tvM/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "land",
    get label() { return txt.label7; },
    get subtitle() { return txt.subtitle7; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/Land-Use-Icon.svg",
    screenUrl: "https://docs.google.com/presentation/d/1alHAGJhaGTvqLMNyLyhFJMOfxmlnZFZcqeCnZXnG_U0/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "material",
    get label() { return txt.label8; },
    get subtitle() { return txt.subtitle8; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/Material.svg",
    screenUrl: "https://docs.google.com/presentation/d/1LeVRaKUcRSUjsBikgMz4swGd74Z1u7XxSqPg4uMpoR4/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "ajlc",
    get label() { return txt.label9; },
    get subtitle() { return txt.subtitle9; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/ajlc_remotebuttons.svg",
    screenUrl: "https://docs.google.com/presentation/d/1borjqV9S4kuqM8eTH1SAYKGk6IghqkHiKxZkYCWpDaw/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "citywide",
    get label() { return txt.label10; },
    get subtitle() { return txt.subtitle10; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/CWD_remoteicon_multicolor.svg",
    screenUrl: "https://oberlin.communityhub.cloud/citywide-dashboard/index?embed=1&show-menu=0",
  },
  {
    id: "live-data",
    get label() { return txt.label11; },
    get subtitle() { return txt.subtitle11; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/live_data_button_alt.svg",
    screenUrl: "https://oberlin.communityhub.cloud/dh-public/oc/dashboard/815",
  },
  {
    id: "voices",
    get label() { return txt.label12; },
    get subtitle() { return txt.subtitle12; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/CV_remoteicon.svg",
    screenUrl: "https://oberlin.communityhub.cloud/cv-public/embeddable?fullscreen=true&category=41,42,43,44,45,46,66,68",
  },
  {
    id: "ecolympics",
    get label() { return txt.label13; },
    get subtitle() { return txt.subtitle13; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/ecolympics_icon.png",
    screenUrl: "https://oberlin.communityhub.cloud/data-hub/embed/ecolympic-tab-contents/2026",
  },
];

const GLSC_TOPICS: ControllerTopic[] = [
  {
    id: "our-lake",
    get label() { return txt.label14; },
    get subtitle() { return txt.subtitle14; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/MT_OurLake_Button.svg",
    screenUrl: "https://docs.google.com/presentation/d/1Az60BMTNbkAAKCN6XwqaT1jmivvAqzH7bNprnOLQv94/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "climate",
    get label() { return txt.label15; },
    get subtitle() { return txt.subtitle15; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/MT_Climate_Button.svg",
    screenUrl: "https://docs.google.com/presentation/d/1VdppDivGwcZ_4hn66WPBYkVR7Ue9_ESm8RRzBYAt--0/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "energy-use",
    get label() { return txt.label16; },
    get subtitle() { return txt.subtitle16; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/electricity_remoteicon.svg",
    screenUrl: "https://docs.google.com/presentation/d/18uxEKlfFY0cv24FjYx5FyDwjkCdXdE3v7cZRtWDrxLQ/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "renewable-energy",
    get label() { return txt.label17; },
    get subtitle() { return txt.subtitle17; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/MT_RenewableEnergy_Button.svg",
    screenUrl: "https://docs.google.com/presentation/d/1RQKlaL77bgSB9biv_0dITPsSLHl2TW6JRSiAS6iLpbs/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "water-use",
    get label() { return txt.label18; },
    get subtitle() { return txt.subtitle18; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/waterusebutton.svg",
    screenUrl: "https://docs.google.com/presentation/d/1OAxn8O0UhXAqz3ffnutoKWovK-Tb_YkfjTN3FpJk4Jw/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "air-quality",
    get label() { return txt.label19; },
    get subtitle() { return txt.subtitle19; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/MT_AirQuality_Button.svg",
    screenUrl: "https://docs.google.com/presentation/d/16A6R8VB2l579Xy9ua_lpzeCwXDXUx5j_VAOvLowcahU/embed?start=true&loop=true&delayms=7000&rm=minimal#slide=1",
  },
  {
    id: "live-data",
    get label() { return txt.label20; },
    get subtitle() { return txt.subtitle20; },
    icon: "https://communityhubstorage.cloud/ch-digital-signage/cleveland/digital-signage/live_data_button.svg",
    screenUrl: "https://cleveland.communityhub.cloud/citywide-dashboard/index?embed=1&show-menu=0",
  },
];

const VENUES = [
  {
    get name() { return txt.name1; },
    get headerTitle() { return txt.headerTitle1; },
    headerBg: "#b91c1c",
    headerLogo: "https://communityhubstorage.cloud/ch-digital-signage/oberlin/digital-signage/carbon_neutral_logo.png",
    community: "oberlin",
    display: "149",
    remote: "custom/oc-carbon-neutral-admissions",
    topics: OC_TOPICS,
  },
  {
    get name() { return txt.name2; },
    get headerTitle() { return txt.headerTitle2; },
    headerBg: "#283583",
    headerLogo: "https://communityhubstorage.cloud/ch-digital-signage/glsc/digital-signage/glsc-logo.png",
    community: "glsc",
    display: "112",
    remote: "106",
    topics: GLSC_TOPICS,
  },
] as const;

export function PhoneControl({ venueIndex }: { venueIndex: number }) {
  const [activeVenueIndex, setActiveVenueIndex] = useState(venueIndex);
  const current = VENUES[activeVenueIndex] ?? VENUES[0];
  const [session, setSession] = useState("");
  useEffect(() => setSession(crypto.randomUUID()), []);
  const row = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, narrow: false, viewH: 0 });
  const [qr, setQr] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [switchCount, setSwitchCount] = useState(0);
  const [playing, setPlaying] = useState(true);

  const handleSelectVenue = (idx: number) => {
    setActiveVenueIndex(idx);
    setSelectedIndex(0);
    setSwitchCount((c) => c + 1);
    setPlaying(true);
  };

  const activeTopic = current.topics[selectedIndex] ?? current.topics[0];
  const activeScreenUrl = (() => {
    if (!playing && activeTopic.screenUrl.includes("docs.google.com/presentation")) {
      return activeTopic.screenUrl.replace("start=true", "start=false");
    }
    return activeTopic.screenUrl;
  })();

  const screen = `https://config.communityhub.cloud/digital-signage/web-view/web-session?slideShow=true&communitySubdomain=${current.community}&displayId=${current.display}&webEmbbed=true&webSesssionId=${session}&activePage=1`;
  const phone = `https://${current.community}.communityhub.cloud/digital-signage/remote/${current.remote}?webSesssionId=${session}&standalone`;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    QRCode.toDataURL(phone, { width: 360, margin: 4, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        if (!cancelled) setQr("");
      });
    return () => {
      cancelled = true;
    };
  }, [phone, session]);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () =>
      setSize({
        width: el.clientWidth,
        narrow: el.clientWidth < 740,
        viewH: window.innerHeight,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Size display + phone controller to use the full available container width
  // so both the 16:9 screen (including its 28px bottom control bar: 1280x748)
  // and the phone topic list share identical height on desktop and stack cleanly on mobile/tablet.
  const screenAspect = 1280 / 748;
  const phoneAspect = 320 / 540;
  const gap = 20;
  // The pair also gives way to the screen's height, so the whole demo fits one screen of the page
  // (about 25rem goes to the header, the heading, the venue row and the card's padding).
  const heightCap = size.viewH ? size.viewH - 450 : 540;
  const desktopPairH = Math.max(
    300,
    Math.min(540, heightCap, Math.round((size.width - gap) / (screenAspect + phoneAspect))),
  );
  const screenW = size.narrow ? size.width : Math.round(desktopPairH * screenAspect);
  const screenH = Math.round(screenW / screenAspect);
  const phoneW = size.narrow ? Math.min(size.width, 380) : Math.max(250, size.width - screenW - gap);
  const phoneH = size.narrow ? 460 : desktopPairH;

  const handleSelectTopic = (idx: number) => {
    setSelectedIndex(idx);
    setSwitchCount((c) => c + 1);
    setPlaying(true);
  };

  const handlePrevTopic = () => {
    setSelectedIndex((i) => (i - 1 + current.topics.length) % current.topics.length);
    setSwitchCount((c) => c + 1);
  };

  const handleNextTopic = () => {
    setSelectedIndex((i) => (i + 1) % current.topics.length);
    setSwitchCount((c) => c + 1);
  };

  return (
    <div
      data-controller-demo
      className="flex h-auto w-full min-w-0 flex-col gap-5 rounded-xl border border-pine/30 bg-paper p-4 shadow-sm md:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <img
              src={copy.digitalSignage.PhoneControl.img_src1}
              alt=""
              className="size-10 shrink-0 object-contain"
            />
            <h2 className="min-w-0 flex-1 t-h2 max-md:text-2xl">
              <span className="md:hidden">{txt.span1}</span>
              <span className="hidden md:inline">{copy.digitalSignage.PhoneControl.h21}</span>
            </h2>
          </div>
          <p className="mt-2 max-w-2xl t-body text-ink/85">
            {txt.p1}{" "}
            <strong className="font-bold text-pine">{txt.strong1}</strong>
          </p>
        </div>
        {qr && (
          <figure className="hidden shrink-0 items-center gap-3 rounded-lg border border-pine/20 bg-field/60 p-2.5 md:flex">
            <a
              href={phone}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open this demo’s phone controller"
              className="shrink-0"
            >
              <img
                data-controller-qr
                src={qr}
                alt="QR code to open the controller for this demo"
                className="size-24 rounded bg-paper"
              />
            </a>
            <figcaption className="max-w-36 t-small leading-snug text-ink/80">
              <strong className="block font-bold text-pine">{current.name}</strong>
              {txt.figcaption1}</figcaption>
          </figure>
        )}
      </div>

      {/* Venue switcher + Active topic title above the display */}
      <div className="flex flex-col gap-3 border-b border-pine/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="t-body font-bold text-ink">
            {current.name} – {activeTopic.label}
          </p>
          <p className="t-small text-ink/70">{activeTopic.subtitle}</p>
        </div>
        <div
          role="group"
          aria-label="Choose a digital sign location"
          className="flex flex-wrap items-center gap-1.5"
        >
          {VENUES.map((venue, idx) => {
            const active = idx === activeVenueIndex;
            return (
              <button
                key={venue.name}
                type="button"
                aria-pressed={active}
                onClick={() => handleSelectVenue(idx)}
                className={cn(
                  "min-h-9 rounded-full border px-3.5 py-1 text-xs font-bold transition-colors",
                  active
                    ? "border-pine bg-pine text-paper"
                    : "border-pine/30 bg-field/60 text-pine hover:border-pine/60",
                )}
              >
                {venue.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={row}
        data-controller-pair
        role="group"
        aria-label="Phone controller and display"
        className={cn(
          "flex w-full min-w-0 items-center gap-5",
          size.narrow ? "flex-col" : "flex-row items-start justify-between",
        )}
      >
        {/* 16:9 Big Screen Display */}
        <div
          data-demo-display
          className="relative shrink-0 overflow-hidden rounded-lg bg-ink ring-2 ring-pine/50 shadow-md"
          style={{ width: screenW || "100%", height: screenH || 420 }}
        >
          {size.width > 0 && (
            <iframe
              key={`${activeTopic.id}-${switchCount}-${playing}`}
              title={`${current.name} – ${activeTopic.label} display`}
              src={activeScreenUrl}
              className="absolute inset-0 border-0 bg-paper"
              style={{
                width: 1280,
                height: 748,
                transform: `scale(${screenW / 1280})`,
                transformOrigin: "top left",
              }}
              allowFullScreen
            />
          )}
          {/* Keep the web-session iframe mounted hidden so physical QR phone sync still has a session peer */}
          {session && (
            <iframe
              key={screen}
              title={`${current.name} story display session`}
              src={screen}
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none invisible absolute inset-0 size-0 border-0 opacity-0"
            />
          )}
        </div>

        {/* Interactive Phone Controller (instant switching, zero countdown delay) */}
        <div
          data-demo-controller
          className="relative flex shrink-0 flex-col overflow-hidden rounded-[1.5rem] border-[6px] border-pine bg-[#2b2b2b] text-white shadow-lg"
          style={{ width: phoneW || 300, height: phoneH || 500 }}
        >
          {/* Phone Header */}
          <div
            className="flex shrink-0 items-center justify-between px-3.5 py-2.5 shadow-sm"
            style={{ backgroundColor: current.headerBg }}
          >
            <span className="font-display text-xs font-bold tracking-wider uppercase leading-tight text-white">
              {current.headerTitle}
            </span>
            <img
              src={current.headerLogo}
              alt={current.name}
              className="size-9 shrink-0 rounded-full bg-white p-0.5 object-contain"
            />
          </div>

          {/* Scrollable Topic List */}
          <div
            data-controller-topics
            className="flex-1 divide-y divide-white/10 overflow-y-auto bg-[#2b2b2b]"
          >
            {current.topics.map((topic, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(idx)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100 hover:bg-white/10 focus-visible:outline-lime",
                    isSelected && "bg-white/15 ring-1 ring-inset ring-lime/60",
                  )}
                >
                  <img
                    src={topic.icon}
                    alt=""
                    className="size-8 shrink-0 rounded-full object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">
                      {topic.label}
                    </span>
                    {isSelected && (
                      <span className="block truncate text-xs text-lime">
                        {txt.span2}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full bg-black/35 text-white/80 transition-transform",
                      isSelected && "bg-lime text-pine rotate-180",
                    )}
                  >
                    <ChevronDown className="size-3.5" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Transport Controls */}
          <div className="flex shrink-0 items-center justify-around border-t border-white/15 bg-[#222222] px-4 py-2.5">
            <button
              type="button"
              onClick={handlePrevTopic}
              aria-label="Previous topic"
              className="grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-white/20"
            >
              <SkipBack className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause presentation" : "Play presentation"}
              className="grid size-10 place-items-center rounded-full bg-black/50 text-white hover:bg-white/20"
            >
              {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <button
              type="button"
              onClick={handleNextTopic}
              aria-label="Next topic"
              className="grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-white/20"
            >
              <SkipForward className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
