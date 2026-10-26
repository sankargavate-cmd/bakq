export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  category?: "crop" | "scheme" | "mandi" | "machinery" | "weather" | "general";
  actionLink?: { label: string; url: string };
  timestamp: string;
}

export interface QuickPrompt {
  id: string;
  label: string;
  labelMr: string;
  labelHi: string;
  query: string;
  category: "crop" | "scheme" | "mandi" | "machinery" | "weather";
  icon: string;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "p-kusum",
    label: "Solar Pump 90% Subsidy",
    labelMr: "सौर पंप ९०% अनुदान (PM-KUSUM)",
    labelHi: "सोलर पंप 90% सब्सिडी (PM-KUSUM)",
    query: "Tell me how to apply for PM-KUSUM Solar Pump subsidy and what documents are required?",
    category: "scheme",
    icon: "☀️",
  },
  {
    id: "p-pest-cotton",
    label: "Cotton Bollworm Control",
    labelMr: "कपाशीवरील बोंडअळी नियंत्रण",
    labelHi: "कपास की गुलाबी सुंडी नियंत्रण",
    query: "How to control Pink Bollworm and sucking pests in cotton crop?",
    category: "crop",
    icon: "🐛",
  },
  {
    id: "p-mandi",
    label: "Live APMC Mandi Rates",
    labelMr: "आजचे बाजारभाव (मंडी भाव)",
    labelHi: "आज के मंडी भाव",
    query: "What are today's mandi prices for Onion, Soybean, Cotton, and Wheat in Maharashtra?",
    category: "mandi",
    icon: "📈",
  },
  {
    id: "p-pm-kisan",
    label: "PM-KISAN ₹6000 Status",
    labelMr: "पीएम किसान ₹६००० हप्ता माहिती",
    labelHi: "पीएम किसान ₹6000 किस्त जानकारी",
    query: "How to check PM-KISAN installment status and Namo Shetkari Yojana ₹6000 benefits?",
    category: "scheme",
    icon: "🏛️",
  },
  {
    id: "p-fertilizer",
    label: "Wheat & Soybean Fertilizer Dose",
    labelMr: "खत व्यवस्थापन व NPK प्रमाण",
    labelHi: "खाद प्रबंधन और NPK मात्रा",
    query: "What is the recommended fertilizer schedule (NPK / DAP / Urea) for high yield?",
    category: "crop",
    icon: "🌱",
  },
  {
    id: "p-tractor",
    label: "Hire Tractor & Harvester",
    labelMr: "ट्रॅक्टर व हार्वेस्टर भाड्याने",
    labelHi: "ट्रैक्टर व हार्वेस्टर किराया",
    query: "How to book a tractor or harvester on Shetkari Sathi?",
    category: "machinery",
    icon: "🚜",
  },
];

interface KnowledgeEntry {
  keywords: string[];
  en: string;
  mr: string;
  hi: string;
  category: "crop" | "scheme" | "mandi" | "machinery" | "weather" | "general";
  actionLink?: { label: string; url: string };
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // PM-KUSUM SOLAR PUMP
  {
    keywords: ["kusum", "solar", "pump", "सौर", "सोलर", "विहीर", "सौरपंप", "subsid"],
    category: "scheme",
    actionLink: { label: "Apply for PM-KUSUM Scheme", url: "/schemes" },
    en: `☀️ **PM-KUSUM Solar Pump Scheme (Component-B)**
- **Subsidy Benefit**: Up to 90% (Central Govt 30% + Maharashtra State Govt 60%). Farmers only pay 10% self-contribution!
- **Available Capacities**: 3 HP, 5 HP, and 7.5 HP (DC / AC Solar Submersible & Surface Pumps).
- **Eligibility**: Farmers with an active agricultural land holding (7/12 extract) and a water source (well, borewell, farm pond) without an existing electrical connection.
- **Required Documents**: 7/12 & 8A Extract, Aadhaar Card, Caste Certificate (for SC/ST extra benefits), Bank Passbook, No-Dues Certificate.
- **How to Apply**: You can apply directly through our **Government Schemes** tab with 1-click auto-fill!`,
    mr: `☀️ **पीएम-कुसुम सौर कृषी पंप योजना (घटक-ब)**
- **अनुदान लाभ**: तब्बल ९०% पर्यंत (केंद्र ३०% + महाराष्ट्र शासन ६०%). शेतकऱ्यांना फक्त १०% हिस्सा भरावा लागतो!
- **उपलब्ध क्षमता**: ३ एचपी, ५ एचपी, आणि ७.५ एचपी (सौर सबमर्सिबल / सरफेस पंप).
- **पात्रता**: ७/१२ व ८-अ उतारा असलेले शेतकरी, विहीर/बोअरवेल किंवा शेततळे पाण्याचा स्रोत असणे आवश्यक.
- **आवश्यक कागदपत्रे**: ७/१२, ८-अ, आधार कार्ड, बँक पासबुक, वीज जोडणी नसल्याचे स्वयंघोषणापत्र.
- **अर्ज प्रक्रिया**: आपल्या 'सरकारी योजना' टॅबमधून आपण थेट १-क्लिकमध्ये अर्ज करू शकता!`,
    hi: `☀️ **पीएम-कुसुम सोलर पंप योजना (घटक-बी)**
- **सब्सिडी**: 90% तक (केंद्र सरकार 30% + राज्य सरकार 60%). किसान को केवल 10% राशि देनी होती है!
- **पंप क्षमता**: 3 HP, 5 HP, और 7.5 HP सोलर पंप.
- **पात्रता**: 7/12 खतौनी वाले किसान जिनके पास कुआं/बोरवेल या तालाब का जल स्रोत हो.
- **दस्तावेज**: आधार कार्ड, 7/12 खसरा खतौनी, बैंक पासबुक.
- **आवेदन**: हमारे 'सरकारी योजनाएं' पेज से 1-क्लिक में आसानी से आवेदन करें!`,
  },

