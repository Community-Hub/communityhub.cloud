import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { legal } from "@/lib/legal";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfService,
  head: () => ({
    meta: [
      { title: "Terms of Service — Community Hub" },
      {
        name: "description",
        content:
          "The terms that govern access to Community Hub websites and products, including optional read-only Google Sheets connections.",
      },
      { property: "og:title", content: "Terms of Service — Community Hub" },
      {
        property: "og:description",
        content:
          "The agreement between Community Hub and the organizations and people who use its websites, dashboards, signage and data tools.",
      },
    ],
    links: [{ rel: "canonical", href: `${legal.origin}/terms-of-service` }],
  }),
});

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <>
        <p>
          These Terms of Service (“Terms”) are an agreement between Community Hub Inc (“Community
          Hub”, “we”, “us” or “our”) and you, the person or organization using our websites and
          products (“you”). By accessing or using Community Hub, you agree to these Terms. If you do
          not agree, do not use the service.
        </p>
        <p>
          If you use Community Hub for an organization, you represent that you have authority to
          bind that organization, and “you” includes the organization. If you are under the age of
          majority where you live, you may use Community Hub only through an organization account
          with the approval of a parent, guardian or authorized administrator.
        </p>
      </>
    ),
  },
  {
    id: "the-service",
    title: "The service",
    body: (
      <>
        <p>
          Community Hub provides cloud software for community data and communication: Data Hub,
          Building Dashboard, Citywide Dashboard, digital signage, the phone app, embeddables,
          Stories, the Studio and related websites and APIs (together, the “Service”).
        </p>
        <p>
          Some features are optional, including connecting a Google Sheet to import read-only data
          into an organization’s Data Hub. We may add, change or retire features, and we will give
          reasonable notice of material changes that affect paid services.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and responsibilities",
    body: (
      <>
        <ul>
          <li>Provide accurate account and organization information and keep it current.</li>
          <li>
            Keep sign-in credentials, workspace links and API credentials confidential; you are
            responsible for activity under your account.
          </li>
          <li>
            Organization administrators control membership, roles, connected data sources and what
            is published publicly. Make sure you have permission to publish the data you connect.
          </li>
          <li>Tell us promptly about unauthorized access or a security incident.</li>
          <li>Use the Service only for lawful purposes and within your organization’s agreement.</li>
        </ul>
      </>
    ),
  },
  {
    id: "google-integration",
    title: "Google integration",
    body: (
      <>
        <p>
          Connecting Google Sheets is optional. If you choose it, you authorize Community Hub to
          access the Google account and spreadsheets you select, using the read-only Google Sheets
          scope and basic profile information described in our{" "}
          <a href="/privacy-policy">Privacy Policy</a>. We do not write to your spreadsheets.
        </p>
        <p>
          Google’s own terms and privacy policy also apply to your Google account. You can revoke
          access at any time in Data Hub or at{" "}
          <a href={legal.googlePermissionsUrl} rel="noopener">
            myaccount.google.com/permissions
          </a>
          . Revoking access stops future imports; it does not automatically delete data that was
          already imported, which can be removed in Data Hub or by request under the Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>use the Service to break the law, infringe rights, or publish content you do not have permission to publish;</li>
          <li>access another organization’s data, accounts or systems without authorization;</li>
          <li>probe, scan or test the security of the Service except with our written permission;</li>
          <li>interfere with the Service, overload it, or bypass rate limits, access controls or usage limits;</li>
          <li>scrape, crawl or harvest data from the Service except through a documented API and within its limits;</li>
          <li>upload malware, or use the Service to send spam or deceptive messages;</li>
          <li>resell, sublicense or provide the Service to third parties as a competing service; or</li>
          <li>remove proprietary notices or use our trademarks without permission.</li>
        </ul>
        <p>
          We may suspend access to protect the Service, other customers or the public, and we will
          tell you why when we can.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content and intellectual property",
    body: (
      <>
        <p>
          <strong>You own your data.</strong> You keep all rights in the data, text, images,
          spreadsheets and other content you provide or connect (“Your Content”). You grant
          Community Hub a worldwide, non-exclusive license to host, store, copy, process, transmit
          and display Your Content only as needed to provide and support the Service, to secure it,
          and to comply with law. This license ends when Your Content is deleted, except for
          backups and legal records kept under the Privacy Policy.
        </p>
        <p>
          You are responsible for Your Content and for having the rights and permissions needed to
          use it, including data about other people. Our software, designs, documentation,
          trademarks and the Service itself are owned by Community Hub or its licensors and are not
          transferred to you.
        </p>
        <p>
          If you send us feedback or suggestions, we may use them without restriction or
          compensation.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees and payment",
    body: (
      <>
        <p>
          Community Hub is cloud-hosted and provided for an annual fee. The applicable fee, term,
          payment schedule and any services are set out in your quote, order or organization
          agreement. Fees are exclusive of taxes unless stated.
        </p>
        <p>
          Invoices are due as stated on the invoice. We may suspend paid features for overdue
          amounts after notice. Except where required by law or expressly stated in an order, fees
          are non-refundable. If you cancel before the end of a term, the remaining fees for that
          term are still due.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Term, suspension and termination",
    body: (
      <>
        <p>
          These Terms apply while you use the Service. Either party may terminate an organization
          agreement with 30 days’ written notice, unless the agreement says otherwise. We may
          suspend or terminate access immediately for a material breach, nonpayment, illegal or
          harmful use, or a security risk.
        </p>
        <p>
          On termination, you may request an export of Your Content within 30 days. After that we
          may delete it, subject to backups and records we must keep. Sections that by their nature
          should survive termination — including ownership, disclaimers, liability, indemnity and
          governing law — survive.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <>
        <p>
          The Service is provided “as is” and “as available”. To the maximum extent permitted by
          law, Community Hub disclaims all warranties, express or implied, including merchantability,
          fitness for a particular purpose, title and non-infringement.
        </p>
        <p>
          Data displayed by the Service may be delayed, incomplete or inaccurate, and may depend on
          sensors, utilities, connected spreadsheets or other third parties. The Service is not
          professional, legal, financial, engineering or safety advice. Do not rely on it as the
          only source for a decision that could affect health, safety or compliance.
        </p>
        <p>
          We do not guarantee that the Service will be uninterrupted, error-free or secure, or that
          data will never be lost. Keep your own copies of important data.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the maximum extent permitted by law, Community Hub will not be liable for indirect,
          incidental, special, consequential or punitive damages, or for lost profits, revenue,
          data, goodwill or business opportunity, even if we were advised of the possibility.
        </p>
        <p>
          Our total aggregate liability arising out of or relating to the Service or these Terms
          will not exceed the fees you paid to Community Hub for the affected Service in the twelve
          months before the event giving rise to the claim. If you use a free Service, our total
          liability will not exceed one hundred U.S. dollars.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited by law, including liability
          for fraud, willful misconduct, or death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <>
        <p>
          You will defend and indemnify Community Hub and its officers, employees and agents against
          claims, losses and costs (including reasonable legal fees) arising from Your Content, your
          use of the Service in violation of these Terms or law, or your violation of another
          person’s rights. We will notify you of a claim and may participate in the defense.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and jurisdiction",
    body: (
      <>
        <p>
          These Terms are governed by the laws of the State of Ohio, United States, without regard
          to conflict-of-law rules. The state and federal courts located in Ohio have exclusive
          jurisdiction over disputes arising out of or relating to these Terms or the Service,
          except where applicable law gives you a right to a different forum. The United Nations
          Convention on Contracts for the International Sale of Goods does not apply.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <>
        <p>
          We may update these Terms. We post the new version here and update the “Last updated”
          date. For material changes, we will notify organization administrators by email before
          the changes take effect. If you continue to use the Service after the effective date, you
          accept the updated Terms.
        </p>
      </>
    ),
  },
];

function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The agreement between Community Hub and the organizations and people who use its websites, dashboards, signage and data tools."
      intro="The agreement between Community Hub and the organizations and people who use its websites, dashboards, signage and data tools."
      sections={SECTIONS}
    />
  );
}
