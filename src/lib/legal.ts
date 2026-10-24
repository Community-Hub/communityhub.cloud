// Legal identity and dates. Keep these in one place so the policy, the terms and any future
// sub-processor page cannot drift apart. Confirm the registered address and governing law with
// Community Hub before publishing; they are the only values here that are not editable in the CMS.
export const legal = {
  /** The legal entity, as it should appear on contracts and policies. */
  entity: "Community Hub Inc",
  /** City, state and postal address of the registered office. */
  address: "Oberlin, OH 44074, United States",
  /** The public product name used on the Google consent screen. */
  product: "Community Hub",
  /** Privacy questions, access requests and deletion requests. */
  privacyEmail: "privacy@communityhub.cloud",
  /** General support and the address named in the Google deletion instructions. */
  supportEmail: "info@communityhub.cloud",
  /** Canonical public origin, used for canonical links and policy references. */
  origin: "https://www.communityhub.cloud",
  effectiveDate: "October 24, 2026",
  lastUpdated: "October 24, 2026",
  googlePermissionsUrl: "https://myaccount.google.com/permissions",
  googleApiPolicyUrl: "https://developers.google.com/terms/api-services-user-data-policy",
  /** The exact sentence Google's Limited Use review looks for. Do not paraphrase it. */
  limitedUse:
    "Community Hub\u2019s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.",
} as const;