  // PM-KISAN & NAMO SHETKARI
  {
    keywords: ["pm kisan", "kisan samman", "namo shetkari", "६०००", "6000", "हप्ता", "किस्त", "samman nidhi", "पैसे"],
    category: "scheme",
    actionLink: { label: "View PM-KISAN & Namo Shetkari", url: "/schemes" },
    en: `🏛️ **PM-KISAN + Namo Shetkari Mahasanman Nidhi Yojana**
- **Total Combined Benefit**: ₹12,000 / year (₹6,000 Central PM-KISAN + ₹6,000 Maharashtra Namo Shetkari Scheme).
- **Payment Schedule**: Credited directly via DBT into farmer's Aadhaar-linked bank account in 3 equal installments of ₹4,000 every 4 months.
- **Mandatory Requirements**:
  1. e-KYC completed on PM-Kisan portal (via Aadhaar OTP or Biometric CSC).
  2. Land Seeding ('Yes' status on 7/12 land record).
  3. Aadhaar-NPCI Bank Account mapping active.
- **Check Status**: Visit the Schemes Hub to review your status or register a new application!`,
    mr: `🏛️ **पीएम किसान + नमो शेतकरी महासन्मान निधी योजना**
- **एकूण वार्षिक लाभ**: ₹१२,००० प्रति वर्ष (केंद्र सरकारचे ₹६,००० + महाराष्ट्र सरकारचे ₹६,०००).
- **हप्ता वितरण**: दर ४ महिन्यांनी ₹४,००० थेट आधार-संलग्न बँक खात्यात जमा केले जातात.
- **महत्त्वाच्या अटी**:
  १. पीएम किसान पोर्टलवर ई-केवायसी (e-KYC) पूर्ण असणे.
  २. भूमी अभिलेख (Land Seeding - 7/12) लिंक असणे.
  ३. बँक खाते आधार-एनपीसीआय (NPCI) शी जोडलेले असणे.
- **स्थिती तपासा**: आपल्या योजना विभागात जाऊन अधिक माहिती मिळवा!`,
    hi: `🏛️ **पीएम किसान + नमो शेतकरी महासम्मान निधि योजना**
- **कुल वार्षिक लाभ**: ₹12,000 प्रति वर्ष (पीएम किसान ₹6,000 + राज्य योजना ₹6,000).
- **किस्त**: हर 4 महीने में ₹4,000 सीधे किसान के बैंक खाते में DBT द्वारा.
- **आवश्यक शर्तें**: e-KYC पूर्ण होना, जमीन (Land Seeding) सत्यापित होना, और बैंक खाता आधार से लिंक होना जरूरी है.`,
  },

