"""
Extract CV data from PDF to JSON using PyMuPDF4LLM
Run this script once to generate cv_data.json
"""
import json
from pathlib import Path
import pymupdf4llm

# Setup
DATA_DIR = Path(__file__).parent / "data"
CV_PATH = DATA_DIR / "CV_LinkedIn.pdf"
OUTPUT_PATH = DATA_DIR / "cv_data.json"

def extract_cv_to_json(pdf_path: Path) -> dict:
    """Extract CV from PDF to structured JSON"""
    print(f"Extracting CV from {pdf_path}...")

    # Extract as markdown
    md_text = pymupdf4llm.to_markdown(str(pdf_path))

    # Split into sections (simple paragraph-based splitting)
    sections = []
    for paragraph in md_text.split('\n\n'):
        paragraph = paragraph.strip()
        if paragraph:
            sections.append(paragraph)

    # Create structured JSON
    cv_data = {
        "full_text": md_text,
        "sections": sections,
        "metadata": {
            "source": "CV_LinkedIn.pdf",
            "total_sections": len(sections),
            "characters": len(md_text)
        }
    }

    return cv_data

def main():
    """Main extraction pipeline"""
    # Extract CV to JSON
    cv_data = extract_cv_to_json(CV_PATH)

    print(f"Extracted CV:")
    print(f"  Total sections: {cv_data['metadata']['total_sections']}")
    print(f"  Total characters: {cv_data['metadata']['characters']}")

    # Save to JSON
    print(f"\nSaving to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(cv_data, f, ensure_ascii=False, indent=2)

    print(f"✓ Done!")
    print(f"  Output: {OUTPUT_PATH}")
    print(f"  Size: {OUTPUT_PATH.stat().st_size / 1024:.1f} KB")

    # Preview first section
    if cv_data['sections']:
        print(f"\nFirst section preview:")
        print(f"  {cv_data['sections'][0][:200]}...")

if __name__ == "__main__":
    main()
