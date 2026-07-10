import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  FileCode2,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  LockKeyhole,
  Mail,
  Menu,
  Network,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { courses, orgs } from "./data";
import brandLogo from "./logos/brand-trim.png";
import elementsOfAiProviderLogo from "./logos/eoai.png";
import michiganLogo from "./logos/Michigan.png";
import founderPhoto from "./pfp/me.jpeg";
import noahPhoto from "./pfp/noah.png";
import jakePhoto from "./pfp/jf.png";
const nav = [
  ["Mission", "/"],
  ["Courses", "/courses"],
  ["Projects", "/projects"],
  ["Mentorship", "/mentorship"],
  ["Acknowledgments", "/acknowledgments"],
];
const primaryNav = nav.filter(([name]) => name !== "Acknowledgments");
const acknowledgmentNav = nav.find(([name]) => name === "Acknowledgments");
function Logo() {
  return (
    <Link className="logo" to="/">
      <img src={brandLogo} alt="EmpowerAI" />
    </Link>
  );
}
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <div className="nav shell">
        <Logo />
        <nav className="primaryNav" aria-label="Primary navigation">
          {primaryNav.map(([n, p]) => (
            <NavLink key={n} to={p}>
              {n}
            </NavLink>
          ))}
        </nav>
        {acknowledgmentNav && (
          <NavLink className="ackNavLink" to={acknowledgmentNav[1]}>
            {acknowledgmentNav[0]}
          </NavLink>
        )}
        <button
          className="menu"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mobileNav">
          {nav.map(([n, p]) => (
            <NavLink onClick={() => setOpen(false)} key={n} to={p}>
              {n}
              <ArrowRight />
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <div className="shell footer">
        <Logo />
        <div className="footerLinks">
          <Link to="/mentorship">Volunteer</Link>
          <Link to="/acknowledgments">Acknowledgments</Link>
          <Link to="/">Mission</Link>
        </div>
        <p>Copyright 2026 EmpowerAI Foundation. </p>
      </div>
    </footer>
  );
}
function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
function Button({ to, children, secondary = false }) {
  return (
    <Link className={"button " + (secondary ? "secondary" : "")} to={to}>
      {children}
      <ArrowRight />
    </Link>
  );
}
function PageHero({ eyebrow, title, copy }) {
  return (
    <section className="pageHero">
      <div className="shell">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}
function NeuralVisual() {
  return (
    <div className="heroVisual" aria-label="Abstract AI learning network">
      <div className="orb">
        <BrainCircuit />
        <span>
          LEARN
          <br />
          BUILD
          <br />
          SHARE
        </span>
      </div>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <i className={"node n" + i} key={i} />
      ))}
      <div className="miniCard one">
        <BookOpen />
        <span>
          <small>LEARNING PATH</small>
          <b>AI Foundations</b>
        </span>
      </div>
      <div className="miniCard two">
        <Code2 />
        <span>
          <small>PROJECT</small>
          <b>Study Assistant</b>
        </span>
      </div>
    </div>
  );
}
function CountUpMetric({ value, suffix = "", label }) {
  const [node, setNode] = useState(null),
    [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!node) return;
    let frame;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const started = performance.now(),
          duration = 1200;
        const animate = (now) => {
          const progress = Math.min((now - started) / duration, 1),
            eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        observer.unobserve(node);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [node, value]);
  return (
    <div ref={setNode}>
      <b>
        {display}
        {suffix}
      </b>
      <span>{label}</span>
    </div>
  );
}
const providerDomains = {
  "University of Helsinki / MinnaLearn": "helsinki.fi",
  "OpenAI Academy": "openai.com",
  "IBM SkillsBuild": "ibm.com",
  NVIDIA: "nvidia.com",
  Microsoft: "microsoft.com",
  "Harvard / edX": "harvard.edu",
  "Google Developers": "google.com",
  "Google Skills": "google.com",
  "Kaggle Learn": "kaggle.com",
  "Hugging Face": "huggingface.co",
  "Stanford University": "stanford.edu",
  "Stanford Engineering Everywhere": "stanford.edu",
  "MIT Open Learning Library": "mit.edu",
  MIT: "mit.edu",
  "The Full Stack": "fullstackdeeplearning.com",
  Anthropic: "anthropic.com",
  "UC Berkeley": "berkeley.edu",
  "DataTalks.Club": "datatalks.club",
  "Made With ML / Anyscale": "madewithml.com",
  PyTorch: "pytorch.org",
  "Khan Academy": "khanacademy.org",
  "MIT OpenCourseWare": "mit.edu",
  "University of Michigan / PY4E": "py4e.com",
  "The Odin Project": "theodinproject.com",
  freeCodeCamp: "freecodecamp.org",
  "MDN Web Docs": "developer.mozilla.org",
};
const providerFallbackIcons = {
  "fast.ai": Code2,
  "The Full Stack": FileCode2,
  "DataTalks.Club": Users,
  "Made With ML / Anyscale": Network,
};
const providerLogos = {
  "University of Helsinki / MinnaLearn": elementsOfAiProviderLogo,
  "University of Michigan / PY4E": michiganLogo,
};
function ProviderProfile({ name, index }) {
  const domain =
      providerDomains[name] ||
      name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
    logo =
      providerLogos[name] ||
      `https://www.google.com/s2/favicons?domain_url=https://${domain}&sz=128`,
    FallbackIcon = providerFallbackIcons[name] || BookOpen,
    isIconOnly = name === "fast.ai";
  return (
    <div className={"providerProfile tone" + (index % 6)}>
      <i />
      <i />
      <div
        className={"providerLogo " + (isIconOnly ? "simpleProviderIcon" : "")}
      >
        <span>
          <FallbackIcon aria-hidden="true" />
        </span>
        {!isIconOnly && (
          <img
            src={logo}
            alt={`${name} logo`}
            loading="lazy"
            onError={(e) => e.currentTarget.remove()}
          />
        )}
      </div>
      <small>COURSE PROVIDER</small>
      <b>{name}</b>
    </div>
  );
}
function Home() {
  return (
    <Layout>
      <section className="homeHero">
        <div className="shell heroGrid">
          <div>
            <span className="pill">100% Free Forever</span>
            <h1>
              Universal Access to <em>AI Education.</em>
            </h1>
            <p>
              We are a nonprofit education concept dedicated to curating
              high-quality, free AI courses, practical projects, and responsible
              guidance for students everywhere.
            </p>
            <div className="buttons">
              <Button secondary to="/mentorship">
                Find Mentor
              </Button>
            </div>
          </div>
          <NeuralVisual />
        </div>
      </section>
      <section className="stats">
        <div className="shell">
          {[
            [500, "+", "Students Helped"],
            [15, "+", "Active Students"],
            [50, "+", "Resources"],
            [8, "", "Learning Paths"],
          ].map(([value, suffix, label]) => (
            <CountUpMetric
              key={label}
              value={value}
              suffix={suffix}
              label={label}
            />
          ))}
        </div>
      </section>
      <section className="homeMission" id="mission">
        <div className="shell">
          <h2>
            Empowering the Next Generation
            <br />
            of AI Builders
          </h2>
          <p className="intro">
            Our guided approach gives every student, regardless of background, a
            clear and responsible way to learn, build, and grow with AI.
          </p>
          <div className="featureGrid">
            {[
              [
                BookOpen,
                "Open Source AI Learning Paths",
                "Trusted free courses organized into approachable learning paths.",
                "/courses",
              ],
              [
                Code2,
                "Project-Based Learning",
                "Real builds that turn concepts into portfolio-ready work.",
                "/projects",
              ],
              [
                HeartHandshake,
                "Volunteer Mentorship",
                "Future guidance from people who remember what starting felt like.",
                "/mentorship",
              ],
            ].map(([Icon, t, c, l]) => (
              <Link to={l} key={t}>
                <Icon />
                <h3>{t}</h3>
                <p>{c}</p>
                <span>
                  Explore Now <ArrowUpRight />
                </span>
              </Link>
            ))}
          </div>
          <div className="missionStatement">
            <span>WHY NOW</span>
            <h2>Students need more than access to powerful tools.</h2>
            <p>
              AI is becoming part of every field, but clear and responsible
              education remains uneven. EmpowerAI creates a simple path forward:
              learn foundational ideas, build something real, examine how it can
              fail, and share what you discovered.
            </p>
          </div>
        </div>
      </section>
      <section className="commit">
        <div className="shell commitGrid">
          <div>
            <span>OUR COMMITMENT</span>
            <h2>Equitable, responsible AI education.</h2>
            <ul>
              {[
                "100% free curriculum for everyone",
                "Inclusive learning for curious minds",
                "Responsible use in every path",
                "Open and transparent resources",
              ].map((x) => (
                <li key={x}>
                  <Check />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="videoPlaceholder" aria-label="YouTube video placeholder">
            <div className="videoPlay" aria-hidden="true">
              <span />
            </div>
            <div>
              <span>YOUTUBE VIDEO</span>
              <b>Video coming soon</b>
            </div>
          </div>
        </div>
      </section>
      <section className="founderQuote">
        <div className="shell">
          <Sparkles />
          <blockquote>
            &ldquo;The real power of AI is not in replacing people, but in helping more people see what they are capable of creating.&rdquo;
          </blockquote>
          <p>Alex Santora &mdash; Founder and Lead Mentor</p>
        </div>
      </section>
    </Layout>
  );
}
function Mission() {
  return (
    <Layout>
      <PageHero
        eyebrow="Our Mission"
        title="AI education should be open to everyone."
        copy="EmpowerAI exists to remove the guesswork, cost, and intimidation from learning artificial intelligence."
      />
      <section className="content">
        <div className="shell narrow">
          <div className="story">
            <span>WHY NOW</span>
            <h2>Students need more than access to powerful tools.</h2>
            <p>
              AI is becoming part of every field, but access to clear and
              responsible education remains uneven. A search box can surface
              thousands of tutorials. It cannot tell a learner what matters
              first, whether a source is trustworthy, or how to turn information
              into genuine understanding.
            </p>
            <p>
              EmpowerAI creates a simple path forward: learn foundational ideas,
              build something real, examine how it can fail, and share what you
              discovered.
            </p>
          </div>
          <div className="values">
            {[
              [
                "01",
                "Access",
                "No tuition, subscriptions, or hidden prerequisites.",
              ],
              [
                "02",
                "Practice",
                "Projects are part of learning, not an afterthought.",
              ],
              [
                "03",
                "Responsibility",
                "Verification, privacy, and fairness belong in every course.",
              ],
              [
                "04",
                "Community",
                "Learning becomes more durable when people help one another.",
              ],
            ].map(([n, t, c]) => (
              <article key={t}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{c}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Cta
        title="Start with a learning path"
        copy="Choose the place that matches your experience and begin with a trusted free resource."
        to="/courses"
        label="Explore Courses"
      />
    </Layout>
  );
}
const courseCategories = [
  "AI Literacy",
  "Math Foundations",
  "Programming",
  "Beginner AI Builder",
  "Machine Learning",
  "Deep Learning",
  "Generative AI & LLMs",
  "Responsible AI",
];
const responsibleTopics = [
  [
    Bot,
    "Hallucinations",
    "AI can produce confident answers that are unsupported, outdated, or false. Treat important claims as drafts until you verify them with reliable evidence.",
    "Practice: trace claims back to trusted sources before using them.",
  ],
  [
    Network,
    "Bias and Fairness",
    "Training data, product choices, and the setting where AI is used can all create unfair outcomes. Responsible builders look for who benefits, who is missed, and who may be harmed.",
    "Practice: test outputs across different people, contexts, and examples.",
  ],
  [
    LockKeyhole,
    "Privacy and Security",
    "Students should avoid exposing personal, private, or sensitive information to tools that are not safe for that data. Remove details that could identify someone before sharing examples.",
    "Practice: redact names, IDs, records, and sensitive details first.",
  ],
  [
    Lightbulb,
    "Academic Integrity",
    "AI can be a thinking partner, tutor, or reviewer, but it should not replace your own understanding. The final reasoning and work should still be yours.",
    "Practice: ask for guidance, then explain and complete the work yourself.",
  ],
];
const responsibleChecklist = [
  "Is the answer supported by reliable evidence?",
  "Could the model be making something up?",
  "Is there missing context or uncertainty?",
  "Could this advice harm someone if it is wrong?",
  "Does the output reveal private or sensitive information?",
  "Is the result fair across different people and groups?",
  "Am I using AI to support my work, or replace it?",
];
const responsibleScenarios = [
  [
    "Using AI for homework",
    "AI can explain concepts and help debug, but students should still understand and write their own final answers.",
    "Ask AI to teach the concept, then solve the problem yourself.",
  ],
  [
    "Using AI for research",
    "AI can summarize and brainstorm, but it may invent sources or misrepresent studies.",
    "Verify every citation and read the original source before using it.",
  ],
  [
    "Building an AI project",
    "Models can perform well in demos but fail for certain users or edge cases.",
    "Test on diverse examples and document limitations clearly.",
  ],
  [
    "Sharing data with AI tools",
    "Private information, school records, medical details, and personal identifiers should not be pasted into unsafe tools.",
    "Remove sensitive details before using AI.",
  ],
];
function Courses() {
  const [activeCategory, setActiveCategory] = useState(courseCategories[0]);

  return (
    <Layout>
      <PageHero
        eyebrow="Free Curriculum"
        title="AI, Math, and Programming Learning Paths"
        copy="A carefully organized curriculum built from free courses by trusted universities, companies, and open-source educators."
      />
      <section className="content">
        <div className="shell">
          <div className="filterTabs" aria-label="Course categories">
            {courseCategories.map((category) => (
              <button
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="courseGroups">
            {courseCategories
              .filter((category) => category === activeCategory)
              .map((category) => {
              const categoryCourses = courses.filter(
                (course) => course.category === category,
              );

              return (
                <section className="contentGroup" key={category}>
                  <div className="groupHeading">
                    <span>LEARNING PATH</span>
                    <h2>{category}</h2>
                    <p>
                      {categoryCourses.length}{" "}
                      {categoryCourses.length === 1
                        ? "free resource"
                        : "free resources"}
                    </p>
                  </div>
                  {category === "Responsible AI" && (
                    <section className="responsibleCourseIntro">
                      <div className="responsibleHeroHeader">
                        <span>RESPONSIBLE AI ESSENTIALS</span>
                        <h2>Build AI that is useful, honest, fair, and safe.</h2>
                        <p>
                          Responsible AI is not a separate topic students visit
                          once. It is a habit to practice while using, building,
                          and evaluating AI systems: question outputs, protect
                          people, and make limitations visible.
                        </p>
                      </div>
                      <div className="responsibleTopicGrid">
                        {responsibleTopics.map(([Icon, title, copy, practice]) => (
                          <article key={title}>
                            <span className="topicIcon">
                              <Icon />
                            </span>
                            <h3>{title}</h3>
                            <p>{copy}</p>
                            <small>{practice}</small>
                          </article>
                        ))}
                      </div>
                      <section className="responsibleChecklist">
                        <div>
                          <span>OUTPUT REVIEW</span>
                          <h3>Before you trust an AI output, ask:</h3>
                        </div>
                        <div className="checklistRows">
                          {responsibleChecklist.map((item, index) => (
                            <div key={item}>
                              <span>{String(index + 1).padStart(2, "0")}</span>
                              <p>{item}</p>
                              <CheckCircle2 />
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="studentScenarios">
                        <div className="responsibleSectionHeading">
                          <span>REAL STUDENT SCENARIOS</span>
                          <h3>Responsible AI in real student situations</h3>
                        </div>
                        <div className="scenarioGrid">
                          {responsibleScenarios.map(
                            ([title, description, approach]) => (
                              <article key={title}>
                                <h4>{title}</h4>
                                <p>{description}</p>
                                <div>
                                  <span>Better approach</span>
                                  <b>{approach}</b>
                                </div>
                              </article>
                            ),
                          )}
                        </div>
                      </section>
                    </section>
                  )}
                  <div className="courseList">
                    {categoryCourses.map((course) => {
                      const courseIndex = courses.indexOf(course);

                      return (
                        <article key={course.title}>
                          <div className="courseThumb">
                            <span className="courseNumber">
                              {String(courseIndex + 1).padStart(2, "0")}
                            </span>
                            <ProviderProfile
                              name={course.provider}
                              index={courseIndex}
                            />
                          </div>
                          <div className="courseBody">
                            <span className="category">{course.category}</span>
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            {course.labels && (
                              <div className="courseTags">
                                {course.labels.map((label) => (
                                  <span key={label}>{label}</span>
                                ))}
                              </div>
                            )}
                            {course.learn && (
                              <div className="courseLearning">
                                <b>You will learn</b>
                                <ul>
                                  {course.learn.map((item) => (
                                    <li key={item}>
                                      <Check />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {course.bestFor && (
                              <p className="bestFor">
                                <b>Best for:</b> {course.bestFor}
                              </p>
                            )}
                            <div className="courseFacts">
                              <div>
                                <small>PROVIDER</small>
                                <b>{course.provider}</b>
                              </div>
                              <div>
                                <small>COURSE LEVEL</small>
                                <b>{course.level}</b>
                              </div>
                              <div>
                                <small>ACCESS</small>
                                <b>{course.tag}</b>
                              </div>
                            </div>
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open Course <ArrowUpRight />
                            </a>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
const PROJECT_BACKEND_URL = "https://empower-ai-six.vercel.app/api/generate-project";
const skillLevels = ["Beginner", "Intermediate", "Advanced"];
const projectInterests = [
  "Sports",
  "Healthcare",
  "Education",
  "Finance",
  "Games",
  "Productivity",
  "Robotics/Hardware",
  "Social Good",
  "Creative Tools",
  "Other",
];
const preferredTools = [
  "Python",
  "JavaScript",
  "React",
  "APIs",
  "Machine Learning",
  "No-Code",
  "Hardware",
  "Data Analysis",
  "No Preference",
];
const timeCommitments = [
  "Weekend Project",
  "1 Week",
  "2-4 Weeks",
  "Long-Term Project",
];
const emptyProjectResult = {
  title: "",
  description: "",
  difficulty: "",
  tools: "",
  skills: "",
  plan: [],
  extensions: "",
  resources: "",
  portfolio: "",
};
const fallbackProjects = {
  Sports: {
    title: "Game Moment Highlight Classifier",
    description:
      "Build a simple tool that tags short sports clips or play descriptions as exciting moments, defensive stops, or scoring chances.",
    tools: "Python, Google Colab, scikit-learn, pandas, YouTube captions or public play-by-play data",
    skills: "Text classification, dataset cleanup, model evaluation, responsible labeling",
    extensions:
      "Add a React dashboard, compare teams, or include player-specific trend charts.",
    resources:
      "Search: Kaggle sports datasets, scikit-learn text classification, pandas basics",
    portfolio:
      "Shows you can turn messy sports data into an AI-powered scouting or media workflow.",
  },
  Healthcare: {
    title: "Symptom Journal Pattern Finder",
    description:
      "Create a privacy-first journal analyzer that helps users spot repeated symptom, sleep, mood, or habit patterns without giving medical advice.",
    tools: "Python, Streamlit, pandas, rule-based NLP, optional Gemini backend",
    skills: "Data privacy, text processing, visualization, careful health disclaimers",
    extensions:
      "Add exportable reports, wearable CSV imports, or trend alerts for user review.",
    resources:
      "Search: Streamlit tutorial, pandas time series, health data privacy basics",
    portfolio:
      "Highlights responsible AI design in a sensitive domain with clear safety boundaries.",
  },
  Education: {
    title: "Personal Study Coach",
    description:
      "Make a study planner that turns class topics into review tasks, flashcard prompts, and a weekly practice schedule.",
    tools: "React, JavaScript, APIs, local storage, optional Gemini backend",
    skills: "Prompt design, learning science, UI state management, study workflow design",
    extensions:
      "Add spaced repetition, quiz scoring, or course-specific resource recommendations.",
    resources:
      "Search: active recall, spaced repetition, React form state, flashcard app tutorial",
    portfolio:
      "Demonstrates product thinking and practical AI support for student learning.",
  },
  Finance: {
    title: "Budget Habit Explainer",
    description:
      "Build a dashboard that groups sample spending into categories and explains weekly budget patterns in plain language.",
    tools: "Python, pandas, Plotly, CSV files, optional React frontend",
    skills: "Data analysis, charts, categorization, financial literacy communication",
    extensions:
      "Add savings goals, anomaly flags, or a no-login demo with synthetic data.",
    resources:
      "Search: pandas groupby, Plotly dashboard, personal finance dataset Kaggle",
    portfolio:
      "Shows you can make data understandable and useful without handling real bank credentials.",
  },
  Games: {
    title: "AI Game Strategy Advisor",
    description:
      "Create a small game helper that observes match stats or board states and recommends the next move or strategy.",
    tools: "JavaScript, React, simple heuristics, optional machine learning",
    skills: "Game logic, recommendation systems, state modeling, UX for feedback",
    extensions:
      "Add difficulty modes, saved match history, or compare human and AI choices.",
    resources:
      "Search: minimax tutorial, JavaScript game state, React game tutorial",
    portfolio:
      "Frames AI as a clear decision assistant with visible reasoning and constraints.",
  },
  Productivity: {
    title: "Smart Task Prioritizer",
    description:
      "Build a planner that ranks tasks by urgency, effort, deadline, and user energy, then suggests a realistic work block.",
    tools: "React, JavaScript, local storage, optional Gemini backend",
    skills: "Ranking logic, form design, prompt safety, productivity workflow design",
    extensions:
      "Add calendar export, recurring tasks, or a reflection summary at the end of the day.",
    resources:
      "Search: Eisenhower matrix, React local storage, task prioritization algorithms",
    portfolio:
      "Shows you can create a focused assistant that helps users make better daily decisions.",
  },
  "Robotics/Hardware": {
    title: "Desk Sensor Anomaly Monitor",
    description:
      "Use sensor readings or simulated hardware data to detect unusual temperature, light, motion, or distance patterns.",
    tools: "Arduino or Raspberry Pi, Python, CSV logging, simple anomaly detection",
    skills: "Hardware data collection, thresholds, visualization, edge AI basics",
    extensions:
      "Add a live dashboard, alerts, or run the model on-device with tinyML examples.",
    resources:
      "Search: Arduino CSV logging, Raspberry Pi sensor tutorial, anomaly detection Python",
    portfolio:
      "Connects AI concepts to real-world signals and hardware constraints.",
  },
  "Social Good": {
    title: "Community Resource Matcher",
    description:
      "Create a tool that matches student needs to free local or online resources using tags, filters, and plain-language summaries.",
    tools: "React, JavaScript, Airtable or JSON, optional Gemini backend",
    skills: "Information retrieval, accessibility, categorization, civic product design",
    extensions:
      "Add multilingual summaries, map filters, or volunteer-maintained resource submissions.",
    resources:
      "Search: accessible web forms, JSON search filters, community resource directory design",
    portfolio:
      "Shows mission-driven AI design that improves access without overcomplicating the product.",
  },
  "Creative Tools": {
    title: "Creative Prompt Remix Studio",
    description:
      "Build a tool that helps artists remix an idea into styles, constraints, mood boards, and project briefs.",
    tools: "React, JavaScript, prompt templates, optional Gemini backend",
    skills: "Creative prompting, interface design, structured output, iteration workflows",
    extensions:
      "Add saved collections, random constraints, or exportable creative briefs.",
    resources:
      "Search: prompt engineering basics, React textarea UX, creative brief examples",
    portfolio:
      "Demonstrates how AI can support creative direction while keeping the human in control.",
  },
  Other: {
    title: "Personal AI Field Guide",
    description:
      "Build a guided explorer that helps a learner compare AI uses in a field they care about, with project ideas and responsible-use notes.",
    tools: "React, JavaScript, public resources, optional Gemini backend",
    skills: "Research, curation, prompt design, responsible AI documentation",
    extensions:
      "Add saved fields, checklists, or a shareable one-page project roadmap.",
    resources:
      "Search: AI use cases by industry, responsible AI checklist, React cards tutorial",
    portfolio:
      "Shows curiosity, communication skill, and the ability to make AI approachable for a specific audience.",
  },
};
function normalizeGeneratedLines(value) {
  if (!value) return [];
  return String(value)
    .split(/\n|;|\u2022/)
    .map((item) => item.replace(/^\s*(?:\d+\.|-)\s*/, "").trim())
    .filter(Boolean);
}
function parseProjectIdea(text) {
  const fields = {
    "Project Title": "title",
    "Short Description": "description",
    Difficulty: "difficulty",
    "Recommended Tools/Libraries": "tools",
    "Skills Learned": "skills",
    "Step-by-Step Build Plan": "plan",
    "Possible Extensions": "extensions",
    "Free Learning Resources/Search Terms": "resources",
    "Portfolio/Resume Angle": "portfolio",
  };
  const result = { ...emptyProjectResult };
  let activeKey = null;

  String(text || "")
    .split("\n")
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const matchedLabel = Object.keys(fields).find(
        (label) => trimmed === `${label}:` || trimmed.startsWith(`${label}:`),
      );

      if (matchedLabel) {
        activeKey = fields[matchedLabel];
        const value = trimmed.slice(matchedLabel.length + 1).trim();
        if (value) {
          if (activeKey === "plan") {
            result.plan.push(value.replace(/^\d+\.\s*/, ""));
          } else {
            result[activeKey] = value;
          }
        }
        return;
      }

      if (activeKey === "plan") {
        result.plan.push(trimmed.replace(/^\d+\.\s*/, ""));
      } else if (activeKey) {
        result[activeKey] = result[activeKey]
          ? `${result[activeKey]} ${trimmed}`
          : trimmed;
      }
    });

  return {
    ...result,
    title: result.title || "Custom AI Project Idea",
    description:
      result.description ||
      "A personalized AI project idea built from your survey answers.",
    plan: result.plan.length ? result.plan.slice(0, 6) : [],
  };
}
function buildFallbackProject(profile, detail = "") {
  const base = fallbackProjects[profile.interest] || fallbackProjects.Other;
  const tools =
    profile.tools.includes("No Preference") || profile.tools.length === 0
      ? base.tools
      : `${profile.tools.join(", ")}. Helpful free additions: ${base.tools}`;
  const detailSuffix = detail ? ` (${detail})` : "";

  return {
    source: "fallback",
    message:
      `The AI generator is busy right now, so here's a recommended project idea based on your answers${detailSuffix}.`,
    title: base.title,
    description:
      profile.extraDetails.length > 0
        ? `${base.description} Shape the demo around: ${profile.extraDetails}`
        : base.description,
    difficulty: `${profile.skillLevel} friendly, scoped for ${profile.timeCommitment}`,
    tools,
    skills: base.skills,
    plan: [
      "Define the user problem and write one success metric for the project.",
      "Collect or create a small free dataset that fits the selected topic.",
      "Build the first version with simple rules, charts, or a baseline model.",
      "Add the AI feature and test it on examples that should and should not work.",
      "Polish the interface, document limits, and record a short demo.",
    ],
    extensions: base.extensions,
    resources: base.resources,
    portfolio: base.portfolio,
  };
}
function ProjectOptionGroup({ title, icon: Icon, options, value, onChange }) {
  return (
    <section className="surveyBlock">
      <div className="surveyBlockHeading">
        <Icon />
        <h3>{title}</h3>
      </div>
      <div className="optionGrid">
        {options.map((option) => (
          <button
            type="button"
            className={value === option ? "selected" : ""}
            onClick={() => onChange(option)}
            key={option}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
function ToolSelector({ selectedTools, onChange }) {
  const toggleTool = (tool) => {
    if (tool === "No Preference") {
      onChange(["No Preference"]);
      return;
    }

    const withoutNoPreference = selectedTools.filter(
      (selected) => selected !== "No Preference",
    );
    const nextTools = withoutNoPreference.includes(tool)
      ? withoutNoPreference.filter((selected) => selected !== tool)
      : [...withoutNoPreference, tool];

    onChange(nextTools.length ? nextTools : ["No Preference"]);
  };

  return (
    <section className="surveyBlock">
      <div className="surveyBlockHeading">
        <Code2 />
        <h3>Preferred tools</h3>
      </div>
      <div className="optionGrid toolsGrid">
        {preferredTools.map((tool) => (
          <button
            type="button"
            className={selectedTools.includes(tool) ? "selected" : ""}
            onClick={() => toggleTool(tool)}
            key={tool}
          >
            {tool}
          </button>
        ))}
      </div>
    </section>
  );
}
function ProjectResultCard({ result, onReset }) {
  if (!result) return null;
  const plan = result.plan.length
    ? result.plan
    : normalizeGeneratedLines(result.plan);

  return (
    <article className="generatedProjectCard">
      {result.message && <p className="fallbackMessage">{result.message}</p>}
      <div className="generatedHeader">
        <span>
          <Sparkles />
          Project recommendation
        </span>
        <h2>{result.title}</h2>
        <p>{result.description}</p>
      </div>
      <div className="resultMetaGrid">
        <div>
          <small>DIFFICULTY</small>
          <b>{result.difficulty}</b>
        </div>
        <div>
          <small>TOOLS</small>
          <b>{result.tools}</b>
        </div>
        <div>
          <small>SKILLS</small>
          <b>{result.skills}</b>
        </div>
      </div>
      <div className="buildPlan">
        <h3>Step-by-step build plan</h3>
        <ol>
          {plan.map((step, index) => (
            <li key={`${step}-${index}`}>{step}</li>
          ))}
        </ol>
      </div>
      <div className="resultDetailGrid">
        <section>
          <h3>Possible extensions</h3>
          <p>{result.extensions}</p>
        </section>
        <section>
          <h3>Free learning resources or search terms</h3>
          <p>{result.resources}</p>
        </section>
        <section>
          <h3>Portfolio/resume angle</h3>
          <p>{result.portfolio}</p>
        </section>
      </div>
      <button className="button secondary regenerateButton" onClick={onReset}>
        <RefreshCw />
        Generate Another Idea
      </button>
    </article>
  );
}
function Projects() {
  const [profile, setProfile] = useState({
    skillLevel: "",
    interest: "",
    tools: ["No Preference"],
    timeCommitment: "",
    extraDetails: "",
  });
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [result, setResult] = useState(null);

  const updateProfile = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setValidationMessage("");
  };

  const resetGenerator = () => {
    setResult(null);
    setValidationMessage("");
  };

  const generateProject = async () => {
    if (!profile.skillLevel || !profile.interest || !profile.timeCommitment) {
      setValidationMessage(
        "Choose a skill level, interest, and time commitment before generating.",
      );
      return;
    }

    setLoading(true);
    setValidationMessage("");

    try {
      if (PROJECT_BACKEND_URL === "REPLACE_WITH_BACKEND_URL") {
        throw new Error("Backend URL placeholder has not been replaced.");
      }

      // The Gemini API key must stay on the backend. This static frontend only calls the serverless endpoint.
      const response = await fetch(PROJECT_BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        let detail = `API returned ${response.status}`;
        try {
          const errorPayload = await response.json();
          if (errorPayload?.error) {
            detail = `${detail}: ${errorPayload.error}`;
          }
        } catch {
          // Ignore JSON parsing issues and keep the status detail.
        }
        throw new Error(detail);
      }

      const data = await response.json();
      setResult({ source: "api", ...parseProjectIdea(data.projectIdea) });
    } catch (error) {
      console.error("Project generator error:", error);
      setResult(null);
      setValidationMessage(
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHero
        eyebrow="Project Mentor"
        title="Find Your Next AI Project"
        copy="Answer a few questions and get a personalized AI project idea with tools, skills, and a build plan."
      />
      <section className="content projectGeneratorSection">
        <div className="shell projectGeneratorShell">
          <div className="mentorChatPanel">
            <div className="mentorMessage">
              <span>
                <Bot />
              </span>
              <div>
                <small>EMPOWERAI PROJECT MENTOR</small>
                <p>
                  Tell me what you want to build, and I will turn it into a
                  focused AI project plan you can actually finish.
                </p>
              </div>
            </div>
            <div className="surveyGrid">
              <ProjectOptionGroup
                title="Skill level"
                icon={GraduationCap}
                options={skillLevels}
                value={profile.skillLevel}
                onChange={(value) => updateProfile("skillLevel", value)}
              />
              <ProjectOptionGroup
                title="Area of interest"
                icon={Lightbulb}
                options={projectInterests}
                value={profile.interest}
                onChange={(value) => updateProfile("interest", value)}
              />
              <ToolSelector
                selectedTools={profile.tools}
                onChange={(value) => updateProfile("tools", value)}
              />
              <ProjectOptionGroup
                title="Time commitment"
                icon={Clock}
                options={timeCommitments}
                value={profile.timeCommitment}
                onChange={(value) => updateProfile("timeCommitment", value)}
              />
            </div>
            <label className="extraDetailsField">
              <span>Optional extra details</span>
              <textarea
                maxLength={200}
                value={profile.extraDetails}
                onChange={(event) =>
                  updateProfile("extraDetails", event.target.value)
                }
                placeholder="Example: I want something useful for my robotics club."
              />
              <small>{profile.extraDetails.length}/200 characters</small>
            </label>
            {validationMessage && (
              <p className="validationMessage">{validationMessage}</p>
            )}
            <button
              className="button generateProjectButton"
              onClick={generateProject}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="spinIcon" />
                  Generating
                </>
              ) : (
                <>
                  <Send />
                  Generate Project Idea
                </>
              )}
            </button>
          </div>
          <div className="projectResultRail">
            {loading && (
              <div className="loadingCard">
                <WandSparkles />
                <h2>Building your project brief</h2>
                <p>
                  Matching your interests, tools, timeline, and skill level into
                  one practical portfolio idea.
                </p>
              </div>
            )}
            {!loading && result && (
              <ProjectResultCard result={result} onReset={resetGenerator} />
            )}
            {!loading && !result && (
              <div className="emptyResultCard">
                <FileCode2 />
                <h2>Your custom project plan will appear here.</h2>
                <div>
                  <span>
                    <CheckCircle2 />
                    Realistic scope
                  </span>
                  <span>
                    <CheckCircle2 />
                    Free tools
                  </span>
                  <span>
                    <CheckCircle2 />
                    Portfolio-ready angle
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Cta
        title="Ready to learn the skills first?"
        copy="Every project connects back to a free learning path."
        to="/courses"
        label="Browse Learning Paths"
      />
    </Layout>
  );
}
const mentorCards = [
  {
    name: "Alex Santora",
    role: "Founder & Lead Mentor",
    school: "Stevens Institute of Technology",
    photo: founderPhoto,
    description:
      "Computer engineering and mathematics student conducting machine learning research, with deep hands-on experience building agentic AI coding agents, full-stack products, and cloud-backed systems.",
    expertise: [
      "Machine Learning Research",
      "Agentic AI Coding Agents",
      "Full-Stack Development",
      "Cloud Application Architecture",
      "Computer Engineering and Applied Math",
    ],
    email: "asantora1@stevens.edu",
    linkedin: "https://www.linkedin.com/in/alex-santora",
  },
  {
    name: "Noah Andronaco",
    role: "Mentor",
    school: "University of New Hampshire",
    photo: noahPhoto,
    description:
      "Cybersecurity student mentor with hands-on experience exploring agentic AI systems, practical security thinking, and technical problem solving.",
    expertise: [
      "Cybersecurity Fundamentals",
      "Agentic AI Workflows",
      "Prompt and Tool Design",
      "Technical Problem Solving",
      "System Reliability Mindset",
    ],
    email: "noahandranaco@gmail.com",
    linkedin: "https://www.linkedin.com/in/noah-andronaco-b8a58a333/",
  },
  {
    name: "Jake Fredericks",
    role: "Mentor",
    school: "Bentley University",
    photo: jakePhoto,
    description:
      "Fintech major with a cybersecurity minor focused on practical AI for financial analysis, data-driven decision making, and secure technology systems.",
    expertise: [
      "Python for Finance",
      "Database Design and SQL",
      "Applied Data Science",
      "AI-Driven Financial Analysis",
      "Cybersecurity-Aware AI Workflows",
    ],
    email: "jake.fredericks2@gmail.com",
    linkedin: "https://www.linkedin.com/in/jakefredericks/",
  },
];
function MentorCard({ mentor }) {
  return (
    <article className="mentorCard">
      <div className="mentorCardPhoto">
        <img src={mentor.photo} alt={mentor.name} />
      </div>
      <div className="mentorCardBody">
        <h2>{mentor.name}</h2>
        <p className="mentorMeta">
          <span>{mentor.role}</span>
          <i />
          <span>{mentor.school}</span>
        </p>
        {mentor.description && (
          <p className="mentorSummary">{mentor.description}</p>
        )}
        {mentor.expertise?.length > 0 && (
          <div className="mentorExpertise">
            <span>EXPERTISE &amp; GUIDANCE</span>
            <ul>
              {mentor.expertise.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mentorContact" aria-label={`${mentor.name} contact`}>
          <span>CONTACT</span>
          <div>
            {mentor.email ? (
              <a href={`mailto:${mentor.email}`}>
                <i>
                  <Mail />
                </i>
                <b>Email</b>
              </a>
            ) : (
              <span>
                <i>
                  <Mail />
                </i>
                <b>Email</b>
              </span>
            )}
            {mentor.linkedin ? (
              <a href={mentor.linkedin} target="_blank" rel="noreferrer">
                <i className="linkedinMark">in</i>
                <b>LinkedIn</b>
              </a>
            ) : (
              <span>
                <i className="linkedinMark">in</i>
                <b>LinkedIn</b>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
function Mentorship() {
  return (
    <Layout>
      <PageHero
        eyebrow="Human Guidance"
        title="Meet Our Volunteer Mentors"
        copy="Connect with mentors who help students learn, build, and grow with AI."
      />
      <section className="content">
        <div className="shell">
          <div className="mentorCards">
            {mentorCards.map((mentor) => (
              <MentorCard key={mentor.name} mentor={mentor} />
            ))}
          </div>
        </div>
      </section>
      <section className="mentorCta">
        <div className="shell mentorCtaShell">
          <div>
            <h2>Want to give back?</h2>
            <p>
              Become a mentor and help students feel supported as they learn,
              build, and grow with AI.
            </p>
          </div>
          <a className="button mentorCtaButton" href="mailto:asantora1@stevens.edu">
            Apply as a Mentor
            <ArrowRight />
          </a>
        </div>
      </section>
    </Layout>
  );
}
function Acknowledgments() {
  const mentorThanks = mentorCards.map((mentor) => ({
    name: mentor.name,
    role: mentor.role,
    photo: mentor.photo,
    description:
      mentor.expertise?.slice(0, 3).join(", ") ||
      "Mentorship, student guidance, and community support",
  }));
  const providerThanks = {
    "University of Helsinki / MinnaLearn":
      "Thank you for making AI literacy welcoming from the very first lesson.",
    "OpenAI Academy":
      "Thank you for helping learners explore modern AI with practical guidance.",
    "IBM SkillsBuild":
      "Thank you for opening career-ready AI learning to more students.",
    NVIDIA: "Thank you for making advanced computing ideas easier to approach.",
    Microsoft:
      "Thank you for sharing hands-on open lessons that help builders start strong.",
    "Harvard / edX":
      "Thank you for offering rigorous computer science learning at global scale.",
    "Google Developers":
      "Thank you for turning complex ML concepts into approachable resources.",
    "Kaggle Learn":
      "Thank you for making applied machine learning practice easy to begin.",
    "fast.ai":
      "Thank you for championing practical deep learning for everyday builders.",
    "Hugging Face":
      "Thank you for making the open AI ecosystem more teachable and accessible.",
    "Google Skills":
      "Thank you for creating short, useful entry points into AI topics.",
    "Stanford University":
      "Thank you for sharing world-class machine learning materials openly.",
    "MIT Open Learning Library":
      "Thank you for making rigorous technical learning available beyond the classroom.",
    MIT: "Thank you for connecting advanced ideas with clear, public teaching.",
    "The Full Stack":
      "Thank you for showing how real deep learning systems get built and shipped.",
    Anthropic:
      "Thank you for sharing prompt engineering guidance in an open, practical way.",
    "UC Berkeley":
      "Thank you for keeping foundational AI education open and challenging.",
    "DataTalks.Club":
      "Thank you for building a community-first path into machine learning.",
    "Made With ML / Anyscale":
      "Thank you for making production ML learning concrete and usable.",
    PyTorch:
      "Thank you for giving learners a clear path into modern deep learning.",
    "Khan Academy":
      "Thank you for making core math skills feel reachable to every student.",
    "MIT OpenCourseWare":
      "Thank you for setting the standard for open technical course access.",
    "Stanford Engineering Everywhere":
      "Thank you for bringing advanced engineering topics to independent learners.",
    "University of Michigan / PY4E":
      "Thank you for making Python feel friendly, useful, and worth continuing.",
    "The Odin Project":
      "Thank you for giving self-taught developers a real path into the field.",
    freeCodeCamp:
      "Thank you for helping millions learn by building and practicing in public.",
    "MDN Web Docs":
      "Thank you for making the web's foundations clear, trustworthy, and learnable.",
  };
  return (
    <Layout>
      <PageHero
        eyebrow="With Gratitude"
        title="Acknowledgments"
        copy="EmpowerAI curates learning made possible by generous educators, institutions, open-source communities, and mentors."
      />
      <section className="content acknowledgments">
        <div className="shell">
          <section className="ackSection">
            <span>COURSE PROVIDERS</span>
            <h2>Institutions making learning open</h2>
            <p>
              We gratefully recognize every organization whose free educational
              work appears in our course directory.
            </p>
            <div className="ackGrid">
              {orgs.map((org, i) => (
                <article key={org}>
                  <ProviderProfile name={org} index={i} />
                  <p>
                    {providerThanks[org] ||
                      "Thank you for helping more students learn in the open."}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="ackSection mentorThanks">
            <h2>Our Mentors</h2>
            <p>
              The dedicated mentors who help EmpowerAI students learn, build,
              and keep moving forward.
            </p>
            <div className="mentorThanksGrid">
              {mentorThanks.map(({ name, role, photo, description }) => (
                <article key={name}>
                  <img src={photo} alt={name} />
                  <h3>{name}</h3>
                  <strong>{role}</strong>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
          <p className="ackNote">
            EmpowerAI is an independent nonprofit concept. Listing a course or
            provider does not imply sponsorship, partnership, or endorsement.
            Course names and logos remain the property of their respective
            owners.
          </p>
        </div>
      </section>
    </Layout>
  );
}
function Cta({ title, copy, to, label }) {
  return (
    <section className="cta">
      <div className="shell">
        <div>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        <Button to={to}>{label}</Button>
      </div>
    </section>
  );
}
function NotFound() {
  return (
    <Layout>
      <PageHero
        eyebrow="404"
        title="This page wandered off course."
        copy="The learning path continues from the home page."
      />
      <Cta
        title="Return to EmpowerAI"
        copy="Find free courses, projects, and responsible AI guidance."
        to="/"
        label="Go Home"
      />
    </Layout>
  );
}
export default function App() {
  return (
    <BrowserRouter basename="/EmpowerAI">
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/acknowledgments" element={<Acknowledgments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