  // COTTON PEST & BOLLWORM
  {
    keywords: ["cotton", "bollworm", "कपाशी", "बोंडअळी", "कपास", "pink bollworm", "मावा", "तुडतुडे", "pest"],
    category: "crop",
    en: `🌾 **Cotton Pest & Pink Bollworm Integrated Management**
- **Identification**: Rosetted flowers, small boreholes in bolls with frass, larval entry into seeds.
- **Immediate Remedy**:
  1. **Pheromone Traps**: Install 5-8 Pheromone traps per acre with Pectino-lure for monitoring.
  2. **Bio-Control**: Spray *Trichogramma bactrae* egg parasitoids @ 60,000/acre at flower initiation.
  3. **Chemical Spray** (if damage > 10%): Spray **Profenofos 50% EC** @ 35ml/15L pump OR **Emamectin Benzoate 5% SG** @ 5g/15L pump.
  4. For sucking pests (Thrips/Aphids): Spray Neem Oil 10,000 PPM @ 30ml/pump or Flonicamid 50 WG @ 6g/pump.`,
    mr: `🌾 **कपाशीवरील गुलाबी बोंडअळी व कीड नियंत्रण उपाय**
- **लक्षणे**: फुले चक्राकार होणे (गुलाबी फुले), बोंडांवर बारीक छिद्रे व अळीचा प्रादुर्भाव.
- **तात्काळ उपाययोजना**:
  १. **कामगंध सापळे (Pheromone Traps)**: एकरी ५ ते ८ सापळे लावावेत.
  २. **जैविक नियंत्रण**: ५% निंबोळी अर्क किंवा ट्रायकोडर्मा/ट्रायकोग्रामा कार्डचा वापर करावा.
  ३. **रासायनिक फवारणी**: प्रादुर्भाव जास्त असल्यास **इमामेक्टिन बेन्झोएट ५% एसजी** (५ ग्रॅम/१५ लिटर पाणी) किंवा **प्रोफेनोफॉस ५०% ईसी** (३५ मिली/१५ लिटर पाणी) फवारावे.
  ४. रसशोषक किडींसाठी: फ्लोनिकामाइड ५० डब्ल्यूजी (६ ग्रॅम/पंप) फवारावे.`,
    hi: `🌾 **कपास में गुलाबी सुंडी (Pink Bollworm) और कीट नियंत्रण**
- **रोकथाम**: प्रति एकड़ 5-8 फेरोमोन ट्रैप लगाएं.
- **दवा स्प्रे**: नीम का तेल (10,000 PPM) 30ml/पंप या **इमामेक्टिन बेंजोएट 5% SG** (5 ग्राम प्रति 15 लीटर पानी) का छिड़काव करें.`,
  },

  // LIVE MANDI RATES
  {
    keywords: ["mandi", "rate", "price", "बाजारभाव", "मंडी", "भाव", "कांदा", "सोयाबीन", "onion", "soybean", "wheat", "cotton"],
    category: "mandi",
    actionLink: { label: "Check Live Produce Marketplace", url: "/buyer/marketplace" },
    en: `📈 **Live Maharashtra APMC Mandi Rates (Today's Benchmark Average)**
- 🧅 **Onion (कांदा - Lasalgaon/Nashik)**: ₹1,650 - ₹2,400 / quintal (Modal: ₹2,150)
- 🌾 **Soybean (सोयाबीन - Latur/Akola)**: ₹4,350 - ₹4,800 / quintal (MSP: ₹4,892)
- ☁️ **Cotton (कापूस - Jalgaon/Yavatmal)**: ₹7,100 - ₹7,650 / quintal (Modal: ₹7,380)
- 🌾 **Wheat (गहू - Pune/Solapur)**: ₹2,550 - ₹3,100 / quintal
- 🍅 **Tomato (टोमॅटो - Narayangaon/Nashik)**: ₹1,200 - ₹1,800 / quintal (₹240 - ₹360 / crate)
- 🍌 **Banana (केळी - Jalgaon)**: ₹1,400 - ₹1,950 / quintal

💡 *Tip: Direct selling via Shetkari Sathi Marketplace connects you to verified bulk buyers with 0% middleman commission!*`,
    mr: `📈 **आजचे प्रमुख बाजारभाव (महाराष्ट्र APMC थेट सरासरी भाव)**
- 🧅 **कांदा (लासलगाव/नाशिक)**: ₹१,६५० - ₹२,४०० / क्विंटल (सरासरी: ₹२,१५०)
- 🌾 **सोयाबीन (लातूर/अकोला)**: ₹४,३५० - ₹४,८०० / क्विंटल
- ☁️ **कापूस (जळगाव/यवतमाळ)**: ₹७,१०० - ₹७,६५० / क्विंटल
- 🌾 **गहू (पुणे/सोलापूर)**: ₹२,५५० - ₹३,१०० / क्विंटल
- 🍅 **टोमॅटो (नारायणगाव)**: ₹१,२०० - ₹१,८०० / क्विंटल (₹२४०-₹३६०/क्रेट)
- 🍌 **केळी (जळगाव)**: ₹१,४०० - ₹१,९५० / क्विंटल

💡 *शेतकरी साथी मार्केटप्लेसवर माल थेट खरेदीदारांना विकल्यास दलाली वाचून ५ ते १०% जास्त नफा मिळतो!*`,
    hi: `📈 **आज के प्रमुख मंडी भाव (APMC ताजा रेट)**
- 🧅 **प्याज (लासलगांव/नासिक)**: ₹1,650 - ₹2,400 / क्विंटल
- 🌾 **सोयाबीन (लातूर)**: ₹4,350 - ₹4,800 / क्विंटल
- ☁️ **कपास (जलगांव)**: ₹7,100 - ₹7,650 / क्विंटल
- 🌾 **गेहूं (पुणे)**: ₹2,550 - ₹3,100 / क्विंटल`,
  },

