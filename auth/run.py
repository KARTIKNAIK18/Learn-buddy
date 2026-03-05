import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Bind to 0.0.0.0 to allow external connections
        port=port,
        reload=False
    )
