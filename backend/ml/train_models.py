"""
BioQentix ML Model Training Pipeline
Trains models for all 8 disease modules using synthetic
data based on WHO/CDC clinical guidelines.
Run: python ml/train_models.py
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (classification_report, accuracy_score,
                              roc_auc_score)
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')

# Output directory
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'trained_models')
os.makedirs(MODELS_DIR, exist_ok=True)

np.random.seed(42)

def generate_tb_data(n=2000):
    """
    Features based on WHO TB screening guidelines.
    Source: WHO Global TB Programme clinical criteria
    """
    data = []
    for _ in range(n):
        cough_weeks       = np.random.randint(0, 12)
        night_sweats      = np.random.binomial(1, 0.4)
        weight_loss       = np.random.binomial(1, 0.45)
        fever             = np.random.binomial(1, 0.5)
        blood_in_sputum   = np.random.binomial(1, 0.2)
        chest_pain        = np.random.binomial(1, 0.35)
        fatigue           = np.random.binomial(1, 0.5)
        hiv_positive      = np.random.binomial(1, 0.15)
        close_contact_tb  = np.random.binomial(1, 0.2)
        temperature       = np.random.normal(37.5, 1.0)
        weight_kg         = np.random.normal(58, 12)

        # Risk score based on clinical criteria
        score = (
            min(cough_weeks / 3, 1.0) * 0.30 +
            night_sweats    * 0.20 +
            weight_loss     * 0.20 +
            blood_in_sputum * 0.25 +
            fever           * 0.15 +
            hiv_positive    * 0.25 +
            close_contact_tb* 0.20 +
            (temperature > 38.0) * 0.15
        )
        label = 1 if score > 0.45 else 0

        data.append([
            cough_weeks, night_sweats, weight_loss, fever,
            blood_in_sputum, chest_pain, fatigue, hiv_positive,
            close_contact_tb, temperature, weight_kg, label
        ])

    cols = [
        'cough_weeks','night_sweats','weight_loss','fever',
        'blood_in_sputum','chest_pain','fatigue','hiv_positive',
        'close_contact_tb','temperature','weight_kg','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_hiv_data(n=2000):
    """Based on CDC HIV risk assessment guidelines"""
    data = []
    for _ in range(n):
        rapid_weight_loss    = np.random.binomial(1, 0.3)
        recurrent_infections = np.random.binomial(1, 0.35)
        oral_thrush          = np.random.binomial(1, 0.25)
        swollen_lymph        = np.random.binomial(1, 0.4)
        high_risk_behavior   = np.random.binomial(1, 0.3)
        skin_rash            = np.random.binomial(1, 0.3)
        fatigue              = np.random.binomial(1, 0.45)
        night_sweats         = np.random.binomial(1, 0.35)
        cd4_count            = np.random.normal(500, 250)
        temperature          = np.random.normal(37.3, 0.9)

        score = (
            rapid_weight_loss    * 0.25 +
            recurrent_infections * 0.20 +
            oral_thrush          * 0.25 +
            high_risk_behavior   * 0.30 +
            swollen_lymph        * 0.15 +
            (cd4_count < 350)    * 0.35
        )
        label = 1 if score > 0.40 else 0

        data.append([
            rapid_weight_loss, recurrent_infections, oral_thrush,
            swollen_lymph, high_risk_behavior, skin_rash, fatigue,
            night_sweats, cd4_count, temperature, label
        ])

    cols = [
        'rapid_weight_loss','recurrent_infections','oral_thrush',
        'swollen_lymph','high_risk_behavior','skin_rash','fatigue',
        'night_sweats','cd4_count','temperature','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_malaria_data(n=2000):
    """Based on WHO Malaria rapid diagnostic guidelines"""
    data = []
    for _ in range(n):
        high_fever           = np.random.binomial(1, 0.55)
        chills               = np.random.binomial(1, 0.5)
        headache             = np.random.binomial(1, 0.6)
        vomiting             = np.random.binomial(1, 0.4)
        sweating             = np.random.binomial(1, 0.45)
        travel_endemic       = np.random.binomial(1, 0.35)
        muscle_pain          = np.random.binomial(1, 0.45)
        temperature          = np.random.normal(38.5, 1.2)
        weight_kg            = np.random.normal(60, 15)
        days_sick            = np.random.randint(1, 14)

        score = (
            high_fever     * 0.30 +
            chills         * 0.20 +
            travel_endemic * 0.25 +
            (temperature > 38.5) * 0.25 +
            vomiting       * 0.15 +
            headache       * 0.10
        )
        label = 1 if score > 0.40 else 0

        data.append([
            high_fever, chills, headache, vomiting, sweating,
            travel_endemic, muscle_pain, temperature, weight_kg,
            days_sick, label
        ])

    cols = [
        'high_fever','chills','headache','vomiting','sweating',
        'travel_endemic','muscle_pain','temperature','weight_kg',
        'days_sick','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_maternal_data(n=2000):
    """Based on WHO maternal mortality risk factors"""
    data = []
    for _ in range(n):
        age                  = np.random.randint(14, 45)
        bp_systolic          = np.random.normal(118, 18)
        bp_diastolic         = np.random.normal(76, 12)
        hemoglobin           = np.random.normal(10.5, 2.5)
        severe_headache      = np.random.binomial(1, 0.3)
        blurred_vision       = np.random.binomial(1, 0.25)
        excessive_bleeding   = np.random.binomial(1, 0.2)
        edema                = np.random.binomial(1, 0.35)
        weight_kg            = np.random.normal(62, 12)
        previous_comp        = np.random.binomial(1, 0.2)

        score = (
            (age < 18 or age > 35) * 0.20 +
            (bp_systolic > 140)    * 0.35 +
            (hemoglobin < 8)       * 0.30 +
            severe_headache        * 0.20 +
            blurred_vision         * 0.25 +
            excessive_bleeding     * 0.40 +
            previous_comp          * 0.20
        )
        label = 1 if score > 0.45 else 0

        data.append([
            age, bp_systolic, bp_diastolic, hemoglobin,
            severe_headache, blurred_vision, excessive_bleeding,
            edema, weight_kg, previous_comp, label
        ])

    cols = [
        'age','bp_systolic','bp_diastolic','hemoglobin',
        'severe_headache','blurred_vision','excessive_bleeding',
        'edema','weight_kg','previous_comp','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_malnutrition_data(n=2000):
    """Based on WHO MUAC and anthropometric criteria"""
    data = []
    for _ in range(n):
        muac_cm          = np.random.normal(14.0, 2.5)
        weight_kg        = np.random.normal(12, 5)
        height_cm        = np.random.normal(90, 15)
        hemoglobin       = np.random.normal(10, 2.5)
        visible_wasting  = np.random.binomial(1, 0.3)
        edema            = np.random.binomial(1, 0.2)
        poor_appetite    = np.random.binomial(1, 0.4)
        pale_conjunctiva = np.random.binomial(1, 0.35)

        # WHO MUAC criteria: <11.5 SAM, 11.5-12.5 MAM
        score = (
            (muac_cm < 11.5)     * 0.50 +
            (muac_cm < 12.5)     * 0.25 +
            visible_wasting      * 0.30 +
            edema                * 0.25 +
            (hemoglobin < 8)     * 0.30 +
            poor_appetite        * 0.15
        )
        label = 1 if score > 0.40 else 0

        data.append([
            muac_cm, weight_kg, height_cm, hemoglobin,
            visible_wasting, edema, poor_appetite,
            pale_conjunctiva, label
        ])

    cols = [
        'muac_cm','weight_kg','height_cm','hemoglobin',
        'visible_wasting','edema','poor_appetite',
        'pale_conjunctiva','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_dengue_data(n=2000):
    """Based on WHO Dengue clinical guidelines 2012"""
    data = []
    for _ in range(n):
        high_fever       = np.random.binomial(1, 0.6)
        severe_headache  = np.random.binomial(1, 0.55)
        eye_pain         = np.random.binomial(1, 0.4)
        rash             = np.random.binomial(1, 0.45)
        joint_pain       = np.random.binomial(1, 0.5)
        bleeding_gums    = np.random.binomial(1, 0.25)
        nausea           = np.random.binomial(1, 0.5)
        temperature      = np.random.normal(38.8, 1.0)
        platelet_count   = np.random.normal(180000, 60000)
        days_fever       = np.random.randint(1, 10)

        score = (
            high_fever      * 0.25 +
            severe_headache * 0.20 +
            eye_pain        * 0.20 +
            rash            * 0.20 +
            bleeding_gums   * 0.30 +
            (platelet_count < 100000) * 0.40 +
            (temperature > 38.5)     * 0.20
        )
        label = 1 if score > 0.45 else 0

        data.append([
            high_fever, severe_headache, eye_pain, rash,
            joint_pain, bleeding_gums, nausea, temperature,
            platelet_count, days_fever, label
        ])

    cols = [
        'high_fever','severe_headache','eye_pain','rash',
        'joint_pain','bleeding_gums','nausea','temperature',
        'platelet_count','days_fever','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_sti_data(n=2000):
    """Based on WHO STI syndromic management guidelines"""
    data = []
    for _ in range(n):
        discharge           = np.random.binomial(1, 0.4)
        ulcers              = np.random.binomial(1, 0.3)
        dysuria             = np.random.binomial(1, 0.35)
        lower_abd_pain      = np.random.binomial(1, 0.4)
        high_risk_behavior  = np.random.binomial(1, 0.35)
        rash                = np.random.binomial(1, 0.3)
        fever               = np.random.binomial(1, 0.3)
        partner_infected    = np.random.binomial(1, 0.25)

        score = (
            discharge          * 0.30 +
            ulcers             * 0.30 +
            dysuria            * 0.20 +
            lower_abd_pain     * 0.20 +
            high_risk_behavior * 0.25 +
            partner_infected   * 0.35
        )
        label = 1 if score > 0.35 else 0

        data.append([
            discharge, ulcers, dysuria, lower_abd_pain,
            high_risk_behavior, rash, fever,
            partner_infected, label
        ])

    cols = [
        'discharge','ulcers','dysuria','lower_abd_pain',
        'high_risk_behavior','rash','fever',
        'partner_infected','label'
    ]
    return pd.DataFrame(data, columns=cols)


def generate_enteric_data(n=2000):
    """Based on WHO diarrheal disease management guidelines"""
    data = []
    for _ in range(n):
        diarrhea_days    = np.random.randint(0, 10)
        blood_in_stool   = np.random.binomial(1, 0.3)
        vomiting         = np.random.binomial(1, 0.45)
        dehydration      = np.random.binomial(1, 0.35)
        fever            = np.random.binomial(1, 0.4)
        abdominal_cramps = np.random.binomial(1, 0.5)
        temperature      = np.random.normal(37.8, 1.0)
        weight_kg        = np.random.normal(50, 15)

        score = (
            min(diarrhea_days / 3, 1.0) * 0.30 +
            blood_in_stool   * 0.35 +
            dehydration      * 0.25 +
            vomiting         * 0.20 +
            (temperature > 38.0) * 0.15
        )
        label = 1 if score > 0.35 else 0

        data.append([
            diarrhea_days, blood_in_stool, vomiting, dehydration,
            fever, abdominal_cramps, temperature, weight_kg, label
        ])

    cols = [
        'diarrhea_days','blood_in_stool','vomiting','dehydration',
        'fever','abdominal_cramps','temperature','weight_kg','label'
    ]
    return pd.DataFrame(data, columns=cols)


def train_model(name, df, model_type='rf'):
    """Train, evaluate and save a model"""
    print(f"\n{'='*50}")
    print(f"Training {name} model...")

    X = df.drop('label', axis=1)
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Build pipeline
    if model_type == 'rf':
        clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=5,
            class_weight='balanced',
            random_state=42
        )
    elif model_type == 'gb':
        clf = GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
    else:
        clf = LogisticRegression(
            class_weight='balanced',
            random_state=42,
            max_iter=1000
        )

    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', clf)
    ])

    # Train
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred  = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(f"  Accuracy : {acc:.4f}")
    print(f"  AUC-ROC  : {auc:.4f}")
    print(f"  Features : {list(X.columns)}")
    print(classification_report(y_test, y_pred,
                                 target_names=['No Disease','Disease'],
                                 digits=3))

    # Cross-validation
    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring='roc_auc')
    print(f"  CV AUC   : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Save model + feature names
    model_data = {
        'model':    pipeline,
        'features': list(X.columns),
        'accuracy': acc,
        'auc':      auc,
        'disease':  name
    }

    path = os.path.join(MODELS_DIR, f'{name.lower()}_model.pkl')
    joblib.dump(model_data, path)
    print(f"  Saved → {path}")

    return model_data


def main():
    print("BioQentix™ ML Model Training Pipeline")
    print("Based on WHO/CDC Clinical Guidelines")
    print("="*50)

    results = []

    # Train all 8 models
    results.append(train_model('TB',           generate_tb_data(),           'rf'))
    results.append(train_model('HIV',          generate_hiv_data(),          'rf'))
    results.append(train_model('MALARIA',      generate_malaria_data(),      'gb'))
    results.append(train_model('MATERNAL',     generate_maternal_data(),     'rf'))
    results.append(train_model('MALNUTRITION', generate_malnutrition_data(), 'rf'))
    results.append(train_model('DENGUE',       generate_dengue_data(),       'gb'))
    results.append(train_model('STI',          generate_sti_data(),          'rf'))
    results.append(train_model('ENTERIC',      generate_enteric_data(),      'gb'))

    # Summary
    print("\n" + "="*50)
    print("TRAINING COMPLETE — Model Summary")
    print("="*50)
    print(f"{'Disease':<15} {'Accuracy':>10} {'AUC-ROC':>10}")
    print("-"*40)
    for r in results:
        print(f"{r['disease']:<15} {r['accuracy']:>10.4f} {r['auc']:>10.4f}")

    print(f"\n✅ All 8 models saved to: {MODELS_DIR}/")


if __name__ == '__main__':
    main()