  // FERTILIZER & SOIL HEALTH
  {
    keywords: ["fertilizer", "npk", "urea", "dap", "खत", "युरिया", "खाद", "माती", "soil", "soil health"],
    category: "crop",
    en: `🧪 **Scientific Fertilizer Management & Soil Balance (NPK Guide)**
- **Basal Dose**: Apply full Phosphorus (P) via DAP or SSP and Potash (MOP) along with 1/3rd Nitrogen at the time of sowing.
- **Top Dressing**: Split remaining Urea into 2 doses (30 days and 50 days after sowing) under moist soil conditions.
- **Micronutrients**: Spray Zinc Sulphate (0.5%) and Boron (0.2%) during vegetative and flowering stage to increase flower setting by 25%.
- **Soil Health Card**: Get your soil tested free under Soil Health Card scheme to save up to ₹3,000/acre in excess fertilizer costs!`,
    mr: `🧪 **संतुलित खत व्यवस्थापन व माती परीक्षण मार्गदर्शन**
- **मूलभूत मात्रा**: पेरणीच्या वेळी संपूर्ण फॉस्फरस (DAP किंवा SSP), पोटॅश (MOP) आणि १/३ भाग युरिया द्यावा.
- **उर्वरित युरिया**: पेरणीनंतर ३० आणि ५० दिवसांनी ओलावा असताना विभागून द्यावा.
- **सूक्ष्म अन्नद्रव्ये**: फुलधारणेच्या काळात झिंक आणि बोरॉनची (०.२%) फवारणी केल्याने उत्पादनात २०-२५% वाढ होते.
- **सल्ला**: शेतकरी साथीवरील 'सॉईल हेल्थ कार्ड' योजनेतून मोफत माती परीक्षण करून घ्या!`,
    hi: `🧪 **उर्वरक एवं संतुलित खाद प्रबंधन (NPK मात्रा)**
- **बुवाई के समय**: पूरा डीएपी या एसएसपी, पोटाश और एक तिहाई यूरिया बेसल डोज के रूप में दें.
- **टॉप ड्रेसिंग**: शेष यूरिया को 30 और 50 दिन पर दो भागों में डालें.
- **सूक्ष्म पोषक तत्व**: जिंक सल्फेट और बोरॉन का छिड़काव करें.`,
  },

