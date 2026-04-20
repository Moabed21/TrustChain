
import io
import base64

import qrcode
from qrcode.constants import ERROR_CORRECT_H


def generate_qr(encrypted_cid: str) -> str:
    qr = qrcode.QRCode(
        version=None,          
        error_correction=ERROR_CORRECT_H,  
        box_size=10,           
        border=4,              
    )
    qr.add_data(encrypted_cid)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return qr_base64


def decode_qr(qr_base64: str) -> str:
    
    from pyzbar.pyzbar import decode as pyzbar_decode
    from PIL import Image

    img_bytes = base64.b64decode(qr_base64)
    img = Image.open(io.BytesIO(img_bytes))

    results = pyzbar_decode(img)
    if not results:
        raise ValueError("No QR code found in the provided image")

    return results[0].data.decode("utf-8")
