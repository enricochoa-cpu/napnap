import { SLEEP_GUIDE_CONFIGS as SLEEP_GUIDE_CONFIGS_EN, type SleepGuideConfig } from './sleepGuideContent';

const WEEK_1_ES: SleepGuideConfig = {
  slug: 'week-1',
  ageMonths: 0,
  displayLabel: 'Sem 1',
  ageLabel: 'bebé de 1 semana',
  title: 'Guía del sueño del bebé — Semana 1',
  subtitle: 'Qué esperar en la primera semana de sueño de tu bebé',
  metaDescription:
    'Una guía suave para la primera semana de sueño de tu recién nacido. Descubre los patrones de sueño típicos, lo básico del sueño seguro y por qué los horarios impredecibles son totalmente normales.',
  stats: {
    napsPerDay: 'Varía',
    wakeWindow: '30–90 min',
    bedtime: 'Sin hora fija para dormir',
    nightSleep: '9–12h (con despertares)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5–17h',
  },
  sampleSchedule: [
    { time: '—', label: 'Despertar, toma y breve momento de alerta', type: 'wake' },
    { time: '—', label: 'Sueño (tramos de 30 min a 2h)', type: 'nap' },
    { time: '—', label: 'Toma, sueño y repetir durante el día', type: 'nap' },
    { time: '—', label: 'Tramo más largo a menudo 2–4h durante la noche', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar en la primera semana',
      content:
        'Bienvenido a la primera semana. Todo es nuevo: para tu bebé y para ti. Ahora, tu recién nacido no sabe la diferencia entre el día y la noche. Duerme en ráfagas cortas de 30 minutos a 2 horas, se despierta para alimentarse y vuelve a dormirse. No hay un horario, y no debería haberlo. Así es exactamente como duerme un recién nacido sano.\n\nTu bebé necesita entre 15.5 y 17 horas de sueño en un periodo de 24 horas, pero le llega en fragmentos impredecibles. Algunos tramos serán de 20 minutos; otros podrían durar 3 horas. Ambas cosas son normales. El bloque más largo de sueño suele ser solo de 2–4 horas, y puede ocurrir durante el día en vez de por la noche. Eso cambiará en las próximas semanas, pero ahora tu única tarea es seguir el ritmo de tu bebé.\n\nSi se siente caótico, es porque lo es, y está bien. En esta etapa no hay nada que "arreglar". Tu bebé se está adaptando a la vida fuera del útero, y lo más útil que puedes hacer es responder a sus señales, mantenerlo alimentado y descansar cuando puedas.',
    },
    {
      heading: 'Señales de sueño a tener en cuenta',
      content:
        'Incluso con una semana de vida, tu bebé da señales cuando está listo para dormir. Las señales clásicas son bostezar, mirar fijamente a lo lejos, quedarse muy quieto y ponerse de mal humor sin que sea por hambre. Estas señales llegan rápido: un recién nacido puede pasar de estar alerta a estar demasiado cansado en minutos, no en las ventanas más largas que verás en bebés mayores.\n\nLas ventanas de vigilia a esta edad son increíblemente cortas: de 30 a 90 minutos, y a menudo se acercan más al extremo corto. Después de una toma y unos minutos de estar tranquilo y alerta, es probable que tu bebé esté listo para volver a dormir. No te preocupes por "mantenerlos despiertos" para consolidar el sueño más tarde: ese enfoque no funciona con recién nacidos y puede llevar a un bebé demasiado cansado, más difícil de calmar.',
    },
  ],
  tips: [
    {
      title: 'Coloca siempre al bebé boca arriba para dormir',
      description:
        'Dormir boca arriba es la posición más segura para cada sueño, de día y de noche. Un colchón firme y plano, sin sábanas sueltas, almohadas ni juguetes es el estándar de oro para un sueño seguro.',
    },
    {
      title: 'Sigue las señales de tu bebé, no el reloj',
      description:
        'No hay un horario que seguir esta semana. Alimenta a demanda, deja que tu bebé duerma cuando esté cansado y confía en que la imprevisibilidad es temporal y totalmente normal.',
    },
    {
      title: 'El arropado puede ayudar con el reflejo de sobresalto',
      description:
        'Muchos recién nacidos se calman con más facilidad cuando están bien arropados, con los brazos dentro. Asegúrate de que el arropado esté firme alrededor del pecho pero suelto en las caderas para permitir un desarrollo saludable de la articulación de la cadera.',
    },
  ],
};

const WEEK_2_ES: SleepGuideConfig = {
  slug: 'week-2',
  ageMonths: 0,
  displayLabel: 'Sem 2',
  ageLabel: 'bebé de 2 semanas',
  title: 'Guía del sueño del bebé — Semana 2',
  subtitle: 'Patrones de sueño y consejos para tu bebé de 2 semanas',
  metaDescription:
    '¿Cómo es el sueño a las 2 semanas? Descubre los patrones típicos de sueño de recién nacido, las ventanas de vigilia de 30–90 minutos y consejos prácticos para sobrevivir a los primeros días.',
  stats: {
    napsPerDay: 'Varía',
    wakeWindow: '30–90 min',
    bedtime: 'Sin hora fija para dormir',
    nightSleep: '9–12h (con despertares)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5–17h',
  },
  sampleSchedule: [
    { time: '—', label: 'Despertar y alimentarse', type: 'wake' },
    { time: '—', label: 'Periodo breve de alerta (10–30 min)', type: 'nap' },
    { time: '—', label: 'Sueño (tramos de 45 min a 2h)', type: 'nap' },
    { time: '—', label: 'Los ciclos alimentación-sueño continúan durante la noche', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a las 2 semanas',
      content:
        'Dos semanas después, empiezas a sentirte un poco más firme — aunque no parezca así. Tu bebé sigue durmiendo alrededor de 15.5 a 17 horas al día, en tramos cortos e irregulares. La confusión día-noche ahora es muy real: tu bebé puede tener el tramo de sueño más largo durante el día y estar con los ojos bien abiertos a las 2 AM. Esto es normal y se resuelve de forma natural alrededor de los 3–4 meses, cuando el ritmo circadiano se va desarrollando.\n\nEs posible que notes periodos de alerta un poco más largos esta semana en comparación con la semana 1: tu bebé puede permanecer despierto 20–40 minutos seguidos, mirándote a la cara o respondiendo a tu voz. Estos momentos de conexión son valiosos, pero también cansan a tu bebé. Las ventanas de vigilia siguen siendo muy cortas: entre 30 y 90 minutos, incluyendo la toma, y las ventanas más cortas suelen darse por la mañana.\n\nAlimentarse a demanda sigue siendo lo más importante. Las tomas nocturnas son frecuentes y necesarias: el estómago de tu bebé es pequeñito y necesita comer cada 2–3 horas, todo el día y toda la noche. Cada toma apoya su crecimiento y ayuda a establecer tu producción de leche si estás dando el pecho.',
    },
    {
      heading: 'Crear la base para la conciencia día-noche',
      content:
        'Aunque un horario verdadero quede aún a meses, puedes empezar con suavidad a ayudar al cerebro de tu bebé a aprender la diferencia entre el día y la noche. Durante las tomas y los periodos de alerta del día, mantén el entorno luminoso y con un nivel normal de ruido — no camines de puntillas. Abre las cortinas, sigue con tu rutina y deja que los sonidos de casa formen parte del ambiente.\n\nDe noche, haz lo contrario. Mantén las tomas con luz tenue, en calma y con tono "de trabajo": poca luz, estimulación mínima, sin juegos. No estás entrenando a tu bebé; simplemente estás ofreciendo señales ambientales que el cerebro, que se está desarrollando, irá captando poco a poco. Este contraste suave entre día y noche es una de las cosas más útiles que puedes hacer en estas primeras semanas.',
    },
  ],
  tips: [
    {
      title: 'Días luminosos, noches oscuras',
      description:
        'Expón a tu bebé a la luz natural del día durante los periodos de vigilia y mantén las interacciones de noche con luz tenue y calma. Este contraste simple ayuda a que el ritmo circadiano empiece a desarrollarse.',
    },
    {
      title: 'Alimentación a demanda — no mires el reloj',
      description:
        'Tu bebé sabe cuándo tiene hambre. Alimentar a demanda ayuda a ganar un peso sano y a establecer patrones de alimentación de manera natural. Las tomas nocturnas son esenciales y se esperan.',
    },
    {
      title: 'Acepta ayuda y descansa cuando el bebé duerme',
      description:
        'La recomendación de "dormir cuando el bebé duerme" suena sencilla, pero ahora importa muchísimo. Tu recuperación es importante. Acepta cada oferta de ayuda y protege tu propio descanso.',
    },
    {
      title: 'Un entorno de sueño seguro para cada sueño',
      description:
        'Tanto si es una siesta de 20 minutos como un tramo de 3 horas, usa siempre una superficie firme y plana. Sin cojines, sin cunas inclinadas, y no durmiendo en sofás o sillones — incluso cuando estés agotado/a.',
    },
  ],
};

