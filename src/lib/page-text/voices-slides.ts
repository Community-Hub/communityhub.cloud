// The Community Voices preview slides (quotes, names and category titles), where the editor can list and change them.
// The file is keyed by player address; the editor sees the same slide objects as one list per player.
import voicesSlidesData from "@/data/voices-slides.json";
import { siteIndex } from "../site-registry.ts";

siteIndex.extend({
  name: "voicesSlides",
  page: "Community Voices",
  value: Object.values(voicesSlidesData),
  only: ["quote", "attribution", "subAttribution", "categoryLabel"],
});

export { voicesSlidesData };
