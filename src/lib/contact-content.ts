// The words on /contact. The message form is the live site's contact page (November 2026); "Book a demo" was added
// for the redesign. Read them when rendering (`contactContent.title`), never copy them into a module-level constant,
// or an edit would not reach the page. The lede and the search description are the site-wide sentence in
// copy.siteFooter.FooterChapter.p2, as on the live site; the address shown comes from `site.contactEmail`.
// Words in {braces} are filled in by the page: keep them when editing.

export const contactContent = {
  title: "Contact us",
  /** Read aloud as the name of the part beside the form. */
  otherWays: "Other ways to reach us",
  emailHeading: "Prefer email?",
  /** Followed by the Contact us address. */
  emailLead: "Write to",
  copyAddress: "Copy address",
  addressCopied: "Copied",
  address: "Community Hub Inc · Oberlin, Ohio",
  guideLink: "Read the implementation guide",
  pricingLink: "How pricing works",
  image: "/assets/live-contact-workshop.jpg",
  alt: "Community Hub workshop with community partners in front of a dashboard display",

  /** The switch at the top of the form. `label` is read aloud. */
  modes: {
    label: "Send a message or book a demo",
    message: "Send a message",
    demo: "Book a demo",
  },

  form: {
    name: "Name",
    email: "Email",
    organization: "Organization",
    topic: "Topic",
    /** After the labels of fields that can be left empty. */
    optional: "(optional)",
    chooseTopic: "Choose a topic",
    /** What visitors see for each topic, in the order of CONTACT_TOPICS (src/lib/contact/validate.ts). The form always sends the fixed topic. */
    topicLabels: ["Bringing Dashboard to my community", "A specific product", "Pricing", "Research", "Something else"],
    message: "Message",
    /** The label of the hidden field that only automated senders fill in. */
    hiddenField: "Website",
    send: "Send message",
    sending: "Sending…",
    privacy: "We use what you send only to reply to you.",
    privacyLink: "Privacy Policy",
  },

  sent: {
    heading: "Thank you, {name}.",
    body: "Your message is on its way to the Community Hub team. We will reply to {email}.",
    again: "Send another message",
  },

  notSent: {
    busyHeading: "Several messages were sent from here in the last few minutes.",
    heading: "We couldn’t send your message from the website.",
    body: "Your message is still below. Send it to {address} from your own email:",
    gmail: "Open in Gmail",
    mailApp: "Open your email app",
    copyMessage: "Copy message",
    messageCopied: "Copied",
    /** Read aloud when the message has been copied. */
    messageCopiedAnnouncement: "Message copied",
  },

  demo: {
    intro: "Choose a day and time that suit you. We’ll reply by email to confirm.",
    phone: "Phone",
    phoneHint: "(needed for a phone call)",
    interest: "Interested in",
    chooseInterest: "Choose one",
    /** What visitors see for each choice, in the order of DEMO_INTERESTS (src/lib/contact/demo.ts). The form always sends the fixed value. */
    interestLabels: [
      "The whole platform",
      "Engage: Digital Signage, Phone App, Web Embeddables",
      "Educate: Building Dashboard, Citywide Dashboard, Data Hub, Stories",
      "Motivate and Empower: Community Calendar, Community Voices",
    ],
    day: "Preferred day",
    /** Under the day when it falls on a weekend. */
    weekend: "That’s a {weekday}. We may suggest a weekday instead.",
    time: "Preferred time",
    chooseTime: "Choose a time",
    /** In the order of DEMO_WINDOWS (src/lib/contact/demo.ts), which holds the hours sent in the email. */
    windows: [
      { name: "Morning", hours: "9 am–noon" },
      { name: "Midday", hours: "noon–2 pm" },
      { name: "Afternoon", hours: "2–5 pm" },
    ],
    timeZone: "Time zone",
    meeting: "How would you like to meet?",
    /** In the order of DEMO_MEETINGS (src/lib/contact/demo.ts). */
    meetingLabels: ["Video call", "Phone call", "In person in Oberlin"],
    notes: "Notes",
    send: "Send request",
    sending: "Sending…",
  },

  demoSent: {
    heading: "Thank you, {name}.",
    body: "Your request for {day} ({time}) is on its way. We’ll reply to {email} to confirm.",
    again: "Book another demo",
  },

  demoNotSent: {
    busyHeading: "Several requests were sent from here in the last few minutes.",
    heading: "We couldn’t send your request from the website.",
    body: "Your request is still below. Send it to {address} from your own email:",
    copyRequest: "Copy request",
    requestCopied: "Copied",
    /** Read aloud when the request has been copied. */
    requestCopiedAnnouncement: "Request copied",
  },
};
