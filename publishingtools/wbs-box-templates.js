/* ============================================================================
   WBS Box Templates — editable definitions for the Box Builder tool
   ----------------------------------------------------------------------------
   This is the "back end". To change how a box looks, edit its entry in the
   TEMPLATES array below (colours are rgb() strings to match TinyMCE output).
   To add a box, copy an existing entry and change the params + keywords.

   Two families:
     family: "comp"     -> wbs-lu-comp-example style (icon + label, then body)
     family: "activity" -> wbs-lu-activity style (coloured label + numbered footer)

   For anything unusual, give the template a render(content, opts) function
   instead of params (see Formula and Prompt library below). 
   ========================================================================== */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Plain text -> paragraphs. Blank line starts a new <p>; single newline -> <br>.
  function paras(content, align, emptyHtml) {
    var style = align ? ' style="text-align: ' + align + ';"' : "";
    var text = (content || "").trim();
    if (!text) return emptyHtml || ('<p' + style + ">Body text goes here.</p>");
    return text.split(/\n\s*\n/).map(function (block) {
      return "<p" + style + ">" + esc(block.trim()).replace(/\n/g, "<br>") + "</p>";
    }).join("\n");
  }

  // Standard closing wording for a box. Skipped if the author has already
  // typed it (punctuation and case are ignored), so it never appears twice.
  function disclaimerHtml(text, content, align) {
    if (!text) return "";
    if (norm(content).indexOf(norm(text)) !== -1) return "";
    var style = align ? ' style="text-align: ' + align + ';"' : "";
    return "\n<p" + style + ">" + esc(text) + "</p>";
  }

  function iconSpan(icon, color, extra) {
    if (!icon) return "";
    var cls = "wbs-lu-activity-ico " + icon + (extra ? " " + extra : "");
    var st = color ? ' style="color: ' + color + ';"' : "";
    return '<span class="' + cls + '"' + st + ">&nbsp;</span>";
  }

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!m) return hex; // already rgb() or invalid — pass through
    return "rgb(" + parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16) + ")";
  }

  // --- Comp-example builder ------------------------------------------------
  function buildComp(o) {
    o = o || {};
    var classes = o.classes || "mceTmpl wbs-lu-comp-example";
    var sp = [];
    if (o.bg) sp.push("background-color: " + o.bg + ";");
    if (o.border) sp.push("border-" + o.border.side + ": " + (o.border.width || "6.0px") + " solid " + o.border.color + ";");
    if (o.extraStyle) sp.push(o.extraStyle);
    var style = sp.length ? ' style="' + sp.join(" ") + '"' : "";

    var label = "";
    if (o.icon || o.iconRaw || o.prefix || o.title) {
      var ic = o.iconRaw ? o.iconRaw : iconSpan(o.icon, o.iconColor, o.iconExtra);
      var pre = o.prefix ? ('<strong' + (o.prefixColor ? ' style="color: ' + o.prefixColor + ';"' : "") + ">" + esc(o.prefix) + "</strong>") : "";
      var ttl = (o.title !== undefined && o.title !== null && o.title !== "") ? "<strong>" + esc(o.title) + "</strong>" : "";
      var guts = pre + (ttl ? (pre ? " " : "") + ttl : "");
      if (o.mono) guts = '<span style="font-family: \'Courier New\' , monospace;">' + guts + "</span>";
      label = '<div class="icon">' + ic + guts + "</div>\n";
    }
        return '<div class="' + classes + '"' + style + ">\n" + label + paras(o.content, "left") + disclaimerHtml(o.disclaimer, o.content, "left") + "\n</div>";
  }

  // --- Activity builder ----------------------------------------------------
  // o: { label, icon, labelBg, numberBg, title, number, content, iconHtml, ligStyle }
  // ligStyle: true (default) keeps style="font-variant-ligatures: no-common-ligatures;"
  //           false strips it from the title and description divs.
  function buildActivity(o) {
    o = o || {};
    var lig = o.ligStyle === false ? "" : ' style="font-variant-ligatures: no-common-ligatures;"';
    var labelStyle = o.labelBg ? ' style="background-color: ' + o.labelBg + ';"' : "";
    var numBg = o.numberBg || o.labelBg;
    var numStyle = numBg ? ' style="background-color: ' + numBg + ';"' : "";
    // If a raw iconHtml override is provided (TLE image mode), use it;
    // otherwise fall back to the Font Awesome icon span.
    var iconDiv = o.iconHtml
      ? o.iconHtml
      : '<div class="icon">' + iconSpan(o.icon) + "</div>";
    return [
      '<div class="wbs-lu-activity wbs-lu-activity-x1">',
      '<div class="wbs-lu-activity-label"' + labelStyle + ">",
      '<div class="text tinymce-wbs-protected">',
      "<p>" + esc(o.label || "Activity") + "</p>",
      "</div>",
      iconDiv,
      "</div>",
      '<div class="wbs-lu-activityinner clearfix">',
      '<div class="wbs-lu-activity-title tinymce-wbs-protected"' + lig + '>',
      "<p>" + esc(o.title || "Title of Activity") + "</p>",
      "</div>",
      '<div class="wbs-lu-activityinner-2 clearfix wbs-lu-activity-description tinymce-wbs-protected"' + lig + '>',
      paras(o.content, null) + disclaimerHtml(o.disclaimer, o.content),
      "</div>",
      "</div>",
      '<div class="wbs-lu-activity-number"' + numStyle + ">" + esc(o.number || "Activity x.x") + "</div>",
      "</div>"
    ].join("\n");
  }

  // --- Special renderers ---------------------------------------------------
  function buildFormula(content, opts) {
    var ref = opts.reference || "x.x.x";
    var title = opts.title || "Title (delete if not required)";
    var eq = '<p style="text-align: center;"><span class="mceNonEditable wbs-eq wbs-eq-loading wbs-eq-tex" style="width: 206px; height: 19px;"><span class="wbs-eq-markup">$LaTeX\\,formula\\, insert\\,here$</span></span>&nbsp;</p>';
    return '<div class="wbs-lu-comp-example" style="text-align: left;">\n' +
      '<div class="icon">' + iconSpan("fa fa-calculator") +
      "<strong>Formula " + esc(ref) + ": </strong><strong>" + esc(title) + "</strong></div>\n" +
      paras(content, "left") + "\n" + eq + "\n</div>";
  }

  function buildPrompt(content, opts) {
    var title = opts.title || "Title";
    var explanation = (content || "").trim() ? paras(content, null) : "<p>Prompt example explanation</p>";
    return [
      '<div class="mceTmpl wbs-lu-comp-example" style="background-color: rgb(250, 240, 247); border-left: 6.0px solid rgb(130, 26, 214);">',
      '<div class="icon">' + iconSpan("fa fa-terminal", "", "fa-fw") + '<span style="font-family: \'Courier New\' , monospace;"><strong>Prompt Library: ' + esc(title) + "</strong></span></div>",
      explanation,
      '<div class="mceTmpl wbs-lu-comp-example" style="color: black;">',
      '<div class="icon">' + iconSpan("fa fa-terminal fa-beat", "", "fa-fw") + '<span style="font-family: \'Courier New\' , monospace;"><strong>Prompt</strong></span></div>',
      "<p>Prompt goes here</p>",
      "<p><strong>Original task:</strong></p>",
      "<p><code>[Paste task here]</code></p>",
      "<p><strong>Answer from A:</strong></p>",
      "<p><code>[Paste first AI answer here]</code></p>",
      "<p><strong>Answer from B:</strong></p>",
      "<code>[Paste second AI answer here]</code></div>",
      "</div>"
    ].join("\n");
  }

  // --- TLE image icon HTML (used when "Use TLE images" is ticked) -------

 var TLE_ICONS = {
  poll:           '<div class="icon"><span class="icon icon-poll" aria-hidden="true"></span>&nbsp;</div>',
  exercise:       '<div class="icon"><span class="icon icon-exercise" aria-hidden="true">&nbsp;</span></div>',
  photowall:      '<div class="icon"><span class="icon icon-photowall" aria-hidden="true">&nbsp;</span></div>',
  stopthink:      '<div class="icon"><span class="icon icon-stopthink" aria-hidden="true">&nbsp;</span></div>',
  guidedread:     '<div class="icon"><span class="icon icon-guidedread" aria-hidden="true">&nbsp;</span></div>',
  libraryreading: '<div class="icon"><span class="icon icon-libraryreading" aria-hidden="true">&nbsp;</span></div>',
  webreading:     '<div class="icon"><span class="icon icon-webreading" aria-hidden="true">&nbsp;</span></div>',
  wbslive:        '<div class="icon"><span class="icon icon-wbslive" aria-hidden="true">&nbsp;</span></div>'
  };

  // Display labels for the TLE icons (used by the Create new picker).
  // Keys must match TLE_ICONS above.
  var TLE_LIST = [
    { key: "stopthink", label: "Stop and think" },
    { key: "exercise", label: "Exercise" },
    { key: "poll", label: "Poll" },
    { key: "photowall", label: "Photo wall" },
    { key: "guidedread", label: "Guided reading (textbook)" },
    { key: "libraryreading", label: "Library reading" },
    { key: "webreading", label: "Web reading" },
    { key: "wbslive", label: "wbsLive" }
  ];

  // Placeholder <img> for icons that will be uploaded on my.wbs after pasting.
  // src is left as typed so it can be swapped in TinyMCE's image dialog.
  function imgIcon(src, size) {
    var s = parseInt(size, 10);
    var dims = s > 0 ? ' width="' + s + '" height="' + s + '"' : "";
    return '<img src="' + esc(src || "images/your-icon.png").replace(/"/g, "&quot;") + '" alt=""' + dims + ">";
  }

  // --- Template definitions ------------------------------------------------
  var TEMPLATES = [
    // ---- Comp-example family ----
    { id: "example", name: "Example", family: "comp", keywords: ["example"], icon: "fa fa-cube",
      params: { bg: "rgb(255,243,226)", icon: "fa fa-cube", prefixLabel: "Example", numbered: true } },

    { id: "formula", name: "Formula", family: "comp", keywords: ["formula"], icon: "fa fa-calculator",
      render: buildFormula },

    { id: "criticality", name: "Criticality spotlight", family: "comp", keywords: ["criticality spotlight", "criticality", "spotlight"], icon: "fa fa-eye",
      params: { bg: "rgb(222,239,255)", icon: "fa fa-eye", prefixLabel: "Criticality spotlight", numbered: true } },

    { id: "learning", name: "Learning point", family: "comp", keywords: ["learning point"], icon: "fa fa-lightbulb-o",
      params: { bg: "rgb(229,222,237)", icon: "fa fa-lightbulb-o", prefixLabel: "Learning point", numbered: true } },

    { id: "esg", name: "ESG focus", family: "comp", keywords: ["esg"], icon: "fa fa-leaf",
      params: { classes: "mceTmpl", bg: "rgb(238,241,226)", border: { side: "right", width: "5.0px", color: "rgb(34,86,56)" },
        extraStyle: "padding: 16.0px 20.0px; margin: 16.0px 0;", icon: "fa fa-leaf", iconColor: "rgb(34,86,56)",
        prefixLabel: "ESG focus", numbered: false, prefixColor: "rgb(34,86,56)", titlePlaceholder: "Title" } },

    { id: "step", name: "Step / instruction", family: "comp", keywords: ["step", "instruction"], icon: "fa fa-hand-paper-o",
      params: { bg: "rgb(245,255,252)", border: { side: "left", width: "6.0px", color: "rgb(32,132,104)" },
        icon: "fa fa-hand-paper-o", prefixLabel: "Step", numbered: true, refPlaceholder: "x", titlePlaceholder: "title of instruction" } },

    { id: "prompt", name: "Prompt library", family: "comp", keywords: ["prompt library", "prompt"], icon: "fa fa-terminal",
      render: buildPrompt },

    { id: "general", name: "General box (no icon)", family: "comp", keywords: ["general box"], icon: "fa fa-square-o",
      params: { classes: "wbs-lu-comp-example", extraStyle: "text-align: left;", hasLabel: false } },

    // ---- Activity family ----
    { id: "talking", name: "Talking point", family: "activity", keywords: ["talking point"], icon: "fa fa-comments",
      params: { label: "Talking point", icon: "fa fa-comments", disclaimer: "Please post your answer in the comments below (maximum ### words) [Delete the following if not required] and respond to at least one other comment.", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "stopthink", name: "Stop and think", family: "activity", keywords: ["stop and think"], icon: "fa fa-pause-circle-o",
      params: { label: "Stop and think", icon: "fa fa-pause-circle-o", numberPrefix: "Activity", refPlaceholder: "x.x",
        tleIconKey: "stopthink" } },

    { id: "groupwork", name: "Group work", family: "activity", keywords: ["group work"], icon: "fa fa-users",
      params: { label: "Group work", icon: "fa fa-users", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "journal", name: "Journal", family: "activity", keywords: ["journal"], icon: "fa fa-address-book",
      params: { label: "Journal", icon: "fa fa-address-book", disclaimer: "Please complete this task in your learning journal accessed from the main menu at the top of the module space.", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "photowall", name: "Photo wall", family: "activity", keywords: ["photo wall", "photo"], icon: "fa fa-picture-o",
      params: { label: "Photo wall", icon: "fa fa-picture-o", disclaimer: "To upload your photo, please scroll down and click on 'add your image'. Please use the title field and text box to make it clear what you are illustrating.", numberPrefix: "Activity", refPlaceholder: "x.x",
        tleIconKey: "photowall" } },

    { id: "quiz", name: "Quiz", family: "activity", keywords: ["quiz"], icon: "fa fa-question-circle",
      params: { label: "Quiz", icon: "fa fa-question-circle", disclaimer:"If you have any issues or spot errors when completing the quiz, please post in the comments below and mark 'Please clarify'.",numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "poll", name: "Poll", family: "activity", keywords: ["poll"], icon: "fa fa-bar-chart",
      params: { label: "Poll", icon: "fa fa-bar-chart", numberPrefix: "Activity", refPlaceholder: "x.x",
        tleIconKey: "poll" } },

    { id: "exercise", name: "Exercise", family: "activity", keywords: ["try it for yourself", "exercise"], icon: "fa fa-pencil-square-o",
      params: { label: "Exercise", icon: "fa fa-pencil-square-o", numberPrefix: "Activity", refPlaceholder: "x.x", titlePlaceholder: "Try it for yourself",
        tleIconKey: "exercise" } },

    { id: "read-textbook", name: "Guided reading — textbook", family: "activity", keywords: ["textbook reading", "textbook"], icon: "fa fa-book",
      params: { label: "Textbook reading", icon: "fa fa-book", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x",
        tleIconKey: "guidedread" } },

    { id: "read-library", name: "Guided reading — library", family: "activity", keywords: ["library reading", "library"], icon: "fa fa-university",
      params: { label: "Library reading", icon: "fa fa-university", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x",
        tleIconKey: "libraryreading" } },

    { id: "read-web", name: "Guided reading — web", family: "activity", keywords: ["web reading"], icon: "fa fa-globe",
      params: { label: "Web reading", icon: "fa fa-globe", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x",
        tleIconKey: "webreading" } },

    { id: "read-case", name: "Guided reading — case study", family: "activity", keywords: ["case study"], icon: "fa fa-suitcase",
      params: { label: "Case study", icon: "fa fa-suitcase", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x", } },

    { id: "wbslive", name: "wbsLive", family: "activity", keywords: ["wbslive"], icon: "fa fa-video-camera",
      params: { label: "wbsLive", icon: "fa fa-video-camera", labelBg: "rgb(166,0,0)", numberPrefix: "wbsLive", refPlaceholder: "x",
        tleIconKey: "wbslive" } },

    { id: "ai-exercise", name: "AI Exercise", family: "activity", keywords: ["ai exercise", "ai activity"], icon: "fa fa-bolt",
      params: { label: "AI Exercise", icon: "fa fa-bolt", labelBg: "rgb(130,26,214)", numberPrefix: "Activity", refPlaceholder: "x.x.x", titlePlaceholder: "Title of the activity" } },

    { id: "community", name: "Community discussion", family: "activity", keywords: ["community discussion", "discussion"], icon: "fa fa-users",
      params: { label: "Community discussion", icon: "fa fa-users", numberPrefix: "Activity", refPlaceholder: "x.x" } }
  ];

  function byId(id) {
    for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === id) return TEMPLATES[i];
    return null;
  }

  function build(id, content, opts) {
    var t = byId(id);
    if (!t) return "";
    opts = opts || {};
    if (typeof t.render === "function") return t.render(content, opts);
    var p = t.params || {};
    if (t.family === "comp") {
            var o = { classes: p.classes, bg: p.bg, border: p.border, extraStyle: p.extraStyle, content: content, disclaimer: opts.disclaimers === false ? "" : p.disclaimer };
      if (p.hasLabel !== false) {
        o.icon = p.icon; o.iconColor = p.iconColor; o.iconExtra = p.iconExtra; o.mono = p.mono;
        var ref = opts.reference || p.refPlaceholder || "x.x.x";
        o.prefix = p.prefixLabel + (p.numbered ? " " + ref : "") + ":";
        o.prefixColor = p.prefixColor;
        o.title = opts.title || p.titlePlaceholder || "Title (delete if not required)";
      }
      return buildComp(o);
    }
    // activity
    var num = (p.numberPrefix || "Activity") + " " + (opts.reference || p.refPlaceholder || "x.x");
    var actOpts = {
      label: p.label, icon: p.icon, labelBg: p.labelBg, numberBg: p.numberBg || p.labelBg,
      title: opts.title || p.titlePlaceholder || "Title of Activity", number: num, content: content,
      ligStyle: opts.ligStyle,
      disclaimer: opts.disclaimers === false ? "" : p.disclaimer
    };
    // Swap in TLE image icon when the flag is set and this template supports it
    if (opts.useTLE && p.tleIconKey && TLE_ICONS[p.tleIconKey]) {
      actOpts.iconHtml = TLE_ICONS[p.tleIconKey];
    }
    return buildActivity(actOpts);
  }

  // Return the id of the most specific template whose keyword appears in the
  // text as whole words (so "poll" doesn't match "pollution").
  function detect(text) {
    var hay = " " + norm(text) + " ";
    var pairs = [];
    TEMPLATES.forEach(function (t) {
      (t.keywords || []).forEach(function (k) { pairs.push({ id: t.id, k: norm(k) }); });
    });
    pairs.sort(function (a, b) { return b.k.length - a.k.length; }); // longest keyword wins
    for (var i = 0; i < pairs.length; i++) {
      if (hay.indexOf(" " + pairs[i].k + " ") !== -1) return pairs[i].id;
    }
    return null;
  }

  // --- Header detection: "Type: Title (x.x.x)" ----------------------------
  // Only a header at the very start of the text is recognised. Supported forms:
  //   A  Type: Title (x.x.x)   (body may follow on the same line)
  //   B  Type (x.x.x)          (optionally followed by ": Title" to end of line)
  //   C  Type: Title           (title runs to the end of the line)
  // Returns { type, title, ref, header, rest } or null.
  var RE_A = /^([^:\n()]{1,50}?)[ \t]*:[ \t]*([^\n]*?)[ \t]*\((\d+(?:\.\d+)*)\)[ \t]*[:.\-\u2013\u2014]?\s*/;
  var RE_B = /^([^:\n()]{1,50}?)[ \t]*\((\d+(?:\.\d+)*)\)[ \t]*(?::[ \t]*([^\n]*))?\s*/;
  var RE_C = /^([^:\n()]{1,50}?)[ \t]*:[ \t]*([^\n]*)\s*/;

  function validType(t) {
    t = (t || "").trim();
    return /^[A-Za-z]/.test(t) && t.split(/\s+/).length <= 6;
  }

  function parseHeader(text) {
    var src = text || "";
    var lead = src.match(/^\s*/)[0].length;
    var s = src.slice(lead);
    var m, r = null;
    if ((m = RE_A.exec(s)) && validType(m[1])) {
      r = { type: m[1], title: m[2], ref: m[3] };
    } else if ((m = RE_B.exec(s)) && validType(m[1])) {
      r = { type: m[1], title: m[3] || "", ref: m[2] };
    } else if ((m = RE_C.exec(s)) && validType(m[1]) && !/^\/\//.test(m[2])) {
      r = { type: m[1], title: m[2], ref: "" };
    }
    if (!r) return null;
    r.type = r.type.trim(); r.title = r.title.trim();
    r.header = s.slice(0, m[0].length);
    r.rest = s.slice(m[0].length);
    return r;
  }

  // Text with a recognised header removed (unchanged if there is none).
  function stripHeader(text) {
    var h = parseHeader(text);
    return h ? h.rest : text;
  }

  function norm(s) {
    return String(s || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // Match a header's type text to a template id: exact match on keyword, name
  // or label first, then the longest keyword contained in the type.
  function matchType(type) {
    var n = norm(type);
    if (!n) return null;
    var cands = [];
    TEMPLATES.forEach(function (t) {
      var list = (t.keywords || []).concat([t.name, t.params && t.params.label]);
      list.forEach(function (k) { if (k) cands.push({ id: t.id, k: norm(k) }); });
    });
    for (var i = 0; i < cands.length; i++) if (cands[i].k === n) return cands[i].id;
    cands.sort(function (a, b) { return b.k.length - a.k.length; });
    for (var j = 0; j < cands.length; j++) {
      if ((" " + n + " ").indexOf(" " + cands[j].k + " ") !== -1) return cands[j].id;
    }
    return null;
  }

  // One-stop detection used by the Detect button.
  // Header found  -> { header, type, title, ref, rest, id (template id or null) }
  // No header     -> { id, keywordOnly: true } from a keyword anywhere, or null.
  function analyse(text) {
    var h = parseHeader(text);
    if (h) { h.id = matchType(h.type); return h; }
    var id = detect(text);
    return id ? { id: id, keywordOnly: true } : null;
  }

  // A practical, extendable set of Font Awesome 4 icon names (without the "fa fa-").
  var ICONS = ("cube calculator eye lightbulb-o leaf hand-paper-o terminal comments comment users user " +
    "address-book question-circle suitcase pause-circle-o picture-o camera bar-chart pie-chart line-chart area-chart " +
    "pencil pencil-square-o book university globe video-camera bolt flask graduation-cap clipboard list list-ol tasks " +
    "check check-circle check-circle-o info-circle exclamation-circle exclamation-triangle star star-o flag flag-o " +
    "bookmark bookmark-o clock-o calendar calendar-check-o cog cogs wrench balance-scale gavel handshake-o quote-left " +
    "quote-right search key lock unlock map-marker compass road rocket trophy certificate thumbs-up thumbs-o-up heart " +
    "heart-o bell bell-o bullhorn microphone headphones film music code database server sitemap share-alt link paperclip " +
    "file-text-o files-o folder-open download upload envelope envelope-o phone money percent sliders filter random refresh " +
    "recycle play-circle-o pause stop hourglass-half puzzle-piece magic life-ring street-view comments-o pie-chart " +
    "table th-list paint-brush bug shield").split(/\s+/);

  global.WBSBoxes = {
    templates: TEMPLATES,
    icons: ICONS,
    build: build,
    detect: detect,
    buildComp: buildComp,
    buildActivity: buildActivity,
    hexToRgb: hexToRgb,
    tleIcons: TLE_ICONS,
    tleList: TLE_LIST,
    imgIcon: imgIcon,
    parseHeader: parseHeader,
    stripHeader: stripHeader,
    matchType: matchType,
    analyse: analyse
  };
})(typeof window !== "undefined" ? window : this);
