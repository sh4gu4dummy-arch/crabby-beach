"""Build versioned zip packages. Run only when the user asks for exports."""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

ROOT = Path("/workspace")
_first = ROOT.joinpath("VERSION").read_text().splitlines()[0]
_m = re.search(r"v\.\d+", _first)
VERSION = _m.group(0) if _m else "v.000"
VERSION_CODE = int(re.sub(r"\D", "", VERSION) or "0")
VERSION_NAME = f"0.{VERSION_CODE:03d}"
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
    index = dest / "index.html"
    if index.exists():
        html = index.read_text(encoding="utf-8")
        html = html.replace(' type="module"', "").replace(" crossorigin", "")
        scripts = re.findall(r"<script[^>]*></script>|<script[^>]*src=\"[^\"]+\"[^>]*>\s*</script>", html)
        for tag in scripts:
            html = html.replace(tag, "", 1)
        if scripts:
            block = "\n    ".join(scripts)
            boot = (
                '    <div id="app">'
                '<div style="min-height:100vh;display:grid;place-items:center;font-family:sans-serif;color:#3a2a22">'
                '<div style="background:#fff6e8;padding:1.5rem 2rem;border-radius:1.5rem;text-align:center">'
                '<p style="font-size:1.5rem;font-weight:700;margin:0">Crabby Beach</p>'
                '<p style="margin:.5rem 0 0">Warming up the sand…</p>'
                "</div></div></div>\n"
                "    <script>window.onerror=function(m){var a=document.getElementById('app');"
                "if(a)a.innerHTML='<div style=\"padding:2rem;font-family:sans-serif;background:#fff6e8;margin:2rem;border-radius:1rem\">"
                "<p><b>Could not start</b></p><p>'+m+'</p></div>';};</script>\n"
                f"    {block}\n"
            )
            html = html.replace('<div id="app"></div>', "")
            html = html.replace("</body>", boot + "  </body>")
        index.write_text(html, encoding="utf-8")
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
    if not icon.exists():
        icon = ROOT / "public/icon-192.png"
    if icon.exists():
        shutil.copy2(icon, res / "mipmap-xxxhdpi/ic_launcher.png")
        round_icon = ROOT / "public/icons/icon-192-round.png"
        shutil.copy2(round_icon if round_icon.exists() else icon, res / "mipmap-xxxhdpi/ic_launcher_round.png")

    (pkg / "settings.gradle").write_text(
        "pluginManagement {\n"
        "  repositories { google(); mavenCentral(); gradlePluginPortal() }\n"
        "}\n"
        "dependencyResolutionManagement {\n"
        "  repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)\n"
        "  repositories { google(); mavenCentral() }\n"
        "}\n"
        "rootProject.name = 'CrabbyBeach'\n"
        "include ':app'\n",
        encoding="utf-8",
    )
    (pkg / "build.gradle").write_text(
        "plugins { id 'com.android.application' version '8.2.2' apply false }\n",
        encoding="utf-8",
    )
    (pkg / "gradle.properties").write_text(
        "org.gradle.jvmargs=-Xmx2g\nandroid.useAndroidX=true\nandroid.nonTransitiveRClass=true\n",
        encoding="utf-8",
    )
    (pkg / "app/build.gradle").write_text(
        "plugins { id 'com.android.application' }\n"
        "android {\n"
        "  namespace 'beach.crabby'\n"
        "  compileSdk 34\n"
        "  defaultConfig {\n"
        "    applicationId 'beach.crabby'\n"
        "    minSdk 24\n"
        "    targetSdk 34\n"
        f"    versionCode {VERSION_CODE}\n"
        f"    versionName '{VERSION_NAME}'\n"
        "  }\n"
        "  compileOptions {\n"
        "    sourceCompatibility JavaVersion.VERSION_17\n"
        "    targetCompatibility JavaVersion.VERSION_17\n"
        "  }\n"
        "  buildTypes {\n"
        "    release { minifyEnabled false }\n"
        "    debug { minifyEnabled false }\n"
        "  }\n"
        "}\n"
        "dependencies {\n"
        "  implementation 'androidx.webkit:webkit:1.11.0'\n"
        "}\n",
        encoding="utf-8",
    )
    (pkg / "app/src/main/AndroidManifest.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '  <uses-permission android:name="android.permission.INTERNET" />\n'
        "  <application android:label=\"Crabby Beach\" android:icon=\"@mipmap/ic_launcher\" android:hardwareAccelerated=\"true\" android:usesCleartextTraffic=\"true\">\n"
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
        "import android.os.Build;\n"
        "import android.webkit.WebChromeClient;\n"
        "import android.webkit.WebSettings;\n"
        "import android.webkit.WebView;\n"
        "import android.webkit.WebResourceRequest;\n"
        "import android.webkit.WebResourceResponse;\n"
        "import android.webkit.WebViewClient;\n"
        "import androidx.webkit.WebViewAssetLoader;\n"
        "public class MainActivity extends Activity {\n"
        "  @SuppressLint(\"SetJavaScriptEnabled\")\n"
        "  @Override protected void onCreate(Bundle savedInstanceState) {\n"
        "    super.onCreate(savedInstanceState);\n"
        "    WebView w = new WebView(this);\n"
        "    setContentView(w);\n"
        "    WebSettings s = w.getSettings();\n"
        "    s.setJavaScriptEnabled(true);\n"
        "    s.setDomStorageEnabled(true);\n"
        "    s.setDatabaseEnabled(true);\n"
        "    s.setMediaPlaybackRequiresUserGesture(false);\n"
        "    s.setAllowFileAccess(true);\n"
        "    s.setAllowContentAccess(true);\n"
        "    s.setAllowFileAccessFromFileURLs(true);\n"
        "    s.setAllowUniversalAccessFromFileURLs(true);\n"
        "    if (Build.VERSION.SDK_INT >= 21) {\n"
        "      s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);\n"
        "    }\n"
        "    final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()\n"
        "      .addPathHandler(\"/assets/\", new WebViewAssetLoader.AssetsPathHandler(this))\n"
        "      .build();\n"
        "    w.setWebViewClient(new WebViewClient() {\n"
        "      @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {\n"
        "        return loader.shouldInterceptRequest(req.getUrl());\n"
        "      }\n"
        "    });\n"
        "    w.setWebChromeClient(new WebChromeClient());\n"
        "    w.loadUrl(\"https://appassets.androidplatform.net/assets/www/index.html\");\n"
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
            if rel.as_posix().startswith("public/downloads/") and rel.suffix in {".zip", ".apk"}:
                continue
            zf.write(path, f"crabby-beach-{VERSION}-codebase/{rel.as_posix()}")
    print("wrote", dest, dest.stat().st_size)


def build_apk(android_pkg: Path) -> None:
    build = Path("/tmp/apk-build")
    if build.exists():
        shutil.rmtree(build)
    shutil.copytree(android_pkg, build)
    (build / "local.properties").write_text("sdk.dir=/tmp/android-sdk\n", encoding="utf-8")
    env = os.environ.copy()
    env["ANDROID_HOME"] = "/tmp/android-sdk"
    env["ANDROID_SDK_ROOT"] = "/tmp/android-sdk"
    subprocess.run(
        ["/tmp/gradle-8.4/bin/gradle", ":app:assembleDebug", "--no-daemon"],
        cwd=build,
        env=env,
        check=True,
    )
    apk = next((build / "app/build/outputs/apk").rglob("*.apk"))
    dest = DL / f"crabby-beach-{VERSION}.apk"
    shutil.copy2(apk, dest)
    print("wrote", dest, dest.stat().st_size)


def main() -> None:
    portable = assemble_portable()
    zip_dir(portable, DL / f"crabby-beach-{VERSION}-portable.zip", f"crabby-beach-{VERSION}-portable")
    android = write_android(portable)
    zip_dir(android, DL / f"crabby-beach-{VERSION}-android.zip", f"crabby-beach-{VERSION}-android")
    codebase_zip()
    build_apk(android)
    subprocess.run(["node", str(ROOT / "scripts/write-download-manifest.mjs")], check=True)


if __name__ == "__main__":
    main()