const MONTH_1_ES: SleepGuideConfig = {
  slug: '1-month-old',
  ageMonths: 1,
  displayLabel: '1 mes',
  ageLabel: 'bebé de 1 mes',
  title: 'Horario de sueño de 1 mes',
  subtitle: 'Patrones de sueño, ventanas de vigilia y consejos para tu bebé de 1 mes',
  metaDescription:
    'Descubre cómo es el sueño al primer mes: 15.5 horas totales, ventanas de vigilia de 30–90 min y por qué las siestas impredecibles son completamente normales. Consejos prácticos para familias recientes.',
  stats: {
    napsPerDay: 'Varía',
    wakeWindow: '30–90 min',
    bedtime: 'A menudo 22:00 o más tarde',
    nightSleep: '9–12h (con despertares)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar y alimentación', type: 'wake' },
    { time: '08:00', label: 'Siesta (duración variable)', type: 'nap' },
    { time: '10:00', label: 'Toma, tiempo de alerta, siesta', type: 'nap' },
    { time: '12:30', label: 'El ciclo comer-despertar-dormir continúa', type: 'nap' },
    { time: '22:00', label: '"Hora de dormir" tardía', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar al primer mes',
      content:
        'Al cumplir un mes, ya has pasado el impacto inicial de las dos primeras semanas, pero el panorama del sueño no cambia de forma drástica. Tu bebé sigue necesitando alrededor de 15.5 horas de sueño entre día y noche, y las siestas continúan siendo muy impredecibles: algunos días tendrás varios tramos largos y otros parecerá que solo duerme siestas de 20 minutos. Ambos patrones entran dentro de lo normal.\n\nA esta edad, la hora de dormir suele ser tardía — a menudo sobre las 22:00 o más tarde — y está bien. El ritmo circadiano de tu bebé todavía se está desarrollando, y adelantar artificialmente la hora de dormir aún no suele funcionar. Esa hora tardía se irá moviendo antes de forma gradual durante los próximos dos meses. Por ahora, usa el ritmo "comer, jugar, dormir" como guía flexible, no como horario rígido.\n\nPuede que empieces a notar un tramo algo más largo de sueño nocturno — quizá de 3–4 horas — y eso es una señal temprana estupenda de consolidación. Disfrútalo cuando aparezca, pero no esperes que pase cada noche. La consistencia todavía tardará unas semanas, y eso también es completamente normal.',
    },
    {
      heading: 'El ritmo de "comer, jugar, dormir"',
      content:
        'Alrededor del primer mes, a muchas familias les ayuda seguir un ciclo suave de "comer, jugar, dormir". Alimenta a tu bebé al despertar, disfruta de un rato corto de interacción en alerta (aunque solo sea mirarse o hablarle con calma) y después ayúdale a volver a dormirse cuando veas señales de sueño. La parte de "jugar" a esta edad es muy breve: a veces solo 10–15 minutos de calma y atención.\n\nNo es un horario — es un ritmo. Algunos ciclos durarán 1.5 horas, otros 2.5 horas. Habrá días con patrón claro y otros que parecerán sin forma. Todo eso es normal. El valor de este ritmo es dar una estructura suave al día sin la presión de objetivos de reloj que simplemente no aplican a un bebé de 1 mes.',
    },
  ],
  tips: [
    {
      title: 'Usa el patrón "comer, jugar, dormir" de forma flexible',
      description:
        'Alimenta tras el despertar, ofrece un breve rato de alerta y luego vuelve a facilitar el sueño. Este ritmo suave reduce asociaciones rígidas de alimentación-para-dormir y mantiene la flexibilidad que un recién nacido necesita.',
    },
    {
      title: 'El contraste día-noche sigue siendo tu mejor herramienta',
      description:
        'Días luminosos y activos con cortinas abiertas y ruido normal. Noches tenues y tranquilas, con interacción mínima durante las tomas. El cerebro de tu bebé está absorbiendo estas señales poco a poco.',
    },
    {
      title: 'No compares el sueño de tu bebé con el de otros',
      description:
        'Cada bebé tiene un patrón distinto a esta edad. Algunos hacen tramos largos; otros son campeones de las siestas cortas frecuentes. Ninguno de los dos es un problema. El sueño se consolidará a su propio ritmo.',
    },
    {
      title: 'Las tomas nocturnas alimentan, no son un fracaso',
      description:
        'A esta edad, tu bebé necesita 2–3 tomas nocturnas. No es un problema de sueño que haya que "arreglar"; es nutrición normal y saludable. Mantén las tomas nocturnas en calma y con poca estimulación para volver a dormir más rápido.',
    },
  ],
};

// ── 2 Months ────────────────────────────────────────────────────────────────

const MONTH_2_ES: SleepGuideConfig = {
  slug: '2-month-old',
  ageMonths: 2,
  displayLabel: '2 m',
  ageLabel: 'bebé de 2 meses',
  title: 'Horario de sueño de 2 meses',
  subtitle: 'Ventanas de vigilia, patrones de siesta emergentes y consejos para tu bebé de 2 meses',
  metaDescription:
    'Guía práctica del sueño a los 2 meses: 15.5 horas totales de sueño, ventanas de vigilia de 45 min–1.75h, 4–5 siestas al día y consejos para construir las bases del buen dormir.',
  stats: {
    napsPerDay: '4–5',
    wakeWindow: '45 min–1.75h',
    bedtime: 'A menudo después de las 21:00',
    nightSleep: '9–12h (con despertares)',
    totalDaySleep: '5–6h',
    totalSleep: '15.5h',
  },
  sampleSchedule: [
    { time: '08:00', label: 'Despertar', type: 'wake' },
    { time: '09:15', label: 'Siesta 1', type: 'nap' },
    { time: '12:00', label: 'Siesta 2', type: 'nap' },
    { time: '15:00', label: 'Siesta 3', type: 'nap' },
    { time: '18:00', label: 'Siesta 4', type: 'nap' },
    { time: '20:15', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 2 meses',
      content:
        'Los dos meses son cuando empiezas a vislumbrar las primeras señales de un patrón. Tu bebé sigue necesitando alrededor de 15.5 horas de sueño total, pero las ventanas de vigilia se han alargado ligeramente — del rango de recién nacido de 30–90 minutos a aproximadamente 45 minutos a 1 hora 45 minutos. Este es un cambio significativo. Significa que tienes un poco más de tiempo despiertos para disfrutar juntos, y que las siestas pueden empezar a tener una estructura flexible.\n\nLa mayoría de los bebés de 2 meses hacen 4–5 siestas al día. Cada siesta puede durar desde 10 minutos hasta 2 horas — la variabilidad es amplia y normal. Si tu bebé hace una siesta muy larga (más de 2 horas), generalmente conviene despertarlo con suavidad para proteger el ritmo del resto del día y asegurar suficientes tomas diurnas.\n\nLa hora de dormir sigue siendo tardía — normalmente después de las 21:00 — y una hora más temprana surgirá de forma natural alrededor de los 3–4 meses, cuando el ritmo circadiano madure. No vas por detrás si tu bebé se duerme a las 22:00 ahora mismo. Es biología, no un problema.',
    },
    {
      heading: 'Leer las señales de sueño de tu bebé',
      content:
        'A los 2 meses, las señales de sueño de tu bebé se vuelven más claras. Presta atención a cuando se queda quieto y tranquilo, mira fijamente a lo lejos, pierde interés en los juguetes o en tu cara, y se lleva las manos a la cara. Estas señales tempranas aparecen antes de las más evidentes como bostezar y llorar — y captarlas a tiempo hace que conciliar el sueño sea mucho más fácil.\n\nLas ventanas de vigilia a esta edad varían a lo largo del día: la primera ventana de la mañana suele ser la más corta (alrededor de 45–60 minutos), mientras que las posteriores pueden estirarse hasta 1.5–1.75 horas. Presta atención a cuándo tu bebé en particular tiende a mostrar cansancio en lugar de seguir un reloj rígido. Una hora de despertar consistente por la mañana es una de las mejores anclas que puedes establecer ahora mismo.',
    },
  ],
  tips: [
    {
      title: 'Ancla el día con una hora de despertar consistente',
      description:
        'Elegir una hora de despertar regular por la mañana (con 30 minutos de margen) ayuda al reloj interno de tu bebé a empezar a organizarse. No tiene que ser temprano — 7:30 u 8:00 funciona bien a esta edad.',
    },
    {
      title: 'Limita las siestas a 2 horas',
      description:
        'Si tu bebé duerme más de 2 horas en una sola siesta, despiértalo con suavidad. Esto protege las tomas diurnas y evita que una siesta larga robe presión de sueño al resto del día.',
    },
    {
      title: 'El chupete es una herramienta útil',
      description:
        'Si tu bebé acepta el chupete, usarlo a la hora de dormir es tanto reconfortante como protector. Las investigaciones muestran que el uso del chupete durante el sueño se asocia con un menor riesgo de SMSL.',
    },
    {
      title: 'Observa a tu bebé, no a internet',
      description:
        'A los 2 meses, hay una gran variación en lo que es normal. Si tu bebé se alimenta bien, gana peso y tiene periodos de alerta activa, su sueño está haciendo exactamente lo que debe — aunque no coincida con el horario de ejemplo de arriba.',
    },
  ],
};

// ── 3 Months ────────────────────────────────────────────────────────────────

