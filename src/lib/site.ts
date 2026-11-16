// Site-wide values the editor can change. Read them when rendering (`site.email`), never copy them into a
// module-level constant, or an edit would not reach the copy.
export const site = {
  /** The only email address visitors ever see: every email link, the footer and the form's fallback show it. */
  contactEmail: "connect@communityhub.cloud",
  /**
   * Where the contact form, demo bookings, quote and paper requests are delivered, through Resend. Never shown on the
   * site (the owner's rule): visitors see `contactEmail`.
   */
  formInbox: "dashboard@oberlin.edu",
  mission: "Community Hub creates software products that foster stronger, more sustainable, and more resilient connections among people and the natural systems upon which we depend. Our award-winning communications platform uses sophisticated data acquisition and visualization applications to simplify complexity and share the wisdom of community-focused solutions. Community Hub clients include organizations, businesses, and whole communities that are working to enhance understanding, embrace challenges, celebrate success, and foster positive initiative.",
  pricingLede: "Community Hub is cloud-hosted, with an annual fee. Choose a bundle and we will send a quote for your site.",
  /** The Contact us link: the contact form, which delivers to `formInbox`. A getter, so it is not a separate editable value. */
  get contactHref() {
    return "/contact";
  },
  /** A plain email link to the address above, for people who would rather write directly. */
  get mailtoHref() {
    return `mailto:${this.contactEmail}`;
  },
};
