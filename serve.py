"""Local preview server for the game: static files, never cached."""
import http.server, socketserver, sys

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, *a):
        pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', port), Handler) as httpd:
    print('Closed Won running at http://localhost:%d' % port, flush=True)
    httpd.serve_forever()
