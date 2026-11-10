// Contenuti del corso: ogni unità ha parole [inglese, italiano], frasi [inglese, italiano] e una mini guida.
const COURSE = [
  {
    id: "u1", level: "A1", icon: "👋", title: "Saluti e presentazioni",
    tip: `<p><b>Presentarsi</b>: <i>I'm Marco. I work as an engineer.</i></p>
<p><b>To be</b> (essere): I <b>am</b> · you <b>are</b> · he/she/it <b>is</b> · we/they <b>are</b>.</p>
<p>Forme brevi: I'm, you're, he's, she's, we're, they're.</p>
<p>Al primo incontro: <i>Nice to meet you</i> → risposta: <i>Nice to meet you too</i>.</p>`,
    words: [
      ["hello", "ciao / salve"], ["good morning", "buongiorno"], ["good afternoon", "buon pomeriggio"],
      ["good evening", "buonasera"], ["goodbye", "arrivederci"], ["name", "nome"],
      ["surname", "cognome"], ["colleague", "collega"], ["manager", "responsabile"],
      ["company", "azienda"], ["job", "lavoro / impiego"], ["nice to meet you", "piacere di conoscerti"]
    ],
    sentences: [
      ["My name is Marco", "Mi chiamo Marco"],
      ["I work for a big company", "Lavoro per una grande azienda"],
      ["She is my new colleague", "Lei è la mia nuova collega"],
      ["Where are you from", "Di dove sei"],
      ["I am from Italy", "Vengo dall'Italia"],
      ["What do you do", "Che lavoro fai"],
      ["See you tomorrow", "Ci vediamo domani"]
    ]
  },
  {
    id: "u2", level: "A1", icon: "🕒", title: "Numeri, orari e date",
    tip: `<p><b>Orari</b>: <i>It's nine o'clock</i> (sono le nove), <i>half past ten</i> (le dieci e mezza), <i>a quarter to five</i> (le cinque meno un quarto).</p>
<p><b>Preposizioni di tempo</b>: <b>at</b> + ora (at 9 am), <b>on</b> + giorno (on Monday), <b>in</b> + mese/anno (in May, in 2026).</p>
<p>Date: <i>the 3rd of May</i> o <i>May 3rd</i>.</p>`,
    words: [
      ["Monday", "lunedì"], ["Tuesday", "martedì"], ["Wednesday", "mercoledì"], ["Thursday", "giovedì"],
      ["Friday", "venerdì"], ["weekend", "fine settimana"], ["today", "oggi"], ["tomorrow", "domani"],
      ["yesterday", "ieri"], ["week", "settimana"], ["month", "mese"], ["hour", "ora"],
      ["early", "presto"], ["late", "tardi"]
    ],
    sentences: [
      ["The meeting is at nine", "La riunione è alle nove"],
      ["I start work on Monday", "Inizio a lavorare lunedì"],
      ["What time is it", "Che ore sono"],
      ["I am late today", "Oggi sono in ritardo"],
      ["The office opens at eight", "L'ufficio apre alle otto"],
      ["We have a deadline next week", "Abbiamo una scadenza la prossima settimana"]
    ]
  },
  {
    id: "u3", level: "A1", icon: "🏢", title: "In ufficio",
    tip: `<p><b>There is / There are</b> = c'è / ci sono: <i>There is a printer. There are two desks.</i></p>
<p><b>Articoli</b>: <b>a</b> davanti a consonante (a desk), <b>an</b> davanti a vocale (an office), <b>the</b> = il/lo/la/i/gli/le.</p>`,
    words: [
      ["office", "ufficio"], ["desk", "scrivania"], ["computer", "computer"], ["printer", "stampante"],
      ["meeting room", "sala riunioni"], ["chair", "sedia"], ["file", "file / pratica"], ["folder", "cartella"],
      ["keyboard", "tastiera"], ["screen", "schermo"], ["coffee machine", "macchinetta del caffè"],
      ["reception", "reception"], ["floor", "piano / pavimento"], ["key", "chiave"]
    ],
    sentences: [
      ["The printer is not working", "La stampante non funziona"],
      ["There is a meeting room on the second floor", "C'è una sala riunioni al secondo piano"],
      ["Can I use your computer", "Posso usare il tuo computer"],
      ["My desk is next to the window", "La mia scrivania è vicino alla finestra"],
      ["Where is the reception", "Dov'è la reception"],
      ["I need a new keyboard", "Ho bisogno di una nuova tastiera"]
    ]
  },
  {
    id: "u4", level: "A1", icon: "⚙️", title: "Verbi essenziali",
    tip: `<p><b>Present simple</b> per abitudini e fatti: <i>I work, you work, he works</i>.</p>
<p>Alla 3ª persona singolare si aggiunge <b>-s</b>: she <b>works</b>, he <b>goes</b>, it <b>has</b>.</p>
<p><b>Negativa</b>: I <b>don't</b> work · she <b>doesn't</b> work. <b>Domanda</b>: <b>Do</b> you work? <b>Does</b> he work?</p>`,
    words: [
      ["to work", "lavorare"], ["to send", "inviare"], ["to call", "chiamare"], ["to write", "scrivere"],
      ["to read", "leggere"], ["to meet", "incontrare"], ["to need", "avere bisogno"], ["to know", "sapere / conoscere"],
      ["to ask", "chiedere"], ["to answer", "rispondere"], ["to help", "aiutare"], ["to finish", "finire"],
      ["to start", "iniziare"], ["to understand", "capire"]
    ],
    sentences: [
      ["I don't understand", "Non capisco"],
      ["She works in marketing", "Lei lavora nel marketing"],
      ["Do you need help", "Hai bisogno di aiuto"],
      ["He doesn't know the answer", "Lui non sa la risposta"],
      ["We start at nine every day", "Iniziamo alle nove ogni giorno"],
      ["Can you help me please", "Puoi aiutarmi per favore"],
      ["I send emails every morning", "Invio email ogni mattina"]
    ]
  },
  {
    id: "u5", level: "A2", icon: "📧", title: "Email professionali",
    tip: `<p><b>Apertura</b>: <i>Dear Mr Smith,</i> (formale) · <i>Hi Anna,</i> (informale).</p>
<p><b>Frasi utili</b>: <i>I am writing to…</i> (Le scrivo per…), <i>Please find attached…</i> (In allegato trova…), <i>I look forward to hearing from you</i> (Attendo un suo riscontro).</p>
<p><b>Chiusura</b>: <i>Best regards,</i> · <i>Kind regards,</i></p>`,
    words: [
      ["attachment", "allegato"], ["subject", "oggetto"], ["to reply", "rispondere"], ["to forward", "inoltrare"],
      ["inbox", "posta in arrivo"], ["regards", "saluti"], ["request", "richiesta"], ["reminder", "promemoria / sollecito"],
      ["as soon as possible", "il prima possibile"], ["to confirm", "confermare"], ["available", "disponibile"],
      ["feedback", "riscontro / feedback"], ["to attach", "allegare"], ["urgent", "urgente"]
    ],
    sentences: [
      ["Please find attached the report", "In allegato trova il report"],
      ["I am writing to confirm the meeting", "Le scrivo per confermare la riunione"],
      ["I look forward to hearing from you", "Attendo un suo riscontro"],
      ["Could you send me the file", "Potresti inviarmi il file"],
      ["Thank you for your quick reply", "Grazie per la rapida risposta"],
      ["Please let me know if you have any questions", "Mi faccia sapere se ha domande"],
      ["Sorry for the late reply", "Scusa per il ritardo nella risposta"]
    ]
  },
  {
    id: "u6", level: "A2", icon: "📞", title: "Al telefono",
    tip: `<p><b>Rispondere</b>: <i>Hello, Marco speaking.</i> (Pronto, sono Marco.)</p>
<p><b>Chiedere</b>: <i>Could I speak to…?</i> · <i>Can you hold on, please?</i> (Resti in linea.)</p>
<p><b>Could / Can</b>: <i>could</i> è più cortese di <i>can</i>.</p>`,
    words: [
      ["phone call", "telefonata"], ["to hold on", "restare in linea"], ["to hang up", "riattaccare"],
      ["to call back", "richiamare"], ["message", "messaggio"], ["voicemail", "segreteria"],
      ["extension", "interno"], ["line", "linea"], ["busy", "occupato"], ["to spell", "fare lo spelling"],
      ["to put through", "passare (al telefono)"], ["speaking", "sono io / parla"]
    ],
    sentences: [
      ["Could I speak to Mr Brown please", "Potrei parlare con il signor Brown per favore"],
      ["Can you hold on a moment", "Può restare in linea un momento"],
      ["I will call you back later", "Ti richiamo più tardi"],
      ["Can I leave a message", "Posso lasciare un messaggio"],
      ["Could you spell your name please", "Può fare lo spelling del suo nome per favore"],
      ["Sorry, the line is busy", "Mi scusi, la linea è occupata"],
      ["Could you speak more slowly please", "Potrebbe parlare più lentamente per favore"]
    ]
  },
  {
    id: "u7", level: "A2", icon: "🗓️", title: "Riunioni",
    tip: `<p><b>Dare un'opinione</b>: <i>I think…</i> · <i>In my opinion…</i></p>
<p><b>Essere d'accordo</b>: <i>I agree</i> · <b>Non esserlo</b> (con tatto): <i>I see your point, but…</i></p>
<p><b>Interrompere</b>: <i>Sorry to interrupt, but…</i> · <i>Can I add something?</i></p>`,
    words: [
      ["agenda", "ordine del giorno"], ["minutes", "verbale"], ["to schedule", "programmare / fissare"],
      ["to postpone", "rimandare"], ["to cancel", "annullare"], ["attendee", "partecipante"],
      ["to agree", "essere d'accordo"], ["to disagree", "non essere d'accordo"], ["proposal", "proposta"],
      ["issue", "problema / questione"], ["to discuss", "discutere"], ["decision", "decisione"],
      ["call", "chiamata / call"], ["to share the screen", "condividere lo schermo"]
    ],
    sentences: [
      ["Let's start the meeting", "Iniziamo la riunione"],
      ["I agree with you", "Sono d'accordo con te"],
      ["Can we postpone the meeting to Friday", "Possiamo rimandare la riunione a venerdì"],
      ["What is on the agenda today", "Cosa c'è all'ordine del giorno oggi"],
      ["I see your point, but I disagree", "Capisco il tuo punto di vista, ma non sono d'accordo"],
      ["Can you share your screen", "Puoi condividere lo schermo"],
      ["Let's discuss this issue next time", "Discutiamo di questo problema la prossima volta"]
    ]
  },
  {
    id: "u8", level: "A2", icon: "💬", title: "Small talk",
    tip: `<p>Lo <b>small talk</b> è la chiacchierata informale prima delle riunioni.</p>
<p>Temi sicuri: weekend, meteo, viaggi. <i>How was your weekend?</i> · <i>Did you have a good trip?</i></p>
<p>Rispondi e rilancia: <i>Great, thanks! And you?</i></p>`,
    words: [
      ["weather", "tempo (meteo)"], ["holiday", "vacanza"], ["trip", "viaggio"], ["busy", "impegnato"],
      ["tired", "stanco"], ["great", "ottimo"], ["hobby", "hobby"], ["family", "famiglia"],
      ["by the way", "a proposito"], ["actually", "in realtà"], ["to enjoy", "divertirsi / apprezzare"],
      ["lunch break", "pausa pranzo"]
    ],
    sentences: [
      ["How was your weekend", "Com'è andato il tuo weekend"],
      ["Did you have a good trip", "Hai fatto buon viaggio"],
      ["It's very hot today", "Oggi fa molto caldo"],
      ["I'm a bit tired today", "Oggi sono un po' stanco"],
      ["Are you busy this week", "Sei impegnato questa settimana"],
      ["Do you want to have lunch together", "Vuoi pranzare insieme"]
    ]
  },
  {
    id: "u9", level: "A2", icon: "⏮️", title: "Il passato (past simple)",
    tip: `<p><b>Past simple</b> per azioni concluse: verbi regolari + <b>-ed</b> (work → work<b>ed</b>).</p>
<p>Irregolari comuni: go → <b>went</b>, have → <b>had</b>, send → <b>sent</b>, meet → <b>met</b>, write → <b>wrote</b>, make → <b>made</b>.</p>
<p>Negativa e domande con <b>did</b>: <i>I didn't send it. Did you call him?</i></p>`,
    words: [
      ["went", "andai / sono andato"], ["had", "ebbi / ho avuto"], ["sent", "inviai / ho inviato"],
      ["met", "incontrai / ho incontrato"], ["wrote", "scrissi / ho scritto"], ["made", "feci / ho fatto"],
      ["said", "dissi / ho detto"], ["told", "raccontai / ho detto (a qualcuno)"], ["bought", "comprai / ho comprato"],
      ["forgot", "dimenticai / ho dimenticato"], ["last week", "la settimana scorsa"], ["ago", "fa (tempo)"]
    ],
    sentences: [
      ["I sent the email yesterday", "Ho inviato l'email ieri"],
      ["We met the client last week", "Abbiamo incontrato il cliente la settimana scorsa"],
      ["Did you call him", "L'hai chiamato"],
      ["I didn't receive your message", "Non ho ricevuto il tuo messaggio"],
      ["She forgot the meeting", "Ha dimenticato la riunione"],
      ["He told me about the project two days ago", "Mi ha parlato del progetto due giorni fa"]
    ]
  },
  {
    id: "u10", level: "B1", icon: "🧑‍💼", title: "Colloquio di lavoro",
    tip: `<p><b>Present perfect</b> per esperienze fino ad oggi: <i>I <b>have worked</b> here for five years</i> (Lavoro qui da cinque anni).</p>
<p><b>for</b> + durata (for 3 years) · <b>since</b> + punto d'inizio (since 2020).</p>
<p>Parla di punti di forza: <i>I'm good at…</i> · <i>I'm able to…</i></p>`,
    words: [
      ["interview", "colloquio"], ["CV / resume", "curriculum"], ["skills", "competenze"], ["experience", "esperienza"],
      ["salary", "stipendio"], ["position", "posizione / ruolo"], ["strength", "punto di forza"],
      ["weakness", "punto debole"], ["to apply for", "candidarsi per"], ["to hire", "assumere"],
      ["full-time", "a tempo pieno"], ["part-time", "part-time"], ["team player", "persona che lavora bene in squadra"],
      ["goal", "obiettivo"]
    ],
    sentences: [
      ["I have worked here for five years", "Lavoro qui da cinque anni"],
      ["I am applying for the position of sales manager", "Mi candido per la posizione di responsabile vendite"],
      ["My main strength is problem solving", "Il mio principale punto di forza è risolvere problemi"],
      ["Why do you want to work for us", "Perché vuoi lavorare per noi"],
      ["I am good at working in a team", "Sono bravo a lavorare in squadra"],
      ["Where do you see yourself in five years", "Dove ti vedi tra cinque anni"]
    ]
  },
  {
    id: "u11", level: "B1", icon: "✈️", title: "Viaggi di lavoro",
    tip: `<p><b>Futuro</b>: <b>will</b> per decisioni immediate e previsioni (<i>I'll take a taxi</i>), <b>going to</b> per piani (<i>I'm going to visit the client</i>).</p>
<p>Per orari ufficiali si usa il present simple: <i>The flight leaves at 7.</i></p>`,
    words: [
      ["flight", "volo"], ["boarding pass", "carta d'imbarco"], ["luggage", "bagaglio"], ["delay", "ritardo"],
      ["booking", "prenotazione"], ["to book", "prenotare"], ["receipt", "ricevuta"], ["expenses", "spese"],
      ["check-in", "check-in"], ["gate", "gate / uscita"], ["return ticket", "biglietto di andata e ritorno"],
      ["business trip", "viaggio di lavoro"], ["to land", "atterrare"], ["to take off", "decollare"]
    ],
    sentences: [
      ["I'm going to visit the client in London", "Andrò a trovare il cliente a Londra"],
      ["My flight is delayed", "Il mio volo è in ritardo"],
      ["I'd like to book a room for two nights", "Vorrei prenotare una camera per due notti"],
      ["Could I have a receipt please", "Potrei avere una ricevuta per favore"],
      ["I'll take a taxi to the hotel", "Prenderò un taxi per l'hotel"],
      ["The company pays for the expenses", "L'azienda paga le spese"]
    ]
  },
  {
    id: "u12", level: "B1", icon: "🤝", title: "Clienti e servizio",
    tip: `<p><b>Richieste cortesi</b>: <i>Would you like…?</i> (Desidera…?) · <i>I'd be happy to help.</i></p>
<p><b>Scusarsi</b>: <i>I apologise for the inconvenience</i> (Mi scuso per il disagio).</p>
<p><b>Would</b> rende tutto più formale e gentile.</p>`,
    words: [
      ["customer", "cliente"], ["client", "cliente (professionale)"], ["complaint", "reclamo"], ["refund", "rimborso"],
      ["order", "ordine"], ["delivery", "consegna"], ["invoice", "fattura"], ["price", "prezzo"],
      ["discount", "sconto"], ["quote", "preventivo"], ["warranty", "garanzia"], ["to solve", "risolvere"],
      ["inconvenience", "disagio"], ["satisfied", "soddisfatto"]
    ],
    sentences: [
      ["How can I help you", "Come posso aiutarla"],
      ["I apologise for the inconvenience", "Mi scuso per il disagio"],
      ["We will send you the invoice today", "Le invieremo la fattura oggi"],
      ["Would you like a quote", "Desidera un preventivo"],
      ["The delivery will arrive on Thursday", "La consegna arriverà giovedì"],
      ["We can offer you a ten percent discount", "Possiamo offrirle uno sconto del dieci per cento"],
      ["I'd be happy to help", "Sarò felice di aiutarla"]
    ]
  },
  {
    id: "u13", level: "B1", icon: "📊", title: "Progetti e scadenze",
    tip: `<p><b>Present continuous</b> per azioni in corso: <i>We <b>are working</b> on the new project.</i></p>
<p>Scadenze: <i>by Friday</i> (entro venerdì), <i>on time</i> (puntuale), <i>behind schedule</i> (in ritardo sulla tabella di marcia).</p>`,
    words: [
      ["deadline", "scadenza"], ["task", "compito / attività"], ["budget", "budget"], ["schedule", "programma / pianificazione"],
      ["on time", "in tempo / puntuale"], ["behind schedule", "in ritardo sul programma"], ["progress", "avanzamento"],
      ["update", "aggiornamento"], ["goal", "obiettivo"], ["team", "squadra"], ["to deliver", "consegnare"],
      ["milestone", "traguardo intermedio"], ["priority", "priorità"], ["workload", "carico di lavoro"]
    ],
    sentences: [
      ["We are working on the new project", "Stiamo lavorando al nuovo progetto"],
      ["The deadline is next Friday", "La scadenza è venerdì prossimo"],
      ["We are behind schedule", "Siamo in ritardo sul programma"],
      ["Can you give me an update", "Puoi darmi un aggiornamento"],
      ["I need to finish this task by tomorrow", "Devo finire questo compito entro domani"],
      ["This is our top priority", "Questa è la nostra priorità principale"]
    ]
  },
  {
    id: "u14", level: "B1", icon: "🎤", title: "Presentazioni",
    tip: `<p><b>Struttura</b>: <i>Today I'm going to talk about…</i> → <i>First… Then… Finally…</i> → <i>To sum up…</i></p>
<p>Per i grafici: <i>sales <b>increased</b></i> (sono aumentate), <i><b>decreased</b></i> (diminuite), <i><b>remained stable</b></i> (rimaste stabili).</p>`,
    words: [
      ["slide", "diapositiva"], ["chart", "grafico"], ["to increase", "aumentare"], ["to decrease", "diminuire"],
      ["sales", "vendite"], ["growth", "crescita"], ["result", "risultato"], ["to sum up", "per riassumere"],
      ["first of all", "prima di tutto"], ["finally", "infine"], ["audience", "pubblico"], ["data", "dati"],
      ["revenue", "fatturato / ricavi"], ["profit", "profitto"]
    ],
    sentences: [
      ["Today I'm going to talk about our results", "Oggi parlerò dei nostri risultati"],
      ["As you can see in this chart", "Come potete vedere in questo grafico"],
      ["Sales increased by twenty percent", "Le vendite sono aumentate del venti per cento"],
      ["Let's move on to the next slide", "Passiamo alla prossima diapositiva"],
      ["To sum up, it was a good year", "Per riassumere, è stato un buon anno"],
      ["Are there any questions", "Ci sono domande"]
    ]
  },
  {
    id: "u15", level: "B1", icon: "⚖️", title: "Negoziazione",
    tip: `<p><b>Condizionali</b>: <i>If you order 100 units, we <b>will</b> give you a discount.</i></p>
<p>Più ipotetico: <i>If we <b>reduced</b> the price, <b>would</b> you sign today?</i></p>
<p>Formule: <i>That sounds reasonable</i> · <i>We need to think about it</i> · <i>That's our final offer.</i></p>`,
    words: [
      ["offer", "offerta"], ["deal", "accordo / affare"], ["contract", "contratto"], ["terms", "condizioni"],
      ["to sign", "firmare"], ["to negotiate", "negoziare"], ["compromise", "compromesso"], ["reasonable", "ragionevole"],
      ["payment", "pagamento"], ["to accept", "accettare"], ["to reject", "rifiutare"], ["supplier", "fornitore"]
    ],
    sentences: [
      ["That sounds reasonable", "Mi sembra ragionevole"],
      ["If you order more, we will give you a discount", "Se ordinate di più, vi faremo uno sconto"],
      ["We need to think about it", "Dobbiamo pensarci"],
      ["Can we find a compromise", "Possiamo trovare un compromesso"],
      ["This is our final offer", "Questa è la nostra offerta finale"],
      ["We are ready to sign the contract", "Siamo pronti a firmare il contratto"]
    ]
  },
  {
    id: "u16", level: "B1", icon: "🧩", title: "Phrasal verbs del lavoro",
    tip: `<p>I <b>phrasal verbs</b> sono verbi + particella con un significato nuovo.</p>
<p><i>look <b>into</b></i> (approfondire), <i>follow <b>up</b></i> (dare seguito), <i>set <b>up</b></i> (organizzare), <i>carry <b>on</b></i> (continuare).</p>
<p>Sono molto usati nelle email e nelle call: impararli fa sembrare l'inglese naturale.</p>`,
    words: [
      ["to look into", "approfondire / esaminare"], ["to follow up", "dare seguito / ricontattare"],
      ["to set up", "organizzare / impostare"], ["to carry on", "continuare"], ["to find out", "scoprire"],
      ["to fill in", "compilare"], ["to point out", "far notare"], ["to deal with", "occuparsi di / gestire"],
      ["to run out of", "rimanere senza"], ["to catch up", "aggiornarsi / recuperare"], ["to take over", "subentrare"],
      ["to work out", "risolvere / capire"]
    ],
    sentences: [
      ["I will look into the problem", "Esaminerò il problema"],
      ["Let's set up a meeting for next week", "Organizziamo una riunione per la prossima settimana"],
      ["I'm following up on my last email", "Ti ricontatto riguardo alla mia ultima email"],
      ["Please fill in this form", "Per favore compila questo modulo"],
      ["We ran out of time", "Siamo rimasti senza tempo"],
      ["Who is dealing with this client", "Chi si occupa di questo cliente"],
      ["Let's catch up tomorrow", "Aggiorniamoci domani"]
    ]
  }
];
