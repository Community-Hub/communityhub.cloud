import { createFileRoute } from "@tanstack/react-router";
import { DocSection, DocShell } from "@/components/doc";
import lessonsData from "@/data/lessons.json";
import { useEffect, useMemo, useRef, useState } from "react";

import { copy } from "@/lib/copy";
import { pc } from "@/lib/page-content";
type Lesson = {
  title: string;
  type: string;
  grade_levels: string[];
  student_levels: string[];
  subjects: string[];
  dashboard_feature: string[];
  author: string | null;
  description: string;
  url: string;
};

const LESSONS = lessonsData as Lesson[];
/** The count is filled in at render so a lesson added in the editor is counted. */
const ledeText = () => pc.toolkit.LEDE.replace("{count}", String(LESSONS.length));
/** Cards per screen on a large screen, before the page is measured; the real split comes from `useFitPages`. */


const gradeNum = (g: string) => (g.startsWith("Grade ") ? Number(g.slice(6)) : 99);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Grades 8 to 12", "Grades 3, 4 and 5"; Higher Education is named last. */
function gradeText(gs: string[]) {
  const sorted = [...gs].sort((a, b) => gradeNum(a) - gradeNum(b));
  const nums = sorted.filter((g) => g.startsWith("Grade ")).map(gradeNum);
  const higher = sorted.includes("Higher Education");
  let text = "";
  if (nums.length) {
    const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
    text =
      nums.length === 1
        ? `Grade ${nums[0]}`
        : contiguous
          ? `Grades ${nums[0]} to ${nums[nums.length - 1]}`
          : `Grades ${nums.slice(0, -1).join(", ")} and ${nums[nums.length - 1]}`;
  }
  return higher ? (text ? `${text} and higher education` : "Higher education") : text;
}

export const Route = createFileRoute("/toolkit")({
  component: Toolkit,
  head: () => ({
    meta: [
      { title: pc.meta.toolkit.title },
      { name: "description", content: ledeText() },
    ],
  }),
});

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <li className="flex min-w-0 flex-col gap-0.5 rounded-md border border-line bg-paper p-3 shadow-[0_1px_3px_rgba(36,75,56,0.07)] max-md:leading-snug md:gap-1 md:p-4" data-lesson>
      <h3 className="font-medium leading-snug max-md:text-sm md:text-[1.0625rem]">{lesson.title}</h3>
      <p className="t-small text-ink/70 max-md:leading-snug">
        <span className="font-bold">{lesson.type.replace(/, /g, " and ")}.</span> {gradeText(lesson.grade_levels)}. {lesson.subjects.join(", ")}.
      </p>
      <p className="t-small text-ink/70 max-md:leading-snug">{copy.toolkit.LessonCard.p1}{" "}{lesson.student_levels.map(cap).join(", ")}{copy.toolkit.LessonCard.p2}{" "}{lesson.dashboard_feature.join(", ")}.
        {lesson.author ? ` By ${lesson.author}.` : ""}
      </p>
      <p className="t-small max-md:leading-snug">{lesson.description}</p>
      <a href={lesson.url} target="_blank" rel="noopener" className="link mt-auto inline-flex min-h-11 items-center font-bold">{copy.toolkit.LessonCard.a1}<span aria-hidden="true">{copy.toolkit.LessonCard.span1}</span>
        <span className="sr-only">: {lesson.title}{" "}{copy.toolkit.LessonCard.span2}</span>
      </a>
    </li>
  );
}

function Toolkit() {
  const legacyLesson = useRef(typeof window === "undefined" ? null : window.location.hash.match(/^#lessons-from-(\d+)$/)?.[1]);
  useEffect(() => {
    if (!legacyLesson.current) return;
    const card = document.querySelectorAll<HTMLElement>("[data-lesson]")[Number(legacyLesson.current) - 1];
    const scroll = card?.closest<HTMLElement>("[data-allow-scroll]");
    if (card && scroll) scroll.scrollTop += card.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 80;
  }, []);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const grades = [...new Set(LESSONS.flatMap(l => l.grade_levels))].sort((a, b) => gradeNum(a) - gradeNum(b));
  const subjects = [...new Set(LESSONS.flatMap(l => l.subjects))].sort();
  const lessons = useMemo(() => LESSONS.filter(l =>
    (!grade || l.grade_levels.includes(grade)) &&
    (!subject || l.subjects.includes(subject)) &&
    (!query.trim() || `${l.title} ${l.description} ${l.subjects.join(" ")} ${l.dashboard_feature.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
  ), [query, grade, subject]);
  const clear = () => { setQuery(""); setGrade(""); setSubject(""); };
  return (
    <DocShell stops={[{id: "lessons", label: pc.toolkit.TITLE}]}>
      <DocSection label={pc.toolkit.TITLE} title={pc.toolkit.TITLE} as="h1" lede={ledeText()}>
        <form onSubmit={e => e.preventDefault()} role="search" aria-label="Find teaching resources" className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 font-bold">Search lessons
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Title, topic or dashboard feature" className="min-h-11 min-w-0 rounded border border-line bg-paper px-3 font-normal shadow-[inset_0_1px_2px_rgba(36,75,56,0.06)] focus-visible:border-pine" />
          </label>
          <label className="grid gap-1 font-bold">Grade level
            <select value={grade} onChange={e => setGrade(e.target.value)} className="min-h-11 min-w-0 rounded border border-line bg-paper px-3 font-normal shadow-[inset_0_1px_2px_rgba(36,75,56,0.06)] focus-visible:border-pine">
              <option value="">All grade levels</option>{grades.map(g => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label className="grid gap-1 font-bold">Subject
            <select value={subject} onChange={e => setSubject(e.target.value)} className="min-h-11 min-w-0 rounded border border-line bg-paper px-3 font-normal shadow-[inset_0_1px_2px_rgba(36,75,56,0.06)] focus-visible:border-pine">
              <option value="">All subjects</option>{subjects.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </form>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p role="status">{lessons.length} of {LESSONS.length} lessons</p>
          {(query || grade || subject) && <button onClick={clear} className="link min-h-11">Clear filters</button>}
        </div>
        {lessons.length ? <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{lessons.map(lesson => <LessonCard key={lesson.url} lesson={lesson} />)}</ul>
          : <p className="rounded border border-line bg-paper p-5">No lessons match these filters. Try a different topic or clear the filters.</p>}
        <p className="mt-4 t-small">Source: <a href={pc.toolkit.CREDIT_URL} target="_blank" rel="noopener noreferrer" className="link">Environmental Dashboard Instructor Toolkit</a>.</p>
      </DocSection>
    </DocShell>
  );
}
