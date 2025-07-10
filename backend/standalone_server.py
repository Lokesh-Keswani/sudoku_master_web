import http.server
import socketserver
import json
from urllib.parse import urlparse
import os

def is_valid(board, num, pos):
    # Check row
    for x in range(len(board[0])):
        if board[pos[0]][x] == num and pos[1] != x:
            return False
            
    # Check column
    for x in range(len(board)):
        if board[x][pos[1]] == num and pos[0] != x:
            return False
    
    # Check box
    box_x = pos[1] // 3
    box_y = pos[0] // 3

    for i in range(box_y * 3, box_y * 3 + 3):
        for j in range(box_x * 3, box_x * 3 + 3):
            if board[i][j] == num and (i,j) != pos:
                return False
    
    return True

def find_empty(board):
    for i in range(len(board)):
        for j in range(len(board[0])):
            if board[i][j] == 0:
                return (i, j)  # row, col
    return None

def solve(board):
    find = find_empty(board)
    if not find:
        return True
    else:
        row, col = find

    for i in range(1,10):
        if is_valid(board, i, (row, col)):
            board[row][col] = i

            if solve(board):
                return True

            board[row][col] = 0

    return False

def solve_sudoku(puzzle):
    """Main function to solve a Sudoku puzzle"""
    if not puzzle or len(puzzle) != 9 or any(len(row) != 9 for row in puzzle):
        return None
    
    # Convert strings to integers if needed
    board = [[int(cell) if isinstance(cell, str) else cell for cell in row] for row in puzzle]
    
    if solve(board):
        return board
    return None

class SudokuHandler(http.server.SimpleHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            response = {'status': 'ok'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)

    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/solve':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode())
                puzzle = data.get('puzzle')
                
                if not puzzle:
                    self.send_error(400, 'No puzzle provided')
                    return

                solution = solve_sudoku(puzzle)
                
                if solution:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self._send_cors_headers()
                    self.end_headers()
                    response = {'solution': solution}
                    self.wfile.write(json.dumps(response).encode())
                else:
                    self.send_error(400, 'Invalid puzzle or no solution exists')
            except Exception as e:
                self.send_error(400, str(e))
        else:
            self.send_error(404)

def run(port=8000):
    with socketserver.TCPServer(("", port), SudokuHandler) as httpd:
        print(f"Serving at port {port}")
        httpd.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run(port) 