import logging
from functools import wraps
from datetime import datetime
from typing import Any, Callable
import json

logger = logging.getLogger(__name__)

def setup_logging(log_level=logging.INFO):
    """Setup logging configuration"""
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

def log_request(func: Callable) -> Callable:
    """Decorator to log API requests"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.utcnow()
        try:
            result = func(*args, **kwargs)
            elapsed_time = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"Request {func.__name__} completed in {elapsed_time:.2f}s")
            return result
        except Exception as e:
            elapsed_time = (datetime.utcnow() - start_time).total_seconds()
            logger.error(f"Request {func.__name__} failed after {elapsed_time:.2f}s: {str(e)}")
            raise
    return wrapper

def serialize_response(data: Any, status: str = 'success', message: str = '') -> dict:
    """Serialize response in a standard format"""
    return {
        'status': status,
        'message': message,
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }

def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """Safely load JSON string"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default

class APIException(Exception):
    """Custom exception for API errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)