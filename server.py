"""Serve the game and the Nebulab health check."""

import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class GameHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', '3')
            self.end_headers()
            self.wfile.write(b'ok\n')
            return
        super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', '3')
            self.end_headers()
            return
        super().do_HEAD()


if __name__ == '__main__':
    app_dir = Path(__file__).resolve().parent / 'app'
    handler = partial(GameHandler, directory=str(app_dir))
    server = ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '8080'))), handler)
    server.serve_forever()
