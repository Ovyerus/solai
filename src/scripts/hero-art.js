import { artPattern, artSettings } from "./hero-settings.js";

const vertexSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// The raster stays in screen pixels; only the photograph underneath it moves.
const fragmentSource = `
  uniform sampler2D u_source;
  uniform sampler2D u_ranks;
  uniform vec2 u_resolution;
  uniform vec2 u_screen;
  uniform vec4 u_crop;
  uniform vec3 u_background;
  uniform vec3 u_ink;
  uniform float u_spread;
  uniform float u_threshold;
  uniform float u_contrast;
  uniform float u_light;
  uniform float u_motion;
  uniform float u_time;
  uniform vec2 u_parallax;
  uniform vec2 u_cursorCenter;
  uniform float u_cursorPhase;
  uniform float u_cursorEnergy;
  uniform float u_cursorStrength;

  float luminance(vec3 colour) {
    return dot(colour, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec2 pixel = vec2(floor(gl_FragCoord.x), u_resolution.y - 1.0 - floor(gl_FragCoord.y));
    vec2 screenUV = (pixel + 0.5) / u_resolution;
    vec2 sourceUV = u_crop.xy + screenUV * u_crop.zw;
    vec2 displacement = u_parallax;
    displacement += vec2(sin(u_time * 0.19) * 3.0, sin(u_time * 0.14) * 2.0) * u_motion;

    float sourceLight = luminance(texture2D(u_source, sourceUV).rgb);
    displacement += vec2(
      sin(screenUV.y * 11.0 + u_time * 0.23),
      sin(screenUV.x * 9.0 - u_time * 0.17)
    ) * sourceLight * 1.2 * u_motion;

    if (u_cursorStrength > 0.0) {
      vec2 position = screenUV * u_screen;
      vec2 fromPointer = (screenUV - u_cursorCenter) * u_screen;
      float distance = length(fromPointer);
      float envelope = exp(-distance * distance / 16000.0);
      vec2 direction = fromPointer / max(distance, 1.0);

      vec2 cursorOffset = direction * sin(distance * 0.065 - u_cursorPhase * 6.0)
        * envelope * u_cursorEnergy * 14.0;

      // Let the frame edges rest: stronger effects must not pull the crop out of bounds.
      vec2 edge = min(position, u_screen - position);
      float gain = u_cursorStrength * smoothstep(0.0, 48.0, min(edge.x, edge.y));
      displacement += clamp(cursorOffset, vec2(-28.0), vec2(28.0)) * gain;
    }

    sourceUV += displacement * u_crop.zw / u_screen;
    float tone = clamp((luminance(texture2D(u_source, sourceUV).rgb) - 0.5) * u_contrast + 0.5, 0.0, 1.0);
    tone = mix(tone, 1.0 - tone, u_light);
    vec2 rankUV = (mod(pixel, ${artPattern.size.toFixed(1)}) + 0.5) / ${artPattern.size.toFixed(1)};
    float rank = floor(texture2D(u_ranks, rankUV).r * 255.0 + 0.5);
    float rankThreshold = (rank + 0.5) / ${artPattern.values.length.toFixed(1)};
    float cutoff = u_threshold + (rankThreshold - 0.5) * u_spread;
    gl_FragColor = vec4(mix(u_background, u_ink, step(cutoff, tone)), 1.0);
  }
`;

