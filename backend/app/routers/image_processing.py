from fastapi import APIRouter, UploadFile, HTTPException
import numpy as np
import cv2
import pytesseract
from PIL import Image
import io

router = APIRouter()

def preprocess_image(image_bytes):
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                 cv2.THRESH_BINARY_INV, 11, 2)
    
    return thresh

def find_grid(preprocessed_img):
    # Find contours
    contours, _ = cv2.findContours(preprocessed_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Find the largest contour (should be the Sudoku grid)
    max_area = 0
    grid_contour = None
    
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > max_area:
            max_area = area
            grid_contour = contour
    
    if grid_contour is None:
        raise HTTPException(status_code=400, detail="Could not find Sudoku grid in image")
    
    # Get perspective transform
    peri = cv2.arcLength(grid_contour, True)
    approx = cv2.approxPolyDP(grid_contour, 0.02 * peri, True)
    
    if len(approx) != 4:
        raise HTTPException(status_code=400, detail="Could not find proper grid corners")
    
    # Order points
    pts = np.float32([approx[0][0], approx[1][0], approx[2][0], approx[3][0]])
    rect = np.zeros((4, 2), dtype="float32")
    
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # Top-left
    rect[2] = pts[np.argmax(s)]  # Bottom-right
    
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # Top-right
    rect[3] = pts[np.argmax(diff)]  # Bottom-left
    
    return rect

def get_perspective_transform(img, corners):
    # Define destination points (square grid)
    width = height = 450  # Fixed size for output
    dst = np.array([
        [0, 0],
        [width - 1, 0],
        [width - 1, height - 1],
        [0, height - 1]
    ], dtype="float32")
    
    # Calculate perspective transform matrix
    matrix = cv2.getPerspectiveTransform(corners, dst)
    
    # Apply perspective transform
    warped = cv2.warpPerspective(img, matrix, (width, height))
    
    return warped

def extract_digits(warped):
    cell_height = warped.shape[0] // 9
    cell_width = warped.shape[1] // 9
    
    grid = []
    for i in range(9):
        row = []
        for j in range(9):
            # Extract cell
            cell = warped[i*cell_height:(i+1)*cell_height, j*cell_width:(j+1)*cell_width]
            
            # Add padding
            pad = 5
            cell = cell[pad:-pad, pad:-pad]
            
            # Convert to PIL Image for Tesseract
            cell_pil = Image.fromarray(cell)
            
            # Extract digit using Tesseract
            digit = pytesseract.image_to_string(cell_pil, config='--psm 10 --oem 3 -c tessedit_char_whitelist=123456789')
            
            # Clean up the result
            digit = ''.join(filter(str.isdigit, digit))
            row.append(int(digit) if digit.isdigit() else 0)
            
        grid.append(row)
    
    return grid

def validate_grid(grid):
    # Check dimensions
    if len(grid) != 9 or any(len(row) != 9 for row in grid):
        return False
    
    # Check if numbers are valid
    for row in grid:
        if any(not (0 <= num <= 9) for num in row):
            return False
    
    # Count non-zero cells (should be at least 17 for a valid Sudoku)
    filled_cells = sum(1 for row in grid for num in row if num != 0)
    if filled_cells < 17:
        return False
    
    return True

@router.post("/process-sudoku-image")
async def process_sudoku_image(file: UploadFile):
    try:
        # Read image file
        contents = await file.read()
        
        # Preprocess image
        preprocessed = preprocess_image(contents)
        
        # Find and extract grid
        corners = find_grid(preprocessed)
        warped = get_perspective_transform(preprocessed, corners)
        
        # Extract digits
        grid = extract_digits(warped)
        
        # Validate grid
        if not validate_grid(grid):
            raise HTTPException(status_code=400, detail="Invalid Sudoku grid detected")
        
        return {"grid": grid}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 