import { SLEEP_GUIDE_CONFIGS as SLEEP_GUIDE_CONFIGS_EN, type SleepGuideConfig } from './sleepGuideContent';

const WEEK_1_CA: SleepGuideConfig = {
  slug: 'week-1',
  ageMonths: 0,
  displayLabel: 'Setm. 1',
  ageLabel: 'nadó d\'1 setmana',
  title: 'Guia del son del nadó — Setmana 1',
  subtitle: 'Què esperar en la primera setmana de son del teu nadó',
  metaDescription:
    'Una guia suau per a la primera setmana de son del teu nounat. Coneix els patrons de son típics, les bases del son segur i per què els horaris imprevisibles són totalment normals.',
  stats: {
    napsPerDay: 'Variarà',
    wakeWindow: '30–90 min',
    bedtime: 'Sense hora fixa per dormir',
    nightSleep: '9–12h (amb despertars)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5–17h',
  },
  sampleSchedule: [
    { time: '—', label: 'Despertar, alimentació i breu moment d\'alerta', type: 'wake' },
    { time: '—', label: 'Son (trams de 30 min a 2h)', type: 'nap' },
    { time: '—', label: 'Alimentació, son i repetir durant el dia', type: 'nap' },
    { time: '—', label: 'El tram més llarg sovint 2–4h durant la nit', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar en la primera setmana',
      content:
        'Benvingut a la primera setmana. Tot és nou — per al teu nadó i per a tu. Ara mateix, el teu nounat no sap la diferència entre el dia i la nit. Dorm en trams curts de 30 minuts a 2 hores, es desperta per alimentar-se i torna a adormir-se. No hi ha un horari, i no n\'hi hauria d\'haver. Això és exactament com dorm un nounat sa.\n\nEl teu nadó necessita entre 15.5 i 17 hores de son en un període de 24 hores, però li arriben en fragments imprevisibles. Alguns trams seran de 20 minuts; d\'altres podrien durar 3 hores. Tot això és normal. El bloc més llarg de son sovint és només de 2–4 hores, i pot passar durant el dia en lloc de fer-ho durant la nit. Això canviarà les properes setmanes, però ara la teva única feina és seguir el ritme del teu nadó.\n\nSi et sembla caòtic, és perquè ho és — i està bé. No hi ha res per corregir en aquesta etapa. El teu nadó s\'està adaptant a la vida fora de l\'úter, i el més útil que pots fer és respondre als seus senyals, mantenir-lo alimentat i descansar sempre que puguis.',
    },
    {
      heading: 'Senyals de son a vigilar',
      content:
        'Fins i tot amb una setmana de vida, el teu nadó dóna senyals quan està a punt per dormir. Les senyals clàssiques són badallar, mirar cap a l\'horitzó, quedar-se molt quiet i el mal humor que no té res a veure amb la gana. Aquestes senyals arriben ràpid — un nounat pot passar d\'estar atent a estar massa cansat en pocs minuts, no com les finestres més llargues que veuràs en nadons més grans.\n\nLes finestres de vetlla a aquesta edat són increïblement curtes: de 30 a 90 minuts, i sovint s\'acosten més al tram curt. Després d\'una alimentació i uns minuts de tranquil·litat amb el nadó despert, és probable que estigui a punt per dormir de nou. No et preocupis per "mantenir-los desperts" per consolidar el son més endavant: aquest enfocament no funciona amb els nounats i pot portar a un nadó massa cansat i més difícil de calmar.',
    },
  ],
  tips: [
    {
      title: 'Posa sempre el nadó boca amunt per dormir',
      description:
        'Dormir boca amunt és la posició més segura per a qualsevol son, de dia i de nit. Un matalàs ferm i pla, sense roba de llit solta, coixins ni joguines és la referència d\'or per a un son segur.',
    },
    {
      title: 'Segueix els senyals del teu nadó, no el rellotge',
      description:
        'No hi ha un horari per seguir aquesta setmana. Alimenta a demanda, deixa que el teu nadó dormi quan està cansat i confia que la imprevisibilitat és temporal i totalment normal.',
    },
    {
      title: 'L\'arropament pot ajudar amb el reflex de sobresalt',
      description:
        'Molts nounats s\'assenten més fàcilment quan se\'ls arropa bé amb els braços dins. Assegura\'t que l\'arropament sigui ferm al voltant del pit però solt a les cuixes per permetre un desenvolupament saludable de l\'articulació del maluc.',
    },
  ],
};

const WEEK_2_CA: SleepGuideConfig = {
  slug: 'week-2',
  ageMonths: 0,
  displayLabel: 'Setm. 2',
  ageLabel: 'nadó de 2 setmanes',
  title: 'Guia del son del nadó — Setmana 2',
  subtitle: 'Patrons de son i consells per al teu nadó de 2 setmanes',
  metaDescription:
    'Com és el son a les 2 setmanes? Coneix els patrons típics de son dels nounats, les finestres de vetlla de 30–90 minuts i consells pràctics per sobreviure als primers dies.',
  stats: {
    napsPerDay: 'Variarà',
    wakeWindow: '30–90 min',
    bedtime: 'Sense hora fixa per dormir',
    nightSleep: '9–12h (amb despertars)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5–17h',
  },
  sampleSchedule: [
    { time: '—', label: 'Despertar i alimentació', type: 'wake' },
    { time: '—', label: 'Període curt d\'alerta (10–30 min)', type: 'nap' },
    { time: '—', label: 'Son (trams de 45 min a 2h)', type: 'nap' },
    { time: '—', label: 'Els cicles alimentació-son continuen durant la nit', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar a les 2 setmanes',
      content:
        'Dos setmanes més tard, comences a trobar una mica el teu ritme — encara que no sembli així. El teu nadó encara dorm al voltant de 15.5 a 17 hores al dia en trams curts i irregulars. La confusió dia-nit ara és molt real: el teu nadó pot tenir el tram de son més llarg durant el dia i estar ben despert a les 2 del matí. Això és normal i es resol de manera natural cap als 3–4 mesos, quan el ritme circadiari es desenvolupa.\n\nPotser notes períodes d\'alerta una mica més llargs aquesta setmana en comparació amb la setmana 1: el teu nadó pot romandre despert 20–40 minuts seguits, mirant-te la cara o responent a la teva veu. Aquests moments de connexió són valuosos, però també cansen el teu nadó. Les finestres de vetlla encara són molt curtes: entre 30 i 90 minuts incloent l\'alimentació, i les finestres més curtes solen passar al matí.\n\nL\'alimentació a demanda continua sent la prioritat. Les alimentacions nocturnes són freqüents i necessàries: l\'estómac del teu nadó és molt petit i necessita menjar cada 2–3 hores, tot el dia i tota la nit. Cada alimentació dona suport al seu creixement i ajuda a establir la teva producció de llet si estàs donant el pit.',
    },
    {
      heading: 'Construir la base per a la consciència dia-nit',
      content:
        'Tot i que un horari de veritat és encara a mesos, pots ajudar amb suavitat el cervell del teu nadó a aprendre la diferència entre el dia i la nit. Durant les alimentacions i els períodes d\'alerta del dia, mantén l\'entorn lluminós i normalment sorollós — no vagis de puntetes. Obre les cortines, segueix el teu dia i deixa que els sons de casa formin part del fons.\n\nDe nit, fes el contrari. Mantén les alimentacions tènues, tranquil·les i com de feina — poca llum, estimulació mínima, sense joc. No estàs entrenant el teu nadó; simplement proporciones senyals ambientals que el cervell en desenvolupament anirà captant a poc a poc. Aquest contrast suau entre el dia i la nit és una de les coses més útils que pots fer en aquestes primeres setmanes.',
    },
  ],
  tips: [
    {
      title: 'Dies lluminosos, nits fosques',
      description:
        'Exposa el teu nadó a la llum natural del dia durant els períodes de vigília i mantén les interaccions de nit tènues i calmes. Aquest contrast simple ajuda el ritme circadiari a començar a desenvolupar-se.',
    },
    {
      title: 'Alimentació a demanda — no miris el rellotge',
      description:
        'El teu nadó sap quan té gana. Alimentar a demanda dona suport a un augment de pes saludable i ajuda a establir patrons d\'alimentació de manera natural. Les alimentacions nocturnes són essencials i s\'esperen.',
    },
    {
      title: 'Accepta ajuda i descansa quan el nadó dorm',
      description:
        'El consell de "dormir quan el nadó dorm" sona simple, però ara importa moltíssim. La teva recuperació és important. Accepta qualsevol oferta d\'ajuda i protegeix el teu descans.',
    },
    {
      title: 'Un entorn de son segur per a cada son',
      description:
        'Tant si és una migdiada de 20 minuts com un tram de 3 hores, fes servir sempre una superfície ferma i plana. Sense coixins, sense llits inclinats, i sense dormir al sofà o en butaques — fins i tot quan estiguis esgotat.',
    },
  ],
};

