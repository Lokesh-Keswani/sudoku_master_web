from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse
import os
import sys
from app.core.sudoku import solve_sudoku, SudokuGenerator

class SudokuHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/health':
            self._set_headers()
            response = {'status': 'ok'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode())
        except:
            data = {}

        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/solve':
            puzzle = data.get('puzzle')
            if not puzzle:
                self._set_headers(400)
                response = {'error': 'No puzzle provided'}
                self.wfile.write(json.dumps(response).encode())
                return

            solution = solve_sudoku(puzzle)
            if solution:
                self._set_headers()
                response = {'solution': solution}
            else:
                self._set_headers(400)
                response = {'error': 'Invalid puzzle or no solution exists'}
            
            self.wfile.write(json.dumps(response).encode())
        elif parsed_path.path == '/api/new':
            difficulty = data.get('difficulty', 'medium')
            generator = SudokuGenerator()
            puzzle, solution = generator.generate_puzzle(difficulty)
            self._set_headers()
            response = {'puzzle': puzzle, 'solution': solution}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())

def run(server_class=HTTPServer, handler_class=SudokuHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run() 