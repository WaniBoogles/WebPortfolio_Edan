#!/usr/bin/env python3
"""Build the deterministic single-file offline bundle WebPortfolio_Edan_Standalone.html.

Reads WebPortfolio_Edan.html, WebPortfolio_Edan.css, the five ordered js/*.js
modules, Pixel Portrait.jpeg, assets/*.png, assets/schedsti-preview.gif, and all
assets/icons/*.svg, inlining CSS, JS, and base64 data URIs while preserving
<script type="application/ld+json"> structured data verbatim.
"""

from __future__ import annotations

import base64
import json
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
HTML_INPUT = ROOT_DIR / "WebPortfolio_Edan.html"
CSS_INPUT = ROOT_DIR / "WebPortfolio_Edan.css"
HTML_OUTPUT = ROOT_DIR / "WebPortfolio_Edan_Standalone.html"

EXPECTED_JS_ORDER = (
    "js/portfolio-data.js",
    "js/canvas-bg.js",
    "js/modals.js",
    "js/terminal.js",
    "js/ui-widgets.js",
    "js/github-activity.js",
)

MIME_TYPES = {
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
}

STYLESHEET_LINK_RE = re.compile(
    r'^(?P<indent>[ \t]*)<link\s+rel="stylesheet"\s+href="WebPortfolio_Edan\.css"\s*/?>[ \t]*$',
    re.MULTILINE,
)

SCRIPT_BLOCK_RE = re.compile(
    r'(?P<indent>[ \t]*)(?P<tags>(?:<script\s+defer\s+src="js/[^"]+"\s*></script>\s*)+)',
    re.MULTILINE,
)

SCRIPT_SRC_RE = re.compile(r'<script\s+defer\s+src="(js/[^"]+)"\s*></script>')

HTML_LOCAL_ATTR_RE = re.compile(
    r'\b(?P<attr>src|href|content)=(?P<quote>["\'])(?P<path>Pixel Portrait\.jpeg|assets/[^"\']+)(?P=quote)'
)

JS_ICON_LITERAL_RE = re.compile(
    r'(?P<quote>["\'])(?P<path>assets/icons/[A-Za-z0-9._-]+\.svg)(?P=quote)'
)

JSON_LD_RE = re.compile(
    r'<script\s+type="application/ld\+json"\s*>(?P<body>.*?)</script>',
    re.DOTALL,
)

HEAD_BLOCK_RE = re.compile(r'<head>(?P<head>.*?)</head>', re.DOTALL)


def encode_data_uri(rel_path: str, cache: dict[str, str]) -> str:
    """Read a workspace-relative asset and return its base64 data URI."""
    if rel_path in cache:
        return cache[rel_path]

    asset_path = ROOT_DIR / rel_path
    if not asset_path.is_file():
        raise FileNotFoundError(f"Referenced local asset not found: {asset_path}")

    suffix = asset_path.suffix.lower()
    mime = MIME_TYPES.get(suffix)
    if not mime:
        raise ValueError(f"Unsupported asset extension {suffix!r} for {rel_path}")

    encoded = base64.b64encode(asset_path.read_bytes()).decode("ascii")
    uri = f"data:{mime};base64,{encoded}"
    cache[rel_path] = uri
    return uri


def escape_closing_tag(content: str, tag_name: str) -> str:
    """Safely escape closing HTML tags (e.g., </script>, </style>) inside inline blocks."""
    pattern = re.compile(rf"</({re.escape(tag_name)})", re.IGNORECASE)
    return pattern.sub(lambda m: f"<\\/{m.group(1)}", content)


def inline_stylesheet(html: str) -> str:
    """Replace the external WebPortfolio_Edan.css link with an inline <style> block."""
    matches = list(STYLESHEET_LINK_RE.finditer(html))
    if len(matches) != 1:
        raise ValueError(
            f"Expected exactly 1 WebPortfolio_Edan.css stylesheet link, found {len(matches)}"
        )

    css_text = CSS_INPUT.read_text(encoding="utf-8").strip("\n")
    css_text = escape_closing_tag(css_text, "style")

    match = matches[0]
    indent = match.group("indent")
    replacement = f"{indent}<style>\n{css_text}\n{indent}</style>"
    return html[: match.start()] + replacement + html[match.end() :]


def inline_scripts(html: str, cache: dict[str, str]) -> tuple[str, int]:
    """Replace the ordered <script defer src='js/...'> tags with one inline <script>."""
    matches = list(SCRIPT_BLOCK_RE.finditer(html))
    if len(matches) != 1:
        raise ValueError(
            f"Expected exactly 1 contiguous js/*.js script block, found {len(matches)}"
        )

    match = matches[0]
    found_srcs = tuple(SCRIPT_SRC_RE.findall(match.group("tags")))
    if found_srcs != EXPECTED_JS_ORDER:
        raise ValueError(
            f"Script order mismatch: expected {EXPECTED_JS_ORDER}, found {found_srcs}"
        )

    js_icon_replacements = 0
    bundled_parts: list[str] = []

    for rel_js in found_srcs:
        js_path = ROOT_DIR / rel_js
        if not js_path.is_file():
            raise FileNotFoundError(f"Missing JS module: {js_path}")

        js_code = js_path.read_text(encoding="utf-8").strip("\n")

        if rel_js == "js/portfolio-data.js":
            def replace_icon(icon_match: re.Match[str]) -> str:
                nonlocal js_icon_replacements
                js_icon_replacements += 1
                quote = icon_match.group("quote")
                uri = encode_data_uri(icon_match.group("path"), cache)
                return f"{quote}{uri}{quote}"

            js_code = JS_ICON_LITERAL_RE.sub(replace_icon, js_code)

        bundled_parts.append(js_code)

    combined_js = "\n\n".join(bundled_parts)
    combined_js = escape_closing_tag(combined_js, "script")

    indent = match.group("indent")
    trailing_ws = "\n" if match.group("tags").endswith("\n") else ""
    replacement = f"{indent}<script>\n{combined_js}\n{indent}</script>{trailing_ws}"
    return html[: match.start()] + replacement + html[match.end() :], js_icon_replacements


