import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { legal } from "@/lib/legal";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Community Hub" },
      {
        name: "description",
        content:
          "How Community Hub collects, uses, shares and protects information, including read-only Google Sheets data from connected Google accounts.",
      },
      { property: "og:title", content: "Privacy Policy — Community Hub" },
      {
        property: "og:description",
        content:
          "How Community Hub handles account information, usage data, cookies and read-only Google Sheets data.",
      },
    ],
    links: [{ rel: "canonical", href: `${legal.origin}/privacy-policy` }],
  }),
});

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          Community Hub Inc (“Community Hub”, “we”, “us” or “our”) provides community data and
          communication software: Data Hub, Building Dashboard, Citywide Dashboard, digital
          signage, the phone app, embeddables, Stories and the associated websites.
        </p>
        <p>
          <strong>Community Hub Inc</strong>
          <br />
          {legal.address}
          <br />
          Privacy questions: <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
        </p>
        <p>
          For personal information we collect through our websites and accounts, Community Hub is
          the controller. When we process data on behalf of an organization, that organization is
          the controller and Community Hub is the processor. If your organization has a separate
          agreement with us, that agreement may add to this policy; if it conflicts with this policy
          for your organization’s data, the agreement controls.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    title: "Scope of this policy",
    body: (
      <>
        <p>
          This policy applies to <a href={legal.origin}>communityhub.cloud</a> and every Community
          Hub product, including dashboards hosted for a community or organization — for example,
          the Oberlin dashboard at <code>oberlin.communityhub.cloud</code> — and to the optional
          Google Sheets connection in Data Hub.
        </p>
        <p>
          It does not apply to third-party websites or services, including Google. When you use
          Google Sign-In or connect Google Sheets, Google’s own terms and privacy policy also
          apply to your Google account.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <h3>Information you give us</h3>
        <p>
          Your name, email address, organization, role, the content you create or upload, and the
          messages you send to support or sales.
        </p>

        <h3>Account and sign-in information</h3>
        <p>
          Your name, email address, Google account identifier when you choose Google Sign-In, a
          hashed password when you use email sign-in, your organization and role, and session
          information needed to keep you signed in. If you use a guest workspace, we create a
          signed workspace identifier for that browser rather than asking you to create an
          account.
        </p>

        <h3>Google user data</h3>
        <p>
          When you connect Google Sheets, we receive the basic profile information described below
          and the spreadsheet data you choose to connect. This is described in full in{" "}
          <a href="#google-user-data">Google user data</a>.
        </p>

        <h3>Usage and device information</h3>
        <p>
          IP address, browser and device type, operating system, pages and screens viewed,
          referring page, timestamps, and diagnostic logs. We use this to run, secure and improve
          the service, and to understand which features are used.
        </p>

        <h3>Cookies and similar technologies</h3>
        <p>
          We use a small number of strictly necessary cookies. See <a href="#cookies">Cookies</a>.
        </p>

        <h3>Aggregated and de-identified information</h3>
        <p>
          We may create aggregated or de-identified information that cannot reasonably be used to
          identify you. We may use it to operate, improve and describe the service.
        </p>
      </>
    ),
  },
  {
    id: "google-user-data",
    title: "Google user data",
    body: (
      <>
        <p>
          Connecting Google Sheets is optional. It lets an authorized administrator import rows
          from a spreadsheet into their organization’s Data Hub so the data can appear in
          dashboards, stories and public displays.
        </p>

        <h3>What we access</h3>
        <ul>
          <li>
            <strong>Basic profile:</strong> your name, email address and Google account identifier.
            We use these for sign-in and to identify the connected Google account.
          </li>
          <li>
            <strong>Google Sheets data:</strong> the spreadsheet you choose to connect, its
            spreadsheet and sheet titles, the configuration needed to import it (for example which
            column contains the date), and the values read from the tab you designate, such as the
            Master Data tab.
          </li>
          <li>
            <strong>OAuth tokens:</strong> encrypted tokens used to refresh read-only access to the
            spreadsheet you linked.
          </li>
        </ul>
        <p>
          We request the read-only Google Sheets scope{" "}
          <code>https://www.googleapis.com/auth/spreadsheets.readonly</code>, plus basic profile
          and email for account linking. <strong>We do not write to your spreadsheets.</strong>
        </p>

        <h3>How we use it</h3>
        <p>
          Only to provide the feature you asked for: importing and syncing the selected Google
          Sheet into your organization’s Community Hub dashboards, showing that data to the people
          your organization authorizes, and supporting the connection when something goes wrong.
          We do not use Google user data for advertising, and we do not sell it.
        </p>

        <div className="legal-callout">
          <p>
            <strong>Limited Use.</strong> “{legal.limitedUse}”
          </p>
        </div>

        <p>
          In line with the Google API Services User Data Policy, Google user data is not used to
          develop, improve or train generalized artificial intelligence or machine-learning
          models, is not used to determine creditworthiness or for lending purposes, and is not
          transferred to third parties except as described in <a href="#sharing">Sharing</a>.
          Access by our staff is limited to authorized personnel who need it to operate, secure or
          support the service, or to comply with law.
        </p>

        <p>
          You can revoke access at any time. See{" "}
          <a href="#disconnect-google">How to disconnect Google access</a>.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    body: (
      <>
        <p>We use information to:</p>
        <ul>
          <li>provide, operate and maintain the service, including dashboards, maps and signage;</li>
          <li>authenticate users, create and secure workspaces, and manage organization membership;</li>
          <li>import, sync and display the Google Sheets data an administrator connects;</li>
          <li>respond to support, sales and privacy requests;</li>
          <li>monitor reliability, prevent abuse, investigate security incidents and enforce our terms;</li>
          <li>understand usage and improve features, using aggregated or de-identified information where practical;</li>
          <li>comply with legal obligations and enforce our agreements.</li>
        </ul>
        <p>
          We do not sell personal information. We do not use Google user data for advertising or to
          train generalized AI models.
        </p>

        <h3>Legal bases for European users</h3>
        <p>
          Where the GDPR or UK GDPR applies, we rely on: performance of a contract with you or your
          organization; our legitimate interests in operating, securing and improving the service;
          compliance with legal obligations; and your consent where we ask for it (for example, an
          optional integration). You can withdraw consent at any time without affecting processing
          that already happened.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing and sub-processors",
    body: (
      <>
        <p>
          <strong>We do not sell personal information, and we do not share Google user data with
          third parties for their own purposes.</strong>
        </p>
        <p>We share information only in these situations:</p>
        <ul>
          <li>
            <strong>Service providers.</strong> Companies that host or run Community Hub under
            contract, such as DigitalOcean for hosting and infrastructure, and providers that help
            us with authentication, email and security. They may process information only to
            provide those services to us.
          </li>
          <li>
            <strong>Your organization.</strong> If your account belongs to an organization,
            authorized administrators can see and manage the organization’s content, members and
            connected data sources.
          </li>
          <li>
            <strong>Legal and safety.</strong> When we believe disclosure is required by law, legal
            process, or necessary to protect rights, safety, security or the integrity of the
            service.
          </li>
          <li>
            <strong>A business transfer.</strong> If Community Hub is involved in a merger,
            acquisition, financing or sale of assets, information may be transferred as part of
            that transaction, subject to this policy.
          </li>
          <li>
            <strong>With your direction.</strong> When you ask us to share something, for example a
            public dashboard or an embeddable.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    body: (
      <>
        <dl className="legal-facts">
          <div>
            <dt>Google connection data</dt>
            <dd>
              OAuth tokens, the connected Google account email, the linked spreadsheet URL and
              integration settings are kept while the Google Sheets data source exists and remains
              enabled in Data Hub for your organization, or until you disconnect Google or delete
              that data source.
            </dd>
          </div>
          <div>
            <dt>Imported Google Sheet data</dt>
            <dd>
              Values imported into Data Hub are kept as long as your organization uses Data Hub and
              the integration remains active, unless your organization deletes the data source,
              disables the integration, or requests deletion. Historical time-series may remain in
              backups for a limited period consistent with our backup and disaster-recovery
              practices.
            </dd>
          </div>
          <div>
            <dt>Temporary setup data</dt>
            <dd>
              In-progress setup data created before you finish a connection is kept only for a short
              period, on the order of hours, and is then removed automatically.
            </dd>
          </div>
          <div>
            <dt>Account and workspace data</dt>
            <dd>
              Kept while the account or organization workspace is active. After deletion, limited
              copies may remain in backups, logs or records for the period needed for security,
              legal or accounting purposes.
            </dd>
          </div>
          <div>
            <dt>Requested deletion</dt>
            <dd>
              When we verify a deletion request, we delete or anonymize the requested data within
              30 days, except for limited information we must keep for legal, security or backup
              obligations. If we keep something, we tell you what and why.
            </dd>
          </div>
        </dl>
        <p>
          We use Google user data only to provide the import feature described above. We do not use
          it for advertising, and we do not sell it.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we store and protect information",
    body: (
      <>
        <p>
          Community Hub is hosted on DigitalOcean. We protect information with HTTPS/TLS in transit,
          encryption at rest for stored data and OAuth tokens, access limited to authorized staff
          and service providers, and monitoring for abuse and security events.
        </p>
        <p>
          No system is perfectly secure. If we become aware of a breach that affects personal
          information, we will notify affected organizations and individuals, and the authorities,
          as required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "disconnect-google",
    title: "How to disconnect Google access",
    body: (
      <>
        <p>You can stop our access to your Google account in either of these ways:</p>
        <h3>1. Inside Community Hub (recommended)</h3>
        <p>
          Sign in to your organization’s Data Hub site (for example{" "}
          <code>https://oberlin.communityhub.cloud</code>), go to{" "}
          <strong>Data Hub → Data Sources → Google Sheet</strong>, open the integration, and either
          delete the data source or use <strong>Change Account</strong> to remove the linked Google
          account. That stops scheduled imports and removes the stored OAuth credentials for that
          integration.
        </p>
        <h3>2. In your Google Account</h3>
        <p>
          Revoke access at{" "}
          <a href={legal.googlePermissionsUrl} rel="noopener">
            myaccount.google.com/permissions
          </a>{" "}
          by removing Community Hub (or the name shown for this OAuth client). After revocation,
          imports stop; we clear the stored connection when our systems detect that the token is no
          longer valid.
        </p>
      </>
    ),
  },
  {
    id: "delete-your-data",
    title: "How to request deletion",
    body: (
      <>
        <p>
          To request deletion of Google-linked connection data and/or imported data associated with
          your organization’s Google Sheets integration, contact us at{" "}
          <a href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</a>. Include:
        </p>
        <ul>
          <li>your organization name and Data Hub site URL;</li>
          <li>the Google account email used for the connection, if known;</li>
          <li>
            whether you want connection data only, or connection data and imported sheet data
            removed.
          </li>
        </ul>
        <p>
          We will verify that you are authorized to act for that organization, then delete or
          anonymize the requested data within 30 days, except where we must retain limited
          information for legal, security or backup obligations. If we keep something, we will tell
          you what we kept and why.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your privacy rights",
    body: (
      <>
        <p>
          You can ask us to access, correct, export or delete your personal information by emailing{" "}
          <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>. We respond within 30
          days. Organization administrators can also update or remove members of their
          organization.
        </p>

        <h3>European Economic Area and United Kingdom</h3>
        <p>
          If the GDPR or UK GDPR applies, you have the right to access your data, correct it, delete
          it, restrict or object to processing, receive a portable copy, and withdraw consent. You
          also have the right to complain to your local supervisory authority. We process data to
          provide the service you or your organization requested, for our legitimate interests in
          running and securing it, and to meet legal obligations.
        </p>

        <h3>California</h3>
        <p>
          If the California Consumer Privacy Act, as amended by the CPRA, applies, you have the
          right to know what personal information we collect, use and disclose; to delete it; to
          correct it; to opt out of sale or sharing; and not to be discriminated against for
          exercising those rights. <strong>We do not sell or share personal information</strong> as
          those terms are defined by the CPRA. You may use an authorized agent; we may ask for proof
          of authorization.
        </p>

        <h3>Other regions</h3>
        <p>
          If your local law gives you additional rights, contact us and we will honor them. We may
          need to verify your identity before acting on a request.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <>
        <p>
          We use only strictly necessary cookies: a secure session cookie that keeps you signed in
          and expires after 24 hours. We do not use advertising cookies.
        </p>
        <p>
          Your browser can block or delete cookies. If you block the session cookie, you may not be
          able to stay signed in to Data Hub or the Studio.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <>
        <p>
          Community Hub is not directed to children under 13, and we do not knowingly collect
          personal information from children under 13. If you believe a child has provided us with
          personal information, contact{" "}
          <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a> and we will delete it. In
          the European Union and the United Kingdom, the minimum age for consent to online services
          is 16 unless local law sets a lower age.
        </p>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International transfers",
    body: (
      <>
        <p>
          Community Hub is hosted on DigitalOcean infrastructure and may process information in the
          United States and other countries where our service providers operate. Where law requires
          it, we use appropriate safeguards for transfers of personal information. Contact us if you
          need more information about the safeguards that apply to your organization.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We post changes on this page and update the “Last updated” date above. For material
          changes, we email account holders before the changes take effect. If you do not have an
          account, the updated page is the notice.
        </p>
      </>
    ),
  },
];

function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Community Hub collects, uses, shares and protects personal information, including read-only Google Sheets data."
      intro="This policy explains what we collect, why we collect it, how long we keep it and how you can control it — including the read-only Google Sheets data you choose to connect."
      sections={SECTIONS}
      kind="privacy"
    />
  );
}
