from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "output" / "xhs-mini-tool" / "dist"
TARGET = ROOT / "output" / "xhs-mini-tool" / "一卷山河.zip"
ALLOWED = {
    ".html",
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".woff",
    ".woff2",
    ".json",
}
MAX_ZIP_BYTES = 10 * 1024 * 1024
FIXED_TIMESTAMP = (2026, 1, 1, 0, 0, 0)


def artifact_files() -> list[Path]:
    files = sorted(path for path in DIST.rglob("*") if path.is_file())
    html_files = [path for path in files if path.suffix.lower() == ".html"]
    if html_files != [DIST / "index.html"]:
        raise SystemExit("artifact must contain exactly one HTML file at root: index.html")

    unsupported = [path.relative_to(DIST) for path in files if path.suffix.lower() not in ALLOWED]
    if unsupported:
        names = ", ".join(path.as_posix() for path in unsupported)
        raise SystemExit(f"artifact contains an unsupported file type: {names}")
    return files


def package(files: list[Path]) -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.unlink(missing_ok=True)
    with ZipFile(TARGET, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            info = ZipInfo(path.relative_to(DIST).as_posix(), FIXED_TIMESTAMP)
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes(), compresslevel=9)

    if TARGET.stat().st_size > MAX_ZIP_BYTES:
        TARGET.unlink()
        raise SystemExit("ZIP exceeds 10 MiB")


if __name__ == "__main__":
    package(artifact_files())
    print(TARGET)
