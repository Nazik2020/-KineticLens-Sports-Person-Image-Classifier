# 🏆 KineticLens — Sports Person Image Classifier

> An end-to-end machine learning system that identifies world-famous athletes from facial images using classical computer vision and supervised learning.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![OpenCV](https://img.shields.io/badge/OpenCV-4.x-green?style=flat-square&logo=opencv)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.x-orange?style=flat-square&logo=scikit-learn)
![Flask](https://img.shields.io/badge/Flask-2.x-lightgrey?style=flat-square&logo=flask)

---

## 📌 Project Overview

**KineticLens** is a full-stack sports celebrity recognition system built from scratch using classical machine learning techniques. The system accepts a facial image, detects the face, extracts features using wavelet transforms, and classifies the person using a Support Vector Machine classifier.

This project demonstrates a complete ML pipeline — from raw data collection and preprocessing, through feature engineering and model training, to a deployed REST API and interactive frontend UI.

---

## 🎯 Supported Athletes

| Athlete | Sport |
|---|---|
| Virat Kohli | 🏏 Cricket |
| Serena Williams | 🎾 Tennis |
| Roger Federer | 🎾 Tennis |
| Maria Sharapova | 🎾 Tennis |
| Lionel Messi | ⚽ Football |

---

## 🧠 ML Pipeline

```
Raw Images (scraped per athlete)
         ↓
Face Detection — OpenCV Haar Cascade
         ↓
2-Eye Filter — ensures frontal, usable faces only
         ↓
Feature Engineering:
  ├── Raw pixels  →  resize 32×32 → flatten (3072 values)
  └── Wavelet transform (db1, level 5) → resize 32×32 → flatten (1024 values)
  combined → 4096-dimensional feature vector per image
         ↓
Label Encoding (athlete name → integer)
         ↓
Train/Test Split (75/25, stratified)
         ↓
GridSearchCV — SVM, Random Forest, Logistic Regression
         ↓
Best Model: SVM (kernel=rbf, C=10) → ~53% accuracy
         ↓
Saved as saved_model.pkl + class_dictionary.json
         ↓
Flask REST API → Frontend UI
```

---

## 🔬 Why Wavelet Transform?

Standard pixel features lose edge and texture information. The wavelet transform decomposes an image into frequency components and zeroes out the low-frequency (approximation) component, keeping only **high-frequency edge and texture details**. These structural features are more discriminative for facial recognition than raw color values alone.

```
Raw image → wavedec2() → zero out approximation coefficients → waverec2()
                                                                    ↓
                                              Edge-highlighted grayscale image
```

---

## 📊 Model Performance

| Model | Cross-Val Score | Test Accuracy |
|---|---|---|
| **SVM (rbf, C=10)** | **54.7%** | **52.6%** |
| Logistic Regression | 46.3% | 52.6% |
| Random Forest | 40.5% | 46.1% |

**Note on accuracy:** With only ~60 images per athlete, 53% accuracy is meaningful — it is 2.6× better than random guessing (20% baseline for 5 classes). The model also outputs a confidence score, and predictions below a threshold can be treated as "uncertain" rather than a forced guess.

---

## 🗂️ Project Structure

```
sports-person-classifier/
│
├── model/
│   ├── sports_person_classifier.ipynb   ← Full training notebook
│   ├── saved_model.pkl                  ← Trained SVM pipeline
│   └── class_dictionary.json           ← Label mapping
│
├── server/
│   ├── server.py                        ← Flask REST API
│   ├── util.py                          ← Preprocessing + prediction logic
│   ├── wavelet.py                       ← Wavelet transform function
│   └── OpenCV/haarcascades/
│       ├── haarcascade_frontalface_default.xml
│       └── haarcascade_eye.xml
│
├── UI/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── requirements.txt
└── README.md
```

---

## ⚙️ How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/sports-person-classifier.git
cd sports-person-classifier
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the Flask server
```bash
cd server
python server.py
```

### 4. Open the frontend
Open `UI/index.html` in your browser, or serve it with:
```bash
cd UI
python -m http.server 8000
```

Then visit `http://localhost:8000`

---

## 🔌 API Reference

### `POST /classify_image`

Accepts a base64-encoded image and returns the predicted athlete.

**Request:**
```
Content-Type: multipart/form-data
Body: image_data = <base64 encoded image string>
```

**Response:**
```json
[
  {
    "class": "virat_kohli",
    "class_probability": [72.3, 5.1, 8.4, 9.2, 5.0],
    "class_dictionary": {
      "virat_kohli": 0,
      "serena_williams": 1,
      "roger_federer": 2,
      "maria_sharapova": 3,
      "lionel_messi": 4
    }
  }
]
```

---

## 🖥️ UI Preview

The frontend features:
- Drag-and-drop or click-to-upload image input
- Face detection bounding box overlay on uploaded image
- Predicted athlete card with name, sport, and photo
- Confidence level progress bar
- MATCH FOUND / NO FACE DETECTED status badge

---

## 📦 Requirements

```
numpy
opencv-python
scikit-learn
flask
flask-cors
PyWavelets
joblib
matplotlib
pandas
```

---

## ⚠️ Known Limitations

- Only recognizes the 5 trained athletes — any other person will be misclassified
- Requires a clear, frontal face with both eyes visible
- Low confidence scores (below ~60%) indicate the model is uncertain — prediction may be unreliable
- Small training dataset (~60 images per person) limits accuracy; transfer learning would significantly improve results

---

## 🚀 Future Improvements

- [ ] Add more training images per athlete (150–200+ each)
- [ ] Implement transfer learning with MobileNet or VGG16 (target: 85–95% accuracy)
- [ ] Add confidence threshold — display "No confident match" instead of a forced prediction
- [ ] Expand to more athletes and sports
- [ ] Deploy to cloud (Render / Railway / AWS)

---

## 👨‍💻 Author

**Mohamad Hasan Mohamad Nazik**  
Built as a supervised learning portfolio project demonstrating end-to-end ML engineering skills.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
