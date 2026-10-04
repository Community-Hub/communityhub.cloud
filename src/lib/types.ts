export interface Product {
  slug: string; name: string; group: string; icon: string;
  short: string; desc: string; chips: readonly string[];
}
export interface Audience {
  slug: string; name: string; group: string; icon: string; short: string;
}
export interface CaseStudy {
  slug: string; name: string; kind: string; img: string; fact: string;
}
export interface Testimonial {
  img: string; alt: string; pos: string; c: string; ink: string;
  quote: string; who: string; role: string; link: string;
  link_label: string; link_icon: string;
}
export type Pair = readonly [string, string];
export type Triple = readonly [string, string, string];
export type LinkPreview = readonly [string, string, string, string];
export type VoiceSlide = readonly [string, string, string, string, string, string, string];
export type Breadcrumb = readonly [string | null, string];
export interface DataView {
  key: string; tab: string; title: string; live: string; note: string;
  src?: string; shot?: string;
}
export interface PageOptions {
  current?: string; jsonld?: Record<string, unknown> | null;
  full_title?: string; dark_hdr?: boolean;
}
export interface PageDefinition {
  slug: string; title: string; description: string; body: string; contents?: string;
  current: string; fullTitle: string; canonical: string;
  jsonld?: Record<string, unknown> | null; pager: boolean;
}
export interface RedirectDefinition { slug: string; to: string; title: string }
