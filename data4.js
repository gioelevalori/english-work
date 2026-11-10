// Scene originali in stile serie TV (personaggi inventati).
// Voci: f = donna USA, m = uomo USA, gf = donna UK, gm = uomo UK.
// points: concetti chiave da capire; kw = parole (italiano o inglese) che indicano che il concetto è stato capito.
const SCENES = [
  {
    id: "s9", level: "A2", icon: "🛋️", genre: "Sitcom tra amici · USA", title: "Il divano del caffè",
    setting: "New York. Quattro amici sul solito divano del loro caffè preferito. Ben entra con una notizia.",
    cast: { BEN: "m", LUCY: "f", MARCO: "gm", ZOE: "gf" },
    lines: [
      ["BEN", "Guys, guys! You will not believe what just happened.", "Ragazzi, ragazzi! Non ci crederete a quello che è appena successo."],
      ["LUCY", "You finally asked out the girl from the bakery?", "Hai finalmente chiesto di uscire alla ragazza della panetteria?"],
      ["BEN", "No. Better. I got the job!", "No. Meglio. Ho avuto il lavoro!"],
      ["ZOE", "The job? The one at the TV station?", "Il lavoro? Quello alla stazione televisiva?"],
      ["BEN", "Yes! I start on Monday. I'm going to be the new weather guy!", "Sì! Inizio lunedì. Sarò il nuovo ragazzo del meteo!"],
      ["MARCO", "Wait, you? You never know if it's going to rain.", "Aspetta, tu? Tu non sai mai se pioverà."],
      ["BEN", "That's not true. I always carry an umbrella.", "Non è vero. Io porto sempre un ombrello."],
      ["LUCY", "Ben, it's sunny today and you're holding an umbrella.", "Ben, oggi c'è il sole e tu hai in mano un ombrello."],
      ["BEN", "Exactly. Always prepared.", "Esatto. Sempre pronto."],
      ["ZOE", "Okay, coffee is on me. To the new weather guy!", "Ok, il caffè lo offro io. Al nuovo ragazzo del meteo!"]
    ],
    points: [
      { it: "Ben ha una bella notizia: ha ottenuto un lavoro", kw: ["lavoro", "job", "assunto", "notizia"] },
      { it: "Il lavoro è alla TV: farà il meteo", kw: ["meteo", "weather", "tv", "televisi", "tempo"] },
      { it: "Inizia lunedì", kw: ["lunedì", "lunedi", "monday"] },
      { it: "Gli amici scherzano: Ben ha l'ombrello anche se c'è il sole", kw: ["ombrell", "umbrella", "sole", "sunny", "scherz"] },
      { it: "Zoe offre il caffè per festeggiare", kw: ["offre", "caffè", "caffe", "coffee", "festegg", "brindisi"] }
    ],
    summary: "Ben arriva al caffè con una grande notizia: non ha chiesto di uscire alla ragazza della panetteria, ma ha ottenuto il lavoro alla stazione TV e da lunedì farà il meteo. Gli amici lo prendono in giro perché non capisce mai il tempo: oggi c'è il sole e lui ha l'ombrello. Zoe offre il caffè per festeggiare."
  },
  {
    id: "s10", level: "B1", icon: "🍺", genre: "Sitcom tra amici · USA", title: "Al bar: la storia del primo appuntamento",
    setting: "Un bar di Manhattan. Nate racconta agli amici com'è andato il suo primo appuntamento.",
    cast: { NATE: "m", ROSE: "f", TED: "gm" },
    lines: [
      ["ROSE", "So? How did the date go? Tell us everything.", "Allora? Com'è andato l'appuntamento? Raccontaci tutto."],
      ["NATE", "Okay, so I booked a table at that fancy Italian place.", "Ok, allora, ho prenotato un tavolo in quel ristorante italiano elegante."],
      ["TED", "Classic move. Very romantic.", "Mossa classica. Molto romantico."],
      ["NATE", "Except I booked it for the wrong night. The table was for tomorrow.", "Solo che l'ho prenotato per la sera sbagliata. Il tavolo era per domani."],
      ["ROSE", "Oh no. So what did you do?", "Oh no. E cosa hai fatto?"],
      ["NATE", "We ended up eating hot dogs in the park.", "Alla fine abbiamo mangiato hot dog al parco."],
      ["TED", "Ouch. That's a disaster, buddy.", "Ahia. È un disastro, amico."],
      ["NATE", "That's what I thought! But she said it was the best date she's ever had.", "È quello che pensavo anch'io! Ma lei ha detto che è stato il miglior appuntamento che abbia mai avuto."],
      ["ROSE", "Wait, really? Are you seeing her again?", "Aspetta, davvero? La rivedi?"],
      ["NATE", "Tomorrow night. At the fancy Italian place. I already have the table.", "Domani sera. Al ristorante italiano elegante. Il tavolo ce l'ho già."]
    ],
    points: [
      { it: "Nate aveva prenotato un ristorante italiano elegante", kw: ["ristorante", "italian", "prenotat", "tavolo"] },
      { it: "Ha sbagliato sera: la prenotazione era per il giorno dopo", kw: ["sbagliat", "sera sbagliata", "domani", "giorno dopo", "errore"] },
      { it: "Hanno mangiato hot dog al parco", kw: ["hot dog", "parco", "park"] },
      { it: "A lei è piaciuto moltissimo: il miglior appuntamento", kw: ["miglior", "best", "piaciut", "contenta"] },
      { it: "Si rivedono domani sera al ristorante", kw: ["rived", "domani sera", "di nuovo", "secondo appuntamento", "again"] }
    ],
    summary: "Al bar Nate racconta il suo primo appuntamento: aveva prenotato un ristorante italiano elegante, ma per la sera sbagliata (il tavolo era per il giorno dopo). Così hanno mangiato hot dog al parco. Lui pensava fosse un disastro, ma lei ha detto che è stato il miglior appuntamento della sua vita. Si rivedono domani sera, proprio in quel ristorante."
  },
  {
    id: "s11", level: "B1", icon: "🔑", genre: "Sitcom tra amici · USA", title: "Il nuovo coinquilino",
    setting: "Un appartamento a Brooklyn. Mia e Josh fanno il colloquio a un possibile coinquilino.",
    cast: { MIA: "f", JOSH: "m", KEVIN: "gm" },
    lines: [
      ["MIA", "So, Kevin, tell us a little about yourself.", "Allora, Kevin, raccontaci un po' di te."],
      ["KEVIN", "Well, I'm quiet, I'm clean, and I work from home.", "Beh, sono tranquillo, pulito e lavoro da casa."],
      ["JOSH", "From home? What do you do?", "Da casa? Che lavoro fai?"],
      ["KEVIN", "I'm a drummer. I practise about six hours a day.", "Sono un batterista. Mi esercito circa sei ore al giorno."],
      ["MIA", "Six hours? Here? In the apartment?", "Sei ore? Qui? Nell'appartamento?"],
      ["KEVIN", "Don't worry, I use headphones. Most of the time.", "Non preoccupatevi, uso le cuffie. La maggior parte delle volte."],
      ["JOSH", "And what about the other times?", "E le altre volte?"],
      ["KEVIN", "On Saturdays my band comes over to rehearse.", "Il sabato viene la mia band a provare."],
      ["MIA", "Well, thank you for coming, Kevin. We'll call you.", "Beh, grazie di essere venuto, Kevin. Ti chiameremo."],
      ["JOSH", "We won't call him, right?", "Non lo chiameremo, vero?"],
      ["MIA", "We definitely won't call him.", "Decisamente non lo chiameremo."]
    ],
    points: [
      { it: "Cercano un coinquilino e fanno un colloquio a Kevin", kw: ["coinquilin", "roommate", "colloquio", "appartamento", "casa"] },
      { it: "Kevin dice di essere tranquillo e pulito e lavora da casa", kw: ["tranquill", "pulit", "da casa", "quiet", "clean"] },
      { it: "Fa il batterista e suona sei ore al giorno", kw: ["batter", "drum", "sei ore", "6 ore", "suona", "music"] },
      { it: "Il sabato la sua band viene a provare", kw: ["band", "sabato", "saturday", "prov", "gruppo"] },
      { it: "Mia e Josh non lo prenderanno", kw: ["non lo chiam", "non lo prend", "rifiut", "non va bene", "scartat", "non lo vogliono"] }
    ],
    summary: "Mia e Josh fanno un colloquio a Kevin, un possibile coinquilino. Lui dice di essere tranquillo e pulito e di lavorare da casa: ma è un batterista e si esercita sei ore al giorno (quasi sempre con le cuffie), e il sabato la sua band viene a provare. Lo salutano dicendo 'ti chiameremo', ma è chiaro che non lo prenderanno."
  },
  {
    id: "s1", level: "A2", icon: "🏢", genre: "Sitcom d'ufficio · USA", title: "La riunione delle 9",
    setting: "Un ufficio a Chicago. Il capo, Dave, è in ritardo per la riunione del lunedì.",
    cast: { DAVE: "m", KAREN: "f", MIKE: "gm" },
    lines: [
      ["KAREN", "It's nine fifteen. Where is Dave?", "Sono le nove e un quarto. Dov'è Dave?"],
      ["MIKE", "Probably stuck in traffic again. Or buying donuts.", "Probabilmente di nuovo bloccato nel traffico. O a comprare ciambelle."],
      ["DAVE", "Good morning, team! Sorry I'm late. I brought donuts!", "Buongiorno, squadra! Scusate il ritardo. Ho portato le ciambelle!"],
      ["KAREN", "Dave, the client is already on the call. They've been waiting for fifteen minutes.", "Dave, il cliente è già in chiamata. Stanno aspettando da quindici minuti."],
      ["DAVE", "What? The call was at ten!", "Cosa? La chiamata era alle dieci!"],
      ["MIKE", "No, it was moved to nine. I sent you an email on Friday.", "No, è stata spostata alle nove. Ti ho mandato un'email venerdì."],
      ["DAVE", "I don't read emails on Fridays. Everybody knows that.", "Io il venerdì non leggo le email. Lo sanno tutti."],
      ["KAREN", "Okay, just join the call. And please, put the donuts down.", "Va bene, entra nella chiamata. E per favore, posa le ciambelle."],
      ["DAVE", "Hello! Yes, Dave here. Sorry, we had a small technical problem.", "Pronto! Sì, sono Dave. Scusate, abbiamo avuto un piccolo problema tecnico."],
      ["MIKE", "A technical problem called donuts.", "Un problema tecnico chiamato ciambelle."]
    ],
    points: [
      { it: "Dave arriva in ritardo alla riunione", kw: ["ritardo", "tardi", "late", "arriva dopo"] },
      { it: "Dave porta le ciambelle", kw: ["ciambell", "donut", "dolci", "colazione"] },
      { it: "Il cliente aspetta già in chiamata da 15 minuti", kw: ["cliente", "client", "aspett", "quindici", "15"] },
      { it: "La chiamata era stata spostata alle 9 con un'email del venerdì", kw: ["spostat", "email", "mail", "venerdì", "nove", "9"] },
      { it: "Dave inventa una scusa: un problema tecnico", kw: ["tecnic", "scusa", "bugia", "mente", "inventa"] }
    ],
    summary: "Dave, il capo, arriva in ritardo con le ciambelle. Il cliente aspetta già da 15 minuti perché la chiamata era stata spostata alle 9 (Mike l'aveva scritto per email venerdì, ma Dave non legge le email il venerdì). Dave entra in chiamata e si giustifica con un finto 'problema tecnico'."
  },
  {
    id: "s2", level: "A2", icon: "☕", genre: "Commedia britannica · UK", title: "Il tè delle undici",
    setting: "Un piccolo ufficio a Manchester. È l'ora del tè.",
    cast: { EMMA: "gf", OLIVER: "gm" },
    lines: [
      ["OLIVER", "Fancy a cup of tea, Emma?", "Ti va una tazza di tè, Emma?"],
      ["EMMA", "Oh, yes please. I'm absolutely shattered.", "Oh, sì grazie. Sono distrutta."],
      ["OLIVER", "Long night?", "Nottata lunga?"],
      ["EMMA", "I was working on the budget until two in the morning. The numbers just didn't add up.", "Ho lavorato al budget fino alle due di notte. I numeri non tornavano proprio."],
      ["OLIVER", "Did you fix it in the end?", "Alla fine l'hai sistemato?"],
      ["EMMA", "Yes. Someone had typed fifty thousand instead of five thousand.", "Sì. Qualcuno aveva scritto cinquantamila invece di cinquemila."],
      ["OLIVER", "Ah. That might have been me.", "Ah. Potrei essere stato io."],
      ["EMMA", "Oliver!", "Oliver!"],
      ["OLIVER", "Right. I'll make you two cups of tea. And a biscuit.", "Giusto. Ti preparo due tazze di tè. E un biscotto."],
      ["EMMA", "Make it three biscuits, and we'll call it even.", "Facciamo tre biscotti e siamo pari."]
    ],
    points: [
      { it: "Emma è molto stanca", kw: ["stanc", "distrutt", "tired", "shattered", "sonno"] },
      { it: "Ha lavorato al budget fino alle 2 di notte", kw: ["budget", "notte", "due", "2", "tardi"] },
      { it: "C'era un errore: 50.000 invece di 5.000", kw: ["errore", "50", "cinquant", "5000", "cinquemila", "numer", "sbagliat"] },
      { it: "L'errore l'ha fatto Oliver", kw: ["oliver", "colpa", "lui", "stato lui"] },
      { it: "Oliver si fa perdonare con tè e biscotti", kw: ["biscott", "tè", "te ", "tea", "perdon", "pari"] }
    ],
    summary: "Oliver offre un tè a Emma, che è distrutta perché ha lavorato al budget fino alle 2 di notte: i conti non tornavano perché qualcuno aveva scritto 50.000 invece di 5.000. Oliver ammette che è stato lui e per farsi perdonare le offre tè e biscotti; Emma chiede tre biscotti per fare pace."
  },
  {
    id: "s3", level: "B1", icon: "⚖️", genre: "Legal drama · USA", title: "Il contratto",
    setting: "Uno studio legale di New York. Un'avvocata parla con un cliente nervoso.",
    cast: { JESSICA: "f", RYAN: "m" },
    lines: [
      ["RYAN", "Just tell me the truth. Are we going to lose this case?", "Dimmi solo la verità. Perderemo questa causa?"],
      ["JESSICA", "Not if you stop hiding things from me, Ryan.", "No, se smetti di nascondermi le cose, Ryan."],
      ["RYAN", "I'm not hiding anything.", "Non sto nascondendo niente."],
      ["JESSICA", "Then why did I find out this morning that you signed a second contract with their competitor?", "Allora perché stamattina ho scoperto che hai firmato un secondo contratto con il loro concorrente?"],
      ["RYAN", "That was different. It was only for six months.", "Era diverso. Era solo per sei mesi."],
      ["JESSICA", "Six months is enough to break the agreement. Read clause twelve.", "Sei mesi bastano per violare l'accordo. Leggi la clausola dodici."],
      ["RYAN", "So what do we do now?", "E adesso cosa facciamo?"],
      ["JESSICA", "We offer a settlement before they find out. And from now on, you tell me everything.", "Proponiamo un accordo prima che lo scoprano. E da ora in poi, mi dici tutto."],
      ["RYAN", "Fine. Everything.", "Va bene. Tutto."],
      ["JESSICA", "Good. Now sit down. This is going to be a long night.", "Bene. Ora siediti. Sarà una lunga notte."]
    ],
    points: [
      { it: "Ryan ha paura di perdere la causa", kw: ["causa", "perdere", "case", "lose", "processo"] },
      { it: "Ryan ha nascosto qualcosa all'avvocata", kw: ["nascost", "nasconde", "hiding", "segreto", "bugia", "non ha detto"] },
      { it: "Ha firmato un secondo contratto con un concorrente", kw: ["contratto", "concorrent", "competitor", "firmat"] },
      { it: "Anche solo sei mesi violano l'accordo (clausola 12)", kw: ["sei mesi", "6 mesi", "clausola", "viola", "rompe", "accordo"] },
      { it: "Jessica vuole proporre un accordo/transazione", kw: ["accordo", "settlement", "transazione", "patteggi", "proporre"] }
    ],
    summary: "Ryan teme di perdere la causa. Jessica, la sua avvocata, ha scoperto che lui le ha nascosto di aver firmato un secondo contratto con un concorrente: anche se durava solo sei mesi, viola l'accordo (clausola 12). Jessica decide di proporre una transazione prima che l'altra parte lo scopra e gli chiede di dirle sempre tutto."
  },
  {
    id: "s4", level: "B1", icon: "🏥", genre: "Medical drama · USA", title: "Turno di notte",
    setting: "Il pronto soccorso di un ospedale di Seattle, alle tre di notte.",
    cast: { DR_PARK: "m", NURSE_ANA: "f", MR_COLE: "gm" },
    lines: [
      ["NURSE_ANA", "Dr Park, we've got a man in room four. Chest pain, started an hour ago.", "Dottor Park, abbiamo un uomo nella stanza quattro. Dolore al petto, iniziato un'ora fa."],
      ["DR_PARK", "Okay. Blood pressure?", "Ok. Pressione?"],
      ["NURSE_ANA", "A bit high, but stable.", "Un po' alta, ma stabile."],
      ["DR_PARK", "Good evening, sir. I'm Dr Park. Can you tell me what happened?", "Buonasera, signore. Sono il dottor Park. Può dirmi cosa è successo?"],
      ["MR_COLE", "I was at my desk, finishing a presentation, and suddenly my chest felt tight.", "Ero alla scrivania a finire una presentazione e all'improvviso ho sentito il petto stretto."],
      ["DR_PARK", "At three in the morning? Do you often work this late?", "Alle tre di notte? Lavora spesso così tardi?"],
      ["MR_COLE", "Every night this month. Big deadline on Friday.", "Tutte le sere questo mese. Grande scadenza venerdì."],
      ["DR_PARK", "The good news is, your heart looks fine. I think this is stress and too much coffee.", "La buona notizia è che il cuore sembra a posto. Credo sia stress e troppo caffè."],
      ["MR_COLE", "So I can go back to work?", "Quindi posso tornare al lavoro?"],
      ["DR_PARK", "You can go back to bed. The deadline can wait. Your health can't.", "Può tornare a letto. La scadenza può aspettare. La sua salute no."]
    ],
    points: [
      { it: "Un uomo arriva con dolore al petto", kw: ["petto", "chest", "dolore", "cuore", "male"] },
      { it: "Stava lavorando di notte a una presentazione", kw: ["lavor", "presentazion", "notte", "scrivania", "tardi"] },
      { it: "Lavora fino a tardi ogni sera per una scadenza", kw: ["scadenza", "deadline", "ogni sera", "tutte le sere", "venerdì"] },
      { it: "Il cuore sta bene: è stress e troppo caffè", kw: ["stress", "caffè", "coffee", "sta bene", "a posto", "niente di grave"] },
      { it: "Il medico gli dice di andare a dormire: la salute viene prima", kw: ["letto", "dormire", "riposa", "salute", "health"] }
    ],
    summary: "Di notte in pronto soccorso arriva Mr Cole con un dolore al petto. Stava finendo una presentazione alle 3 di notte: lavora fino a tardi ogni sera per una grande scadenza venerdì. Il dottor Park lo visita: il cuore è a posto, è stress e troppo caffè. Gli consiglia di tornare a letto, perché la salute è più importante della scadenza."
  },
  {
    id: "s5", level: "B1", icon: "🕵️", genre: "Poliziesco britannico · UK", title: "Il portatile scomparso",
    setting: "Una stazione di polizia di Londra. Un'ispettrice interroga un impiegato.",
    cast: { INSPECTOR: "gf", MR_HALL: "gm" },
    lines: [
      ["INSPECTOR", "Mr Hall, where were you on Tuesday evening between six and eight?", "Signor Hall, dov'era martedì sera tra le sei e le otto?"],
      ["MR_HALL", "At the office. I was the last one to leave, I think.", "In ufficio. Credo di essere stato l'ultimo ad andarsene."],
      ["INSPECTOR", "And did you notice anything unusual?", "E ha notato qualcosa di strano?"],
      ["MR_HALL", "Well, the director's door was open. It's never open.", "Beh, la porta del direttore era aperta. Non è mai aperta."],
      ["INSPECTOR", "The laptop disappeared from that office. It contains the plans for the new project.", "Il portatile è sparito da quell'ufficio. Contiene i piani del nuovo progetto."],
      ["MR_HALL", "I didn't take it, if that's what you're suggesting.", "Non l'ho preso io, se è questo che sta insinuando."],
      ["INSPECTOR", "I'm not suggesting anything. But the cameras show someone leaving at seven fifteen.", "Non sto insinuando nulla. Ma le telecamere mostrano qualcuno che esce alle sette e un quarto."],
      ["MR_HALL", "That wasn't me. I left at half past seven. You can check my badge.", "Non ero io. Io sono uscito alle sette e mezza. Può controllare il mio badge."],
      ["INSPECTOR", "We already did. Your badge was used at seven fifteen.", "L'abbiamo già fatto. Il suo badge è stato usato alle sette e un quarto."],
      ["MR_HALL", "That's impossible. I lost my badge last week!", "È impossibile. Ho perso il mio badge la settimana scorsa!"]
    ],
    points: [
      { it: "È sparito un portatile dall'ufficio del direttore", kw: ["portatil", "laptop", "computer", "sparit", "rubat", "scompars"] },
      { it: "Il portatile contiene i piani del nuovo progetto", kw: ["piani", "progetto", "plans", "project"] },
      { it: "Mr Hall dice di essere uscito alle 7:30", kw: ["sette e mezza", "7:30", "7.30", "uscito"] },
      { it: "Il suo badge è stato usato alle 7:15", kw: ["badge", "7:15", "7.15", "sette e un quarto", "telecamer"] },
      { it: "Lui dice di aver perso il badge la settimana prima", kw: ["perso", "lost", "settimana scorsa", "smarrit"] }
    ],
    summary: "Un'ispettrice interroga Mr Hall sul portatile sparito dall'ufficio del direttore, che contiene i piani del nuovo progetto. Lui dice di essere uscito per ultimo alle 7:30 e di aver notato la porta del direttore aperta. Ma il suo badge risulta usato alle 7:15, quando le telecamere hanno ripreso qualcuno uscire. Lui sostiene di aver perso il badge la settimana prima."
  },
  {
    id: "s6", level: "B1", icon: "🚀", genre: "Comedy startup · USA", title: "La presentazione agli investitori",
    setting: "San Francisco. Due fondatori di una startup aspettano di presentare l'app agli investitori.",
    cast: { JAKE: "m", PRIYA: "f", INVESTOR: "gm" },
    lines: [
      ["JAKE", "Okay, remember. Confident, but not arrogant. Smile.", "Ok, ricorda. Sicuri di noi, ma non arroganti. Sorridi."],
      ["PRIYA", "Jake, the demo isn't working. The app keeps crashing.", "Jake, la demo non funziona. L'app continua a bloccarsi."],
      ["JAKE", "What? It worked perfectly last night!", "Cosa? Ieri sera funzionava perfettamente!"],
      ["PRIYA", "Last night we had Wi-Fi. This building has no signal.", "Ieri sera avevamo il Wi-Fi. Questo edificio non ha segnale."],
      ["INVESTOR", "Good afternoon. You have ten minutes. Impress me.", "Buon pomeriggio. Avete dieci minuti. Stupitemi."],
      ["JAKE", "Thank you. So, imagine an app that works perfectly even without the internet.", "Grazie. Allora, immaginate un'app che funziona perfettamente anche senza internet."],
      ["PRIYA", "Jake, what are you doing?", "Jake, cosa stai facendo?"],
      ["JAKE", "That's the feature we're going to build next. Version two.", "È la funzione che svilupperemo dopo. Versione due."],
      ["INVESTOR", "Interesting. Offline is a real problem for our clients. Tell me more.", "Interessante. Il funzionamento offline è un vero problema per i nostri clienti. Mi dica di più."],
      ["PRIYA", "Well, it seems we're building an offline mode.", "Beh, a quanto pare stiamo sviluppando una modalità offline."]
    ],
    points: [
      { it: "Devono presentare l'app a un investitore", kw: ["investitor", "investor", "presenta", "pitch", "soldi"] },
      { it: "La demo non funziona: l'app si blocca", kw: ["demo", "non funziona", "blocc", "crash"] },
      { it: "Il problema è che nell'edificio non c'è internet / segnale", kw: ["wi-fi", "wifi", "segnale", "internet", "connession"] },
      { it: "Jake improvvisa: propone un'app che funziona senza internet", kw: ["senza internet", "offline", "improvvis", "versione due", "versione 2"] },
      { it: "All'investitore l'idea piace", kw: ["piace", "interessa", "interessant", "contento", "colpito"] }
    ],
    summary: "Jake e Priya devono presentare la loro app a un investitore, ma la demo si blocca perché nell'edificio non c'è segnale. Jake improvvisa e presenta come idea futura un'app che funziona anche senza internet. L'investitore è interessato, perché per i suoi clienti è un problema reale: ora dovranno davvero sviluppare la modalità offline."
  },
  {
    id: "s7", level: "B2", icon: "📰", genre: "Drama in redazione · UK", title: "La notizia in prima pagina",
    setting: "La redazione di un giornale di Londra, venti minuti prima della chiusura.",
    cast: { EDITOR: "gm", CLAIRE: "gf", SAM: "m" },
    lines: [
      ["EDITOR", "Claire, we go to print in twenty minutes. Is the story ready or not?", "Claire, andiamo in stampa tra venti minuti. L'articolo è pronto o no?"],
      ["CLAIRE", "It's ready, but I only have one source. I need a second confirmation.", "È pronto, ma ho una sola fonte. Mi serve una seconda conferma."],
      ["EDITOR", "One reliable source is enough. The other papers will publish it tonight.", "Una fonte affidabile basta. Gli altri giornali lo pubblicheranno stasera."],
      ["CLAIRE", "And if we're wrong, we'll have to apologise on the front page tomorrow.", "E se sbagliamo, domani dovremo scusarci in prima pagina."],
      ["SAM", "Claire, I just spoke to someone at the ministry. They confirmed it. Off the record.", "Claire, ho appena parlato con una persona del ministero. Hanno confermato. In via ufficiosa."],
      ["CLAIRE", "Off the record isn't good enough.", "In via ufficiosa non basta."],
      ["SAM", "They also sent me the document.", "Mi hanno anche mandato il documento."],
      ["EDITOR", "Then what are we waiting for? Front page. Go.", "E allora cosa aspettiamo? Prima pagina. Vai."],
      ["CLAIRE", "Give me five minutes to check the document. If it's real, it's yours.", "Dammi cinque minuti per verificare il documento. Se è autentico, è tuo."]
    ],
    points: [
      { it: "Mancano 20 minuti alla stampa del giornale", kw: ["venti minuti", "20 minuti", "stampa", "print", "chiusura"] },
      { it: "Claire ha una sola fonte e ne vuole una seconda", kw: ["fonte", "source", "conferma", "seconda"] },
      { it: "Il direttore vuole pubblicare subito perché gli altri giornali lo faranno", kw: ["altri giornali", "concorren", "pubblicare subito", "direttore", "fretta"] },
      { it: "Sam ottiene una conferma dal ministero e un documento", kw: ["ministero", "ministry", "documento", "document", "sam"] },
      { it: "Claire vuole 5 minuti per verificare il documento", kw: ["cinque minuti", "5 minuti", "verific", "controll", "autentic"] }
    ],
    summary: "Mancano 20 minuti alla chiusura del giornale. Claire ha l'articolo pronto ma una sola fonte e vuole una seconda conferma; il direttore insiste per pubblicare perché gli altri giornali lo faranno stasera. Sam ottiene una conferma ufficiosa dal ministero e anche il documento. Claire chiede cinque minuti per verificarlo prima di andare in prima pagina."
  },
  {
    id: "s8", level: "B2", icon: "🍝", genre: "Dramedy familiare · USA", title: "Il ristorante di famiglia",
    setting: "Un ristorante italiano a Boston. Fratello e sorella discutono del futuro del locale.",
    cast: { TONY: "m", GINA: "f" },
    lines: [
      ["GINA", "Tony, we need to talk about the offer from the hotel group.", "Tony, dobbiamo parlare dell'offerta del gruppo alberghiero."],
      ["TONY", "There's nothing to talk about. Dad built this place. We're not selling.", "Non c'è niente di cui parlare. Questo posto l'ha costruito papà. Non vendiamo."],
      ["GINA", "I'm not saying we should sell. But we lost money for the third year in a row.", "Non dico che dobbiamo vendere. Ma abbiamo perso soldi per il terzo anno di fila."],
      ["TONY", "Because the kitchen is old, not because the food is bad.", "Perché la cucina è vecchia, non perché il cibo sia cattivo."],
      ["GINA", "Exactly. And a new kitchen costs money we don't have.", "Esatto. E una cucina nuova costa soldi che non abbiamo."],
      ["TONY", "So what's your plan?", "E quindi qual è il tuo piano?"],
      ["GINA", "They don't want to buy the restaurant. They want us to run the restaurant inside their new hotel.", "Non vogliono comprare il ristorante. Vogliono che gestiamo noi il ristorante dentro il loro nuovo hotel."],
      ["TONY", "Wait. So we keep the name, the recipes, everything?", "Aspetta. Quindi teniamo il nome, le ricette, tutto?"],
      ["GINA", "Everything. And they pay for the new kitchen.", "Tutto. E loro pagano la cucina nuova."],
      ["TONY", "Why didn't you say that at the beginning?", "Perché non l'hai detto subito?"],
      ["GINA", "Because you never let me finish a sentence.", "Perché non mi lasci mai finire una frase."]
    ],
    points: [
      { it: "C'è un'offerta da un gruppo alberghiero", kw: ["offerta", "hotel", "alberg", "offer"] },
      { it: "Tony non vuole vendere: il ristorante l'ha costruito il padre", kw: ["vendere", "padre", "papà", "sell", "dad"] },
      { it: "Il ristorante perde soldi da tre anni", kw: ["perso soldi", "perdono", "tre anni", "3 anni", "perdite", "soldi"] },
      { it: "In realtà devono gestire il ristorante nel nuovo hotel, mantenendo nome e ricette", kw: ["gestire", "dentro", "nome", "ricette", "nel nuovo hotel", "nell'hotel"] },
      { it: "L'hotel paga la cucina nuova", kw: ["cucina", "kitchen", "pagano"] }
    ],
    summary: "Gina vuole parlare dell'offerta di un gruppo alberghiero; Tony rifiuta subito perché il ristorante l'ha costruito il padre. Gina spiega che perdono soldi da tre anni perché la cucina è vecchia e non hanno soldi per rifarla. L'offerta però non è comprare: vogliono che loro gestiscano il ristorante nel nuovo hotel, tenendo nome e ricette, e pagano la cucina nuova. Tony non l'aveva capito perché non la lascia mai finire di parlare."
  }
];
