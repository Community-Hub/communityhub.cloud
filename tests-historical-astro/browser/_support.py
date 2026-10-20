"""Local build locations and HTTP transport for the TypeScript browser regressions."""

import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

PROJECT = Path(__file__).resolve().parents[2]
SITE = PROJECT / "dist"
RUNTIME = PROJECT / "tests" / "runtime"


def built_styles():
    """Read the CSS emitted by Astro, including its hashed filenames."""
    styles = sorted((SITE / "_astro").glob("*.css"))
    if not styles:
        raise RuntimeError("Run npm run build in site_ts before checking generated CSS")
    return "\n".join(path.read_text(encoding="utf-8") for path in styles)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


class LocalSite:
    """Serve the generated site so browser ES modules use a real HTTP origin."""

    def __init__(self):
        if not (SITE / "index.html").is_file():
            raise RuntimeError("Run npm run build in site_ts before browser tests")
        handler = functools.partial(QuietHandler, directory=str(SITE))
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self.server.daemon_threads = True
        self.thread = Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.server.server_port}/"

    def close(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
