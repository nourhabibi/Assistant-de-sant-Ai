from flask import Flask, render_template, request, jsonify
import re
import unicodedata
import os

app = Flask(__name__, template_folder='.')

# ----------------- Normalisation du texte -----------------
def normalize_text(text):
    text = text.lower()
    text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')
    return text

# ----------------- Fonction principale du chatbot -----------------
def analyser_message(message):
    message_norm = normalize_text(message)

    # Température
    temp_match = re.search(r"(\d{2}(?:\.\d)?)", message_norm)
    if "temperature" in message_norm or "fievre" in message_norm:
        if temp_match:
            temp = float(temp_match.group(1))
            if temp >= 38:
                return ("urgence", f"🔥 Température élevée ({temp}°C). Reposez-vous et hydratez-vous.")
            elif temp < 36:
                return ("urgence", f"❄️ Température basse ({temp}°C). Restez au chaud.")
            else:
                return ("constante", f"✅ Température normale ({temp}°C).")

    # Tension
    tension_match = re.search(r"(\d{2,3})\s*/\s*(\d{2,3})", message_norm)
    if "tension" in message_norm or "pression" in message_norm:
        if tension_match:
            syst = int(tension_match.group(1))
            diast = int(tension_match.group(2))
            if syst > 140 or diast > 90:
                return ("urgence", f"⚠️ Tension élevée ({syst}/{diast}). Consultez un médecin.")
            elif syst < 90 or diast < 60:
                return ("urgence", f"⚠️ Tension basse ({syst}/{diast}). Consultez un médecin.")
            else:
                return ("constante", f"✅ Tension normale ({syst}/{diast}).")

    # Symptômes simples
    symptomes = {
        "mal de tete": "🟠 Mal de tête : reposez-vous et hydratez-vous.",
        "fatigue": "🟠 Fatigue : reposez-vous et surveillez votre état.",
        "toux": "🟠 Toux : hydratez-vous et consultez si persiste.",
        "migraine": "🟠 Migraine : repos dans une pièce sombre."
    }
    for mot, texte in symptomes.items():
        if mot in message_norm:
            return ("symptome", texte)

    return ("inconnu", "ℹ️ Je peux vous informer sur symptômes, prévention, examens ou interpréter vos constantes.")

# ----------------- Routes Flask -----------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_response", methods=["POST"])
def get_response():
    user_msg = request.json.get("message")
    type_msg, response = analyser_message(user_msg)
    return jsonify({"type": type_msg, "response": response})

if __name__ == "__main__":
    app.run(debug=True)
