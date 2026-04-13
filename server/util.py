import base64
import json
import os

import cv2
import joblib
import numpy as np

from wavelet import w2d

__class_name_to_name = {}
__class_name_to_number = {}
__model = None


def classify_image(image_base64_data, image_path=None):
    imgs = get_cropped_image_if_2_eyes(image_path, image_base64_data)

    result = []
    for img in imgs:
        scalled_raw_img = cv2.resize(img, (32, 32))
        img_har = w2d(img, 'db1', 5)
        scalled_img_har = cv2.resize(img_har, (32, 32))

        combined_img = np.vstack(
            (scalled_raw_img.reshape(32 * 32 * 3, 1), scalled_img_har.reshape(32 * 32, 1))
        )

        len_image_array = 32 * 32 * 3 + 32 * 32
        final = combined_img.reshape(1, len_image_array).astype(float)

        proba = __model.predict_proba(final)[0]
        pred = __model.classes_[int(np.argmax(proba))]

        result.append({
            'class': class_number_to_name(pred),
            'class_probability': np.around(proba * 100, 2).tolist(),
            'class_dictionary': __class_name_to_number
        })

    return result


def class_number_to_name(class_num):
    return __class_name_to_name[class_num]


def load_saved_artifacts():
    print("Loading saved artifacts...start")
    global __class_name_to_number
    global __class_name_to_name

    current_dir = os.path.dirname(__file__)
    dict_path = os.path.join(current_dir, "artificats/class_dictionary.json")
    model_path = os.path.join(current_dir, "artificats/saved_model.pkl")

    with open(dict_path, "r") as f:
        __class_name_to_number = json.load(f)
        __class_name_to_name = {v: k for k, v in __class_name_to_number.items()}

    global __model
    if __model is None:
        with open(model_path, 'rb') as f:
            __model = joblib.load(f)
    print("Loading saved artifacts...done")


def get_cv2_image_from_base64_string(b64str):
    """
    credit: https://stackoverflow.com/questions/33754933/python-opencv-read-base64-image-as-cv2-image
    """
    if ',' in b64str:
        encoded_data = b64str.split(',')[1]
    else:
        encoded_data = b64str

    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def get_cropped_image_if_2_eyes(image_path, image_base64_data):
    current_dir = os.path.dirname(__file__)
    face_cascade_path = os.path.join(current_dir, 'OpenCV/haarcascades/haarcascade_frontalface_default.xml')
    eye_cascade_path = os.path.join(current_dir, 'OpenCV/haarcascades/haarcascade_eye.xml')

    face_cascade = cv2.CascadeClassifier(face_cascade_path)
    eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

    if image_path:
        img = cv2.imread(image_path)
    else:
        img = get_cv2_image_from_base64_string(image_base64_data)

    if img is None:
        return []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)

    cropped_faces = []
    for (x, y, w, h) in faces:
        roi_gray = gray[y:y + h, x:x + w]
        roi_color = img[y:y + h, x:x + w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        if len(eyes) >= 2:
            cropped_faces.append(roi_color)

    return cropped_faces
