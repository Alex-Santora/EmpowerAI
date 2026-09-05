// All narrative stops, world anchors, and camera timing live here.
export const chapters = [
  {
    id: "arrival",
    label: "Welcome",
    start: 0,
    stop: 0,
    eyebrow: "100% FREE FOREVER",
  },
  {
    id: "central",
    label: "Our world",
    start: 0.13,
    stop: 0.18,
    eyebrow: "ONE CONNECTED ECOSYSTEM",
  },
  {
    id: "learn",
    label: "Learn",
    start: 0.24,
    stop: 0.30,
    eyebrow: "A FOUNDATION FOR CURIOSITY",
    title: "Open Source AI Learning Paths",
    copy: "Trusted free courses organized into approachable learning paths.",
    cta: "Explore Learning",
    to: "/courses",
    anchor: [-23, 11, 8],
  },
  {
    id: "build",
    label: "Build",
    start: 0.37,
    stop: 0.43,
    eyebrow: "IDEAS BECOME REAL",
    title: "Project-Based Learning",
    copy: "Real builds that turn concepts into portfolio-ready work.",
    cta: "Explore Projects",
    to: "/projects",
    anchor: [22, 9, 14],
  },
  {
    id: "guide",
    label: "Get guidance",
    start: 0.49,
    stop: 0.55,
    eyebrow: "NO ONE LEARNS ALONE",
    title: "Volunteer Mentorship",
    copy: "Future guidance from people who remember what starting felt like.",
    cta: "Find Mentor",
    to: "/mentorship",
    anchor: [21, 7, 43],
  },
  {
    id: "human",
    label: "Our purpose",
    start: 0.61,
    stop: 0.67,
    eyebrow: "BUILT AROUND PEOPLE",
  },
  {
    id: "commit",
    label: "Our promise",
    start: 0.74,
    stop: 0.80,
    eyebrow: "THE FUTUREWITHAI COMMITMENT",
  },
  {
    id: "grow",
    label: "Grow",
    start: 0.88,
    stop: 1,
    eyebrow: "A FUTURE WE BUILD TOGETHER",
  },
];
export const commitments = [
  ["FREE", "100% free curriculum for everyone"],
  ["INCLUSIVE", "Inclusive learning for curious minds"],
  ["RESPONSIBLE", "Responsible use in every path"],
  ["OPEN", "Open and transparent resources"],
];
export const cameraFrames = [
  // One physical route: approach, library edge, workshop, garden, plaza, ascent.
  // Extra travel points are independent of chapter boundaries: no shot snapping.
  { progress: 0, position: [68, 43, 116], target: [-12, 17, -8] },
  { progress: 0.10, position: [39, 32, 82], target: [-12, 16, -10] },
  { progress: 0.19, position: [12, 23, 54], target: [-19, 13, -7] },
  { progress: 0.28, position: [-7, 14, 32], target: [-27, 12, 0] },
  { progress: 0.34, position: [-8, 11, 23], target: [-24, 9, 0] },
  { progress: 0.40, position: [9, 10, 29], target: [11, 8, 2] },
  { progress: 0.46, position: [34, 12, 34], target: [25, 8, 7] },
  { progress: 0.53, position: [45, 8, 54], target: [17, 4, 44] },
  { progress: 0.60, position: [31, 6, 69], target: [9, 4, 44] },
  { progress: 0.68, position: [7, 5.5, 73], target: [-10, 5, 42] },
  { progress: 0.76, position: [-19, 9, 70], target: [-8, 5, 43] },
  { progress: 0.84, position: [-39, 25, 83], target: [-3, 6, 23] },
  { progress: 0.92, position: [-57, 57, 119], target: [2, 7, 10] },
  { progress: 1, position: [-76, 93, 164], target: [3, 7, 6] },
];
export function chapterAt(progress) {
  return chapters.findLastIndex((chapter) => progress >= chapter.start);
}