const MONTH_3_ES: SleepGuideConfig = {
  slug: '3-month-old',
  ageMonths: 3,
  displayLabel: '3 m',
  ageLabel: 'bebé de 3 meses',
  title: 'Horario de sueño de 3 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 3 meses',
  metaDescription:
    'Descubre cuánto sueño necesita un bebé de 3 meses, ventanas de vigilia ideales (75–90 min), número de siestas y un horario diario de ejemplo para crear hábitos de sueño saludables.',
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
    { time: '08:15', label: 'Siesta 1', type: 'nap' },
    { time: '09:45', label: 'Siesta 2', type: 'nap' },
    { time: '11:30', label: 'Siesta 3', type: 'nap' },
    { time: '13:30', label: 'Siesta 4', type: 'nap' },
    { time: '19:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 3 meses',
      content:
        'Los tres meses son un punto de inflexión precioso. Tu bebé está más alerta y sociable — sonríe, balbucea y sigue tu cara con la mirada — lo que significa que su cerebro trabaja a toda máquina incluso durante los cortos ratos de vigilia. Esa mayor estimulación es maravillosa, pero también significa que se cansa rápido. La mayoría de los bebés de 3 meses solo aguantan 75–90 minutos despiertos antes de necesitar dormir de nuevo, así que las siestas frecuentes a lo largo del día son completamente normales y esperables.\n\nPuede que estés notando el inicio de tramos nocturnos más largos — algunos bebés a esta edad encadenan bloques de 4–6 horas, y a veces más. Este es un progreso realmente emocionante, aunque todavía no sea consistente. Las tomas nocturnas siguen siendo normales y necesarias a esta edad; el objetivo ahora no es eliminarlas, sino apoyar con suavidad los tramos más largos cuando tu bebé esté preparado.\n\nLas siestas a los 3 meses suelen ser cortas — de 30 a 45 minutos es lo típico — y eso está perfectamente bien. Tu bebé aún no ha aprendido a enlazar ciclos de sueño, así que despertarse después de un ciclo es biología normal, no un problema que arreglar. Cuatro siestas al día evitan que tu bebé acumule demasiada presión de sueño entre descansos, lo que en realidad ayuda a que el sueño nocturno vaya más fluido.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'Una ventana de vigilia es simplemente la cantidad de tiempo que tu bebé puede estar cómodamente despierto entre sueños antes de estar demasiado cansado. A los 3 meses, esa ventana es corta — aproximadamente de 75 a 90 minutos — y es una de las herramientas más poderosas que tienes. Empieza el siguiente sueño antes de ver bostezos, frotarse los ojos o irritabilidad, porque cuando esas señales aparecen, tu bebé puede estar ya demasiado cansado y más difícil de calmar.\n\nLa primera ventana de vigilia del día suele ser la más corta. Muchos bebés de 3 meses solo aguantan unos 75 minutos después de despertarse por la mañana antes de necesitar su primera siesta. Más tarde, algunos bebés estiran ligeramente hasta 90 minutos, pero observa a tu bebé individual en lugar del reloj — te dará señales cuando se acerque a su límite.',
    },
  ],
  tips: [
    {
      title: 'Empieza la relajación 15 minutos antes',
      description:
        'A los 3 meses, tu bebé pasa de alerta a demasiado cansado más rápido de lo que esperas. Empieza a bajar las luces, reducir el ruido y calmar la actividad unos 15 minutos antes de que quieras que se duerma — no cuando ya está irritable.',
    },
    {
      title: 'Limita las siestas de última hora de la tarde',
      description:
        'Si la última siesta de tu bebé termina demasiado cerca de la hora de dormir, no estará lo suficientemente cansado para conciliar el sueño. Intenta que la última siesta termine al menos 1.5–2 horas antes de la hora de dormir, aunque eso implique despertarlo con suavidad.',
    },
    {
      title: 'Las siestas cortas son normales — no te apresures a arreglarlas',
      description:
        'Una siesta de 30–45 minutos a esta edad es biológicamente típica. Tu bebé está durmiendo exactamente un ciclo de sueño. Volver a dormirse entre ciclos es una habilidad que se desarrolla en los próximos meses.',
    },
    {
      title: 'La consistencia supera a la perfección',
      description:
        'No necesitas un horario rígido, pero hacer cosas parecidas en un orden parecido antes de cada sueño — toma, mimos, habitación oscura — ayuda al cerebro de tu bebé a empezar a anticipar el sueño y conciliarlo más fácilmente.',
    },
  ],
};

// ── 4 Months ────────────────────────────────────────────────────────────────

const MONTH_4_ES: SleepGuideConfig = {
  slug: '4-month-old',
  ageMonths: 4,
  displayLabel: '4 m',
  ageLabel: 'bebé de 4 meses',
  title: 'Horario de sueño de 4 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 4 meses',
  metaDescription:
    'Horario completo del sueño a los 4 meses: la regresión del sueño de los 4 meses, transición a 3 siestas, ventanas de vigilia de 90–105 min y consejos realistas para la hora de dormir.',
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
    { time: '08:30', label: 'Siesta 1', type: 'nap' },
    { time: '10:30', label: 'Siesta 2', type: 'nap' },
    { time: '13:00', label: 'Siesta 3', type: 'nap' },
    { time: '19:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 4 meses',
      content:
        'Los cuatro meses son una de las edades de las que más se habla en el sueño infantil — y con razón. Alrededor de este momento, la arquitectura del sueño de tu bebé madura de forma permanente, pasando del patrón de recién nacido (caer en sueño profundo rápidamente) a un ciclo más parecido al adulto con una fase inicial más ligera. Este es un salto neurológico genuino, y puede hacer que el sueño parezca que de repente ha empeorado incluso cuando las cosas iban mejorando. Si estás en esa fase ahora mismo, no estás haciendo nada mal — es un cambio evolutivo normal.\n\nPor el lado positivo, tu bebé ahora es mucho más sociable y receptivo. La interacción, el tiempo boca abajo y el juego son más estimulantes que hace un mes, lo que significa que las ventanas de vigilia son algo más largas — la mayoría de los bebés de 4 meses aguantan 90–105 minutos. Pasar de cuatro a tres siestas es habitual a esta edad, aunque algunos bebés necesitan unas semanas más para estar listos para la transición.\n\nEl sueño nocturno puede ser impredecible durante el periodo de regresión, pero la necesidad total de sueño de tu bebé no ha disminuido — simplemente se está redistribuyendo mientras su ritmo se reorganiza. Mantener una hora de dormir consistente y responder con calma a los despertares nocturnos es lo más útil que puedes hacer ahora mismo.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'A los 4 meses, la mayoría de los bebés han pasado a ventanas de vigilia de unos 90–105 minutos. Probablemente notarás que la primera ventana del día sigue siendo la más corta — cerca de 90 minutos — mientras que las ventanas más tarde pueden acercarse a los 105 minutos a medida que la resistencia de tu bebé crece a lo largo del día.\n\nCon tres siestas, la distribución importa más. Intenta que la última siesta del día sea lo suficientemente corta (30–45 minutos) para que tu bebé esté cansado a la hora de dormir. Si la última siesta termina demasiado tarde y tu bebé no muestra señales de sueño a la hora de dormir, puede que necesites acortarla o adelantarla.',
    },
  ],
  tips: [
    {
      title: 'Atraviesa la regresión con consistencia',
      description:
        'La regresión de los 4 meses es temporal, normalmente dura 2–4 semanas. Este no es el momento de cambiarlo todo — mantén tus rutinas consistentes y ofrece muchas tomas diurnas para compensar las noches alteradas.',
    },
    {
      title: 'Observa las señales de que está listo para 3 siestas',
      description:
        'Tu bebé puede estar listo para pasar a 3 siestas cuando rechaza consistentemente la 4ª siesta, tarda más en dormirse para ella, o empieza a despertarse inusualmente temprano por la mañana. No lo fuerces — sigue su ritmo.',
    },
    {
      title: 'Oscurece el entorno de sueño',
      description:
        'Ahora que el sueño de tu bebé es más ligero en la fase inicial, una habitación oscura se vuelve más importante. Las cortinas opacas pueden marcar una diferencia real tanto en la duración de las siestas como en la calidad del sueño nocturno.',
    },
    {
      title: 'Introduce un ritual sencillo antes de dormir',
      description:
        'Una secuencia corta y repetible antes de cada sueño — aunque sean solo dos minutos de mecerlo suavemente y una frase tranquila — ayuda al sistema nervioso de tu bebé a anticipar y prepararse para dormir. Consistencia antes que complejidad.',
    },
  ],
  regression: {
    name: 'Regresión del sueño de los 4 meses',
    description:
      'Alrededor de los 4 meses, los ciclos de sueño de tu bebé maduran para parecerse a los patrones adultos. Esto puede alterar temporalmente el sueño con más despertares, siestas más cortas y mayor irritabilidad a la hora de dormir. Suele durar 2–4 semanas.',
  },
};

// ── 5 Months ────────────────────────────────────────────────────────────────

