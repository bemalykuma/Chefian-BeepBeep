import cv2
import requests
import time
import numpy as np
import json

# API URL และ headers
url = "https://api.aiforthai.in.th/lpr-v2"
headers = {"Apikey": "xQfYMQRvmGHS5qG5UvSdwqkc9xx3JR5D"}

post_url = "http://localhost:5000/api/dataPy"

# เปิดกล้อง
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

last_time = 0
plate_text = ""

while True:
    ret, frame = cap.read()
    if not ret:
        break

    display_frame = frame.copy()

    # แสดงป้ายล่าสุด
    cv2.putText(display_frame, plate_text, (10, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 0), 3)
    cv2.imshow("License Plate OCR", display_frame)

    if time.monotonic() - last_time > 1:
        last_time = time.monotonic()

        # ลดขนาด frame
        small_frame = cv2.resize(frame, (640, 360))
        _, img_encoded = cv2.imencode(".jpg", small_frame)
        files = {"image": ("plate.jpg", img_encoded.tobytes(), "image/jpeg")}
        payload = {"crop": "1", "rotate": "1"}

        try:
            response = requests.post(url, files=files,
                                     data=payload, headers=headers, timeout=5)

            text = response.text.strip()
            if text:
                try:
                    response_data = json.loads(text.replace("'", '"'))
                except json.JSONDecodeError:
                    response_data = []
                    print("JSON Decode Error:", text)
            else:
                response_data = []

            # ถ้ามีข้อมูลทะเบียนให้ใช้
            if response_data and isinstance(response_data, list) and len(response_data) > 0:
                plate_text = response_data[0].get("lpr", "")
                bbox = response_data[0].get("bbox", {})

                # วาดกรอบป้ายทะเบียน
                if bbox:
                    try:
                        x1 = int(bbox.get("xLeftTop", 0) * frame.shape[1] / 640)
                        y1 = int(bbox.get("yLeftTop", 0) * frame.shape[0] / 360)
                        x2 = int(bbox.get("xRightBottom", 0) * frame.shape[1] / 640)
                        y2 = int(bbox.get("yRightBottom", 0) * frame.shape[0] / 360)
                        cv2.rectangle(display_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    except Exception as e:
                        print("BBox parsing error:", e)
            else:
                plate_text = ""  # ไม่มีทะเบียน

            # ส่งข้อมูลทุกครั้ง ไม่ว่าจะ detect หรือไม่
            resps = requests.post(
                post_url,
                data=plate_text.encode("utf-8"),
                headers={"Content-Type": "text/plain; charset=utf-8"},
            )
            print(resps.json())

        except Exception as e:
            plate_text = ""
            print("Error:", e)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