  // MACHINERY & TRACTOR HIRE
  {
    keywords: ["tractor", "hire", "rent", "machinery", "ट्रॅक्टर", "ट्रैक्टर", "यंत्र", "हार्वेस्टर", "रोटाव्हेटर", "smam"],
    category: "machinery",
    actionLink: { label: "Find Tractor & Implements", url: "/farmer/tractor-search" },
    en: `🚜 **Tractor & Farm Equipment Hiring on Shetkari Sathi**
- **How to Book**:
  1. Open the **Find Tractor** tab on your Farmer dashboard.
  2. Filter by equipment type: Rotavator, Plouging (नांगरणी), Sowing Drill, or Combine Harvester.
  3. View verified tractor owners near your village with transparent hourly rates (e.g. ₹800-₹950/hr).
  4. Select booking date & hours -> Instant SMS notification to tractor owner.
- **Subsidy on Buying**: Apply for the **SMAM Sub-Mission on Agricultural Mechanization** under Government Schemes for 40-50% subsidy on buying new tractors!`,
    mr: `🚜 **शेतकरी साथीवर ट्रॅक्टर व कृषी अवजारे बुकिंग**
- **बुकिंग प्रक्रिया**:
  १. आपल्या डॅशबोर्डवरील **'Find Tractor'** वर जा.
  २. अवजाराचा प्रकार निवडा (नांगरणी, रोटाव्हेटर, पेरणी यंत्र, किंवा हार्वेस्टर).
  ३. आपल्या गावाजवळील प्रमाणित ट्रॅक्टर मालकांचे दर तपासा (उदा. ₹८०० - ₹९५०/तास).
  ४. तारीख व वेळ निवडून १-क्लिकमध्ये बुकिंग पाठवा.
- **नवीन खरेदीवर अनुदान**: ट्रॅक्टर व यंत्र खरेदीसाठी 'कृषी यांत्रिकीकरण योजना (SMAM)' अंतर्गत ४०% ते ५०% अनुदान उपलब्ध आहे!`,
    hi: `🚜 **ट्रैक्टर और कृषि यंत्र किराए पर लें**
- किसान डैशबोर्ड से **Find Tractor** पर क्लिक करें और अपने नजदीकी ट्रैक्टर व हार्वेस्टर को पारदर्शी दरों पर बुक करें.
- नया ट्रैक्टर खरीदने के लिए SMAM योजना में 40-50% सब्सिडी मिलती है.`,
  },

  // PMFBY CROP INSURANCE
  {
    keywords: ["pmfby", "fasal bima", "insurance", "विमा", "पिक विमा", "नुकसान", "अतिवृष्टी", "drought"],
    category: "scheme",
    actionLink: { label: "Explore PMFBY Crop Insurance", url: "/schemes" },
    en: `🛡️ **Pradhan Mantri Fasal Bima Yojana (PMFBY - ₹1 Scheme)**
- **Farmer Premium**: Only ₹1 token fee in Maharashtra for Kharif & Rabi crops! Balance premium is paid by the Govt.
- **Coverage**: Drought, flood, unseasonal rainfall (अवेळी पाऊस), hailstorms, pest attacks, and post-harvest localized losses.
- **Intimation Rule**: In case of localized crop damage, inform within **72 hours** via the PMFBY Crop Insurance App or Taluka Agri Officer.
- **How to Apply**: Direct application available on our Schemes Portal with land 7/12 record!`,
    mr: `🛡️ **प्रधानमंत्री पीक विमा योजना (१ रुपयात पीक विमा)**
- **शेतकरी हप्ता**: महाराष्ट्रात शेतकऱ्यांना फक्त **₹१ नाममात्र शुल्क** भरावे लागते, उर्वरित सर्व हप्ता शासन भरते!
- **संरक्षण**: दुष्काळ, अतिवृष्टी, गारपीट, कीड-रोग आणि काढणीनंतरचे चक्रीवादळ/पावसामुळे होणारे नुकसान.
- **नुकसान भरपाई नियम**: नैसर्गिक आपत्ती आल्यास **७२ तासांच्या आत** पीक विमा ॲप किंवा कृषी कार्यालयास पूर्वसूचना देणे बंधनकारक आहे.
- **अर्ज**: आमच्या सरकारी योजना दालनातून त्वरित अर्ज करा!`,
    hi: `🛡️ **प्रधानमंत्री फसल बीमा योजना (PMFBY)**
- केवल ₹1 में फसल बीमा सुरक्षा. सूखा, बाढ़, ओलावृष्टि और बेमौसम बारिश से हुए नुकसान की पूरी भरपाई.
- नुकसान होने के 72 घंटे के भीतर सूचना देना अनिवार्य है.`,
  },

