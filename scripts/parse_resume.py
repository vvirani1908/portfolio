#!/usr/bin/env python3
"""
parse_resume.py — update portfolio.json from a resume PDF.

Usage:
    1. Drop your new resume at:  portfolio-python/static/resume.pdf
    2. Set env var:              export ANTHROPIC_API_KEY=sk-ant-...
    3. Run:                      python scripts/parse_resume.py

Without the API key it prints extracted text so you can manually update
data/portfolio.json.
"""

import json
import os
import sys
from pathlib import Path

ROOT        = Path(__file__).parent.parent
PDF_PATH    = ROOT / "static" / "resume.pdf"
DATA_PATH   = ROOT / "data" / "portfolio.json"


def extract_text(pdf_path: Path) -> str:
    """Extract plain text from a PDF using pdfplumber."""
    try:
        import pdfplumber
    except ImportError:
        sys.exit("Install pdfplumber:  pip install pdfplumber")

    text_parts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts)


def parse_with_claude(text: str) -> dict:
    """Send resume text to Claude and get back structured portfolio data."""
    try:
        import anthropic
    except ImportError:
        sys.exit("Install anthropic:  pip install anthropic")

    client = anthropic.Anthropic()

    with open(DATA_PATH) as f:
        current = json.load(f)

    prompt = f"""
You are parsing a resume into structured JSON for a portfolio website.
Given the resume text below, output ONLY valid JSON — no markdown fences, no commentary.

The JSON must match this exact schema (keep every key, fill missing values with null or empty lists):

{json.dumps(current, indent=2)}

Infer reasonable values where the resume is ambiguous.
For project "color" fields use Tailwind gradient class strings.
For LinkedIn/GitHub use placeholder URLs if not present in text.

Resume text:
{text}
""".strip()

    message = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    # Strip accidental markdown fences
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    return json.loads(raw)


def main():
    if not PDF_PATH.exists():
        sys.exit(f"Resume not found: {PDF_PATH}\nCopy your PDF there and retry.")

    print(f"📄  Extracting text from {PDF_PATH.name}…")
    text = extract_text(PDF_PATH)
    print(f"✅  {len(text)} characters extracted.\n")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("⚠️   ANTHROPIC_API_KEY not set — printing extracted text instead.\n")
        print(text[:2000])
        print("\nSet the key and re-run to auto-update data/portfolio.json.")
        return

    print("🤖  Asking Claude to structure the data…")
    data = parse_with_claude(text)

    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"✅  data/portfolio.json updated!\n   Restart Flask to see changes.")


if __name__ == "__main__":
    main()
