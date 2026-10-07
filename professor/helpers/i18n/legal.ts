import { Locale } from "./dictionaries";

// Text of the privacy policy and terms pages. Google's OAuth consent screen links to them,
// so keep them in line with what the app actually stores.
export const LEGAL_CONTACT = "lucasbv78910@gmail.com";
export const LEGAL_UPDATED = "2026-10-07";

type Section = { heading: string; paragraphs: string[] };
type LegalText = { title: string; intro: string; sections: Section[] };

export const privacy: Record<Locale, LegalText> = {
    en: {
        title: "Privacy Policy",
        intro: "Profe Rank is a student project that lets students at USFQ and UDLA review their professors and courses. This page explains what we store and why. It is written in plain language and is not legal advice.",
        sections: [
            {
                heading: "What we store",
                paragraphs: [
                    "When you sign in with Google, we receive and store your name, email address and profile picture. We use them only to keep you signed in and to link your reviews to your account.",
                    "We store the reviews you write (ratings and comments), the reports you send about other reviews, and translations of reviews that someone asked to translate.",
                    "We keep a session cookie in your browser so you stay signed in. We do not use advertising or tracking cookies.",
                ],
            },
            {
                heading: "Where course and professor data comes from",
                paragraphs: [
                    "Professor names, course names and class schedules come from the public Banner class schedules that USFQ and UDLA publish. We do not have access to any private university records.",
                ],
            },
            {
                heading: "Who can see your data",
                paragraphs: [
                    "Reviews are public, but they are shown without your name, email or picture. Your name and picture appear only to you, in the page header while you are signed in.",
                    "The site's administrators can see reviews and reports so they can moderate them. We never sell your data or share it with advertisers.",
                    "The site runs on Amazon Web Services (AWS). When someone asks to translate a review, its text is sent to AWS's translation service.",
                ],
            },
            {
                heading: "Your choices",
                paragraphs: [
                    "You can edit or delete your own reviews at any time. To delete your account and all of your data, email us and we will remove it.",
                ],
            },
        ],
    },
    es: {
        title: "Política de privacidad",
        intro: "Profe Rank es un proyecto estudiantil que permite a estudiantes de la USFQ y la UDLA calificar a sus profesores y materias. Esta página explica qué datos guardamos y por qué. Está escrita en lenguaje sencillo y no es asesoría legal.",
        sections: [
            {
                heading: "Qué datos guardamos",
                paragraphs: [
                    "Cuando inicias sesión con Google, recibimos y guardamos tu nombre, correo electrónico y foto de perfil. Solo los usamos para mantener tu sesión abierta y vincular tus reseñas a tu cuenta.",
                    "Guardamos las reseñas que escribes (calificaciones y comentarios), los reportes que envías sobre otras reseñas y las traducciones de reseñas que alguien pidió traducir.",
                    "Usamos una cookie de sesión en tu navegador para que no tengas que volver a iniciar sesión. No usamos cookies de publicidad ni de rastreo.",
                ],
            },
            {
                heading: "De dónde vienen los datos de profesores y materias",
                paragraphs: [
                    "Los nombres de profesores, las materias y los horarios vienen de los horarios públicos de Banner que publican la USFQ y la UDLA. No tenemos acceso a ningún registro privado de las universidades.",
                ],
            },
            {
                heading: "Quién puede ver tus datos",
                paragraphs: [
                    "Las reseñas son públicas, pero se muestran sin tu nombre, correo ni foto. Tu nombre y foto solo los ves tú, en la parte superior de la página mientras tienes la sesión abierta.",
                    "Los administradores del sitio pueden ver las reseñas y los reportes para moderarlos. Nunca vendemos tus datos ni los compartimos con anunciantes.",
                    "El sitio funciona en Amazon Web Services (AWS). Cuando alguien pide traducir una reseña, su texto se envía al servicio de traducción de AWS.",
                ],
            },
            {
                heading: "Tus opciones",
                paragraphs: [
                    "Puedes editar o borrar tus reseñas cuando quieras. Para borrar tu cuenta y todos tus datos, escríbenos por correo y los eliminaremos.",
                ],
            },
        ],
    },
};

export const terms: Record<Locale, LegalText> = {
    en: {
        title: "Terms of Service",
        intro: "Profe Rank is a free student project, not affiliated with USFQ or UDLA. By using the site you agree to these terms. They are written in plain language and are not legal advice.",
        sections: [
            {
                heading: "Your reviews",
                paragraphs: [
                    "Write honest reviews based on your own experience in the class. Do not post insults, threats, hate speech, personal information about anyone, or anything illegal.",
                    "You are responsible for what you write. By posting a review you allow us to show it publicly on the site, and to translate it.",
                ],
            },
            {
                heading: "Moderation",
                paragraphs: [
                    "Anyone signed in can report a review. Administrators may hide or remove reviews that break these rules.",
                ],
            },
            {
                heading: "No guarantees",
                paragraphs: [
                    "Reviews are opinions of students, not of Profe Rank or the universities. Course and professor data comes from public schedules and may be out of date or wrong. The site is provided as is, and it may change or go offline at any time.",
                ],
            },
            {
                heading: "Changes",
                paragraphs: [
                    "We may update these terms. The date at the bottom of this page shows the latest version.",
                ],
            },
        ],
    },
    es: {
        title: "Términos de servicio",
        intro: "Profe Rank es un proyecto estudiantil gratuito, sin relación oficial con la USFQ ni la UDLA. Al usar el sitio aceptas estos términos. Están escritos en lenguaje sencillo y no son asesoría legal.",
        sections: [
            {
                heading: "Tus reseñas",
                paragraphs: [
                    "Escribe reseñas honestas basadas en tu propia experiencia en la clase. No publiques insultos, amenazas, discursos de odio, datos personales de nadie ni nada ilegal.",
                    "Eres responsable de lo que escribes. Al publicar una reseña nos permites mostrarla públicamente en el sitio y traducirla.",
                ],
            },
            {
                heading: "Moderación",
                paragraphs: [
                    "Cualquier persona con sesión iniciada puede reportar una reseña. Los administradores pueden ocultar o eliminar reseñas que rompan estas reglas.",
                ],
            },
            {
                heading: "Sin garantías",
                paragraphs: [
                    "Las reseñas son opiniones de estudiantes, no de Profe Rank ni de las universidades. Los datos de materias y profesores vienen de horarios públicos y pueden estar desactualizados o tener errores. El sitio se ofrece tal como está y puede cambiar o dejar de funcionar en cualquier momento.",
                ],
            },
            {
                heading: "Cambios",
                paragraphs: [
                    "Podemos actualizar estos términos. La fecha al final de esta página indica la versión más reciente.",
                ],
            },
        ],
    },
};
