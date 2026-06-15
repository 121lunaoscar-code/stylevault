import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code:"es", label:"Español", flag:"🇲🇽", dir:"ltr" },
  { code:"en", label:"English", flag:"🇺🇸", dir:"ltr" },
  { code:"pt", label:"Português", flag:"🇧🇷", dir:"ltr" },
  { code:"fr", label:"Français", flag:"🇫🇷", dir:"ltr" },
  { code:"de", label:"Deutsch", flag:"🇩🇪", dir:"ltr" },
  { code:"zh", label:"中文", flag:"🇨🇳", dir:"ltr" },
  { code:"ar", label:"العربية", flag:"🇸🇦", dir:"rtl" },
  { code:"hi", label:"हिन्दी", flag:"🇮🇳", dir:"ltr" },
  { code:"ja", label:"日本語", flag:"🇯🇵", dir:"ltr" },
  { code:"ru", label:"Русский", flag:"🇷🇺", dir:"ltr" },
];

type LangCode = "es"|"en"|"pt"|"fr"|"de"|"zh"|"ar"|"hi"|"ja"|"ru";

const T: Record<LangCode, Record<string, string | string[]>> = {
  es: {
    // Auth
    appName:"STYLEVAULT", appSub:"Armario Inteligente con IA",
    login:"Iniciar Sesión", register:"Registrarse", enter:"Entrar", createAccount:"Crear Cuenta",
    email:"Correo electrónico", password:"Contraseña", fullName:"Tu nombre completo",
    forgotPassword:"¿Olvidaste tu contraseña?", recoverEmail:"Revisa tu correo para recuperar tu contraseña",
    wrongCredentials:"Correo o contraseña incorrectos.", profileNotFound:"Perfil no encontrado.",
    blocked:"Tu cuenta está bloqueada.", connectionError:"Error de conexión.", fillAll:"Completa todos los campos.",
    newPassword:"Nueva Contraseña", newPasswordPlaceholder:"Nueva contraseña (mínimo 6 caracteres)",
    updating:"Actualizando...", updatePassword:"Actualizar Contraseña", backToLogin:"Volver al inicio",
    passwordUpdated:"✅ Contraseña actualizada. Ahora puedes iniciar sesión.",
    passwordError:"Error al actualizar. El link puede haber expirado.",
    // Gender
    howDoYouIdentify:"¿Cómo te identificas?", woman:"Mujer", man:"Hombre", other:"Otro",
    // Nav
    home:"Inicio", wardrobe:"Armario", outfitIA:"Outfit IA", advisorIA:"Asesor IA", trips:"Viajes",
    // Header
    armarioInteligente:"Armario Inteligente", exit:"Salir",
    // Onboarding
    createAvatar:"Crea tu Avatar IA", avatarSub:"Tu estilista personal necesita conocerte para crear una versión digital de ti.",
    begin:"Comenzar →", skip:"Omitir — configurar después",
    basicInfo:"Información básica", basicInfoSub:"Solo lo que la IA no puede detectar por sí sola",
    name:"Nombre", age:"Edad", height:"Altura (cm)", weight:"Peso aprox. (kg)", eyeColor:"Color de ojos",
    hairType:"Tipo de cabello", straight:"Lacio", wavy:"Ondulado", curly:"Rizado", afro:"Afro",
    continueBtn:"Continuar →", back:"← Atrás",
    smartScan:"Escaneo Inteligente", smartScanSub:"3 fotos para crear tu avatar con máxima precisión",
    photo1:"Foto 1 · Selfie frontal", photo2:"Foto 2 · Cuerpo completo frontal", photo3:"Foto 3 · Cuerpo completo lateral",
    analyzeAI:"🧬 Analizar con IA", tapToChange:"Toca para cambiar",
    analyzing1:"Analizando rasgos faciales...", analyzing2:"Analizando tipo de cuerpo y proporciones...",
    analyzing3:"Analizando tono de piel y colores ideales...", analyzing4:"Creando tu Fashion DNA™...",
    dnaReady:"¡Tu Fashion DNA™ está listo!", upload3Photos:"Sube las 3 fotos para continuar",
    avatarReady:"Tu Avatar IA está listo", precisionLevel:"Nivel de precisión:",
    viewWardrobe:"Ver mi Armario →", createFirstOutfit:"Crear mi primer outfit",
    // DNA
    fashionDNA:"Fashion DNA™", fashionDNASub:"Tu perfil de moda personalizado",
    bodyAnalysis:"✦ Análisis corporal", bodyType:"Tipo de cuerpo", skinTone:"Tono de piel",
    undertone:"Subtono", faceShape:"Forma del rostro", neckType:"Tipo de cuello", posture:"Postura",
    proportions:"Proporciones", favorableColors:"✦ Colores que te favorecen", avoidColors:"Colores a evitar",
    recommendedClothes:"✦ Prendas recomendadas", avoidClothes:"Prendas a evitar",
    personalTips:"✦ Consejos personales", updateDNA:"🔄 Actualizar mi Fashion DNA™",
    noDNA:"Aún no has creado tu Fashion DNA™", createDNA:"Crear mi Fashion DNA™",
    // Home
    hello:"Hola,", styleReady:"Tu estilo personal está listo", wardrobeReady:"Tu armario inteligente te espera",
    items:"Prendas", favorites:"Favoritas", outfits:"Outfits", yourDNA:"✦ Tu Fashion DNA™",
    viewComplete:"Ver completo →", createProfile:"Crea tu perfil para recomendaciones personalizadas",
    create:"Crear →", outfitOfDay:"Outfit del día", personalizedForYou:"Personalizado para ti ✦",
    addItemsFirst:"Agrega prendas para generar outfits", tapCreate:"Toca 'Crear' para generar tu outfit",
    virtualTry:"✦ Prueba Virtual", seeHowItFits:"Ve cómo te queda el outfit", basedOnDNA:"Basado en tu Fashion DNA™ personal",
    tryNow:"Probar ahora →", seePremium:"Ver función Premium →", recentItems:"Prendas recientes", viewAll:"Ver todas →",
    // Wardrobe
    myWardrobe:"Mi Armario", addItem:"+ Agregar", newItem:"✦ Nueva Prenda",
    photoAI:"Foto → IA analiza automáticamente", gallery:"📁 Galería", camera:"📷 Cámara",
    itemName:"Nombre de la prenda", occasion:"Ocasión", season:"Temporada",
    save:"Guardar", cancel:"Cancelar", wardrobeEmpty:"Tu armario está vacío", noItemsInCat:"Sin prendas en esta categoría",
    addCat:"+ Cat", newCategory:"Nueva categoría...", analyzing:"Analizando...", itemSaved:"✦ Prenda guardada", itemAnalyzed:"✦ Prenda analizada con IA",
    // Outfit
    whereTo:"¿A dónde iremos hoy?", whereToSub:"Cuéntame el lugar o evento y crearé el outfit perfecto para ti",
    withMyWardrobe:"Con mi armario", withMyWardrobeDesc:"Usar únicamente las prendas que tengo guardadas",
    noWardrobe:"Sin mi armario", noWardrobeDesc:"Generar recomendaciones con prendas nuevas y tendencias",
    mixedWardrobe:"Mi armario + IA", mixedWardrobeDesc:"Combinar mis prendas con nuevas sugerencias",
    generateOutfit:"✨ Generar mi Outfit Perfecto", generatingOutfit:"Generando tu outfit...",
    step1:"Analizando tu ocasión...", step2:"Consultando tu Fashion DNA™...", step3:"Seleccionando prendas perfectas...",
    yourStylist:"✦ Tu Estilista Personal", compatibleWith:"Compatible contigo", yourFullOutfit:"Tu outfit completo",
    yourWardrobe:"Tu armario", recommendedAccessories:"Accesorios recomendados", colorPalette:"Paleta de colores",
    stylistAdvice:"Consejo del estilista", saveOutfit:"💾 Guardar outfit", newOutfit:"🔄 Nuevo outfit",
    generateAnother:"✨ Generar otra opción", savedOutfits:"Outfits guardados", outfitSaved:"✦ Outfit guardado",
    classicGenerator:"Generador por evento", selectEvent:"Selecciona evento y temporada",
    forWhatEvent:"¿Para qué evento?", generateClassic:"✦  Generar Outfit con IA", creatingOutfit:"Creando outfit...",
    whyItWorks:"✦ Por qué funciona", palette:"Paleta", addItemsWardrobe:"Agrega prendas a tu armario primero",
    // Avatar
    virtualTryTitle:"Prueba Virtual", basedOnDNASub:"Basada en tu Fashion DNA™", premiumOnly:"Función exclusiva Premium",
    premiumFunction:"Función Premium", premiumDesc:"Prueba virtualmente cualquier outfit de tu armario basado en tu Fashion DNA™ personal.",
    upgradePremium:"✦  Mejorar a Premium — $9.99/mes", createDNAFirst:"Primero crea tu Fashion DNA™",
    dnaDetected:"✓ Fashion DNA™ detectado", selectItemsTry:"Selecciona prendas para probar",
    itemsSelected:"prenda(s) seleccionada(s)", tryVirtually:"🧍 Probar outfit virtualmente",
    generatingVirtual:"Generando prueba virtual...", howItWouldLook:"✦ Cómo te quedaría",
    // Advisor
    advisorTitle:"Asesor IA", advisorSub:"Powered by Claude AI · Personalizado con tu DNA",
    advisorGreeting:"Hola, soy tu **asesor de estilo personal**. Puedo ayudarte con combinaciones, dress codes, tendencias y mucho más.\n\n¿En qué te ayudo hoy?",
    askAboutFashion:"Pregunta sobre moda, estilo, tendencias...", send:"Enviar",
    s1:"¿Qué colores van con mi tono de piel?", s2:"Armario cápsula para mi tipo de cuerpo",
    s3:"¿Cómo vestir para entrevista?", s4:"Prendas que me favorecen más",
    // Trips
    tripTitle:"Planificador de Viaje", tripSub:"La IA organiza tu maleta con tu armario",
    destination:"¿A dónde vas? (París, Cancún...)", days:"Días", climate:"Clima",
    planBag:"✈  Planificar Maleta con IA", planning:"Planificando...", missingItems:"⚠ Te falta comprar",
    urgent:"Urgente", stylistTip:"✦ Consejo del estilista",
    // Premium
    premium:"Premium", basic:"Basic",
    all:"Todo",
    withWardrobeQuestion:"¿Con qué armario creamos el outfit?",
    outfitPlaceholder:"Ej: Cena romántica en restaurante elegante\nEntrevista de trabajo para gerente\nFiesta en la playa\nViaje a Nueva York por 5 días...",
    outfitChips:["Cena romántica","Entrevista de trabajo","Fiesta elegante","Día casual","Reunión de negocios","Viaje"],
    climateOptions:["Caluroso","Templado","Frío","Lluvioso","Variable"],
    tripTypes:["Turismo","Playa","Montaña","Negocios","Romántico","Aventura"],
  },
  en: {
    appName:"STYLEVAULT", appSub:"AI Smart Wardrobe",
    login:"Sign In", register:"Sign Up", enter:"Enter", createAccount:"Create Account",
    email:"Email address", password:"Password", fullName:"Your full name",
    forgotPassword:"Forgot your password?", recoverEmail:"Check your email to recover your password",
    wrongCredentials:"Wrong email or password.", profileNotFound:"Profile not found.",
    blocked:"Your account is blocked.", connectionError:"Connection error.", fillAll:"Please fill all fields.",
    newPassword:"New Password", newPasswordPlaceholder:"New password (minimum 6 characters)",
    updating:"Updating...", updatePassword:"Update Password", backToLogin:"Back to login",
    passwordUpdated:"✅ Password updated. You can now sign in.",
    passwordError:"Update failed. The link may have expired.",
    howDoYouIdentify:"How do you identify?", woman:"Woman", man:"Man", other:"Other",
    home:"Home", wardrobe:"Wardrobe", outfitIA:"Outfit AI", advisorIA:"AI Advisor", trips:"Trips",
    armarioInteligente:"Smart Wardrobe", exit:"Sign out",
    createAvatar:"Create your AI Avatar", avatarSub:"Your personal stylist needs to know you to create your digital version.",
    begin:"Get started →", skip:"Skip — set up later",
    basicInfo:"Basic info", basicInfoSub:"Only what AI can't detect on its own",
    name:"Name", age:"Age", height:"Height (cm)", weight:"Approx. weight (kg)", eyeColor:"Eye color",
    hairType:"Hair type", straight:"Straight", wavy:"Wavy", curly:"Curly", afro:"Afro",
    continueBtn:"Continue →", back:"← Back",
    smartScan:"Smart Scan", smartScanSub:"3 photos to create your avatar with maximum precision",
    photo1:"Photo 1 · Front selfie", photo2:"Photo 2 · Full body front", photo3:"Photo 3 · Full body side",
    analyzeAI:"🧬 Analyze with AI", tapToChange:"Tap to change",
    analyzing1:"Analyzing facial features...", analyzing2:"Analyzing body type and proportions...",
    analyzing3:"Analyzing skin tone and ideal colors...", analyzing4:"Creating your Fashion DNA™...",
    dnaReady:"Your Fashion DNA™ is ready!", upload3Photos:"Upload all 3 photos to continue",
    avatarReady:"Your AI Avatar is ready", precisionLevel:"Precision level:",
    viewWardrobe:"View my Wardrobe →", createFirstOutfit:"Create my first outfit",
    fashionDNA:"Fashion DNA™", fashionDNASub:"Your personalized fashion profile",
    bodyAnalysis:"✦ Body analysis", bodyType:"Body type", skinTone:"Skin tone",
    undertone:"Undertone", faceShape:"Face shape", neckType:"Neck type", posture:"Posture",
    proportions:"Proportions", favorableColors:"✦ Colors that suit you", avoidColors:"Colors to avoid",
    recommendedClothes:"✦ Recommended clothes", avoidClothes:"Clothes to avoid",
    personalTips:"✦ Personal tips", updateDNA:"🔄 Update my Fashion DNA™",
    noDNA:"You haven't created your Fashion DNA™ yet", createDNA:"Create my Fashion DNA™",
    hello:"Hello,", styleReady:"Your personal style is ready", wardrobeReady:"Your smart wardrobe awaits",
    items:"Items", favorites:"Favorites", outfits:"Outfits", yourDNA:"✦ Your Fashion DNA™",
    viewComplete:"View full →", createProfile:"Create your profile for personalized recommendations",
    create:"Create →", outfitOfDay:"Outfit of the day", personalizedForYou:"Personalized for you ✦",
    addItemsFirst:"Add items to generate outfits", tapCreate:"Tap 'Create' to generate your outfit",
    virtualTry:"✦ Virtual Try-On", seeHowItFits:"See how the outfit fits you", basedOnDNA:"Based on your personal Fashion DNA™",
    tryNow:"Try now →", seePremium:"See Premium feature →", recentItems:"Recent items", viewAll:"View all →",
    myWardrobe:"My Wardrobe", addItem:"+ Add", newItem:"✦ New Item",
    photoAI:"Photo → AI analyzes automatically", gallery:"📁 Gallery", camera:"📷 Camera",
    itemName:"Item name", occasion:"Occasion", season:"Season",
    save:"Save", cancel:"Cancel", wardrobeEmpty:"Your wardrobe is empty", noItemsInCat:"No items in this category",
    addCat:"+ Cat", newCategory:"New category...", analyzing:"Analyzing...", itemSaved:"✦ Item saved", itemAnalyzed:"✦ Item analyzed with AI",
    whereTo:"Where are we going today?", whereToSub:"Tell me the place or event and I'll create the perfect outfit for you",
    withMyWardrobe:"With my wardrobe", withMyWardrobeDesc:"Use only the items I have saved",
    noWardrobe:"Without my wardrobe", noWardrobeDesc:"Generate recommendations with new items and trends",
    mixedWardrobe:"My wardrobe + AI", mixedWardrobeDesc:"Combine my items with new suggestions",
    generateOutfit:"✨ Generate my Perfect Outfit", generatingOutfit:"Generating your outfit...",
    step1:"Analyzing your occasion...", step2:"Consulting your Fashion DNA™...", step3:"Selecting perfect items...",
    yourStylist:"✦ Your Personal Stylist", compatibleWith:"Compatible with you", yourFullOutfit:"Your complete outfit",
    yourWardrobe:"Your wardrobe", recommendedAccessories:"Recommended accessories", colorPalette:"Color palette",
    stylistAdvice:"Stylist tip", saveOutfit:"💾 Save outfit", newOutfit:"🔄 New outfit",
    generateAnother:"✨ Generate another option", savedOutfits:"Saved outfits", outfitSaved:"✦ Outfit saved",
    classicGenerator:"Event generator", selectEvent:"Select event and season",
    forWhatEvent:"For what event?", generateClassic:"✦  Generate Outfit with AI", creatingOutfit:"Creating outfit...",
    whyItWorks:"✦ Why it works", palette:"Palette", addItemsWardrobe:"Add items to your wardrobe first",
    virtualTryTitle:"Virtual Try-On", basedOnDNASub:"Based on your Fashion DNA™", premiumOnly:"Exclusive Premium feature",
    premiumFunction:"Premium Feature", premiumDesc:"Virtually try any outfit from your wardrobe based on your personal Fashion DNA™.",
    upgradePremium:"✦  Upgrade to Premium — $9.99/mo", createDNAFirst:"First create your Fashion DNA™",
    dnaDetected:"✓ Fashion DNA™ detected", selectItemsTry:"Select items to try on",
    itemsSelected:"item(s) selected", tryVirtually:"🧍 Try outfit virtually",
    generatingVirtual:"Generating virtual try-on...", howItWouldLook:"✦ How it would look on you",
    advisorTitle:"AI Advisor", advisorSub:"Powered by Claude AI · Personalized with your DNA",
    advisorGreeting:"Hi, I'm your **personal style advisor**. I can help you with combinations, dress codes, trends and more.\n\nHow can I help you today?",
    askAboutFashion:"Ask about fashion, style, trends...", send:"Send",
    s1:"What colors match my skin tone?", s2:"Capsule wardrobe for my body type",
    s3:"How to dress for an interview?", s4:"Items that suit me most",
    tripTitle:"Trip Planner", tripSub:"AI organizes your bag with your wardrobe",
    destination:"Where are you going? (Paris, New York...)", days:"Days", climate:"Climate",
    planBag:"✈  Plan my bag with AI", planning:"Planning...", missingItems:"⚠ You need to buy",
    urgent:"Urgent", stylistTip:"✦ Stylist tip",
    premium:"Premium", basic:"Basic",
    all:"All",
    withWardrobeQuestion:"Which wardrobe do we use for the outfit?",
    outfitPlaceholder:"e.g. Romantic dinner at elegant restaurant\nJob interview for manager\nBeach party\nTrip to New York for 5 days...",
    outfitChips:["Romantic dinner","Job interview","Elegant party","Casual day","Business meeting","Travel"],
    climateOptions:["Hot","Mild","Cold","Rainy","Variable"],
    tripTypes:["Tourism","Beach","Mountain","Business","Romantic","Adventure"],
  },
  pt: {
    appName:"STYLEVAULT", appSub:"Guarda-Roupa Inteligente com IA",
    login:"Entrar", register:"Cadastrar", enter:"Entrar", createAccount:"Criar Conta",
    email:"E-mail", password:"Senha", fullName:"Seu nome completo",
    forgotPassword:"Esqueceu sua senha?", recoverEmail:"Verifique seu e-mail para recuperar sua senha",
    wrongCredentials:"E-mail ou senha incorretos.", profileNotFound:"Perfil não encontrado.",
    blocked:"Sua conta está bloqueada.", connectionError:"Erro de conexão.", fillAll:"Preencha todos os campos.",
    newPassword:"Nova Senha", newPasswordPlaceholder:"Nova senha (mínimo 6 caracteres)",
    updating:"Atualizando...", updatePassword:"Atualizar Senha", backToLogin:"Voltar ao início",
    passwordUpdated:"✅ Senha atualizada. Agora você pode entrar.",
    passwordError:"Erro ao atualizar. O link pode ter expirado.",
    howDoYouIdentify:"Como você se identifica?", woman:"Mulher", man:"Homem", other:"Outro",
    home:"Início", wardrobe:"Guarda-Roupa", outfitIA:"Outfit IA", advisorIA:"Consultor IA", trips:"Viagens",
    armarioInteligente:"Guarda-Roupa Inteligente", exit:"Sair",
    createAvatar:"Crie seu Avatar IA", avatarSub:"Seu estilista pessoal precisa te conhecer para criar sua versão digital.",
    begin:"Começar →", skip:"Pular — configurar depois",
    basicInfo:"Informações básicas", basicInfoSub:"Apenas o que a IA não pode detectar sozinha",
    name:"Nome", age:"Idade", height:"Altura (cm)", weight:"Peso aprox. (kg)", eyeColor:"Cor dos olhos",
    hairType:"Tipo de cabelo", straight:"Liso", wavy:"Ondulado", curly:"Cacheado", afro:"Afro",
    continueBtn:"Continuar →", back:"← Voltar",
    smartScan:"Escaneamento Inteligente", smartScanSub:"3 fotos para criar seu avatar com máxima precisão",
    photo1:"Foto 1 · Selfie frontal", photo2:"Foto 2 · Corpo inteiro frontal", photo3:"Foto 3 · Corpo inteiro lateral",
    analyzeAI:"🧬 Analisar com IA", tapToChange:"Toque para alterar",
    analyzing1:"Analisando traços faciais...", analyzing2:"Analisando tipo de corpo e proporções...",
    analyzing3:"Analisando tom de pele e cores ideais...", analyzing4:"Criando seu Fashion DNA™...",
    dnaReady:"Seu Fashion DNA™ está pronto!", upload3Photos:"Envie as 3 fotos para continuar",
    avatarReady:"Seu Avatar IA está pronto", precisionLevel:"Nível de precisão:",
    viewWardrobe:"Ver meu Guarda-Roupa →", createFirstOutfit:"Criar meu primeiro outfit",
    fashionDNA:"Fashion DNA™", fashionDNASub:"Seu perfil de moda personalizado",
    bodyAnalysis:"✦ Análise corporal", bodyType:"Tipo de corpo", skinTone:"Tom de pele",
    undertone:"Subtom", faceShape:"Formato do rosto", neckType:"Tipo de pescoço", posture:"Postura",
    proportions:"Proporções", favorableColors:"✦ Cores que te favorecem", avoidColors:"Cores a evitar",
    recommendedClothes:"✦ Roupas recomendadas", avoidClothes:"Roupas a evitar",
    personalTips:"✦ Dicas personalizadas", updateDNA:"🔄 Atualizar meu Fashion DNA™",
    noDNA:"Você ainda não criou seu Fashion DNA™", createDNA:"Criar meu Fashion DNA™",
    hello:"Olá,", styleReady:"Seu estilo pessoal está pronto", wardrobeReady:"Seu guarda-roupa inteligente te espera",
    items:"Peças", favorites:"Favoritas", outfits:"Outfits", yourDNA:"✦ Seu Fashion DNA™",
    viewComplete:"Ver completo →", createProfile:"Crie seu perfil para recomendações personalizadas",
    create:"Criar →", outfitOfDay:"Outfit do dia", personalizedForYou:"Personalizado para você ✦",
    addItemsFirst:"Adicione peças para gerar outfits", tapCreate:"Toque em 'Criar' para gerar seu outfit",
    virtualTry:"✦ Prova Virtual", seeHowItFits:"Veja como fica o outfit", basedOnDNA:"Baseado no seu Fashion DNA™ pessoal",
    tryNow:"Experimentar agora →", seePremium:"Ver função Premium →", recentItems:"Peças recentes", viewAll:"Ver todas →",
    myWardrobe:"Meu Guarda-Roupa", addItem:"+ Adicionar", newItem:"✦ Nova Peça",
    photoAI:"Foto → IA analisa automaticamente", gallery:"📁 Galeria", camera:"📷 Câmera",
    itemName:"Nome da peça", occasion:"Ocasião", season:"Temporada",
    save:"Salvar", cancel:"Cancelar", wardrobeEmpty:"Seu guarda-roupa está vazio", noItemsInCat:"Sem peças nesta categoria",
    addCat:"+ Cat", newCategory:"Nova categoria...", analyzing:"Analisando...", itemSaved:"✦ Peça salva", itemAnalyzed:"✦ Peça analisada com IA",
    whereTo:"Para onde vamos hoje?", whereToSub:"Me conte o lugar ou evento e criarei o outfit perfeito para você",
    withMyWardrobe:"Com meu guarda-roupa", withMyWardrobeDesc:"Usar apenas as peças que tenho salvas",
    noWardrobe:"Sem meu guarda-roupa", noWardrobeDesc:"Gerar recomendações com peças novas e tendências",
    mixedWardrobe:"Meu guarda-roupa + IA", mixedWardrobeDesc:"Combinar minhas peças com novas sugestões",
    generateOutfit:"✨ Gerar meu Outfit Perfeito", generatingOutfit:"Gerando seu outfit...",
    step1:"Analisando sua ocasião...", step2:"Consultando seu Fashion DNA™...", step3:"Selecionando peças perfeitas...",
    yourStylist:"✦ Seu Estilista Pessoal", compatibleWith:"Compatível com você", yourFullOutfit:"Seu outfit completo",
    yourWardrobe:"Seu guarda-roupa", recommendedAccessories:"Acessórios recomendados", colorPalette:"Paleta de cores",
    stylistAdvice:"Dica do estilista", saveOutfit:"💾 Salvar outfit", newOutfit:"🔄 Novo outfit",
    generateAnother:"✨ Gerar outra opção", savedOutfits:"Outfits salvos", outfitSaved:"✦ Outfit salvo",
    classicGenerator:"Gerador por evento", selectEvent:"Selecione o evento e temporada",
    forWhatEvent:"Para qual evento?", generateClassic:"✦  Gerar Outfit com IA", creatingOutfit:"Criando outfit...",
    whyItWorks:"✦ Por que funciona", palette:"Paleta", addItemsWardrobe:"Adicione peças ao seu guarda-roupa primeiro",
    virtualTryTitle:"Prova Virtual", basedOnDNASub:"Baseada no seu Fashion DNA™", premiumOnly:"Função exclusiva Premium",
    premiumFunction:"Função Premium", premiumDesc:"Experimente virtualmente qualquer outfit do seu guarda-roupa baseado no seu Fashion DNA™ pessoal.",
    upgradePremium:"✦  Upgrade para Premium — R$49/mês", createDNAFirst:"Primeiro crie seu Fashion DNA™",
    dnaDetected:"✓ Fashion DNA™ detectado", selectItemsTry:"Selecione peças para experimentar",
    itemsSelected:"peça(s) selecionada(s)", tryVirtually:"🧍 Experimentar outfit virtualmente",
    generatingVirtual:"Gerando prova virtual...", howItWouldLook:"✦ Como ficaria em você",
    advisorTitle:"Consultor IA", advisorSub:"Powered by Claude AI · Personalizado com seu DNA",
    advisorGreeting:"Olá, sou seu **consultor de estilo pessoal**. Posso ajudá-lo com combinações, dress codes, tendências e muito mais.\n\nComo posso ajudar você hoje?",
    askAboutFashion:"Pergunte sobre moda, estilo, tendências...", send:"Enviar",
    s1:"Quais cores combinam com meu tom de pele?", s2:"Guarda-roupa cápsula para meu tipo de corpo",
    s3:"Como se vestir para uma entrevista?", s4:"Peças que mais me favorecem",
    tripTitle:"Planejador de Viagem", tripSub:"A IA organiza sua mala com seu guarda-roupa",
    destination:"Para onde você vai? (Paris, Rio de Janeiro...)", days:"Dias", climate:"Clima",
    planBag:"✈  Planejar mala com IA", planning:"Planejando...", missingItems:"⚠ Você precisa comprar",
    urgent:"Urgente", stylistTip:"✦ Dica do estilista",
    premium:"Premium", basic:"Basic",
    all:"Todos",
    withWardrobeQuestion:"Com qual guarda-roupa criamos o outfit?",
    outfitPlaceholder:"Ex: Jantar romântico em restaurante elegante\nEntrevista de emprego\nFesta na praia\nViagem ao Rio por 5 dias...",
    outfitChips:["Jantar romântico","Entrevista de trabalho","Festa elegante","Dia casual","Reunião de negócios","Viagem"],
    climateOptions:["Quente","Temperado","Frio","Chuvoso","Variável"],
    tripTypes:["Turismo","Praia","Montanha","Negócios","Romântico","Aventura"],
  },
  fr: {
    appName:"STYLEVAULT", appSub:"Garde-Robe Intelligente par IA",
    login:"Se connecter", register:"S'inscrire", enter:"Entrer", createAccount:"Créer un compte",
    email:"Adresse e-mail", password:"Mot de passe", fullName:"Votre nom complet",
    forgotPassword:"Mot de passe oublié ?", recoverEmail:"Vérifiez votre e-mail pour récupérer votre mot de passe",
    wrongCredentials:"E-mail ou mot de passe incorrect.", profileNotFound:"Profil introuvable.",
    blocked:"Votre compte est bloqué.", connectionError:"Erreur de connexion.", fillAll:"Remplissez tous les champs.",
    newPassword:"Nouveau mot de passe", newPasswordPlaceholder:"Nouveau mot de passe (minimum 6 caractères)",
    updating:"Mise à jour...", updatePassword:"Mettre à jour le mot de passe", backToLogin:"Retour à l'accueil",
    passwordUpdated:"✅ Mot de passe mis à jour. Vous pouvez maintenant vous connecter.",
    passwordError:"Échec de la mise à jour. Le lien a peut-être expiré.",
    howDoYouIdentify:"Comment vous identifiez-vous ?", woman:"Femme", man:"Homme", other:"Autre",
    home:"Accueil", wardrobe:"Garde-Robe", outfitIA:"Tenue IA", advisorIA:"Conseiller IA", trips:"Voyages",
    armarioInteligente:"Garde-Robe Intelligente", exit:"Se déconnecter",
    createAvatar:"Créez votre Avatar IA", avatarSub:"Votre styliste personnel a besoin de vous connaître pour créer votre version digitale.",
    begin:"Commencer →", skip:"Passer — configurer plus tard",
    basicInfo:"Informations de base", basicInfoSub:"Seulement ce que l'IA ne peut pas détecter seule",
    name:"Nom", age:"Âge", height:"Taille (cm)", weight:"Poids approx. (kg)", eyeColor:"Couleur des yeux",
    hairType:"Type de cheveux", straight:"Lisse", wavy:"Ondulé", curly:"Frisé", afro:"Afro",
    continueBtn:"Continuer →", back:"← Retour",
    smartScan:"Scan Intelligent", smartScanSub:"3 photos pour créer votre avatar avec une précision maximale",
    photo1:"Photo 1 · Selfie frontal", photo2:"Photo 2 · Corps entier de face", photo3:"Photo 3 · Corps entier de profil",
    analyzeAI:"🧬 Analyser avec IA", tapToChange:"Appuyez pour changer",
    analyzing1:"Analyse des traits du visage...", analyzing2:"Analyse du type de corps et des proportions...",
    analyzing3:"Analyse du teint et des couleurs idéales...", analyzing4:"Création de votre Fashion DNA™...",
    dnaReady:"Votre Fashion DNA™ est prêt !", upload3Photos:"Téléchargez les 3 photos pour continuer",
    avatarReady:"Votre Avatar IA est prêt", precisionLevel:"Niveau de précision :",
    viewWardrobe:"Voir ma Garde-Robe →", createFirstOutfit:"Créer ma première tenue",
    fashionDNA:"Fashion DNA™", fashionDNASub:"Votre profil mode personnalisé",
    bodyAnalysis:"✦ Analyse corporelle", bodyType:"Type de corps", skinTone:"Teint",
    undertone:"Sous-teinte", faceShape:"Forme du visage", neckType:"Type de cou", posture:"Posture",
    proportions:"Proportions", favorableColors:"✦ Couleurs qui vous vont", avoidColors:"Couleurs à éviter",
    recommendedClothes:"✦ Vêtements recommandés", avoidClothes:"Vêtements à éviter",
    personalTips:"✦ Conseils personnalisés", updateDNA:"🔄 Mettre à jour mon Fashion DNA™",
    noDNA:"Vous n'avez pas encore créé votre Fashion DNA™", createDNA:"Créer mon Fashion DNA™",
    hello:"Bonjour,", styleReady:"Votre style personnel est prêt", wardrobeReady:"Votre garde-robe intelligente vous attend",
    items:"Pièces", favorites:"Favoris", outfits:"Tenues", yourDNA:"✦ Votre Fashion DNA™",
    viewComplete:"Voir complet →", createProfile:"Créez votre profil pour des recommandations personnalisées",
    create:"Créer →", outfitOfDay:"Tenue du jour", personalizedForYou:"Personnalisée pour vous ✦",
    addItemsFirst:"Ajoutez des pièces pour générer des tenues", tapCreate:"Appuyez sur 'Créer' pour générer votre tenue",
    virtualTry:"✦ Essayage Virtuel", seeHowItFits:"Voyez comment la tenue vous va", basedOnDNA:"Basé sur votre Fashion DNA™ personnel",
    tryNow:"Essayer maintenant →", seePremium:"Voir la fonction Premium →", recentItems:"Pièces récentes", viewAll:"Voir tout →",
    myWardrobe:"Ma Garde-Robe", addItem:"+ Ajouter", newItem:"✦ Nouvelle Pièce",
    photoAI:"Photo → IA analyse automatiquement", gallery:"📁 Galerie", camera:"📷 Caméra",
    itemName:"Nom de la pièce", occasion:"Occasion", season:"Saison",
    save:"Sauvegarder", cancel:"Annuler", wardrobeEmpty:"Votre garde-robe est vide", noItemsInCat:"Aucune pièce dans cette catégorie",
    addCat:"+ Cat", newCategory:"Nouvelle catégorie...", analyzing:"Analyse...", itemSaved:"✦ Pièce sauvegardée", itemAnalyzed:"✦ Pièce analysée avec IA",
    whereTo:"Où allons-nous aujourd'hui ?", whereToSub:"Dites-moi le lieu ou l'événement et je créerai la tenue parfaite pour vous",
    withMyWardrobe:"Avec ma garde-robe", withMyWardrobeDesc:"Utiliser uniquement les pièces que j'ai sauvegardées",
    noWardrobe:"Sans ma garde-robe", noWardrobeDesc:"Générer des recommandations avec de nouvelles pièces et tendances",
    mixedWardrobe:"Ma garde-robe + IA", mixedWardrobeDesc:"Combiner mes pièces avec de nouvelles suggestions",
    generateOutfit:"✨ Générer ma Tenue Parfaite", generatingOutfit:"Génération de votre tenue...",
    step1:"Analyse de votre occasion...", step2:"Consultation de votre Fashion DNA™...", step3:"Sélection des pièces parfaites...",
    yourStylist:"✦ Votre Styliste Personnel", compatibleWith:"Compatible avec vous", yourFullOutfit:"Votre tenue complète",
    yourWardrobe:"Votre garde-robe", recommendedAccessories:"Accessoires recommandés", colorPalette:"Palette de couleurs",
    stylistAdvice:"Conseil du styliste", saveOutfit:"💾 Sauvegarder la tenue", newOutfit:"🔄 Nouvelle tenue",
    generateAnother:"✨ Générer une autre option", savedOutfits:"Tenues sauvegardées", outfitSaved:"✦ Tenue sauvegardée",
    classicGenerator:"Générateur par événement", selectEvent:"Sélectionnez l'événement et la saison",
    forWhatEvent:"Pour quel événement ?", generateClassic:"✦  Générer une Tenue avec IA", creatingOutfit:"Création de la tenue...",
    whyItWorks:"✦ Pourquoi ça marche", palette:"Palette", addItemsWardrobe:"Ajoutez d'abord des pièces à votre garde-robe",
    virtualTryTitle:"Essayage Virtuel", basedOnDNASub:"Basé sur votre Fashion DNA™", premiumOnly:"Fonction Premium exclusive",
    premiumFunction:"Fonction Premium", premiumDesc:"Essayez virtuellement n'importe quelle tenue de votre garde-robe basée sur votre Fashion DNA™ personnel.",
    upgradePremium:"✦  Passer à Premium — 9,99€/mois", createDNAFirst:"Créez d'abord votre Fashion DNA™",
    dnaDetected:"✓ Fashion DNA™ détecté", selectItemsTry:"Sélectionnez les pièces à essayer",
    itemsSelected:"pièce(s) sélectionnée(s)", tryVirtually:"🧍 Essayer la tenue virtuellement",
    generatingVirtual:"Génération de l'essayage virtuel...", howItWouldLook:"✦ Comment ça vous irait",
    advisorTitle:"Conseiller IA", advisorSub:"Propulsé par Claude AI · Personnalisé avec votre DNA",
    advisorGreeting:"Bonjour, je suis votre **conseiller de style personnel**. Je peux vous aider avec les combinaisons, les dress codes, les tendances et bien plus.\n\nComment puis-je vous aider aujourd'hui ?",
    askAboutFashion:"Posez des questions sur la mode, le style, les tendances...", send:"Envoyer",
    s1:"Quelles couleurs vont avec mon teint ?", s2:"Garde-robe capsule pour mon type de corps",
    s3:"Comment s'habiller pour un entretien ?", s4:"Pièces qui me vont le mieux",
    tripTitle:"Planificateur de Voyage", tripSub:"L'IA organise votre valise avec votre garde-robe",
    destination:"Où allez-vous ? (Paris, Lyon...)", days:"Jours", climate:"Climat",
    planBag:"✈  Planifier ma valise avec IA", planning:"Planification...", missingItems:"⚠ Il vous manque",
    urgent:"Urgent", stylistTip:"✦ Conseil du styliste",
    premium:"Premium", basic:"Basic",
    all:"Tout",
    withWardrobeQuestion:"Quelle garde-robe utilisons-nous pour la tenue?",
    outfitPlaceholder:"Ex: Dîner romantique au restaurant élégant\nEntretien d'embauche\nFête sur la plage\nVoyage à Paris pour 5 jours...",
    outfitChips:["Dîner romantique","Entretien d'embauche","Soirée élégante","Jour décontracté","Réunion d'affaires","Voyage"],
    climateOptions:["Chaud","Tempéré","Froid","Pluvieux","Variable"],
    tripTypes:["Tourisme","Plage","Montagne","Affaires","Romantique","Aventure"],
  },
  de: {
    appName:"STYLEVAULT", appSub:"KI-gestützter Smart-Kleiderschrank",
    login:"Anmelden", register:"Registrieren", enter:"Einloggen", createAccount:"Konto erstellen",
    email:"E-Mail-Adresse", password:"Passwort", fullName:"Ihr vollständiger Name",
    forgotPassword:"Passwort vergessen?", recoverEmail:"Überprüfen Sie Ihre E-Mail zur Passwortwiederherstellung",
    wrongCredentials:"Falsche E-Mail oder falsches Passwort.", profileNotFound:"Profil nicht gefunden.",
    blocked:"Ihr Konto ist gesperrt.", connectionError:"Verbindungsfehler.", fillAll:"Bitte füllen Sie alle Felder aus.",
    newPassword:"Neues Passwort", newPasswordPlaceholder:"Neues Passwort (mindestens 6 Zeichen)",
    updating:"Aktualisierung...", updatePassword:"Passwort aktualisieren", backToLogin:"Zurück zum Start",
    passwordUpdated:"✅ Passwort aktualisiert. Sie können sich jetzt anmelden.",
    passwordError:"Aktualisierung fehlgeschlagen. Der Link ist möglicherweise abgelaufen.",
    howDoYouIdentify:"Wie identifizieren Sie sich?", woman:"Frau", man:"Mann", other:"Andere",
    home:"Startseite", wardrobe:"Kleiderschrank", outfitIA:"KI-Outfit", advisorIA:"KI-Berater", trips:"Reisen",
    armarioInteligente:"Smart-Kleiderschrank", exit:"Abmelden",
    createAvatar:"Erstelle deinen KI-Avatar", avatarSub:"Dein persönlicher Stylist muss dich kennen, um deine digitale Version zu erstellen.",
    begin:"Beginnen →", skip:"Überspringen — später einrichten",
    basicInfo:"Grundinformationen", basicInfoSub:"Nur was KI nicht selbst erkennen kann",
    name:"Name", age:"Alter", height:"Größe (cm)", weight:"Ungefähres Gewicht (kg)", eyeColor:"Augenfarbe",
    hairType:"Haartyp", straight:"Glatt", wavy:"Wellig", curly:"Lockig", afro:"Afro",
    continueBtn:"Weiter →", back:"← Zurück",
    smartScan:"Intelligenter Scan", smartScanSub:"3 Fotos für maximale Präzision bei der Avatar-Erstellung",
    photo1:"Foto 1 · Frontal-Selfie", photo2:"Photo 2 · Ganzkörper frontal", photo3:"Photo 3 · Ganzkörper seitlich",
    analyzeAI:"🧬 Mit KI analysieren", tapToChange:"Tippen zum Ändern",
    analyzing1:"Gesichtszüge werden analysiert...", analyzing2:"Körpertyp und Proportionen werden analysiert...",
    analyzing3:"Hautton und ideale Farben werden analysiert...", analyzing4:"Ihr Fashion DNA™ wird erstellt...",
    dnaReady:"Ihr Fashion DNA™ ist fertig!", upload3Photos:"Laden Sie alle 3 Fotos hoch, um fortzufahren",
    avatarReady:"Ihr KI-Avatar ist fertig", precisionLevel:"Genauigkeitsniveau:",
    viewWardrobe:"Meinen Kleiderschrank anzeigen →", createFirstOutfit:"Mein erstes Outfit erstellen",
    fashionDNA:"Fashion DNA™", fashionDNASub:"Ihr personalisiertes Modeprofil",
    bodyAnalysis:"✦ Körperanalyse", bodyType:"Körpertyp", skinTone:"Hautton",
    undertone:"Unterton", faceShape:"Gesichtsform", neckType:"Halstyp", posture:"Haltung",
    proportions:"Proportionen", favorableColors:"✦ Farben, die Ihnen stehen", avoidColors:"Zu vermeidende Farben",
    recommendedClothes:"✦ Empfohlene Kleidung", avoidClothes:"Zu vermeidende Kleidung",
    personalTips:"✦ Persönliche Tipps", updateDNA:"🔄 Mein Fashion DNA™ aktualisieren",
    noDNA:"Sie haben noch kein Fashion DNA™ erstellt", createDNA:"Mein Fashion DNA™ erstellen",
    hello:"Hallo,", styleReady:"Ihr persönlicher Stil ist bereit", wardrobeReady:"Ihr intelligenter Kleiderschrank wartet",
    items:"Kleidungsstücke", favorites:"Favoriten", outfits:"Outfits", yourDNA:"✦ Ihr Fashion DNA™",
    viewComplete:"Vollständig anzeigen →", createProfile:"Erstellen Sie Ihr Profil für personalisierte Empfehlungen",
    create:"Erstellen →", outfitOfDay:"Outfit des Tages", personalizedForYou:"Für Sie personalisiert ✦",
    addItemsFirst:"Fügen Sie Kleidungsstücke hinzu, um Outfits zu generieren", tapCreate:"Tippen Sie auf 'Erstellen', um Ihr Outfit zu generieren",
    virtualTry:"✦ Virtuelle Anprobe", seeHowItFits:"Sehen Sie, wie das Outfit passt", basedOnDNA:"Basierend auf Ihrem persönlichen Fashion DNA™",
    tryNow:"Jetzt ausprobieren →", seePremium:"Premium-Funktion ansehen →", recentItems:"Aktuelle Kleidungsstücke", viewAll:"Alle anzeigen →",
    myWardrobe:"Mein Kleiderschrank", addItem:"+ Hinzufügen", newItem:"✦ Neues Kleidungsstück",
    photoAI:"Foto → KI analysiert automatisch", gallery:"📁 Galerie", camera:"📷 Kamera",
    itemName:"Name des Kleidungsstücks", occasion:"Anlass", season:"Jahreszeit",
    save:"Speichern", cancel:"Abbrechen", wardrobeEmpty:"Ihr Kleiderschrank ist leer", noItemsInCat:"Keine Kleidungsstücke in dieser Kategorie",
    addCat:"+ Kat", newCategory:"Neue Kategorie...", analyzing:"Analysiere...", itemSaved:"✦ Gespeichert", itemAnalyzed:"✦ Mit KI analysiert",
    whereTo:"Wohin gehen wir heute?", whereToSub:"Erzählen Sie mir den Ort oder das Event und ich erstelle das perfekte Outfit für Sie",
    withMyWardrobe:"Mit meinem Kleiderschrank", withMyWardrobeDesc:"Nur gespeicherte Kleidungsstücke verwenden",
    noWardrobe:"Ohne meinen Kleiderschrank", noWardrobeDesc:"Empfehlungen mit neuen Stücken und Trends generieren",
    mixedWardrobe:"Mein Schrank + KI", mixedWardrobeDesc:"Meine Stücke mit neuen Vorschlägen kombinieren",
    generateOutfit:"✨ Mein perfektes Outfit generieren", generatingOutfit:"Outfit wird generiert...",
    step1:"Anlass wird analysiert...", step2:"Fashion DNA™ wird konsultiert...", step3:"Perfekte Stücke werden ausgewählt...",
    yourStylist:"✦ Ihr persönlicher Stylist", compatibleWith:"Kompatibel mit Ihnen", yourFullOutfit:"Ihr vollständiges Outfit",
    yourWardrobe:"Ihr Kleiderschrank", recommendedAccessories:"Empfohlene Accessoires", colorPalette:"Farbpalette",
    stylistAdvice:"Stilisten-Tipp", saveOutfit:"💾 Outfit speichern", newOutfit:"🔄 Neues Outfit",
    generateAnother:"✨ Eine andere Option generieren", savedOutfits:"Gespeicherte Outfits", outfitSaved:"✦ Outfit gespeichert",
    classicGenerator:"Event-Generator", selectEvent:"Event und Jahreszeit auswählen",
    forWhatEvent:"Für welches Event?", generateClassic:"✦  Outfit mit KI generieren", creatingOutfit:"Outfit wird erstellt...",
    whyItWorks:"✦ Warum es funktioniert", palette:"Palette", addItemsWardrobe:"Fügen Sie zuerst Kleidungsstücke hinzu",
    virtualTryTitle:"Virtuelle Anprobe", basedOnDNASub:"Basierend auf Ihrem Fashion DNA™", premiumOnly:"Exklusive Premium-Funktion",
    premiumFunction:"Premium-Funktion", premiumDesc:"Probieren Sie virtuell jedes Outfit aus Ihrem Kleiderschrank basierend auf Ihrem persönlichen Fashion DNA™.",
    upgradePremium:"✦  Upgrade auf Premium — 9,99€/Monat", createDNAFirst:"Erstellen Sie zuerst Ihr Fashion DNA™",
    dnaDetected:"✓ Fashion DNA™ erkannt", selectItemsTry:"Kleidungsstücke zum Anprobieren auswählen",
    itemsSelected:"Kleidungsstück(e) ausgewählt", tryVirtually:"🧍 Outfit virtuell anprobieren",
    generatingVirtual:"Virtuelle Anprobe wird generiert...", howItWouldLook:"✦ Wie es an Ihnen aussehen würde",
    advisorTitle:"KI-Berater", advisorSub:"Powered by Claude AI · Personalisiert mit Ihrem DNA",
    advisorGreeting:"Hallo, ich bin Ihr **persönlicher Stilberater**. Ich kann Ihnen bei Kombinationen, Dress Codes, Trends und mehr helfen.\n\nWie kann ich Ihnen heute helfen?",
    askAboutFashion:"Fragen Sie über Mode, Stil, Trends...", send:"Senden",
    s1:"Welche Farben passen zu meinem Hautton?", s2:"Capsule-Garderobe für meinen Körpertyp",
    s3:"Wie kleidet man sich für ein Vorstellungsgespräch?", s4:"Kleidungsstücke, die mir am besten stehen",
    tripTitle:"Reiseplaner", tripSub:"KI organisiert Ihre Reisetasche mit Ihrer Garderobe",
    destination:"Wohin reisen Sie? (Paris, Berlin...)", days:"Tage", climate:"Klima",
    planBag:"✈  Reisetasche mit KI planen", planning:"Planung...", missingItems:"⚠ Sie müssen kaufen",
    urgent:"Dringend", stylistTip:"✦ Stilisten-Tipp",
    premium:"Premium", basic:"Basic",
    all:"Alle",
    withWardrobeQuestion:"Welchen Kleiderschrank verwenden wir für das Outfit?",
    outfitPlaceholder:"z.B. Romantisches Abendessen im eleganten Restaurant\nVorstellungsgespräch\nStrandparty\nReise nach Berlin für 5 Tage...",
    outfitChips:["Romantisches Abendessen","Vorstellungsgespräch","Elegante Party","Lässiger Tag","Geschäftstreffen","Reise"],
    climateOptions:["Heiß","Gemäßigt","Kalt","Regnerisch","Variabel"],
    tripTypes:["Tourismus","Strand","Berge","Geschäft","Romantisch","Abenteuer"],
  },
  zh: {
    appName:"STYLEVAULT", appSub:"AI 智能衣橱",
    login:"登录", register:"注册", enter:"进入", createAccount:"创建账户",
    email:"电子邮件", password:"密码", fullName:"您的全名",
    forgotPassword:"忘记密码？", recoverEmail:"请查看您的邮件以恢复密码",
    wrongCredentials:"邮箱或密码错误。", profileNotFound:"未找到个人资料。",
    blocked:"您的账户已被封锁。", connectionError:"连接错误。", fillAll:"请填写所有字段。",
    newPassword:"新密码", newPasswordPlaceholder:"新密码（最少6个字符）",
    updating:"更新中...", updatePassword:"更新密码", backToLogin:"返回首页",
    passwordUpdated:"✅ 密码已更新。您现在可以登录。",
    passwordError:"更新失败。链接可能已过期。",
    howDoYouIdentify:"您如何认同自己？", woman:"女性", man:"男性", other:"其他",
    home:"首页", wardrobe:"衣橱", outfitIA:"AI 搭配", advisorIA:"AI 顾问", trips:"旅行",
    armarioInteligente:"智能衣橱", exit:"退出",
    createAvatar:"创建您的 AI 头像", avatarSub:"您的私人造型师需要了解您，以创建您的数字版本。",
    begin:"开始 →", skip:"跳过 — 稍后设置",
    basicInfo:"基本信息", basicInfoSub:"仅填写 AI 无法自行检测的信息",
    name:"姓名", age:"年龄", height:"身高 (cm)", weight:"大约体重 (kg)", eyeColor:"眼睛颜色",
    hairType:"发型", straight:"直发", wavy:"波浪发", curly:"卷发", afro:"爆炸头",
    continueBtn:"继续 →", back:"← 返回",
    smartScan:"智能扫描", smartScanSub:"3张照片，以最高精度创建您的头像",
    photo1:"照片1 · 正面自拍", photo2:"照片2 · 全身正面", photo3:"照片3 · 全身侧面",
    analyzeAI:"🧬 用AI分析", tapToChange:"点击更改",
    analyzing1:"正在分析面部特征...", analyzing2:"正在分析体型和比例...",
    analyzing3:"正在分析肤色和理想颜色...", analyzing4:"正在创建您的时尚DNA™...",
    dnaReady:"您的时尚DNA™已准备好！", upload3Photos:"请上传3张照片才能继续",
    avatarReady:"您的AI头像已准备好", precisionLevel:"精确度级别：",
    viewWardrobe:"查看我的衣橱 →", createFirstOutfit:"创建我的第一套搭配",
    fashionDNA:"时尚DNA™", fashionDNASub:"您的个性化时尚档案",
    bodyAnalysis:"✦ 身体分析", bodyType:"体型", skinTone:"肤色",
    undertone:"肤色调", faceShape:"脸型", neckType:"颈部类型", posture:"姿势",
    proportions:"比例", favorableColors:"✦ 适合您的颜色", avoidColors:"避免的颜色",
    recommendedClothes:"✦ 推荐服装", avoidClothes:"避免的服装",
    personalTips:"✦ 个性化建议", updateDNA:"🔄 更新我的时尚DNA™",
    noDNA:"您还没有创建时尚DNA™", createDNA:"创建我的时尚DNA™",
    hello:"你好，", styleReady:"您的个人风格已准备好", wardrobeReady:"您的智能衣橱正在等待",
    items:"单品", favorites:"收藏", outfits:"搭配", yourDNA:"✦ 您的时尚DNA™",
    viewComplete:"查看完整 →", createProfile:"创建您的档案以获取个性化推荐",
    create:"创建 →", outfitOfDay:"今日搭配", personalizedForYou:"为您个性化定制 ✦",
    addItemsFirst:"添加服装以生成搭配", tapCreate:"点击创建以生成您的搭配",
    virtualTry:"✦ 虚拟试穿", seeHowItFits:"看看搭配效果", basedOnDNA:"基于您的个人时尚DNA™",
    tryNow:"立即尝试 →", seePremium:"查看高级功能 →", recentItems:"最近单品", viewAll:"查看全部 →",
    myWardrobe:"我的衣橱", addItem:"+ 添加", newItem:"✦ 新单品",
    photoAI:"照片 → AI 自动分析", gallery:"📁 相册", camera:"📷 相机",
    itemName:"单品名称", occasion:"场合", season:"季节",
    save:"保存", cancel:"取消", wardrobeEmpty:"您的衣橱是空的", noItemsInCat:"此类别中没有单品",
    addCat:"+ 类", newCategory:"新类别...", analyzing:"分析中...", itemSaved:"✦ 单品已保存", itemAnalyzed:"✦ AI已分析单品",
    whereTo:"今天我们去哪里？", whereToSub:"告诉我地点或活动，我将为您创建完美搭配",
    withMyWardrobe:"用我的衣橱", withMyWardrobeDesc:"仅使用我保存的单品",
    noWardrobe:"不用我的衣橱", noWardrobeDesc:"用新单品和趋势生成推荐",
    mixedWardrobe:"我的衣橱 + AI", mixedWardrobeDesc:"将我的单品与新建议结合",
    generateOutfit:"✨ 生成我的完美搭配", generatingOutfit:"正在生成您的搭配...",
    step1:"正在分析您的场合...", step2:"正在查询您的时尚DNA™...", step3:"正在选择完美单品...",
    yourStylist:"✦ 您的私人造型师", compatibleWith:"与您兼容", yourFullOutfit:"您的完整搭配",
    yourWardrobe:"您的衣橱", recommendedAccessories:"推荐配件", colorPalette:"色彩搭配",
    stylistAdvice:"造型师建议", saveOutfit:"💾 保存搭配", newOutfit:"🔄 新搭配",
    generateAnother:"✨ 生成另一个选项", savedOutfits:"已保存的搭配", outfitSaved:"✦ 搭配已保存",
    classicGenerator:"活动生成器", selectEvent:"选择活动和季节",
    forWhatEvent:"适合什么活动？", generateClassic:"✦  用AI生成搭配", creatingOutfit:"正在创建搭配...",
    whyItWorks:"✦ 为什么有效", palette:"调色板", addItemsWardrobe:"请先向衣橱添加单品",
    virtualTryTitle:"虚拟试穿", basedOnDNASub:"基于您的时尚DNA™", premiumOnly:"专属高级功能",
    premiumFunction:"高级功能", premiumDesc:"根据您的个人时尚DNA™，虚拟试穿衣橱中的任何搭配。",
    upgradePremium:"✦  升级到高级版 — ¥68/月", createDNAFirst:"请先创建您的时尚DNA™",
    dnaDetected:"✓ 已检测到时尚DNA™", selectItemsTry:"选择要试穿的单品",
    itemsSelected:"件单品已选择", tryVirtually:"🧍 虚拟试穿搭配",
    generatingVirtual:"正在生成虚拟试穿...", howItWouldLook:"✦ 穿在您身上的效果",
    advisorTitle:"AI顾问", advisorSub:"由Claude AI提供支持 · 根据您的DNA个性化",
    advisorGreeting:"你好，我是您的**个人风格顾问**。我可以帮助您搭配、了解着装规范、流行趋势等。\n\n今天我能为您做什么？",
    askAboutFashion:"询问时尚、风格、趋势...", send:"发送",
    s1:"什么颜色适合我的肤色？", s2:"适合我体型的胶囊衣橱",
    s3:"面试时如何着装？", s4:"最适合我的单品",
    tripTitle:"旅行规划器", tripSub:"AI用您的衣橱整理行李",
    destination:"您要去哪里？（巴黎、东京...）", days:"天", climate:"气候",
    planBag:"✈  用AI规划行李", planning:"规划中...", missingItems:"⚠ 您需要购买",
    urgent:"紧急", stylistTip:"✦ 造型师建议",
    premium:"高级版", basic:"基础版",
    all:"全部",
    withWardrobeQuestion:"我们用哪个衣橱搭配服装？",
    outfitPlaceholder:"例：高档餐厅浪漫晚餐\n经理职位面试\n海滩派对\n去东京5天的旅行...",
    outfitChips:["浪漫晚餐","工作面试","优雅派对","休闲日","商务会议","旅行"],
    climateOptions:["炎热","温和","寒冷","多雨","多变"],
    tripTypes:["观光","海滩","山地","商务","浪漫","冒险"],
  },
  ar: {
    appName:"STYLEVAULT", appSub:"خزانة ملابس ذكية بالذكاء الاصطناعي",
    login:"تسجيل الدخول", register:"إنشاء حساب", enter:"دخول", createAccount:"إنشاء حساب",
    email:"البريد الإلكتروني", password:"كلمة المرور", fullName:"اسمك الكامل",
    forgotPassword:"نسيت كلمة المرور؟", recoverEmail:"تحقق من بريدك الإلكتروني لاستعادة كلمة المرور",
    wrongCredentials:"البريد الإلكتروني أو كلمة المرور غير صحيحة.", profileNotFound:"الملف الشخصي غير موجود.",
    blocked:"حسابك محظور.", connectionError:"خطأ في الاتصال.", fillAll:"يرجى ملء جميع الحقول.",
    newPassword:"كلمة مرور جديدة", newPasswordPlaceholder:"كلمة مرور جديدة (6 أحرف على الأقل)",
    updating:"جارٍ التحديث...", updatePassword:"تحديث كلمة المرور", backToLogin:"العودة إلى الصفحة الرئيسية",
    passwordUpdated:"✅ تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول.",
    passwordError:"فشل التحديث. قد تكون الرابط منتهي الصلاحية.",
    howDoYouIdentify:"كيف تعرّف عن نفسك؟", woman:"امرأة", man:"رجل", other:"آخر",
    home:"الرئيسية", wardrobe:"خزانة الملابس", outfitIA:"إطلالة AI", advisorIA:"مستشار AI", trips:"السفر",
    armarioInteligente:"خزانة ملابس ذكية", exit:"تسجيل الخروج",
    createAvatar:"أنشئ صورتك الرمزية بالذكاء الاصطناعي", avatarSub:"يحتاج مصممك الشخصي إلى معرفتك لإنشاء نسختك الرقمية.",
    begin:"ابدأ →", skip:"تخطي — الإعداد لاحقاً",
    basicInfo:"المعلومات الأساسية", basicInfoSub:"فقط ما لا يمكن للذكاء الاصطناعي اكتشافه بنفسه",
    name:"الاسم", age:"العمر", height:"الطول (سم)", weight:"الوزن التقريبي (كغ)", eyeColor:"لون العيون",
    hairType:"نوع الشعر", straight:"ناعم", wavy:"متموج", curly:"مجعد", afro:"أفرو",
    continueBtn:"متابعة →", back:"← رجوع",
    smartScan:"المسح الذكي", smartScanSub:"3 صور لإنشاء صورتك الرمزية بأقصى دقة",
    photo1:"صورة 1 · سيلفي أمامي", photo2:"صورة 2 · جسم كامل أمامي", photo3:"صورة 3 · جسم كامل جانبي",
    analyzeAI:"🧬 تحليل بالذكاء الاصطناعي", tapToChange:"اضغط للتغيير",
    analyzing1:"جارٍ تحليل ملامح الوجه...", analyzing2:"جارٍ تحليل نوع الجسم والنسب...",
    analyzing3:"جارٍ تحليل لون البشرة والألوان المثالية...", analyzing4:"جارٍ إنشاء Fashion DNA™ الخاص بك...",
    dnaReady:".Fashion DNA™ الخاص بك جاهز!", upload3Photos:"قم بتحميل الصور الثلاث للمتابعة",
    avatarReady:"صورتك الرمزية بالذكاء الاصطناعي جاهزة", precisionLevel:"مستوى الدقة:",
    viewWardrobe:"عرض خزانة ملابسي →", createFirstOutfit:"إنشاء أول إطلالة لي",
    fashionDNA:"Fashion DNA™", fashionDNASub:"ملفك الشخصي في الموضة",
    bodyAnalysis:"✦ تحليل الجسم", bodyType:"نوع الجسم", skinTone:"لون البشرة",
    undertone:"درجة البشرة", faceShape:"شكل الوجه", neckType:"نوع الرقبة", posture:"وضعية الجسم",
    proportions:"النسب", favorableColors:"✦ الألوان التي تناسبك", avoidColors:"الألوان التي يجب تجنبها",
    recommendedClothes:"✦ الملابس الموصى بها", avoidClothes:"الملابس التي يجب تجنبها",
    personalTips:"✦ نصائح شخصية", updateDNA:"🔄 تحديث Fashion DNA™ الخاص بي",
    noDNA:"لم تقم بعد بإنشاء Fashion DNA™", createDNA:"إنشاء Fashion DNA™ الخاص بي",
    hello:"مرحباً،", styleReady:"أسلوبك الشخصي جاهز", wardrobeReady:"خزانة ملابسك الذكية في انتظارك",
    items:"قطع", favorites:"المفضلة", outfits:"الإطلالات", yourDNA:"✦ Fashion DNA™ الخاص بك",
    viewComplete:"عرض كامل →", createProfile:"أنشئ ملفك الشخصي للحصول على توصيات مخصصة",
    create:"إنشاء →", outfitOfDay:"إطلالة اليوم", personalizedForYou:"مخصصة لك ✦",
    addItemsFirst:"أضف قطعاً لإنشاء الإطلالات", tapCreate:"اضغط على 'إنشاء' لإنشاء إطلالتك",
    virtualTry:"✦ التجربة الافتراضية", seeHowItFits:"انظر كيف تبدو الإطلالة عليك", basedOnDNA:"بناءً على Fashion DNA™ الشخصي",
    tryNow:"جرب الآن →", seePremium:"عرض ميزة Premium →", recentItems:"القطع الأخيرة", viewAll:"عرض الكل →",
    myWardrobe:"خزانة ملابسي", addItem:"+ إضافة", newItem:"✦ قطعة جديدة",
    photoAI:"صورة → يحلل الذكاء الاصطناعي تلقائياً", gallery:"📁 المعرض", camera:"📷 الكاميرا",
    itemName:"اسم القطعة", occasion:"المناسبة", season:"الموسم",
    save:"حفظ", cancel:"إلغاء", wardrobeEmpty:"خزانة ملابسك فارغة", noItemsInCat:"لا توجد قطع في هذه الفئة",
    addCat:"+ فئة", newCategory:"فئة جديدة...", analyzing:"جارٍ التحليل...", itemSaved:"✦ تم حفظ القطعة", itemAnalyzed:"✦ تم تحليل القطعة بالذكاء الاصطناعي",
    whereTo:"إلى أين نذهب اليوم؟", whereToSub:"أخبرني بالمكان أو المناسبة وسأنشئ الإطلالة المثالية لك",
    withMyWardrobe:"مع خزانة ملابسي", withMyWardrobeDesc:"استخدام القطع المحفوظة فقط",
    noWardrobe:"بدون خزانة ملابسي", noWardrobeDesc:"إنشاء توصيات بقطع جديدة واتجاهات",
    mixedWardrobe:"خزانتي + AI", mixedWardrobeDesc:"دمج قطعي مع اقتراحات جديدة",
    generateOutfit:"✨ إنشاء إطلالتي المثالية", generatingOutfit:"جارٍ إنشاء إطلالتك...",
    step1:"جارٍ تحليل مناسبتك...", step2:"جارٍ استشارة Fashion DNA™...", step3:"جارٍ اختيار القطع المثالية...",
    yourStylist:"✦ مصممك الشخصي", compatibleWith:"متوافق معك", yourFullOutfit:"إطلالتك الكاملة",
    yourWardrobe:"خزانة ملابسك", recommendedAccessories:"الإكسسوارات الموصى بها", colorPalette:"لوحة الألوان",
    stylistAdvice:"نصيحة المصمم", saveOutfit:"💾 حفظ الإطلالة", newOutfit:"🔄 إطلالة جديدة",
    generateAnother:"✨ إنشاء خيار آخر", savedOutfits:"الإطلالات المحفوظة", outfitSaved:"✦ تم حفظ الإطلالة",
    classicGenerator:"مولد حسب المناسبة", selectEvent:"اختر المناسبة والموسم",
    forWhatEvent:"لأي مناسبة؟", generateClassic:"✦  إنشاء إطلالة بالذكاء الاصطناعي", creatingOutfit:"جارٍ إنشاء الإطلالة...",
    whyItWorks:"✦ لماذا يناسبك", palette:"اللوحة", addItemsWardrobe:"أضف قطعاً إلى خزانة ملابسك أولاً",
    virtualTryTitle:"التجربة الافتراضية", basedOnDNASub:"بناءً على Fashion DNA™ الخاص بك", premiumOnly:"ميزة Premium حصرية",
    premiumFunction:"ميزة Premium", premiumDesc:"جرب افتراضياً أي إطلالة من خزانة ملابسك بناءً على Fashion DNA™ الشخصي.",
    upgradePremium:"✦  الترقية إلى Premium — 39ريال/شهر", createDNAFirst:"أنشئ أولاً Fashion DNA™ الخاص بك",
    dnaDetected:"✓ تم اكتشاف Fashion DNA™", selectItemsTry:"اختر القطع للتجربة",
    itemsSelected:"قطعة (قطع) محددة", tryVirtually:"🧍 تجربة الإطلالة افتراضياً",
    generatingVirtual:"جارٍ إنشاء التجربة الافتراضية...", howItWouldLook:"✦ كيف ستبدو عليك",
    advisorTitle:"مستشار AI", advisorSub:"مدعوم بـ Claude AI · مخصص وفق DNA الخاص بك",
    advisorGreeting:"مرحباً، أنا **مستشار الأناقة الشخصي** الخاص بك. يمكنني مساعدتك في التنسيق وقواعد اللباس والاتجاهات والمزيد.\n\nكيف يمكنني مساعدتك اليوم؟",
    askAboutFashion:"اسأل عن الموضة والأسلوب والاتجاهات...", send:"إرسال",
    s1:"ما الألوان التي تناسب لون بشرتي؟", s2:"خزانة ملابس أساسية لنوع جسمي",
    s3:"كيف أرتدي الملابس لمقابلة عمل؟", s4:"القطع الأكثر ملائمة لي",
    tripTitle:"مخطط السفر", tripSub:"يقوم الذكاء الاصطناعي بتنظيم حقيبتك مع خزانة ملابسك",
    destination:"إلى أين تسافر؟ (باريس، دبي...)", days:"أيام", climate:"المناخ",
    planBag:"✈  تخطيط الحقيبة بالذكاء الاصطناعي", planning:"جارٍ التخطيط...", missingItems:"⚠ تحتاج إلى شراء",
    urgent:"عاجل", stylistTip:"✦ نصيحة المصمم",
    premium:"Premium", basic:"Basic",
    all:"الكل",
    withWardrobeQuestion:"أي خزانة نستخدم لتنسيق الملابس؟",
    outfitPlaceholder:"مثال: عشاء رومانسي في مطعم أنيق\nمقابلة عمل\nحفلة على الشاطئ\nرحلة إلى دبي لمدة 5 أيام...",
    outfitChips:["عشاء رومانسي","مقابلة عمل","حفلة أنيقة","يوم عادي","اجتماع عمل","سفر"],
    climateOptions:["حار","معتدل","بارد","ممطر","متغير"],
    tripTypes:["سياحة","شاطئ","جبال","أعمال","رومانسي","مغامرة"],
  },
  hi: {
    appName:"STYLEVAULT", appSub:"AI स्मार्ट वॉर्डरोब",
    login:"साइन इन", register:"साइन अप", enter:"प्रवेश करें", createAccount:"खाता बनाएं",
    email:"ईमेल पता", password:"पासवर्ड", fullName:"आपका पूरा नाम",
    forgotPassword:"पासवर्ड भूल गए?", recoverEmail:"पासवर्ड रिकवर करने के लिए अपना ईमेल जांचें",
    wrongCredentials:"गलत ईमेल या पासवर्ड।", profileNotFound:"प्रोफ़ाइल नहीं मिली।",
    blocked:"आपका खाता ब्लॉक है।", connectionError:"कनेक्शन त्रुटि।", fillAll:"कृपया सभी फ़ील्ड भरें।",
    newPassword:"नया पासवर्ड", newPasswordPlaceholder:"नया पासवर्ड (न्यूनतम 6 अक्षर)",
    updating:"अपडेट हो रहा है...", updatePassword:"पासवर्ड अपडेट करें", backToLogin:"होम पर वापस जाएं",
    passwordUpdated:"✅ पासवर्ड अपडेट हो गया। अब आप साइन इन कर सकते हैं।",
    passwordError:"अपडेट विफल। लिंक समाप्त हो सकता है।",
    howDoYouIdentify:"आप खुद को कैसे पहचानते हैं?", woman:"महिला", man:"पुरुष", other:"अन्य",
    home:"होम", wardrobe:"वॉर्डरोब", outfitIA:"AI आउटफिट", advisorIA:"AI सलाहकार", trips:"यात्राएं",
    armarioInteligente:"स्मार्ट वॉर्डरोब", exit:"साइन आउट",
    createAvatar:"अपना AI अवतार बनाएं", avatarSub:"आपके व्यक्तिगत स्टाइलिस्ट को आपकी डिजिटल प्रतिलिपि बनाने के लिए आपको जानना होगा।",
    begin:"शुरू करें →", skip:"छोड़ें — बाद में सेट करें",
    basicInfo:"बुनियादी जानकारी", basicInfoSub:"केवल वही जो AI स्वयं नहीं पहचान सकती",
    name:"नाम", age:"उम्र", height:"ऊंचाई (सेमी)", weight:"अनुमानित वजन (किग्रा)", eyeColor:"आंखों का रंग",
    hairType:"बालों का प्रकार", straight:"सीधे", wavy:"लहराते", curly:"घुंघराले", afro:"अफ्रो",
    continueBtn:"जारी रखें →", back:"← वापस",
    smartScan:"स्मार्ट स्कैन", smartScanSub:"अधिकतम सटीकता के साथ अवतार बनाने के लिए 3 फ़ोटो",
    photo1:"फ़ोटो 1 · सामने सेल्फी", photo2:"फ़ोटो 2 · पूरा शरीर सामने", photo3:"फ़ोटो 3 · पूरा शरीर किनारे",
    analyzeAI:"🧬 AI से विश्लेषण करें", tapToChange:"बदलने के लिए टैप करें",
    analyzing1:"चेहरे की विशेषताओं का विश्लेषण...", analyzing2:"शरीर के प्रकार और अनुपात का विश्लेषण...",
    analyzing3:"त्वचा टोन और आदर्श रंगों का विश्लेषण...", analyzing4:"आपका Fashion DNA™ बनाया जा रहा है...",
    dnaReady:"आपका Fashion DNA™ तैयार है!", upload3Photos:"जारी रखने के लिए 3 फ़ोटो अपलोड करें",
    avatarReady:"आपका AI अवतार तैयार है", precisionLevel:"सटीकता स्तर:",
    viewWardrobe:"मेरा वॉर्डरोब देखें →", createFirstOutfit:"मेरा पहला आउटफिट बनाएं",
    fashionDNA:"Fashion DNA™", fashionDNASub:"आपकी व्यक्तिगत फैशन प्रोफ़ाइल",
    bodyAnalysis:"✦ शरीर विश्लेषण", bodyType:"शरीर का प्रकार", skinTone:"त्वचा टोन",
    undertone:"अंडरटोन", faceShape:"चेहरे का आकार", neckType:"गर्दन का प्रकार", posture:"मुद्रा",
    proportions:"अनुपात", favorableColors:"✦ आपके अनुकूल रंग", avoidColors:"बचने वाले रंग",
    recommendedClothes:"✦ अनुशंसित कपड़े", avoidClothes:"बचने वाले कपड़े",
    personalTips:"✦ व्यक्तिगत सुझाव", updateDNA:"🔄 मेरा Fashion DNA™ अपडेट करें",
    noDNA:"आपने अभी तक Fashion DNA™ नहीं बनाया", createDNA:"मेरा Fashion DNA™ बनाएं",
    hello:"नमस्ते,", styleReady:"आपका व्यक्तिगत स्टाइल तैयार है", wardrobeReady:"आपका स्मार्ट वॉर्डरोब इंतजार कर रहा है",
    items:"आइटम", favorites:"पसंदीदा", outfits:"आउटफिट", yourDNA:"✦ आपका Fashion DNA™",
    viewComplete:"पूर्ण देखें →", createProfile:"व्यक्तिगत सिफारिशों के लिए अपनी प्रोफ़ाइल बनाएं",
    create:"बनाएं →", outfitOfDay:"दिन का आउटफिट", personalizedForYou:"आपके लिए व्यक्तिगत ✦",
    addItemsFirst:"आउटफिट बनाने के लिए आइटम जोड़ें", tapCreate:"आउटफिट बनाने के लिए 'बनाएं' टैप करें",
    virtualTry:"✦ वर्चुअल ट्राय-ऑन", seeHowItFits:"देखें कि आउटफिट कैसा लगता है", basedOnDNA:"आपके व्यक्तिगत Fashion DNA™ पर आधारित",
    tryNow:"अभी आज़माएं →", seePremium:"प्रीमियम सुविधा देखें →", recentItems:"हाल के आइटम", viewAll:"सभी देखें →",
    myWardrobe:"मेरा वॉर्डरोब", addItem:"+ जोड़ें", newItem:"✦ नया आइटम",
    photoAI:"फ़ोटो → AI स्वचालित रूप से विश्लेषण करता है", gallery:"📁 गैलरी", camera:"📷 कैमरा",
    itemName:"आइटम का नाम", occasion:"अवसर", season:"मौसम",
    save:"सहेजें", cancel:"रद्द करें", wardrobeEmpty:"आपका वॉर्डरोब खाली है", noItemsInCat:"इस श्रेणी में कोई आइटम नहीं",
    addCat:"+ श्रेणी", newCategory:"नई श्रेणी...", analyzing:"विश्लेषण हो रहा है...", itemSaved:"✦ आइटम सहेजा गया", itemAnalyzed:"✦ AI से विश्लेषण किया गया",
    whereTo:"आज हम कहाँ जा रहे हैं?", whereToSub:"मुझे जगह या अवसर बताएं और मैं आपके लिए परफेक्ट आउटफिट बनाऊंगा",
    withMyWardrobe:"मेरे वॉर्डरोब के साथ", withMyWardrobeDesc:"केवल सहेजे गए आइटम उपयोग करें",
    noWardrobe:"मेरे वॉर्डरोब के बिना", noWardrobeDesc:"नए आइटम और ट्रेंड के साथ सिफारिशें बनाएं",
    mixedWardrobe:"मेरा वॉर्डरोब + AI", mixedWardrobeDesc:"मेरे आइटम को नए सुझावों के साथ मिलाएं",
    generateOutfit:"✨ मेरा परफेक्ट आउटफिट बनाएं", generatingOutfit:"आपका आउटफिट बनाया जा रहा है...",
    step1:"आपके अवसर का विश्लेषण...", step2:"आपका Fashion DNA™ देखा जा रहा है...", step3:"परफेक्ट आइटम चुने जा रहे हैं...",
    yourStylist:"✦ आपका व्यक्तिगत स्टाइलिस्ट", compatibleWith:"आपके साथ संगत", yourFullOutfit:"आपका पूरा आउटफिट",
    yourWardrobe:"आपका वॉर्डरोब", recommendedAccessories:"अनुशंसित सहायक उपकरण", colorPalette:"रंग पैलेट",
    stylistAdvice:"स्टाइलिस्ट की सलाह", saveOutfit:"💾 आउटफिट सहेजें", newOutfit:"🔄 नया आउटफिट",
    generateAnother:"✨ दूसरा विकल्प बनाएं", savedOutfits:"सहेजे गए आउटफिट", outfitSaved:"✦ आउटफिट सहेजा गया",
    classicGenerator:"इवेंट जेनरेटर", selectEvent:"इवेंट और सीजन चुनें",
    forWhatEvent:"किस इवेंट के लिए?", generateClassic:"✦  AI से आउटफिट बनाएं", creatingOutfit:"आउटफिट बनाया जा रहा है...",
    whyItWorks:"✦ क्यों काम करता है", palette:"पैलेट", addItemsWardrobe:"पहले वॉर्डरोब में आइटम जोड़ें",
    virtualTryTitle:"वर्चुअल ट्राय-ऑन", basedOnDNASub:"आपके Fashion DNA™ पर आधारित", premiumOnly:"एक्सक्लूसिव प्रीमियम सुविधा",
    premiumFunction:"प्रीमियम सुविधा", premiumDesc:"आपके व्यक्तिगत Fashion DNA™ के आधार पर अपने वॉर्डरोब से किसी भी आउटफिट को वर्चुअली ट्राय करें।",
    upgradePremium:"✦  प्रीमियम में अपग्रेड करें — ₹299/माह", createDNAFirst:"पहले अपना Fashion DNA™ बनाएं",
    dnaDetected:"✓ Fashion DNA™ मिला", selectItemsTry:"ट्राय करने के लिए आइटम चुनें",
    itemsSelected:"आइटम चुने गए", tryVirtually:"🧍 आउटफिट वर्चुअली ट्राय करें",
    generatingVirtual:"वर्चुअल ट्राय-ऑन बनाया जा रहा है...", howItWouldLook:"✦ आप पर कैसा दिखेगा",
    advisorTitle:"AI सलाहकार", advisorSub:"Claude AI द्वारा · आपके DNA से व्यक्तिगत",
    advisorGreeting:"नमस्ते, मैं आपका **व्यक्तिगत स्टाइल सलाहकार** हूं। मैं संयोजन, ड्रेस कोड, ट्रेंड और बहुत कुछ में मदद कर सकता हूं।\n\nआज मैं आपकी कैसे मदद कर सकता हूं?",
    askAboutFashion:"फैशन, स्टाइल, ट्रेंड के बारे में पूछें...", send:"भेजें",
    s1:"मेरी त्वचा टोन के साथ कौन से रंग मेल खाते हैं?", s2:"मेरे शरीर के प्रकार के लिए कैप्सूल वॉर्डरोब",
    s3:"इंटरव्यू के लिए कैसे कपड़े पहनें?", s4:"मुझ पर सबसे अच्छे लगने वाले आइटम",
    tripTitle:"यात्रा योजनाकार", tripSub:"AI आपके वॉर्डरोब के साथ आपका बैग व्यवस्थित करता है",
    destination:"आप कहाँ जा रहे हैं? (पेरिस, दिल्ली...)", days:"दिन", climate:"जलवायु",
    planBag:"✈  AI से बैग योजना बनाएं", planning:"योजना बना रहे हैं...", missingItems:"⚠ आपको खरीदना है",
    urgent:"जरूरी", stylistTip:"✦ स्टाइलिस्ट की सलाह",
    premium:"प्रीमियम", basic:"बेसिक",
    all:"सभी",
    withWardrobeQuestion:"आउटफिट के लिए कौन सी वॉर्डरोब उपयोग करें?",
    outfitPlaceholder:"उदा: एलीगेंट रेस्टोरेंट में रोमांटिक डिनर\nनौकरी का इंटरव्यू\nबीच पार्टी\nदिल्ली की 5 दिन की यात्रा...",
    outfitChips:["रोमांटिक डिनर","नौकरी इंटरव्यू","एलीगेंट पार्टी","कैजुअल दिन","बिजनेस मीटिंग","यात्रा"],
    climateOptions:["गर्म","समशीतोष्ण","ठंडा","बरसाती","परिवर्तनशील"],
    tripTypes:["पर्यटन","समुद्र तट","पहाड़","व्यापार","रोमांटिक","साहसिक"],
  },
  ja: {
    appName:"STYLEVAULT", appSub:"AIスマートワードローブ",
    login:"ログイン", register:"新規登録", enter:"入る", createAccount:"アカウント作成",
    email:"メールアドレス", password:"パスワード", fullName:"フルネーム",
    forgotPassword:"パスワードをお忘れですか？", recoverEmail:"パスワード回復のためメールをご確認ください",
    wrongCredentials:"メールまたはパスワードが間違っています。", profileNotFound:"プロフィールが見つかりません。",
    blocked:"アカウントがブロックされています。", connectionError:"接続エラー。", fillAll:"すべてのフィールドに入力してください。",
    newPassword:"新しいパスワード", newPasswordPlaceholder:"新しいパスワード（6文字以上）",
    updating:"更新中...", updatePassword:"パスワードを更新", backToLogin:"ホームに戻る",
    passwordUpdated:"✅ パスワードが更新されました。ログインできます。",
    passwordError:"更新に失敗しました。リンクが期限切れの可能性があります。",
    howDoYouIdentify:"どのように自分を識別しますか？", woman:"女性", man:"男性", other:"その他",
    home:"ホーム", wardrobe:"ワードローブ", outfitIA:"AIコーデ", advisorIA:"AIアドバイザー", trips:"旅行",
    armarioInteligente:"スマートワードローブ", exit:"ログアウト",
    createAvatar:"AIアバターを作成", avatarSub:"パーソナルスタイリストがあなたのデジタル版を作成するためにあなたを知る必要があります。",
    begin:"始める →", skip:"スキップ — 後で設定",
    basicInfo:"基本情報", basicInfoSub:"AIが自分で検出できないもののみ",
    name:"名前", age:"年齢", height:"身長 (cm)", weight:"体重概算 (kg)", eyeColor:"目の色",
    hairType:"髪のタイプ", straight:"ストレート", wavy:"ウェーブ", curly:"カール", afro:"アフロ",
    continueBtn:"続ける →", back:"← 戻る",
    smartScan:"スマートスキャン", smartScanSub:"最大精度でアバターを作成するための3枚の写真",
    photo1:"写真1 · 正面セルフィー", photo2:"写真2 · 全身正面", photo3:"写真3 · 全身側面",
    analyzeAI:"🧬 AIで分析", tapToChange:"タップして変更",
    analyzing1:"顔の特徴を分析中...", analyzing2:"体型とプロポーションを分析中...",
    analyzing3:"肌トーンと理想の色を分析中...", analyzing4:"ファッションDNA™を作成中...",
    dnaReady:"ファッションDNA™が完成しました！", upload3Photos:"続けるために3枚の写真をアップロードしてください",
    avatarReady:"AIアバターが完成しました", precisionLevel:"精度レベル：",
    viewWardrobe:"ワードローブを見る →", createFirstOutfit:"最初のコーデを作成",
    fashionDNA:"ファッションDNA™", fashionDNASub:"あなたのパーソナルファッションプロフィール",
    bodyAnalysis:"✦ ボディ分析", bodyType:"体型", skinTone:"肌トーン",
    undertone:"アンダートーン", faceShape:"顔の形", neckType:"首のタイプ", posture:"姿勢",
    proportions:"プロポーション", favorableColors:"✦ 似合う色", avoidColors:"避けるべき色",
    recommendedClothes:"✦ おすすめの服", avoidClothes:"避けるべき服",
    personalTips:"✦ パーソナルアドバイス", updateDNA:"🔄 ファッションDNA™を更新",
    noDNA:"ファッションDNA™をまだ作成していません", createDNA:"ファッションDNA™を作成",
    hello:"こんにちは、", styleReady:"あなたのパーソナルスタイルが準備できています", wardrobeReady:"スマートワードローブがあなたを待っています",
    items:"アイテム", favorites:"お気に入り", outfits:"コーデ", yourDNA:"✦ ファッションDNA™",
    viewComplete:"全部見る →", createProfile:"パーソナライズされたおすすめのためプロフィールを作成",
    create:"作成 →", outfitOfDay:"本日のコーデ", personalizedForYou:"あなた専用 ✦",
    addItemsFirst:"コーデを生成するためアイテムを追加してください", tapCreate:"コーデを生成するには「作成」をタップ",
    virtualTry:"✦ バーチャル試着", seeHowItFits:"コーデがどう見えるか確認", basedOnDNA:"パーソナルファッションDNA™に基づく",
    tryNow:"今すぐ試す →", seePremium:"プレミアム機能を見る →", recentItems:"最近のアイテム", viewAll:"すべて見る →",
    myWardrobe:"マイワードローブ", addItem:"+ 追加", newItem:"✦ 新しいアイテム",
    photoAI:"写真 → AIが自動分析", gallery:"📁 ギャラリー", camera:"📷 カメラ",
    itemName:"アイテム名", occasion:"シーン", season:"シーズン",
    save:"保存", cancel:"キャンセル", wardrobeEmpty:"ワードローブは空です", noItemsInCat:"このカテゴリにアイテムがありません",
    addCat:"+ カテゴリ", newCategory:"新しいカテゴリ...", analyzing:"分析中...", itemSaved:"✦ アイテムを保存しました", itemAnalyzed:"✦ AIで分析しました",
    whereTo:"今日はどこへ行きますか？", whereToSub:"場所やイベントを教えてください。完璧なコーデを作ります",
    withMyWardrobe:"マイワードローブで", withMyWardrobeDesc:"保存したアイテムのみ使用",
    noWardrobe:"ワードローブなしで", noWardrobeDesc:"新しいアイテムとトレンドでおすすめを生成",
    mixedWardrobe:"マイワードローブ + AI", mixedWardrobeDesc:"アイテムと新しい提案を組み合わせる",
    generateOutfit:"✨ 完璧なコーデを生成", generatingOutfit:"コーデを生成中...",
    step1:"シーンを分析中...", step2:"ファッションDNA™を確認中...", step3:"完璧なアイテムを選択中...",
    yourStylist:"✦ パーソナルスタイリスト", compatibleWith:"あなたに合っています", yourFullOutfit:"完全なコーデ",
    yourWardrobe:"マイワードローブ", recommendedAccessories:"おすすめアクセサリー", colorPalette:"カラーパレット",
    stylistAdvice:"スタイリストのアドバイス", saveOutfit:"💾 コーデを保存", newOutfit:"🔄 新しいコーデ",
    generateAnother:"✨ 別のオプションを生成", savedOutfits:"保存済みコーデ", outfitSaved:"✦ コーデを保存しました",
    classicGenerator:"イベント別ジェネレーター", selectEvent:"イベントとシーズンを選択",
    forWhatEvent:"どんなイベントに？", generateClassic:"✦  AIでコーデを生成", creatingOutfit:"コーデを作成中...",
    whyItWorks:"✦ なぜ合うのか", palette:"パレット", addItemsWardrobe:"まずワードローブにアイテムを追加してください",
    virtualTryTitle:"バーチャル試着", basedOnDNASub:"ファッションDNA™に基づく", premiumOnly:"限定プレミアム機能",
    premiumFunction:"プレミアム機能", premiumDesc:"パーソナルファッションDNA™に基づいてワードローブの任意のコーデをバーチャル試着できます。",
    upgradePremium:"✦  プレミアムにアップグレード — ¥980/月", createDNAFirst:"まずファッションDNA™を作成してください",
    dnaDetected:"✓ ファッションDNA™が検出されました", selectItemsTry:"試着するアイテムを選択",
    itemsSelected:"アイテムが選択されました", tryVirtually:"🧍 バーチャルでコーデを試着",
    generatingVirtual:"バーチャル試着を生成中...", howItWouldLook:"✦ あなたに着けた場合",
    advisorTitle:"AIアドバイザー", advisorSub:"Claude AI搭載 · DNA基づくパーソナライズ",
    advisorGreeting:"こんにちは、**パーソナルスタイルアドバイザー**です。コーディネート、ドレスコード、トレンドなどをお手伝いできます。\n\n本日はいかがお手伝いできますか？",
    askAboutFashion:"ファッション、スタイル、トレンドについて質問...", send:"送信",
    s1:"私の肌トーンに合う色は？", s2:"体型に合ったカプセルワードローブ",
    s3:"面接にはどう着こなす？", s4:"最も似合うアイテム",
    tripTitle:"旅行プランナー", tripSub:"AIがワードローブとともに荷物を整理します",
    destination:"どこへ行きますか？（パリ、東京...）", days:"日間", climate:"気候",
    planBag:"✈  AIで荷物を計画", planning:"計画中...", missingItems:"⚠ 購入が必要",
    urgent:"緊急", stylistTip:"✦ スタイリストのヒント",
    premium:"プレミアム", basic:"ベーシック",
    all:"すべて",
    withWardrobeQuestion:"コーデにはどのワードローブを使いますか？",
    outfitPlaceholder:"例：エレガントなレストランでのロマンチックなディナー\n就職面接\nビーチパーティー\n東京への5日間の旅行...",
    outfitChips:["ロマンチックなディナー","就職面接","エレガントなパーティー","カジュアルな日","ビジネス会議","旅行"],
    climateOptions:["暑い","温暖","寒い","雨","変わりやすい"],
    tripTypes:["観光","ビーチ","山","ビジネス","ロマンチック","アドベンチャー"],
  },
  ru: {
    appName:"STYLEVAULT", appSub:"Умный гардероб с ИИ",
    login:"Войти", register:"Зарегистрироваться", enter:"Войти", createAccount:"Создать аккаунт",
    email:"Электронная почта", password:"Пароль", fullName:"Ваше полное имя",
    forgotPassword:"Забыли пароль?", recoverEmail:"Проверьте почту для восстановления пароля",
    wrongCredentials:"Неверный email или пароль.", profileNotFound:"Профиль не найден.",
    blocked:"Ваш аккаунт заблокирован.", connectionError:"Ошибка соединения.", fillAll:"Пожалуйста, заполните все поля.",
    newPassword:"Новый пароль", newPasswordPlaceholder:"Новый пароль (минимум 6 символов)",
    updating:"Обновление...", updatePassword:"Обновить пароль", backToLogin:"Вернуться на главную",
    passwordUpdated:"✅ Пароль обновлён. Теперь вы можете войти.",
    passwordError:"Ошибка обновления. Ссылка могла истечь.",
    howDoYouIdentify:"Как вы себя идентифицируете?", woman:"Женщина", man:"Мужчина", other:"Другое",
    home:"Главная", wardrobe:"Гардероб", outfitIA:"ИИ Образ", advisorIA:"ИИ Советник", trips:"Путешествия",
    armarioInteligente:"Умный гардероб", exit:"Выйти",
    createAvatar:"Создайте свой ИИ-аватар", avatarSub:"Вашему личному стилисту нужно вас знать, чтобы создать вашу цифровую версию.",
    begin:"Начать →", skip:"Пропустить — настроить позже",
    basicInfo:"Основная информация", basicInfoSub:"Только то, что ИИ не может обнаружить самостоятельно",
    name:"Имя", age:"Возраст", height:"Рост (см)", weight:"Примерный вес (кг)", eyeColor:"Цвет глаз",
    hairType:"Тип волос", straight:"Прямые", wavy:"Волнистые", curly:"Кудрявые", afro:"Афро",
    continueBtn:"Продолжить →", back:"← Назад",
    smartScan:"Умное сканирование", smartScanSub:"3 фото для создания аватара с максимальной точностью",
    photo1:"Фото 1 · Фронтальное селфи", photo2:"Фото 2 · Полный рост спереди", photo3:"Фото 3 · Полный рост сбоку",
    analyzeAI:"🧬 Анализировать с ИИ", tapToChange:"Нажмите для изменения",
    analyzing1:"Анализ черт лица...", analyzing2:"Анализ типа тела и пропорций...",
    analyzing3:"Анализ тона кожи и идеальных цветов...", analyzing4:"Создание вашего Fashion DNA™...",
    dnaReady:"Ваш Fashion DNA™ готов!", upload3Photos:"Загрузите 3 фото для продолжения",
    avatarReady:"Ваш ИИ-аватар готов", precisionLevel:"Уровень точности:",
    viewWardrobe:"Мой гардероб →", createFirstOutfit:"Создать первый образ",
    fashionDNA:"Fashion DNA™", fashionDNASub:"Ваш персональный модный профиль",
    bodyAnalysis:"✦ Анализ тела", bodyType:"Тип тела", skinTone:"Тон кожи",
    undertone:"Подтон", faceShape:"Форма лица", neckType:"Тип шеи", posture:"Осанка",
    proportions:"Пропорции", favorableColors:"✦ Подходящие цвета", avoidColors:"Цвета, которых стоит избегать",
    recommendedClothes:"✦ Рекомендованная одежда", avoidClothes:"Одежда, которой стоит избегать",
    personalTips:"✦ Персональные советы", updateDNA:"🔄 Обновить мой Fashion DNA™",
    noDNA:"Вы ещё не создали свой Fashion DNA™", createDNA:"Создать мой Fashion DNA™",
    hello:"Привет,", styleReady:"Ваш личный стиль готов", wardrobeReady:"Ваш умный гардероб ждёт вас",
    items:"Вещи", favorites:"Избранное", outfits:"Образы", yourDNA:"✦ Ваш Fashion DNA™",
    viewComplete:"Смотреть полностью →", createProfile:"Создайте профиль для персональных рекомендаций",
    create:"Создать →", outfitOfDay:"Образ дня", personalizedForYou:"Персонализировано для вас ✦",
    addItemsFirst:"Добавьте вещи для создания образов", tapCreate:"Нажмите 'Создать' для создания образа",
    virtualTry:"✦ Виртуальная примерка", seeHowItFits:"Посмотрите, как выглядит образ", basedOnDNA:"На основе вашего личного Fashion DNA™",
    tryNow:"Попробовать →", seePremium:"Смотреть Premium →", recentItems:"Недавние вещи", viewAll:"Смотреть все →",
    myWardrobe:"Мой гардероб", addItem:"+ Добавить", newItem:"✦ Новая вещь",
    photoAI:"Фото → ИИ анализирует автоматически", gallery:"📁 Галерея", camera:"📷 Камера",
    itemName:"Название вещи", occasion:"Случай", season:"Сезон",
    save:"Сохранить", cancel:"Отмена", wardrobeEmpty:"Ваш гардероб пуст", noItemsInCat:"В этой категории нет вещей",
    addCat:"+ Кат", newCategory:"Новая категория...", analyzing:"Анализ...", itemSaved:"✦ Вещь сохранена", itemAnalyzed:"✦ ИИ проанализировал вещь",
    whereTo:"Куда мы идём сегодня?", whereToSub:"Расскажите о месте или событии, и я создам идеальный образ",
    withMyWardrobe:"Из моего гардероба", withMyWardrobeDesc:"Использовать только сохранённые вещи",
    noWardrobe:"Без моего гардероба", noWardrobeDesc:"Создать рекомендации с новыми вещами и трендами",
    mixedWardrobe:"Мой гардероб + ИИ", mixedWardrobeDesc:"Сочетать мои вещи с новыми предложениями",
    generateOutfit:"✨ Создать мой идеальный образ", generatingOutfit:"Создаётся ваш образ...",
    step1:"Анализ случая...", step2:"Консультация Fashion DNA™...", step3:"Подбор идеальных вещей...",
    yourStylist:"✦ Ваш личный стилист", compatibleWith:"Подходит вам", yourFullOutfit:"Ваш полный образ",
    yourWardrobe:"Ваш гардероб", recommendedAccessories:"Рекомендованные аксессуары", colorPalette:"Цветовая палитра",
    stylistAdvice:"Совет стилиста", saveOutfit:"💾 Сохранить образ", newOutfit:"🔄 Новый образ",
    generateAnother:"✨ Создать другой вариант", savedOutfits:"Сохранённые образы", outfitSaved:"✦ Образ сохранён",
    classicGenerator:"Генератор по событию", selectEvent:"Выберите событие и сезон",
    forWhatEvent:"Для какого события?", generateClassic:"✦  Создать образ с ИИ", creatingOutfit:"Создаётся образ...",
    whyItWorks:"✦ Почему это работает", palette:"Палитра", addItemsWardrobe:"Сначала добавьте вещи в гардероб",
    virtualTryTitle:"Виртуальная примерка", basedOnDNASub:"На основе вашего Fashion DNA™", premiumOnly:"Эксклюзивная Premium функция",
    premiumFunction:"Premium функция", premiumDesc:"Виртуально примерьте любой образ из гардероба на основе личного Fashion DNA™.",
    upgradePremium:"✦  Перейти на Premium — 799₽/мес", createDNAFirst:"Сначала создайте Fashion DNA™",
    dnaDetected:"✓ Fashion DNA™ обнаружен", selectItemsTry:"Выберите вещи для примерки",
    itemsSelected:"вещь(и) выбрана(ы)", tryVirtually:"🧍 Примерить образ виртуально",
    generatingVirtual:"Создаётся виртуальная примерка...", howItWouldLook:"✦ Как это выглядело бы на вас",
    advisorTitle:"ИИ Советник", advisorSub:"Powered by Claude AI · Персонализировано с вашим DNA",
    advisorGreeting:"Привет, я ваш **личный советник по стилю**. Могу помочь с сочетаниями, дресс-кодами, трендами и многим другим.\n\nКак я могу помочь вам сегодня?",
    askAboutFashion:"Спросите о моде, стиле, трендах...", send:"Отправить",
    s1:"Какие цвета подходят к моему тону кожи?", s2:"Капсульный гардероб для моего типа тела",
    s3:"Как одеться на собеседование?", s4:"Вещи, которые мне больше всего идут",
    tripTitle:"Планировщик путешествий", tripSub:"ИИ организует вашу сумку с вашим гардеробом",
    destination:"Куда вы едете? (Париж, Москва...)", days:"Дней", climate:"Климат",
    planBag:"✈  Планировать сумку с ИИ", planning:"Планирование...", missingItems:"⚠ Вам нужно купить",
    urgent:"Срочно", stylistTip:"✦ Совет стилиста",
    premium:"Premium", basic:"Basic",
    all:"Все",
    withWardrobeQuestion:"Какой гардероб использовать для образа?",
    outfitPlaceholder:"Напр.: Романтический ужин в элегантном ресторане\nСобеседование на работу\nВечеринка на пляже\nПоездка в Москву на 5 дней...",
    outfitChips:["Романтический ужин","Собеседование","Элегантная вечеринка","Casual день","Деловая встреча","Путешествие"],
    climateOptions:["Жаркий","Умеренный","Холодный","Дождливый","Переменный"],
    tripTypes:["Туризм","Пляж","Горы","Бизнес","Романтическое","Приключение"],
  },
};

