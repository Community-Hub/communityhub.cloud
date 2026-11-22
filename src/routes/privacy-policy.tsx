import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { legal } from "@/lib/legal";
import { txt } from "@/lib/page-text/privacyPolicy";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicy,
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
    links: [{ rel: "canonical", href: `${legal.origin}/privacy-policy` }],
  }),
});

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    get title() { return txt.title2; },
    body: (
      <>
        <p>
          {txt.p1}</p>
        <p>
          <strong>{txt.strong1}</strong>
          <br />
          {legal.address}
          <br />
          {txt.p2}{" "}<a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
        </p>
        <p>
          {txt.p3}</p>
      </>
    ),
  },
  {
    id: "scope",
    get title() { return txt.title3; },
    body: (
      <>
        <p>
          {txt.p4}{" "}<a href={legal.origin}>{txt.a1}</a> {" "}{txt.p5}{" "}<code>{txt.code1}</code> {" "}{txt.p6}</p>
        <p>
          {txt.p7}</p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    get title() { return txt.title4; },
    body: (
      <>
        <h3>{txt.h31}</h3>
        <p>
          {txt.p8}</p>

        <h3>{txt.h32}</h3>
        <p>
          {txt.p9}</p>

        <h3>{txt.h33}</h3>
        <p>
          {txt.p10}{" "}
          <a href="#google-user-data">{txt.a2}</a>.
        </p>

        <h3>{txt.h34}</h3>
        <p>
          {txt.p11}</p>

        <h3>{txt.h35}</h3>
        <p>
          {txt.p12}{" "}<a href="#cookies">{txt.a3}</a>.
        </p>

        <h3>{txt.h36}</h3>
        <p>
          {txt.p13}</p>
      </>
    ),
  },
  {
    id: "google-user-data",
    get title() { return txt.title5; },
    body: (
      <>
        <p>
          {txt.p14}</p>

        <h3>{txt.h37}</h3>
        <ul>
          <li>
            <strong>{txt.strong2}</strong> {" "}{txt.li1}</li>
          <li>
            <strong>{txt.strong3}</strong> {" "}{txt.li2}</li>
          <li>
            <strong>{txt.strong4}</strong> {" "}{txt.li3}</li>
        </ul>
        <p>
          {txt.p15}{" "}
          <code>{txt.code2}</code>{txt.p16}{" "}<strong>{txt.strong5}</strong>
        </p>

        <h3>{txt.h38}</h3>
        <p>
          {txt.p17}</p>

        <div className="legal-callout">
          <p>
            <strong>{txt.strong6}</strong> “{legal.limitedUse}”
          </p>
        </div>

        <p>
          {txt.p18}{" "}<a href="#sharing">{txt.a4}</a>{txt.p19}</p>

        <p>
          {txt.p20}{" "}
          <a href="#disconnect-google">{txt.a5}</a>.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    get title() { return txt.title6; },
    body: (
      <>
        <p>{txt.p21}</p>
        <ul>
          <li>{txt.li4}</li>
          <li>{txt.li5}</li>
          <li>{txt.li6}</li>
          <li>{txt.li7}</li>
          <li>{txt.li8}</li>
          <li>{txt.li9}</li>
          <li>{txt.li10}</li>
        </ul>
        <p>
          {txt.p22}</p>

        <h3>{txt.h39}</h3>
        <p>
          {txt.p23}</p>
      </>
    ),
  },
  {
    id: "sharing",
    get title() { return txt.title7; },
    body: (
      <>
        <p>
          <strong>{txt.strong7}</strong>
        </p>
        <p>{txt.p24}</p>
        <ul>
          <li>
            <strong>{txt.strong8}</strong> {" "}{txt.li11}</li>
          <li>
            <strong>{txt.strong9}</strong> {" "}{txt.li12}</li>
          <li>
            <strong>{txt.strong10}</strong> {" "}{txt.li13}</li>
          <li>
            <strong>{txt.strong11}</strong> {" "}{txt.li14}</li>
          <li>
            <strong>{txt.strong12}</strong> {" "}{txt.li15}</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    get title() { return txt.title8; },
    body: (
      <>
        <dl className="legal-facts">
          <div>
            <dt>{txt.dt1}</dt>
            <dd>
              {txt.dd1}</dd>
          </div>
          <div>
            <dt>{txt.dt2}</dt>
            <dd>
              {txt.dd2}</dd>
          </div>
          <div>
            <dt>{txt.dt3}</dt>
            <dd>
              {txt.dd3}</dd>
          </div>
          <div>
            <dt>{txt.dt4}</dt>
            <dd>
              {txt.dd4}</dd>
          </div>
          <div>
            <dt>{txt.dt5}</dt>
            <dd>
              {txt.dd5}</dd>
          </div>
        </dl>
        <p>
          {txt.p25}</p>
      </>
    ),
  },
  {
    id: "security",
    get title() { return txt.title9; },
    body: (
      <>
        <p>
          {txt.p26}</p>
        <p>
          {txt.p27}</p>
      </>
    ),
  },
  {
    id: "disconnect-google",
    get title() { return txt.title10; },
    body: (
      <>
        <p>{txt.p28}</p>
        <h3>{txt.h310}</h3>
        <p>
          {txt.p29}{" "}
          <code>{txt.code3}</code>{txt.p30}{" "}
          <strong>{txt.strong13}</strong>{txt.p31}{" "}<strong>{txt.strong14}</strong> {" "}{txt.p32}</p>
        <h3>{txt.h311}</h3>
        <p>
          {txt.p33}{" "}
          <a href={legal.googlePermissionsUrl} rel="noopener">
            {txt.a6}</a>{" "}
          {txt.p34}</p>
      </>
    ),
  },
  {
    id: "delete-your-data",
    get title() { return txt.title11; },
    body: (
      <>
        <p>
          {txt.p35}{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>{txt.p36}</p>
        <ul>
          <li>{txt.li16}</li>
          <li>{txt.li17}</li>
          <li>
            {txt.li18}</li>
        </ul>
        <p>
          {txt.p37}</p>
      </>
    ),
  },
  {
    id: "your-rights",
    get title() { return txt.title12; },
    body: (
      <>
        <p>
          {txt.p38}{" "}
          <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>{txt.p39}</p>

        <h3>{txt.h312}</h3>
        <p>
          {txt.p40}</p>

        <h3>{txt.h313}</h3>
        <p>
          {txt.p41}{" "}<strong>{txt.strong15}</strong> {" "}{txt.p42}</p>

        <h3>{txt.h314}</h3>
        <p>
          {txt.p43}</p>
      </>
    ),
  },
  {
    id: "cookies",
    get title() { return txt.title13; },
    body: (
      <>
        <p>
          {txt.p44}</p>
        <p>
          {txt.p45}</p>
      </>
    ),
  },
  {
    id: "children",
    get title() { return txt.title14; },
    body: (
      <>
        <p>
          {txt.p46}{" "}
          <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a> {" "}{txt.p47}</p>
      </>
    ),
  },
  {
    id: "international-transfers",
    get title() { return txt.title15; },
    body: (
      <>
        <p>
          {txt.p48}</p>
      </>
    ),
  },
  {
    id: "changes",
    get title() { return txt.title16; },
    body: (
      <>
        <p>
          {txt.p49}</p>
      </>
    ),
  },
];

function PrivacyPolicy() {
  return (
    <LegalPage
      title={txt.title17}
      description={txt.description1}
      intro={txt.intro1}
      sections={SECTIONS}
    />
  );
}
