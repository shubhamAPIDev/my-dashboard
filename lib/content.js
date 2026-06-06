// ============================================================
//  EDIT THIS FILE to change your name, vision board, and photos.
//  Images live in public/images/ — swap files there to update.
// ============================================================

export const PROFILE = {
  name: "Shubham",
};

// The daily practice — read this section each morning.
export const MANIFESTATION = {
  title: "Visualize & manifest",
  intro:
    "These images are not decoration. They are your future, seen clearly. Look at them, feel them as already yours, then let today's tasks pull that life closer.",
  steps: [
    { label: "Visualize", blurb: "See the image. Hold it in your mind." },
    { label: "Feel it", blurb: "Live it emotionally — as if it's done." },
    { label: "Act", blurb: "Do one thing today that makes it real." },
  ],
};

// QUOTES — belief and persistence. Edit anytime.
export const QUOTES = [
  {
    text: "Whatever the mind can conceive and believe, it can achieve.",
    author: "Napoleon Hill",
  },
  {
    text: "Act as if what you do makes a difference. It does.",
    author: "William James",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
  },
  {
    text: "Fall seven times, stand up eight.",
    author: "Japanese proverb",
  },
];

// VISION — each card: image + goal + present-tense affirmation (manifestation).
export const VISION = [
  {
    label: "Fiktionsbescheinigung secured",
    affirmation: "I am legally covered while I find my Frankfurt home.",
    image: "/images/vision/residence-permit.jpg",
  },
  {
    label: "Home in Frankfurt",
    affirmation: "I live comfortably in Frankfurt — this city is my home.",
    image: "/images/vision/frankfurt-home.jpg",
  },
  {
    label: "3-year residence permit",
    affirmation: "I hold my residence permit. I belong here for years to come.",
    image: "/images/vision/residence-permit.jpg",
  },
  {
    label: "Exams passed",
    affirmation: "I pass every fundamental exam with clarity and confidence.",
    image: "/images/vision/exams-passed.jpg",
  },
  {
    label: "Goethe University",
    affirmation: "I am at Goethe University — or somewhere even better opens for me.",
    image: "/images/vision/goethe-university.jpg",
  },
  {
    label: "Research assistant",
    affirmation: "I work as a research assistant at Goethe University.",
    image: "/images/vision/research-assistant.jpg",
  },
  {
    label: "IT career in Germany",
    affirmation: "I have a full-time IT role at a German company I am proud of.",
    image: "/images/vision/it-job-germany.jpg",
  },
  {
    label: "Master's complete",
    affirmation: "I finished my master's on a work visa. I built the life I pictured.",
    image: "/images/vision/master-work-visa.jpg",
  },
];

// GOALS — your three big wins. Update `progress` (0–100) as you go.
export const GOALS = [
  {
    key: "abs",
    icon: "💪",
    title: "Six-pack abs",
    progress: 15,
    why: "The discipline that builds a body builds everything else.",
    accent: "#3a8a58",
  },
  {
    key: "job",
    icon: "🖥️",
    title: "Full-time IT job in Germany",
    progress: 10,
    why: "Permanent role. German company. The life I am building.",
    accent: "#c87820",
  },
  {
    key: "exams",
    icon: "📚",
    title: "Pass all fundamental exams",
    progress: 30,
    why: "Visa validity depends on this. Non-negotiable.",
    accent: "#d64040",
  },
];

// HABITS — daily checkboxes, reset each day. Add or remove freely.
export const HABITS = [
  { key: "workout", label: "Workout / abs" },
  { key: "study", label: "Study session" },
  { key: "apply", label: "Job application" },
  { key: "nutrition", label: "Eat clean" },
  { key: "focus", label: "Deep focus block" },
];

// COUNTDOWNS — key dates you must not miss.
export const COUNTDOWNS = [
  { label: "Innovation in China — paper due", date: "2026-06-08", urgent: true },
  { label: "Innovation in China — presentation", date: "2026-06-10", urgent: true },
  { label: "Exams begin", date: "2026-07-27", urgent: true },
  { label: "Frankfurt move", date: "2026-07-01" },
  { label: "Semester fee deadline", date: "2026-07-31" },
  { label: "B1 German certificate", date: "2026-08-16" },
  { label: "Visa / Fiktionsbescheinigung", date: "2026-10-09" },
];

// PHOTOS — you, living the life. Replace files in public/images/photos/.
export const PHOTOS = [
  { src: "/images/photos/frankfurt.png", caption: "Frankfurt evenings" },
  { src: "/images/photos/golden-hour.png", caption: "Golden hour" },
  { src: "/images/photos/mirror.png", caption: "Present me" },
];
