import { useEffect, useRef } from "react";
import * as T from "three";
import { createCity } from "./city";
import { createCameraRig } from "./camera";

export default function MissionScene({ journey, onReady, onFailure, still = false }) {
  const host = useRef(null);
  useEffect(() => {
    const element = host.current;
    let renderer, city, environment, frame, observer;
    let disposed = false;
    const cleanups = [];
    const cleanup = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      cleanups.forEach((fn) => fn());
      city?.dispose();
      environment?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
    };
    try {
      let mobile = element.clientWidth <= 700;
      renderer = new T.WebGLRenderer({ antialias: !mobile, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.2 : 1.5));
      renderer.shadowMap.enabled = !mobile;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      // Architecture is static. Bake the shadow map once, including after resize.
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      element.appendChild(renderer.domElement);
      const scene = new T.Scene();
      scene.background = new T.Color("#071321");
      scene.fog = new T.FogExp2("#0c2035", 0.0055);
      // Small procedural reflection map: a dark sky and one broad studio strip.
      const canvas = document.createElement("canvas");
      canvas.width = 256; canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const sky = ctx.createLinearGradient(0, 0, 0, 128);
      sky.addColorStop(0, "#182e4b");
      sky.addColorStop(0.42, "#446780");
      sky.addColorStop(0.55, "#14283e");
      sky.addColorStop(1, "#030810");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = "#75999e"; ctx.fillRect(175, 25, 14, 38);
      const texture = new T.CanvasTexture(canvas);
      texture.mapping = T.EquirectangularReflectionMapping;
      texture.colorSpace = T.SRGBColorSpace;
      const pmrem = new T.PMREMGenerator(renderer);
      environment = pmrem.fromEquirectangular(texture);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.65;
      pmrem.dispose(); texture.dispose();
      const camera = new T.PerspectiveCamera(49, 1, 0.25, 1000);
      scene.add(new T.HemisphereLight("#92b9e0", "#152536", 1.4));
      const key = new T.DirectionalLight("#a7c8eb", 2.5);
      key.position.set(-65, 110, 55);
      key.castShadow = !mobile;
      key.shadow.mapSize.set(2048, 2048);
      Object.assign(key.shadow.camera, { left: -115, right: 115, top: 100, bottom: -110, near: 1, far: 300 });
      key.shadow.bias = -0.0002; key.shadow.normalBias = 0.12;
      scene.add(key);
      const rim = new T.DirectionalLight("#4bafc6", 2.1);
      rim.position.set(65, 40, -85); scene.add(rim);
      const garden = new T.PointLight("#ffd3a0", 40, 40, 1.5);
      garden.position.set(20, 9, 44); scene.add(garden);
      const plaza = new T.PointLight("#7adacb", 45, 46, 1.5);
      plaza.position.set(-8, 10, 43); scene.add(plaza);
      city = createCity(scene, mobile);
      const rig = createCameraRig(camera);
      const pointer = new T.Vector2(), easedPointer = new T.Vector2();
      let width = 1, height = 1, previous = 0, elapsed = 0;
      let measured = 0, slow = 0, diagnosticTime = 0, diagnosticFrames = 0;
      const renderStill = () => {
        rig(0.98, 0, pointer, mobile, true);
        city.update(0, 1, false);
        renderer.render(scene, camera);
      };
      const resize = () => {
        width = element.clientWidth; height = element.clientHeight;
        mobile = width <= 700;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), devicePixelRatio, mobile ? 1.2 : 1.5));
        renderer.shadowMap.enabled = !mobile;
        key.castShadow = !mobile;
        renderer.shadowMap.needsUpdate = true;
        camera.aspect = width / height;
        camera.fov = mobile ? 58 : 49;
        camera.updateProjectionMatrix();
        if (still) renderStill();
      };
      observer = new ResizeObserver(resize); observer.observe(element); resize();
      const listen = (target, name, fn, options) => {
        target.addEventListener(name, fn, options);
        cleanups.push(() => target.removeEventListener(name, fn, options));
      };
      listen(renderer.domElement, "webglcontextlost", (event) => { event.preventDefault(); onFailure(); });
      if (!still) {
        listen(window, "pointermove", (event) => {
          if (mobile || event.pointerType !== "mouse") return;
          pointer.set((event.clientX / width - 0.5) * 2, (event.clientY / height - 0.5) * 2);
        }, { passive: true });
        listen(document, "pointerleave", () => pointer.set(0, 0));
      }
      function draw(now) {
        if (disposed || document.hidden) return;
        const rawDelta = previous ? (now - previous) / 1000 : 1 / 60;
        const delta = Math.min(rawDelta, 0.05);
        previous = now; elapsed += delta;
        easedPointer.lerp(pointer, 1 - Math.exp(-delta * 3));
        rig(journey.current.progress, elapsed, easedPointer, mobile);
        city.update(elapsed, journey.current.progress, journey.current.hover);
        renderer.render(scene, camera);
        if (import.meta.env.DEV) {
          diagnosticFrames++; diagnosticTime += rawDelta;
          if (diagnosticTime >= 1) {
            element.dataset.fps = String(Math.round(diagnosticFrames / diagnosticTime));
            element.dataset.drawCalls = String(renderer.info.render.calls);
            element.dataset.triangles = String(renderer.info.render.triangles);
            element.dataset.camera = camera.position.toArray().map(n => n.toFixed(1)).join(",");
            diagnosticTime = 0; diagnosticFrames = 0;
          }
        }
        // Lower GPU cost first; keep the city on smaller/slower devices.
        if (elapsed > 3 && measured < 180) {
          measured++; if (rawDelta > 0.03) slow++;
          if (measured === 180 && slow > 90) {
            renderer.setPixelRatio(1);
            renderer.shadowMap.enabled = false;
          }
        }
        frame = requestAnimationFrame(draw);
      }
      listen(document, "visibilitychange", () => {
        cancelAnimationFrame(frame); previous = 0;
        if (!document.hidden && !still) frame = requestAnimationFrame(draw);
      });
      if (!still) frame = requestAnimationFrame(draw);
      onReady();
    } catch (error) {
      console.warn("Mission city is unavailable; using the reading experience.", error);
      cleanup(); onFailure();
    }
    return cleanup;
  }, [journey, onFailure, onReady, still]);
  return <div className="mission-scene" ref={host} aria-hidden="true" />;
}
