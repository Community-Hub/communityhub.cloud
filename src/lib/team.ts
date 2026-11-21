// The people of Community Hub, as listed on the team page of the site this one replaced (communityhub.cloud/team,
// read 1 Oct 2026): the same names, roles and photos, nothing added. Maddie asked for it back under About Us in the
// review of 19 Nov 2026 ("under about us, we could have story of dashboard, research, our team"). Editors can add,
// remove and reorder people in the site editor (About, "Our team").
export type TeamMember = { id: string; name: string; role: string; image: string; alt: string };

export const team: TeamMember[] = [
  { id: "john-petersen", name: "John Petersen", role: "Director", image: "/assets/live-team-01.jpg.webp", alt: "Portrait of John Petersen" },
  { id: "ethan-woodfill", name: "Ethan Woodfill", role: "Project Manager", image: "/assets/live-team-02.jpg.webp", alt: "Portrait of Ethan Woodfill" },
  { id: "madeleine-faubert", name: "Madeleine Faubert", role: "Design and Media", image: "/assets/live-team-03.jpg.webp", alt: "Portrait of Madeleine Faubert" },
  { id: "gaurav-bora", name: "Gaurav Bora", role: "Software Engineer", image: "/assets/live-team-04.jpg", alt: "Portrait of Gaurav Bora" },
  { id: "pratyush-bharti", name: "Pratyush Bharti", role: "Software Engineer", image: "/assets/live-team-05.jpg.webp", alt: "Portrait of Pratyush Bharti" },
  { id: "hitesh-jangid", name: "Hitesh Jangid", role: "Software Engineer", image: "/assets/live-team-06.jpg.webp", alt: "Portrait of Hitesh Jangid" },
];
