// Dialoghi di lavoro: battute [chi parla, inglese, italiano] + domande di comprensione (a = indice risposta giusta).
const DIALOGUES = [
  {
    id: "d1", level: "A1", icon: "☕", title: "Il primo giorno in ufficio",
    context: "Luca incontra Sarah, una nuova collega, alla macchinetta del caffè.",
    lines: [
      ["A", "Hi! Are you new here?", "Ciao! Sei nuova qui?"],
      ["B", "Yes, it's my first day. I'm Sarah.", "Sì, è il mio primo giorno. Sono Sarah."],
      ["A", "Nice to meet you, Sarah. I'm Luca. I work in accounting.", "Piacere di conoscerti, Sarah. Sono Luca. Lavoro in contabilità."],
      ["B", "Nice to meet you too. I'm the new marketing assistant.", "Piacere mio. Sono la nuova assistente marketing."],
      ["A", "Great! Do you need any help?", "Ottimo! Hai bisogno di aiuto?"],
      ["B", "Actually, yes. Where is the meeting room?", "In realtà sì. Dov'è la sala riunioni?"],
      ["A", "It's on the second floor, next to the lifts.", "È al secondo piano, vicino agli ascensori."],
      ["B", "Thank you so much!", "Grazie mille!"]
    ],
    quiz: [
      { q: "In che reparto lavora Luca?", o: ["Contabilità", "Marketing", "Vendite"], a: 0 },
      { q: "Che lavoro fa Sarah?", o: ["Assistente marketing", "Contabile", "Responsabile vendite"], a: 0 },
      { q: "Dov'è la sala riunioni?", o: ["Al secondo piano", "Al piano terra", "Accanto alla reception"], a: 0 }
    ]
  },
  {
    id: "d2", level: "A2", icon: "📞", title: "Una telefonata a un cliente",
    context: "Marco chiama l'azienda di un cliente per parlare con Mr Brown.",
    lines: [
      ["B", "Good morning, Tech Solutions. How can I help you?", "Buongiorno, Tech Solutions. Come posso aiutarla?"],
      ["A", "Good morning. Could I speak to Mr Brown, please?", "Buongiorno. Potrei parlare con il signor Brown, per favore?"],
      ["B", "May I ask who's calling?", "Posso chiedere chi parla?"],
      ["A", "It's Marco Rossi from Italdesign.", "Sono Marco Rossi di Italdesign."],
      ["B", "I'm sorry, Mr Brown is in a meeting at the moment. Can I take a message?", "Mi dispiace, il signor Brown è in riunione in questo momento. Vuole lasciare un messaggio?"],
      ["A", "Yes, please. Could you ask him to call me back this afternoon?", "Sì, grazie. Potrebbe chiedergli di richiamarmi questo pomeriggio?"],
      ["B", "Of course. Could you spell your surname, please?", "Certo. Potrebbe fare lo spelling del cognome, per favore?"],
      ["A", "R-O-S-S-I. Thank you very much.", "R-O-S-S-I. Grazie mille."]
    ],
    quiz: [
      { q: "Perché Mr Brown non può rispondere?", o: ["È in riunione", "È in ferie", "È malato"], a: 0 },
      { q: "Cosa chiede Marco?", o: ["Di essere richiamato nel pomeriggio", "Di ricevere un'email", "Un appuntamento domani"], a: 0 },
      { q: "Per quale azienda lavora Marco?", o: ["Italdesign", "Tech Solutions", "Non lo dice"], a: 0 }
    ]
  },
  {
    id: "d3", level: "A2", icon: "🎥", title: "Problemi in videochiamata",
    context: "Inizio di una call con un collega all'estero.",
    lines: [
      ["A", "Hi Tom, can you hear me?", "Ciao Tom, mi senti?"],
      ["B", "Hi! Sorry, you're breaking up a bit.", "Ciao! Scusa, ti sento un po' a scatti."],
      ["A", "Is it better now? I've turned off my camera.", "Va meglio adesso? Ho spento la videocamera."],
      ["B", "Yes, much better. Oh, wait, now I can't hear Anna.", "Sì, molto meglio. Oh, aspetta, ora non sento Anna."],
      ["A", "Anna, I think you're on mute.", "Anna, credo che tu abbia il microfono spento."],
      ["B", "Okay, now we can hear her. Let's start.", "Ok, ora la sentiamo. Iniziamo."],
      ["A", "Great. I'll share my screen with the agenda.", "Perfetto. Condivido lo schermo con l'ordine del giorno."]
    ],
    quiz: [
      { q: "Cosa fa Marco per migliorare la connessione?", o: ["Spegne la videocamera", "Riavvia il computer", "Cambia stanza"], a: 0 },
      { q: "Qual è il problema di Anna?", o: ["Ha il microfono spento", "Non ha il link", "È in ritardo"], a: 0 },
      { q: "Cosa condivide alla fine?", o: ["L'ordine del giorno", "Un video", "Il budget"], a: 0 }
    ]
  },
  {
    id: "d4", level: "A2", icon: "🗓️", title: "Fissare una riunione",
    context: "Due colleghi cercano un momento libero per incontrarsi.",
    lines: [
      ["A", "Hi Emma, we need to discuss the new project. Are you free on Tuesday?", "Ciao Emma, dobbiamo parlare del nuovo progetto. Sei libera martedì?"],
      ["B", "I'm afraid I'm busy all day on Tuesday. How about Wednesday?", "Temo di essere impegnata tutto il giorno martedì. Che ne dici di mercoledì?"],
      ["A", "Wednesday morning works for me. Does ten o'clock suit you?", "Mercoledì mattina mi va bene. Ti vanno bene le dieci?"],
      ["B", "Ten is perfect. Should we invite Paul too?", "Le dieci sono perfette. Invitiamo anche Paul?"],
      ["A", "Yes, good idea. I'll send everyone an invitation.", "Sì, buona idea. Mando un invito a tutti."],
      ["B", "Great, see you on Wednesday then.", "Perfetto, ci vediamo mercoledì allora."]
    ],
    quiz: [
      { q: "Quando si incontreranno?", o: ["Mercoledì alle 10", "Martedì alle 10", "Mercoledì pomeriggio"], a: 0 },
      { q: "Perché martedì non va bene?", o: ["Emma è impegnata tutto il giorno", "È festa", "Paul non c'è"], a: 0 },
      { q: "Chi manderà l'invito?", o: ["Chi propone la riunione", "Emma", "Paul"], a: 0 }
    ]
  },
  {
    id: "d5", level: "B1", icon: "🧑‍💼", title: "Il colloquio di lavoro",
    context: "Un colloquio per una posizione di project manager.",
    lines: [
      ["B", "Thank you for coming. Could you tell me a bit about yourself?", "Grazie di essere venuto. Può parlarmi un po' di sé?"],
      ["A", "Sure. I've worked as a project coordinator for four years.", "Certo. Lavoro come coordinatore di progetto da quattro anni."],
      ["B", "Why do you want to work for us?", "Perché vuole lavorare per noi?"],
      ["A", "Your company is growing fast, and I'd like to take on more responsibility.", "La vostra azienda sta crescendo rapidamente e vorrei assumermi più responsabilità."],
      ["B", "What would you say is your main strength?", "Quale direbbe che è il suo principale punto di forza?"],
      ["A", "I'm very organised and I'm good at working under pressure.", "Sono molto organizzato e lavoro bene sotto pressione."],
      ["B", "And a weakness?", "E un punto debole?"],
      ["A", "Sometimes I find it hard to delegate, but I'm working on it.", "A volte faccio fatica a delegare, ma ci sto lavorando."]
    ],
    quiz: [
      { q: "Da quanto tempo lavora come coordinatore?", o: ["Quattro anni", "Due anni", "Dieci anni"], a: 0 },
      { q: "Qual è il suo punto di forza?", o: ["È organizzato e regge la pressione", "Parla tre lingue", "È molto creativo"], a: 0 },
      { q: "Qual è il suo punto debole?", o: ["Fa fatica a delegare", "Arriva spesso in ritardo", "Non ama lavorare in squadra"], a: 0 }
    ]
  },
  {
    id: "d6", level: "B1", icon: "😠", title: "Gestire un reclamo",
    context: "Un cliente chiama perché la merce è arrivata danneggiata.",
    lines: [
      ["B", "Hello, I'm calling about order number 4521. Some of the boxes arrived damaged.", "Salve, chiamo per l'ordine numero 4521. Alcune scatole sono arrivate danneggiate."],
      ["A", "I'm very sorry to hear that. I apologise for the inconvenience.", "Mi dispiace molto. Mi scuso per il disagio."],
      ["B", "We need the products by Friday for a big event.", "Ci servono i prodotti entro venerdì per un grande evento."],
      ["A", "I understand. We'll send you a replacement today by express delivery.", "Capisco. Le invieremo oggi la merce sostitutiva con consegna espressa."],
      ["B", "Will it arrive in time?", "Arriverà in tempo?"],
      ["A", "Yes, it should arrive on Thursday. And we'll give you a ten percent discount on your next order.", "Sì, dovrebbe arrivare giovedì. E le faremo uno sconto del dieci per cento sul prossimo ordine."],
      ["B", "Thank you, that's very kind.", "Grazie, è molto gentile."]
    ],
    quiz: [
      { q: "Qual è il problema?", o: ["Alcune scatole sono danneggiate", "L'ordine è in ritardo", "La fattura è sbagliata"], a: 0 },
      { q: "Quando arriverà la merce sostitutiva?", o: ["Giovedì", "Venerdì", "Lunedì"], a: 0 },
      { q: "Cosa offre l'azienda in più?", o: ["Uno sconto del 10% sul prossimo ordine", "Un rimborso totale", "Spedizione gratuita per un anno"], a: 0 }
    ]
  },
  {
    id: "d7", level: "B1", icon: "📊", title: "Aggiornamento sul progetto",
    context: "Il responsabile chiede a che punto è il progetto.",
    lines: [
      ["B", "Hi, can you give me a quick update on the website project?", "Ciao, puoi darmi un rapido aggiornamento sul progetto del sito?"],
      ["A", "Sure. We've finished the design, and the developers are working on the homepage.", "Certo. Abbiamo finito il design e gli sviluppatori stanno lavorando alla homepage."],
      ["B", "Are we still on schedule?", "Siamo ancora nei tempi?"],
      ["A", "We're slightly behind schedule. The client asked for some changes last week.", "Siamo leggermente in ritardo. Il cliente ha chiesto alcune modifiche la settimana scorsa."],
      ["B", "How much extra time do you need?", "Quanto tempo in più vi serve?"],
      ["A", "About one week. We should be able to deliver by the twentieth.", "Circa una settimana. Dovremmo riuscire a consegnare entro il venti."],
      ["B", "Okay. Please keep me in the loop.", "Va bene. Tienimi aggiornato, per favore."]
    ],
    quiz: [
      { q: "Cosa è già stato completato?", o: ["Il design", "La homepage", "L'intero sito"], a: 0 },
      { q: "Perché sono in ritardo?", o: ["Il cliente ha chiesto modifiche", "Uno sviluppatore è malato", "Mancano fondi"], a: 0 },
      { q: "Quanto tempo in più serve?", o: ["Circa una settimana", "Un mese", "Due giorni"], a: 0 }
    ]
  },
  {
    id: "d8", level: "B1", icon: "🤝", title: "Trattativa sul prezzo",
    context: "Un acquirente negozia con un fornitore.",
    lines: [
      ["A", "We're interested in ordering five hundred units. What's your best price?", "Siamo interessati a ordinare cinquecento unità. Qual è il vostro prezzo migliore?"],
      ["B", "For five hundred units, the price is twelve euros per unit.", "Per cinquecento unità il prezzo è di dodici euro a unità."],
      ["A", "That's a bit higher than we expected. Could you do ten euros?", "È un po' più alto di quanto ci aspettassimo. Potreste fare dieci euro?"],
      ["B", "I'm afraid ten is too low. But if you order a thousand units, we can offer eleven.", "Temo che dieci sia troppo basso. Ma se ordinate mille unità, possiamo offrire undici."],
      ["A", "What about payment terms?", "E per le condizioni di pagamento?"],
      ["B", "We usually ask for payment within thirty days.", "Di solito chiediamo il pagamento entro trenta giorni."],
      ["A", "That sounds reasonable. Let me discuss it with my team and get back to you.", "Mi sembra ragionevole. Ne parlo con il mio team e vi faccio sapere."]
    ],
    quiz: [
      { q: "Qual è il primo prezzo proposto?", o: ["12 euro a unità", "10 euro a unità", "11 euro a unità"], a: 0 },
      { q: "A quale condizione il prezzo scende a 11 euro?", o: ["Se ordinano mille unità", "Se pagano subito", "Se firmano oggi"], a: 0 },
      { q: "Entro quanto va fatto il pagamento?", o: ["30 giorni", "60 giorni", "Alla consegna"], a: 0 }
    ]
  },
  {
    id: "d9", level: "B1", icon: "🏨", title: "Check-in in hotel",
    context: "Arrivo in hotel durante un viaggio di lavoro.",
    lines: [
      ["B", "Good evening. Welcome to the Park Hotel. Do you have a booking?", "Buonasera. Benvenuto al Park Hotel. Ha una prenotazione?"],
      ["A", "Yes, it's under the name Rossi. Three nights.", "Sì, è a nome Rossi. Tre notti."],
      ["B", "Here it is. Could I see your passport, please?", "Eccola. Potrei vedere il suo passaporto, per favore?"],
      ["A", "Here you are. Is breakfast included?", "Ecco a lei. La colazione è inclusa?"],
      ["B", "Yes, breakfast is served from seven to ten in the restaurant.", "Sì, la colazione è servita dalle sette alle dieci al ristorante."],
      ["A", "Great. And what's the Wi-Fi password?", "Perfetto. E qual è la password del Wi-Fi?"],
      ["B", "It's on your key card. Your room is on the fourth floor. Enjoy your stay!", "È sulla sua chiave magnetica. La sua camera è al quarto piano. Buon soggiorno!"]
    ],
    quiz: [
      { q: "Per quante notti è la prenotazione?", o: ["Tre", "Due", "Una"], a: 0 },
      { q: "A che ora finisce la colazione?", o: ["Alle 10", "Alle 9", "Alle 11"], a: 0 },
      { q: "Dove si trova la password del Wi-Fi?", o: ["Sulla chiave magnetica", "In camera sul tavolo", "Alla reception"], a: 0 }
    ]
  },
  {
    id: "d10", level: "B2", icon: "🕊️", title: "Un disaccordo in riunione",
    context: "Due colleghi non sono d'accordo sul budget di marketing.",
    lines: [
      ["A", "I think we should cut the marketing budget by twenty percent.", "Penso che dovremmo tagliare il budget di marketing del venti per cento."],
      ["B", "I see your point, but I'm not sure that's the right approach.", "Capisco il tuo punto di vista, ma non sono sicura che sia l'approccio giusto."],
      ["A", "Why not? Sales have been slow this quarter.", "Perché no? Le vendite sono state lente questo trimestre."],
      ["B", "Exactly. If we cut marketing now, sales might drop even further.", "Proprio così. Se tagliamo il marketing adesso, le vendite potrebbero calare ancora di più."],
      ["A", "That's a fair point. What would you suggest?", "È un'osservazione giusta. Cosa suggeriresti?"],
      ["B", "Perhaps we could reduce other costs and focus on online campaigns, which are cheaper.", "Forse potremmo ridurre altri costi e concentrarci sulle campagne online, che costano meno."],
      ["A", "Let's look at the figures together and decide next week.", "Guardiamo i numeri insieme e decidiamo la settimana prossima."]
    ],
    quiz: [
      { q: "Cosa propone il primo collega?", o: ["Tagliare il budget di marketing del 20%", "Assumere più venditori", "Aumentare i prezzi"], a: 0 },
      { q: "Perché la collega non è d'accordo?", o: ["Le vendite potrebbero calare ancora", "Il budget è già troppo basso", "Il marketing non serve"], a: 0 },
      { q: "Cosa decidono alla fine?", o: ["Di guardare i numeri e decidere la settimana dopo", "Di tagliare subito il budget", "Di annullare le campagne online"], a: 0 }
    ]
  }
];

