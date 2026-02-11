// ---------- Normalisation ----------
function normalizeText(text){
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ---------- Fonction principale du chatbot ----------
function analyserMessage(message){
    const msg = normalizeText(message);

    // --------- Bloc conversations générales ----------
    const salutations = ["bonjour","bonsoir","salut","coucou","hello","hi","hey","salutations","yo","bon matin","bonne journée","bonne soiree","bon début de journée"];
    const aurevoir = ["bye","au revoir","à bientôt","a bientot","à plus","à plus tard","à demain","adieu","ciao","bonne journée","bonne soirée","bon week-end"];
    const remerciements = ["merci","merci beaucoup","merci bien","thank you","thanks","thanks a lot","merci pour votre aide","merci pour tout","merci infiniment","merci d'avance"];

    for(const mot of salutations){
        if(msg.includes(mot)) return "ℹ️ Bonjour ! Comment puis-je vous aider aujourd'hui ?";
    }
    for(const mot of aurevoir){
        if(msg.includes(mot)) return "ℹ️ Toujours à votre service cher client, à la prochaine !";
    }
    for(const mot of remerciements){
        if(msg.includes(mot)) return "ℹ️ De rien ! Si vous avez d'autres questions, je suis à votre service.";
    }

    // --------- Constantes médicales ----------
    const tempMatch = msg.match(/(\d{2}(?:\.\d)?)/);
    const tensionMatch = msg.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    const glycMatch = msg.match(/(\d{1,3})/);
    const poulsMatch = msg.match(/(\d{2,3})\s*bpm/);
    const oxyMatchRaw = msg.match(/(\d{2,3})\s*%/);
    const poidsMatch = msg.match(/(\d{2,3})\s*kg/);
    const tailleMatch = msg.match(/(\d\.\d{1,2})\s*m/);

    // --------- Température ----------
    if(msg.includes("fievre") || msg.includes("temperature")){
        if(tempMatch){
            const temp = parseFloat(tempMatch[1]);
            if(temp < 25 || temp > 45) return `❗ Valeur anormale (${temp}°C). Vérifiez vos mesures, cela dépasse les limites humaines normales.`;
            if(temp >= 36 && temp <= 37.5) return `✅ Température normale (${temp}°C). Bonne santé.`;
            if(temp > 37.5 && temp < 38) return `⚠️ Température légèrement élevée (${temp}°C). Surveillez votre état.`;
            if(temp >= 38) return `🔥 Température élevée (${temp}°C). Reposez-vous, hydratez-vous et consultez si cela persiste.`;
            if(temp < 36) return `❄️ Température basse (${temp}°C). Restez au chaud, hydratez-vous, consultez si besoin.`;
        }
    }

    // --------- Tension artérielle ----------
    if(msg.includes("tension") || msg.includes("pression")){
        if(tensionMatch){
            const syst = parseInt(tensionMatch[1]);
            const diast = parseInt(tensionMatch[2]);
            if(syst > 250 || diast > 150) return `❗ Valeur anormale (${syst}/${diast} mmHg). Cela dépasse les limites humaines normales.`;
            if(syst >= 90 && syst <= 140 && diast >= 60 && diast <= 90) return `✅ Tension normale (${syst}/${diast} mmHg). Bonne santé.`;
            if(syst > 140 || diast > 90) return `⚠️ Tension élevée (${syst}/${diast} mmHg). Limitez le sel, gérez le stress et consultez un médecin.`;
            if(syst < 90 || diast < 60) return `⚠️ Tension basse (${syst}/${diast} mmHg). Reposez-vous et hydratez-vous.`;
        }
    }

    // --------- Glycémie ----------
    if(msg.includes("glycemie") || msg.includes("sucre")){
        if(glycMatch){
            const glyc = parseInt(glycMatch[1]);
            if(glyc < 20 || glyc > 600) return `❗ Valeur anormale (${glyc} mg/dl). Cela dépasse les limites humaines normales.`;
            if(glyc >= 70 && glyc <= 180) return `✅ Glycémie normale (${glyc} mg/dl). Bonne santé.`;
            if(glyc < 70) return `⚠️ Glycémie basse (${glyc} mg/dl). Prenez rapidement un aliment sucré et consultez un médecin.`;
            if(glyc > 180) return `⚠️ Glycémie élevée (${glyc} mg/dl). Évitez les sucres rapides, buvez de l'eau et surveillez votre alimentation.`;
        }
    }

    // --------- Pouls ----------
    if(msg.includes("pouls") || msg.includes("rythme cardiaque")){
        if(poulsMatch){
            const bpm = parseInt(poulsMatch[1]);
            if(bpm < 20 || bpm > 220) return `❗ Valeur anormale (${bpm} bpm). Cela dépasse les limites humaines normales.`;
            if(bpm >= 60 && bpm <= 100) return `✅ Pouls normal (${bpm} bpm). Bonne santé.`;
            if(bpm < 60) return `⚠️ Pouls bas (${bpm} bpm). Reposez-vous et consultez si besoin.`;
            if(bpm > 100) return `⚠️ Pouls élevé (${bpm} bpm). Reposez-vous, hydratez-vous, consultez si persiste.`;
        }
    }

    // --------- Saturation O₂ ----------
    let oxyMatch = oxyMatchRaw;
    if(!oxyMatch) oxyMatch = msg.match(/(\d{2,3})/);
    if(msg.includes("saturation") || msg.includes("oxygene")){
        if(oxyMatch){
            const sat = parseInt(oxyMatch[1]);
            if(sat > 100) return `❗ Valeur anormale (${sat}%). Normalement, aucun humain ne peut atteindre ce niveau.`;
            if(sat >= 95 && sat <= 100) return `✅ Saturation normale (${sat}%). Bonne santé.`;
            if(sat >= 90 && sat < 95) return `⚠️ Saturation légèrement basse (${sat}%). Surveillez votre état et consultez si besoin.`;
            if(sat < 90) return `🔴 Saturation très basse (${sat}%). Contactez immédiatement un médecin !`;
        }
    }

    // --------- Poids et IMC ----------
    if(msg.includes("poids") && poidsMatch) {
        return `⚖️ Votre poids est ${poidsMatch[1]} kg. Assurez-vous d'une alimentation équilibrée et d'activité physique régulière.`;
    }
    if(msg.includes("imc") && poidsMatch && tailleMatch) {
        const poids = parseFloat(poidsMatch[1]);
        const taille = parseFloat(tailleMatch[1]);
        const imc = (poids / (taille*taille)).toFixed(1);
        if(imc < 10 || imc > 60) return `❗ IMC anormal (${imc}). Vérifiez vos mesures, valeur improbable.`;
        if(imc >= 18.5 && imc < 25) return `✅ IMC normal (${imc}). Bonne santé.`;
        if(imc < 18.5) return `⚠️ Poids insuffisant (${imc}). Surveillez votre alimentation.`;
        if(imc >= 25 && imc < 30) return `⚠️ Surpoids (${imc}). Adoptez alimentation équilibrée et activité physique.`;
        if(imc >= 30) return `⚠️ Obésité (${imc}). Consultez un médecin pour conseils santé.`;
    }

    // --------- Symptômes enrichis ----------
    const symptomes = {
        "mal de tete":"🟠 Mal de tête : reposez-vous, hydratez-vous, évitez le stress.",
        "migraine":"🟠 Migraine : antidouleur si nécessaire, repos dans pièce sombre, hydratez-vous.",
        "fatigue":"🟠 Fatigue : dormez suffisamment, mangez équilibré, hydratez-vous.",
        "toux":"🟠 Toux : buvez chaud, reposez-vous, consultez si persiste.",
        "nausée":"🟠 Nausée : repos, évitez gras, hydratez-vous.",
        "douleur ventre":"🟠 Douleur abdominale : reposez-vous, hydratez-vous, surveillez votre alimentation.",
        "rhume":"🟠 Rhume : reposez-vous, hydratez-vous, utilisez éventuellement spray nasal.",
        "diarrhee":"🟠 Diarrhée : hydratez-vous, mangez léger, consultez si persiste.",
        "douleur musculaire":"🟠 Douleur musculaire : repos, étirements légers, hydratez-vous.",
        "vertige":"🟠 Vertige : asseyez-vous, hydratez-vous, surveillez votre tension et consultez si persiste.",
        "palpitations":"🟠 Palpitations : repos, respirez calmement, consultez un médecin si persiste.",
        "mal de gorge":"🟠 Mal de gorge : gargarismes, hydratation, consultez si fièvre ou persistance.",
        "frissons":"🟠 Frissons : couvrez-vous, reposez-vous, surveillez votre température.",
        "difficulté à dormir":"🟠 Insomnie : réduisez écran, caféine, établissez routine sommeil.",
        "douleur articulaire":"🟠 Douleur articulaire : repos, glace ou chaleur selon type, consultez si persiste.",
        "perte appétit":"🟠 Perte d'appétit : surveillez hydratation et alimentation légère.",
        "toux sèche persistante":"🟠 Toux sèche persistante : consultez un médecin si persiste plusieurs jours.",
        "fatigue extrême":"🟠 Fatigue extrême : repos prolongé, consultez si persiste."
    };
    for(const mot in symptomes){
        if(msg.includes(mot)) return symptomes[mot];
    }

    // --------- Préventions enrichies ----------
    const prevention = {
        "alcool":"🟢 Alcool : limitez consommation, hydratez-vous.",
        "tabac":"🟢 Tabac : évitez ou arrêtez de fumer.",
        "activite physique":"🟢 Activité physique : 30 min/jour recommandés.",
        "alimentation":"🟢 Alimentation : fruits, légumes, fibres, limitez sucres et graisses saturées.",
        "sommeil":"🟢 Sommeil : 7-8h/nuit.",
        "stress":"🟢 Stress : techniques de respiration, relaxation.",
        "hydratation":"🟢 Hydratation : buvez 1,5-2L d'eau/jour.",
        "vaccination":"🟢 Vaccination : maintenez vos vaccins à jour."
    };
    for(const mot in prevention){
        if(msg.includes(mot)) return prevention[mot];
    }

    // --------- Examens enrichis ----------
    const examens = {
        "irm":"🔵 IRM : imagerie médicale pour détecter anomalies internes.",
        "radio":"🔵 Radiographie : examen pour visualiser os et certains organes.",
        "analyse":"🔵 Analyse : examen de sang, urine ou autre pour diagnostic.",
        "scanner":"🔵 Scanner : imagerie détaillée pour diagnostic précis.",
        "ecg":"🔵 ECG : électrocardiogramme pour évaluer le rythme cardiaque.",
        "echographie":"🔵 Échographie : imagerie pour visualiser organes et tissus.",
        "test covid":"🔵 Test COVID : diagnostic rapide ou PCR selon symptômes.",
        "bilan lipidique":"🔵 Bilan lipidique : évalue cholestérol et triglycérides.",
        "test diabete":"🔵 Test diabète : glycémie à jeun ou HbA1c."
    };
    for(const mot in examens){
        if(msg.includes(mot)) return examens[mot];
    }

    // --------- Urgences enrichies ----------
    const urgences = [
        "douleur poitrine","mal a respirer","essoufflement","perte de connaissance","saignement important",
        "convulsions","avc","fièvre très élevée","vomissements persistants","trouble vision soudain","douleur abdomen intense"
    ];
    for(const mot of urgences){
        if(msg.includes(mot)) return `🔴 URGENCE : ${mot}. Contactez immédiatement un médecin ou les services d'urgence.`;
    }

    // --------- Réponse par défaut ----------
    return "ℹ️ Désolé, je ne suis pas en mesure de répondre à votre question. Aucune information disponible pour le moment.";
}

// ---------- Gestion du chat ----------
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, type){
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(type==="user"?"user-message":"bot-message");
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", ()=>{
    const msg = input.value.trim();
    if(!msg) return;
    addMessage(msg,"user");
    input.value="";
    const response = analyserMessage(msg);
    addMessage(response,"bot");
});

input.addEventListener("keypress",(e)=>{
    if(e.key==="Enter") sendBtn.click();
});