const MONTH_1_CA: SleepGuideConfig = {
  slug: '1-month-old',
  ageMonths: 1,
  displayLabel: '1 mes',
  ageLabel: 'nadó d\'1 mes',
  title: 'Horari de son d\'1 mes',
  subtitle: 'Patrons de son, finestres de vetlla i consells per al teu nadó d\'1 mes',
  metaDescription:
    'Descobreix com és el son al primer mes: 15.5 hores totals, finestres de vetlla de 30–90 min i per què les migdiades imprevisibles són completament normals. Consells pràctics per a famílies recent estrenades.',
  stats: {
    napsPerDay: 'Variarà',
    wakeWindow: '30–90 min',
    bedtime: 'Sovint 22:00 o més tard',
    nightSleep: '9–12h (amb despertars)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar i alimentació', type: 'wake' },
    { time: '08:00', label: 'Migdiada (durada variable)', type: 'nap' },
    { time: '10:00', label: 'Alimentació, estona d\'alerta, migdiada', type: 'nap' },
    { time: '12:30', label: 'El cicle menjar-despertar-dormir continua', type: 'nap' },
    { time: '22:00', label: '"Hora d\'anar a dormir" tardana', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar al primer mes',
      content:
        'Quan arribes al primer mes, ja has passat el xoc inicial de les dues primeres setmanes, però el panorama del son no canvia de manera dràstica. El teu nadó encara necessita unes 15.5 hores de son entre dia i nit, i les migdiades continuen sent molt imprevisibles: alguns dies tindràs diversos trams llargs i altres semblarà que només fa migdiades de 20 minuts. Tots dos patrons entren dins la normalitat.\n\nA aquesta edat, l\'hora d\'anar a dormir sol ser tardana — sovint cap a les 22:00 o més tard — i està bé. El ritme circadiari del teu nadó encara s\'està desenvolupant, i avançar artificialment l\'hora de dormir encara no acostuma a funcionar. Aquesta hora tardana s\'anirà avançant de manera gradual durant els dos mesos següents. Ara per ara, fes servir el ritme "menjar, jugar, dormir" com a guia flexible, no com un horari rígid.\n\nÉs possible que comencis a notar un tram una mica més llarg de son nocturn — potser de 3–4 hores — i això és un senyal precoç excel·lent de consolidació. Celebra-ho quan passi, però no esperis que passi cada nit. La consistència encara trigarà unes setmanes, i això també és completament normal.',
    },
    {
      heading: 'El ritme de "menjar, jugar, dormir"',
      content:
        'Cap al primer mes, a moltes famílies els ajuda seguir un cicle suau de "menjar, jugar, dormir". Alimenta el teu nadó quan es desperta, gaudeix d\'una estona breu d\'interacció en alerta (encara que només sigui mirar-se o parlar-li suaument), i després ajuda\'l a tornar-se a adormir quan vegis senyals de son. La part de "jugar" a aquesta edat és molt curta: de vegades només 10–15 minuts de calma i atenció.\n\nAixò no és un horari — és un ritme. Alguns cicles duraran 1.5 hores, d\'altres 2.5 hores. Hi haurà dies amb un patró clar i d\'altres que semblaran sense forma. Tot això és normal. El valor d\'aquest ritme és donar una estructura suau al dia sense la pressió d\'objectius de rellotge que simplement no apliquen a un nadó d\'1 mes.',
    },
  ],
  tips: [
    {
      title: 'Fes servir el patró "menjar, jugar, dormir" amb flexibilitat',
      description:
        'Alimenta després del despertar, ofereix una estona breu d\'alerta i després torna a facilitar el son. Aquest ritme suau evita associacions rígides d\'alimentació-per-dormir i manté la flexibilitat que un nounat necessita.',
    },
    {
      title: 'El contrast dia-nit continua sent la teva millor eina',
      description:
        'Dies lluminosos i actius amb cortines obertes i soroll normal. Nits tènues i tranquil·les, amb interacció mínima durant les alimentacions. El cervell del teu nadó està absorbint aquests senyals a poc a poc.',
    },
    {
      title: 'No comparis el son del teu nadó amb el d\'altres',
      description:
        'Cada nadó té un patró diferent a aquesta edat. Alguns fan trams llargs; d\'altres són campions de migdiades curtes i freqüents. Cap dels dos és un problema. El son es consolidarà al seu propi ritme.',
    },
    {
      title: 'Les alimentacions nocturnes nodreixen, no són un fracàs',
      description:
        'A aquesta edat, el teu nadó necessita 2–3 alimentacions nocturnes. No és un problema de son que calgui "arreglar"; és nutrició normal i saludable. Mantén les alimentacions nocturnes en calma i amb poca estimulació per tornar a dormir més ràpid.',
    },
  ],
};

// ── 2 Months ────────────────────────────────────────────────────────────────

const MONTH_2_CA: SleepGuideConfig = {
  slug: '2-month-old',
  ageMonths: 2,
  displayLabel: '2 m',
  ageLabel: 'nadó de 2 mesos',
  title: 'Horari de son de 2 mesos',
  subtitle: 'Finestres de vetlla, patrons de migdiada emergents i consells per al teu nadó de 2 mesos',
  metaDescription:
    'Guia pràctica del son als 2 mesos: 15.5 hores totals de son, finestres de vetlla de 45 min–1.75h, 4–5 migdiades al dia i consells per construir les bases del bon dormir.',
  stats: {
    napsPerDay: '4–5',
    wakeWindow: '45 min–1.75h',
    bedtime: 'Sovint després de les 21:00',
    nightSleep: '9–12h (amb despertars)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5h',
  },
  sampleSchedule: [
    { time: '08:00', label: 'Despertar', type: 'wake' },
    { time: '09:15', label: 'Migdiada 1', type: 'nap' },
    { time: '12:00', label: 'Migdiada 2', type: 'nap' },
    { time: '15:00', label: 'Migdiada 3', type: 'nap' },
    { time: '18:00', label: 'Migdiada 4', type: 'nap' },
    { time: '20:15', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 2 mesos',
      content:
        'Els dos mesos són quan comences a entreveure els primers senyals d\'un patró. El teu nadó encara necessita unes 15.5 hores de son total, però les finestres de vetlla s\'han allargat lleugerament — del rang de nounat de 30–90 minuts a aproximadament 45 minuts a 1 hora 45 minuts. Aquest és un canvi significatiu. Vol dir que tens una mica més de temps despert per gaudir junts, i que les migdiades poden començar a tenir una estructura flexible.\n\nLa majoria dels nadons de 2 mesos fan 4–5 migdiades al dia. Cada migdiada pot durar des de 10 minuts fins a 2 hores — la variabilitat és àmplia i normal. Si el teu nadó fa una migdiada molt llarga (més de 2 hores), generalment convé despertar-lo suaument per protegir el ritme de la resta del dia i assegurar prou alimentacions diürnes.\n\nL\'hora d\'anar a dormir encara és tardana — normalment després de les 21:00 — i una hora més aviat sorgirà de manera natural cap als 3–4 mesos, quan el ritme circadiari maduri. No vas endarrerit si el teu nadó s\'adorm a les 22:00 ara mateix. Això és biologia, no un problema.',
    },
    {
      heading: 'Llegir els senyals de son del teu nadó',
      content:
        'Als 2 mesos, els senyals de son del teu nadó es tornen més clars. Fixa\'t quan es queda quiet i tranquil, mira fixament cap a l\'horitzó, perd interès en les joguines o en la teva cara, i es porta les mans a la cara. Aquests senyals primerencs apareixen abans dels més evidents com badallar i plorar — i captar-los a temps fa que adormir-se sigui molt més fàcil.\n\nLes finestres de vetlla a aquesta edat varien al llarg del dia: la primera finestra del matí sol ser la més curta (al voltant de 45–60 minuts), mentre que les posteriors es poden estirar cap a 1.5–1.75 hores. Presta atenció a quan el teu nadó individual tendeix a mostrar cansament en lloc de seguir un rellotge rígid. Una hora de despertar consistent al matí és una de les millors àncores que pots establir ara mateix.',
    },
  ],
  tips: [
    {
      title: 'Ancora el dia amb una hora de despertar consistent',
      description:
        'Triar una hora de despertar regular al matí (amb 30 minuts de marge) ajuda el rellotge intern del teu nadó a començar a organitzar-se. No cal que sigui d\'hora — 7:30 o 8:00 funciona bé a aquesta edat.',
    },
    {
      title: 'Limita les migdiades a 2 hores',
      description:
        'Si el teu nadó dorm més de 2 hores en una sola migdiada, desperta\'l suaument. Això protegeix les alimentacions diürnes i evita que una migdiada llarga robi pressió de son a la resta del dia.',
    },
    {
      title: 'El xumet és una eina útil',
      description:
        'Si el teu nadó accepta el xumet, fer-lo servir a l\'hora de dormir és tant reconfortant com protector. Les investigacions mostren que l\'ús del xumet durant el son s\'associa amb un menor risc de SMSL.',
    },
    {
      title: 'Observa el teu nadó, no internet',
      description:
        'Als 2 mesos, hi ha una gran variació en el que és normal. Si el teu nadó s\'alimenta bé, guanya pes i té períodes d\'alerta activa, el seu son està fent exactament el que ha de fer — encara que no coincideixi amb l\'horari d\'exemple de dalt.',
    },
  ],
};

// ── 3 Months ────────────────────────────────────────────────────────────────