function detectLanguage(): LangCode {
  const saved = localStorage.getItem("sv_lang") as LangCode;
  if (saved && T[saved]) return saved;
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  const map: Record<string, LangCode> = {
    es:"es", en:"en", pt:"pt", fr:"fr", de:"de",
    zh:"zh", ar:"ar", hi:"hi", ja:"ja", ru:"ru"
  };
  return map[browserLang] || "en";
}

function saveLanguage(code: LangCode) {
  localStorage.setItem("sv_lang", code);
}


const API_URL = "https://stylevault-api.121lunaoscar.workers.dev";
const MODEL = "claude-sonnet-4-5";

const callClaude = async (systemPrompt: string, messages: any[]) => {
  const res = await fetch(API_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 2000, system: systemPrompt, messages }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

const callClaudeVision = async (systemPrompt: string, images: {base64: string, type: string}[], text: string) => {
  const content: any[] = images.map(img => ({
    type: "image", source: { type: "base64", media_type: img.type, data: img.base64 }
  }));
  content.push({ type: "text", text });
  const res = await fetch(API_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 3000, system: systemPrompt, messages: [{ role: "user", content }] }),
  });
  const data = await res.json();
  return data.content?.map((i: any) => i.text || "").join("") || "";
};

// Supabase
const SB_URL = "https://rnrzifixbecsvbnxavus.supabase.co";
const SB_KEY = "sb_publishable_M4XCdb1bVj86biRwJXubCQ_OQJA74UP";
const sbFetch = async (path: string, options: any = {}) => {
  const token = localStorage.getItem("sb_token");
  const res = await fetch(`${SB_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${token || SB_KEY}`, Prefer: "return=representation", ...(options.headers || {}) },
  });
  if (!res.ok && res.status !== 204) { const err = await res.json().catch(() => ({})); throw new Error((err as any).message || res.statusText); }
  if (res.status === 204) return null;
  return res.json();
};
const sbSignIn = async (email: string, password: string) => {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, body: JSON.stringify({ email, password }) });
  return res.json();
};
const sbSignUp = async (email: string, password: string) => {
  const res = await fetch(`${SB_URL}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }, body: JSON.stringify({ email, password }) });
  return res.json();
};
const dbSelect = (table: string, query = "") => sbFetch(`/rest/v1/${table}?${query}`);
const dbInsert = (table: string, body: any) => sbFetch(`/rest/v1/${table}`, { method: "POST", body: JSON.stringify(body) });
const dbDelete = (table: string, match: string) => sbFetch(`/rest/v1/${table}?${match}`, { method: "DELETE" });
const dbUpdate = (table: string, match: string, body: any) => sbFetch(`/rest/v1/${table}?${match}`, { method: "PATCH", body: JSON.stringify(body) });

// Constants
const BASE_CATS = ["Tops","Pantalones","Vestidos","Zapatos","Accesorios","Abrigos","Deportivo"];
const OCCASIONS = ["Casual","Trabajo","Formal","Deportivo","Fiesta","Viaje"];
const SEASONS = ["Todo el año","Primavera","Verano","Otoño","Invierno"];
const EVENTS = ["Trabajo / Oficina","Cita romántica","Reunión de negocios","Evento formal","Día casual","Fiesta / Antro","Deporte / Gym","Viaje"];
const CAT_ICON: Record<string,string> = { Tops:"👕", Pantalones:"👖", Vestidos:"👗", Zapatos:"👟", Accesorios:"💍", Abrigos:"🧥", Deportivo:"🏃" };

// System prompts
const getAdvisorSystem = (lang: LangCode, dnaCtx: string, wardrobeCtx: string) =>
  `You are StyleVault, a sophisticated personal fashion advisor. Use markdown: **bold**, lists. Be concise (max 4 paragraphs). ALWAYS respond in the user's language (language code: ${lang}). End with a follow-up question.${dnaCtx}${wardrobeCtx}`;
const getOutfitSystem = (lang: LangCode) =>
  `You are a fashion expert. ONLY JSON without markdown. Respond with all text values in language code: ${lang}: { outfit: [{emoji,name,why}], explanation: string, colorPalette: string, rating: number 1-5, ratingExplanation: string }`;
const getPhotoSystem = (lang: LangCode) =>
  `Analyze this garment. ONLY JSON with name and color in language ${lang}: { name: string, category: "Tops"|"Pantalones"|"Vestidos"|"Zapatos"|"Accesorios"|"Abrigos"|"Deportivo", color: string, occasion: "Casual"|"Trabajo"|"Formal"|"Deportivo"|"Fiesta"|"Viaje", season: "Todo el año"|"Primavera"|"Verano"|"Otoño"|"Invierno" }`;
const getTripSystem = (lang: LangCode) =>
  `You are a fashion and travel expert. Respond in language code: ${lang}. ONLY JSON: { intro: string, llevar: [{categoria: string, items: [string], tip: string}], faltan: [{name: string, why: string, urgente: boolean}], consejo: string }`;

const DNA_SYSTEM = `You are an expert in personal image analysis and fashion. Analiza estas fotos (selfie frontal, cuerpo completo frontal, cuerpo completo lateral) junto con los datos del usuario.

SOLO responde en JSON válido sin markdown:
{
  "faceShape": string,
  "skinTone": string,
  "skinUndertone": "frío"|"cálido"|"neutro",
  "eyeShape": string,
  "neckType": string,
  "bodyType": string,
  "bodyProportions": { "shoulders": string, "waist": string, "hips": string, "torso": string, "legs": string },
  "posture": string,
  "hairAnalysis": { "length": string, "volume": string, "texture": string },
  "idealColors": [string],
  "colorsToAvoid": [string],
  "recommendedStyles": [string],
  "recommendedClothes": [string],
  "clothesToAvoid": [string],
  "fashionPersonality": string,
  "precisionLevel": number,
  "styleAdvice": string,
  "topTips": [string]
}`;

const getVirtualSystem = (lang: LangCode) =>
  `You are an expert virtual stylist. Given the user's Fashion DNA and selected items, describe in detail how the outfit would look on that specific person. Include: how each item flatters their body type, what colors complement their skin tone, and how the complete look comes together. Max 3 paragraphs. Respond in language code: ${lang}.`;

function renderMd(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/^- (.*?)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,m=>`<ul>${m}</ul>`).replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>');
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}

/* ── TEMA MUJER (rosa/crema) ── */
:root.mujer {
  --accent:#8B3A52;
  --accent2:#C4748A;
  --accent-light:rgba(139,58,82,.1);
  --accent-glow:rgba(139,58,82,.2);
  --bg:#FBF7F4;
  --bg2:#FFFFFF;
  --bg3:#F5EEE9;
  --border:#E8DDD6;
  --border2:#D4C4BA;
  --text:#2D1B1E;
  --text2:#7A5C64;
  --text3:#B09AA0;
  --card-shadow:0 2px 16px rgba(139,58,82,.08);
  --green:#2E7D52;
  --red:#C0392B;
  --font:'Poppins',sans-serif;
  --font-serif:'Cormorant Garamond',serif;
  --radius:16px;
  --radius-sm:10px;
  --nav-bg:#FFFFFF;
  --header-bg:#FBF7F4;
}

/* ── TEMA HOMBRE (verde oscuro) ── */
:root.hombre {
  --accent:#2D5A3D;
  --accent2:#4A8C5C;
  --accent-light:rgba(45,90,61,.15);
  --accent-glow:rgba(45,90,61,.25);
  --bg:#1A2B1E;
  --bg2:#243328;
  --bg3:#1F2E23;
  --border:#2E4035;
  --border2:#3A5244;
  --text:#F0EDE6;
  --text2:#9DB89F;
  --text3:#5A7A60;
  --card-shadow:0 2px 16px rgba(0,0,0,.3);
  --green:#4CAF70;
  --red:#E74C3C;
  --font:'Jost',sans-serif;
  --font-serif:'Cormorant Garamond',serif;
  --radius:12px;
  --radius-sm:8px;
  --nav-bg:#1A2B1E;
  --header-bg:#1A2B1E;
}

/* ── DEFAULT NEUTRO (login/registro) ── */
:root {
  --accent:#2C2C2C;
  --accent2:#555555;
  --accent-light:rgba(44,44,44,.08);
  --accent-glow:rgba(44,44,44,.15);
  --bg:#F8F8F6;
  --bg2:#FFFFFF;
  --bg3:#F0F0EE;
  --border:#E0E0DC;
  --border2:#CACAC6;
  --text:#1A1A1A;
  --text2:#6B6B6B;
  --text3:#ABABAB;
  --card-shadow:0 2px 16px rgba(0,0,0,.06);
  --green:#2E7D52;
  --red:#C0392B;
  --font:'Poppins',sans-serif;
  --font-serif:'Cormorant Garamond',serif;
  --radius:16px;
  --radius-sm:10px;
  --nav-bg:#FFFFFF;
  --header-bg:#F8F8F6;
}

::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:var(--accent2);border-radius:1px}
body{background:var(--bg);font-family:var(--font)}

