import joblib
import os
import numpy as np
from typing import Optional

MODELS_DIR = os.path.join(
    os.path.dirname(__file__), '..', '..', 'ml', 'trained_models'
)

# Cache loaded models in memory
_model_cache = {}


def load_model(disease_code: str) -> Optional[dict]:
    if disease_code in _model_cache:
        return _model_cache[disease_code]

    path = os.path.join(MODELS_DIR, f'{disease_code.lower()}_model.pkl')
    if not os.path.exists(path):
        return None

    try:
        model_data = joblib.load(path)
        _model_cache[disease_code] = model_data
        print(f"✅ Loaded ML model: {disease_code}")
        return model_data
    except Exception as e:
        print(f"❌ Failed to load {disease_code} model: {e}")
        return None


def predict_disease_risk(
    disease_code: str,
    symptoms: dict,
    vitals: dict
) -> dict:
    """
    Run ML model prediction. Falls back to rule engine if model not found.
    Returns: risk_score, risk_level, prediction, confidence, engine_used
    """
    model_data = load_model(disease_code)

    if model_data is None:
        return None  # Caller will use rule engine as fallback

    model    = model_data['model']
    features = model_data['features']

    # Merge symptoms + vitals into one dict
    combined = {**symptoms, **vitals}

    # Build feature vector in correct order
    feature_vector = []
    for f in features:
        val = combined.get(f, 0)
        if isinstance(val, bool):
            val = int(val)
        elif val is None:
            val = 0
        feature_vector.append(float(val))

    X = np.array(feature_vector).reshape(1, -1)

    # ── Prediction ───────────────────────────────────────
    # predict_proba returns shape (1, n_classes)
    # For binary model: col 0 = P(negative), col 1 = P(positive)
    proba_all  = model.predict_proba(X)[0]   # e.g. [0.23, 0.77]
    risk_score = round(float(proba_all[1]), 4)  # probability of POSITIVE class

    # ── Risk level mapping ───────────────────────────────
    if   risk_score >= 0.80: risk_level = 'critical'
    elif risk_score >= 0.60: risk_level = 'high'
    elif risk_score >= 0.40: risk_level = 'medium'
    elif risk_score >= 0.20: risk_level = 'low'
    else:                    risk_level = 'minimal'

    # ── Prediction label ─────────────────────────────────
    predictions = {
        'TB':           {1: 'Active TB likely',          0: 'TB unlikely'},
        'HIV':          {1: 'HIV risk HIGH',              0: 'HIV risk LOW'},
        'MALARIA':      {1: 'Malaria positive',           0: 'Malaria unlikely'},
        'STI':          {1: 'STI infection likely',       0: 'STI unlikely'},
        'MATERNAL':     {1: 'High maternal risk',         0: 'Normal pregnancy'},
        'MALNUTRITION': {1: 'Malnutrition detected',      0: 'Nutrition normal'},
        'DENGUE':       {1: 'Dengue fever likely',        0: 'Dengue unlikely'},
        'ENTERIC':      {1: 'Enteric infection detected', 0: 'Mild GI issue'},
    }
    pred_label = 1 if risk_score >= 0.5 else 0
    prediction = predictions.get(
        disease_code, {}
    ).get(pred_label, 'Assessment complete')

    # ✅ FIX: Confidence = probability of the PREDICTED class
    # If pred_label=1 → confidence = P(positive)  = proba_all[1]
    # If pred_label=0 → confidence = P(negative)  = proba_all[0]
    # This is the true model certainty — NOT score + 0.08
    confidence = round(float(proba_all[pred_label]), 4)

    return {
        'risk_score':  risk_score,
        'risk_level':  risk_level,
        'prediction':  prediction,
        'confidence':  confidence,   # ✅ real probability now
        'engine':      'ml_model'
    }


def get_models_status() -> dict:
    """Check which models are available."""
    diseases = [
        'TB', 'HIV', 'MALARIA', 'STI',
        'MATERNAL', 'MALNUTRITION', 'DENGUE', 'ENTERIC'
    ]
    status = {}
    for d in diseases:
        path = os.path.join(MODELS_DIR, f'{d.lower()}_model.pkl')
        status[d] = {
            'available': os.path.exists(path),
            'loaded':    d in _model_cache,
        }
    return status