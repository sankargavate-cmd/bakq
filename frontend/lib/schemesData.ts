export type SchemeCategory = "all" | "grant" | "solar" | "insurance" | "machinery" | "loan" | "water";

export interface SchemeDoc {
  name: string;
  nameMr: string;
  required: boolean;
}

export interface GovtScheme {
  id: string;
  title: string;
  titleMr: string;
  titleHi: string;
  shortCode: string;
  category: SchemeCategory;
  authority: "Central Govt" | "Maharashtra Govt" | "Joint Central & State";
  authorityMr: string;
  subsidyPercent: string;
  maxBenefit: string;
  description: string;
  descriptionMr: string;
  descriptionHi: string;
  icon: string;
  badge: string;
  badgeColor: "green" | "amber" | "blue";
  eligibility: string[];
  eligibilityMr: string[];
  requiredDocs: SchemeDoc[];
  deadline: string;
  optionsLabel?: string;
  options?: { value: string; label: string }[];
  isFeatured?: boolean;
}

export interface SchemeApplication {
  applicationId: string;
  schemeId: string;
  schemeTitle: string;
  applicantName: string;
  applicantPhone: string;
  aadhaarNumber: string;
  landAcres: string;
  village: string;
  district: string;
  surveyNumber: string;
  selectedOption: string;
  appliedDate: string;
  status: "submitted" | "under_verification" | "field_inspection" | "approved" | "disbursed";
  currentStage: number; // 1 to 5
  statusNotes: string;
  disbursedAmount?: string;
}

