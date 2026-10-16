/* ============================================================================
   WBS image rules — single source of truth for the my.wbs image limits.
   ----------------------------------------------------------------------------
   Pure logic only (no DOM), so it can be unit-tested in Node with:
       global.window = {}; require("./wbs-image-rules.js");
       const R = window.WBSImageRules;

   my.wbs rejects an image only when it breaks BOTH limits:
       file size > SIZE_LIMIT  AND  width or height > DIM_LIMIT
   For images that break both limits, only ONE barrier needs clearing, and
   size is cleared first so dimensions are kept wherever possible:
       1. compress (and convert opaque PNG to JPEG) at full size to <= SIZE_LIMIT
       2. if that fails at MIN quality, shrink as little as needed to fit SIZE_LIMIT
       3. if even that would go below DIM_LIMIT, fit DIM_LIMIT at HIGH_QUALITY
          (accepted at any file size)
   Anything over LOOPHOLE px on either side currently slips past the check,
   so those are shrunk to LOOPHOLE_TARGET on the long side (still just over)
   and compressed as hard as the chosen quality allows.
   ========================================================================== */
(function (root) {
  "use strict";

  var LIMITS = {
    SIZE_LIMIT: 500 * 1000,      // bytes. 500 KB (decimal). Use 500 * 1024 if my.wbs counts KiB.
    DIM_LIMIT: 1024,             // px, applies to width and height
    LOOPHOLE: 6500,              // px, images over this on either side bypass the check
    LOOPHOLE_TARGET: 6501,       // px, long side after reduction (must stay > LOOPHOLE)
    HIGH_QUALITY: 0.92,          // starting quality, and quality of the 1024 px fallback
    MIN_QUALITY: 0.70,           // default floor before dimensions are touched (UI can change it)
    SEARCH_STEPS: 6,             // quality binary-search iterations
    SEARCH_TOLERANCE: 8          // px, precision of the dimension search
  };

  // Action codes. Labels/descriptions for the UI live here too (DRY).
  var ACTIONS = {
    ok_small: {
      ready: true,
      label: "Ready as is",
      reason: "Under 500 KB, so any dimensions are accepted."
    },
    ok_dims: {
      ready: true,
      label: "Ready as is",
      reason: "Over 500 KB but within 1024 × 1024 px, so it is accepted."
    },
    scale: {
      ready: false,
      label: "Compress to under 500 KB",
      reason: "Over 500 KB and larger than 1024 px, so my.wbs would reject it. It will be compressed to under 500 KB at full size if possible, and only shrunk if it has to be."
    },
    oversize: {
      ready: false,
      label: "Reduce to 6501 px",
      reason: "Over 6500 px on one side. It would get past my.wbs, but it is far heavier than needed, so it will be reduced to 6501 px on the long side and compressed."
    }
  };

  /** Decide what to do with an image. Order matters: the 6500 px rule wins. */
  function classify(width, height, bytes) {
    var L = LIMITS;
    if (Math.max(width, height) > L.LOOPHOLE) return "oversize";
    if (bytes <= L.SIZE_LIMIT) return "ok_small";
    if (width <= L.DIM_LIMIT && height <= L.DIM_LIMIT) return "ok_dims";
    return "scale";
  }

  /** Scale so the long side equals `longSide` exactly, keeping aspect ratio. */
  function fitLongSide(width, height, longSide) {
    if (width >= height) {
      return { width: longSide, height: Math.max(1, Math.round(height * longSide / width)) };
    }
    return { width: Math.max(1, Math.round(width * longSide / height)), height: longSide };
  }

  /** Target dimensions for an action, or null when nothing needs changing. */
  function targetSize(action, width, height) {
    if (action === "scale") return fitLongSide(width, height, LIMITS.DIM_LIMIT);
    if (action === "oversize") return fitLongSide(width, height, LIMITS.LOOPHOLE_TARGET);
    return null;
  }

  /** Would my.wbs accept a file of this size and these dimensions? */
  function accepted(width, height, bytes) {
    var L = LIMITS;
    var overSize = bytes > L.SIZE_LIMIT;
    var overDims = width > L.DIM_LIMIT || height > L.DIM_LIMIT;
    return !(overSize && overDims) || Math.max(width, height) > L.LOOPHOLE;
  }

  /**
   * Highest quality in [minQ, maxQ] whose encoded size is <= limit.
   * encode(q) must resolve to an object with a numeric `size`.
   * For lossless formats pass lossy=false: one attempt only.
   * Resolves to the winning encode result, or null if even minQ is too big.
   */
  async function searchQuality(encode, minQ, maxQ, limit, lossy) {
    var r = await encode(maxQ);
    if (r.size <= limit) return r;
    if (!lossy) return null;
    var best = await encode(minQ);
    if (best.size > limit) return null;
    var lo = minQ, hi = maxQ;
    for (var i = 0; i < LIMITS.SEARCH_STEPS; i++) {
      var mid = (lo + hi) / 2;
      r = await encode(mid);
      if (r.size <= limit) { best = r; lo = mid; } else { hi = mid; }
    }
    return best;
  }

  /**
   * Largest long side in (minL, maxL) whose encoded size is <= limit.
   * maxL is assumed to fail already. encodeAt(L) resolves to { size, ... }.
   * Resolves to the winning result, or null if nothing above minL fits.
   */
  async function searchLongSide(encodeAt, minL, maxL, limit) {
    var lo = minL, hi = maxL, best = null;
    while (hi - lo > LIMITS.SEARCH_TOLERANCE) {
      var mid = Math.round((lo + hi) / 2);
      var r = await encodeAt(mid);
      if (r.size <= limit) { best = r; lo = mid; } else { hi = mid; }
    }
    return best;
  }

  function formatBytes(bytes) {
    if (bytes < 1000) return bytes + " B";
    if (bytes < 1000 * 1000) return (bytes / 1000).toFixed(0) + " KB";
    return (bytes / (1000 * 1000)).toFixed(2) + " MB";
  }

  root.WBSImageRules = {
    LIMITS: LIMITS,
    ACTIONS: ACTIONS,
    classify: classify,
    fitLongSide: fitLongSide,
    targetSize: targetSize,
    accepted: accepted,
    searchQuality: searchQuality,
    searchLongSide: searchLongSide,
    formatBytes: formatBytes
  };
})(typeof window !== "undefined" ? window : this);
