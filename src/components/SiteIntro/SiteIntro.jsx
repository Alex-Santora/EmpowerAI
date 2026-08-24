import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion/dom";
import brandLogo from "../../logos/brand-trim.png";
import "./siteIntro.css";

export const SITE_INTRO_SESSION_KEY = "futurewithai.site-intro.v1";

// Change this one number later to tune the whole sequence.
// 0.9 is faster, 1.1 is slower.
const INTRO_SPEED = 0.97;
const at = (seconds) => seconds * INTRO_SPEED;

const easeOut = [0.16, 1, 0.3, 1];
const easeInOut = [0.65, 0, 0.35, 1];
const sliceEase = [0.76, 0, 0.24, 1];

const NETWORK_GEOMETRY = [
  {
    id: "core",
    networkPath: "M418 149 L418 195 L418 245",
    logoPath: "M128 186 L128 218 L128 251",
    networkNode: [418, 149],
    logoNode: [128, 186],
    signal: true,
  },
  {
    id: "upperLeft",
    networkPath: "M418 149 L365 108 L310 65",
    logoPath: "M113 214 L58 174 L58 151",
    networkNode: [310, 65],
    logoNode: [58, 151],
  },
  {
    id: "upperRight",
    networkPath: "M418 149 L471 108 L526 65",
    logoPath: "M143 214 L196 174 L196 151",
    networkNode: [526, 65],
    logoNode: [196, 151],
  },
  {
    id: "lowerLeft",
    networkPath: "M418 149 L356 183 L292 215",
    logoPath: "M111 227 L90 218 L69 209",
    networkNode: [292, 215],
    logoNode: [69, 209],
  },
  {
    id: "lowerRight",
    networkPath: "M418 149 L480 183 L544 215",
    logoPath: "M145 227 L165 218 L185 209",
    networkNode: [544, 215],
    logoNode: [185, 209],
  },
  {
    id: "innerLeft",
    networkPath: "M418 149 L380 158 L340 142",
    logoPath: "M119 202 L96 220 L96 247",
    networkNode: [340, 142],
    logoNode: [96, 247],
  },
  {
    id: "innerRight",
    networkPath: "M418 149 L456 158 L496 142",
    logoPath: "M137 202 L160 220 L160 247",
    networkNode: [496, 142],
    logoNode: [160, 247],
  },
  {
    id: "intelligence",
    networkPath: "M418 149 L418 94 L418 38",
    logoPath: "M128 178 L128 126 L132 89",
    networkNode: [418, 38],
    logoNode: [132, 89],
  },
];

export function shouldPlaySiteIntro() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(SITE_INTRO_SESSION_KEY) !== "1";
  } catch {
    // Storage can be unavailable in strict privacy modes. The failsafe still
    // guarantees that the intro cannot block access to the site.
    return true;
  }
}

function rememberIntro() {
  try {
    window.sessionStorage.setItem(SITE_INTRO_SESSION_KEY, "1");
  } catch {
    // The intro remains a progressive enhancement when storage is unavailable.
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function waitForFirstPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });
}

function waitForPageReadiness(root) {
  const logo = root?.querySelector(".siteIntro__brand");
  const logoReady = logo?.decode ? logo.decode().catch(() => undefined) : Promise.resolve();

  // The synchronous route is already committed beneath the overlay. Fonts are
  // intentionally not a gate: a remote font should never make the brand intro
  // hold the page hostage.
  return Promise.allSettled([waitForFirstPaint(), logoReady]);
}

function mediaMatches(query) {
  try {
    return window.matchMedia?.(query).matches ?? false;
  } catch {
    return false;
  }
}

function clearEntranceStyles(elements) {
  elements.forEach((element) => {
    if (!element) return;
    element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
    element.style.removeProperty("filter");
  });
}

function entranceStep(element, keyframes, options) {
  return element ? [[element, keyframes, options]] : [];
}

