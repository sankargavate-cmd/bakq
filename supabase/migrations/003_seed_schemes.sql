-- ============================================================
-- Shetkari Sathi — Migration 003: Seed Government Schemes
-- Date: 2026-10-22
-- Description: Insert verified Central & Maharashtra Government
--              agricultural schemes into the government_schemes table.
-- ============================================================

INSERT INTO public.government_schemes (
  short_code,
  title,
  title_mr,
  title_hi,
  category,
  authority,
  subsidy_percent,
  max_benefit,
  description,
  description_mr,
  description_hi,
  deadline,
  eligibility,
  eligibility_mr,
  required_docs,
  official_url,
  is_active,
  last_verified_at
) VALUES
(
  'PM-KUSUM',
  'PM-KUSUM Solar Agricultural Pump Scheme',
  'पीएम-कुसुम सौर कृषी पंप योजना (९०% अनुदान)',
  'पीएम-कुसुम सोलर पंप योजना (90% सब्सिडी)',
  'solar',
  'Joint Central & State',
  'Up to 90% Subsidy',
  '₹2,65,000 Grant',
  'Get 90% government subsidy to install 3HP, 5HP, or 7.5HP solar-powered water pumps. Provides uninterrupted daytime irrigation without electricity bills.',
  'शेतातील विहीर किंवा बोअरवेलसाठी ३, ५ किंवा ७.५ एचपी सौर कृषी पंपावर तब्बल ९०% सरकारी अनुदान. दिवसा अखंड वीज आणि शून्य वीज बिल!',
  '3HP, 5HP या 7.5HP सोलर वाटर पंप लगाने के लिए 90% तक सरकारी सब्सिडी. दिन में मुफ्त व निर्बाध सिंचाई पाएं.',
  '31 March 2027 (Open)',
  ARRAY[
    'Farmer must possess cultivable agricultural land with 7/12 & 8A extract',
    'Must have an assured water source (Well, Borewell, Farm Pond, River)',
    'Should not have an existing conventional electric agriculture connection',
    'SC/ST farmers receive special priority and additional 5% state top-up'
  ],
  ARRAY[
    'शेतकऱ्याकडे स्वतःच्या नावावर ७/१२ व ८-अ शेतजमीन उतारा असावा',
    'शेतात विहीर, बोअरवेल, शेततळे किंवा नदी पाण्याचा शाश्वत स्रोत असावा',
    'सध्या पारंपारिक कृषी वीज जोडणी नसलेले शेतकरी पात्र',
    'अनुसूचित जाती व जमातीच्या शेतकऱ्यांना विशेष प्राधान्य'
  ],
  '[
    {"name": "Aadhaar Card copy", "nameMr": "आधार कार्ड प्रत", "required": true},
    {"name": "7/12 & 8-A Land Extract (< 3 months old)", "nameMr": "७/१२ व ८-अ उतारा", "required": true},
    {"name": "Bank Passbook with IFSC", "nameMr": "बँक पासबुक प्रत (IFSC सह)", "required": true},
    {"name": "No-Electricity-Connection Self Declaration", "nameMr": "वीज जोडणी नसल्याचे स्वयंघोषणापत्र", "required": true},
    {"name": "Caste Certificate (if applicable)", "nameMr": "जात प्रमाणपत्र (लागू असल्यास)", "required": false}
  ]'::jsonb,
  'https://pmkusum.mnre.gov.in',
  true,
  now()
),
(
  'PM-KISAN',
  'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
  'प्रधानमंत्री किसान सन्मान निधी (₹६,००० थेट बँक खात्यात)',
  'प्रधानमंत्री किसान सम्मान निधि योजना',
  'grant',
  'Central Govt',
  '100% Direct DBT Cash',
  '₹6,000 / Year',
  'Direct annual income support of ₹6,000 paid in three equal installments of ₹2,000 every four months to all landholding farmer families across India.',
  'सर्व शेतकरी कुटुंबांना वर्षाला ₹६,००० ची थेट आर्थिक मदत. दर चार महिन्यांनी ₹२,००० थेट आधार-संलग्न बँक खात्यात जमा.',
  'सभी भूमिधारक किसान परिवारों को ₹6,000 प्रति वर्ष 3 किस्तों (₹2,000 हर 4 माह) में सीधे बैंक खाते में.',
  'Ongoing All Year',
  ARRAY[
    'All landholding farmer families with cultivable landholding in their names',
    'e-KYC verification must be completed on PM-Kisan portal',
    'Bank account must be seeded with Aadhaar and mapped with NPCI',
    'Institutional landholders and income-tax payers are excluded'
  ],
  ARRAY[
    'स्वतःच्या नावावर लागवडीयोग्य शेतजमीन असणारे सर्व शेतकरी कुटुंब',
    'पीएम किसान पोर्टलवर ई-केवायसी (e-KYC) पूर्ण असणे बंधनकारक',
    'बँक खाते आधार व NPCI शी संलग्न असावे'
  ],
  '[
    {"name": "Aadhaar Card", "nameMr": "आधार कार्ड", "required": true},
    {"name": "7/12 Land Record with Land ID", "nameMr": "७/१२ भूमी अभिलेख", "required": true},
    {"name": "Aadhaar-linked Bank Account details", "nameMr": "आधार-संलग्न बँक खाते", "required": true}
  ]'::jsonb,
  'https://pmkisan.gov.in',
  true,
  now()
),
(
  'NAMO-SHETKARI',
  'Namo Shetkari Mahasanman Nidhi Yojana',
  'नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र शासन ₹६,०००)',
  'नमो शेतकरी महासम्मान निधि योजना (महाराष्ट्र)',
  'grant',
  'Maharashtra Govt',
  '100% State Cash Grant',
  '₹6,000 / Year',
  'Maharashtra State Government top-up granting an additional ₹6,000/year to all PM-KISAN eligible farmers in Maharashtra, making a total of ₹12,000/year.',
  'महाराष्ट्र शासनातर्फे पीएम-किसानच्या ₹६,००० व्यतिरिक्त आणखी ₹६,००० वार्षिक अनुदान. महाराष्ट्रातील शेतकऱ्यांना एकूण ₹१२,००० थेट लाभ!',
  'महाराष्ट्र सरकार द्वारा पीएम-किसान के अतिरिक्त ₹6,000/वर्ष का अतिरिक्त लाभ (कुल ₹12,000/वर्ष).',
  'Ongoing with PM-KISAN',
  ARRAY[
    'Must be an active beneficiary of the Central PM-KISAN scheme in Maharashtra',
    'Landholding located within the state of Maharashtra',
    'Valid Aadhaar-linked Maharashtra bank account'
  ],
  ARRAY[
    'महाराष्ट्रातील पीएम-किसान योजनेचे सक्रिय लाभार्थी असणे आवश्यक',
    'शेतजमीन महाराष्ट्र राज्यात असणे बंधनकारक',
    'आधार-लिंक्ड बँक खाते असणे आवश्यक'
  ],
  '[
    {"name": "PM-KISAN Beneficiary ID / Aadhaar", "nameMr": "पीएम-किसान लाभार्थी क्रमांक / आधार", "required": true},
    {"name": "7/12 Land Record", "nameMr": "७/१२ उतारा", "required": true}
  ]'::jsonb,
  'https://mahadbt.maharashtra.gov.in',
  true,
  now()
),
(
  'PMFBY',
  'Pradhan Mantri Fasal Bima Yojana (₹1 Crop Insurance)',
  'प्रधानमंत्री पीक विमा योजना (फक्त ₹१ रुपयात पीक विमा)',
  'प्रधानमंत्री फसल बीमा योजना (₹1 में फसल सुरक्षा)',
  'insurance',
  'Joint Central & State',
  'Complete Risk Cover for ₹1',
  'Up to ₹45,000 / Acre',
  'Comprehensive financial protection against crop yield loss caused by non-preventable natural risks (drought, flood, unseasonal rains, hailstorms, pest attacks). In Maharashtra, farmers pay only ₹1 token fee.',
  'दुष्काळ, अतिवृष्टी, गारपीट किंवा अवेळी पावसामुळे पिकांचे नुकसान झाल्यास संपूर्ण विमा संरक्षण. महाराष्ट्रातील शेतकऱ्यांसाठी केवळ ₹१ नाममात्र शुल्कात उपलब्ध!',
  'प्राकृतिक आपदाओं, ओलावृष्टि और कीट प्रकोप से होने वाले फसल नुकसान की पूरी भरपाई केवल ₹1 प्रीमियम में.',
  '15 July (Kharif) / 15 Dec (Rabi)',
  ARRAY[
    'All farmers growing notified crops in notified areas (both loanee and non-loanee)',
    'Tenant farmers and sharecroppers are also eligible with declaration',
    'Must apply before the notified seasonal cutoff deadline'
  ],
  ARRAY[
    'अधिसूचित क्षेत्रातील अधिसूचित पिके घेणारे सर्व शेतकरी (कर्जदार व बिगर-कर्जदार)',
    'कुळ शेतकरी व भाडेतत्वावर शेती करणारे शेतकरीही स्वयंघोषणापत्रासह पात्र'
  ],
  '[
    {"name": "Aadhaar Card", "nameMr": "आधार कार्ड", "required": true},
    {"name": "7/12 Extract with Sowing Crop Entry", "nameMr": "७/१२ उतारा व पीक पेरा नोंद", "required": true},
    {"name": "Bank Passbook Copy", "nameMr": "बँक पासबुक प्रत", "required": true}
  ]'::jsonb,
  'https://pmfby.gov.in',
  true,
  now()
),
(
  'KCC',
  'Kisan Credit Card (KCC) - 4% Low Interest Crop Loan',
  'किसान क्रेडिट कार्ड (KCC) - ४% सवलतीच्या व्याजदरात पीक कर्ज',
  'किसान क्रेडिट कार्ड (KCC) - 4% रियायती कृषि ऋण',
  'loan',
  'Central Govt',
  '3% Interest Subvention (Effective 4%)',
  'Up to ₹3,00,000 Loan',
  'Concessional institutional credit for farmers to meet short-term crop cultivation expenses, seeds, fertilizers, and post-harvest maintenance at only 4% effective interest rate with timely repayment.',
  'बियाणे, खते आणि शेती खर्चासाठी ₹३ लाखांपर्यंत अत्यंत स्वस्त पीक कर्ज. वेळेत परतफेड केल्यास केवळ ४% नाममात्र व्याजदर.',
  'खेती खर्च, खाद, बीज के लिए ₹3 लाख तक का आसान ऋण केवल 4% प्रभावी ब्याज दर पर.',
  'Available All Year',
  ARRAY[
    'All individual landowning farmers, joint borrowers, tenant farmers, and SHGs',
    'Age between 18 to 70 years',
    'No default on existing agricultural loans'
  ],
  ARRAY[
    'सर्व शेतकरी, कुळ शेतकरी, बटाईदार व शेतकरी बचत गट पात्र',
    'वय १८ ते ७० वर्षे',
    'मागील कृषी कर्जात थकबाकीदार नसावा'
  ],
  '[
    {"name": "Aadhaar & PAN Card", "nameMr": "आधार व पॅन कार्ड", "required": true},
    {"name": "7/12, 8A Land Extract & Ferfar", "nameMr": "७/१२, ८-अ व फेरफार उतारा", "required": true},
    {"name": "No Objection Certificate (NOC) from other banks", "nameMr": "ना-हरकत प्रमाणपत्र (NOC)", "required": true}
  ]'::jsonb,
  'https://myscheme.gov.in',
  true,
  now()
),
(
  'SMAM',
  'SMAM - Farm Machinery & Tractor Subsidy Scheme',
  'कृषी यांत्रिकीकरण योजना (ट्रॅक्टर व अवजारांवर ५०% अनुदान)',
  'कृषि यंत्रीकरण योजना (ट्रैक्टर व कृषि यंत्र 50% सब्सिडी)',
  'machinery',
  'Joint Central & State',
  '40% to 50% Subsidy',
  'Up to ₹1,25,000 Subsidy',
  'Financial assistance of 40% to 50% for purchasing new Tractors (up to ₹1.25 Lakh grant), Rotavators, Power Tillers, Seed Drills, Laser Levelers, and Harvesters through MahaDBT portal.',
  'नवीन ट्रॅक्टर (₹१.२५ लाखांपर्यंत थेट अनुदान), रोटाव्हेटर, पॉवर टिलर, पेरणी यंत्र व हार्वेस्टर खरेदीसाठी ४०% ते ५०% शासकीय अनुदान.',
  'नया ट्रैक्टर, रोटावेटर, पावर टिलर और बुवाई मशीन खरीदने के लिए 40% से 50% तक सरकारी अनुदान.',
  '31 Oct (Annual Lottery via MahaDBT)',
  ARRAY[
    'Applicant must be a farmer with 7/12 extract in Maharashtra',
    'Family should not have availed tractor subsidy in the last 10 years',
    'SC/ST/Women/Small farmers receive 50% subsidy; general farmers receive 40%'
  ],
  ARRAY[
    'शेतकऱ्याच्या कुटुंबाने मागील १० वर्षांत ट्रॅक्टर अनुदानाचा लाभ घेतलेला नसावा',
    'महिला व अल्पभूधारक शेतकऱ्यांना ५०% अनुदान, सर्वसाधारण शेतकऱ्यांना ४०% अनुदान'
  ],
  '[
    {"name": "Aadhaar Card", "nameMr": "आधार कार्ड", "required": true},
    {"name": "7/12 & 8-A Land Extract", "nameMr": "७/१२ व ८-अ उतारा", "required": true},
    {"name": "Quotation / Proforma Invoice from authorized tractor dealer", "nameMr": "अधिकृत विक्रेत्याचे कोटेशन/बिल", "required": true},
    {"name": "Bank Passbook copy", "nameMr": "बँक पासबुक", "required": true}
  ]'::jsonb,
  'https://mahadbt.maharashtra.gov.in',
  true,
  now()
),
(
  'SHETTALE',
  'Magel Tyala Shettale (Farm Pond on Demand)',
  'मागेल त्याला शेततळे योजना (₹७५,००० ते ₹१ लाख थेट अनुदान)',
  'मांगने पर खेत तालाब योजना (100% सब्सिडी)',
  'water',
  'Maharashtra Govt',
  '100% Direct Grant',
  'Up to ₹1,00,000 Grant',
  '100% government grant to construct individual farm ponds (30x30x3m) and plastic lining to harvest rainwater and secure irrigation during dry spells.',
  'शेतकऱ्यांना पावसाचे पाणी साठवण्यासाठी शेततळे खोदणे व प्लास्टिक अस्तरीकरणासाठी थेट ₹५०,००० ते ₹१,००,००० पर्यंत अनुदान. दुष्काळातही शाश्वत पाणी!',
  'खेत में बारिश का पानी संचित करने और तालाब निर्माण हेतु ₹1,00,000 तक का सीधा सरकारी अनुदान.',
  'Available All Year',
  ARRAY[
    'Must own minimum 0.60 hectare (1.5 acres) of cultivable land',
    'Land topography must be technically feasible for water holding',
    'Must not have availed farm pond scheme benefit earlier'
  ],
  ARRAY[
    'किमान ०.६० हेक्टर (१.५ एकर) शेती असणारा कोणताही शेतकरी पात्र',
    'यापूर्वी शेततळ्याचा शासकीय लाभ घेतलेला नसावा'
  ],
  '[
    {"name": "7/12 & 8-A Extract with Survey Map", "nameMr": "७/१२, ८-अ व शेताचा नकाशा", "required": true},
    {"name": "Aadhaar Card copy", "nameMr": "आधार कार्ड", "required": true},
    {"name": "Bank Passbook copy", "nameMr": "बँक पासबुक प्रत", "required": true}
  ]'::jsonb,
  'https://mahadbt.maharashtra.gov.in',
  true,
  now()
),
(
  'SOIL-HEALTH',
  'Soil Health Card Scheme (Free Soil Nutrient Testing)',
  'सॉईल हेल्थ कार्ड योजना (मोफत माती व खत परीक्षण)',
  'मृदा स्वास्थ्य कार्ड योजना (मुफ्त मिट्टी जांच)',
  'grant',
  'Central Govt',
  '100% Free Testing',
  'Save ₹3,000/Acre Fertilizer',
  'Free scientific testing of soil samples across 12 vital chemical parameters (NPK, Organic Carbon, Zinc, Iron, pH, EC) with customized fertilizer dosage recommendations.',
  'मातीमधील १२ महत्त्वाच्या घटकांचे (NPK, सेंद्रिय कर्ब, झिंक, सामू) मोफत प्रयोगशाळा परीक्षण. खतांचा अवाजवी खर्च वाचवा व उत्पादन वाढवा!',
  'मिट्टी की उर्वरता और 12 पोषक तत्वों की 100% मुफ्त जांच व वैज्ञानिक खाद परामर्श कार्ड.',
  'Available All Year',
  ARRAY[
    'All farmers across all districts of Maharashtra',
    'Samples collected by village Krishi Sahayak or submitted by farmer to nearest Krishi Vigyan Kendra (KVK)'
  ],
  ARRAY[
    'सर्व शेतकरी मोफत माती परीक्षण अहवालासाठी पात्र'
  ],
  '[
    {"name": "7/12 Extract", "nameMr": "७/१२ उतारा", "required": true},
    {"name": "Aadhaar Card", "nameMr": "आधार कार्ड", "required": true}
  ]'::jsonb,
  'https://soilhealth.dac.gov.in',
  true,
  now()
)
ON CONFLICT (short_code) DO UPDATE SET
  title = EXCLUDED.title,
  title_mr = EXCLUDED.title_mr,
  title_hi = EXCLUDED.title_hi,
  category = EXCLUDED.category,
  authority = EXCLUDED.authority,
  subsidy_percent = EXCLUDED.subsidy_percent,
  max_benefit = EXCLUDED.max_benefit,
  description = EXCLUDED.description,
  description_mr = EXCLUDED.description_mr,
  description_hi = EXCLUDED.description_hi,
  deadline = EXCLUDED.deadline,
  eligibility = EXCLUDED.eligibility,
  eligibility_mr = EXCLUDED.eligibility_mr,
  required_docs = EXCLUDED.required_docs,
  official_url = EXCLUDED.official_url,
  is_active = EXCLUDED.is_active,
  last_verified_at = EXCLUDED.last_verified_at;