const MONTH_3_CA: SleepGuideConfig = {
  slug: '3-month-old',
  ageMonths: 3,
  displayLabel: '3 m',
  ageLabel: 'nadó de 3 mesos',
  title: 'Horari de son de 3 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 3 mesos',
  metaDescription:
    'Descobreix quant de son necessita un nadó de 3 mesos, finestres de vetlla ideals (75–90 min), nombre de migdiades i un horari diari d\'exemple per crear hàbits de son saludables.',
  stats: {
    napsPerDay: '4',
    wakeWindow: '1.25–1.5h',
    bedtime: '18:00–20:00',
    nightSleep: '11–12h',
    totalDaySleep: '4–5h',
    totalSleep: '15–17h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '08:15', label: 'Migdiada 1', type: 'nap' },
    { time: '09:45', label: 'Migdiada 2', type: 'nap' },
    { time: '11:30', label: 'Migdiada 3', type: 'nap' },
    { time: '13:30', label: 'Migdiada 4', type: 'nap' },
    { time: '19:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 3 mesos',
      content:
        'Els tres mesos són un punt d\'inflexió preciós. El teu nadó és més alerta i sociable — somriu, balbuceig i segueix la teva cara amb la mirada — la qual cosa significa que el seu cervell treballa a tota màquina fins i tot durant les estones curtes de vigília. Aquesta estimulació augmentada és meravellosa, però també vol dir que es cansa ràpid. La majoria dels nadons de 3 mesos només aguanten 75–90 minuts despert abans de necessitar dormir de nou, així que les migdiades freqüents al llarg del dia són completament normals i esperades.\n\nPotser estàs notant l\'inici de trams nocturns més llargs — alguns nadons a aquesta edat encadenen blocs de 4–6 hores, i de vegades més. Això és un progrés realment emocionant, encara que no sigui consistent. Les alimentacions nocturnes segueixen sent normals i necessàries a aquesta edat; l\'objectiu ara no és eliminar-les sinó donar suport amb suavitat als trams més llargs quan el teu nadó estigui preparat.\n\nLes migdiades als 3 mesos sovint són curtes — de 30 a 45 minuts és el típic — i això està perfectament bé. El teu nadó encara no ha après a enllaçar cicles de son, així que despertar-se després d\'un cicle és biologia normal, no un problema per arreglar. Quatre migdiades al dia eviten que el teu nadó acumuli massa pressió de son entre descansos, la qual cosa en realitat ajuda que el son nocturn vagi més fluid.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Una finestra de vetlla és simplement la quantitat de temps que el teu nadó pot estar còmodament despert entre sons abans d\'estar massa cansat. Als 3 mesos, aquesta finestra és curta — aproximadament de 75 a 90 minuts — i és una de les eines més potents que tens. Comença el proper son abans de veure badalls, fregar-se els ulls o irritabilitat, perquè quan aquests senyals apareixen, el teu nadó potser ja està massa cansat i més difícil de calmar.\n\nLa primera finestra de vetlla del dia sol ser la més curta. Molts nadons de 3 mesos només aguanten uns 75 minuts després de despertar-se al matí abans de necessitar la primera migdiada. Més tard, alguns nadons estiren lleugerament fins a 90 minuts, però observa el teu nadó individual en lloc del rellotge — et donarà senyals quan s\'acosti al seu límit.',
    },
  ],
  tips: [
    {
      title: 'Comença la relaxació 15 minuts abans',
      description:
        'Als 3 mesos, el teu nadó passa d\'alerta a massa cansat més ràpid del que t\'esperes. Comença a baixar els llums, reduir el soroll i calmar l\'activitat uns 15 minuts abans que vulguis que s\'adormi — no quan ja està irritable.',
    },
    {
      title: 'Limita les migdiades de darrera hora de la tarda',
      description:
        'Si l\'última migdiada del teu nadó acaba massa a prop de l\'hora de dormir, no estarà prou cansat per adormir-se. Intenta que l\'última migdiada acabi almenys 1.5–2 hores abans de l\'hora de dormir, encara que impliqui despertar-lo suaument.',
    },
    {
      title: 'Les migdiades curtes són normals — no t\'afanys a arreglar-les',
      description:
        'Una migdiada de 30–45 minuts a aquesta edat és biològicament típica. El teu nadó dorm exactament un cicle de son. Tornar a adormir-se entre cicles és una habilitat que es desenvolupa durant els propers mesos.',
    },
    {
      title: 'La consistència supera la perfecció',
      description:
        'No necessites un horari rígid, però fer coses semblants en un ordre semblant abans de cada son — alimentació, abraçada, habitació fosca — ajuda el cervell del teu nadó a començar a anticipar el son i adormir-se més fàcilment.',
    },
  ],
};

// ── 4 Months ────────────────────────────────────────────────────────────────

const MONTH_4_CA: SleepGuideConfig = {
  slug: '4-month-old',
  ageMonths: 4,
  displayLabel: '4 m',
  ageLabel: 'nadó de 4 mesos',
  title: 'Horari de son de 4 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 4 mesos',
  metaDescription:
    'Horari complet del son als 4 mesos: la regressió del son dels 4 mesos, transició a 3 migdiades, finestres de vetlla de 90–105 min i consells realistes per a l\'hora de dormir.',
  stats: {
    napsPerDay: '3',
    wakeWindow: '1.5–1.75h',
    bedtime: '18:00–20:00',
    nightSleep: '11–12h',
    totalDaySleep: '3–3.5h',
    totalSleep: '14–15.5h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '08:30', label: 'Migdiada 1', type: 'nap' },
    { time: '10:30', label: 'Migdiada 2', type: 'nap' },
    { time: '13:00', label: 'Migdiada 3', type: 'nap' },
    { time: '19:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 4 mesos',
      content:
        'Els quatre mesos són una de les edats de les que més es parla en el son infantil — i amb raó. Cap a aquest moment, l\'arquitectura del son del teu nadó madura de manera permanent, passant del patró de nounat (caure en son profund ràpidament) a un cicle més semblant al de l\'adult amb una fase inicial més lleugera. Això és un salt neurològic genuí, i pot fer que el son sembli que de sobte ha empitjorat fins i tot quan les coses anaven millorant. Si estàs en aquesta fase ara, no estàs fent res malament — és un canvi evolutiu normal.\n\nPel costat positiu, el teu nadó ara és molt més sociable i receptiu. La interacció, el temps de panxa i el joc són més estimulants que fa un mes, la qual cosa vol dir que les finestres de vetlla són una mica més llargues — la majoria dels nadons de 4 mesos aguanten 90–105 minuts. Passar de quatre a tres migdiades és habitual a aquesta edat, tot i que alguns nadons necessiten unes setmanes més per estar preparats per a la transició.\n\nEl son nocturn pot ser imprevisible durant el període de regressió, però la necessitat total de son del teu nadó no ha disminuït — simplement s\'està redistribuint mentre el seu ritme es reorganitza. Mantenir una hora de dormir consistent i respondre amb calma als despertars nocturns és el més útil que pots fer ara mateix.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Als 4 mesos, la majoria dels nadons han passat a finestres de vetlla d\'uns 90–105 minuts. Probablement notaràs que la primera finestra del dia segueix sent la més curta — a prop de 90 minuts — mentre que les finestres més tard poden acostar-se als 105 minuts a mesura que la resistència del teu nadó creix al llarg del dia.\n\nAmb tres migdiades, la distribució importa més. Intenta que l\'última migdiada del dia sigui prou curta (30–45 minuts) perquè el teu nadó estigui cansat a l\'hora de dormir. Si l\'última migdiada acaba massa tard i el teu nadó no mostra senyals de son a l\'hora de dormir, potser cal escurçar-la o avançar-la.',
    },
  ],
  tips: [
    {
      title: 'Travessa la regressió amb consistència',
      description:
        'La regressió dels 4 mesos és temporal, normalment dura 2–4 setmanes. No és el moment de canviar-ho tot — mantén les teves rutines consistents i ofereix moltes alimentacions diürnes per compensar les nits alterades.',
    },
    {
      title: 'Observa els senyals de preparació per a 3 migdiades',
      description:
        'El teu nadó pot estar preparat per passar a 3 migdiades quan rebutja consistentment la 4a migdiada, tarda més a adormir-se per a ella, o comença a despertar-se inusualment d\'hora al matí. No ho forcis — segueix el seu ritme.',
    },
    {
      title: 'Enfosqueix l\'entorn de son',
      description:
        'Ara que el son del teu nadó és més lleuger en la fase inicial, una habitació fosca es torna més important. Les cortines opaques poden marcar una diferència real tant en la durada de les migdiades com en la qualitat del son nocturn.',
    },
    {
      title: 'Introdueix un ritual senzill abans de dormir',
      description:
        'Una seqüència curta i repetible abans de cada son — fins i tot només dos minuts de gronxar suaument i una frase tranquil·la — ajuda el sistema nerviós del teu nadó a anticipar i preparar-se per dormir. Consistència per sobre de complexitat.',
    },
  ],
  regression: {
    name: 'Regressió del son dels 4 mesos',
    description:
      'Cap als 4 mesos, els cicles de son del teu nadó maduren per assemblar-se als patrons adults. Això pot alterar temporalment el son amb més despertars, migdiades més curtes i major irritabilitat a l\'hora de dormir. Sol durar 2–4 setmanes.',
  },
};

// ── 5 Months ────────────────────────────────────────────────────────────────