.sv{background:var(--bg);min-height:100vh;color:var(--text);font-weight:400;max-width:430px;margin:0 auto;position:relative;font-family:var(--font)}
.serif{font-family:var(--font-serif)}

/* Bottom Nav */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:var(--nav-bg);border-top:1px solid var(--border);display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom);box-shadow:0 -4px 20px rgba(0,0,0,.08)}
.bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 0 8px;cursor:pointer;gap:3px;border:none;background:none;transition:all .2s;position:relative}
.bnav-icon{font-size:20px;transition:transform .2s}
.bnav-label{font-size:7px;letter-spacing:1px;text-transform:uppercase;color:var(--text3);font-family:var(--font);transition:color .2s;font-weight:500}
.bnav-item.on .bnav-label{color:var(--accent)}
.bnav-item.on .bnav-icon{transform:scale(1.1)}
.bnav-center{width:52px;height:52px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;margin-top:-20px;box-shadow:0 4px 16px var(--accent-glow);border:3px solid var(--bg);font-size:22px;cursor:pointer;transition:all .2s}
.bnav-center:hover{transform:scale(1.05)}

/* Buttons */
.btn-p{background:var(--accent);color:#fff;border:none;padding:15px 24px;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);font-size:13px;font-weight:600;letter-spacing:.5px;width:100%;transition:all .2s;box-shadow:0 4px 14px var(--accent-glow)}
.btn-p:hover{filter:brightness(1.08);transform:translateY(-1px)}
.btn-p:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.btn-o{background:transparent;color:var(--accent);border:1.5px solid var(--accent);padding:12px 20px;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);font-size:12px;font-weight:600;letter-spacing:.3px;transition:all .2s}
.btn-o:hover{background:var(--accent-light)}
.btn-o:disabled{opacity:.3;cursor:not-allowed}
.btn-g{background:transparent;border:none;color:var(--text2);cursor:pointer;font-family:var(--font);font-size:12px;padding:6px 10px;transition:color .2s;font-weight:500}
.btn-g:hover{color:var(--accent)}