const MONTH_5_ES: SleepGuideConfig = {
  slug: '5-month-old',
  ageMonths: 5,
  displayLabel: '5 m',
  ageLabel: 'bebé de 5 meses',
  title: 'Horario de sueño de 5 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 5 meses',
  metaDescription:
    'Descubre el horario ideal del sueño a los 5 meses: 3 siestas, ventanas de vigilia de 105–120 min y consejos expertos para mejorar la consolidación de siestas y el sueño nocturno.',
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
    { time: '08:45', label: 'Siesta 1', type: 'nap' },
    { time: '11:00', label: 'Siesta 2', type: 'nap' },
    { time: '13:30', label: 'Siesta 3 (corta)', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 5 meses',
      content:
        'Los cinco meses suelen sentirse como una temporada más estable tras la convulsión de la regresión de los 4 meses. Tu bebé es más capaz físicamente — se gira, alcanza objetos y empieza a apoyar peso en las piernas — y su cerebro está procesando una cantidad notable de estímulos sensoriales nuevos cada día. Esa estimulación extra significa que las ventanas de vigilia han crecido a 105–120 minutos, dándote un poco más de margen entre siestas.\n\nLa mayoría de los bebés de 5 meses siguen con 3 siestas, siendo la tercera una siesta puente más corta para llevarlos hasta la hora de dormir sin quedarse demasiado cansados. Puede que las siestas estén empezando a consolidarse — tu bebé podría empezar a enlazar ciclos de sueño y dormir 45 minutos o más de un tirón, lo cual es un progreso real que vale la pena celebrar.\n\nEl sueño nocturno suele ser más predecible este mes. Muchos bebés son capaces de tramos más largos — a veces de 6–8 horas — aunque las tomas nocturnas pueden seguir siendo parte de la rutina y eso es completamente normal. La clave a los 5 meses es establecer una hora de dormir lo bastante temprana (alrededor de las 18:30–19:00) para evitar que tu bebé se duerma demasiado cansado.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'A los 5 meses, las ventanas de vigilia de 105–120 minutos te dan un poco más de flexibilidad para estructurar el día. La primera ventana tras el despertar matutino sigue siendo la más corta — alrededor de 105 minutos. Por la tarde, algunos bebés estiran cómodamente hasta las 2 horas.\n\nLa tercera ventana de vigilia del día — entre la última siesta y la hora de dormir — suele ser la más difícil. Si la tercera siesta termina alrededor de las 15:30–16:00, apunta a una hora de dormir no más tarde de las 18:00–18:30 para evitar el exceso de cansancio. Una hora de dormir temprana no es un problema a esta edad; no provoca despertares tempranos por la mañana (eso suele ser el exceso de cansancio haciendo justo lo contrario).',
    },
  ],
  tips: [
    {
      title: 'Trata la tercera siesta como un "puente"',
      description:
        'La tercera siesta no necesita ser larga — 30–45 minutos es ideal. Su función es simplemente hacer de puente hasta la hora de dormir sin que tu bebé se derrumbe. Mantenla lo bastante temprana para que termine al menos 1.5 horas antes de dormir.',
    },
    {
      title: 'Prueba una hora de despertar consistente',
      description:
        'Anclar el día con una hora de despertar matutino consistente (±30 minutos) ayuda al ritmo circadiano de tu bebé a estabilizarse, lo que hace que los horarios de siestas y la hora de dormir sean más predecibles con el tiempo.',
    },
    {
      title: 'Responde al volteo en la cuna',
      description:
        'Si tu bebé ha empezado a girarse, puede encontrarse en nuevas posiciones durante la noche y asustarse al despertarse. Dale unos minutos antes de acudir — muchos bebés se vuelven a dormir solos una vez que se acostumbran a moverse en su espacio de sueño.',
    },
    {
      title: 'No te saltes la relajación ni en las siestas',
      description:
        'Un breve periodo de relajación de 5 minutos antes de cada siesta — bajar las persianas, reducir los estímulos, usar una frase o canción consistente — le indica al sistema nervioso de tu bebé que el sueño se acerca. Es especialmente útil a medida que los tiempos de vigilia se alargan y el cerebro se activa más.',
    },
  ],
};

// ── 6 Months ────────────────────────────────────────────────────────────────

const MONTH_6_ES: SleepGuideConfig = {
  slug: '6-month-old',
  ageMonths: 6,
  displayLabel: '6 m',
  ageLabel: 'bebé de 6 meses',
  title: 'Horario de sueño de 6 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 6 meses',
  metaDescription:
    'Guía completa del sueño a los 6 meses: 3 siestas, ventanas de vigilia de 2–2.25h, hora de dormir ideal 18:00–19:30 y consejos para manejar sólidos y consolidación del sueño.',
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
    { time: '09:00', label: 'Siesta 1', type: 'nap' },
    { time: '11:30', label: 'Siesta 2', type: 'nap' },
    { time: '14:15', label: 'Siesta 3 (corta)', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 6 meses',
      content:
        'Los seis meses son un hito. Tu bebé ya lleva la mitad de su primer año, se sienta con apoyo, muestra preferencias claras y a menudo empieza a explorar la alimentación sólida. Toda esta energía de desarrollo es emocionante y relevante para el sueño — un bebé que está más implicado mental y físicamente durante el día tiende a dormir más profundamente por la noche.\n\nLa mayoría de los bebés de 6 meses siguen con 3 siestas, aunque el hueco entre la siesta 2 y la siesta 3 puede parecer largo y de vez en cuando esa tercera siesta se convierte en una batalla. Es una señal de que la capacidad de tu bebé está creciendo pero aún no está listo para eliminar una siesta. La paciencia aquí merece la pena — forzar la transición a 2 siestas demasiado pronto suele llevar a exceso de cansancio y noches alteradas.\n\nEmpezar con sólidos alrededor de los 6 meses es emocionante, pero no va a mejorar directamente el sueño (a pesar del consejo habitual de añadir cereales de arroz por la noche). Lo que sí ayuda es mantener las tomas — pecho o biberón — como fuente principal de nutrición y usar las comidas para anclar el ritmo del día. La palanca más poderosa para el sueño a esta edad es una hora de dormir consistente y lo bastante temprana.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'A los 6 meses, las ventanas de vigilia suelen ser de 2–2.25 horas. Este es un salto significativo respecto a hace unos meses, y significa que tu bebé puede manejar juegos más activos y variados antes de necesitar descansar. La primera ventana del día es de unas 2 horas, y las ventanas pueden acercarse a 2.25 horas a medida que avanza el día.\n\nEstá atento a las señales sutiles tempranas de exceso de cansancio: perder interés en los juguetes, mirar al vacío, o volverse más pegajoso contigo. Estas suelen aparecer antes del clásico bostezo y frotarse los ojos, y actuar sobre ellas a tiempo hace que conciliar el sueño sea más fácil y rápido.',
    },
  ],
  tips: [
    {
      title: 'Mantén los sólidos lejos de la toma antes de dormir',
      description:
        'Al introducir sólidos, ofrécelos a mediodía en lugar de en la última toma antes de dormir. La digestión no mejora el sueño, pero un estómago incómodo puede alterarlo. Mantén la rutina antes de dormir centrada en la leche y la calma.',
    },
    {
      title: 'Protege la tercera siesta aunque sea una lucha',
      description:
        'Si tu bebé rechaza la tercera siesta algunos días, prueba un paseo en cochecito o una siesta en brazos en lugar de saltártela. Un bebé de 6 meses demasiado cansado a la hora de dormir suele significar más despertares nocturnos, no menos.',
    },
    {
      title: 'Practica dormirse solo en momentos de baja presión',
      description:
        'Acuesta a tu bebé somnoliento pero despierto en al menos una siesta al día para darle práctica en conciliar el sueño sin ayuda completa. Si protesta un poco, está bien — unos minutos de queja suave son diferentes del llanto de angustia.',
    },
    {
      title: 'Haz que el entorno de sueño esté completamente a oscuras',
      description:
        'A los 6 meses, tu bebé es más consciente visualmente y se distrae fácilmente con la luz. Oscuridad total durante todos los sueños — siestas y noches — puede alargar notablemente la duración del sueño.',
    },
  ],
};

// ── 7 Months ────────────────────────────────────────────────────────────────

const MONTH_7_ES: SleepGuideConfig = {
  slug: '7-month-old',
  ageMonths: 7,
  displayLabel: '7 m',
  ageLabel: 'bebé de 7 meses',
  title: 'Horario de sueño de 7 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 7 meses',
  metaDescription:
    'Todo lo que necesitas para el horario de sueño a los 7 meses: 3 siestas, ventanas de vigilia de 2–2.5h, hora de dormir 18:00–19:30 y consejos para la alteración del sueño en la fase de gateo.',
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
    { time: '09:00', label: 'Siesta 1', type: 'nap' },
    { time: '11:45', label: 'Siesta 2', type: 'nap' },
    { time: '14:30', label: 'Siesta 3 (corta)', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 7 meses',
      content:
        'Los siete meses traen un aumento notable en la actividad física. Muchos bebés a esta edad se arrastran, pivotan sobre la barriga o empiezan a agarrarse a los muebles para levantarse. Este desarrollo motor es incesante — tu bebé practica movimiento incluso en su espacio de sueño, lo que puede provocar nuevos despertares nocturnos al encontrarse en posiciones desconocidas.\n\nEl sueño suele estar más estructurado este mes. La mayoría de los bebés de 7 meses están en 3 siestas, aunque la tercera es cada vez más corta y de transición. Puede que notes que tu bebé empieza a resistirse o a pelearla más que en semanas anteriores. Es normal — su capacidad para aguantar ratos más largos despierto está creciendo, pero la mayoría no están listos para pasar a 2 siestas hasta los 8–9 meses.\n\nLa conciencia de la separación también puede empezar a surgir alrededor de los 7 meses. Tu bebé puede volverse más apegado a la hora de dormir, queriendo que lo cojan o protestando al dejarlo. Esto no es una regresión — es una señal sana de desarrollo cognitivo. Una rutina cálida y consistente a la hora de dormir le da a tu bebé la seguridad de que volverás aunque no pueda verte.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'A los 7 meses, las ventanas de vigilia van de 2 a 2.5 horas dependiendo del momento del día y del ritmo individual de tu bebé. La primera ventana después del despertar matutino suele ser de unas 2 horas; cuando se acerca la tercera siesta, tu bebé puede aguantar casi 2.5 horas antes de mostrar señales.\n\nLa actividad física de este mes puede enmascarar el cansancio. Un bebé que está gateando activamente o explorando puede parecer enérgico hasta que se derrumba de golpe. Confía en el reloj como guía de reserva — si han pasado 2.5 horas y tu bebé no ha mostrado señales de cansancio, empieza la relajación de todas formas.',
    },
  ],
  tips: [
    {
      title: 'Ofrece tiempo de suelo antes de las siestas',
      description:
        'Tiempo abundante boca abajo y movimiento libre durante las ventanas de vigilia ayuda a tu bebé a procesar el aprendizaje físico que está haciendo. Un bebé que ha tenido buena actividad física suele conciliar el sueño más fácilmente que uno que ha estado en una silla.',
    },
    {
      title: 'Mantén la hora de dormir temprana durante los saltos motores',
      description:
        'Las nuevas habilidades físicas requieren un procesamiento neuronal enorme, y el cerebro de tu bebé trabaja duro incluso durante el sueño. Una hora de dormir temprana — 18:00–18:30 durante las semanas de desarrollo intenso — previene el exceso de cansancio y favorece un mejor sueño nocturno.',
    },
    {
      title: 'Aborda la separación al inicio de la rutina',
      description:
        'Si tu bebé se vuelve más apegado a la hora de dormir, incluye tiempo extra de conexión al principio de la rutina — mimos, contacto visual, hablar con calma — antes del momento final de dejarlo. Satisfacer la necesidad al inicio significa menos protesta después.',
    },
    {
      title: 'Revisa el espacio de sueño para peligros de movimiento',
      description:
        'Ahora que tu bebé se mueve más, comprueba que la cuna esté despejada y el colchón a una altura segura. Si se está agarrando para ponerse de pie, baja el colchón para prevenir caídas.',
    },
  ],
};