// Frasario: frasi pronte da usare al lavoro, per categoria.
const PHRASEBOOK = [
  { icon: "📧", title: "Email: aprire e chiudere", items: [
    ["I hope this email finds you well.", "Spero che stia bene."],
    ["I'm writing to ask about…", "Le scrivo per chiedere informazioni su…"],
    ["Following our phone call, …", "Facendo seguito alla nostra telefonata, …"],
    ["Please find attached…", "In allegato trova…"],
    ["Please let me know if you need anything else.", "Mi faccia sapere se le serve altro."],
    ["I look forward to hearing from you.", "Attendo un suo riscontro."],
    ["Thanks in advance.", "Grazie in anticipo."],
    ["Best regards,", "Cordiali saluti,"]
  ]},
  { icon: "🗓️", title: "Riunioni", items: [
    ["Shall we get started?", "Iniziamo?"],
    ["The purpose of this meeting is to…", "Lo scopo di questa riunione è…"],
    ["Let's move on to the next point.", "Passiamo al punto successivo."],
    ["Sorry to interrupt, but…", "Scusate se interrompo, ma…"],
    ["Could you go over that again?", "Potresti ripetere quel punto?"],
    ["Let's wrap up.", "Concludiamo."],
    ["Who will take care of this?", "Chi se ne occupa?"],
    ["I'll send a summary after the meeting.", "Invierò un riepilogo dopo la riunione."]
  ]},
  { icon: "❓", title: "Quando non capisci", items: [
    ["Sorry, could you repeat that?", "Scusa, potresti ripetere?"],
    ["Could you speak a bit more slowly?", "Potresti parlare un po' più lentamente?"],
    ["What do you mean by…?", "Cosa intendi con…?"],
    ["Just to make sure I understand, …", "Solo per essere sicuro di aver capito, …"],
    ["Could you write it down for me?", "Potresti scrivermelo?"],
    ["How do you spell that?", "Come si scrive?"],
    ["Sorry, I didn't catch that.", "Scusa, non ho capito."]
  ]},
  { icon: "👍", title: "Accordo e disaccordo", items: [
    ["I completely agree.", "Sono completamente d'accordo."],
    ["That's a good point.", "Ottima osservazione."],
    ["I see what you mean, but…", "Capisco cosa intendi, ma…"],
    ["I'm not sure about that.", "Non ne sono sicuro."],
    ["I'm afraid I disagree.", "Temo di non essere d'accordo."],
    ["Let's agree to disagree.", "Restiamo ognuno della propria idea."],
    ["That makes sense.", "Ha senso."]
  ]},
  { icon: "🙏", title: "Chiedere e scusarsi", items: [
    ["Could you give me a hand?", "Potresti darmi una mano?"],
    ["Would you mind checking this?", "Ti dispiacerebbe controllare questo?"],
    ["Sorry for the delay.", "Scusa per il ritardo."],
    ["My apologies for the confusion.", "Mi scuso per la confusione."],
    ["No worries.", "Nessun problema."],
    ["Thanks for your patience.", "Grazie per la pazienza."],
    ["I'll look into it right away.", "Me ne occupo subito."]
  ]},
  { icon: "📞", title: "Telefono e call", items: [
    ["Hello, this is Marco speaking.", "Pronto, sono Marco."],
    ["I'm calling about…", "Chiamo per…"],
    ["Is now a good time?", "È un buon momento?"],
    ["Can I put you on hold?", "Posso metterla in attesa?"],
    ["Let me check and call you back.", "Controllo e ti richiamo."],
    ["Sorry, I have to jump on another call.", "Scusa, devo entrare in un'altra call."],
    ["Thanks for your time.", "Grazie per il tuo tempo."]
  ]},
  { icon: "🎤", title: "Presentazioni", items: [
    ["Thank you all for coming.", "Grazie a tutti per essere venuti."],
    ["I'd like to start by…", "Vorrei iniziare con…"],
    ["As you can see on this slide, …", "Come potete vedere in questa slide, …"],
    ["This brings me to my next point.", "Questo mi porta al punto successivo."],
    ["To sum up, …", "Per riassumere, …"],
    ["I'm happy to take any questions.", "Sono felice di rispondere alle domande."],
    ["That's a great question.", "È un'ottima domanda."]
  ]},
  { icon: "💬", title: "Small talk", items: [
    ["How's it going?", "Come va?"],
    ["How was your weekend?", "Com'è andato il weekend?"],
    ["Any plans for the holidays?", "Programmi per le vacanze?"],
    ["Busy week?", "Settimana impegnativa?"],
    ["Have a nice weekend!", "Buon fine settimana!"],
    ["Long time no see!", "Da quanto tempo!"],
    ["Take care!", "Stammi bene!"]
  ]}
];