function rgb(hex) {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

function createWebGL(canvas) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;
  const shaders = [];
  let program, vertices, source, ranks;
  const destroy = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    if (program) gl.deleteProgram(program);
    if (vertices) gl.deleteBuffer(vertices);
    if (source) gl.deleteTexture(source);
    if (ranks) gl.deleteTexture(ranks);
  };
  try {
    const precision = gl.getShaderPrecisionFormat(
      gl.FRAGMENT_SHADER,
      gl.HIGH_FLOAT,
    ).precision
      ? "highp"
      : "mediump";
    for (const [type, text] of [
      [gl.VERTEX_SHADER, vertexSource],
      [gl.FRAGMENT_SHADER, `precision ${precision} float;\n${fragmentSource}`],
    ]) {
      const shader = gl.createShader(type);
      shaders.push(shader);
      gl.shaderSource(shader, text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error("The image shader could not compile.");
    }
    program = gl.createProgram();
    shaders.forEach((shader) => gl.attachShader(program, shader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("The image shader could not link.");
    gl.useProgram(program);
    vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = (unit, filter) => {
      const result = gl.createTexture();
      gl.activeTexture(unit);
      gl.bindTexture(gl.TEXTURE_2D, result);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return result;
    };
    source = texture(gl.TEXTURE0, gl.LINEAR);
    ranks = texture(gl.TEXTURE1, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      artPattern.size,
      artPattern.size,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      artPattern.values,
    );
    const uniforms = Object.fromEntries(
      [
        "source",
        "ranks",
        "resolution",
        "screen",
        "crop",
        "background",
        "ink",
        "spread",
        "threshold",
        "contrast",
        "light",
        "motion",
        "time",
        "parallax",
        "cursorCenter",
        "cursorPhase",
        "cursorEnergy",
        "cursorStrength",
      ].map((name) => [name, gl.getUniformLocation(program, `u_${name}`)]),
    );
    gl.uniform1i(uniforms.source, 0);
    gl.uniform1i(uniforms.ranks, 1);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.disable(gl.DITHER);
    return { gl, source, uniforms, destroy };
  } catch (error) {
    destroy();
    throw error;
  }
}

export function createHeroArt(initialCanvas) {
  let canvas = initialCanvas;
  const root = canvas.closest(".hero-art") || canvas.parentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const settings = artSettings;
  const css = getComputedStyle(document.documentElement);
  let background = rgb(css.getPropertyValue("--canvas").trim());
  let ink = rgb(css.getPropertyValue("--accent").trim());
  let light = document.documentElement.dataset.mode === "light";
  let gpu = null,
    context = null,
    backend = "";
  let loaded = false,
    failed = false,
    ready = false,
    dirty = true;
  let geometryDirty = true;
  let width = 0,
    height = 0,
    screenWidth = 0,
    screenHeight = 0;
  let cropX = 0,
    cropY = 0,
    cropWidth = 1,
    cropHeight = 1;
  let sourceTone = null,
    sampledTone = null,
    output = null;
  let sourceWidth = 0,
    sourceHeight = 0;
  let frame = 0,
    lastTick = 0,
    time = 0;
  let pointerX = 0,
    pointerY = 0,
    targetX = 0,
    targetY = 0;
  let cursorX = 0.5,
    cursorY = 0.5,
    cursorEnergy = 0,
    cursorPhase = 0;
  let lastMoveTime = 0;
  const bounds = root.getBoundingClientRect();
  let visible =
    bounds.bottom > 0 &&
    bounds.top < innerHeight &&
    bounds.right > 0 &&
    bounds.left < innerWidth;
  const image = new Image();
  canvas.style.imageRendering = "pixelated";
  canvas.style.visibility = "hidden";
  canvas.dataset.ready = "false";

  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTick = 0;
  }

  function clearCursor() {
    cursorX = cursorY = 0.5;
    cursorEnergy = cursorPhase = 0;
    lastMoveTime = 0;
  }

  function neutral() {
    pointerX = pointerY = targetX = targetY = 0;
    time = 0;
    clearCursor();
  }

  function motionAllowed() {
    return backend === "webgl" && ready && !reduced.matches;
  }

  function needsFrame() {
    return (
      motionAllowed() &&
      visible &&
      !document.hidden &&
      (settings.motion > 0 || cursorEnergy > 0)
    );
  }

  function schedule() {
    if (needsFrame()) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else stopFrame();
  }

  function tick(stamp) {
    frame = 0;
    if (!needsFrame()) {
      lastTick = 0;
      return;
    }
    const elapsed = lastTick ? Math.min((stamp - lastTick) / 1000, 0.05) : 0;
    lastTick = stamp;
    if (settings.motion > 0) time += elapsed;
    const easing = 1 - Math.exp(-elapsed * 9);
    pointerX += (targetX - pointerX) * easing;
    pointerY += (targetY - pointerY) * easing;
    cursorPhase += elapsed;
    if (cursorPhase > Math.PI * 2) cursorPhase -= Math.PI * 2;
    cursorEnergy *= Math.exp(-elapsed * 3);
    if (cursorEnergy < 0.0015) cursorEnergy = 0;
    dirty = true;
    draw();
    schedule();
  }

  function fail() {
    failed = true;
    ready = false;
    canvas.dataset.ready = "false";
    canvas.style.visibility = "hidden";
    stopFrame();
  }

  function replaceWithFallback() {
    stopFrame();
    neutral();
    if (gpu) gpu.destroy();
    gpu = null;
    const replacement = canvas.cloneNode(false);
    canvas.replaceWith(replacement);
    canvas = replacement;
    backend = "canvas2d";
    canvas.dataset.renderer = backend;
    ready = false;
    canvas.dataset.ready = "false";
    canvas.style.visibility = "hidden";
    context = canvas.getContext("2d", { alpha: false });
    sampledTone = output = null;
    width = height = 0;
    geometryDirty = true;
    if (!context) {
      fail();
      return;
    }
    dirty = true;
    if (loaded) {
      try {
        prepareSource();
      } catch (error) {
        fail();
        return;
      }
    }
    draw();
  }

  function prepareSource() {
    if (sourceTone) return;
    const scratch = document.createElement("canvas");
    scratch.width = sourceWidth;
    scratch.height = sourceHeight;
    const scratchContext = scratch.getContext("2d", {
      willReadFrequently: true,
    });
    if (!scratchContext) throw new Error("Canvas pixels are unavailable.");
    scratchContext.drawImage(image, 0, 0);
    const pixels = scratchContext.getImageData(
      0,
      0,
      sourceWidth,
      sourceHeight,
    ).data;
    sourceTone = new Float32Array(sourceWidth * sourceHeight);
    for (let i = 0; i < sourceTone.length; i++) {
      const offset = i * 4;
      sourceTone[i] =
        (pixels[offset] * 0.2126 +
          pixels[offset + 1] * 0.7152 +
          pixels[offset + 2] * 0.0722) /
        255;
    }
  }

  function measure() {
    const nextScreenWidth = root.clientWidth;
    const nextScreenHeight = root.clientHeight;
    if (!nextScreenWidth || !nextScreenHeight) return false;
    const nextWidth = Math.max(1, Math.round(nextScreenWidth / settings.scale));
    const nextHeight = Math.max(
      1,
      Math.round(nextScreenHeight / settings.scale),
    );
    const limit = Math.min(1, 1440 / nextWidth, 1000 / nextHeight);
    const boundedWidth = Math.max(1, Math.round(nextWidth * limit));
    const boundedHeight = Math.max(1, Math.round(nextHeight * limit));
    const changed =
      boundedWidth !== width ||
      boundedHeight !== height ||
      nextScreenWidth !== screenWidth ||
      nextScreenHeight !== screenHeight;
    if (!changed) return true;
    screenWidth = nextScreenWidth;
    screenHeight = nextScreenHeight;
    width = boundedWidth;
    height = boundedHeight;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const cover = Math.max(
      screenWidth / sourceWidth,
      screenHeight / sourceHeight,
    );
    const baseWidth = screenWidth / (sourceWidth * cover);
    const baseHeight = screenHeight / (sourceHeight * cover);
    // Focus the cover crop first, then add a safety margin on every edge.
    cropWidth = baseWidth / 1.12;
    cropHeight = baseHeight / 1.12;
    cropX =
      (1 - baseWidth) * (screenWidth <= 650 ? 0.08 : 0.5) +
      (baseWidth - cropWidth) / 2;
    cropY = (1 - baseHeight) * 0.5 + (baseHeight - cropHeight) / 2;
    sampledTone = null;
    dirty = true;
    clearCursor();
    return true;
  }

  function sampleStaticSource() {
    if (sampledTone) return;
    sampledTone = new Float32Array(width * height);
    if (!output || output.width !== width || output.height !== height)
      output = context.createImageData(width, height);
    // Explicit bilinear sampling matches the GPU texture, rather than relying on
    // browser-specific drawImage downsampling kernels in the static fallback.
    for (let y = 0; y < height; y++) {
      const sy =
        (cropY + ((y + 0.5) / height) * cropHeight) * sourceHeight - 0.5;
      const y0 = Math.max(0, Math.min(sourceHeight - 1, Math.floor(sy)));
      const y1 = Math.min(sourceHeight - 1, y0 + 1);
      const fy = Math.max(0, Math.min(1, sy - y0));
      for (let x = 0; x < width; x++) {
        const sx =
          (cropX + ((x + 0.5) / width) * cropWidth) * sourceWidth - 0.5;
        const x0 = Math.max(0, Math.min(sourceWidth - 1, Math.floor(sx)));
        const x1 = Math.min(sourceWidth - 1, x0 + 1);
        const fx = Math.max(0, Math.min(1, sx - x0));
        const top =
          sourceTone[y0 * sourceWidth + x0] * (1 - fx) +
          sourceTone[y0 * sourceWidth + x1] * fx;
        const bottom =
          sourceTone[y1 * sourceWidth + x0] * (1 - fx) +
          sourceTone[y1 * sourceWidth + x1] * fx;
        sampledTone[y * width + x] = top * (1 - fy) + bottom * fy;
      }
    }
  }

  function drawStatic() {
    sampleStaticSource();
    const pixels = output.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        let tone = Math.max(
          0,
          Math.min(1, (sampledTone[index] - 0.5) * settings.contrast + 0.5),
        );
        if (light) tone = 1 - tone;
        const rank =
          artPattern.values[
            (y % artPattern.size) * artPattern.size + (x % artPattern.size)
          ];
        const cutoff =
          settings.threshold +
          ((rank + 0.5) / artPattern.values.length - 0.5) * settings.spread;
        const colour = tone >= cutoff ? ink : background;
        const offset = index * 4;
        pixels[offset] = colour[0];
        pixels[offset + 1] = colour[1];
        pixels[offset + 2] = colour[2];
        pixels[offset + 3] = 255;
      }
    }
    context.putImageData(output, 0, 0);
  }

  function drawWebGL() {
    const { gl, uniforms: u } = gpu;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(u.resolution, width, height);
    gl.uniform2f(u.screen, screenWidth, screenHeight);
    gl.uniform4f(u.crop, cropX, cropY, cropWidth, cropHeight);
    gl.uniform3f(
      u.background,
      background[0] / 255,
      background[1] / 255,
      background[2] / 255,
    );
    gl.uniform3f(u.ink, ink[0] / 255, ink[1] / 255, ink[2] / 255);
    gl.uniform1f(u.spread, settings.spread);
    gl.uniform1f(u.threshold, settings.threshold);
    gl.uniform1f(u.contrast, settings.contrast);
    gl.uniform1f(u.light, light ? 1 : 0);
    const moving = !reduced.matches;
    const movementLimit = Math.min(
      1,
      Math.min(screenWidth, screenHeight) / 400,
    );
    const drift = moving ? settings.motion * movementLimit : 0;
    gl.uniform1f(u.motion, drift);
    gl.uniform1f(u.time, time);
    gl.uniform2f(u.parallax, pointerX * drift * 8, pointerY * drift * 8);
    gl.uniform2f(u.cursorCenter, cursorX, cursorY);
    gl.uniform1f(u.cursorPhase, cursorPhase);
    gl.uniform1f(u.cursorEnergy, cursorEnergy);
    gl.uniform1f(
      u.cursorStrength,
      moving && cursorEnergy > 0 ? settings.cursorStrength * movementLimit : 0,
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function draw() {
    if (!loaded || failed || !visible || document.hidden) return;
    if (geometryDirty && !measure()) return;
    geometryDirty = false;
    if (!dirty) return;
    try {
      if (backend === "webgl") drawWebGL();
      else drawStatic();
    } catch (error) {
      if (backend === "webgl") replaceWithFallback();
      else fail();
      return;
    }
    dirty = false;
    if (!ready) {
      ready = true;
      canvas.dataset.ready = "true";
      canvas.style.removeProperty("visibility");
    }
  }

  function refresh() {
    dirty = true;
    geometryDirty = true;
    draw();
    schedule();
  }

  try {
    gpu = createWebGL(canvas);
    if (gpu) {
      backend = "webgl";
      canvas.dataset.renderer = backend;
      canvas.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          if (event.currentTarget === canvas && backend === "webgl")
            replaceWithFallback();
        },
        { once: true },
      );
    } else replaceWithFallback();
  } catch (error) {
    replaceWithFallback();
  }

  image.onload = () => {
    if (failed) return;
    sourceWidth = image.naturalWidth;
    sourceHeight = image.naturalHeight;
    try {
      if (backend === "webgl") {
        const { gl, source } = gpu;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, source);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        if (gl.getError() !== gl.NO_ERROR)
          throw new Error("The source texture could not be uploaded.");
      } else prepareSource();
      loaded = true;
      refresh();
    } catch (error) {
      if (backend === "webgl") {
        loaded = true;
        replaceWithFallback();
      } else fail();
    }
  };
  image.onerror = fail;
  image.src = "/assets/balcony.png";

  root.addEventListener(
    "pointermove",
    (event) => {
      if (
        event.pointerType === "touch" ||
        !motionAllowed() ||
        !visible ||
        document.hidden
      )
        return;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width),
      );
      const y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height),
      );
      const dx = x * 2 - 1,
        dy = y * 2 - 1;
      const length = Math.max(1, Math.hypot(dx, dy));
      targetX = dx / length;
      targetY = dy / length;
      if (settings.cursorStrength > 0) {
        const now = performance.now();
        const deltaX = lastMoveTime ? (x - cursorX) * rect.width : 0;
        const deltaY = lastMoveTime ? (y - cursorY) * rect.height : 0;
        const elapsed = Math.max(0.008, (now - lastMoveTime) / 1000);
        const speed = Math.min(1, Math.hypot(deltaX, deltaY) / elapsed / 900);
        const energy = 0.35 + speed * 0.65;
        cursorEnergy = Math.max(cursorEnergy, energy);
        cursorX = x;
        cursorY = y;
        lastMoveTime = now;
      }
      schedule();
    },
    { passive: true },
  );
  function leave(event) {
    if (event.pointerType === "touch") return;
    targetX = targetY = 0;
    lastMoveTime = 0;
    dirty = true;
    draw();
    schedule();
  }
  root.addEventListener("pointerleave", leave, { passive: true });
  root.addEventListener("pointercancel", leave, { passive: true });

  if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(root);
  else window.addEventListener("resize", refresh, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        stopFrame();
        targetX = targetY = pointerX = pointerY = 0;
        clearCursor();
      } else refresh();
    }).observe(root);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopFrame();
      targetX = targetY = pointerX = pointerY = 0;
      clearCursor();
    } else refresh();
  });
  window.addEventListener("pagehide", stopFrame);
  window.addEventListener("pageshow", refresh);
  reduced.addEventListener("change", () => {
    stopFrame();
    neutral();
    refresh();
  });

  return {
    setTheme(theme) {
      background = rgb(theme.background);
      ink = rgb(theme.ink);
      light = theme.mode === "light";
      refresh();
    },
  };
}
