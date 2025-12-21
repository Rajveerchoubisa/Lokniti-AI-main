import os
import uuid
from PIL import Image
import pytesseract
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(upload_file):
    ext = upload_file.filename.split(".")[-1]
    file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.{ext}")

    with open(file_path, "wb") as f:
        f.write(upload_file.file.read())

    return file_path

def extract_from_pdf(path):
    loader = PyPDFLoader(path)
    pages = loader.load()
    return [Document(page_content=p.page_content) for p in pages]

def extract_from_image(path):
    img = Image.open(path)
    text = pytesseract.image_to_string(img)
    return [Document(page_content=text)]
