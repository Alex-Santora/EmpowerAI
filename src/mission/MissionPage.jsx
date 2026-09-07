import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Pause,
  Play,
} from "lucide-react";
import brandLogo from "../logos/brand-trim.png";
import { chapters, chapterAt, commitments } from "./timeline";
import CityBackdrop from "./CityBackdrop";
import "./mission.css";

const MissionScene = lazy(() => import("./MissionScene"));
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const links = [
  ["Mission", "/"],
  ["Courses", "/courses"],
  ["Projects", "/projects"],
  ["Mentorship", "/mentorship"],
  ["Acknowledgments", "/acknowledgments"],
];
function ChapterContent({ chapter }) {
  if (chapter.id === "arrival")
    return (
      <>
        <h1>
          A place to begin.
          <br />
          <em>Room to become.</em>
        </h1>
        <p>
          We are a nonprofit education concept dedicated to curating
          high-quality, free AI courses, practical projects, and responsible
          guidance for students everywhere.
        </p>
        <Link className="mission-cta" to="/mentorship">
          Find Mentor <ArrowUpRight size={18} />
        </Link>
      </>
    );
  if (chapter.id === "central")
    return (
      <>
        <h2>
          Universal Access
          <br />
          to <em>AI Education.</em>
        </h2>
        <p>
          Our guided approach gives every student, regardless of background, a
          clear and responsible way to learn, build, and grow with AI.
        </p>
        <div className="mission-sequence">
          Learn <ArrowRight /> Build <ArrowRight /> Share
        </div>
        <dl className="mission-reading-stats">
          {[
            ["500+", "Students Helped"],
            ["15+", "Active Students"],
            ["50+", "Resources"],
            ["8", "Learning Paths"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt>{value}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </>
    );
  if (chapter.to)
    return (
      <>
        <h2>{chapter.title}</h2>
        <p>{chapter.copy}</p>
        <Link className="mission-cta" to={chapter.to}>
          {chapter.cta} <ArrowUpRight size={18} />
        </Link>
      </>
    );
  if (chapter.id === "human")
    return (
      <>
        <h2>
          Students need more
          <br />
          than access to
          <br />
          <em>powerful tools.</em>
        </h2>
        <p>
          AI is becoming part of every field, but clear and responsible
          education remains uneven. FutureWithAI creates a simple path forward:
          learn foundational ideas, build something real, examine how it can
          fail, and share what you discovered.
        </p>
        <span className="mission-human-note">AI exists to empower people.</span>
      </>
    );
  if (chapter.id === "commit")
    return (
      <>
        <h2>
          Open by design.
          <br />
          <em>Human by nature.</em>
        </h2>
        <ol className="mission-promises">
          {commitments.map(([title, copy]) => (
            <li key={title}>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mission-social">
          <p>Learn with us beyond the site.</p>
          <a
            href="https://www.tiktok.com/@futurewithai.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok <span>@futurewithai.dev</span> ↗
          </a>
          <a
            href="https://www.instagram.com/futurewithai.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram <span>@futurewithai.dev</span> ↗
          </a>
        </div>
      </>
    );
  return (
    <>
      <h2 className="mission-sr-only">A future we build together</h2>
      <blockquote>
        “The real power of AI is not in replacing people, but in helping more
        people see what they are capable of creating.”
      </blockquote>
      <p className="mission-attribution">
        Alex Santora <span>Founder and Lead Mentor</span>
      </p>
      <div className="mission-signoff">
        FutureWithAI <span>Learn. Build. Share.</span>
      </div>
      <footer className="mission-footer">
        <Link to="/courses">
          Start learning <ArrowUpRight size={14} />
        </Link>
        <Link to="/mentorship">Volunteer</Link>
        <Link to="/acknowledgments">Acknowledgments</Link>
        <a
          href="https://venmo.com/u/alexsantora10"
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate
        </a>
        <small>© 2026 FutureWithAI Foundation.</small>
        <small className="mission-map-credit">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a></small>
      </footer>
    </>
  );
}

export default function MissionPage() {
  const root = useRef(null),
    rail = useRef(null);
  const journey = useRef({ target: 0, progress: 0, hover: false });
  const [chapter, setChapter] = useState(0),
    [menu, setMenu] = useState(false),
    [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [reading, setReading] = useState(() =>
    Boolean(
      navigator.connection?.saveData ||
        (navigator.deviceMemory && navigator.deviceMemory < 4),
    ),
  );
  const [failed, setFailed] = useState(false);
  const [shortViewport, setShortViewport] = useState(() => matchMedia("(max-height: 559px), (max-width: 700px) and (max-height: 679px)").matches);
  const simplified = reduced || reading || failed || shortViewport;
  const onFailure = useCallback(() => setFailed(true), []);
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const title = document.title;
    document.title = "Our Mission — Free AI Education | FutureWithAI";
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-height: 559px), (max-width: 700px) and (max-height: 679px)");
    const changed = () => setReduced(media.matches);
    const resized = () => setShortViewport(compact.matches);
    media.addEventListener("change", changed);
    compact.addEventListener("change", resized);
    return () => {
      document.title = title;
      media.removeEventListener("change", changed);
      compact.removeEventListener("change", resized);
    };
  }, []);
  useEffect(() => {
    if (simplified) return;
    let frame,
      previous = 0,
      currentChapter = -1,
      height = 1,
      offset = 0;
    const measure = () => {
      // A queued resize can arrive after React detaches the route's DOM.
      if (!rail.current) return;
      height = Math.max(1, rail.current.offsetHeight - window.innerHeight);
      offset = rail.current.offsetTop;
    };
    const scroll = () => {
      journey.current.target = Math.max(
        0,
        Math.min(1, (window.scrollY - offset) / height),
      );
    };
    const resize = () => {
      measure();
      scroll();
    };
    measure();
    scroll();
    const observer = new ResizeObserver(resize);
    observer.observe(rail.current);
    const panels = [...root.current.querySelectorAll(".mission-chapter")];
    function update(now) {
      if (document.hidden) return;
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0.016;
      previous = now;
      const state = journey.current;
      state.progress +=
        (state.target - state.progress) * (1 - Math.exp(-dt * 6));
      if (Math.abs(state.target - state.progress) < 0.00005)
        state.progress = state.target;
      const nextChapter = chapterAt(state.progress);
      state.chapter = chapters[nextChapter].id;
      if (nextChapter !== currentChapter) {
        currentChapter = nextChapter;
        setChapter(nextChapter);
      }
      panels.forEach((panel, i) => {
        const start = chapters[i].start;
        const end = chapters[i + 1]?.start ?? 1.1;
        const smooth = (v) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
        const enter = i === 0 ? 1 : smooth((state.progress - start) / 0.018);
        const leave = smooth((end - state.progress) / 0.018);
        const visibility = Math.min(enter, leave);
        panel.style.setProperty("--reveal", visibility);
        panel.style.setProperty("--lift", `${(1 - visibility) * 15}px`);
      });
      frame = requestAnimationFrame(update);
    }
    const visibility = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!document.hidden) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [simplified]);
  useEffect(() => {
    if (!menu) return;
    const escape = (event) => {
      if (event.key === "Escape") {
        setMenu(false);
        root.current.querySelector(".mission-menu-button").focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menu]);
  const go = (index) => {
    if (simplified) {
      document
        .getElementById(`mission-${chapters[index].id}`)
        ?.scrollIntoView({ behavior: "instant" });
      return;
    }
    const distance = rail.current.offsetHeight - innerHeight;
    window.scrollTo({
      top: rail.current.offsetTop + chapters[index].stop * distance,
      behavior: "instant",
    });
  };
  const toggleReading = () => {
    const next = !reading;
    setReading(next);
    requestAnimationFrame(() => {
      if (next)
        document
          .getElementById(`mission-${chapters[chapter].id}`)
          ?.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
  };
  return (
    <div
      className={`mission ${simplified ? "mission--reading" : "mission--cinematic"} ${ready ? "mission--ready" : ""}`}
      ref={root}
      data-chapter={chapters[chapter].id}
    >
      <a
        className="mission-skip"
        href="#mission-arrival"
        onClick={(event) => { event.preventDefault(); setReading(true); requestAnimationFrame(() => document.getElementById("mission-arrival")?.focus()); }}
      >
        Read the mission
      </a>
      <header className="mission-nav" data-site-intro="header">
        <Link
          to="/"
          className="mission-brand"
          aria-label="FutureWithAI home"
          onClick={() => go(0)}
        >
          <img
            src={brandLogo}
            alt="FutureWithAI"
            width="837"
            height="298"
          />
        </Link>
        <nav className="mission-nav-links" aria-label="Primary navigation">
          {links.slice(0, 4).map(([label, to]) => (
            <Link
              key={to}
              to={to}
              onClick={() => { if (to === "/") go(0); }}
              aria-current={to === "/" ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="mission-menu-button"
          aria-expanded={menu}
          aria-controls="mission-menu"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X size={18} /> : <Menu size={18} />}
          <span>{menu ? "Close" : "Menu"}</span>
        </button>
        {menu && (
          <nav
            className="mission-menu"
            id="mission-menu"
            aria-label="All pages"
          >
            {links.map(([label, to]) => (
              <Link key={to} to={to} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mission-rail" ref={rail}>
        <div className="mission-stage">
          <div className="mission-atmosphere" aria-hidden="true" />
          <CityBackdrop />
          {!reading && !failed && (
            <SceneBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <MissionScene
                  journey={journey}
                  onReady={onReady}
                  onFailure={onFailure}
                  still={reduced || shortViewport}
                />
              </Suspense>
            </SceneBoundary>
          )}
          <div className="mission-scrim" aria-hidden="true" />
          <div className="mission-story">
            {chapters.map((item, i) => (
              <section
                key={item.id}
                id={`mission-${item.id}`}
                className={`mission-chapter mission-chapter--${item.id}`}
                tabIndex={-1}
                data-active={simplified || i === chapter}
                inert={!simplified && i !== chapter ? true : undefined}
                aria-hidden={!simplified && i !== chapter ? true : undefined}
                style={simplified ? undefined : { "--reveal": i === 0 ? 1 : 0 }}
                aria-labelledby={`mission-title-${item.id}`}
              >
                <div
                  className="mission-eyebrow"
                  id={`mission-title-${item.id}`}
                >
                  {item.eyebrow}
                </div>
                <ChapterContent chapter={item} />
              </section>
            ))}
          </div>
        </div>
      </main>
      <div className="mission-controls">
        <div className="mission-controls-top">
          <span className="mission-scroll-hint">
            {chapter === 7 ? (
              "A future we build together"
            ) : (
              <>
                <ArrowDown size={14} />
                <span>
                  Scroll to{" "}
                  {chapter === 0 ? "enter the city" : "continue the journey"}
                </span>
              </>
            )}
          </span>
          {!reduced && !failed && !shortViewport && (
            <button onClick={toggleReading} className="mission-mode">
              {reading ? <Play size={13} /> : <Pause size={13} />}{" "}
              {reading ? "Explore the city" : "Reading view"}
            </button>
          )}
          {(reduced || failed || shortViewport) && (
            <span className="mission-mode">Reading view</span>
          )}
        </div>
      </div>
    </div>
  );
}