const MONTH_5_CA: SleepGuideConfig = {
  slug: '5-month-old',
  ageMonths: 5,
  displayLabel: '5 m',
  ageLabel: 'nadó de 5 mesos',
  title: 'Horari de son de 5 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 5 mesos',
  metaDescription:
    'Descobreix l\'horari ideal del son als 5 mesos: 3 migdiades, finestres de vetlla de 105–120 min i consells experts per millorar la consolidació de migdiades i el son nocturn.',
  stats: {
    napsPerDay: '3',
    wakeWindow: '1.75–2h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '3–3.5h',
    totalSleep: '14–15.5h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '08:45', label: 'Migdiada 1', type: 'nap' },
    { time: '11:00', label: 'Migdiada 2', type: 'nap' },
    { time: '13:30', label: 'Migdiada 3 (curta)', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 5 mesos',
      content:
        'Els cinc mesos sovint es viuen com una temporada més estable després de la convulsió de la regressió dels 4 mesos. El teu nadó és més capaç físicament — es gira, agafa objectes i comença a aguantar pes a les cames — i el seu cervell processa una quantitat notable d\'estímuls sensorials nous cada dia. Aquesta estimulació extra vol dir que les finestres de vetlla han crescut a 105–120 minuts, donant-te una mica més de marge entre migdiades.\n\nLa majoria dels nadons de 5 mesos segueixen amb 3 migdiades, sent la tercera una migdiada pont més curta per portar-los fins a l\'hora de dormir sense quedar-se massa cansats. Potser trobes que les migdiades comencen a consolidar-se — el teu nadó pot començar a enllaçar cicles de son i dormir 45 minuts o més d\'un tram, la qual cosa és un progrés real que val la pena celebrar.\n\nEl son nocturn sol ser més previsible aquest mes. Molts nadons són capaços de trams més llargs — de vegades de 6–8 hores — tot i que les alimentacions nocturnes poden seguir formant part de la rutina i això és completament normal. La clau als 5 mesos és establir una hora de dormir prou aviat (cap a les 18:30–19:00) per evitar que el teu nadó s\'adormi massa cansat.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Als 5 mesos, les finestres de vetlla de 105–120 minuts et donen una mica més de flexibilitat per estructurar el dia. La primera finestra després del despertar matinal sol ser la més curta — al voltant de 105 minuts. A la tarda, alguns nadons estiren còmodament fins a les 2 hores.\n\nLa tercera finestra de vetlla del dia — entre l\'última migdiada i l\'hora de dormir — sol ser la més complicada. Si la tercera migdiada acaba cap a les 15:30–16:00, apunta a una hora de dormir no més tard de les 18:00–18:30 per evitar l\'excés de cansament. Una hora de dormir aviat no és un problema a aquesta edat; no provoca despertars matiners (això sol ser l\'excés de cansament fent just el contrari).',
    },
  ],
  tips: [
    {
      title: 'Tracta la tercera migdiada com un "pont"',
      description:
        'La tercera migdiada no cal que sigui llarga — 30–45 minuts és ideal. La seva funció és simplement fer de pont fins a l\'hora de dormir sense que el teu nadó s\'ensorri. Mantén-la prou aviat perquè acabi almenys 1.5 hores abans de dormir.',
    },
    {
      title: 'Prova una hora de despertar consistent',
      description:
        'Ancorar el dia amb una hora de despertar matinal consistent (±30 minuts) ajuda el ritme circadiari del teu nadó a estabilitzar-se, la qual cosa fa que els horaris de migdiades i l\'hora de dormir siguin més previsibles amb el temps.',
    },
    {
      title: 'Respon al gir al bressol',
      description:
        'Si el teu nadó ha començat a girar-se, pot trobar-se en noves posicions durant la nit i espantar-se en despertar-se. Dóna-li uns minuts abans d\'anar-hi — molts nadons tornen a adormir-se sols un cop s\'acostumen a moure\'s en el seu espai de son.',
    },
    {
      title: 'No et saltis la relaxació ni per les migdiades',
      description:
        'Un breu període de relaxació de 5 minuts abans de cada migdiada — baixar les persianes, reduir estímuls, fer servir una frase o cançó consistent — indica al sistema nerviós del teu nadó que el son s\'acosta. És especialment útil a mesura que els temps de vigília s\'allarguen i el cervell s\'activa més.',
    },
  ],
};

// ── 6 Months ────────────────────────────────────────────────────────────────

const MONTH_6_CA: SleepGuideConfig = {
  slug: '6-month-old',
  ageMonths: 6,
  displayLabel: '6 m',
  ageLabel: 'nadó de 6 mesos',
  title: 'Horari de son de 6 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 6 mesos',
  metaDescription:
    'Guia completa del son als 6 mesos: 3 migdiades, finestres de vetlla de 2–2.25h, hora de dormir ideal 18:00–19:30 i consells per gestionar sòlids i consolidació del son.',
  stats: {
    napsPerDay: '3',
    wakeWindow: '2–2.25h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '3–3.5h',
    totalSleep: '14–15.5h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '09:00', label: 'Migdiada 1', type: 'nap' },
    { time: '11:30', label: 'Migdiada 2', type: 'nap' },
    { time: '14:15', label: 'Migdiada 3 (curta)', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 6 mesos',
      content:
        'Els sis mesos són una fita. El teu nadó ja porta la meitat del seu primer any, seu amb suport, mostra preferències clares i sovint comença a explorar l\'alimentació sòlida. Tota aquesta energia de desenvolupament és emocionant i rellevant per al son — un nadó que està més implicat mental i físicament durant el dia tendeix a dormir més profundament a la nit.\n\nLa majoria dels nadons de 6 mesos segueixen amb 3 migdiades, tot i que el buit entre la migdiada 2 i la migdiada 3 pot semblar llarg i de tant en tant aquella tercera migdiada es converteix en una batalla. És un senyal que la capacitat del teu nadó creix però encara no està preparat per eliminar una migdiada. La paciència aquí val la pena — forçar la transició a 2 migdiades massa aviat sovint porta a excés de cansament i nits alterades.\n\nComençar amb sòlids cap als 6 mesos és emocionant, però no millorarà directament el son (tot i el consell habitual d\'afegir cereals d\'arròs a la nit). El que sí ajuda és mantenir les alimentacions — pit o biberó — com a font principal de nutrició i fer servir els àpats per ancorar el ritme del dia. La palanca més potent per al son a aquesta edat és una hora de dormir consistent i prou aviat.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Als 6 mesos, les finestres de vetlla solen ser de 2–2.25 hores. Això és un salt significatiu respecte a fa uns mesos, i vol dir que el teu nadó pot gestionar jocs més actius i variats abans de necessitar descansar. La primera finestra del dia és d\'unes 2 hores, i les finestres es poden acostar a 2.25 hores a mesura que avança el dia.\n\nEstigues atent als senyals subtils primerencs d\'excés de cansament: perdre interès en les joguines, mirar al buit, o tornar-se més enganxós amb tu. Aquests sovint apareixen abans del clàssic badall i fregar-se els ulls, i actuar-hi a temps fa que adormir-se sigui més fàcil i ràpid.',
    },
  ],
  tips: [
    {
      title: 'Mantén els sòlids lluny de l\'alimentació abans de dormir',
      description:
        'En introduir sòlids, ofereix-los al migdia en lloc de l\'última alimentació abans de dormir. La digestió no millora el son, però un estómac incòmode pot alterar-lo. Mantén la rutina abans de dormir centrada en la llet i la calma.',
    },
    {
      title: 'Protegeix la tercera migdiada encara que sigui una lluita',
      description:
        'Si el teu nadó rebutja la tercera migdiada alguns dies, prova un passeig amb cotxet o una migdiada en braços en lloc de saltar-la. Un nadó de 6 mesos massa cansat a l\'hora de dormir sol significar més despertars nocturns, no menys.',
    },
    {
      title: 'Practica adormir-se sol en moments de baixa pressió',
      description:
        'Posa el teu nadó somnolent però despert en almenys una migdiada al dia per donar-li pràctica en adormir-se sense ajuda completa. Si protesta una mica, està bé — uns minuts de queixa suau són diferents del plor d\'angoixa.',
    },
    {
      title: 'Fes que l\'entorn de son estigui completament fosc',
      description:
        'Als 6 mesos, el teu nadó és més conscient visualment i es distreu fàcilment amb la llum. Foscor total durant tots els sons — migdiades i nits — pot allargar notablement la durada del son.',
    },
  ],
};

// ── 7 Months ────────────────────────────────────────────────────────────────

const MONTH_7_CA: SleepGuideConfig = {
  slug: '7-month-old',
  ageMonths: 7,
  displayLabel: '7 m',
  ageLabel: 'nadó de 7 mesos',
  title: 'Horari de son de 7 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 7 mesos',
  metaDescription:
    'Tot el que necessites per a l\'horari de son als 7 mesos: 3 migdiades, finestres de vetlla de 2–2.5h, hora de dormir 18:00–19:30 i consells per a l\'alteració del son en la fase de gateig.',
  stats: {
    napsPerDay: '3',
    wakeWindow: '2–2.5h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '3–3.5h',
    totalSleep: '14–15.5h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '09:00', label: 'Migdiada 1', type: 'nap' },
    { time: '11:45', label: 'Migdiada 2', type: 'nap' },
    { time: '14:30', label: 'Migdiada 3 (curta)', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 7 mesos',
      content:
        'Els set mesos porten un augment notable en l\'activitat física. Molts nadons a aquesta edat s\'arrosseguen, pivoten sobre la panxa o comencen a agafar-se als mobles per aixecar-se. Aquest desenvolupament motor és incansable — el teu nadó practica moviment fins i tot en el seu espai de son, la qual cosa pot provocar nous despertars nocturns en trobar-se en posicions desconegudes.\n\nEl son sol estar més estructurat aquest mes. La majoria dels nadons de 7 mesos estan amb 3 migdiades, tot i que la tercera és cada cop més curta i de transició. Potser notes que el teu nadó comença a resistir-s\'hi o a lluitar-la més que en setmanes anteriors. Això és normal — la seva capacitat per aguantar estones més llargues despert creix, però la majoria no estan preparats per passar a 2 migdiades fins als 8–9 mesos.\n\nLa consciència de la separació també pot començar a emergir cap als 7 mesos. El teu nadó pot tornar-se més enganxós a l\'hora de dormir, volent que el tinguis en braços o protestant quan el deixes. Això no és una regressió — és un senyal sa de desenvolupament cognitiu. Una rutina càlida i consistent a l\'hora de dormir dóna al teu nadó la seguretat que tornaràs encara que no et pugui veure.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Als 7 mesos, les finestres de vetlla van de 2 a 2.5 hores depenent del moment del dia i del ritme individual del teu nadó. La primera finestra després del despertar matinal sol ser d\'unes 2 hores; quan s\'acosta el període de la tercera migdiada, el teu nadó pot aguantar gairebé 2.5 hores abans de mostrar senyals.\n\nL\'activitat física d\'aquest mes pot emmascarar el cansament. Un nadó que està gategant activament o explorant pot semblar enèrgic fins que s\'ensorri de cop. Confia en el rellotge com a guia de reserva — si han passat 2.5 hores i el teu nadó no ha mostrat senyals de cansament, comença la relaxació igualment.',
    },
  ],
  tips: [
    {
      title: 'Ofereix temps de terra abans de les migdiades',
      description:
        'Temps abundant de panxa i moviment lliure durant les finestres de vetlla ajuda el teu nadó a processar l\'aprenentatge físic que està fent. Un nadó que ha tingut bona activitat física sol adormir-se més fàcilment que un que ha estat en una cadira.',
    },
    {
      title: 'Mantén l\'hora de dormir aviat durant els salts motors',
      description:
        'Les noves habilitats físiques requereixen un processament neuronal enorme, i el cervell del teu nadó treballa dur fins i tot durant el son. Una hora de dormir aviat — 18:00–18:30 durant les setmanes de desenvolupament intens — prevé l\'excés de cansament i afavoreix un millor son nocturn.',
    },
    {
      title: 'Aborda la separació a l\'inici de la rutina',
      description:
        'Si el teu nadó es torna més enganxós a l\'hora de dormir, inclou temps extra de connexió al principi de la rutina — abraçades, contacte visual, parlar amb calma — abans del moment final de deixar-lo. Satisfer la necessitat aviat vol dir menys protesta després.',
    },
    {
      title: 'Revisa l\'espai de son per perills de moviment',
      description:
        'Ara que el teu nadó es mou més, comprova que el bressol estigui net i el matalàs a una alçada segura. Si s\'agafa per posar-se dret, baixa el matalàs per prevenir caigudes.',
    },
  ],
};

