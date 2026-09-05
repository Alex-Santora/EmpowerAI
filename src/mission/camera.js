import { Vector3, MathUtils } from "three";
import { cameraFrames } from "./timeline.js";

// Nonuniform cubic Hermite interpolation preserves slow plaza movement while
// keeping position and look-at velocity continuous between authored stops.
function sample(progress, key, out) {
  let i = cameraFrames.findIndex((frame) => frame.progress > progress) - 1;
  if (i < 0) i = cameraFrames.length - 2;
  const a = cameraFrames[i],
    b = cameraFrames[i + 1];
  const before = cameraFrames[Math.max(0, i - 1)];
  const after = cameraFrames[Math.min(cameraFrames.length - 1, i + 2)];
  const span = b.progress - a.progress;
  const t = MathUtils.clamp((progress - a.progress) / span, 0, 1);
  const t2 = t * t,
    t3 = t2 * t;
  for (let axis = 0; axis < 3; axis++) {
    const m0 =
      ((b[key][axis] - before[key][axis]) / (b.progress - before.progress)) *
      span;
    const m1 =
      ((after[key][axis] - a[key][axis]) / (after.progress - a.progress)) *
      span;
    out.setComponent(axis,
      (2 * t3 - 3 * t2 + 1) * a[key][axis] +
      (t3 - 2 * t2 + t) * m0 +
      (-2 * t3 + 3 * t2) * b[key][axis] +
      (t3 - t2) * m1
    );
  }
  return out;
}
export function createCameraRig(camera) {
  const position = new Vector3(),
    target = new Vector3();
  return (progress, time, pointer, mobile, still = false) => {
    progress = still ? 0.98 : progress;
    sample(progress, "position", position);
    sample(progress, "target", target);
    if (mobile) {
      // Pull back along the viewing vector; preserve the route and its heading.
      position.sub(target).multiplyScalar(1.25).add(target);
      position.y += 6;
    }
    camera.position.copy(position);
    const ambient = still ? 0 : 1 - MathUtils.smoothstep(progress, 0.86, 1);
    camera.position.y += Math.sin(time * 0.18) * 0.15 * ambient;
    camera.position.x += Math.sin(time * 0.12) * 0.22 * ambient;
    camera.lookAt(target);
    if (!mobile && !still) {
      camera.translateX(pointer.x * 0.45 * ambient);
      camera.translateY(-pointer.y * 0.22 * ambient);
      camera.rotateY(pointer.x * 0.006 * ambient);
    }
  };
}
