// The wording of src/routes/toolkit.tsx, where the editor can list and change it. Moved here by a script on 21 Nov 2026;
// add new wording by hand. Read it when drawing (txt.key), never copy it into a constant, or an edit would not show.
import { registerText } from "./register";

export const txt = registerText("toolkit", "Teacher toolkit", {
  text1: "Higher education",
  label1: "Search lessons",
  placeholder1: "Title, topic or dashboard feature",
  label2: "Grade level",
  option1: "All grade levels",
  label3: "Subject",
  option2: "All subjects",
  p1: "of",
  p2: "lessons",
  button1: "Clear filters",
  p3: "No lessons match these filters. Try a different topic or clear the filters.",
  p4: "Source:",
  a1: "Environmental Dashboard Instructor Toolkit",
});