// ── 8 Months ────────────────────────────────────────────────────────────────

const MONTH_8_CA: SleepGuideConfig = {
  slug: '8-month-old',
  ageMonths: 8,
  displayLabel: '8 m',
  ageLabel: 'nadó de 8 mesos',
  title: 'Horari de son de 8 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 8 mesos',
  metaDescription:
    'Guia del son als 8 mesos: transició a 2 migdiades, finestres de vetlla de 2.5–3h, la regressió dels 8 mesos i consells per a l\'ansietat de separació.',
  stats: {
    napsPerDay: '2',
    wakeWindow: '2.5–3h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '2.5–3h',
    totalSleep: '13.5–15h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '09:30', label: 'Migdiada 1', type: 'nap' },
    { time: '13:30', label: 'Migdiada 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 8 mesos',
      content:
        'Els vuit mesos són un punt de transició important: la majoria dels nadons estan preparats per passar de 3 migdiades a 2. Els senyals són clars quan arriben — el teu nadó rebutja sistemàticament la tercera migdiada, la fa molt tard (endarrerint l\'hora de dormir), o s\'adorm tan cansat que les nits es desestabilitzen. Passar a 2 migdiades sol anar bé quan esperes aquests senyals de preparació en lloc de fer el canvi pel calendari.\n\nLa regressió dels 8 mesos ve impulsada per una combinació de fites acumulades — gatejar, agafar-se per aixecar-se, primers intents de posar-se dret i l\'aparició de l\'ansietat de separació. El cervell del teu nadó processa informació social i espacial complexa les 24 hores. Això pot traduir-se en més despertars nocturns, dificultat a l\'hora de dormir i migdiades més curtes que abans s\'estaven consolidant. Frustrant en el moment, però és un senyal de desenvolupament sa.\n\nL\'ansietat de separació arriba al pic cap a aquesta edat i es viu amb més intensitat a l\'hora de dormir. El teu nadó ara entén la permanència de l\'objecte — sap que existeixes quan surts de l\'habitació — i et vol de tornada. Una rutina càlida i previsible a l\'hora de dormir és la teva eina més eficaç. La consistència transmet seguretat.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'El salt a 2 migdiades també vol dir que les finestres de vetlla s\'allarguen considerablement — a 2.5–3 hores. La primera finestra del dia és típicament d\'unes 2.5 hores, mentre que l\'última finestra abans de dormir sol estendre\'s a gairebé 3 hores a mesura que el teu nadó guanya resistència.\n\nAmb dues migdiades, l\'horari té àncores més naturals. Apunta a la primera migdiada cap a les 9:30–10:00 i la segona cap a les 13:00–14:00, amb hora de dormir 3–3.5 hores després que acabi la segona migdiada. La finestra llarga de la tarda pot semblar molt al principi — sortides curtes i joc actiu ajuden a omplir-la sense crear excés de cansament.',
    },
  ],
  tips: [
    {
      title: 'Fes la transició a 2 migdiades gradualment',
      description:
        'Si el teu nadó lluita contra la tercera migdiada però no està del tot preparat per a només dues, prova a endarrerir les migdiades a poc a poc durant una setmana en lloc d\'eliminar la tercera de cop. Un canvi gradual és més fàcil per a tothom.',
    },
    {
      title: 'Fes servir un ritual curt de comiat a cada separació',
      description:
        'En sortir de l\'habitació a l\'hora de dormir, fes servir la mateixa frase sempre — "Bona nit, t\'estimo, ens veiem al matí" — i digues-ho de cor. Les paraules previsibles són genuïnament tranquil·litzadores per a un nadó amb ansietat de separació.',
    },
    {
      title: 'Protegeix l\'àncora de la migdiada del matí',
      description:
        'En l\'horari de 2 migdiades, la primera migdiada és la columna vertebral del dia. Mantenir-la a una hora consistent (amb 30 minuts de marge) ajuda a ancorar la migdiada de la tarda i l\'hora de dormir, fent tot el dia més previsible.',
    },
    {
      title: 'Ofereix connexió extra abans de dormir durant la regressió',
      description:
        'Durant el període de regressió, afegeix 5–10 minuts d\'atenció tranquil·la i exclusiva a l\'inici de la rutina de dormir. La proximitat física abans de dormir ajuda el sistema nerviós del teu nadó a relaxar-se, facilitant l\'adormiment.',
    },
  ],
  regression: {
    name: 'Regressió del son dels 8 mesos',
    description:
      'La regressió dels 8 mesos sovint coincideix amb grans fites — gatejar, posar-se dret i ansietat de separació. El teu nadó pot resistir-se a les migdiades, despertar-se més a la nit o tenir dificultat per adormir-se. Aquesta fase sol passar en 2–3 setmanes.',
  },
};

// ── 9 Months ────────────────────────────────────────────────────────────────

const MONTH_9_CA: SleepGuideConfig = {
  slug: '9-month-old',
  ageMonths: 9,
  displayLabel: '9 m',
  ageLabel: 'nadó de 9 mesos',
  title: 'Horari de son de 9 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 9 mesos',
  metaDescription:
    'Horari pràctic del son als 9 mesos: 2 migdiades, finestres de vetlla de 2.5–3.5h, hora de dormir 18:00–19:30 i consells per gestionar quan es posa dret al bressol i els despertars matiners.',
  stats: {
    napsPerDay: '2',
    wakeWindow: '2.5–3.5h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '2.5–3h',
    totalSleep: '13.5–15h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '09:30', label: 'Migdiada 1', type: 'nap' },
    { time: '13:30', label: 'Migdiada 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 9 mesos',
      content:
        'Els nou mesos són una edat de gran audàcia física. El teu nadó probablement s\'agafa per posar-se dret, es desplaça agafat als mobles i potser està fent els primers passos titubejos amb suport. Aquesta empenta de mobilitat porta un enorme orgull cognitiu — i un enorme cansament físic — així que l\'estructura de 2 migdiades establerta el mes passat continua funcionant bé.\n\nMolts nadons de 9 mesos desenvolupen la capacitat de posar-se dret al bressol però encara no han entès com tornar a baixar. Això causa sovint despertars nocturns desconcertants — el teu nadó no està angoixat per un malson o gana, simplement està atrapat dret i necessita que el baixis suaument a la posició ajaguda. Practicar el moviment de seure des de la posició dreta durant el joc al terra durant el dia accelera que ho aprengui pel seu compte.\n\nL\'alimentació sòlida s\'està consolidant aquest mes, la qual cosa pot canviar subtilment el ritme del dia. A mesura que les alimentacions de llet es tornen una mica menys freqüents, la gana és menys probable com a causa de despertars nocturns, i la consolidació del son sovint millora al voltant d\'aquest moment com a resultat.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Als 9 mesos, les finestres de vetlla van d\'unes 2.5 a 3.5 hores. La primera finestra és típicament de 2.5–3 hores, i la finestra final abans de dormir pot estirar-se còmodament a 3–3.5 hores per a molts nadons.\n\nEls despertars matiners són un repte habitual aquest mes. Si el teu nadó es desperta abans de les 6:00 AM de forma consistent, el culpable sol ser una de tres coses: la necessitat total de son es cobreix amb nits molt llargues, la primera migdiada s\'ofereix massa aviat (reforçant el despertar matiner), o l\'entorn de son s\'il·lumina massa. Aborda l\'entorn primer — és la palanca més fàcil.',
    },
  ],
  tips: [
    {
      title: 'Practica seure des de posar-se dret durant el dia',
      description:
        'Si el teu nadó es posa dret al bressol a la nit, dedica temps de joc al terra a practicar "baixar" — guia\'l perquè baixi de la posició dreta a seure. Això sol resoldre el problema de posar-se dret a la nit en 1–2 setmanes.',
    },
    {
      title: 'No endarrereixis massa la migdiada del matí',
      description:
        'És temptador estirar la finestra de vetlla matinal per fer l\'horari més net, però als 9 mesos, una finestra matinal de 3 hores sol ser el màxim. Passar-se crea un nadó cansat i irritable que tarda més a adormir-se.',
    },
    {
      title: 'Revisa la situació de llum al matí d\'hora',
      description:
        'Fins i tot una petita quantitat de llum a les 5:30 AM pot indicar "matí" al sistema circadiari en desenvolupament del teu nadó. Comprova si hi ha filtracions de llum al voltant de les persianes opaques, especialment quan els dies s\'allarguen estacionalment.',
    },
    {
      title: 'Evita que la segona migdiada es faci massa tard',
      description:
        'Amb finestres de vetlla més llargues, la segona migdiada pot anar-se\'n tard a la tarda. Intenta que la segona migdiada acabi com a màxim a les 16:00–16:30 per protegir la pressió de son a l\'hora de dormir — una hora de dormir ben posada és la base d\'una bona nit.',
    },
  ],
};