/* Inputs */
.inp{background:var(--bg3);border:1.5px solid var(--border);color:var(--text);padding:14px 16px;border-radius:var(--radius-sm);font-family:var(--font);font-size:13px;font-weight:400;width:100%;outline:none;transition:all .2s}
.inp:focus{border-color:var(--accent);background:var(--bg2);box-shadow:0 0 0 3px var(--accent-light)}
.inp::placeholder{color:var(--text3)}
.sel{background:var(--bg3);border:1.5px solid var(--border);color:var(--text);padding:14px 16px;border-radius:var(--radius-sm);font-family:var(--font);font-size:13px;width:100%;cursor:pointer;outline:none}

/* Cards */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;box-shadow:var(--card-shadow)}
.card-accent{border-color:var(--accent2);background:var(--bg2)}
.card-dark{background:var(--accent);color:#fff;border:none}

/* Pills */
.pill{padding:8px 16px;border-radius:30px;font-family:var(--font);font-size:11px;letter-spacing:.3px;cursor:pointer;border:1.5px solid var(--border);background:var(--bg3);color:var(--text2);transition:all .2s;white-space:nowrap;font-weight:500}
.pill.on{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:600;box-shadow:0 3px 10px var(--accent-glow)}
.pill:hover:not(.on){border-color:var(--accent);color:var(--accent);background:var(--accent-light)}

/* Dots loader */
.dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:bop 1.2s ease-in-out infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes bop{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-8px);opacity:1}}

