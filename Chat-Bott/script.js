"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// DOM-Elemente aus dem HTML holen und direkt typisieren.
// Damit weiß TypeScript genau, welche Eigenschaften diese Elemente haben.
const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusEl = document.getElementById('status');
// Sicherheitscheck: Falls ein Element nicht gefunden wird, bricht der Code ab.
// Ohne diesen Check würdest du später Fehler bekommen (z. B. chatEl is null).
if (!chatEl || !inputEl || !sendBtn || !statusEl) {
    throw new Error('Ein oder mehrere benötigte DOM-Elemente wurden nicht gefunden.');
}
// Backend-Adresse, zu der der Chat die Nachricht schicken soll.
// Später trägst du hier deinen n8n-Webhook oder API-Endpunkt ein.
const API_URL = 'http://localhost:5678/webhook/6dee0e83-840a-4185-9503-a7568cc09faa';
// --------------------------------------
// Funktion: addMessage
// --------------------------------------
// Diese Funktion erstellt eine neue Chat-Nachricht im Browser und fügt sie dem Chatfenster hinzu.
function addMessage(text, sender) {
    // Neues <div> für die Nachricht erstellen
    const div = document.createElement('div');
    // CSS-Klassen setzen (message + user/assistant)
    div.classList.add('message', sender);
    // Text einfügen
    div.textContent = text;
    // Nachricht in den Chat einfügen
    chatEl.appendChild(div);
    // Scroll nach unten, damit die neue Nachricht sichtbar ist
    chatEl.scrollTop = chatEl.scrollHeight;
}
// --------------------------------------
// Funktion: sendMessage (asynchron)
// --------------------------------------
// Diese Funktion wird aufgerufen, wenn der Nutzer eine Nachricht sendet.
// 1. Nachricht im Chat anzeigen
// 2. Nachricht an dein Backend senden (fetch)
// 3. Antwort anzeigen oder Fehler behandeln
function sendMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Text aus dem Inputfeld holen
        const text = inputEl.value.trim();
        // Leere Eingaben ignorieren
        if (!text)
            return;
        // Nachricht des Users direkt im Chat anzeigen
        addMessage(text, 'user');
        // Eingabefeld leeren
        inputEl.value = '';
        // Statusanzeige aktualisieren
        statusEl.textContent = 'Denke nach...';
        try {
            // Anfrage an das Backend senden (POST)
            const response = yield fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Inhalt der Anfrage → JSON mit "message"
                body: JSON.stringify({ message: text })
            });
            // Falls der Server mit einem Fehlerstatus antwortet
            if (!response.ok) {
                throw new Error('Server-Fehler: ' + response.status);
            }
            // Antwort vom Backend lesen
            const data = yield response.json();
            // Falls keine Antwort enthalten ist → Fallback
            const reply = (_a = data.reply) !== null && _a !== void 0 ? _a : '(Keine Antwort vom Agent erhalten)';
            // Assistenten-Nachricht anzeigen
            addMessage(reply, 'assistant');
            // Statusanzeige zurücksetzen
            statusEl.textContent = '';
        }
        catch (err) {
            // Etwas ist schiefgelaufen (Netzwerkproblem, Backend down, falsche URL, ...)
            console.error(err);
            statusEl.textContent = 'Fehler beim Senden der Nachricht.';
            // Fehlertext bestimmen
            const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
            // Fehler im Chat anzeigen
            addMessage('Es ist ein Fehler aufgetreten: ' + message, 'assistant');
        }
    });
}
// --------------------------------------
// Event Listener
// --------------------------------------
// Klick auf "Senden"-Button → sendMessage aufrufen
sendBtn.addEventListener('click', () => {
    void sendMessage();
});
// Enter-Taste im Inputfeld → sendMessage aufrufen
inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        void sendMessage();
    }
});
// ------------------------------------------
//  Chat Session sauber beenden
// ------------------------------------------
const WEBHOOK_URL = "DEIN_N8N_WEBHOOK"; // <- unbedingt eintragen
const endBtn = document.getElementById("end-session-btn");
// 🛑 Button zum manuellen Beenden
if (endBtn) {
    endBtn.addEventListener("click", () => {
        const payload = {
            endSession: true,
            message: "",
        };
        fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        alert("Chat beendet – Session wird gespeichert!");
    });
}
// 🛑 Automatisches Beenden beim Tab-Schließen
window.addEventListener("beforeunload", () => {
    const payload = JSON.stringify({
        endSession: true,
        message: ""
    });
    // sendBeacon funktioniert auch beim Tab schließen
    navigator.sendBeacon(WEBHOOK_URL, payload);
});
//# sourceMappingURL=script.js.map