def inline_html_assets(html: str, cache: dict[str, str]) -> tuple[str, int]:
    """Inline all src/href/content attributes referencing Pixel Portrait.jpeg or assets/*."""
    count = 0

    def replace_attr(match: re.Match[str]) -> str:
        nonlocal count
        count += 1
        attr = match.group("attr")
        quote = match.group("quote")
        rel_path = match.group("path")
        uri = encode_data_uri(rel_path, cache)
        return f"{attr}={quote}{uri}{quote}"

    updated = HTML_LOCAL_ATTR_RE.sub(replace_attr, html)
    return updated, count


def verify_bundle(source_html: str, standalone_html: str) -> dict[str, object]:
    """Verify the generated standalone HTML satisfies offline, SEO, and no-resume contracts."""
    # Strip base64 payloads before scanning for path tokens so random base64 substrings
    # (e.g., "...js/..." inside an encoded PNG/GIF) do not trigger false positives.
    non_data_html = re.sub(
        r"data:[a-z0-9/+.-]+;base64,[A-Za-z0-9+/=]+",
        "",
        standalone_html,
        flags=re.IGNORECASE,
    )
    unresolved_patterns = (
        ("assets/", re.compile(r"assets/")),
        ("js/", re.compile(r"\bjs/")),
        ("WebPortfolio_Edan.css", re.compile(r"WebPortfolio_Edan\.css")),
        ("Pixel Portrait.jpeg", re.compile(r"Pixel Portrait\.jpeg")),
    )
    unresolved_hits = {
        label: len(pattern.findall(non_data_html))
        for label, pattern in unresolved_patterns
    }
    if any(unresolved_hits.values()):
        raise AssertionError(f"Unresolved local references remain: {unresolved_hits}")

    if re.search(r'<link\s+rel="stylesheet"', standalone_html, re.IGNORECASE):
        raise AssertionError("External stylesheet <link> tag still present")
    if re.search(r"<script[^>]+src=", standalone_html, re.IGNORECASE):
        raise AssertionError("External <script src=...> tag still present")

    head_match = HEAD_BLOCK_RE.search(standalone_html)
    if not head_match:
        raise AssertionError("Missing <head> block in standalone HTML")

    src_ld = JSON_LD_RE.search(source_html)
    out_ld = JSON_LD_RE.search(head_match.group("head"))
    if not src_ld or not out_ld:
        raise AssertionError("Missing <script type='application/ld+json'> in <head>")
    if out_ld.group("body") != src_ld.group("body"):
        raise AssertionError("JSON-LD block in standalone HTML was altered")

    parsed_ld = json.loads(out_ld.group("body"))
    if parsed_ld.get("@context") != "https://schema.org" or not isinstance(
        parsed_ld.get("@graph"), list
    ):
        raise AssertionError("JSON-LD payload missing expected @context or @graph")

    resume_matches = re.findall(
        r"\b(?:resume|curriculum\s+vitae|cv)\b", non_data_html, re.IGNORECASE
    )
    if resume_matches:
        raise AssertionError(f"Unexpected Resume/CV references found: {resume_matches}")

    return {
        "unresolved_hits": unresolved_hits,
        "json_ld_graph_items": len(parsed_ld["@graph"]),
        "resume_hits": len(resume_matches),
    }


def build_standalone() -> None:
    """Build WebPortfolio_Edan_Standalone.html and verify the output."""
    source_html = HTML_INPUT.read_text(encoding="utf-8")
    asset_cache: dict[str, str] = {}

    bundled_html = inline_stylesheet(source_html)
    bundled_html, html_asset_count = inline_html_assets(bundled_html, asset_cache)
    bundled_html, js_icon_count = inline_scripts(bundled_html, asset_cache)

    verification = verify_bundle(source_html, bundled_html)

    HTML_OUTPUT.write_text(bundled_html, encoding="utf-8", newline="\n")
    size_bytes = HTML_OUTPUT.stat().st_size

    print(f"Built {HTML_OUTPUT.name} ({size_bytes:,} bytes / {size_bytes / (1024 * 1024):.2f} MiB)")
    print(
        f"Inlined {len(asset_cache)} unique local assets "
        f"({html_asset_count} HTML attributes, {js_icon_count} JS icon literals)"
    )
    print(f"JSON-LD valid (@graph items: {verification['json_ld_graph_items']})")
    print(f"Unresolved local refs: {verification['unresolved_hits']}")
    print(f"Resume/CV hits: {verification['resume_hits']}")


if __name__ == "__main__":
    build_standalone()