.divider{height:1px;background:var(--border);margin:18px 0}
.fade{animation:fu .3s ease both}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--text);color:var(--bg);padding:11px 22px;border-radius:30px;font-size:12px;font-family:var(--font);font-weight:500;letter-spacing:.3px;z-index:999;animation:fu .3s ease;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.2)}

.pbox{width:100%;border:2px dashed var(--border2);border-radius:var(--radius);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;background:var(--bg3);transition:all .2s}
.pbox:hover{border-color:var(--accent);background:var(--accent-light)}

.chip{padding:8px 14px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);border-radius:30px;cursor:pointer;font-family:var(--font);font-size:12px;white-space:nowrap;transition:all .2s;font-weight:500}
.chip:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-light)}

.stars{color:var(--accent);font-size:16px;letter-spacing:1px}

.bubble-u{background:var(--accent);color:#fff;border-radius:18px 18px 4px 18px;padding:12px 16px;max-width:78%;margin-left:auto;font-size:13px;line-height:1.6;box-shadow:0 3px 10px var(--accent-glow)}
.bubble-a{background:var(--bg2);border:1px solid var(--border);border-radius:18px 18px 18px 4px;padding:13px 16px;max-width:86%;font-size:13px;line-height:1.7;color:var(--text2);box-shadow:var(--card-shadow)}
.bubble-a strong{color:var(--text);font-weight:600}
.bubble-a ul{padding-left:16px;margin:6px 0}
.bubble-a li{margin-bottom:4px}
.bubble-a p{margin-bottom:8px}
.bubble-a p:last-child{margin-bottom:0}

.stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 12px;text-align:center;flex:1;box-shadow:var(--card-shadow)}

.premium-badge{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:30px;font-weight:600}

.dna-tag{display:inline-block;padding:5px 12px;border-radius:30px;font-size:11px;letter-spacing:.3px;margin:3px;font-family:var(--font);font-weight:500}
.dna-good{background:rgba(46,125,82,.12);color:var(--green);border:1px solid rgba(46,125,82,.25)}
.dna-avoid{background:rgba(192,57,43,.1);color:var(--red);border:1px solid rgba(192,57,43,.2)}
.dna-style{background:var(--accent-light);color:var(--accent);border:1px solid var(--accent-glow)}

.onboard-step{display:flex;align-items:center;gap:8px;margin-bottom:32px}
.onboard-dot{width:8px;height:8px;border-radius:50%;background:var(--border2);transition:all .3s}
.onboard-dot.on{background:var(--accent);width:24px;border-radius:4px}

.photo-upload-box{border:2px dashed var(--border2);border-radius:var(--radius);padding:20px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg3)}
.photo-upload-box:hover{border-color:var(--accent);background:var(--accent-light)}
.photo-upload-box.done{border-color:var(--green);background:rgba(46,125,82,.06)}

/* Category icon grid */
.cat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}
.cat-item{display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:10px 4px;border-radius:var(--radius-sm);transition:all .2s;background:var(--bg3);border:1px solid var(--border)}
.cat-item.on{background:var(--accent-light);border-color:var(--accent)}
.cat-item:hover{background:var(--accent-light)}