export const GOVT_SCHEMES: GovtScheme[] = [
  {
    id: "pm-kusum",
    title: "PM-KUSUM Solar Agricultural Pump Scheme",
    titleMr: "पीएम-कुसुम सौर कृषी पंप योजना (९०% अनुदान)",
    titleHi: "पीएम-कुसुम सोलर पंप योजना (90% सब्सिडी)",
    shortCode: "PM-KUSUM",
    category: "solar",
    authority: "Joint Central & State",
    authorityMr: "केंद्र व महाराष्ट्र शासन",
    subsidyPercent: "Up to 90% Subsidy",
    maxBenefit: "₹2,65,000 Grant",
    description: "Get 90% government subsidy to install 3HP, 5HP, or 7.5HP solar-powered water pumps. Provides uninterrupted daytime irrigation without electricity bills.",
    descriptionMr: "शेतातील विहीर किंवा बोअरवेलसाठी ३, ५ किंवा ७.५ एचपी सौर कृषी पंपावर तब्बल ९०% सरकारी अनुदान. दिवसा अखंड वीज आणि शून्य वीज बिल!",
    descriptionHi: "3HP, 5HP या 7.5HP सोलर वाटर पंप लगाने के लिए 90% तक सरकारी सब्सिडी. दिन में मुफ्त व निर्बाध सिंचाई पाएं.",
    icon: "☀️",
    badge: "90% Subsidy",
    badgeColor: "green",
    isFeatured: true,
    deadline: "31 March 2027 (Open)",
    optionsLabel: "Select Solar Pump Capacity",
    options: [
      { value: "3hp_submersible", label: "3 HP Solar DC Submersible (₹18,500 Farmer Share)" },
      { value: "5hp_submersible", label: "5 HP Solar DC Submersible (₹27,800 Farmer Share)" },
      { value: "7.5hp_submersible", label: "7.5 HP Solar AC Submersible (₹38,200 Farmer Share)" },
      { value: "3hp_surface", label: "3 HP Solar Surface Pump (₹16,900 Farmer Share)" },
    ],
    eligibility: [
      "Farmer must possess cultivable agricultural land with 7/12 & 8A extract",
      "Must have an assured water source (Well, Borewell, Farm Pond, River)",
      "Should not have an existing conventional electric agriculture connection",
      "SC/ST farmers receive special priority and additional 5% state top-up",
    ],
    eligibilityMr: [
      "शेतकऱ्याकडे स्वतःच्या नावावर ७/१२ व ८-अ शेतजमीन उतारा असावा",
      "शेतात विहीर, बोअरवेल, शेततळे किंवा नदी पाण्याचा शाश्वत स्रोत असावा",
      "सध्या पारंपारिक कृषी वीज जोडणी नसलेले शेतकरी पात्र",
      "अनुसूचित जाती व जमातीच्या शेतकऱ्यांना विशेष प्राधान्य",
    ],
    requiredDocs: [
      { name: "Aadhaar Card copy", nameMr: "आधार कार्ड प्रत", required: true },
      { name: "7/12 & 8-A Land Extract (< 3 months old)", nameMr: "७/१२ व ८-अ उतारा", required: true },
      { name: "Bank Passbook with IFSC", nameMr: "बँक पासबुक प्रत (IFSC सह)", required: true },
      { name: "No-Electricity-Connection Self Declaration", nameMr: "वीज जोडणी नसल्याचे स्वयंघोषणापत्र", required: true },
      { name: "Caste Certificate (if applicable)", nameMr: "जात प्रमाणपत्र (लागू असल्यास)", required: false },
    ],
  },
  {
    id: "pm-kisan",
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    titleMr: "प्रधानमंत्री किसान सन्मान निधी (₹६,००० थेट बँक खात्यात)",
    titleHi: "प्रधानमंत्री किसान सम्मान निधि योजना",
    shortCode: "PM-KISAN",
    category: "grant",
    authority: "Central Govt",
    authorityMr: "केंद्र शासन",
    subsidyPercent: "100% Direct DBT Cash",
    maxBenefit: "₹6,000 / Year",
    description: "Direct annual income support of ₹6,000 paid in three equal installments of ₹2,000 every four months to all landholding farmer families across India.",
    descriptionMr: "सर्व शेतकरी कुटुंबांना वर्षाला ₹६,००० ची थेट आर्थिक मदत. दर चार महिन्यांनी ₹२,००० थेट आधार-संलग्न बँक खात्यात जमा.",
    descriptionHi: "सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष 3 किस्तों (₹2,000 हर 4 माह) में सीधे बैंक खाते में.",
    icon: "🏛️",
    badge: "₹6,000/yr Direct Cash",
    badgeColor: "green",
    isFeatured: true,
    deadline: "Ongoing All Year",
    optionsLabel: "Installment Account Type",
    options: [
      { value: "individual_farmer", label: "Individual Landholder Farmer" },
      { value: "joint_holder", label: "Joint Landholding Family" },
    ],
    eligibility: [
      "All landholding farmer families with cultivable landholding in their names",
      "e-KYC verification must be completed on PM-Kisan portal",
      "Bank account must be seeded with Aadhaar and mapped with NPCI",
      "Institutional landholders and income-tax payers are excluded",
    ],
    eligibilityMr: [
      "स्वतःच्या नावावर लागवडीयोग्य शेतजमीन असणारे सर्व शेतकरी कुटुंब",
      "पीएम किसान पोर्टलवर ई-केवायसी (e-KYC) पूर्ण असणे बंधनकारक",
      "बँक खाते आधार व NPCI शी संलग्न असावे",
    ],
    requiredDocs: [
      { name: "Aadhaar Card", nameMr: "आधार कार्ड", required: true },
      { name: "7/12 Land Record with Land ID", nameMr: "७/१२ भूमी अभिलेख", required: true },
      { name: "Aadhaar-linked Bank Account details", nameMr: "आधार-संलग्न बँक खाते", required: true },
    ],
  },
  {
    id: "namo-shetkari",
    title: "Namo Shetkari Mahasanman Nidhi Yojana",
    titleMr: "नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र शासन ₹६,०००)",
    titleHi: "नमो शेतकरी महासम्मान निधि योजना (महाराष्ट्र)",
    shortCode: "NAMO-SHETKARI",
    category: "grant",
    authority: "Maharashtra Govt",
    authorityMr: "महाराष्ट्र शासन",
    subsidyPercent: "100% State Cash Grant",
    maxBenefit: "₹6,000 / Year",
    description: "Maharashtra State Government top-up granting an additional ₹6,000/year to all PM-KISAN eligible farmers in Maharashtra, making a total of ₹12,000/year.",
    descriptionMr: "महाराष्ट्र शासनातर्फे पीएम-किसानच्या ₹६,००० व्यतिरिक्त आणखी ₹६,००० वार्षिक अनुदान. महाराष्ट्रातील शेतकऱ्यांना एकूण ₹१२,००० थेट लाभ!",
    descriptionHi: "महाराष्ट्र सरकार द्वारा पीएम-किसान के अतिरिक्त ₹6,000/वर्ष का अतिरिक्त लाभ (कुल ₹12,000/वर्ष).",
    icon: "🌾",
    badge: "₹6,000 MH Top-up",
    badgeColor: "green",
    deadline: "Ongoing with PM-KISAN",
    eligibility: [
      "Must be an active beneficiary of the Central PM-KISAN scheme in Maharashtra",
      "Landholding located within the state of Maharashtra",
      "Valid Aadhaar-linked Maharashtra bank account",
    ],
    eligibilityMr: [
      "महाराष्ट्रातील पीएम-किसान योजनेचे सक्रिय लाभार्थी असणे आवश्यक",
      "शेतजमीन महाराष्ट्र राज्यात असणे बंधनकारक",
      "आधार-लिंक्ड बँक खाते असणे आवश्यक",
    ],
    requiredDocs: [
      { name: "PM-KISAN Beneficiary ID / Aadhaar", nameMr: "पीएम-किसान लाभार्थी क्रमांक / आधार", required: true },
      { name: "7/12 Land Record", nameMr: "७/१२ उतारा", required: true },
    ],
  },
  {
    id: "pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana (₹1 Crop Insurance)",
    titleMr: "प्रधानमंत्री पीक विमा योजना (फक्त ₹१ रुपयात पीक विमा)",
    titleHi: "प्रधानमंत्री फसल बीमा योजना (₹1 में फसल सुरक्षा)",
    shortCode: "PMFBY",
    category: "insurance",
    authority: "Joint Central & State",
    authorityMr: "केंद्र व महाराष्ट्र शासन",
    subsidyPercent: "Complete Risk Cover for ₹1",
    maxBenefit: "Up to ₹45,000 / Acre",
    description: "Comprehensive financial protection against crop yield loss caused by non-preventable natural risks (drought, flood, unseasonal rains, hailstorms, pest attacks). In Maharashtra, farmers pay only ₹1 token fee.",
    descriptionMr: "दुष्काळ, अतिवृष्टी, गारपीट किंवा अवेळी पावसामुळे पिकांचे नुकसान झाल्यास संपूर्ण विमा संरक्षण. महाराष्ट्रातील शेतकऱ्यांसाठी केवळ ₹१ नाममात्र शुल्कात उपलब्ध!",
    descriptionHi: "प्राकृतिक आपदाओं, ओलावृष्टि और कीट प्रकोप से होने वाले फसल नुकसान की पूरी भरपाई केवल ₹1 प्रीमियम में.",
    icon: "🛡️",
    badge: "₹1 Token Premium",
    badgeColor: "blue",
    isFeatured: true,
    deadline: "15 July (Kharif) / 15 Dec (Rabi)",
    optionsLabel: "Select Crop & Season",
    options: [
      { value: "cotton_kharif", label: "Cotton (कापूस - Kharif) - ₹42,000/Ha Cover" },
      { value: "soybean_kharif", label: "Soybean (सोयाबीन - Kharif) - ₹38,000/Ha Cover" },
      { value: "onion_rabi", label: "Onion (कांदा - Rabi/Late Kharif) - ₹55,000/Ha Cover" },
      { value: "wheat_rabi", label: "Wheat (गहू - Rabi) - ₹35,000/Ha Cover" },
    ],
    eligibility: [
      "All farmers growing notified crops in notified areas (both loanee and non-loanee)",
      "Tenant farmers and sharecroppers are also eligible with declaration",
      "Must apply before the notified seasonal cutoff deadline",
    ],
    eligibilityMr: [
      "अधिसूचित क्षेत्रातील अधिसूचित पिके घेणारे सर्व शेतकरी (कर्जदार व बिगर-कर्जदार)",
      "कुळ शेतकरी व भाडेतत्वावर शेती करणारे शेतकरीही स्वयंघोषणापत्रासह पात्र",
    ],
    requiredDocs: [
      { name: "Aadhaar Card", nameMr: "आधार कार्ड", required: true },
      { name: "7/12 Extract with Sowing Crop Entry (पीक पेरा नोंद)", nameMr: "७/१२ उतारा व पीक पेरा नोंद", required: true },
      { name: "Bank Passbook Copy", nameMr: "बँक पासबुक प्रत", required: true },
    ],
  },
  {
    id: "kcc",
    title: "Kisan Credit Card (KCC) - 4% Low Interest Crop Loan",
    titleMr: "किसान क्रेडिट कार्ड (KCC) - ४% सवलतीच्या व्याजदरात पीक कर्ज",
    titleHi: "किसान क्रेडिट कार्ड (KCC) - 4% रियायती कृषि ऋण",
    shortCode: "KCC",
    category: "loan",
    authority: "Central Govt",
    authorityMr: "केंद्र शासन व बँका",
    subsidyPercent: "3% Interest Subvention (Effective 4%)",
    maxBenefit: "Up to ₹3,00,000 Loan",
    description: "Concessional institutional credit for farmers to meet short-term crop cultivation expenses, seeds, fertilizers, and post-harvest maintenance at only 4% effective interest rate with timely repayment.",
    descriptionMr: "बियाणे, खते आणि शेती खर्चासाठी ₹३ लाखांपर्यंत अत्यंत स्वस्त पीक कर्ज. वेळेत परतफेड केल्यास केवळ ४% नाममात्र व्याजदर.",
    descriptionHi: "खेती खर्च, खाद, बीज के लिए ₹3 लाख तक का आसान ऋण केवल 4% प्रभावी ब्याज दर पर.",
    icon: "💳",
    badge: "4% Subsidized Loan",
    badgeColor: "amber",
    deadline: "Available All Year",
    optionsLabel: "Required Credit Limit",
    options: [
      { value: "limit_1lakh", label: "Up to ₹1,00,000 (No collateral / Hypothecation only)" },
      { value: "limit_2lakh", label: "₹1,00,000 to ₹2,00,000 (Flexible repayment)" },
      { value: "limit_3lakh", label: "₹2,00,000 to ₹3,00,000 (Maximum Subsidized Limit)" },
    ],
    eligibility: [
      "All individual landowning farmers, joint borrowers, tenant farmers, and SHGs",
      "Age between 18 to 70 years",
      "No default on existing agricultural loans",
    ],
    eligibilityMr: [
      "सर्व शेतकरी, कुळ शेतकरी, बटाईदार व शेतकरी बचत गट पात्र",
      "वय १८ ते ७० वर्षे",
      "मागील कृषी कर्जात थकबाकीदार नसावा",
    ],
    requiredDocs: [
      { name: "Aadhaar & PAN Card", nameMr: "आधार व पॅन कार्ड", required: true },
      { name: "7/12, 8A Land Extract & Ferfar", nameMr: "७/१२, ८-अ व फेरफार उतारा", required: true },
      { name: "No Objection Certificate (NOC) from other banks", nameMr: "ना-हरकत प्रमाणपत्र (NOC)", required: true },
    ],
  },
  {
    id: "smam-mechanization",
    title: "SMAM - Farm Machinery & Tractor Subsidy Scheme",
    titleMr: "कृषी यांत्रिकीकरण योजना (ट्रॅक्टर व अवजारांवर ५०% अनुदान)",
    titleHi: "कृषि यंत्रीकरण योजना (ट्रैक्टर व कृषि यंत्र 50% सब्सिडी)",
    shortCode: "SMAM",
    category: "machinery",
    authority: "Joint Central & State",
    authorityMr: "महाडीबीटी / कृषी विभाग",
    subsidyPercent: "40% to 50% Subsidy",
    maxBenefit: "Up to ₹1,25,000 Subsidy",
    description: "Financial assistance of 40% to 50% for purchasing new Tractors (up to ₹1.25 Lakh grant), Rotavators, Power Tillers, Seed Drills, Laser Levelers, and Harvesters through MahaDBT portal.",
    descriptionMr: "नवीन ट्रॅक्टर (₹१.२५ लाखांपर्यंत थेट अनुदान), रोटाव्हेटर, पॉवर टिलर, पेरणी यंत्र व हार्वेस्टर खरेदीसाठी ४०% ते ५०% शासकीय अनुदान.",
    descriptionHi: "नया ट्रैक्टर, रोटावेटर, पावर टिलर और बुवाई मशीन खरीदने के लिए 40% से 50% तक सरकारी अनुदान.",
    icon: "🚜",
    badge: "50% Machine Subsidy",
    badgeColor: "amber",
    isFeatured: true,
    deadline: "31 Oct (Annual Lottery via MahaDBT)",
    optionsLabel: "Select Machinery Equipment",
    options: [
      { value: "tractor_40hp", label: "Tractor (Above 35 to 55 HP) - ₹1,25,000 Subsidy" },
      { value: "rotavator", label: "Rotavator (6-7 Feet) - ₹42,000 Subsidy" },
      { value: "power_tiller", label: "Power Tiller (8+ HP) - ₹85,000 Subsidy" },
      { value: "seed_drill", label: "Automatic Seed-cum-Fertilizer Drill - ₹28,000 Subsidy" },
    ],
    eligibility: [
      "Applicant must be a farmer with 7/12 extract in Maharashtra",
      "Family should not have availed tractor subsidy in the last 10 years",
      "SC/ST/Women/Small farmers receive 50% subsidy; general farmers receive 40%",
    ],
    eligibilityMr: [
      "शेतकऱ्याच्या कुटुंबाने मागील १० वर्षांत ट्रॅक्टर अनुदानाचा लाभ घेतलेला नसावा",
      "महिला व अल्पभूधारक शेतकऱ्यांना ५०% अनुदान, सर्वसाधारण शेतकऱ्यांना ४०% अनुदान",
    ],
    requiredDocs: [
      { name: "Aadhaar Card", nameMr: "आधार कार्ड", required: true },
      { name: "7/12 & 8-A Land Extract", nameMr: "७/१२ व ८-अ उतारा", required: true },
      { name: "Quotation / Proforma Invoice from authorized tractor dealer", nameMr: "अधिकृत विक्रेत्याचे कोटेशन/बिल", required: true },
      { name: "Bank Passbook copy", nameMr: "बँक पासबुक", required: true },
    ],
  },
  {
    id: "magel-tyala-shettale",
    title: "Magel Tyala Shettale (Farm Pond on Demand)",
    titleMr: "मागेल त्याला शेततळे योजना (₹७५,००० ते ₹१ लाख थेट अनुदान)",
    titleHi: "मांगने पर खेत तालाब योजना (100% सब्सिडी)",
    shortCode: "SHETTALE",
    category: "water",
    authority: "Maharashtra Govt",
    authorityMr: "महाराष्ट्र शासन",
    subsidyPercent: "100% Direct Grant",
    maxBenefit: "Up to ₹1,00,000 Grant",
    description: "100% government grant to construct individual farm ponds (30x30x3m) and plastic lining to harvest rainwater and secure irrigation during dry spells.",
    descriptionMr: "शेतकऱ्यांना पावसाचे पाणी साठवण्यासाठी शेततळे खोदणे व प्लास्टिक अस्तरीकरणासाठी थेट ₹५०,००० ते ₹१,००,००० पर्यंत अनुदान. दुष्काळातही शाश्वत पाणी!",
    descriptionHi: "खेत में बारिश का पानी संचित करने और तालाब निर्माण हेतु ₹1,00,000 तक का सीधा सरकारी अनुदान.",
    icon: "💧",
    badge: "100% Pond Grant",
    badgeColor: "blue",
    deadline: "Available All Year",
    optionsLabel: "Select Farm Pond Dimension",
    options: [
      { value: "pond_30x30", label: "Standard Farm Pond (30m x 30m x 3m) - ₹50,000 Grant" },
      { value: "pond_lining", label: "Farm Pond Plastic Lining - Additional ₹50,000 Grant" },
      { value: "pond_larger", label: "Large Community Pond (50m x 50m x 3m) - ₹1,00,000 Grant" },
    ],
    eligibility: [
      "Must own minimum 0.60 hectare (1.5 acres) of cultivable land",
      "Land topography must be technically feasible for water holding",
      "Must not have availed farm pond scheme benefit earlier",
    ],
    eligibilityMr: [
      "किमान ०.६० हेक्टर (१.५ एकर) शेती असणारा कोणताही शेतकरी पात्र",
      "यापूर्वी शेततळ्याचा शासकीय लाभ घेतलेला नसावा",
    ],
    requiredDocs: [
      { name: "7/12 & 8-A Extract with Survey Map", nameMr: "७/१२, ८-अ व शेताचा नकाशा", required: true },
      { name: "Aadhaar Card copy", nameMr: "आधार कार्ड", required: true },
      { name: "Bank Passbook copy", nameMr: "बँक पासबुक प्रत", required: true },
    ],
  },
  {
    id: "soil-health-card",
    title: "Soil Health Card Scheme (Free Soil Nutrient Testing)",
    titleMr: "सॉईल हेल्थ कार्ड योजना (मोफत माती व खत परीक्षण)",
    titleHi: "मृदा स्वास्थ्य कार्ड योजना (मुफ्त मिट्टी जांच)",
    shortCode: "SOIL-HEALTH",
    category: "grant",
    authority: "Central Govt",
    authorityMr: "केंद्र शासन व कृषी विज्ञान केंद्र",
    subsidyPercent: "100% Free Testing",
    maxBenefit: "Save ₹3,000/Acre Fertilizer",
    description: "Free scientific testing of soil samples across 12 vital chemical parameters (NPK, Organic Carbon, Zinc, Iron, pH, EC) with customized fertilizer dosage recommendations.",
    descriptionMr: "मातीमधील १२ महत्त्वाच्या घटकांचे (NPK, सेंद्रिय कर्ब, झिंक, सामू) मोफत प्रयोगशाळा परीक्षण. खतांचा अवाजवी खर्च वाचवा व उत्पादन वाढवा!",
    descriptionHi: "मिट्टी की उर्वरता और 12 पोषक तत्वों की 100% मुफ्त जांच व वैज्ञानिक खाद परामर्श कार्ड.",
    icon: "🌱",
    badge: "100% Free Soil Test",
    badgeColor: "green",
    deadline: "Available All Year",
    eligibility: [
      "All farmers across all districts of Maharashtra",
      "Samples collected by village Krishi Sahayak or submitted by farmer to nearest Krishi Vigyan Kendra (KVK)",
    ],
    eligibilityMr: [
      "सर्व शेतकरी मोफत माती परीक्षण अहवालासाठी पात्र",
    ],
    requiredDocs: [
      { name: "7/12 Extract", nameMr: "७/१२ उतारा", required: true },
      { name: "Aadhaar Card", nameMr: "आधार कार्ड", required: true },
    ],
  },
];

