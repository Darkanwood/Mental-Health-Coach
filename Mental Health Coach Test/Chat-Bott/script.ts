// Ein "Sender"-Typ, damit TypeScript weiß, dass nur diese zwei Werte erlaubt sind.
// Das verhindert Tippfehler und sorgt für klaren Code.
type Sender = 'user' | 'assistant';


// DOM-Elemente aus dem HTML holen und direkt typisieren.
// Damit weiß TypeScript genau, welche Eigenschaften diese Elemente haben.
const chatEl = document.getElementById('chat') as HTMLDivElement;
const inputEl = document.getElementById('user-input') as HTMLInputElement;
const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;


// Sicherheitscheck: Falls ein Element nicht gefunden wird, bricht der Code ab.
// Ohne diesen Check würdest du später Fehler bekommen (z. B. chatEl is null).
if (!chatEl || !inputEl || !sendBtn || !statusEl) {
  throw new Error('Ein oder mehrere benötigte DOM-Elemente wurden nicht gefunden.');
}


// Backend-Adresse, zu der der Chat die Nachricht schicken soll.
// Später trägst du hier deinen n8n-Webhook oder API-Endpunkt ein.
const API_URL: string = 'http://localhost:5678/webhook/6dee0e83-840a-4185-9503-a7568cc09faa';


// --------------------------------------
// Funktion: addMessage
// --------------------------------------
// Diese Funktion erstellt eine neue Chat-Nachricht im Browser und fügt sie dem Chatfenster hinzu.
function addMessage(text: string, sender: Sender): void {

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
// 1. Gehirn-Stimmung setzen
// 2. Nachricht im Chat anzeigen
// 3. Nachricht an dein Backend senden (fetch)
// 4. Antwort anzeigen oder Fehler behandeln
async function sendMessage(): Promise<void> {

  // Text aus dem Inputfeld holen
  const text = inputEl.value.trim();

  // Leere Eingaben ignorieren
  if (!text) return;

  // >>> Gehirn-Stimmung setzen, falls Funktion aus dem 3D-Skript existiert
  const moodFn = (window as any).setBrainMoodFromText;
  if (typeof moodFn === 'function') {
    moodFn(text);
  }

  // Nachricht des Users direkt im Chat anzeigen
  addMessage(text, 'user');

  // Eingabefeld leeren
  inputEl.value = '';

  // Statusanzeige aktualisieren
  statusEl.textContent = 'Denke nach.';

  try {
    // Anfrage an das Backend senden (POST)
    const response: Response = await fetch(API_URL, {
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
    const data: { reply?: string } = await response.json();

    // Falls keine Antwort enthalten ist → Fallback
    const reply: string = data.reply ?? '(Keine Antwort vom Agent erhalten)';

    // Assistenten-Nachricht anzeigen
    addMessage(reply, 'assistant');

    // Statusanzeige zurücksetzen
    statusEl.textContent = '';

  } catch (err) {
    // Etwas ist schiefgelaufen (Netzwerkproblem, Backend down, falsche URL, ...)
    console.error(err);

    statusEl.textContent = 'Fehler beim Senden der Nachricht.';

    // Fehlertext bestimmen
    const message =
      err instanceof Error ? err.message : 'Unbekannter Fehler';

    // Fehler im Chat anzeigen
    addMessage('Es ist ein Fehler aufgetreten: ' + message, 'assistant');
  }
}




// --------------------------------------
// Event Listener
// --------------------------------------

// Klick auf "Senden"-Button → sendMessage aufrufen
sendBtn.addEventListener('click', () => {
  void sendMessage();
});


// Enter-Taste im Inputfeld → sendMessage aufrufen
inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    void sendMessage();
  }
});


// ------------------------------------------
//  Chat Session sauber beenden
// ------------------------------------------

const WEBHOOK_URL = "DEIN_N8N_WEBHOOK";  // <- unbedingt eintragen

const endBtn = document.getElementById("end-session-btn");

// Button zum manuellen Beenden
if(endBtn){
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


// Automatisches Beenden beim Tab-Schließen
window.addEventListener("beforeunload", () => {
  const payload = JSON.stringify({
    endSession: true,
    message: ""
  });

  // sendBeacon funktioniert auch beim Tab schließen
  navigator.sendBeacon(WEBHOOK_URL, payload);
});

