// Site-wide values the editor can change. Read them when rendering (`site.email`), never copy them into a
// module-level constant, or an edit would not reach the copy.
export const site = {
  /** The Contact us address. Every Contact us link and the footer follow it. */
  contactEmail: "connect@communityhub.cloud",
  mission: "Community Hub creates software products that foster stronger, more sustainable, and more resilient connections among people and the natural systems upon which we depend. Our award-winning communications platform uses sophisticated data acquisition and visualization applications to simplify complexity and share the wisdom of community-focused solutions. Community Hub clients include organizations, businesses, and whole communities that are working to enhance understanding, embrace challenges, celebrate success, and foster positive initiative.",
  pricingLede: "Community Hub is cloud-hosted, with an annual fee. Choose a bundle and we will send a quote for your site.",
  /** The Contact us link; follows the address above. A getter, so it is not a separate editable value. */
  get contactHref() {
    return `mailto:${this.contactEmail}?subject=${encodeURIComponent("Contact us")}&body=${encodeURIComponent("Name\nOrganization\nWhat we want to do\n")}`;
  },
};