  // MAGEL TYALA SHETTALE
  {
    keywords: ["shettale", "pond", "farm pond", "शेततळे", "तळे", "तलाव", "पाणी", "water"],
    category: "scheme",
    actionLink: { label: "Apply for Farm Pond Scheme", url: "/schemes" },
    en: `💧 **Magel Tyala Shettale (Farm Pond on Demand - Maharashtra)**
- **Subsidy Amount**: Direct DBT subsidy up to **₹50,000 to ₹1,00,000** for digging farm ponds and plastic lining.
- **Standard Size**: 30m x 30m x 3m (or customized according to land holding).
- **Eligibility**: Any farmer holding at least 0.60 hectares (1.5 acres) of cultivable land.
- **Apply**: Select "Magel Tyala Shettale" on our Schemes tab to generate your application reference!`,
    mr: `💧 **मागेल त्याला शेततळे योजना (महाराष्ट्र शासन)**
- **अनुदान रक्कम**: शेततळे खोदकाम व प्लास्टिक अस्तरीकरणासाठी थेट **₹५०,००० ते ₹१,००,०००** पर्यंत अनुदान.
- **आकारमान**: ३० मी x ३० मी x ३ मी (किंवा जमिनीच्या उपलब्धतेनुसार).
- **पात्रता**: किमान ०.६० हेक्टर (१.५ एकर) शेती असणारा कोणताही शेतकरी पात्र.
- **अर्ज**: आपल्या योजना पोर्टलवरून त्वरित अर्ज सबमिट करा!`,
    hi: `💧 **मांगने पर खेत तालाब योजना (Farm Pond Scheme)**
- खेत में तालाब खुदाई और प्लास्टिक लाइनिंग के लिए ₹50,000 से ₹1,00,000 तक की सीधी सब्सिडी मिलती है.`,
  },
];

export function findChatbotResponse(
  query: string,
  lang: "en" | "mr" | "hi" = "en"
): { text: string; category?: KnowledgeEntry["category"]; actionLink?: KnowledgeEntry["actionLink"] } {
  const normalizedQuery = query.toLowerCase().trim();

  // Match against knowledge base
  let bestMatch: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += kw.length > 4 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 0) {
    const text = bestMatch[lang] || bestMatch.en;
    return { text, category: bestMatch.category, actionLink: bestMatch.actionLink };
  }

  // Fallback response with helpful pointers
  const fallback = {
    en: `🌾 **I'm Kisan Sathi, your Smart Agriculture Assistant!**
I can help you with:
1. **Government Schemes** (PM-KUSUM Solar Pump, PM-KISAN, Fasal Bima ₹1 Crop Insurance, KCC loan)
2. **Crop Doctor & Pest Control** (Cotton bollworm, Soybean stem fly, Tomato leaf curl, fertilizer doses)
3. **Live APMC Mandi Rates** (Onion, Soybean, Cotton, Wheat, Tomato prices)
4. **Booking Services** (Hire Tractors, Find Labour, Book Transport)

*Try asking: "How to apply for PM-KUSUM 90% subsidy?" or "Today's Onion and Soybean mandi rates?"*`,
    mr: `🌾 **मी शेतकरी साथी AI - आपला डिजिटल कृषी सहाय्यक!**
मी आपणास खालील विषयांत मदत करू शकतो:
१. **सरकारी योजना** (पीएम-कुसुम सौर पंप, पीएम किसान, ₹१ पीक विमा, मागेल त्याला शेततळे)
२. **पीक संरक्षण व कीड नियंत्रण** (कपाशी बोंडअळी, सोयाबीन खोडमाशी, खत व्यवस्थापन)
३. **आजचे थेट बाजारभाव** (कांदा, कापूस, सोयाबीन, गहू, टोमॅटो APMC दर)
४. **सेवा बुकिंग** (ट्रॅक्टर भाड्याने, मजूर शोधणे, मालवाहतूक गाडी)

*उदा. विचारून पहा: "सौर पंप ९०% अनुदानासाठी काय करावे?" किंवा "आजचा कांदा बाजारभाव काय आहे?"*`,
    hi: `🌾 **मैं किसान साथी AI - आपका डिजिटल कृषि मित्र!**
मैं आपकी सहायता कर सकता हूँ:
1. **सरकारी योजनाएं** (पीएम-कुसुम सोलर पंप, पीएम किसान ₹6000, फसल बीमा, केसीसी लोन)
2. **फसल सुरक्षा व कीट निवारण** (कपास गुलाबी सुंडी, सोयाबीन कीट, खाद प्रबंधन)
3. **मंडी भाव** (प्याज, कपास, सोयाबीन, गेहूं के ताजा भाव)
4. **ट्रैक्टर व मजदूर बुकिंग**`,
  };

  return { text: fallback[lang] || fallback.en, category: "general" };
}
