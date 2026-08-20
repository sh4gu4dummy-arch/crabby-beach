"""Build versioned zip packages. Run only when the user asks for exports."""
from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

ROOT = Path("/workspace")
VERSION = ROOT.joinpath("VERSION").read_text().strip().split()[-1]
DL = ROOT / "public/downloads"
PORTABLE_SRC = Path("/tmp/crabby-portable")
ANDROID = Path("/tmp/crabby-android")
SKIP_ROOT = {
    "node_modules",
    ".git",
    "screenshots",
    "artifacts",
    "dist",
    ".output",
    ".tanstack",
    ".nitro",
}


def zip_dir(src: Path, dest: Path, arc_prefix: str) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in src.rglob("*"):
            if path.is_dir():
                continue
            rel = path.relative_to(src)
            zf.write(path, arc_prefix + "/" + rel.as_posix())
    print("wrote", dest, dest.stat().st_size)


def copy_public_assets(dest: Path) -> None:
    for name in ("game", "voice", "fonts", "icons"):
        src = ROOT / "public" / name
        if src.exists():
            shutil.copytree(src, dest / name, dirs_exist_ok=True)
    for name in ("icon-192.png", "icon-512.png", "apple-touch-icon.png", "favicon.svg"):
        src = ROOT / "public" / name
        if src.exists():
            shutil.copy2(src, dest / name)


def rewrite_font_urls(root: Path) -> None:
    for css in root.rglob("*.css"):
        text = css.read_text(encoding="utf-8")
        css.write_text(text.replace("/fonts/", "./fonts/").replace('url(/fonts/', "url(./fonts/"), encoding="utf-8")


def assemble_portable() -> Path:
    dest = Path("/tmp/crabby-portable-pack")
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    if not PORTABLE_SRC.exists():
        raise SystemExit("portable build missing")
    for item in PORTABLE_SRC.iterdir():
        target = dest / ( "index.html" if item.name == "portable.html" else item.name)
        if item.is_dir():
            shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)
    copy_public_assets(dest)
    rewrite_font_urls(dest)
    readme = dest / "README.txt"
    readme.write_text(
        f"Crabby Beach {VERSION} — portable\n\n"
        "Unzip this folder.\n"
        "Open index.html in Chrome or Edge.\n"
        "No install. No internet. Kids just play.\n",
        encoding="utf-8",
    )
    return dest


