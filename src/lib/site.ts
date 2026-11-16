// Site-wide values the editor can change. Read them when rendering (`site.email`), never copy them into a
// module-level constant, or an edit would not reach the copy.
export const site = {
  /**
   * The address shown for writing to Community Hub directly. Every email link on the site follows it. It is the same
   * inbox the contact form and demo bookings deliver to, so every way of getting in touch reaches dashboard@oberlin.edu.
   */
  contactEmail: "dashboard@oberlin.edu",
  /** Where the contact form and demo bookings are delivered. */
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