export default function SiteIntro({ active, onComplete }) {
  const [visible, setVisible] = useState(active);
  const scope = useRef(null);
  const completed = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const html = document.documentElement;

    if (!active) {
      html.classList.remove("site-intro-pending", "site-intro-running");
      setVisible(false);
      return undefined;
    }

    let cancelled = false;
    let currentAnimation;
    let entranceElements = [];

    html.classList.add("site-intro-pending", "site-intro-running");
    rememberIntro();

    const finish = () => {
      if (cancelled || completed.current) return;
      completed.current = true;
      clearEntranceStyles(entranceElements);
      html.classList.remove("site-intro-pending", "site-intro-running");
      setVisible(false);
      onCompleteRef.current?.();
    };

    // Independent of the animation promise: any library/asset/runtime failure
    // reveals the application instead of leaving an overlay behind.
    const failsafe = window.setTimeout(finish, 4200);

    const run = async () => {
      const root = scope.current;
      if (!root) {
        finish();
        return;
      }

      let header = document.querySelector('[data-site-intro="header"]');
      let eyebrow = document.querySelector('[data-site-intro="eyebrow"]');
      let headline = document.querySelector('[data-site-intro="headline"]');
      let copy = document.querySelector('[data-site-intro="copy"]');
      let cta = document.querySelector('[data-site-intro="cta"]');
      let visual = document.querySelector('[data-site-intro="visual"]');
      entranceElements = [header, eyebrow, headline, copy, cta, visual].filter(Boolean);
      const reduceMotion = mediaMatches("(prefers-reduced-motion: reduce)");
      const compactViewport = mediaMatches("(max-width: 680px)");
      const drawSteps = NETWORK_GEOMETRY.map((piece, index) => [
        `.siteIntro__path--${piece.id}`,
        { strokeDashoffset: [1, 0] },
        {
          duration: at(0.28),
          ease: easeOut,
          at: at(0.25 + index * 0.025),
        },
      ]);
      const nodeSteps = NETWORK_GEOMETRY.filter((piece) => !piece.signal).map((piece, index) => [
        `.siteIntro__nodeMotion--${piece.id}`,
        { opacity: [0, 1], transform: ["scale(0)", "scale(1)"] },
        {
          duration: at(0.1),
          ease: easeOut,
          at: at(0.36 + index * 0.025),
        },
      ]);

      const collapseSteps = NETWORK_GEOMETRY.flatMap((piece, index) => {
        const timing = {
          duration: at(0.27),
          ease: easeInOut,
          at: at(0.59 + index * 0.006),
        };

        return [
          [
            `.siteIntro__path--${piece.id}`,
            { d: [piece.networkPath, piece.logoPath] },
            timing,
          ],
          [
            `.siteIntro__nodeMotion--${piece.id}`,
            {
              cx: [piece.networkNode[0], piece.logoNode[0]],
              cy: [piece.networkNode[1], piece.logoNode[1]],
            },
            timing,
          ],
        ];
      });

      try {
        if (reduceMotion) {
          currentAnimation = animate([
            [
              ".siteIntro__brand",
              { clipPath: "inset(0 0% 0 0)", opacity: [0, 1] },
              { duration: at(0.12), ease: "linear", at: at(0.04) },
            ],
            [
              ".siteIntro__brand",
              { opacity: 0 },
              { duration: at(0.14), ease: "linear", at: at(0.18) },
            ],
            [
              ".siteIntro__panel",
              { opacity: 0 },
              { duration: at(0.16), ease: "linear", at: at(0.16) },
            ],
            ...entranceElements.flatMap((element) =>
              entranceStep(element, { opacity: 1, transform: "none", filter: "none" }, { duration: 0, at: 0 }),
            ),
          ]);
          await currentAnimation;
          finish();
          return;
        }

        const pageReady = Promise.race([
          waitForPageReadiness(root),
          // Slow assets get a graceful logo hold, but never an endless one.
          wait(2100),
        ]);

        currentAnimation = animate([
          [
            ".siteIntro__signalCore",
            { opacity: [0, 1], transform: ["scale(0.25)", "scale(1)"] },
            { duration: at(0.1), ease: easeOut, at: at(0.12) },
          ],
          [
            ".siteIntro__signalPulse",
            { opacity: [0, 0.42, 0], transform: ["scale(0.45)", "scale(1.8)"] },
            { duration: at(0.22), times: [0, 0.35, 1], ease: easeOut, at: at(0.16) },
          ],
          ...drawSteps,
          ...nodeSteps,
          ...(compactViewport
            ? [[
                ".siteIntro__network",
                { transform: ["scale(1.18)", "scale(1)"] },
                { duration: at(0.27), ease: easeInOut, at: at(0.59) },
              ]]
            : []),
          ...collapseSteps,
          [
            ".siteIntro__brand",
            {
              clipPath: [
                "inset(0 100% 0 0)",
                "inset(0 72% 0 0)",
                "inset(0 0% 0 0)",
              ],
              opacity: [0.65, 1, 1],
            },
            { duration: at(0.34), times: [0, 0.48, 1], ease: easeInOut, at: at(0.63) },
          ],
          [
            ".siteIntro__network",
            { opacity: 0 },
            { duration: at(0.13), ease: "easeOut", at: at(0.84) },
          ],
          [
            ".siteIntro__identity",
            { transform: ["scale(1)", "scale(1.018)", "scale(1)"] },
            { duration: at(0.16), times: [0, 0.45, 1], ease: easeInOut, at: at(0.97) },
          ],
          [
            ".siteIntro__activation",
            { opacity: [0, 0.72, 0], transform: ["scaleX(0.04)", "scaleX(1)"] },
            { duration: at(0.17), times: [0, 0.38, 1], ease: easeOut, at: at(0.98) },
          ],
        ]);

        await currentAnimation;
        if (cancelled) return;

        // Construction and application readiness run in parallel. On a slow
        // load, this is the calm hold on the completed brand.
        await pageReady;
        if (cancelled) return;

        // A browser Back/Forward action can replace the route while the intro
        // is running. Refresh the targets so the page currently underneath the
        // overlay receives the entrance, rather than detached route elements.
        header = document.querySelector('[data-site-intro="header"]');
        eyebrow = document.querySelector('[data-site-intro="eyebrow"]');
        headline = document.querySelector('[data-site-intro="headline"]');
        copy = document.querySelector('[data-site-intro="copy"]');
        cta = document.querySelector('[data-site-intro="cta"]');
        visual = document.querySelector('[data-site-intro="visual"]');
        entranceElements = [...new Set([
          ...entranceElements,
          header,
          eyebrow,
          headline,
          copy,
          cta,
          visual,
        ].filter(Boolean))];

        const releaseSequence = [
          [
            ".siteIntro__seam",
            { opacity: [0, 1], transform: ["scaleX(0)", "scaleX(1)"] },
            { duration: at(0.13), ease: easeOut, at: 0 },
          ],
          [
            ".siteIntro__identity",
            { opacity: [1, 0], transform: ["scale(1)", "scale(0.985)"] },
            { duration: at(0.13), ease: "easeOut", at: at(0.04) },
          ],
          [
            ".siteIntro__panel--top",
            { transform: "translateY(-100%)" },
            { duration: at(0.34), ease: sliceEase, at: at(0.12) },
          ],
          [
            ".siteIntro__panel--bottom",
            { transform: "translateY(100%)" },
            { duration: at(0.34), ease: sliceEase, at: at(0.12) },
          ],
          [
            ".siteIntro__seam",
            { opacity: [1, 0], transform: ["scaleX(1) scaleY(1)", "scaleX(1) scaleY(5)"] },
            { duration: at(0.19), ease: "easeOut", at: at(0.12) },
          ],
          ...entranceStep(
            header,
            { opacity: [0, 1], transform: ["translateY(-12px)", "translateY(0px)"] },
            { duration: at(0.3), ease: easeOut, at: at(0.12) },
          ),
          ...entranceStep(
            eyebrow,
            { opacity: [0, 1], transform: ["translateY(16px)", "translateY(0px)"] },
            { duration: at(0.27), ease: easeOut, at: at(0.15) },
          ),
          ...entranceStep(
            headline,
            {
              opacity: [0, 1],
              transform: ["translateY(22px)", "translateY(0px)"],
              filter: ["blur(4px)", "blur(0px)"],
            },
            { duration: at(0.34), ease: easeOut, at: at(0.18) },
          ),
          ...entranceStep(
            copy,
            { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] },
            { duration: at(0.3), ease: easeOut, at: at(0.23) },
          ),
          ...entranceStep(
            cta,
            { opacity: [0, 1], transform: ["translateY(15px)", "translateY(0px)"] },
            { duration: at(0.27), ease: easeOut, at: at(0.26) },
          ),
          ...entranceStep(
            visual,
            { opacity: [0, 1], transform: ["translateY(14px) scale(0.99)", "translateY(0px) scale(1)"] },
            { duration: at(0.36), ease: easeOut, at: at(0.15) },
          ),
        ];

        currentAnimation = animate(releaseSequence);
        await currentAnimation;
        finish();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("[SiteIntro] Animation fallback", error);
        }
        if (!cancelled) finish();
      }
    };

    run().catch((error) => {
      if (import.meta.env.DEV) {
        console.error("[SiteIntro] Unexpected fallback", error);
      }
      finish();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      currentAnimation?.stop?.();
      html.classList.remove("site-intro-running");
    };
  }, [active]);

  if (!active || !visible) return null;

  return (
    <div
      className="siteIntro"
      ref={scope}
      role="status"
      aria-live="polite"
      aria-label="Preparing FutureWithAI"
    >
      <div className="siteIntro__panel siteIntro__panel--top" aria-hidden="true" />
      <div className="siteIntro__panel siteIntro__panel--bottom" aria-hidden="true" />

      <div className="siteIntro__anchor" aria-hidden="true">
        <div className="siteIntro__identity">
          <img className="siteIntro__brand" src={brandLogo} alt="" />

          <svg
            className="siteIntro__network"
            viewBox="0 0 837 298"
            preserveAspectRatio="xMidYMid meet"
          >
          <defs>
            <linearGradient id="siteIntroCircuitGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#78e4ff" />
              <stop offset="0.58" stopColor="#2563eb" />
              <stop offset="1" stopColor="#8ab8ff" />
            </linearGradient>
            <filter id="siteIntroSignalGlow" x="-180%" y="-180%" width="460%" height="460%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {NETWORK_GEOMETRY.map((piece) => (
            <g className={`siteIntro__piece siteIntro__piece--${piece.id}`} key={piece.id}>
              <path
                className={`siteIntro__path siteIntro__path--${piece.id}`}
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                d={piece.networkPath}
              />
              {piece.signal ? (
                <>
                  <circle
                    className={`siteIntro__signalPulse siteIntro__nodeMotion--${piece.id}`}
                    cx={piece.networkNode[0]}
                    cy={piece.networkNode[1]}
                    r="10"
                    opacity="0"
                  />
                  <circle
                    className={`siteIntro__signalCore siteIntro__nodeMotion--${piece.id}`}
                    cx={piece.networkNode[0]}
                    cy={piece.networkNode[1]}
                    r="4.5"
                    opacity="0"
                  />
                </>
              ) : (
                <circle
                  className={`siteIntro__node siteIntro__node--satellite siteIntro__nodeMotion--${piece.id}`}
                  cx={piece.networkNode[0]}
                  cy={piece.networkNode[1]}
                  r="6.5"
                  opacity="0"
                />
              )}
            </g>
          ))}
          </svg>

          <span className="siteIntro__activation" />
        </div>
      </div>

      <span className="siteIntro__seam" aria-hidden="true" />
    </div>
  );
}