// ── 8 Months ────────────────────────────────────────────────────────────────

const MONTH_8_ES: SleepGuideConfig = {
  slug: '8-month-old',
  ageMonths: 8,
  displayLabel: '8 m',
  ageLabel: 'bebé de 8 meses',
  title: 'Horario de sueño de 8 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 8 meses',
  metaDescription:
    'Guía del sueño a los 8 meses: transición a 2 siestas, ventanas de vigilia de 2.5–3h, la regresión de los 8 meses y consejos para la ansiedad de separación.',
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
    { time: '09:30', label: 'Siesta 1', type: 'nap' },
    { time: '13:30', label: 'Siesta 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 8 meses',
      content:
        'Los ocho meses son un punto de transición importante: la mayoría de los bebés están listos para pasar de 3 siestas a 2. Las señales son claras cuando llegan — tu bebé rechaza sistemáticamente la tercera siesta, la hace muy tarde (retrasando la hora de dormir), o se acuesta tan cansado que las noches se desestabilizan. Pasar a 2 siestas suele ir bien cuando esperas a estas señales de preparación en lugar de hacer el cambio por el calendario.\n\nLa regresión de los 8 meses viene impulsada por una combinación de hitos acumulados — gatear, agarrarse para levantarse, primeros intentos de ponerse de pie y la aparición de la ansiedad de separación. El cerebro de tu bebé está procesando información social y espacial compleja las 24 horas. Esto puede traducirse en más despertares nocturnos, dificultad a la hora de dormir y siestas más cortas que antes se estaban consolidando. Frustrante en el momento, pero es una señal de desarrollo sano.\n\nLa ansiedad de separación alcanza su pico alrededor de esta edad y se siente con más intensidad a la hora de dormir. Tu bebé ahora entiende la permanencia del objeto — sabe que existes cuando sales de la habitación — y te quiere de vuelta. Una rutina cálida y predecible a la hora de dormir es tu herramienta más eficaz. La consistencia transmite seguridad.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'El salto a 2 siestas también significa que las ventanas de vigilia se alargan considerablemente — a 2.5–3 horas. La primera ventana del día es típicamente de unas 2.5 horas, mientras que la última ventana antes de dormir suele extenderse a casi 3 horas a medida que tu bebé gana resistencia.\n\nCon dos siestas, el horario tiene anclas más naturales. Apunta a la primera siesta alrededor de las 9:30–10:00 y la segunda alrededor de las 13:00–14:00, con hora de dormir 3–3.5 horas después de que termine la segunda siesta. La ventana larga de la tarde puede parecer mucho al principio — salidas cortas y juego activo ayudan a llenarla sin crear exceso de cansancio.',
    },
  ],
  tips: [
    {
      title: 'Haz la transición a 2 siestas gradualmente',
      description:
        'Si tu bebé pelea la tercera siesta pero no está del todo listo para solo dos, prueba a retrasar las siestas poco a poco durante una semana en lugar de eliminar la tercera de golpe. Un cambio gradual es más fácil para todos.',
    },
    {
      title: 'Usa un ritual corto de despedida en cada separación',
      description:
        'Al salir de la habitación a la hora de dormir, usa la misma frase siempre — "Buenas noches, te quiero, nos vemos por la mañana" — y dila en serio. Las palabras predecibles son genuinamente tranquilizadoras para un bebé con ansiedad de separación.',
    },
    {
      title: 'Protege el ancla de la siesta de la mañana',
      description:
        'En el horario de 2 siestas, la primera siesta es la columna vertebral del día. Mantenerla a una hora consistente (con 30 minutos de margen) ayuda a anclar la siesta de la tarde y la hora de dormir, haciendo todo el día más predecible.',
    },
    {
      title: 'Ofrece conexión extra antes de dormir durante la regresión',
      description:
        'Durante el periodo de regresión, añade 5–10 minutos de atención tranquila y exclusiva al inicio de la rutina de dormir. La cercanía física antes de dormir ayuda al sistema nervioso de tu bebé a relajarse, facilitando la conciliación del sueño.',
    },
  ],
  regression: {
    name: 'Regresión del sueño de los 8 meses',
    description:
      'La regresión de los 8 meses suele coincidir con grandes hitos — gateo, ponerse de pie y ansiedad de separación. Tu bebé puede resistirse a las siestas, despertarse más por la noche o tener dificultad para conciliar el sueño. Esta fase suele pasar en 2–3 semanas.',
  },
};

// ── 9 Months ────────────────────────────────────────────────────────────────

const MONTH_9_ES: SleepGuideConfig = {
  slug: '9-month-old',
  ageMonths: 9,
  displayLabel: '9 m',
  ageLabel: 'bebé de 9 meses',
  title: 'Horario de sueño de 9 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 9 meses',
  metaDescription:
    'Horario práctico del sueño a los 9 meses: 2 siestas, ventanas de vigilia de 2.5–3.5h, hora de dormir 18:00–19:30 y consejos para manejar cuando se pone de pie en la cuna y los despertares tempranos.',
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
    { time: '09:30', label: 'Siesta 1', type: 'nap' },
    { time: '13:30', label: 'Siesta 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 9 meses',
      content:
        'Los nueve meses son una edad de gran audacia física. Tu bebé probablemente se agarra para ponerse de pie, se desplaza agarrado a los muebles y puede que esté dando los primeros pasos titubeantes con apoyo. Este impulso de movilidad trae un enorme orgullo cognitivo — y un enorme cansancio físico — así que la estructura de 2 siestas establecida el mes pasado sigue funcionando bien.\n\nMuchos bebés de 9 meses desarrollan la capacidad de ponerse de pie en la cuna pero aún no han averiguado cómo volver a bajar. Esto causa con frecuencia despertares nocturnos desconcertantes — tu bebé no está angustiado por una pesadilla o hambre, simplemente está atrapado de pie y necesita que lo bajes suavemente a la posición acostada. Practicar el movimiento de sentarse desde la posición de pie durante el juego en el suelo durante el día acelera que lo aprenda por su cuenta.\n\nLa alimentación sólida se está consolidando este mes, lo que puede cambiar sutilmente el ritmo del día. A medida que las tomas de leche se vuelven algo menos frecuentes, el hambre es menos probable como causa de despertares nocturnos, y la consolidación del sueño suele mejorar alrededor de este momento como resultado.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'A los 9 meses, las ventanas de vigilia van de unas 2.5 a 3.5 horas. La primera ventana es típicamente de 2.5–3 horas, y la ventana final antes de dormir puede estirarse cómodamente a 3–3.5 horas para muchos bebés.\n\nLos despertares tempranos por la mañana son un reto habitual este mes. Si tu bebé se despierta antes de las 6:00 AM de forma consistente, el culpable suele ser una de tres cosas: la necesidad total de sueño se cubre con noches muy largas, la primera siesta se ofrece demasiado pronto (reforzando el despertar temprano), o el entorno de sueño se ilumina demasiado. Aborda el entorno primero — es la palanca más fácil.',
    },
  ],
  tips: [
    {
      title: 'Practica sentarse desde ponerse de pie durante el día',
      description:
        'Si tu bebé se pone de pie en la cuna por la noche, dedica tiempo de juego en el suelo a practicar "bajar" — guíale para que baje de la posición de pie a sentarse. Esto suele resolver el problema de ponerse de pie por la noche en 1–2 semanas.',
    },
    {
      title: 'No retrases demasiado la siesta de la mañana',
      description:
        'Es tentador estirar la ventana de vigilia matutina para que el horario quede más limpio, pero a los 9 meses, una ventana matutina de 3 horas suele ser el máximo. Pasarse crea un bebé cansado e irritable que tarda más en dormirse.',
    },
    {
      title: 'Revisa la situación de luz por la mañana temprano',
      description:
        'Incluso una pequeña cantidad de luz a las 5:30 AM puede señalar "mañana" al sistema circadiano en desarrollo de tu bebé. Comprueba si hay filtraciones de luz alrededor de las persianas opacas, especialmente cuando los días se alargan estacionalmente.',
    },
    {
      title: 'Evita que la segunda siesta se alargue demasiado',
      description:
        'Con ventanas de vigilia más largas, la segunda siesta puede irse tarde en la tarde. Intenta que la segunda siesta termine como máximo a las 16:00–16:30 para proteger la presión de sueño a la hora de dormir — una hora de dormir bien puesta es la base de una buena noche.',
    },
  ],
};

