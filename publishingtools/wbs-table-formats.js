/* ============================================================================
   WBS Table Formats — editable back end for the Table Builder
   ----------------------------------------------------------------------------
   Edit FORMATS / MODIFIERS to change which classes each style applies.
   Blue 2 and Grey class names (type2 / type3) are best guesses — CONFIRM them
   against the site and correct here if needed.
   ========================================================================== */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function parseStyle(str) {
    var m = {};
    (str || "").split(";").forEach(function (d) {
      var i = d.indexOf(":"); if (i === -1) return;
      var p = d.slice(0, i).trim().toLowerCase(); if (p) m[p] = d.slice(i + 1).trim();
    });
    return m;
  }
  function serializeStyle(m) {
    return Object.keys(m).map(function (k) { return k + ": " + m[k] + ";"; }).join(" ");
  }

  // --- Format definitions --------------------------------------------------
  var FORMATS = [
    { id: "none", name: "No formatting", desc: "White background, no borders. Header cells use bold black text.",
      classes: [], centered: false, width: null },
    { id: "standard", name: "Standard", desc: "Horizontal lines between rows, no vertical lines. Bold black header text.",
      classes: ["table"], centered: false, width: null },
    { id: "bordered", name: "Bordered", desc: "Solid borders around all cells. Bold black header text.",
      classes: ["table", "table-bordered"], centered: false, width: null },
    { id: "blue1", name: "Blue 1 (Standard)", desc: "Centred, light grey background, dark grey cell borders, slight row striping, dark blue header with bold white text. Best for accessibility and branding.",
      classes: ["table", "table-bordered", "table-striped", "wbs-lu-table-type1"], centered: true, width: "80.0%" },
    { id: "blue2", name: "Blue 2", desc: "Centred, pale blue background with white borders. Mid-blue header with bold white text.",
      classes: ["wbs-lu-table-type3"], centered: true, width: "80.0%" },
    { id: "grey", name: "Grey", desc: "Centred, white background, no borders. Light grey header with white borders and bold black text.",
      classes: ["wbs-lu-table-type2"], centered: true, width: "80.0%" }
  ];

  // Modifiers stack on top of any base format.
  var MODIFIERS = [
    { id: "striped", name: "Striped", cls: "table-striped", desc: "Alternating white / grey rows." },
    { id: "condensed", name: "Condensed", cls: "table-condensed", desc: "Tighter cell padding." },
    { id: "hover", name: "Hover", cls: "table-hover", desc: "Highlight a row on hover." }
  ];

  function fmtById(id) { for (var i = 0; i < FORMATS.length; i++) if (FORMATS[i].id === id) return FORMATS[i]; return FORMATS[0]; }
  function modById(id) { for (var i = 0; i < MODIFIERS.length; i++) if (MODIFIERS[i].id === id) return MODIFIERS[i]; return null; }

  function classesFor(formatId, modIds) {
    var cls = (fmtById(formatId).classes || []).slice();
    (modIds || []).forEach(function (m) {
      var md = modById(m);
      if (md && cls.indexOf(md.cls) === -1) cls.push(md.cls);
    });
    return cls;
  }

  // Build the table style string: width first (if any), then border-collapse.
  function tableStyle(formatId, widthOverride, hasClasses) {
    var f = fmtById(formatId);
    var w = (widthOverride != null && widthOverride !== "") ? widthOverride : f.width;
    var m = {};
    if (w) m["width"] = /%|px|em$/.test(w) ? w : (w + "%");
    if (hasClasses) m["border-collapse"] = "collapse";
    return serializeStyle(m);
  }

  // --- Build a table from a 2D array of strings ----------------------------
  // opts: { format, modifiers:[], width, headerRows, firstColHeader }
  function buildTable(rows, opts) {
    opts = opts || {};
    rows = rows || [];
    var cls = classesFor(opts.format, opts.modifiers);
    var clsAttr = cls.length ? ' class="' + cls.join(" ") + '"' : "";
    var style = tableStyle(opts.format, opts.width, cls.length > 0);
    var styleAttr = style ? ' style="' + style + '"' : "";
    var hRows = Math.max(0, parseInt(opts.headerRows, 10) || 0);

    var body = rows.map(function (row, r) {
      var cells = (row || []).map(function (cell, c) {
        var isHead = r < hRows || (opts.firstColHeader && c === 0);
        var txt = esc(cell == null ? "" : String(cell)).trim();
        var inner = txt ? (isHead ? "<strong>" + txt + "</strong>" : txt) : "&nbsp;";
        var tag = isHead ? "th" : "td";
        return "<" + tag + ">" + inner + "</" + tag + ">";
      }).join("\n");
      return "<tr>\n" + cells + "\n</tr>";
    }).join("\n");

    return '<div class="table-responsive" style="text-align: left;">\n' +
      "<table" + clsAttr + styleAttr + ">\n<tbody>\n" + body + "\n</tbody>\n</table>\n</div>";
  }

  // --- Reformat an existing pasted HTML table ------------------------------
  function renameCells(row, tag) {
    Array.prototype.slice.call(row.children).forEach(function (cell) {
      var t = cell.tagName.toLowerCase();
      if ((t === "td" || t === "th") && t !== tag) {
        var n = row.ownerDocument.createElement(tag);
        for (var i = 0; i < cell.attributes.length; i++) n.setAttribute(cell.attributes[i].name, cell.attributes[i].value);
        while (cell.firstChild) n.appendChild(cell.firstChild);
        row.replaceChild(n, cell);
      }
    });
  }

  function reformatTable(html, opts) {
    opts = opts || {};
    if (!html || !html.trim()) return "";
    var doc = new DOMParser().parseFromString(html, "text/html");
    var table = doc.querySelector("table");
    if (!table) return null;

    // Strip legacy presentational attributes.
    ["border", "cellspacing", "cellpadding"].forEach(function (a) { table.removeAttribute(a); });

    // Classes.
    var cls = classesFor(opts.format, opts.modifiers);
    if (cls.length) table.setAttribute("class", cls.join(" ")); else table.removeAttribute("class");

    // Style: keep existing (minus height), set width first then border-collapse.
    var st = parseStyle(table.getAttribute("style"));
    delete st.height;
    var ordered = {};
    var f = fmtById(opts.format);
    var w = (opts.width != null && opts.width !== "") ? opts.width : f.width;
    if (w) ordered["width"] = /%|px|em$/.test(w) ? w : (w + "%");
    if (cls.length) ordered["border-collapse"] = "collapse";
    Object.keys(st).forEach(function (k) { if (k !== "width" && k !== "border-collapse") ordered[k] = st[k]; });
    var styleStr = serializeStyle(ordered);
    if (styleStr) table.setAttribute("style", styleStr); else table.removeAttribute("style");

    // Header rows -> <th>.
    var hRows = Math.max(0, parseInt(opts.headerRows, 10) || 0);
    var trs = table.querySelectorAll("tr");
    for (var i = 0; i < hRows && i < trs.length; i++) renameCells(trs[i], "th");
    if (opts.firstColHeader) {
      Array.prototype.slice.call(trs).forEach(function (tr, idx) {
        if (idx < hRows) return; // already all-th
        var first = tr.querySelector("td, th");
        if (first && first.tagName.toLowerCase() === "td") {
          var n = doc.createElement("th");
          for (var k = 0; k < first.attributes.length; k++) n.setAttribute(first.attributes[k].name, first.attributes[k].value);
          while (first.firstChild) n.appendChild(first.firstChild);
          tr.replaceChild(n, first);
        }
      });
    }

    // Wrapper: reuse .table-responsive if present, else create one.
    var resp = doc.querySelector(".table-responsive");
    var out;
    if (resp) { resp.style.textAlign = "left"; out = resp.outerHTML; }
    else { out = '<div class="table-responsive" style="text-align: left;">\n' + table.outerHTML + "\n</div>"; }

    return out.replace(/<tbody>/g, "<tbody>\n").replace(/<\/tr>/g, "</tr>\n")
      .replace(/<\/tbody>/g, "\n</tbody>").replace(/\n{2,}/g, "\n");
  }

  // --- CSV parser (handles quotes, embedded commas/newlines) ---------------
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false;
    text = String(text || "");
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += ch;
      } else if (ch === '"') { q = true; }
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (ch === "\r") { /* skip */ }
      else cur += ch;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    // Drop a trailing fully-empty row (common with trailing newline).
    if (rows.length && rows[rows.length - 1].every(function (c) { return c === ""; })) rows.pop();
    return rows;
  }

  global.WBSTables = {
    formats: FORMATS,
    modifiers: MODIFIERS,
    buildTable: buildTable,
    reformatTable: reformatTable,
    parseCSV: parseCSV,
    classesFor: classesFor
  };
})(typeof window !== "undefined" ? window : this);