// ── 10 Months ───────────────────────────────────────────────────────────────

const MONTH_10_CA: SleepGuideConfig = {
  slug: '10-month-old',
  ageMonths: 10,
  displayLabel: '10 m',
  ageLabel: 'nadó de 10 mesos',
  title: 'Horari de son de 10 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 10 mesos',
  metaDescription:
    'Guia definitiva del son als 10 mesos: 2 migdiades, finestres de vetlla de 2.75–3.5h, hora de dormir 18:00–19:30 i com gestionar el rebuig de migdiades abans de la transició de 2 a 1.',
  stats: {
    napsPerDay: '2',
    wakeWindow: '2.75–3.5h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '2.5–3h',
    totalSleep: '13.5–15h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '09:45', label: 'Migdiada 1', type: 'nap' },
    { time: '14:00', label: 'Migdiada 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 10 mesos',
      content:
        'Els deu mesos són una edat d\'independència florent. El teu nadó probablement camina agafat als mobles, explora tot a nivell del terra i comença a comunicar-se amb intenció — assenyalant, balbucejant amb entonació i de vegades fent gestos si els has introduït. Aquesta explosió cognitiva va acompanyada d\'una creixent autodeterminació que pot manifestar-se a l\'hora de dormir com a rebuig de migdiades o protestes al ficar-se al llit.\n\nL\'estructura de 2 migdiades continua funcionant bé per a la majoria dels nadons de 10 mesos, tot i que pots començar a veure resistència ocasional a una migdiada o l\'altra. Això no vol dir necessàriament que el teu nadó estigui preparat per passar a 1 migdiada — la majoria dels nens no fan aquest canvi fins als 14–18 mesos. El que sol significar és que una finestra de vetlla necessita un petit ajust, o que una activitat en el període de relaxació és massa estimulant.\n\nEl son nocturn sol ser bo aquest mes. Molts nadons de 10 mesos dormen 11–12 hores sense necessitar alimentació, tot i que alguns encara es beneficien d\'una alimentació nocturna. Segueix els senyals del teu nadó i consulta el teu pediatra si no estàs segur sobre l\'alimentació nocturna a aquesta edat.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Les finestres de vetlla als 10 mesos són d\'aproximadament 2.75–3.5 hores. La finestra entre el despertar matinal i la primera migdiada és típicament d\'unes 2.75–3 hores, mentre que la finestra de la tarda abans de dormir es pot estirar a 3.5 hores per a alguns nadons.\n\nEl buit entre les dues migdiades ara és força llarg — sovint més de 4 hores de temps despert. Joc estructurat i estimulant i temps a l\'aire lliure adequat durant aquest tram ajuden a evitar que l\'excés de cansament s\'acumuli massa ràpid. Si el teu nadó sembla tenir dificultats amb la llarga finestra de mig matí, comprova que les finestres de vetlla no s\'estiguin estirant més enllà del que el teu nadó individual pot gestionar.',
    },
  ],
  tips: [
    {
      title: 'No confonguis independència amb necessitat de dormir',
      description:
        'Un nadó de 10 mesos que protesta a l\'hora de la migdiada sovint comunica "vull seguir jugant" en lloc de "no estic cansat." Confia en els temps de la finestra de vetlla — si han passat 3 hores, el cervell del teu nadó està preparat per dormir encara que et digui el contrari.',
    },
    {
      title: 'Ofereix opcions previsibles en la rutina',
      description:
        'Donar al teu nadó petites opcions — "vols la manta d\'estrelles o la de la lluna?" — satisfà la seva creixent necessitat d\'autonomia sense soscavar l\'estructura del son. També fa la rutina més atractiva i menys conflictiva.',
    },
    {
      title: 'Fes servir soroll blanc de forma consistent',
      description:
        'Als 10 mesos, el teu nadó és més conscient del soroll de casa i es despertarà més fàcilment en les fases lleugeres del son. Soroll blanc constant durant migdiades i nits ajuda a emmascarar els sons ambientals que d\'altra manera provocarien despertars innecessaris.',
    },
    {
      title: 'Planifica una estona a l\'aire lliure en la llarga finestra de mig matí',
      description:
        'La llum natural i el moviment físic durant la llarga finestra de vetlla entre migdiades dona suport al desenvolupament del ritme circadiari i ajuda el teu nadó a aconseguir una pressió de son de qualitat per a la segona migdiada.',
    },
  ],
};

// ── 11 Months ───────────────────────────────────────────────────────────────

const MONTH_11_CA: SleepGuideConfig = {
  slug: '11-month-old',
  ageMonths: 11,
  displayLabel: '11 m',
  ageLabel: 'nadó d\'11 mesos',
  title: 'Horari de son d\'11 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó d\'11 mesos',
  metaDescription:
    'Horari complet del son als 11 mesos: 2 migdiades, finestres de vetlla de 2.75–3.5h, guia d\'hora de dormir i com gestionar les batalles de migdiades quan el teu nadó s\'acosta al primer aniversari.',
  stats: {
    napsPerDay: '2',
    wakeWindow: '2.75–3.5h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '2.5–3h',
    totalSleep: '13.5–15h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '09:45', label: 'Migdiada 1', type: 'nap' },
    { time: '14:00', label: 'Migdiada 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 11 mesos',
      content:
        'Als 11 mesos, estàs en la recta final del primer any del teu nadó, i es nota en els seus patrons de son. El teu nadó probablement es manté dret amb confiança, possiblement camina, i demostra un sentit molt clar del que vol — inclosa l\'hora de dormir. Les protestes davant les migdiades poden ser més vocals i persistents ara, no perquè el teu nadó necessiti menys son, sinó perquè la seva capacitat d\'expressar preferències ha crescut juntament amb la seva consciència del món.\n\nLa majoria dels nadons d\'11 mesos encara necessiten 2 migdiades. Tot i la resistència ocasional, la biologia és clara: passar a 1 migdiada abans dels 14–15 mesos sol portar a un excés de cansament crònic, que es manifesta com a despertars matiners, despertars nocturns i un nadó que sembla nerviós en lloc de cansat. Mantén les 2 migdiades i confia en les dades, fins i tot quan les batalles semblin convincents.\n\nEl llenguatge comença a emergir aquest mes — molts nadons diuen les seves primeres paraules cap als 11–12 mesos. L\'activitat cerebral implicada en l\'adquisició del llenguatge és considerable, i alguns nadons mostren patrons de son més inquiets o lleugers durant aquests brots. És una alteració temporal lligada a un enorme avenç del desenvolupament.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Les finestres de vetlla als 11 mesos són similars al rang dels 10 mesos: 2.75–3.5 hores. Sou al mateix tram de desenvolupament, però el teu nadó pot estar acostant-se a l\'extrem més llarg de cada finestra de manera més consistent a mesura que s\'aproxima als 12 mesos.\n\nSi notes resistència a la migdiada en un moment consistent cada dia, comprova si la finestra de vetlla prèvia s\'ha quedat massa curta. Un nadó que abans s\'adormia a les 2.5 hores però que ara pot estar despert 3 hores còmodament protestarà — no perquè estigui deixant la migdiada, sinó perquè encara no hi ha prou pressió de son. Estén la finestra 15 minuts i observa si l\'adormiment millora.',
    },
  ],
  tips: [
    {
      title: 'No interpretis les protestes com a senyal de deixar una migdiada',
      description:
        'La resistència vocal a les migdiades als 11 mesos gairebé sempre es tracta de voler seguir en l\'acció, no de manca genuïna de cansament. La persistència calmada i consistent amb la rutina de migdiada guanya amb el temps — el teu nadó necessita el son fins i tot quan insisteix que no.',
    },
    {
      title: 'Limita la migdiada 1 per protegir la migdiada 2',
      description:
        'Si la primera migdiada és massa llarga (més d\'1.5 hores), pot ser que el teu nadó no acumuli prou pressió de son per a la segona migdiada. Limita suaument la migdiada del matí a 1–1.5 hores per mantenir accessible la migdiada de la tarda.',
    },
    {
      title: 'Inclou un temps de transició abans del bressol',
      description:
        'Un nadó d\'11 mesos que ha estat jugant activament necessita temps per relaxar-se neurològicament. Una rutina de pre-migdiada de 10 minuts — enfosquir l\'habitació, alentir l\'activitat, cantar una cançó consistent — dóna al cervell temps per canviar de marxa abans del bressol.',
    },
    {
      title: 'Celebra les fites encara que alterin el son',
      description:
        'Primeres paraules, primers passos, nova consciència social — aquests salts alteren temporalment el son i això és una característica, no un error. El teu nadó està exactament on hauria d\'estar. El son es reestabilitzarà en una o dues setmanes després del pic de cada fita.',
    },
  ],
};

// ── 12 Months ───────────────────────────────────────────────────────────────

