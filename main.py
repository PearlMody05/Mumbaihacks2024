from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Read the content of the uploaded file (optional processing)
    content = await file.read()
    # Return a response confirming the upload
    return JSONResponse(content={"filename": file.filename, "message": "File uploaded successfully!"})

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI file upload service!"}
