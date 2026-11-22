import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { legal } from "@/lib/legal";
import { txt } from "@/lib/page-text/termsOfService";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfService,
  head: () => ({
    meta: [
      { title: txt.title1 },
      {
        name: "description",
        content:
          txt.content1,
      },
      { property: "og:title", content: txt.content2 },
      {
        property: "og:description",
        content:
          txt.content3,
      },
    ],
    links: [{ rel: "canonical", href: `${legal.origin}/terms-of-service` }],
  }),
});

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    get title() { return txt.title2; },
    body: (
      <>
        <p>
          {txt.p1}</p>
        <p>
          {txt.p2}</p>
      </>
    ),
  },
  {
    id: "the-service",
    get title() { return txt.title3; },
    body: (
      <>
        <p>
          {txt.p3}</p>
        <p>
          {txt.p4}</p>
      </>
    ),
  },
  {
    id: "accounts",
    get title() { return txt.title4; },
    body: (
      <>
        <ul>
          <li>{txt.li1}</li>
          <li>
            {txt.li2}</li>
          <li>
            {txt.li3}</li>
          <li>{txt.li4}</li>
          <li>{txt.li5}</li>
        </ul>
      </>
    ),
  },
  {
    id: "google-integration",
    get title() { return txt.title5; },
    body: (
      <>
        <p>
          {txt.p5}{" "}
          <a href="/privacy-policy">{txt.a1}</a>{txt.p6}</p>
        <p>
          {txt.p7}{" "}
          <a href={legal.googlePermissionsUrl} rel="noopener">
            {txt.a2}</a>
          {txt.p8}</p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    get title() { return txt.title6; },
    body: (
      <>
        <p>{txt.p9}</p>
        <ul>
          <li>{txt.li6}</li>
          <li>{txt.li7}</li>
          <li>{txt.li8}</li>
          <li>{txt.li9}</li>
          <li>{txt.li10}</li>
          <li>{txt.li11}</li>
          <li>{txt.li12}</li>
          <li>{txt.li13}</li>
        </ul>
        <p>
          {txt.p10}</p>
      </>
    ),
  },
  {
    id: "your-content",
    get title() { return txt.title7; },
    body: (
      <>
        <p>
          <strong>{txt.strong1}</strong> {" "}{txt.p11}</p>
        <p>
          {txt.p12}</p>
        <p>
          {txt.p13}</p>
      </>
    ),
  },
  {
    id: "fees",
    get title() { return txt.title8; },
    body: (
      <>
        <p>
          {txt.p14}</p>
        <p>
          {txt.p15}</p>
      </>
    ),
  },
  {
    id: "termination",
    get title() { return txt.title9; },
    body: (
      <>
        <p>
          {txt.p16}</p>
        <p>
          {txt.p17}</p>
      </>
    ),
  },
  {
    id: "disclaimers",
    get title() { return txt.title10; },
    body: (
      <>
        <p>
          {txt.p18}</p>
        <p>
          {txt.p19}</p>
        <p>
          {txt.p20}</p>
      </>
    ),
  },
  {
    id: "liability",
    get title() { return txt.title11; },
    body: (
      <>
        <p>
          {txt.p21}</p>
        <p>
          {txt.p22}</p>
        <p>
          {txt.p23}</p>
      </>
    ),
  },
  {
    id: "indemnity",
    get title() { return txt.title12; },
    body: (
      <>
        <p>
          {txt.p24}</p>
      </>
    ),
  },
  {
    id: "governing-law",
    get title() { return txt.title13; },
    body: (
      <>
        <p>
          {txt.p25}</p>
      </>
    ),
  },
  {
    id: "changes",
    get title() { return txt.title14; },
    body: (
      <>
        <p>
          {txt.p26}</p>
      </>
    ),
  },
];

function TermsOfService() {
  return (
    <LegalPage
      title={txt.title15}
      description={txt.description1}
      intro={txt.intro1}
      sections={SECTIONS}
    />
  );
}