def write_android(www: Path) -> Path:
    if ANDROID.exists():
        shutil.rmtree(ANDROID)
    pkg = ANDROID / "crabby-beach-android"
    res = pkg / "app/src/main/res"
    assets = pkg / "app/src/main/assets/www"
    java = pkg / "app/src/main/java/beach/crabby"
    for p in (res / "mipmap-xxxhdpi", java, assets):
        p.mkdir(parents=True, exist_ok=True)

    shutil.copytree(www, assets, dirs_exist_ok=True)
    icon = ROOT / "public/icons/icon-192.png"
    if icon.exists():
        shutil.copy2(icon, res / "mipmap-xxxhdpi/ic_launcher.png")
        shutil.copy2(ROOT / "public/icons/icon-96.png", res / "mipmap-xxxhdpi/ic_launcher_round.png")

    (pkg / "settings.gradle").write_text("rootProject.name = 'CrabbyBeach'\ninclude ':app'\n", encoding="utf-8")
    (pkg / "build.gradle").write_text(
        "buildscript {\n"
        "  repositories { google(); mavenCentral() }\n"
        "  dependencies { classpath 'com.android.tools.build:gradle:8.2.2' }\n"
        "}\nallprojects { repositories { google(); mavenCentral() } }\n",
        encoding="utf-8",
    )
    (pkg / "app/build.gradle").write_text(
        "plugins { id 'com.android.application' }\n"
        "android {\n"
        "  namespace 'beach.crabby'\n"
        "  compileSdk 34\n"
        "  defaultConfig { applicationId 'beach.crabby' minSdk 24 targetSdk 34 versionCode 15 versionName '0.015' }\n"
        "  buildTypes { release { minifyEnabled false } }\n"
        "}\n",
        encoding="utf-8",
    )
    (pkg / "app/src/main/AndroidManifest.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '  <uses-permission android:name="android.permission.INTERNET" />\n'
        "  <application android:label=\"Crabby Beach\" android:icon=\"@mipmap/ic_launcher\" android:usesCleartextTraffic=\"true\">\n"
        '    <activity android:name=".MainActivity" android:exported="true" android:screenOrientation="portrait" android:configChanges="orientation|screenSize">\n'
        "      <intent-filter>\n"
        '        <action android:name="android.intent.action.MAIN" />\n'
        '        <category android:name="android.intent.category.LAUNCHER" />\n'
        "      </intent-filter>\n"
        "    </activity>\n"
        "  </application>\n"
        "</manifest>\n",
        encoding="utf-8",
    )
    (java / "MainActivity.java").write_text(
        "package beach.crabby;\n"
        "import android.annotation.SuppressLint;\n"
        "import android.app.Activity;\n"
        "import android.os.Bundle;\n"
        "import android.webkit.WebChromeClient;\n"
        "import android.webkit.WebSettings;\n"
        "import android.webkit.WebView;\n"
        "import android.webkit.WebViewClient;\n"
        "public class MainActivity extends Activity {\n"
        "  @SuppressLint(\"SetJavaScriptEnabled\")\n"
        "  @Override protected void onCreate(Bundle savedInstanceState) {\n"
        "    super.onCreate(savedInstanceState);\n"
        "    WebView w = new WebView(this);\n"
        "    setContentView(w);\n"
        "    WebSettings s = w.getSettings();\n"
        "    s.setJavaScriptEnabled(true);\n"
        "    s.setDomStorageEnabled(true);\n"
        "    s.setMediaPlaybackRequiresUserGesture(false);\n"
        "    w.setWebViewClient(new WebViewClient());\n"
        "    w.setWebChromeClient(new WebChromeClient());\n"
        "    w.loadUrl(\"file:///android_asset/www/index.html\");\n"
        "  }\n"
        "}\n",
        encoding="utf-8",
    )
    (pkg / "README.md").write_text(
        f"# Crabby Beach {VERSION} — Android project\n\n"
        "This is a real Android project, not an APK.\n"
        "A signed installable `.apk` needs Android Studio (or the Android SDK) on your computer.\n"
        "We do not ship a fake APK.\n\n"
        "## Make the APK\n"
        "1. Open this folder in Android Studio.\n"
        "2. Let Gradle sync.\n"
        "3. Build > Build Bundle(s) / APK(s) > Build APK(s).\n"
        "4. Install the APK on a phone.\n\n"
        "The game is already inside `app/src/main/assets/www`.\n"
        "Portrait is locked. No network is required to play.\n",
        encoding="utf-8",
    )
    return pkg


def codebase_zip() -> None:
    dest = DL / f"crabby-beach-{VERSION}-codebase.zip"
    if dest.exists():
        dest.unlink()
    with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in ROOT.rglob("*"):
            rel = path.relative_to(ROOT)
            parts = rel.parts
            if not parts:
                continue
            if parts[0] in SKIP_ROOT:
                continue
            if path.is_dir():
                continue
            if rel.as_posix().startswith("public/downloads/") and rel.suffix == ".zip":
                continue
            zf.write(path, f"crabby-beach-{VERSION}-codebase/{rel.as_posix()}")
    print("wrote", dest, dest.stat().st_size)


def main() -> None:
    portable = assemble_portable()
    zip_dir(portable, DL / f"crabby-beach-{VERSION}-portable.zip", f"crabby-beach-{VERSION}-portable")
    android = write_android(portable)
    zip_dir(android, DL / f"crabby-beach-{VERSION}-android.zip", f"crabby-beach-{VERSION}-android")
    codebase_zip()


if __name__ == "__main__":
    main()
