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
  // o: { classes, bg, border:{side,width,color}, extraStyle, icon, iconColor,
  //      iconExtra, mono, prefix, prefixColor, title, content }
  function buildComp(o) {
    o = o || {};
    var classes = o.classes || "mceTmpl wbs-lu-comp-example";
    var sp = [];
    if (o.bg) sp.push("background-color: " + o.bg + ";");
    if (o.border) sp.push("border-" + o.border.side + ": " + (o.border.width || "6.0px") + " solid " + o.border.color + ";");
    if (o.extraStyle) sp.push(o.extraStyle);
    var style = sp.length ? ' style="' + sp.join(" ") + '"' : "";

    var label = "";
    if (o.icon || o.prefix || o.title) {
      var ic = iconSpan(o.icon, o.iconColor, o.iconExtra);
      var pre = o.prefix ? ('<strong' + (o.prefixColor ? ' style="color: ' + o.prefixColor + ';"' : "") + ">" + esc(o.prefix) + "</strong>") : "";
      var ttl = (o.title !== undefined && o.title !== null && o.title !== "") ? "<strong>" + esc(o.title) + "</strong>" : "";
      var guts = pre + (ttl ? (pre ? " " : "") + ttl : "");
      if (o.mono) guts = '<span style="font-family: \'Courier New\' , monospace;">' + guts + "</span>";
      label = '<div class="icon">' + ic + guts + "</div>\n";
    }
    return '<div class="' + classes + '"' + style + ">\n" + label + paras(o.content, "left") + "\n</div>";
  }

  // --- Activity builder ----------------------------------------------------
  // o: { label, icon, labelBg, numberBg, title, number, content }
  function buildActivity(o) {
    o = o || {};
    var labelStyle = o.labelBg ? ' style="background-color: ' + o.labelBg + ';"' : "";
    var numBg = o.numberBg || o.labelBg;
    var numStyle = numBg ? ' style="background-color: ' + numBg + ';"' : "";
    return [
      '<div class="wbs-lu-activity wbs-lu-activity-x1">',
      '<div class="wbs-lu-activity-label"' + labelStyle + ">",
      '<div class="text tinymce-wbs-protected">',
      "<p>" + esc(o.label || "Activity") + "</p>",
      "</div>",
      '<div class="icon">' + iconSpan(o.icon) + "</div>",
      "</div>",
      '<div class="wbs-lu-activityinner clearfix">',
      '<div class="wbs-lu-activity-title tinymce-wbs-protected">',
      "<p>" + esc(o.title || "Title of Activity") + "</p>",
      "</div>",
      '<div class="wbs-lu-activityinner-2 clearfix wbs-lu-activity-description tinymce-wbs-protected">',
      paras(o.content, null),
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
      params: { label: "Talking point", icon: "fa fa-comments", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "stopthink", name: "Stop and think", family: "activity", keywords: ["stop and think"], icon: "fa fa-pause-circle-o",
      params: { label: "Stop and think", icon: "fa fa-pause-circle-o", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "groupwork", name: "Group work", family: "activity", keywords: ["group work"], icon: "fa fa-users",
      params: { label: "Group work", icon: "fa fa-users", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "journal", name: "Journal", family: "activity", keywords: ["journal"], icon: "fa fa-address-book",
      params: { label: "Journal", icon: "fa fa-address-book", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "photowall", name: "Photo wall", family: "activity", keywords: ["photo wall", "photo"], icon: "fa fa-picture-o",
      params: { label: "Photo wall", icon: "fa fa-picture-o", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "quiz", name: "Quiz", family: "activity", keywords: ["quiz"], icon: "fa fa-question-circle",
      params: { label: "Quiz", icon: "fa fa-question-circle", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "poll", name: "Poll", family: "activity", keywords: ["poll"], icon: "fa fa-bar-chart",
      params: { label: "Poll", icon: "fa fa-bar-chart", numberPrefix: "Activity", refPlaceholder: "x.x" } },

    { id: "exercise", name: "Exercise", family: "activity", keywords: ["try it for yourself", "exercise"], icon: "fa fa-pencil-square-o",
      params: { label: "Exercise", icon: "fa fa-pencil-square-o", numberPrefix: "Activity", refPlaceholder: "x.x", titlePlaceholder: "Try it for yourself" } },

    { id: "read-textbook", name: "Guided reading — textbook", family: "activity", keywords: ["textbook reading", "textbook"], icon: "fa fa-book",
      params: { label: "Textbook reading", icon: "fa fa-book", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x" } },

    { id: "read-library", name: "Guided reading — library", family: "activity", keywords: ["library reading", "library"], icon: "fa fa-university",
      params: { label: "Library reading", icon: "fa fa-university", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x" } },

    { id: "read-web", name: "Guided reading — web", family: "activity", keywords: ["web reading"], icon: "fa fa-globe",
      params: { label: "Web reading", icon: "fa fa-globe", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x" } },

    { id: "read-case", name: "Guided reading — case study", family: "activity", keywords: ["case study"], icon: "fa fa-suitcase",
      params: { label: "Case study", icon: "fa fa-suitcase", labelBg: "rgb(0,84,164)", numberPrefix: "Guided reading", refPlaceholder: "x.x" } },

    { id: "wbslive", name: "wbsLive", family: "activity", keywords: ["wbslive"], icon: "fa fa-video-camera",
      params: { label: "wbsLive", icon: "fa fa-video-camera", labelBg: "rgb(166,0,0)", numberPrefix: "wbsLive", refPlaceholder: "x" } },

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
      var o = { classes: p.classes, bg: p.bg, border: p.border, extraStyle: p.extraStyle, content: content };
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
    return buildActivity({
      label: p.label, icon: p.icon, labelBg: p.labelBg, numberBg: p.numberBg || p.labelBg,
      title: opts.title || p.titlePlaceholder || "Title of Activity", number: num, content: content
    });
  }

  // Return the id of the most specific template whose keyword appears in the text.
  function detect(text) {
    var hay = (text || "").toLowerCase();
    var pairs = [];
    TEMPLATES.forEach(function (t) {
      (t.keywords || []).forEach(function (k) { pairs.push({ id: t.id, k: k.toLowerCase() }); });
    });
    pairs.sort(function (a, b) { return b.k.length - a.k.length; }); // longest keyword wins
    for (var i = 0; i < pairs.length; i++) {
      if (hay.indexOf(pairs[i].k) !== -1) return pairs[i].id;
    }
    return null;
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
    hexToRgb: hexToRgb
  };
})(typeof window !== "undefined" ? window : this);