// ── 10 Months ───────────────────────────────────────────────────────────────

const MONTH_10_ES: SleepGuideConfig = {
  slug: '10-month-old',
  ageMonths: 10,
  displayLabel: '10 m',
  ageLabel: 'bebé de 10 meses',
  title: 'Horario de sueño de 10 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 10 meses',
  metaDescription:
    'Guía definitiva del sueño a los 10 meses: 2 siestas, ventanas de vigilia de 2.75–3.5h, hora de dormir 18:00–19:30 y cómo manejar el rechazo de siestas antes de la transición de 2 a 1.',
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
    { time: '09:45', label: 'Siesta 1', type: 'nap' },
    { time: '14:00', label: 'Siesta 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 10 meses',
      content:
        'Los diez meses son una edad de independencia floreciente. Tu bebé probablemente camina agarrado a los muebles, explora todo a nivel del suelo y empieza a comunicarse con intención — señalando, balbuceando con entonación y a veces haciendo gestos si los has introducido. Esta explosión cognitiva va acompañada de una creciente autodeterminación que puede manifestarse a la hora de dormir como rechazo de siestas o protestas al acostarse.\n\nLa estructura de 2 siestas sigue funcionando bien para la mayoría de los bebés de 10 meses, aunque puede que empieces a ver resistencia ocasional a una siesta u otra. Esto no necesariamente significa que tu bebé esté listo para pasar a 1 siesta — la mayoría de los niños no hacen ese cambio hasta los 14–18 meses. Lo que suele significar es que una ventana de vigilia necesita un pequeño ajuste, o que una actividad en el periodo de relajación es demasiado estimulante.\n\nEl sueño nocturno suele ser bueno este mes. Muchos bebés de 10 meses duermen 11–12 horas sin necesitar una toma, aunque algunos todavía se benefician de una toma nocturna. Sigue las señales de tu bebé y consulta con tu pediatra si no estás seguro sobre la alimentación nocturna a esta edad.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'Las ventanas de vigilia a los 10 meses son de aproximadamente 2.75–3.5 horas. La ventana entre el despertar matutino y la primera siesta es típicamente de unas 2.75–3 horas, mientras que la ventana de la tarde antes de dormir puede estirarse a 3.5 horas para algunos bebés.\n\nEl hueco entre las dos siestas ahora es bastante largo — a menudo más de 4 horas de tiempo despierto. Juego estructurado y estimulante y tiempo al aire libre adecuado durante este tramo ayudan a evitar que el exceso de cansancio se acumule demasiado rápido. Si tu bebé parece tener dificultades con la larga ventana de media mañana, comprueba que las ventanas de vigilia no se estén estirando más allá de lo que tu bebé individual puede manejar.',
    },
  ],
  tips: [
    {
      title: 'No confundas independencia con necesidad de dormir',
      description:
        'Un bebé de 10 meses que protesta a la hora de la siesta suele estar comunicando "quiero seguir jugando" en lugar de "no estoy cansado". Confía en los tiempos de la ventana de vigilia — si han pasado 3 horas, el cerebro de tu bebé está listo para dormir aunque te diga lo contrario.',
    },
    {
      title: 'Ofrece opciones predecibles en la rutina',
      description:
        'Dar a tu bebé pequeñas opciones — "¿quieres la manta de estrellas o la de la luna?" — satisface su creciente necesidad de autonomía sin socavar la estructura del sueño. También hace la rutina más atractiva y menos conflictiva.',
    },
    {
      title: 'Usa ruido blanco de forma consistente',
      description:
        'A los 10 meses, tu bebé es más consciente del ruido de la casa y se despertará más fácilmente en las fases ligeras del sueño. Ruido blanco constante durante siestas y noches ayuda a enmascarar los sonidos ambientales que de otra forma provocarían despertares innecesarios.',
    },
    {
      title: 'Planifica un rato al aire libre en la larga ventana de media mañana',
      description:
        'La luz natural y el movimiento físico durante la larga ventana de vigilia entre siestas apoya el desarrollo del ritmo circadiano y ayuda a tu bebé a conseguir una presión de sueño de calidad para la segunda siesta.',
    },
  ],
};

// ── 11 Months ───────────────────────────────────────────────────────────────

const MONTH_11_ES: SleepGuideConfig = {
  slug: '11-month-old',
  ageMonths: 11,
  displayLabel: '11 m',
  ageLabel: 'bebé de 11 meses',
  title: 'Horario de sueño de 11 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 11 meses',
  metaDescription:
    'Horario completo del sueño a los 11 meses: 2 siestas, ventanas de vigilia de 2.75–3.5h, guía de hora de dormir y cómo manejar las batallas de siestas cuando tu bebé se acerca a su primer cumpleaños.',
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
    { time: '09:45', label: 'Siesta 1', type: 'nap' },
    { time: '14:00', label: 'Siesta 2', type: 'nap' },
    { time: '18:30', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 11 meses',
      content:
        'A los 11 meses, estás en la recta final del primer año de tu bebé, y se nota en sus patrones de sueño. Tu bebé probablemente se sostiene de pie con confianza, posiblemente camina, y demuestra un sentido muy claro de lo que quiere — incluida la hora de dormir. Las protestas ante las siestas pueden ser más vocales y persistentes ahora, no porque tu bebé necesite menos sueño, sino porque su capacidad de expresar preferencias ha crecido junto con su conciencia del mundo.\n\nLa mayoría de los bebés de 11 meses aún necesitan 2 siestas. A pesar de la resistencia ocasional, la biología es clara: pasar a 1 siesta antes de los 14–15 meses suele llevar a un exceso de cansancio crónico, que se manifiesta como despertares tempranos, despertares nocturnos y un bebé que parece nervioso en lugar de cansado. Mantén las 2 siestas y confía en los datos, incluso cuando las batallas parezcan convincentes.\n\nEl lenguaje está empezando a surgir este mes — muchos bebés dicen sus primeras palabras alrededor de los 11–12 meses. La actividad cerebral implicada en la adquisición del lenguaje es considerable, y algunos bebés muestran patrones de sueño más inquietos o ligeros durante estos brotes. Es una alteración temporal ligada a un enorme avance del desarrollo.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'Las ventanas de vigilia a los 11 meses son similares al rango de los 10 meses: 2.75–3.5 horas. Estáis en el mismo tramo de desarrollo, pero tu bebé puede estar acercándose al extremo más largo de cada ventana de forma más consistente a medida que se aproxima a los 12 meses.\n\nSi notas resistencia a la siesta en un momento consistente cada día, comprueba si la ventana de vigilia previa se ha quedado demasiado corta. Un bebé que antes se dormía a las 2.5 horas pero que ahora puede estar despierto 3 horas cómodamente protestará — no porque esté dejando la siesta, sino porque aún no hay suficiente presión de sueño. Extiende la ventana 15 minutos y observa si la conciliación mejora.',
    },
  ],
  tips: [
    {
      title: 'No interpretes las protestas como señal de dejar una siesta',
      description:
        'La resistencia vocal a las siestas a los 11 meses casi siempre se trata de querer seguir en la acción, no de falta genuina de cansancio. La persistencia calmada y consistente con la rutina de siesta gana con el tiempo — tu bebé necesita el sueño incluso cuando insiste en que no.',
    },
    {
      title: 'Limita la siesta 1 para proteger la siesta 2',
      description:
        'Si la primera siesta es demasiado larga (más de 1.5 horas), puede que tu bebé no acumule suficiente presión de sueño para la segunda siesta. Limita suavemente la siesta de la mañana a 1–1.5 horas para mantener accesible la siesta de la tarde.',
    },
    {
      title: 'Incluye un tiempo de transición antes de la cuna',
      description:
        'Un bebé de 11 meses que ha estado jugando activamente necesita tiempo para relajarse neurológicamente. Una rutina de pre-siesta de 10 minutos — oscurecer la habitación, ralentizar la actividad, cantar una canción consistente — le da al cerebro tiempo para cambiar de marcha antes de la cuna.',
    },
    {
      title: 'Celebra los hitos aunque alteren el sueño',
      description:
        'Primeras palabras, primeros pasos, nueva conciencia social — estos saltos alteran temporalmente el sueño y eso es una característica, no un fallo. Tu bebé está exactamente donde debería estar. El sueño se reestabilizará en una o dos semanas después del pico de cada hito.',
    },
  ],
};

// ── 12 Months ───────────────────────────────────────────────────────────────