const MONTH_12_CA: SleepGuideConfig = {
  slug: '12-month-old',
  ageMonths: 12,
  displayLabel: '12 m',
  ageLabel: 'nadó de 12 mesos',
  title: 'Horari de son de 12 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 12 mesos',
  metaDescription:
    'Guia completa del son als 12 mesos: 2 migdiades, finestres de vetlla de 3–4h, hora de dormir 18:00–19:30, la regressió dels 12 mesos i quan considerar la transició a 1 migdiada.',
  stats: {
    napsPerDay: '2',
    wakeWindow: '3–4h',
    bedtime: '18:00–19:30',
    nightSleep: '11–12h',
    totalDaySleep: '2.5–3h',
    totalSleep: '13.5–15h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '10:00', label: 'Migdiada 1', type: 'nap' },
    { time: '14:30', label: 'Migdiada 2', type: 'nap' },
    { time: '19:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 12 mesos',
      content:
        'Feliç primer aniversari. El fet que hagis estat acompanyant i donant suport al son del teu nadó durant tot un any diu molt del teu compromís amb el seu benestar. Als 12 mesos, la majoria dels nadons caminen o estan a punt de fer-ho, diuen un grapat de paraules i mostren trets de personalitat ben definits. És una edat plena, activa i emocionant — i ve amb els seus propis reptes de son.\n\nLa regressió dels 12 mesos és real, i impulsada per la mateixa força que la majoria de regressions: un brot de desenvolupament neurològic. Caminar requereix una coordinació, equilibri i processament espacial extraordinaris que el cervell està construint activament fins i tot durant el son. Alguns nadons rebutgen temporalment una o ambdues migdiades, i els despertars nocturns poden reaparèixer després de llargs trams de son consolidat. És temporal — normalment 2–4 setmanes — i passa.\n\nTot i la regressió, els nadons de 12 mesos encara necessiten 2 migdiades. L\'error més comú a aquesta edat és passar a 1 migdiada massa aviat perquè l\'horari de 2 migdiades sembla una batalla. La majoria dels nadons no estan neurològicament preparats per a 1 migdiada fins als 14–18 mesos. Eliminar prematurament la migdiada del matí sol portar a un excés de cansament que és molt més difícil de gestionar que un període difícil de transició de migdiades.',
    },
    {
      heading: 'Entendre les finestres de vetlla',
      content:
        'Als 12 mesos, les finestres de vetlla han crescut a 3–4 hores. La primera finestra del dia és típicament d\'unes 3 hores, mentre que l\'última finestra abans de dormir es pot estirar a 4 hores per a un nadó que ha dormit bé les migdiades. Això vol dir que el dia té més marge natural de respir, i potser les migdiades es senten més previsibles que en mesos anteriors.\n\nAmb finestres més llargues ve més risc d\'excés de cansament genuí si calcules malament els temps. Un nadó de 12 mesos que es perd una migdiada o en té una molt curta pot acumular deute de son significatiu ràpidament. Aquells dies, una hora de dormir més aviat — fins i tot 30–60 minuts abans del normal — és la teva millor eina de recuperació. No existeix algo "massa aviat" per a una hora de dormir quan el teu nadó està massa cansat.',
    },
  ],
  tips: [
    {
      title: 'Fes servir una hora de dormir més aviat com a eina de recuperació',
      description:
        'Quan una migdiada surt malament — rebutjada, tallada o endarrerida — compensa amb una hora de dormir 30–60 minuts abans del normal. Això evita que l\'excés de cansament s\'acumuli al llarg de diversos dies i protegeix el son de la resta de la setmana.',
    },
    {
      title: 'Mantén les 2 migdiades fins i tot durant la regressió',
      description:
        'El rebuig de migdiades durant la regressió dels 12 mesos és una fase, no un senyal de desenvolupament per eliminar una migdiada. Mantén la consistència amb l\'estructura de 2 migdiades, fes servir migdiades en braços o al cotxet els dies difícils, i l\'horari regular es reestablirà sol.',
    },
    {
      title: 'Reconeix la seva nova independència en la rutina',
      description:
        'Un nadó de 12 mesos pot participar en la rutina de dormir de maneres petites — posar-se el xumet, passar-te el sac de dormir, triar un conte. Aquesta participació redueix la resistència a dormir donant al teu nadó sensació de control en el procés.',
    },
    {
      title: 'Tingues en compte que les celebracions del primer aniversari poden alterar el son',
      description:
        'Festes, visites i estimulació emocionant al voltant del primer aniversari poden desajustar migdiades i hora de dormir durant un o dos dies. Planifica-ho, protegeix la migdiada després de la festa i espera que tot es normalitzi en 48 hores.',
    },
  ],
  regression: {
    name: 'Regressió del son dels 12 mesos',
    description:
      'Cap als 12 mesos, caminar i el desenvolupament del llenguatge poden alterar els patrons de son. Alguns nadons rebutgen temporalment la segona migdiada, però la majoria encara necessiten 2 migdiades durant uns mesos més. Aquesta regressió sol durar 2–4 setmanes.',
  },
};

// ── 13 Months ───────────────────────────────────────────────────────────────

const MONTH_13_CA: SleepGuideConfig = {
  slug: '13-month-old',
  ageMonths: 13,
  displayLabel: '13 m',
  ageLabel: 'nadó de 13 mesos',
  title: 'Horari de son de 13 mesos',
  subtitle: 'Finestres de vetlla, migdiades i hora de dormir per al teu nadó de 13 mesos',
  metaDescription:
    'Guia completa del son als 13 mesos: 2 migdiades, finestres de vetlla de 3.25–4h, hora de dormir cap a les 19:15 i consells per gestionar la resistència primerenca a les migdiades.',
  stats: {
    napsPerDay: '2',
    wakeWindow: '3.25–4h',
    bedtime: '~19:15',
    nightSleep: '11–12h',
    totalDaySleep: '2–3h',
    totalSleep: '13.25h',
  },
  sampleSchedule: [
    { time: '06:30', label: 'Despertar', type: 'wake' },
    { time: '09:45', label: 'Migdiada 1 (60–90 min)', type: 'nap' },
    { time: '14:15', label: 'Migdiada 2 (60–90 min)', type: 'nap' },
    { time: '19:15', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 13 mesos',
      content:
        'Els tretze mesos són una edat d\'assentament. Les grans fites del primer aniversari han passat, i el teu petit està consolidant la seva manera de caminar, ampliant el seu vocabulari i mostrant un sentit creixent d\'ell mateix. El son a aquesta edat sol ser estable — la majoria dels nadons de 13 mesos estan fermament en un horari de 2 migdiades i dormen al voltant de 13.25 hores en total.\n\nPot ser que comencis a veure resistència ocasional a les migdiades, especialment a la migdiada del matí. Això sol ser el teu petit provant la seva independència en expansió, no un senyal genuí que estigui preparat per passar a 1 migdiada. La majoria dels nens no estan preparats per a aquesta transició fins als 14–18 mesos, així que mantén les 2 migdiades i ajusta les finestres de vetlla si adormir-se es torna més difícil.\n\nLes finestres de vetlla han crescut a 3.25–4 hores, amb la finestra del matí típicament una mica més curta (3.25–3.5 hores) i la finestra abans de dormir estirant-se fins a unes 4 hores. Aquesta finestra més llarga de la tarda vol dir que el teu petit necessita activitat estimulant per estar content — joc a l\'aire lliure, joc amb aigua i exploració física ajuden a omplir el temps sense crear excés de cansament.',
    },
    {
      heading: 'Ajustar l\'horari',
      content:
        'Als 13 mesos, els petits ajustaments marquen una gran diferència. Si el teu petit tarda molt a adormir-se a la migdiada 1, prova a estendre la finestra de vetlla del matí 15 minuts. Si la migdiada 2 es rebutja, comprova si la migdiada 1 va ser massa llarga — limitar-la a 90 minuts sol protegir la migdiada de la tarda.\n\nL\'horari del sopar també comença a importar ara. Un àpat massa a prop de l\'hora de dormir pot causar molèsties, mentre que sopar massa d\'hora vol dir que el teu petit té gana a l\'hora d\'anar al llit. Apunta a sopar uns 1–1.5 hores abans de l\'hora de dormir, amb una petita alimentació de llet més a prop de l\'inici de la rutina de dormir.',
    },
  ],
  tips: [
    {
      title: 'Allarga les finestres de vetlla gradualment',
      description:
        'Si el teu petit es resisteix a una migdiada, no l\'eliminis — prova a endarrerir-la 15–30 minuts. Un petit ajust a la finestra de vetlla sovint resol el problema d\'adormiment sense eliminar una migdiada prematurament.',
    },
    {
      title: 'Organitza el sopar amb criteri',
      description:
        'Un sopar substanciós 1–1.5 hores abans de dormir, seguit d\'una petita alimentació de llet a la rutina, prevé tant els despertars per gana com la incomoditat al dormir per un estómac massa ple.',
    },
    {
      title: 'Mantén la rutina de dormir curta i previsible',
      description:
        'Als 13 mesos, una rutina de 15–20 minuts és ideal: sopar, bany (o rentat), pijama, conte, llet, cançó, llit. La memòria creixent del teu petit fa que la previsibilitat en si mateixa sigui reconfortant.',
    },
    {
      title: 'Resisteix la temptació de passar a 1 migdiada massa aviat',
      description:
        'La majoria dels nadons de 13 mesos encara necessiten 2 migdiades. Passar a 1 migdiada abans d\'hora sol causar excés de cansament, despertars matiners i pitjor son nocturn. Espera a veure senyals consistents durant més de 2 setmanes abans de fer la transició.',
    },
  ],
};

// ── 18 Months ───────────────────────────────────────────────────────────────