/* Section header */
.sec-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.sec-title{font-size:17px;font-weight:700;color:var(--text)}
`;

export default function StyleVault() {
  // Auth
  const [screen, setScreen] = useState("login");
  const [lang, setLang] = useState<LangCode>(() => detectLanguage());
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = T[lang];

  const changeLang = (code: LangCode) => {
    setLang(code);
    saveLanguage(code);
    setShowLangMenu(false);
    const isRtl = LANGUAGES.find(l => l.code === code)?.dir === "rtl";
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  };
  const [resetToken, setResetToken] = useState<string|null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetL, setResetL] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [lf, setLf] = useState({ name:"", email:"", password:"", genero:"" });
  const [lmode, setLmode] = useState("login");
  const [lerr, setLerr] = useState("");
  const [aloading, setAL] = useState(false);

  // Onboarding
  const [obStep, setObStep] = useState(1);
  const [obInfo, setObInfo] = useState({ nombre:"", edad:"", altura:"", peso:"", ojos:"", cabello:"Lacio", genero:"" });
  const [obPhotos, setObPhotos] = useState<{selfie:string|null, front:string|null, side:string|null}>({ selfie:null, front:null, side:null });
  const [obPhotoFiles, setObPhotoFiles] = useState<{selfie:File|null, front:File|null, side:File|null}>({ selfie:null, front:null, side:null });
  const [obAnalyzing, setObAnalyzing] = useState(false);
  const [obAnalysisStep, setObAnalysisStep] = useState("");
  const selfieRef = useRef<HTMLInputElement>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const sideRef = useRef<HTMLInputElement>(null);

  // DNA
  const [dna, setDna] = useState<any>(() => {
    const d = localStorage.getItem("sv_dna");
    return d ? JSON.parse(d) : null;
  });

  // Apply theme based on gender
  const applyTheme = (genero: string) => {
    const root = document.documentElement;
    if (genero === "Mujer") { root.className = "mujer"; }
    else if (genero === "Hombre") { root.className = "hombre"; }
    else { root.className = ""; }
  };

  useEffect(() => {
    const savedDna = localStorage.getItem("sv_dna");
    if (savedDna) {
      const d = JSON.parse(savedDna);
      applyTheme(d.genero || d.userInfo?.genero || "");
    }
    // Set RTL if Arabic saved
    const savedLang = localStorage.getItem("sv_lang");
    if (savedLang === "ar") document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // App
  const [tab, setTab] = useState("home");
  const [clothes, setClothes] = useState<any[]>([]);
  const [customCats, setCustomCats] = useState<string[]>(() => JSON.parse(localStorage.getItem("sv_custom_cats") || "[]"));
  const [newCatInput, setNewCatInput] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => JSON.parse(localStorage.getItem("sv_favorites") || "[]"));
  const [fc, setFc] = useState("__ALL__");
  const [showForm, setSF] = useState(false);
  const [ni, setNi] = useState({ name:"", category:"Tops", color:"#C4973F", season:"Todo el año", occasion:"" });
  const [pp, setPp] = useState<string|null>(null);
  const [cloading, setCL] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [selEv, setSelEv] = useState("");
  const [selSe, setSelSe] = useState("Todo el año");
  const [outfitR, setOR] = useState<any>(null);
  const [outfitL, setOL] = useState(false);

  // New AI outfit generator
  const [outfitPrompt, setOutfitPrompt] = useState("");
  const [outfitSource, setOutfitSource] = useState("wardrobe");
  const [smartOutfit, setSmartOutfit] = useState<any>(null);
  const [smartOutfitL, setSmartOutfitL] = useState(false);
  const [smartOutfitSteps, setSmartOutfitSteps] = useState("");
  const [savedOutfits, setSavedOutfits] = useState<any[]>(() => JSON.parse(localStorage.getItem("sv_saved_outfits") || "[]"));

  const [msgs, setMsgs] = useState<{role:string;text:string}[]>([
    { role:"assistant", text:"Hi, I'm your personal style advisor. How can I help?" }
  ]);
  const [cin, setCin] = useState("");
  const [cload, setCload] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  // Virtual try
  const [selectedForTry, setSelectedForTry] = useState<number[]>([]);
  const [tryResult, setTryResult] = useState<string|null>(null);
  const [tryL, setTryL] = useState(false);

  // Trip
  const [tripDest, setTripDest] = useState("");
  const [tripDays, setTripDays] = useState("7");
  const [tripClima, setTripClima] = useState("");
  const [tripTipo, setTripTipo] = useState("");
  const [tripR, setTripR] = useState<any>(null);
  const [tripL, setTripL] = useState(false);

  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);
  useEffect(() => {
    setMsgs([{ role:"assistant", text: T[lang].advisorGreeting }]);
  }, [lang]);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  useEffect(() => {
    // Check recovery token
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");
    const type = params.get("type");
    if (accessToken && type === "recovery") {
      setResetToken(accessToken);
      setScreen("reset");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    const saved = localStorage.getItem("sb_profile");
    if (saved) {
      const p = JSON.parse(saved);
      setProfile(p);
      const savedDna = localStorage.getItem("sv_dna");
      const savedGenero = localStorage.getItem("sv_genero") || p.genero || "";
      applyTheme(savedDna ? (JSON.parse(savedDna).genero || savedGenero) : savedGenero);
      setScreen("app");
    }
  }, []);

  // Auth
  const handleLogin = async () => {
    setLerr(""); setAL(true);
    try {
      const auth = await sbSignIn(lf.email, lf.password);
      if (auth.error || !auth.access_token) { setLerr("Correo o contraseña incorrectos."); setAL(false); return; }
      localStorage.setItem("sb_token", auth.access_token);
      const res = await fetch(`${SB_URL}/rest/v1/users?email=eq.${encodeURIComponent(lf.email)}&limit=1`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${auth.access_token}`, "Content-Type": "application/json" }
      });
      const users = await res.json();
      if (!users?.length) { setLerr("Perfil no encontrado."); setAL(false); return; }
      const p = users[0];
      if (p.status === "blocked") { setLerr("Tu cuenta está bloqueada."); setAL(false); return; }
      localStorage.setItem("sb_profile", JSON.stringify(p));
      setProfile(p);
      setScreen("app");
    } catch { setLerr("Error de conexión."); }
    setAL(false);
  };

  const handleRegister = async () => {
    setLerr(""); setAL(true);
    if (!lf.name || !lf.email || !lf.password) { setLerr("Completa todos los campos."); setAL(false); return; }
    try {
      const auth = await sbSignUp(lf.email, lf.password);
      if (auth.error) { setLerr(auth.error.message || "Error al registrar."); setAL(false); return; }
      localStorage.setItem("sb_token", auth.access_token || SB_KEY);
      const newProfile = { id: auth.user?.id, name: lf.name, email: lf.email, plan: "Basic", status: "active", created_at: new Date().toISOString(), genero: lf.genero };
      await dbInsert("users", newProfile);
      localStorage.setItem("sb_profile", JSON.stringify(newProfile));
      localStorage.setItem("sv_genero", lf.genero);
      setProfile(newProfile);
      applyTheme(lf.genero);
      setScreen("app");
    } catch { setLerr("Error al crear cuenta."); }
    setAL(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setResetMsg("La contraseña debe tener al menos 6 caracteres."); return; }
    setResetL(true);
    try {
      const res = await fetch(`${SB_URL}/auth/v1/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${resetToken}` },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) { setResetMsg("✅ Contraseña actualizada. Ahora puedes iniciar sesión."); setTimeout(() => setScreen("login"), 2500); }
      else setResetMsg("Error al actualizar. El link puede haber expirado.");
    } catch { setResetMsg("Error de conexión."); }
    setResetL(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sb_token"); localStorage.removeItem("sb_profile");
    setProfile(null); setClothes([]); setScreen("login");
  };

  // Onboarding photo handler
  const handleObPhoto = (type: "selfie"|"front"|"side") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setObPhotos(prev => ({ ...prev, [type]: dataUrl }));
      setObPhotoFiles(prev => ({ ...prev, [type]: f }));
    };
    r.readAsDataURL(f);
  };

  // Analyze with AI
  const analyzeWithAI = async () => {
    if (!obPhotos.selfie || !obPhotos.front || !obPhotos.side) { showToast(t.upload3Photos); return; }
    setObAnalyzing(true);

    try {
      setObAnalysisStep(t.analyzing1);
      await new Promise(r => setTimeout(r, 800));
      setObAnalysisStep(t.analyzing2);
      await new Promise(r => setTimeout(r, 800));
      setObAnalysisStep(t.analyzing3);
      await new Promise(r => setTimeout(r, 800));
      setObAnalysisStep(t.analyzing4);

      const images = [
        { base64: obPhotos.selfie.split(',')[1], type: obPhotoFiles.selfie!.type },
        { base64: obPhotos.front.split(',')[1], type: obPhotoFiles.front!.type },
        { base64: obPhotos.side.split(',')[1], type: obPhotoFiles.side!.type },
      ];

      const userContext = `Datos del usuario: Nombre: ${obInfo.nombre}, Edad: ${obInfo.edad} años, Altura: ${obInfo.altura} cm, Peso: ${obInfo.peso} kg, Color de ojos: ${obInfo.ojos}, Tipo de cabello: ${obInfo.cabello}, Género: ${obInfo.genero}.`;

      const raw = await callClaudeVision(DNA_SYSTEM, images, userContext + " Analiza las 3 fotos y genera el Fashion DNA completo.");
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());

      const dnaData = { ...parsed, userInfo: obInfo, genero: obInfo.genero, createdAt: new Date().toISOString() };
      setDna(dnaData);
      localStorage.setItem("sv_dna", JSON.stringify(dnaData));
      applyTheme(obInfo.genero);

      // Save to Supabase if possible
      try {
        await dbUpdate("users", `id=eq.${profile?.id}`, { dna_profile: dnaData });
      } catch {}

      setObAnalysisStep(t.dnaReady);
      await new Promise(r => setTimeout(r, 1000));
      setObStep(4); // Result step
    } catch {
      showToast("Error al analizar. Intenta de nuevo.");
    }
    setObAnalyzing(false);
  };

  // Clothes
  useEffect(() => { if (screen === "app" && profile) loadClothes(); }, [screen, profile]);

  const loadClothes = async () => {
    setCL(true);
    try { const data = await dbSelect("clothes", `user_id=eq.${profile.id}&order=created_at.desc`); if (data) setClothes(data); } catch {}
    setCL(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPp(dataUrl); setAnalyzing(true);
      try {
        const base64 = dataUrl.split(',')[1];
        const images = [{ base64, type: f.type }];
        const text = await callClaudeVision(getPhotoSystem(lang), images, "Analyze this garment.");
        const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
        setNi(prev => ({ ...prev, name: parsed.name||prev.name, category: parsed.category||prev.category, season: parsed.season||prev.season, occasion: parsed.occasion||prev.occasion }));
        showToast(t.itemAnalyzed);
      } catch {}
      setAnalyzing(false);
    };
    r.readAsDataURL(f);
  };

  const addItem = async () => {
    if (!ni.name) return;
    try {
      const inserted = await dbInsert("clothes", { user_id: profile.id, ...ni, photo_url: pp });
      const item = inserted?.[0] || { id: Date.now(), user_id: profile.id, ...ni, photo_url: pp };
      setClothes([item, ...clothes]);
      setNi({ name:"", category:"Tops", color:"#C4973F", season:"Todo el año", occasion:"" });
      setPp(null); setSF(false); showToast(t.itemSaved);
    } catch { showToast("Error al guardar."); }
  };

  const removeItem = async (id: number) => {
    try { await dbDelete("clothes", `id=eq.${id}`); } catch {}
    setClothes(clothes.filter(c => c.id !== id));
  };

  const toggleFav = (id: number) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(next); localStorage.setItem("sv_favorites", JSON.stringify(next));
  };

  // Smart AI Outfit Generator
  const generateSmartOutfit = async () => {
    if (!outfitPrompt.trim()) return;
    setSmartOutfitL(true); setSmartOutfit(null);

    const dnaCtx = dna?.bodyType ? `Fashion DNA: Tipo de cuerpo: ${dna.bodyType}, Tono de piel: ${dna.skinTone} (${dna.skinUndertone}), Colores ideales: ${dna.idealColors?.join(", ")}, Altura: ${dna.userInfo?.altura}cm, Complexión: ${dna.build || "promedio"}, Estilo recomendado: ${dna.recommendedStyles?.slice(0,2).join(", ")}.` : "Sin Fashion DNA definido.";

    const wardrobeCtx = outfitSource !== "new"
      ? `Armario disponible: ${clothes.map(c => `${c.name} (${c.category}, ${c.color || ""}, ${c.occasion || ""})`).join(" | ")}`
      : "No usar el armario del usuario, recomendar prendas nuevas.";

    const season = ["Diciembre","Enero","Febrero"].includes(new Date().toLocaleString("es",{month:"long"})) ? "Invierno" :
                   ["Marzo","Abril","Mayo"].includes(new Date().toLocaleString("es",{month:"long"})) ? "Primavera" :
                   ["Junio","Julio","Agosto"].includes(new Date().toLocaleString("es",{month:"long"})) ? "Verano" : "Otoño";

    const SMART_SYSTEM = `You are the world's most sophisticated personal stylist. Respond with ALL text in language code: ${lang}.

ONLY valid JSON without markdown:
{
  "greeting": string (mensaje cálido y personal del estilista, máx 2 oraciones),
  "eventAnalysis": { "tipo": string, "formalidad": string, "clima": string, "estacion": string },
  "outfit": [{ "categoria": string, "prenda": string, "color": string, "razon": string, "emoji": string, "esDeArmario": boolean }],
  "accesorios": [{ "item": string, "razon": string, "emoji": string }],
  "colores": { "principal": string, "complementario": string, "acento": string, "paleta": string },
  "compatibility": number (0-100),
  "compatibilityReasons": [string],
  "stylistAdvice": string,
  "alternativeOption": string,
  "saveTitle": string
}`;

    try {
      setSmartOutfitSteps(t.step1);
      await new Promise(r => setTimeout(r, 600));
      setSmartOutfitSteps(t.step2);
      await new Promise(r => setTimeout(r, 500));
      setSmartOutfitSteps(t.step3);

      const raw = await callClaude(SMART_SYSTEM, [{
        role: "user",
        content: `Ocasión del usuario: "${outfitPrompt}"

${dnaCtx}

${wardrobeCtx}

Fuente de outfit: ${outfitSource === "wardrobe" ? "SOLO usar prendas del armario" : outfitSource === "new" ? "Recomendar prendas nuevas de tendencia" : "Combinar armario con nuevas sugerencias"}

Estación actual: ${season}
Fecha: ${new Date().toLocaleDateString("es-MX", {weekday:"long", day:"numeric", month:"long"})}

Crea el outfit perfecto y personalizado para esta persona.`
      }]);

      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setSmartOutfit(parsed);
    } catch { setSmartOutfit({ greeting: "Error al generar. Intenta de nuevo.", outfit: [], accesorios: [], compatibility: 0 }); }

    setSmartOutfitL(false);
    setSmartOutfitSteps("");
  };

  const saveSmartOutfit = () => {
    if (!smartOutfit) return;
    const saved = { ...smartOutfit, prompt: outfitPrompt, date: new Date().toISOString(), id: Date.now() };
    const next = [saved, ...savedOutfits].slice(0, 20);
    setSavedOutfits(next);
    localStorage.setItem("sv_saved_outfits", JSON.stringify(next));
    showToast(t.outfitSaved);
  };

  // Outfit
  const generateOutfit = async () => {
    if (!selEv) return;
    setOL(true); setOR(null);
    const list = clothes.map(c => `${c.name} (${c.category}, ${c.occasion||""})`).join("\n");
    const dnaCtx = dna ? `\nFashion DNA del usuario: Tipo de cuerpo: ${dna.bodyType}, Tono: ${dna.skinTone}, Subtono: ${dna.skinUndertone}, Colores ideales: ${dna.idealColors?.join(", ")}.` : "";
    try {
      const raw = await callClaude(getOutfitSystem(lang), [{ role:"user", content:`Armario:\n${list}\n\nEvento: ${selEv}\nTemporada: ${selSe}${dnaCtx}\n\nCrea el outfit ideal personalizado para este usuario y califícalo.` }]);
      setOR(JSON.parse(raw.replace(/```json|```/g,"").trim()));
      showToast("✦ Outfit creado");
    } catch { setOR({ outfit:[], explanation:"Error.", colorPalette:"", rating:0, ratingExplanation:"" }); }
    setOL(false);
  };

  // Chat
  const sendChat = async (msg?: string) => {
    const m = msg || cin; if (!m.trim()) return;
    const next = [...msgs, { role:"user", text:m }];
    setMsgs(next); setCin(""); setCload(true);
    const dnaCtx = dna ? `\nFashion DNA: Body type: ${dna.bodyType}, Skin tone: ${dna.skinTone} (${dna.skinUndertone}), Ideal colors: ${dna.idealColors?.join(", ")}, Recommended clothes: ${dna.recommendedClothes?.slice(0,5).join(", ")}.` : "";
    const wardrobeCtx = clothes.length > 0 ? `\nWardrobe: ${clothes.slice(0,15).map(c=>`${c.name} (${c.category})`).join(", ")}` : "";
    try {
      const reply = await callClaude(getAdvisorSystem(lang, dnaCtx, wardrobeCtx), next.map(x=>({ role:x.role==="assistant"?"assistant":"user", content:x.text })));
      setMsgs([...next, { role:"assistant", text:reply }]);
    } catch { setMsgs([...next, { role:"assistant", text:"Error de conexión." }]); }
    setCload(false);
  };

  // Virtual try
  const virtualTryOn = async () => {
    if (!dna || selectedForTry.length === 0) return;
    setTryL(true); setTryResult(null);
    const prendas = clothes.filter(c => selectedForTry.includes(c.id)).map(c => `${c.name} (${c.category}, color: ${c.color})`).join(", ");
    const perfil = `Tipo de cuerpo: ${dna.bodyType}, Proporciones: hombros ${dna.bodyProportions?.shoulders}, cintura ${dna.bodyProportions?.waist}, caderas ${dna.bodyProportions?.hips}. Tono de piel: ${dna.skinTone} (${dna.skinUndertone}). Colores ideales: ${dna.idealColors?.join(", ")}.`;
    try {
      const result = await callClaude(getVirtualSystem(lang), [{ role:"user", content:`Fashion DNA:\n${perfil}\n\nOutfit seleccionado:\n${prendas}\n\nDescribe cómo luciría este outfit en esta persona específicamente.` }]);
      setTryResult(result);
    } catch { setTryResult("Error al procesar."); }
    setTryL(false);
  };

  // Trip
  const planTrip = async () => {
    if (!tripDest || !tripDays) return;
    setTripL(true); setTripR(null);
    const armario = clothes.length > 0 ? clothes.map(c => `${c.name} (${c.category})`).join(", ") : "Sin prendas";
    try {
      const raw = await callClaude(getTripSystem(lang), [{ role:"user", content:`Destino: ${tripDest}\nDías: ${tripDays}\nClima: ${tripClima||"templado"}\nTipo: ${tripTipo||"turismo"}\nArmario: ${armario}` }]);
      setTripR(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setTripR({ intro:"Error.", llevar:[], faltan:[], consejo:"" }); }
    setTripL(false);
  };

  const allCategories = [...BASE_CATS, ...customCats];
  const addCustomCategory = () => {
    const cat = newCatInput.trim();
    if (!cat || allCategories.includes(cat)) return;
    const next = [...customCats, cat];
    setCustomCats(next); localStorage.setItem("sv_custom_cats", JSON.stringify(next));
    setNewCatInput(""); setShowAddCat(false); showToast(t.itemSaved);
  };
  const removeCustomCategory = (cat: string) => {
    const next = customCats.filter(c => c !== cat);
    setCustomCats(next); localStorage.setItem("sv_custom_cats", JSON.stringify(next));
  };

  const ALL_FILTER = "__ALL__";
  const filtered = clothes.filter(c => fc === ALL_FILTER || c.category === fc);
  const favClothes = clothes.filter(c => favorites.includes(c.id));
  const isPremium = profile?.plan === "Premium" || profile?.plan === "Admin";
  const renderStars = (n: number) => "★".repeat(Math.min(5,Math.max(0,Math.round(n)))) + "☆".repeat(5-Math.min(5,Math.max(0,Math.round(n))));
  const suggestions = [t.s1, t.s2, t.s3, t.s4];

  // Reset to neutral theme on login/reset screens
  if (screen === "login" || screen === "reset") {
    document.documentElement.className = "";
  }

  // ── RESET PASSWORD ────────────────────────────────────────────────────────
  if (screen === "reset") return (
    <div style={{ fontFamily:"'Jost',sans-serif", background:"var(--bg)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div className="serif" style={{ fontSize:"36px", letterSpacing:"8px", color:"#C4973F", fontWeight:300 }}>STYLE<em>VAULT</em></div>
        </div>
        <div className="card">
          <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"20px" }}>✦ Nueva Contraseña</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <input className="inp" placeholder="Nueva contraseña (mínimo 6 caracteres)" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleResetPassword()} />
            {resetMsg && <div style={{ color:resetMsg.startsWith("✅")?"var(--green)":"var(--red)", fontSize:"12px", textAlign:"center" }}>{resetMsg}</div>}
            <button className="btn-p" onClick={handleResetPassword} disabled={resetL}>{resetL?"Actualizando...":"✦  Actualizar Contraseña"}</button>
            <button onClick={()=>setScreen("login")} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:"10px", cursor:"pointer", letterSpacing:"1.5px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center" }}>Volver al inicio</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <div style={{ fontFamily:"'Jost',sans-serif", background:"var(--bg)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{CSS}</style>
      <div style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ fontSize:"26px", fontWeight:800, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:"4px" }}>
            STYLE<span style={{ color:"var(--accent)" }}>VAULT</span>
          </div>
          <div style={{ fontSize:"11px", letterSpacing:"2px", color:"var(--text3)", textTransform:"uppercase", fontWeight:500 }}>{t.appSub}</div>
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", flexWrap:"wrap", marginTop:"16px" }}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={()=>changeLang(l.code as LangCode)}
                style={{ padding:"6px 10px", background:lang===l.code?"var(--accent)":"var(--bg3)", border:`1px solid ${lang===l.code?"var(--accent)":"var(--border)"}`, borderRadius:"20px", cursor:"pointer", fontSize:"16px", transition:"all .2s" }}>
                {l.flag}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ display:"flex", marginBottom:"24px", borderBottom:"1px solid var(--border)" }}>
            {["login","register"].map(m => (
              <button key={m} onClick={()=>{setLmode(m);setLerr("");}} style={{ flex:1, padding:"11px", background:"none", border:"none", borderBottom:`2px solid ${lmode===m?"var(--gold)":"transparent"}`, color:lmode===m?"var(--gold)":"var(--text3)", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", fontWeight:500 }}>
                {m==="login"?t.login:t.register}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"11px" }}>
            {lmode==="register" && (
              <>
                <input className="inp" placeholder="Tu nombre completo" value={lf.name} onChange={e=>setLf(p=>({...p,name:e.target.value}))} />
                <div>
                  <div style={{ fontSize:"11px", color:"var(--text2)", fontWeight:600, marginBottom:"8px" }}>¿Cómo te identificas?</div>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {[{id:"Mujer",icon:"👩",label:"Mujer"},{id:"Hombre",icon:"👨",label:"Hombre"},{id:"Otro",icon:"⭐",label:"Otro"}].map(g => (
                      <button key={g.id} type="button" onClick={()=>setLf(p=>({...p,genero:g.id}))}
                        style={{ flex:1, padding:"12px 6px", background:lf.genero===g.id?"var(--accent)":"var(--bg3)", color:lf.genero===g.id?"#fff":"var(--text2)", border:`2px solid ${lf.genero===g.id?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font)", fontSize:"12px", fontWeight:600, transition:"all .2s" }}>
                        <div style={{ fontSize:"18px", marginBottom:"2px" }}>{g.icon}</div>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <input className="inp" placeholder="Correo electrónico" type="email" value={lf.email} onChange={e=>setLf(p=>({...p,email:e.target.value}))} />
            <input className="inp" placeholder="Contraseña" type="password" value={lf.password} onChange={e=>setLf(p=>({...p,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&(lmode==="login"?handleLogin():handleRegister())} />
            {lerr && <div style={{ color:"var(--red)", fontSize:"12px", textAlign:"center" }}>{lerr}</div>}
            <button className="btn-p" style={{ marginTop:"6px" }} onClick={lmode==="login"?handleLogin:handleRegister} disabled={aloading}>
              {aloading?"...":lmode==="login"?`✦  ${t.enter}`:`✦  ${t.createAccount}`}
            </button>
            {lmode==="login" && (
              <button onClick={async()=>{
                if (!lf.email) { setLerr("Escribe tu correo primero"); return; }
                const res = await fetch(`${SB_URL}/auth/v1/recover`, { method:"POST", headers:{"Content-Type":"application/json", apikey:SB_KEY, Authorization:`Bearer ${SB_KEY}`}, body:JSON.stringify({ email:lf.email }) });
                setLerr(res.ok?"✅ Revisa tu correo para recuperar tu contraseña":"Error al enviar.");
              }} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:"10px", cursor:"pointer", letterSpacing:"1.5px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center" }}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── ONBOARDING ────────────────────────────────────────────────────────────
  if (screen === "onboarding") return (
    <div className="sv fade">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <div style={{ padding:"24px 20px 40px", minHeight:"100vh", background:"var(--bg)" }}>

        {/* Step indicators */}
        {obStep < 4 && (
          <div className="onboard-step">
            {[1,2,3].map(s => <div key={s} className={`onboard-dot ${obStep===s?"on":""}`} />)}
          </div>
        )}

        {/* STEP 1: Welcome */}
        {obStep===1 && (
          <div className="fade">
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <div className="serif" style={{ fontSize:"22px", letterSpacing:"6px", color:"var(--gold)", fontWeight:300, marginBottom:"24px" }}>STYLE<em>VAULT</em></div>
              <div style={{ fontSize:"48px", marginBottom:"20px" }}>🧬</div>
              <div className="serif" style={{ fontSize:"32px", fontWeight:300, marginBottom:"12px" }}>{t.createAvatar}</div>
              <div style={{ fontSize:"14px", color:"var(--text2)", lineHeight:1.7, maxWidth:"320px", margin:"0 auto" }}>
                Tu estilista personal necesita conocerte para crear una versión digital de ti y darte recomendaciones perfectas.
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"32px" }}>
              {["Análisis facial y corporal con IA", "Fashion DNA™ personalizado", "Recomendaciones basadas en tu cuerpo real", "Prueba outfits antes de vestirte"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"2px" }}>
                  <div style={{ color:"var(--gold)", fontSize:"14px" }}>✦</div>
                  <div style={{ fontSize:"13px", color:"var(--text2)" }}>{f}</div>
                </div>
              ))}
            </div>
            <button className="btn-p" onClick={()=>setObStep(2)}>{t.begin}</button>
            <button onClick={()=>{ setScreen("app"); }} style={{ background:"none", border:"none", color:"var(--text2)", fontSize:"11px", cursor:"pointer", letterSpacing:"1px", fontFamily:"'Jost',sans-serif", textDecoration:"underline", textAlign:"center", width:"100%", marginTop:"16px", padding:"8px" }}>
              Omitir — configurar después
            </button>
          </div>
        )}

        {/* STEP 2: Basic info */}
        {obStep===2 && (
          <div className="fade">
            <div style={{ marginBottom:"28px" }}>
              <div className="serif" style={{ fontSize:"28px", fontWeight:300, marginBottom:"8px" }}>{t.basicInfo}</div>
              <div style={{ fontSize:"12px", color:"var(--text2)" }}>Solo lo que la IA no puede detectar por sí sola</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"24px" }}>
              <div>
                <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"12px" }}>¿Cómo te identificas?</div>
                <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
                  {["Mujer","Hombre","Prefiero no decir"].map(g => (
                    <button key={g} onClick={()=>{ setObInfo(p=>({...p,genero:g})); applyTheme(g); }}
                      style={{ flex:1, padding:"14px 8px", background:obInfo.genero===g?"var(--accent)":"var(--bg3)", color:obInfo.genero===g?"#fff":"var(--text2)", border:`2px solid ${obInfo.genero===g?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font)", fontSize:"12px", fontWeight:600, transition:"all .2s" }}>
                      {g==="Mujer"?"👩":g==="Hombre"?"👨":"⭐"} {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:"11px", fontWeight:600, color:"var(--text2)", letterSpacing:".5px", marginBottom:"6px" }}>Nombre</div>
                <input className="inp" placeholder="Tu nombre" value={obInfo.nombre} onChange={e=>setObInfo(p=>({...p,nombre:e.target.value}))} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Edad</div>
                  <input className="inp" placeholder="Años" type="number" value={obInfo.edad} onChange={e=>setObInfo(p=>({...p,edad:e.target.value}))} />
                </div>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Altura (cm)</div>
                  <input className="inp" placeholder="170" type="number" value={obInfo.altura} onChange={e=>setObInfo(p=>({...p,altura:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Peso aprox. (kg)</div>
                  <input className="inp" placeholder="70" type="number" value={obInfo.peso} onChange={e=>setObInfo(p=>({...p,peso:e.target.value}))} />
                </div>
                <div>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"6px" }}>Color de ojos</div>
                  <input className="inp" placeholder="Café, verde..." value={obInfo.ojos} onChange={e=>setObInfo(p=>({...p,ojos:e.target.value}))} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Tipo de cabello</div>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                  {[t.straight,t.wavy,t.curly,t.afro].map(hair => (
                    <button key={t} className={`pill ${obInfo.cabello===t?"on":""}`} onClick={()=>setObInfo(p=>({...p,cabello:t}))}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button className="btn-o" onClick={()=>setObStep(1)}>← Atrás</button>
              <button className="btn-p" onClick={()=>setObStep(3)} disabled={!obInfo.nombre||!obInfo.altura} style={{ flex:1 }}>Continuar →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Photos */}
        {obStep===3 && (
          <div className="fade">
            <div style={{ marginBottom:"24px" }}>
              <div className="serif" style={{ fontSize:"28px", fontWeight:300, marginBottom:"8px" }}>{t.smartScan}</div>
              <div style={{ fontSize:"12px", color:"var(--text2)" }}>3 fotos para crear tu avatar con máxima precisión</div>
            </div>

            <input ref={selfieRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleObPhoto("selfie")} />
            <input ref={frontRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleObPhoto("front")} />
            <input ref={sideRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleObPhoto("side")} />

            <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"24px" }}>
              {[
                { key:"selfie", ref:selfieRef, label:t.photo1, tips:(t.photoTips1 as string[] | undefined) ?? ["Buena iluminación","Sin lentes oscuros","Rostro completamente visible"], icon:"🤳" },
                { key:"front", ref:frontRef, label:t.photo2, tips:(t.photoTips2 as string[] | undefined) ?? ["De pie","Brazos relajados","Fondo simple"], icon:"🧍" },
                { key:"side", ref:sideRef, label:t.photo3, tips:(t.photoTips3 as string[] | undefined) ?? ["Perfil completo","Fondo simple"], icon:"🚶" },
              ].map(({ key, ref, label, tips, icon }) => (
                <div key={key} className={`photo-upload-box ${obPhotos[key as keyof typeof obPhotos]?"done":""}`} onClick={()=>ref.current?.click()}>
                  {obPhotos[key as keyof typeof obPhotos] ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"4px 0" }}>
                      <img src={obPhotos[key as keyof typeof obPhotos]!} alt={key} style={{ width:"60px", height:"60px", objectFit:"cover", borderRadius:"2px" }} />
                      <div>
                        <div style={{ fontSize:"12px", color:"var(--green)", marginBottom:"4px" }}>✓ {label}</div>
                        <div style={{ fontSize:"10px", color:"var(--text2)" }}>{t.tapToChange}</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:"32px", marginBottom:"8px" }}>{icon}</div>
                      <div style={{ fontSize:"12px", fontWeight:500, marginBottom:"8px" }}>{label}</div>
                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"center" }}>
                        {tips.map(t => <span key={t} style={{ fontSize:"10px", color:"var(--text2)", background:"var(--bg2)", padding:"3px 8px", borderRadius:"20px", border:"1px solid var(--border)" }}>{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {obAnalyzing ? (
              <div style={{ textAlign:"center", padding:"20px" }}>
                <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginBottom:"16px" }}>
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                </div>
                <div style={{ fontSize:"13px", color:"var(--gold)" }}>{obAnalysisStep}</div>
              </div>
            ) : (
              <div style={{ display:"flex", gap:"10px" }}>
                <button className="btn-o" onClick={()=>setObStep(2)}>← Atrás</button>
                <button className="btn-p" onClick={analyzeWithAI} disabled={!obPhotos.selfie||!obPhotos.front||!obPhotos.side} style={{ flex:1 }}>
                  🧬 Analizar con IA
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: DNA Result */}
        {obStep===4 && dna && (
          <div className="fade">
            <div style={{ textAlign:"center", marginBottom:"28px" }}>
              <div style={{ fontSize:"40px", marginBottom:"12px" }}>🎉</div>
              <div className="serif" style={{ fontSize:"28px", fontWeight:300, marginBottom:"8px" }}>Tu Avatar IA está listo</div>
              <div style={{ fontSize:"12px", color:"var(--text2)" }}>Nivel de precisión: {dna.precisionLevel || 92}%</div>
            </div>

            {/* DNA Card */}
            <div className="card card-accent" style={{ marginBottom:"14px" }}>
              <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"16px" }}>✦ Fashion DNA™</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
                {[
                  { label:t.bodyType, value:dna.bodyType },
                  { label:t.skinTone, value:dna.skinTone },
                  { label:t.undertone, value:dna.skinUndertone },
                  { label:t.faceShape, value:dna.faceShape },
                  { label:t.neckType, value:dna.neckType },
                  { label:t.posture, value:dna.posture },
                ].map(item => (
                  <div key={item.label} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"10px" }}>
                    <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"4px" }}>{item.label}</div>
                    <div style={{ fontSize:"12px", color:"var(--text)" }}>{item.value || "—"}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Colores ideales</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {dna.idealColors?.map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                </div>
              </div>

              <div style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Estilos recomendados</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {dna.recommendedStyles?.map((s: string) => <span key={s} className="dna-tag dna-style">{s}</span>)}
                </div>
              </div>

              {dna.styleAdvice && (
                <div style={{ background:"var(--bg)", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"12px", borderRadius:"0 2px 2px 0" }}>
                  <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.7 }}>{dna.styleAdvice}</div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <button className="btn-p" onClick={()=>{ setScreen("app"); }}>Ver mi Armario →</button>
              <button className="btn-o" onClick={()=>{ setTab("outfit"); setScreen("app"); }}>Crear mi primer outfit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  return (
    <div className="sv">
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handlePhoto} />

      <header style={{ padding:"16px 18px 12px", background:"var(--header-bg)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
        <div>
          <div style={{ fontSize:"18px", fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px", fontFamily:"var(--font)" }}>
            STYLE<span style={{ color:"var(--accent)" }}>VAULT</span>
          </div>
          <div style={{ fontSize:"9px", letterSpacing:"2px", color:"var(--text3)", marginTop:"1px", textTransform:"uppercase", fontWeight:500 }}>{t.armarioInteligente}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          {isPremium && <span className="premium-badge">Premium</span>}
          {/* Language selector */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowLangMenu(!showLangMenu)} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"30px", padding:"6px 12px", cursor:"pointer", fontSize:"18px", display:"flex", alignItems:"center", gap:"4px" }}>
              {LANGUAGES.find(l=>l.code===lang)?.flag}
              <span style={{ fontSize:"9px", color:"var(--text2)", fontWeight:600 }}>▾</span>
            </button>
            {showLangMenu && (
              <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"6px", zIndex:200, minWidth:"160px", boxShadow:"var(--card-shadow)" }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={()=>changeLang(l.code as LangCode)}
                    style={{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"8px 10px", background:lang===l.code?"var(--accent-light)":"transparent", border:"none", borderRadius:"6px", cursor:"pointer", fontFamily:"var(--font)", fontSize:"12px", color:lang===l.code?"var(--accent)":"var(--text)", fontWeight:lang===l.code?600:400, textAlign:"left" }}>
                    <span style={{ fontSize:"18px" }}>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ textAlign:"right", cursor:"pointer", padding:"6px 10px", background:"var(--bg3)", borderRadius:"30px", border:"1px solid var(--border)" }} onClick={handleLogout}>
            <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text)" }}>{profile?.name?.split(" ")[0]}</div>
            <div style={{ fontSize:"9px", color:"var(--accent)", fontWeight:500 }}>{t.exit}</div>
          </div>
        </div>
      </header>

      <main style={{ padding:"16px 14px 90px", overflowY:"auto" }}>

        {/* HOME */}
        {tab==="home" && (
          <div className="fade">
            {/* Hero */}
            <div style={{ background:`linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)`, borderRadius:"var(--radius)", padding:"22px 20px", marginBottom:"18px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:"-10px", top:"-10px", width:"120px", height:"120px", background:"rgba(255,255,255,.08)", borderRadius:"50%" }}/>
              <div style={{ position:"absolute", right:"20px", bottom:"-20px", width:"80px", height:"80px", background:"rgba(255,255,255,.06)", borderRadius:"50%" }}/>
              <div style={{ fontSize:"22px", fontWeight:700, color:"#fff", marginBottom:"4px" }}>{t.hello} {profile?.name?.split(" ")[0]} 👋</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", marginBottom:"16px" }}>
                {dna?.bodyType ? t.styleReady : t.wardrobeReady}
              </div>
              {dna?.bodyType && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,.15)", borderRadius:"30px", padding:"6px 14px" }}>
                  <span style={{ fontSize:"11px", color:"#fff", fontWeight:600 }}>✦ {dna.bodyType}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:"10px", marginBottom:"18px" }}>
              {[
                { label:t.items, value:clothes.length, icon:"👗" },
                { label:t.favorites, value:favClothes.length, icon:"❤️" },
                { label:t.outfits, value:outfitR?1:0, icon:"✨" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize:"22px", marginBottom:"6px" }}>{s.icon}</div>
                  <div style={{ fontSize:"24px", fontWeight:700, color:"var(--accent)", marginBottom:"2px" }}>{s.value}</div>
                  <div style={{ fontSize:"10px", color:"var(--text2)", fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* DNA Preview */}
            {dna?.bodyType ? (
              <div className="card card-accent" style={{ marginBottom:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase" }}>{t.yourDNA}</div>
                  <button className="btn-g" onClick={()=>setTab("dna")}>{t.viewComplete}</button>
                </div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {dna.idealColors?.slice(0,4).map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                  {dna.recommendedStyles?.slice(0,2).map((s: string) => <span key={s} className="dna-tag dna-style">{s}</span>)}
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginBottom:"14px", borderColor:"rgba(196,151,63,.15)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"6px" }}>🧬 Fashion DNA™</div>
                    <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.5 }}>{t.createProfile}</div>
                  </div>
                  <button className="btn-o" style={{ fontSize:"9px", padding:"7px 12px", flexShrink:0, marginLeft:"12px" }} onClick={()=>setScreen("onboarding")}>{t.create}</button>
                </div>
              </div>
            )}

            {/* Outfit del día */}
            <div className="card card-accent" style={{ marginBottom:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <div>
                  <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>{t.outfitOfDay}</div>
                  <div style={{ fontSize:"12px", color:"var(--text2)", marginTop:"2px" }}>{t.personalizedForYou}</div>
                </div>
                <button className="btn-o" style={{ fontSize:"9px", padding:"7px 12px" }} onClick={()=>setTab("outfit")}>{t.create}</button>
              </div>
              {outfitR ? (
                <div>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"8px" }}>
                    {outfitR.outfit?.slice(0,3).map((item: any, i: number) => (
                      <div key={i} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"7px 11px", fontSize:"12px" }}>{item.emoji} {item.name}</div>
                    ))}
                  </div>
                  {outfitR.rating > 0 && <div className="stars">{renderStars(outfitR.rating)} <span style={{ fontSize:"11px", color:"var(--text3)" }}>{outfitR.rating}/5</span></div>}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"16px", color:"var(--text3)", fontSize:"12px" }}>
                  {clothes.length === 0 ? t.addItemsFirst : t.tapCreate}
                </div>
              )}
            </div>

            {/* Virtual Try promo */}
            <div className="card" style={{ marginBottom:"14px", background:"linear-gradient(135deg,var(--bg2),var(--bg3))", borderColor:"rgba(196,151,63,.2)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"6px" }}>{t.virtualTry}</div>
                  <div style={{ fontSize:"14px", fontWeight:400, marginBottom:"6px" }}>{t.seeHowItFits}</div>
                  <div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.5, marginBottom:"12px" }}>{t.basedOnDNA}</div>
                  <button className="btn-p" style={{ width:"auto", padding:"10px 18px" }} onClick={()=>setTab("avatar")}>
                    {isPremium ? t.tryNow : t.seePremium}
                  </button>
                </div>
                <div style={{ fontSize:"44px", opacity:.25 }}>🧍</div>
              </div>
            </div>

            {clothes.length > 0 && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"2px", textTransform:"uppercase" }}>{t.recentItems}</div>
                  <button className="btn-g" onClick={()=>setTab("wardrobe")}>{t.viewAll}</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
                  {clothes.slice(0,6).map(item => (
                    <div key={item.id} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"2px", overflow:"hidden", position:"relative" }}>
                      <button onClick={()=>toggleFav(item.id)} style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(0,0,0,.6)", border:"none", fontSize:"11px", cursor:"pointer", width:"20px", height:"20px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {favorites.includes(item.id)?"❤️":"🤍"}
                      </button>
                      {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                      <div style={{ padding:"6px 7px" }}><div style={{ fontSize:"10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DNA TAB */}
        {tab==="dna" && (
          <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Fashion DNA™</div>
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>Tu perfil de moda personalizado</div>
            </div>

            {!dna?.bodyType ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"16px", opacity:.3 }}>🧬</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px" }}>Aún no has creado tu Fashion DNA™</div>
                <button className="btn-p" onClick={()=>setScreen("onboarding")}>Crear mi Fashion DNA™</button>
              </div>
            ) : (
              <>
                <div className="card card-accent" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"16px" }}>{t.bodyAnalysis}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"14px" }}>
                    {[
                      { label:t.bodyType, value:dna.bodyType },
                      { label:t.skinTone, value:dna.skinTone },
                      { label:t.undertone, value:dna.skinUndertone },
                      { label:t.faceShape, value:dna.faceShape },
                      { label:t.neckType, value:dna.neckType },
                      { label:t.posture, value:dna.posture },
                    ].map(item => (
                      <div key={item.label} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"10px" }}>
                        <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"4px" }}>{item.label}</div>
                        <div style={{ fontSize:"12px" }}>{item.value || "—"}</div>
                      </div>
                    ))}
                  </div>
                  {dna.bodyProportions && (
                    <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"2px", padding:"12px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"9px", color:"var(--text3)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Proporciones</div>
                      {Object.entries(dna.bodyProportions).map(([k, v]) => (
                        <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid var(--border)" }}>
                          <span style={{ fontSize:"11px", color:"var(--text2)", textTransform:"capitalize" }}>{k}</span>
                          <span style={{ fontSize:"11px" }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Colores que te favorecen</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"14px" }}>
                    {dna.idealColors?.map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                  </div>
                  <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Colores a evitar</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {dna.colorsToAvoid?.map((c: string) => <span key={c} className="dna-tag dna-avoid">{c}</span>)}
                  </div>
                </div>

                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Prendas recomendadas</div>
                  {dna.recommendedClothes?.map((r: string, i: number) => (
                    <div key={i} style={{ display:"flex", gap:"8px", padding:"6px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ color:"var(--green)" }}>✓</span>
                      <span style={{ fontSize:"12px", color:"var(--text2)" }}>{r}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"2px", textTransform:"uppercase", margin:"14px 0 10px" }}>Prendas a evitar</div>
                  {dna.clothesToAvoid?.map((r: string, i: number) => (
                    <div key={i} style={{ display:"flex", gap:"8px", padding:"6px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ color:"var(--red)" }}>✗</span>
                      <span style={{ fontSize:"12px", color:"var(--text2)" }}>{r}</span>
                    </div>
                  ))}
                </div>

                {dna.topTips && (
                  <div className="card card-accent" style={{ marginBottom:"14px" }}>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Tips personalizados</div>
                    {dna.topTips.map((tip: string, i: number) => (
                      <div key={i} style={{ display:"flex", gap:"10px", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <span style={{ color:"var(--gold)", flexShrink:0 }}>✦</span>
                        <span style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn-o" onClick={()=>setScreen("onboarding")} style={{ width:"100%" }}>🔄 Actualizar mi Fashion DNA™</button>
              </>
            )}
          </div>
        )}

        {/* WARDROBE */}
        {tab==="wardrobe" && (
          <div className="fade">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
              <div>
                <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>{t.myWardrobe}</div>
                <div style={{ fontSize:"10px", color:"var(--text2)", marginTop:"3px" }}>{clothes.length} {t.items}</div>
              </div>
              <button className="btn-o" onClick={()=>setSF(!showForm)}>{t.addItem}</button>
            </div>

            {showForm && (
              <div className="card card-gold fade" style={{ marginBottom:"18px" }}>
                <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"14px" }}>✦ Nueva Prenda</div>
                <div className="pbox" style={{ height:"150px", marginBottom:"10px" }} onClick={()=>fileRef.current?.click()}>
                  {pp ? <img src={pp} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : (
                    <div style={{ textAlign:"center", color:"var(--text3)" }}>
                      <div style={{ fontSize:"28px", marginBottom:"6px" }}>📷</div>
                      <div style={{ fontSize:"10px", letterSpacing:"1px" }}>Foto → IA analiza automáticamente</div>
                    </div>
                  )}
                </div>
                {analyzing && <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 0", color:"var(--gold)", fontSize:"11px" }}><div className="dot"/><div className="dot"/><div className="dot"/><span style={{ marginLeft:"6px" }}>Analizando...</span></div>}
                <div style={{ display:"flex", gap:"7px", marginBottom:"12px" }}>
                  <button className="btn-g" style={{ flex:1, border:"1px solid var(--border)", borderRadius:"1px" }} onClick={()=>fileRef.current?.click()}>📁 Galería</button>
                  <button className="btn-g" style={{ flex:1, border:"1px solid var(--border)", borderRadius:"1px" }} onClick={()=>camRef.current?.click()}>📷 Cámara</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
                  <input className="inp" placeholder="Nombre de la prenda" value={ni.name} onChange={e=>setNi(p=>({...p,name:e.target.value}))} />
                  <select className="sel" value={ni.category} onChange={e=>setNi(p=>({...p,category:e.target.value}))}>
                    {allCategories.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <select className="sel" value={ni.occasion} onChange={e=>setNi(p=>({...p,occasion:e.target.value}))}>
                    <option value="">Ocasión</option>
                    {OCCASIONS.map(o=><option key={o}>{o}</option>)}
                  </select>
                  <select className="sel" value={ni.season} onChange={e=>setNi(p=>({...p,season:e.target.value}))}>
                    {SEASONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <div style={{ display:"flex", gap:"9px", marginTop:"4px" }}>
                    <button className="btn-p" onClick={addItem} style={{ flex:1 }}>{t.save}</button>
                    <button className="btn-o" onClick={()=>{setSF(false);setPp(null);}}>{t.cancel}</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"14px", flexWrap:"nowrap" }}>
              {[{key:"__ALL__", label:t.all ?? "Todo"},...allCategories.map(c=>({key:c,label:c}))].map(({key,label}) => <button key={key} className={`pill ${fc===key?"on":""}`} onClick={()=>setFc(key)}>{label}</button>)}
              {customCats.map(c => <button key={c+"_x"} onClick={()=>removeCustomCategory(c)} style={{ padding:"3px 7px", background:"rgba(231,76,60,.08)", border:"1px solid rgba(231,76,60,.2)", borderRadius:"20px", color:"var(--red)", fontSize:"9px", cursor:"pointer", flexShrink:0 }}>✕</button>)}
              <button onClick={()=>setShowAddCat(!showAddCat)} className="pill" style={{ borderStyle:"dashed", color:"var(--gold)", borderColor:"rgba(196,151,63,.3)", flexShrink:0 }}>{t.addCat}</button>
            </div>
            {showAddCat && (
              <div style={{ display:"flex", gap:"7px", marginBottom:"12px" }}>
                <input className="inp" placeholder={t.newCategory as string} value={newCatInput} onChange={e=>setNewCatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomCategory()} style={{ flex:1, padding:"9px 12px", fontSize:"12px" }} />
                <button onClick={addCustomCategory} className="btn-o" style={{ padding:"9px 14px", fontSize:"10px" }}>+</button>
              </div>
            )}

            {cloading ? <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"50px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>
            : filtered.length===0 ? <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text3)", fontSize:"12px" }}>{clothes.length===0?t.wardrobeEmpty:t.noItemsInCat}</div>
            : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {filtered.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <div style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, display:"flex", gap:"4px" }}>
                      <button onClick={()=>toggleFav(item.id)} style={{ background:"rgba(0,0,0,.7)", border:"none", fontSize:"11px", cursor:"pointer", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{favorites.includes(item.id)?"❤️":"🤍"}</button>
                      <button onClick={()=>removeItem(item.id)} style={{ background:"rgba(0,0,0,.7)", border:"none", color:"var(--text2)", cursor:"pointer", fontSize:"10px", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                    {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:400, marginBottom:"2px" }}>{item.name}</div>
                      <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{item.category}</div>
                      {item.occasion && <div style={{ fontSize:"10px", color:"rgba(196,151,63,.5)", marginTop:"2px" }}>{item.occasion}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OUTFIT */}
        {tab==="outfit" && (
          <div className="fade">

            {/* Hero */}
            <div style={{ background:`linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)`, borderRadius:"var(--radius)", padding:"24px 20px 20px", marginBottom:"20px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:"-20px", top:"-20px", width:"130px", height:"130px", background:"rgba(255,255,255,.07)", borderRadius:"50%" }}/>
              <div style={{ fontSize:"22px", fontWeight:700, color:"#fff", marginBottom:"6px" }}>{t.whereTo}</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.75)", lineHeight:1.5 }}>{t.whereToSub}</div>
            </div>

            {/* Input */}
            <div className="card" style={{ marginBottom:"16px" }}>
              <textarea
                className="inp"
                placeholder={t.outfitPlaceholder ?? "Ej: Cena romántica en restaurante elegante\nEntrevista de trabajo para gerente\nFiesta en la playa\nViaje a Nueva York por 5 días..."}
                value={outfitPrompt}
                onChange={e=>setOutfitPrompt(e.target.value)}
                style={{ resize:"none", minHeight:"100px", lineHeight:1.6, borderRadius:"var(--radius-sm)" }}
              />
              <div style={{ display:"flex", gap:"7px", flexWrap:"wrap", marginTop:"12px" }}>
                {(t.outfitChips ?? ["Cena romántica","Entrevista de trabajo","Fiesta elegante","Día casual","Reunión de negocios","Viaje"]).map((s: string) => (
                  <button key={s} onClick={()=>setOutfitPrompt(s)} className="pill" style={{ fontSize:"11px", padding:"6px 12px" }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Source selector */}
            <div className="card" style={{ marginBottom:"18px" }}>
              <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"14px" }}>{t.withWardrobeQuestion ?? (lang==="es" ? "¿Con qué armario creamos el outfit?" : lang==="en" ? "Which wardrobe do we use?" : lang==="pt" ? "Com qual guarda-roupa criamos o outfit?" : lang==="fr" ? "Quelle garde-robe utilisons-nous?" : lang==="de" ? "Welchen Kleiderschrank verwenden wir?" : "¿Con qué armario creamos el outfit?")}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {[
                  { id:"wardrobe", icon:"👔", label:t.withMyWardrobe, desc:t.withMyWardrobeDesc },
                  { id:"new", icon:"✨", label:t.noWardrobe, desc:t.noWardrobeDesc },
                  { id:"mixed", icon:"🔥", label:t.mixedWardrobe, desc:t.mixedWardrobeDesc, premium:true },
                ].map(opt => (
                  <button key={opt.id} onClick={()=>(!opt.premium||isPremium)&&setOutfitSource(opt.id)}
                    style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px", background:outfitSource===opt.id?"var(--accent-light)":"var(--bg3)", border:`2px solid ${outfitSource===opt.id?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:opt.premium&&!isPremium?"not-allowed":"pointer", transition:"all .2s", opacity:opt.premium&&!isPremium?.6:1, textAlign:"left", width:"100%" }}>
                    <div style={{ fontSize:"26px", flexShrink:0 }}>{opt.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px" }}>
                        <span style={{ fontSize:"13px", fontWeight:600, color:outfitSource===opt.id?"var(--accent)":"var(--text)" }}>{opt.label}</span>
                        {opt.premium && !isPremium && <span style={{ fontSize:"9px", background:"var(--accent)", color:"#fff", padding:"2px 7px", borderRadius:"20px", fontWeight:600 }}>PREMIUM</span>}
                      </div>
                      <div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.4 }}>{opt.desc}</div>
                    </div>
                    {outfitSource===opt.id && <div style={{ color:"var(--accent)", fontSize:"18px", flexShrink:0 }}>✓</div>}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-p" onClick={generateSmartOutfit} disabled={!outfitPrompt.trim()||smartOutfitL} style={{ marginBottom:"20px" }}>
              {smartOutfitL ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
                  <span>{smartOutfitSteps || "Generando tu outfit..."}</span>
                </span>
              ) : t.generateOutfit}
            </button>

            {smartOutfitL && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"32px 20px" }}>
                <div style={{ display:"flex", gap:"6px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>
                <div style={{ fontSize:"13px", color:"var(--accent)", fontWeight:500 }}>{smartOutfitSteps}</div>
              </div>
            )}

            {/* Result */}
            {smartOutfit && !smartOutfitL && (
              <div className="fade">
                <div className="divider"/>

                {/* Stylist greeting */}
                {smartOutfit.greeting && (
                  <div style={{ background:"var(--accent-light)", border:"1px solid var(--accent-glow)", borderRadius:"var(--radius)", padding:"16px 18px", marginBottom:"16px", borderLeft:"4px solid var(--accent)" }}>
                    <div style={{ fontSize:"11px", fontWeight:600, color:"var(--accent)", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"1px" }}>✦ Tu Estilista Personal</div>
                    <div style={{ fontSize:"14px", color:"var(--text)", lineHeight:1.6, fontStyle:"italic" }}>"{smartOutfit.greeting}"</div>
                  </div>
                )}

                {/* Compatibility score */}
                {smartOutfit.compatibility > 0 && (
                  <div className="card" style={{ marginBottom:"16px", textAlign:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"20px" }}>
                      <div>
                        <div style={{ fontSize:"48px", fontWeight:800, color:"var(--accent)", lineHeight:1 }}>{smartOutfit.compatibility}%</div>
                        <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text2)", marginTop:"4px" }}>Compatible contigo</div>
                      </div>
                      <div style={{ flex:1, textAlign:"left" }}>
                        {smartOutfit.compatibilityReasons?.slice(0,3).map((r: string, i: number) => (
                          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"6px", marginBottom:"6px" }}>
                            <span style={{ color:"var(--green)", fontSize:"13px", flexShrink:0 }}>✓</span>
                            <span style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.4 }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Outfit items */}
                <div style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>Tu outfit completo</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"16px" }}>
                  {smartOutfit.outfit?.map((item: any, i: number) => (
                    <div key={i} style={{ display:"flex", gap:"14px", padding:"14px 16px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", boxShadow:"var(--card-shadow)", alignItems:"flex-start" }}>
                      <div style={{ fontSize:"32px", flexShrink:0 }}>{item.emoji}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"4px" }}>
                          <div style={{ fontSize:"14px", fontWeight:600, color:"var(--text)" }}>{item.prenda}</div>
                          {item.esDeArmario && (
                            <span style={{ fontSize:"9px", background:"var(--accent-light)", color:"var(--accent)", padding:"2px 8px", borderRadius:"20px", fontWeight:600, flexShrink:0, marginLeft:"8px" }}>Tu armario</span>
                          )}
                        </div>
                        <div style={{ fontSize:"11px", color:"var(--accent)", fontWeight:500, marginBottom:"4px" }}>{item.color}</div>
                        <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.5 }}>{item.razon}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Accessories */}
                {smartOutfit.accesorios?.length > 0 && (
                  <div style={{ marginBottom:"16px" }}>
                    <div style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"10px" }}>Accesorios recomendados</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                      {smartOutfit.accesorios.map((acc: any, i: number) => (
                        <div key={i} style={{ padding:"12px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", textAlign:"center" }}>
                          <div style={{ fontSize:"24px", marginBottom:"4px" }}>{acc.emoji}</div>
                          <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text)", marginBottom:"3px" }}>{acc.item}</div>
                          <div style={{ fontSize:"10px", color:"var(--text2)" }}>{acc.razon}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color palette */}
                {smartOutfit.colores && (
                  <div className="card" style={{ marginBottom:"16px" }}>
                    <div style={{ fontSize:"12px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>Paleta de colores</div>
                    <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
                      {[smartOutfit.colores.principal, smartOutfit.colores.complementario, smartOutfit.colores.acento].filter(Boolean).map((c: string, i: number) => (
                        <div key={i} style={{ flex:1, textAlign:"center" }}>
                          <div style={{ height:"40px", background:"var(--accent-light)", borderRadius:"var(--radius-sm)", marginBottom:"6px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:600, color:"var(--accent)", border:"1px solid var(--border)" }}>{c}</div>
                        </div>
                      ))}
                    </div>
                    {smartOutfit.colores.paleta && <div style={{ fontSize:"12px", color:"var(--text2)", fontStyle:"italic" }}>{smartOutfit.colores.paleta}</div>}
                  </div>
                )}

                {/* Stylist advice */}
                {smartOutfit.stylistAdvice && (
                  <div style={{ background:"var(--accent-light)", borderRadius:"var(--radius)", padding:"16px", marginBottom:"16px", borderLeft:"3px solid var(--accent)" }}>
                    <div style={{ fontSize:"11px", fontWeight:600, color:"var(--accent)", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"1px" }}>Consejo de tu estilista</div>
                    <div style={{ fontSize:"13px", color:"var(--text)", lineHeight:1.6 }}>{smartOutfit.stylistAdvice}</div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
                  <button className="btn-p" onClick={saveSmartOutfit}>💾 Guardar outfit</button>
                  <button className="btn-o" onClick={()=>{setSmartOutfit(null);setOutfitPrompt("");}}>🔄 Nuevo outfit</button>
                </div>
                <button className="btn-o" onClick={generateSmartOutfit} style={{ width:"100%" }}>✨ Generar otra opción</button>

                {/* Divider to saved */}
                {savedOutfits.length > 0 && (
                  <div style={{ marginTop:"24px" }}>
                    <div className="divider"/>
                    <div style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>Outfits guardados</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                      {savedOutfits.slice(0,3).map((s: any, i: number) => (
                        <div key={i} className="card" style={{ padding:"12px 14px" }}>
                          <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{s.saveTitle || s.prompt}</div>
                          <div style={{ fontSize:"10px", color:"var(--text2)" }}>{new Date(s.date).toLocaleDateString("es-MX")} · {s.compatibility}% compatible</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── GENERADOR CLÁSICO (original) ── */}
            <div className="divider" style={{ margin:"24px 0 20px" }}/>
            <div style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>Generador por evento</div>
            <div style={{ fontSize:"12px", color:"var(--text2)", marginBottom:"16px" }}>Selecciona el evento y temporada</div>

            {clothes.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px", color:"var(--text3)", fontSize:"13px" }}>Agrega prendas a tu armario primero</div>
            ) : (
              <>
                <div className="card" style={{ marginBottom:"12px" }}>
                  <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text2)", marginBottom:"12px" }}>¿Para qué evento?</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px" }}>
                    {EVENTS.map(ev => (
                      <button key={ev} onClick={()=>setSelEv(ev)} style={{ padding:"10px 8px", background:selEv===ev?"var(--accent-light)":"var(--bg3)", color:selEv===ev?"var(--accent)":"var(--text2)", border:`2px solid ${selEv===ev?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:"pointer", fontFamily:"var(--font)", fontSize:"11px", textAlign:"left", transition:"all .2s", fontWeight:selEv===ev?600:400 }}>{ev}</button>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ marginBottom:"16px" }}>
                  <div style={{ fontSize:"12px", fontWeight:600, color:"var(--text2)", marginBottom:"10px" }}>Temporada</div>
                  <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                    {SEASONS.map(s => <button key={s} className={`pill ${selSe===s?"on":""}`} onClick={()=>setSelSe(s)}>{s}</button>)}
                  </div>
                </div>
                <button className="btn-p" onClick={generateOutfit} disabled={!selEv||outfitL} style={{ marginBottom:"18px" }}>
                  {outfitL?"Creando outfit...":"✦  Generar Outfit con IA"}
                </button>
                {outfitL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"24px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                {outfitR && !outfitL && (
                  <div className="fade">
                    <div className="divider"/>
                    {outfitR.rating > 0 && (
                      <div style={{ background:"var(--bg3)", border:"1px solid var(--accent-glow)", borderRadius:"var(--radius-sm)", padding:"14px", marginBottom:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ fontSize:"12px", color:"var(--text2)", flex:1 }}>{outfitR.ratingExplanation}</div>
                        <div style={{ textAlign:"right", marginLeft:"12px" }}>
                          <div className="stars">{renderStars(outfitR.rating)}</div>
                          <div style={{ fontSize:"10px", color:"var(--accent)", marginTop:"3px" }}>{outfitR.rating}/5</div>
                        </div>
                      </div>
                    )}
                    {outfitR.colorPalette && (
                      <div style={{ padding:"10px 14px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", marginBottom:"14px" }}>
                        <div style={{ fontSize:"10px", color:"var(--text3)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"4px" }}>Paleta</div>
                        <div style={{ fontSize:"12px", color:"var(--accent)", fontStyle:"italic" }}>{outfitR.colorPalette}</div>
                      </div>
                    )}
                    <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"16px" }}>
                      {outfitR.outfit?.map((item: any, i: number) => (
                        <div key={i} style={{ display:"flex", gap:"12px", padding:"13px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", boxShadow:"var(--card-shadow)" }}>
                          <div style={{ fontSize:"26px", minWidth:"34px", textAlign:"center" }}>{item.emoji}</div>
                          <div>
                            <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{item.name}</div>
                            <div style={{ fontSize:"11px", color:"var(--text2)", lineHeight:1.6 }}>{item.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {outfitR.explanation && (
                      <div style={{ background:"var(--accent-light)", borderLeft:"3px solid var(--accent)", padding:"14px", borderRadius:"0 var(--radius-sm) var(--radius-sm) 0" }}>
                        <div style={{ fontSize:"10px", fontWeight:600, color:"var(--accent)", letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"8px" }}>✦ Por qué funciona</div>
                        <div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.8 }}>{outfitR.explanation}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* AVATAR / VIRTUAL TRY */}        {/* AVATAR / VIRTUAL TRY */}
        {tab==="avatar" && (
          <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>{t.virtualTryTitle}</div>
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>{isPremium ? "Basada en tu Fashion DNA™" : "Función exclusiva Premium"}</div>
            </div>
            {!isPremium ? (
              <div className="card card-accent" style={{ textAlign:"center", padding:"32px 20px" }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>👑</div>
                <div className="serif" style={{ fontSize:"22px", fontWeight:300, marginBottom:"10px" }}>Función Premium</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6, marginBottom:"20px" }}>Prueba virtualmente cualquier outfit de tu armario basado en tu Fashion DNA™ personal.</div>
                <button className="btn-p">✦  Mejorar a Premium — $299 MXN/mes</button>
              </div>
            ) : !dna?.bodyType ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"16px", opacity:.3 }}>🧬</div>
                <div style={{ fontSize:"13px", color:"var(--text2)", marginBottom:"20px" }}>Primero crea tu Fashion DNA™</div>
                <button className="btn-p" onClick={()=>setScreen("onboarding")}>Crear mi Fashion DNA™</button>
              </div>
            ) : (
              <>
                <div className="card card-accent" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--green)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>✓ Fashion DNA™ detectado</div>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    <span className="dna-tag dna-style">{dna.bodyType}</span>
                    <span className="dna-tag dna-good">{dna.skinTone}</span>
                    {dna.idealColors?.slice(0,2).map((c: string) => <span key={c} className="dna-tag dna-good">{c}</span>)}
                  </div>
                </div>

                <div className="card" style={{ marginBottom:"14px" }}>
                  <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>Selecciona prendas para probar</div>
                  {clothes.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"20px", color:"var(--text3)", fontSize:"12px" }}>Agrega prendas a tu armario primero</div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", maxHeight:"280px", overflowY:"auto" }}>
                      {clothes.map(item => (
                        <div key={item.id} onClick={()=>setSelectedForTry(prev=>prev.includes(item.id)?prev.filter(i=>i!==item.id):[...prev,item.id])}
                          style={{ background:selectedForTry.includes(item.id)?"rgba(196,151,63,.1)":"var(--bg)", border:`1px solid ${selectedForTry.includes(item.id)?"rgba(196,151,63,.4)":"var(--border)"}`, borderRadius:"2px", overflow:"hidden", cursor:"pointer", transition:"all .2s", position:"relative" }}>
                          {selectedForTry.includes(item.id) && <div style={{ position:"absolute", top:"3px", right:"3px", background:"var(--gold)", borderRadius:"50%", width:"14px", height:"14px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px", color:"#080808", fontWeight:600, zIndex:1 }}>✓</div>}
                          {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                          <div style={{ padding:"5px 7px" }}><div style={{ fontSize:"9px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedForTry.length > 0 && <div style={{ marginTop:"10px", fontSize:"11px", color:"var(--gold)" }}>{selectedForTry.length} prenda{selectedForTry.length>1?"s":""} seleccionada{selectedForTry.length>1?"s":""}</div>}
                </div>

                {selectedForTry.length > 0 && (
                  <div>
                    <button className="btn-p" onClick={virtualTryOn} disabled={tryL} style={{ marginBottom:"16px" }}>
                      {tryL?t.generatingVirtual:t.tryVirtually}
                    </button>
                    {tryL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"24px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
                    {tryResult && !tryL && (
                      <div className="card card-gold fade">
                        <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"12px" }}>✦ Cómo luciría en ti</div>
                        <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.8 }}>{tryResult}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* FAVORITES */}
        {tab==="favorites" && (
          <div className="fade">
            <div style={{ marginBottom:"18px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>Favoritas</div>
              <div style={{ fontSize:"10px", color:"var(--text2)", marginTop:"3px" }}>{favClothes.length} prendas guardadas</div>
            </div>
            {favClothes.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:"40px", marginBottom:"14px", opacity:.3 }}>❤️</div>
                <div style={{ fontSize:"12px", color:"var(--text3)" }}>Toca ❤️ en cualquier prenda para guardarla</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"11px" }}>
                {favClothes.map(item => (
                  <div key={item.id} className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
                    <button onClick={()=>toggleFav(item.id)} style={{ position:"absolute", top:"7px", right:"7px", zIndex:2, background:"rgba(0,0,0,.7)", border:"none", fontSize:"11px", cursor:"pointer", width:"22px", height:"22px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>❤️</button>
                    {item.photo_url ? <img src={item.photo_url} alt={item.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover" }} /> : <div style={{ width:"100%", aspectRatio:"1", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"36px" }}>{CAT_ICON[item.category]||"👔"}</div>}
                    <div style={{ padding:"9px 11px" }}>
                      <div style={{ fontSize:"12px", fontWeight:400, marginBottom:"2px" }}>{item.name}</div>
                      <div style={{ fontSize:"9px", color:"var(--text2)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{item.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADVISOR */}
        {tab==="advisor" && (
          <div className="fade" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 180px)" }}>
            <div style={{ marginBottom:"14px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>{t.advisorTitle}</div>
              <div style={{ fontSize:"10px", color:"var(--text2)", marginTop:"3px" }}>{t.advisorSub}</div>
            </div>
            <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", marginBottom:"12px" }}>
              {suggestions.map(s => <button key={s} className="chip" onClick={()=>sendChat(s)}>{s}</button>)}
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"12px", paddingBottom:"12px" }}>
              {msgs.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:"7px", alignItems:"flex-start" }}>
                  {m.role==="assistant" && <div style={{ fontSize:"12px", marginTop:"5px", color:"var(--gold)", fontFamily:"'Cormorant Garamond',serif", flexShrink:0 }}>✦</div>}
                  <div className={m.role==="user"?"bubble-u":"bubble-a"}>
                    {m.role==="assistant" ? <div dangerouslySetInnerHTML={{ __html:`<p>${renderMd(m.text)}</p>` }} /> : m.text}
                  </div>
                </div>
              ))}
              {cload && <div style={{ display:"flex", gap:"7px", alignItems:"center" }}><div style={{ color:"var(--gold)", fontSize:"12px", fontFamily:"'Cormorant Garamond',serif" }}>✦</div><div className="bubble-a"><div style={{ display:"flex", gap:"4px", padding:"2px 0" }}><div className="dot"/><div className="dot"/><div className="dot"/></div></div></div>}
              <div ref={chatEnd}/>
            </div>
            <div style={{ display:"flex", gap:"8px", paddingTop:"12px", borderTop:"1px solid var(--border)" }}>
              <input className="inp" style={{ flex:1 }} placeholder={t.askAboutFashion} value={cin} onChange={e=>setCin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!cload&&sendChat()} />
              <button className="btn-o" style={{ flexShrink:0 }} onClick={()=>sendChat()} disabled={cload||!cin.trim()}>{t.send}</button>
            </div>
          </div>
        )}

        {/* TRIP */}
        {tab==="trip" && (
          <div className="fade">
            <div style={{ marginBottom:"20px" }}>
              <div className="serif" style={{ fontSize:"26px", fontWeight:300 }}>{t.tripTitle}</div>
              <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"3px" }}>{t.tripSub}</div>
            </div>
            <div className="card" style={{ marginBottom:"14px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                <input className="inp" placeholder={t.destination} value={tripDest} onChange={e=>setTripDest(e.target.value)} />
                <div style={{ display:"flex", gap:"10px" }}>
                  <input className="inp" placeholder={t.days} type="number" min="1" max="30" value={tripDays} onChange={e=>setTripDays(e.target.value)} style={{ width:"90px" }} />
                  <select className="sel" value={tripClima} onChange={e=>setTripClima(e.target.value)}>
                    <option value="">{t.climate}</option>
                    {(t.climateOptions ?? ["Caluroso","Templado","Frío","Lluvioso","Variable"]).map((c: string)=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:"7px", flexWrap:"wrap" }}>
                  {(t.tripTypes ?? ["Turismo","Playa","Montaña","Negocios","Romántico","Aventura"]).map((tp: string) => (
                    <button key={tp} className={`pill ${tripTipo===tp?"on":""}`} onClick={()=>setTripTipo(tripTipo===tp?"":tp)}>{tp}</button>
                  ))}
                </div>
              </div>
            </div>
            <button className="btn-p" onClick={planTrip} disabled={!tripDest||tripL} style={{ marginBottom:"18px" }}>
              {tripL?t.planning:t.planBag}
            </button>
            {tripL && <div style={{ display:"flex", justifyContent:"center", gap:"6px", padding:"30px" }}><div className="dot"/><div className="dot"/><div className="dot"/></div>}
            {tripR && !tripL && (
              <div className="fade">
                <div className="divider"/>
                {tripR.intro && <div style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.7, marginBottom:"16px", fontStyle:"italic", borderLeft:"2px solid rgba(196,151,63,.2)", paddingLeft:"12px" }}>{tripR.intro}</div>}
                {tripR.llevar?.map((g: any, i: number) => (
                  <div key={i} className="card" style={{ marginBottom:"10px" }}>
                    <div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>✦ {g.categoria}</div>
                    {g.items?.map((item: string, j: number) => <div key={j} style={{ display:"flex", alignItems:"center", gap:"9px", padding:"6px 0", borderBottom:"1px solid var(--border)" }}><div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--gold)", flexShrink:0 }}/><div style={{ fontSize:"13px" }}>{item}</div></div>)}
                    {g.tip && <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"8px", fontStyle:"italic" }}>💡 {g.tip}</div>}
                  </div>
                ))}
                {tripR.faltan?.length > 0 && (
                  <div className="card" style={{ marginBottom:"10px", borderColor:"rgba(231,76,60,.2)" }}>
                    <div style={{ fontSize:"9px", color:"var(--red)", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"10px" }}>⚠ Te falta comprar</div>
                    {tripR.faltan?.map((item: any, i: number) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <div><div style={{ fontSize:"13px" }}>{item.name}</div><div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"2px" }}>{item.why}</div></div>
                        {item.urgente && <span style={{ fontSize:"9px", color:"var(--red)", border:"1px solid rgba(231,76,60,.3)", padding:"3px 8px", borderRadius:"20px" }}>Urgente</span>}
                      </div>
                    ))}
                  </div>
                )}
                {tripR.consejo && <div style={{ background:"var(--bg)", borderLeft:"2px solid rgba(196,151,63,.3)", padding:"14px" }}><div style={{ fontSize:"9px", color:"var(--gold)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>✦ Consejo del estilista</div><div style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.8 }}>{tripR.consejo}</div></div>}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="bnav">
        <button className={`bnav-item ${tab==="home"?"on":""}`} onClick={()=>setTab("home")}>
          <span className="bnav-icon">🏠</span>
          <span className="bnav-label">{t.home}</span>
        </button>
        <button className={`bnav-item ${tab==="wardrobe"?"on":""}`} onClick={()=>setTab("wardrobe")}>
          <span className="bnav-icon">👗</span>
          <span className="bnav-label">{t.wardrobe}</span>
        </button>
        <button className="bnav-item" onClick={()=>{setSF(true);setTab("wardrobe");}}>
          <div className="bnav-center">＋</div>
        </button>
        <button className={`bnav-item ${tab==="outfit"?"on":""}`} onClick={()=>setTab("outfit")}>
          <span className="bnav-icon">✨</span>
          <span className="bnav-label">{t.outfitIA}</span>
        </button>
        <button className={`bnav-item ${tab==="advisor"?"on":""}`} onClick={()=>setTab("advisor")}>
          <span className="bnav-icon">💬</span>
          <span className="bnav-label">{t.advisorIA}</span>
        </button>
        <button className={`bnav-item ${tab==="trip"?"on":""}`} onClick={()=>setTab("trip")}>
          <span className="bnav-icon">✈️</span>
          <span className="bnav-label">{t.trips}</span>
        </button>
      </nav>
    </div>
  );
}