const MONTH_12_ES: SleepGuideConfig = {
  slug: '12-month-old',
  ageMonths: 12,
  displayLabel: '12 m',
  ageLabel: 'bebé de 12 meses',
  title: 'Horario de sueño de 12 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 12 meses',
  metaDescription:
    'Guía completa del sueño a los 12 meses: 2 siestas, ventanas de vigilia de 3–4h, hora de dormir 18:00–19:30, la regresión de los 12 meses y cuándo considerar la transición a 1 siesta.',
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
    { time: '10:00', label: 'Siesta 1', type: 'nap' },
    { time: '14:30', label: 'Siesta 2', type: 'nap' },
    { time: '19:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 12 meses',
      content:
        'Feliz primer cumpleaños. El hecho de que hayas estado acompañando y apoyando el sueño de tu bebé durante todo un año dice mucho de tu compromiso con su bienestar. A los 12 meses, la mayoría de los bebés están caminando o a punto de hacerlo, dicen un puñado de palabras y muestran rasgos de personalidad bien definidos. Es una edad llena, activa y emocionante — y viene con sus propios retos de sueño.\n\nLa regresión de los 12 meses es real, e impulsada por la misma fuerza que la mayoría de las regresiones: un brote de desarrollo neurológico. Caminar requiere una coordinación, equilibrio y procesamiento espacial extraordinarios que el cerebro está construyendo activamente incluso durante el sueño. Algunos bebés rechazan temporalmente una o ambas siestas, y los despertares nocturnos pueden reaparecer tras largos tramos de sueño consolidado. Es temporal — normalmente 2–4 semanas — y pasa.\n\nA pesar de la regresión, los bebés de 12 meses aún necesitan 2 siestas. El error más común a esta edad es pasar a 1 siesta demasiado pronto porque el horario de 2 siestas parece una batalla. La mayoría de los bebés no están neurológicamente listos para 1 siesta hasta los 14–18 meses. Eliminar prematuramente la siesta de la mañana suele llevar a un exceso de cansancio que es mucho más difícil de gestionar que un periodo difícil de transición de siestas.',
    },
    {
      heading: 'Entender las ventanas de vigilia',
      content:
        'A los 12 meses, las ventanas de vigilia han crecido a 3–4 horas. La primera ventana del día es típicamente de unas 3 horas, mientras que la última ventana antes de dormir puede estirarse a 4 horas para un bebé que ha dormido bien las siestas. Esto significa que el día tiene más margen natural de respiro, y puede que las siestas se sientan más predecibles que en meses anteriores.\n\nCon ventanas más largas viene más riesgo de exceso de cansancio genuino si calculas mal los tiempos. Un bebé de 12 meses que se pierde una siesta o tiene una muy corta puede acumular deuda de sueño significativa rápidamente. Esos días, una hora de dormir más temprana — incluso 30–60 minutos antes de lo habitual — es tu mejor herramienta de recuperación. No existe algo "demasiado temprano" para una hora de dormir cuando tu bebé está demasiado cansado.',
    },
  ],
  tips: [
    {
      title: 'Usa una hora de dormir más temprana como herramienta de recuperación',
      description:
        'Cuando una siesta sale mal — rechazada, cortada o retrasada — compensa con una hora de dormir 30–60 minutos antes de lo habitual. Esto evita que el exceso de cansancio se acumule a lo largo de varios días y protege el sueño del resto de la semana.',
    },
    {
      title: 'Mantén las 2 siestas incluso durante la regresión',
      description:
        'El rechazo de siestas durante la regresión de los 12 meses es una fase, no una señal de desarrollo para eliminar una siesta. Mantén la consistencia con la estructura de 2 siestas, usa siestas en brazos o en cochecito los días difíciles, y el horario regular se reestablecerá solo.',
    },
    {
      title: 'Reconoce su nueva independencia en la rutina',
      description:
        'Un bebé de 12 meses puede participar en la rutina de dormir de formas pequeñas — ponerse su chupete, pasarte el saco de dormir, elegir un cuento. Esta participación reduce la resistencia a dormir dándole a tu bebé sensación de control en el proceso.',
    },
    {
      title: 'Ten en cuenta que las celebraciones del primer cumpleaños pueden alterar el sueño',
      description:
        'Fiestas, visitas y estimulación emocionante en torno al primer cumpleaños pueden desajustar siestas y hora de dormir durante uno o dos días. Planifícalo, protege la siesta después de la fiesta y espera que todo se normalice en 48 horas.',
    },
  ],
  regression: {
    name: 'Regresión del sueño de los 12 meses',
    description:
      'Alrededor de los 12 meses, caminar y el desarrollo del lenguaje pueden alterar los patrones de sueño. Algunos bebés rechazan temporalmente la segunda siesta, pero la mayoría aún necesitan 2 siestas durante unos meses más. Esta regresión suele durar 2–4 semanas.',
  },
};

// ── 13 Months ───────────────────────────────────────────────────────────────

const MONTH_13_ES: SleepGuideConfig = {
  slug: '13-month-old',
  ageMonths: 13,
  displayLabel: '13 m',
  ageLabel: 'bebé de 13 meses',
  title: 'Horario de sueño de 13 meses',
  subtitle: 'Ventanas de vigilia, siestas y hora de dormir para tu bebé de 13 meses',
  metaDescription:
    'Guía completa del sueño a los 13 meses: 2 siestas, ventanas de vigilia de 3.25–4h, hora de dormir sobre las 19:15 y consejos para manejar la resistencia temprana a las siestas.',
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
    { time: '09:45', label: 'Siesta 1 (60–90 min)', type: 'nap' },
    { time: '14:15', label: 'Siesta 2 (60–90 min)', type: 'nap' },
    { time: '19:15', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 13 meses',
      content:
        'Los trece meses son una edad de asentamiento. Los grandes hitos del primer cumpleaños han pasado, y tu pequeño está consolidando su forma de caminar, ampliando su vocabulario y mostrando un sentido creciente de sí mismo. El sueño a esta edad suele ser estable — la mayoría de los bebés de 13 meses están firmemente en un horario de 2 siestas y duermen alrededor de 13.25 horas en total.\n\nPuede que empieces a ver resistencia ocasional a las siestas, especialmente a la siesta de la mañana. Esto suele ser tu pequeño probando su independencia en expansión, no una señal genuina de que esté listo para pasar a 1 siesta. La mayoría de los niños no están listos para esa transición hasta los 14–18 meses, así que mantén las 2 siestas y ajusta las ventanas de vigilia si conciliar el sueño se vuelve más difícil.\n\nLas ventanas de vigilia han crecido a 3.25–4 horas, con la ventana de la mañana típicamente un poco más corta (3.25–3.5 horas) y la ventana antes de dormir estirándose hasta unas 4 horas. Esta ventana más larga de la tarde significa que tu pequeño necesita actividad estimulante para estar contento — juego al aire libre, juego con agua y exploración física ayudan a llenar el tiempo sin crear exceso de cansancio.',
    },
    {
      heading: 'Ajustar el horario',
      content:
        'A los 13 meses, los pequeños ajustes marcan una gran diferencia. Si tu pequeño tarda mucho en dormirse en la siesta 1, prueba a extender la ventana de vigilia de la mañana 15 minutos. Si la siesta 2 se rechaza, comprueba si la siesta 1 fue demasiado larga — limitarla a 90 minutos suele proteger la siesta de la tarde.\n\nEl horario de la cena también empieza a importar ahora. Una comida demasiado cerca de la hora de dormir puede causar molestias, mientras que cenar demasiado pronto significa que tu pequeño tiene hambre al acostarse. Apunta a cenar unos 1–1.5 horas antes de la hora de dormir, con una pequeña toma de leche más cerca del inicio de la rutina de dormir.',
    },
  ],
  tips: [
    {
      title: 'Alarga las ventanas de vigilia gradualmente',
      description:
        'Si tu pequeño se resiste a una siesta, no la elimines — prueba a retrasarla 15–30 minutos. Un pequeño ajuste en la ventana de vigilia suele resolver el problema de conciliación sin eliminar una siesta prematuramente.',
    },
    {
      title: 'Organiza la cena con criterio',
      description:
        'Una cena sustanciosa 1–1.5 horas antes de dormir, seguida de una pequeña toma de leche en la rutina, previene tanto los despertares por hambre como la incomodidad al dormir por un estómago demasiado lleno.',
    },
    {
      title: 'Mantén la rutina de dormir corta y predecible',
      description:
        'A los 13 meses, una rutina de 15–20 minutos es ideal: cena, baño (o lavado), pijama, cuento, leche, canción, cama. La memoria en crecimiento de tu pequeño hace que la previsibilidad en sí misma sea reconfortante.',
    },
    {
      title: 'Resiste la tentación de pasar a 1 siesta demasiado pronto',
      description:
        'La mayoría de los bebés de 13 meses aún necesitan 2 siestas. Pasar a 1 siesta antes de tiempo suele causar exceso de cansancio, despertares tempranos y peor sueño nocturno. Espera a ver señales consistentes durante más de 2 semanas antes de hacer la transición.',
    },
  ],
};

// ── 18 Months ───────────────────────────────────────────────────────────────

