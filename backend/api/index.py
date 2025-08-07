import sys
import os
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.main import app
from mangum import Adapter

# Create handler for Vercel
handler = Adapter(app) 