const MONTH_18_CA: SleepGuideConfig = {
  slug: '18-month-old',
  ageMonths: 18,
  displayLabel: '18 m',
  ageLabel: 'nadó de 18 mesos',
  title: 'Horari de son de 18 mesos',
  subtitle: 'Finestres de vetlla, la transició a 1 migdiada i la regressió dels 18 mesos',
  metaDescription:
    'Navega l\'horari de son als 18 mesos: 1 migdiada al migdia, finestres de vetlla de 5–5.75h, hora de dormir 18:00–20:00 i com gestionar la regressió dels 18 mesos amb calma i confiança.',
  stats: {
    napsPerDay: '1',
    wakeWindow: '5–5.75h',
    bedtime: '18:00–20:00',
    nightSleep: '11+ hores',
    totalDaySleep: '2–3h',
    totalSleep: '13–14h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '12:00', label: 'Migdiada (2–2.5h)', type: 'nap' },
    { time: '20:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 18 mesos',
      content:
        'Els divuit mesos són un gran punt de transició. Si el teu petit encara no ha passat a 1 migdiada, això és típicament quan passa. La migdiada única cau a la meitat del dia — normalment cap al migdia — i dura de 2 a 3 hores. Les finestres de vetlla s\'han estirat a 5 hores abans de la migdiada i 5–5.75 hores abans de dormir, la qual cosa és una quantitat significativa de temps despert per a una persona tan petita.\n\nL\'horari d\'1 migdiada té una simplicitat preciosa. Els matins queden lliures, la migdiada és llarga i reparadora, i el tram de la tarda fins a l\'hora de dormir, tot i ser llarg, és gestionable amb activitats entretingudes i temps a l\'aire lliure. Molts pares descobreixen que la transició a 1 migdiada, un cop s\'assenta, en realitat facilita la planificació del dia.\n\nL\'hora de dormir als 18 mesos sol caure entre les 18:00 i les 20:00, depenent de quan acabi la migdiada i la rutina de la teva família. Els dies que la migdiada és més curta o es salta per complet (passa), una hora de dormir més aviat és la teva millor aliada. Avançar l\'hora de dormir 30–60 minuts en un dia de migdiada difícil prevé la cascada de cansament excessiu que porta a despertars nocturns.',
    },
    {
      heading: 'La regressió del son dels 18 mesos',
      content:
        'La regressió dels 18 mesos és una de les més desafiants, perquè el teu petit ara té la voluntat i les paraules per lluitar contra el son més activament. Pots veure rebuig de migdiades, plor a l\'hora de dormir, més despertars nocturns i de vegades despertars matiners. Els factors habituals són un brot d\'independència, ansietat de separació, dentició (els queixals sovint surten per aquestes dates) i una explosió en el desenvolupament del llenguatge.\n\nLa millor resposta són límits consistents i empàtics. El teu petit necessita saber que l\'hora de dormir no és negociable, però també necessita sentir-se segur i connectat. Mantén la rutina exactament igual, ofereix una breu reconfortació si està disgustat, i evita introduir noves crosses de son només per passar aquesta fase. Aquesta regressió sol durar 2–6 setmanes i es resol sola quan el brot de desenvolupament es calma.',
    },
  ],
  tips: [
    {
      title: 'Protegeix la migdiada amb fermesa',
      description:
        'Als 18 mesos, el teu petit pot insistir que no necessita migdiada. Sí que la necessita. El rebuig de migdiada a aquesta edat gairebé sempre és qüestió d\'independència, no de manca genuïna de cansament. Segueix oferint la migdiada de manera consistent i tranquil·la.',
    },
    {
      title: 'Fes servir una hora de dormir més aviat com a xarxa de seguretat',
      description:
        'Els dies que la migdiada és curta o es salta, avança l\'hora de dormir 30–60 minuts. Un nadó de 18 mesos massa cansat a l\'hora de dormir és més difícil de calmar i més propens a despertar-se durant la nit.',
    },
    {
      title: 'Incorpora la connexió a la rutina, no després',
      description:
        'L\'ansietat de separació arriba al pic cap als 18 mesos. Abraçades extra, una cançó especial o una breu xerrada sobre el dia — fes-ho durant la rutina, no com a tàctica de demora després d\'apagar el llum.',
    },
  ],
  regression: {
    name: 'Regressió del son dels 18 mesos',
    description:
      'Cap als 18 mesos, un brot d\'independència, desenvolupament del llenguatge, ansietat de separació i dentició poden alterar el son. El teu petit pot lluitar contra les migdiades, plorar a l\'hora de dormir o despertar-se més a la nit. Aquesta fase sol durar 2–6 setmanes.',
  },
};

// ── 2 Years ─────────────────────────────────────────────────────────────────

const YEAR_2_CA: SleepGuideConfig = {
  slug: '2-year-old',
  ageMonths: 24,
  displayLabel: '2 anys',
  ageLabel: 'nen de 2 anys',
  title: 'Horari de son de 2 anys',
  subtitle: 'Migdiada, hora de dormir i la regressió dels 2 anys',
  metaDescription:
    'La teva guia completa del son als 2 anys: 1 migdiada al migdia (1.5–2h), finestres de vetlla de 5.5–6h, hora de dormir 19:00–21:00 i com navegar la regressió dels 2 anys.',
  stats: {
    napsPerDay: '1',
    wakeWindow: '5.5–6h',
    bedtime: '19:00–21:00',
    nightSleep: '10–12h',
    totalDaySleep: '1.5–2h',
    totalSleep: '12+ hores',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '12:30', label: 'Migdiada (1.5–2h)', type: 'nap' },
    { time: '20:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Què esperar als 2 anys',
      content:
        'Dos anys. El teu nadó és ara un petit amb opinions, frases i una notable capacitat per negociar a l\'hora de dormir. El son a aquesta edat sol sumar 12 o més hores en un període de 24 hores, repartides entre una migdiada d\'1.5–2 hores al migdia i 10–12 hores de son nocturn.\n\nLa resistència a la migdiada és habitual als 2 anys, i pot semblar molt convincent — el teu petit pot semblar genuïnament que no necessita la migdiada. Però la majoria dels nens no estan preparats per eliminar-la del tot fins als 3 anys o més tard. El que sembla "no tinc son" sovint és "estic massa estimulat per calmar-me" o "estic exercint la meva independència." La consistència és la teva eina més potent aquí. Segueix oferint la migdiada a la mateixa hora cada dia, en un entorn tranquil i fosc, i la majoria dels nens de 2 anys continuaran dormint la migdiada.\n\nLes finestres de vetlla s\'han estirat a 5.5–6 hores, donant-te matins i tardes llargues i plenes. L\'hora de dormir cau entre les 19:00 i les 21:00 depenent de quan acabi la migdiada. El ritme diari als 2 és relativament simple i previsible — la qual cosa és un regal després del caos de la infància.',
    },
    {
      heading: 'La regressió del son dels 2 anys',
      content:
        'La regressió dels 2 anys s\'alimenta de les mateixes forces que fan que aquesta edat sigui tan emocionant: llenguatge explosiu, independència creixent, pors nous (la foscor, els monstres, estar sol) i grans fites com començar a deixar el bolquer. El teu petit pot endarrerir l\'hora de dormir, cridar-te repetidament després d\'apagar el llum, rebutjar la migdiada o començar a despertar-se a la nit després de mesos dormint d\'un tram.\n\nLa clau són límits embolcallats de calidesa. Reconeix els sentiments del teu petit — "sé que vols quedar-te despert, i és hora de dormir" — i mantén la posició amb calma. Evita introduir hàbits nous que després hauràs de desfer (estirar-te amb ell fins que s\'adormi, portar-lo al teu llit si no és el teu pla). Aquesta regressió sol durar 2–4 setmanes i passa quan l\'onada de desenvolupament es calma.',
    },
  ],
  tips: [
    {
      title: 'No eliminis la migdiada encara',
      description:
        'La majoria dels nens de 2 anys encara necessiten migdiada, fins i tot quan s\'hi resisteixen. Eliminar la migdiada massa aviat sovint causa excés de cansament, pitjor son nocturn i més reptes de comportament durant el dia. Segueix oferint-la de manera consistent.',
    },
    {
      title: 'Fes servir normes clares i senzilles a l\'hora de dormir',
      description:
        'Als 2 anys, el teu petit entén les normes. "Un conte més i apaguem el llum" o "després de la nostra cançó, és hora de dormir." Límits senzills i previsibles redueixen les negociacions a l\'hora de dormir i ajuden el teu petit a sentir-se segur.',
    },
    {
      title: 'Aborda les pors noves amb empatia, no les desestimis',
      description:
        'Si el teu petit està desenvolupant por a la foscor o als monstres, pren-ho seriosament. Un llum de nit suau, un ritual d\'"esprai antimonstres" o un peluix especial poden proporcionar consol genuí sense soscavar la independència del son.',
    },
    {
      title: 'La consistència durant la regressió ho és tot',
      description:
        'La regressió dels 2 anys posa a prova la teva determinació. Mantén la rutina igual, respon breument i amb calma als despertars nocturns, i confia que la fase passarà. La teva calma consistent és el més reconfortant que el teu petit pot experimentar.',
    },
  ],
  regression: {
    name: 'Regressió del son dels 2 anys',
    description:
      'Cap als 2 anys, la independència creixent, les pors noves, el desenvolupament del llenguatge i fites com deixar el bolquer poden alterar el son. Endarrerir l\'hora de dormir, rebutjar la migdiada i els despertars nocturns són habituals. Aquesta fase sol durar 2–4 setmanes.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

const translationMap: Record<string, SleepGuideConfig> = {
  'week-1': WEEK_1_CA,
  'week-2': WEEK_2_CA,
  '1-month-old': MONTH_1_CA,
  '2-month-old': MONTH_2_CA,
  '3-month-old': MONTH_3_CA,
  '4-month-old': MONTH_4_CA,
  '5-month-old': MONTH_5_CA,
  '6-month-old': MONTH_6_CA,
  '7-month-old': MONTH_7_CA,
  '8-month-old': MONTH_8_CA,
  '9-month-old': MONTH_9_CA,
  '10-month-old': MONTH_10_CA,
  '11-month-old': MONTH_11_CA,
  '12-month-old': MONTH_12_CA,
  '13-month-old': MONTH_13_CA,
  '18-month-old': MONTH_18_CA,
  '2-year-old': YEAR_2_CA,
};

export const SLEEP_GUIDE_CONFIGS: SleepGuideConfig[] = SLEEP_GUIDE_CONFIGS_EN.map((cfg) => {
  return translationMap[cfg.slug] ?? cfg;
});