const MONTH_18_ES: SleepGuideConfig = {
  slug: '18-month-old',
  ageMonths: 18,
  displayLabel: '18 m',
  ageLabel: 'bebé de 18 meses',
  title: 'Horario de sueño de 18 meses',
  subtitle: 'Ventanas de vigilia, la transición a 1 siesta y la regresión de los 18 meses',
  metaDescription:
    'Navega el horario de sueño a los 18 meses: 1 siesta al mediodía, ventanas de vigilia de 5–5.75h, hora de dormir 18:00–20:00 y cómo manejar la regresión de los 18 meses con calma y confianza.',
  stats: {
    napsPerDay: '1',
    wakeWindow: '5–5.75h',
    bedtime: '18:00–20:00',
    nightSleep: '11+ horas',
    totalDaySleep: '2–3h',
    totalSleep: '13–14h',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '12:00', label: 'Siesta (2–2.5h)', type: 'nap' },
    { time: '20:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 18 meses',
      content:
        'Los dieciocho meses son un gran punto de transición. Si tu pequeño aún no ha pasado a 1 siesta, esto es típicamente cuando ocurre. La siesta única cae en la mitad del día — normalmente alrededor del mediodía — y dura de 2 a 3 horas. Las ventanas de vigilia se han estirado a 5 horas antes de la siesta y 5–5.75 horas antes de dormir, lo cual es una cantidad significativa de tiempo despierto para una persona tan pequeña.\n\nEl horario de 1 siesta tiene una simplicidad preciosa. Las mañanas quedan libres, la siesta es larga y reparadora, y el tramo de la tarde hasta la hora de dormir, aunque largo, es manejable con actividades entretenidas y tiempo al aire libre. Muchos padres descubren que la transición a 1 siesta, una vez que se asienta, en realidad facilita la planificación del día.\n\nLa hora de dormir a los 18 meses suele caer entre las 18:00 y las 20:00, dependiendo de cuándo termine la siesta y la rutina de tu familia. Los días que la siesta es más corta o se salta por completo (pasa), una hora de dormir más temprana es tu mejor aliada. Adelantar la hora de dormir 30–60 minutos en un día de siesta difícil previene la cascada de cansancio excesivo que lleva a despertares nocturnos.',
    },
    {
      heading: 'La regresión del sueño de los 18 meses',
      content:
        'La regresión de los 18 meses es una de las más desafiantes, porque tu pequeño ahora tiene la voluntad y las palabras para luchar contra el sueño más activamente. Puede que veas rechazo de siestas, llanto a la hora de dormir, más despertares nocturnos y a veces despertares tempranos por la mañana. Los factores habituales son un brote de independencia, ansiedad de separación, dentición (los molares suelen salir por estas fechas) y una explosión en el desarrollo del lenguaje.\n\nLa mejor respuesta son límites consistentes y empáticos. Tu pequeño necesita saber que la hora de dormir no es negociable, pero también necesita sentirse seguro y conectado. Mantén la rutina exactamente igual, ofrece una breve reconfortación si está disgustado, y evita introducir nuevas muletas de sueño solo para pasar esta fase. Esta regresión suele durar 2–6 semanas y se resuelve sola cuando el brote de desarrollo se calma.',
    },
  ],
  tips: [
    {
      title: 'Protege la siesta con firmeza',
      description:
        'A los 18 meses, tu pequeño puede insistir en que no necesita siesta. Sí la necesita. El rechazo de siesta a esta edad casi siempre es cuestión de independencia, no de falta genuina de cansancio. Sigue ofreciendo la siesta de forma consistente y tranquila.',
    },
    {
      title: 'Usa una hora de dormir más temprana como red de seguridad',
      description:
        'Los días que la siesta es corta o se salta, adelanta la hora de dormir 30–60 minutos. Un bebé de 18 meses demasiado cansado a la hora de dormir es más difícil de calmar y más propenso a despertarse durante la noche.',
    },
    {
      title: 'Incorpora la conexión en la rutina, no después',
      description:
        'La ansiedad de separación alcanza su pico alrededor de los 18 meses. Mimos extra, una canción especial o una breve charla sobre el día — haz esto durante la rutina, no como táctica de demora después de apagar la luz.',
    },
  ],
  regression: {
    name: 'Regresión del sueño de los 18 meses',
    description:
      'Alrededor de los 18 meses, un brote de independencia, desarrollo del lenguaje, ansiedad de separación y dentición pueden alterar el sueño. Tu pequeño puede pelear las siestas, llorar a la hora de dormir o despertarse más por la noche. Esta fase suele durar 2–6 semanas.',
  },
};

// ── 2 Years ─────────────────────────────────────────────────────────────────

const YEAR_2_ES: SleepGuideConfig = {
  slug: '2-year-old',
  ageMonths: 24,
  displayLabel: '2 años',
  ageLabel: 'niño de 2 años',
  title: 'Horario de sueño de 2 años',
  subtitle: 'Siesta, hora de dormir y la regresión de los 2 años',
  metaDescription:
    'Tu guía completa del sueño a los 2 años: 1 siesta al mediodía (1.5–2h), ventanas de vigilia de 5.5–6h, hora de dormir 19:00–21:00 y cómo navegar la regresión de los 2 años.',
  stats: {
    napsPerDay: '1',
    wakeWindow: '5.5–6h',
    bedtime: '19:00–21:00',
    nightSleep: '10–12h',
    totalDaySleep: '1.5–2h',
    totalSleep: '12+ horas',
  },
  sampleSchedule: [
    { time: '07:00', label: 'Despertar', type: 'wake' },
    { time: '12:30', label: 'Siesta (1.5–2h)', type: 'nap' },
    { time: '20:00', label: 'Hora de dormir', type: 'bedtime' },
  ],
  sections: [
    {
      heading: 'Qué esperar a los 2 años',
      content:
        'Dos años. Tu bebé es ahora un niño hecho y derecho con opiniones, frases y una notable capacidad para negociar a la hora de dormir. El sueño a esta edad suele sumar 12 o más horas en un periodo de 24 horas, repartidas entre una siesta de 1.5–2 horas al mediodía y 10–12 horas de sueño nocturno.\n\nLa resistencia a la siesta es habitual a los 2 años, y puede parecer muy convincente — tu pequeño puede parecer genuinamente que no necesita la siesta. Pero la mayoría de los niños no están listos para eliminarla del todo hasta los 3 años o más tarde. Lo que parece "no tengo sueño" suele ser "estoy demasiado estimulado para calmarme" o "estoy ejerciendo mi independencia." La consistencia es tu herramienta más poderosa aquí. Sigue ofreciendo la siesta a la misma hora cada día, en un entorno tranquilo y oscuro, y la mayoría de los niños de 2 años seguirán durmiendo la siesta.\n\nLas ventanas de vigilia se han estirado a 5.5–6 horas, dándote mañanas y tardes largas y completas. La hora de dormir cae entre las 19:00 y las 21:00 dependiendo de cuándo termine la siesta. El ritmo diario a los 2 es relativamente simple y predecible — lo cual es un regalo tras el caos de la infancia.',
    },
    {
      heading: 'La regresión del sueño de los 2 años',
      content:
        'La regresión de los 2 años se alimenta de las mismas fuerzas que hacen que esta edad sea tan emocionante: lenguaje explosivo, independencia creciente, miedos nuevos (la oscuridad, los monstruos, estar solo) y grandes hitos como empezar a dejar el pañal. Tu pequeño puede retrasar la hora de dormir, llamarte repetidamente después de apagar la luz, rechazar la siesta o empezar a despertarse por la noche después de meses durmiendo de un tirón.\n\nLa clave son límites envueltos en calidez. Reconoce los sentimientos de tu pequeño — "sé que quieres quedarte despierto, y es hora de dormir" — y mantén la posición con calma. Evita introducir hábitos nuevos que luego tendrás que deshacer (acostarte con él hasta que se duerma, llevarle a tu cama si no es tu plan). Esta regresión suele durar 2–4 semanas y pasa cuando la ola de desarrollo se calma.',
    },
  ],
  tips: [
    {
      title: 'No elimines la siesta todavía',
      description:
        'La mayoría de los niños de 2 años aún necesitan siesta, incluso cuando se resisten. Eliminar la siesta demasiado pronto suele causar exceso de cansancio, peor sueño nocturno y más desafíos de comportamiento durante el día. Sigue ofreciéndola de forma consistente.',
    },
    {
      title: 'Usa normas claras y sencillas a la hora de dormir',
      description:
        'A los 2 años, tu pequeño entiende las normas. "Un cuento más y apagamos la luz" o "después de nuestra canción, es hora de dormir." Límites sencillos y predecibles reducen las negociaciones a la hora de dormir y ayudan a tu pequeño a sentirse seguro.',
    },
    {
      title: 'Aborda los miedos nuevos con empatía, no los desestimes',
      description:
        'Si tu pequeño está desarrollando miedo a la oscuridad o a los monstruos, tómalo en serio. Una luz de noche suave, un ritual de "spray antimonstruos" o un peluche especial pueden proporcionar consuelo genuino sin socavar la independencia del sueño.',
    },
    {
      title: 'La consistencia durante la regresión lo es todo',
      description:
        'La regresión de los 2 años pone a prueba tu determinación. Mantén la rutina igual, responde breve y calmadamente a los despertares nocturnos, y confía en que la fase pasará. Tu calma consistente es lo más reconfortante que tu pequeño puede experimentar.',
    },
  ],
  regression: {
    name: 'Regresión del sueño de los 2 años',
    description:
      'Alrededor de los 2 años, la independencia creciente, los miedos nuevos, el desarrollo del lenguaje y hitos como dejar el pañal pueden alterar el sueño. Retrasar la hora de dormir, rechazar la siesta y los despertares nocturnos son habituales. Esta fase suele durar 2–4 semanas.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

const translationMap: Record<string, SleepGuideConfig> = {
  'week-1': WEEK_1_ES,
  'week-2': WEEK_2_ES,
  '1-month-old': MONTH_1_ES,
  '2-month-old': MONTH_2_ES,
  '3-month-old': MONTH_3_ES,
  '4-month-old': MONTH_4_ES,
  '5-month-old': MONTH_5_ES,
  '6-month-old': MONTH_6_ES,
  '7-month-old': MONTH_7_ES,
  '8-month-old': MONTH_8_ES,
  '9-month-old': MONTH_9_ES,
  '10-month-old': MONTH_10_ES,
  '11-month-old': MONTH_11_ES,
  '12-month-old': MONTH_12_ES,
  '13-month-old': MONTH_13_ES,
  '18-month-old': MONTH_18_ES,
  '2-year-old': YEAR_2_ES,
};

export const SLEEP_GUIDE_CONFIGS: SleepGuideConfig[] = SLEEP_GUIDE_CONFIGS_EN.map((cfg) => {
  return translationMap[cfg.slug] ?? cfg;
});