export const INITIAL_DEMO_APPLICATIONS: SchemeApplication[] = [
  {
    applicationId: "MH-KUSUM-2026-9812",
    schemeId: "pm-kusum",
    schemeTitle: "PM-KUSUM Solar Agricultural Pump Scheme",
    applicantName: "Ramesh Dnyaneshwar Patil",
    applicantPhone: "+91 98220 12345",
    aadhaarNumber: "XXXX-XXXX-8921",
    landAcres: "5.2 Acres",
    village: "Dindori",
    district: "Nashik",
    surveyNumber: "Gat No. 142/2",
    selectedOption: "5 HP Solar DC Submersible (₹27,800 Farmer Share)",
    appliedDate: "2026-08-18",
    status: "approved",
    currentStage: 4,
    statusNotes: "Field inspection passed by Taluka Agri Inspector. Subsidy sanction letter issued. Vendor assigned for solar pump installation.",
    disbursedAmount: "₹2,10,000 Sanctioned (90% Subsidy)",
  },
  {
    applicationId: "MH-PMK-2026-4421",
    schemeId: "pm-kisan",
    schemeTitle: "PM-KISAN + Namo Shetkari Yojana",
    applicantName: "Ramesh Dnyaneshwar Patil",
    applicantPhone: "+91 98220 12345",
    aadhaarNumber: "XXXX-XXXX-8921",
    landAcres: "5.2 Acres",
    village: "Dindori",
    district: "Nashik",
    surveyNumber: "Gat No. 142/2",
    selectedOption: "Individual Landholder Farmer",
    appliedDate: "2026-06-10",
    status: "disbursed",
    currentStage: 5,
    statusNotes: "17th Installment credited successfully via DBT into State Bank of India A/c *8832.",
    disbursedAmount: "₹4,000 Credited (Aug 2026 Installment)",
  },
  {
    applicationId: "MH-FASAL-2026-3105",
    schemeId: "pmfby",
    schemeTitle: "PMFBY Crop Insurance (₹1 Token Scheme)",
    applicantName: "Ramesh Dnyaneshwar Patil",
    applicantPhone: "+91 98220 12345",
    aadhaarNumber: "XXXX-XXXX-8921",
    landAcres: "3.5 Acres Cotton",
    village: "Dindori",
    district: "Nashik",
    surveyNumber: "Gat No. 142/2",
    selectedOption: "Cotton (कापूस - Kharif) - ₹42,000/Ha Cover",
    appliedDate: "2026-07-02",
    status: "under_verification",
    currentStage: 2,
    statusNotes: "Policy acknowledgement generated. Land record verified with revenue department.",
    disbursedAmount: "Insurance Cover: ₹1,47,000",
  },
];
