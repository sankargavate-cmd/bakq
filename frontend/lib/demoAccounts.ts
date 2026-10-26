import { Role } from "@/types";
import { setStoredToken } from "./auth";

export interface DemoPersona {
  role: Role;
  name: string;
  nameMr: string;
  nameHi: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  avatarBg: string;
  avatarEmoji: string;
  description: string;
  keyStats: { label: string; value: string }[];
  dashboardPath: string;
}

export const DEMO_PERSONAS: Record<Role, DemoPersona> = {
  FARMER: {
    role: "FARMER",
    name: "Ramesh Patil",
    nameMr: "संजय मोरे (सेवा केंद्र)",
    nameHi: "संजय मोरे (सेवा केंद्र)",
    title: "Progressive Farmer (5 Acres)",
    email: "farmer@demo.shetkarisathi.com",
    phone: "+91 98220 12345",
    location: "Dindori, Nashik, Maharashtra",
    avatarBg: "linear-gradient(135deg, #2e7d32, #4caf50)",
    avatarEmoji: "👨‍🌾",
    description: "Cultivates Cotton, Soybean & Grapes with drip irrigation. Has 2 active produce listings and applied for PM-KUSUM Solar Pump.",
    keyStats: [
      { label: "Land Holding", value: "5.2 Acres" },
      { label: "Active Produce", value: "2 Lots" },
      { label: "Schemes Applied", value: "3 Active" },
    ],
    dashboardPath: "/farmer/dashboard",
  },
  BUYER: {
    role: "BUYER",
    name: "Vikram Agro Foods",
    nameMr: "विक्रम ॲग्रो फूड्स",
    nameHi: "विक्रम एग्रो फूड्स",
    title: "Licensed APMC Wholesale Buyer",
    email: "buyer@demo.shetkarisathi.com",
    phone: "+91 94223 54321",
    location: "Gultekdi Market Yard, Pune",
    avatarBg: "linear-gradient(135deg, #1565c0, #1e88e5)",
    avatarEmoji: "🛒",
    description: "Wholesale grain & produce trader supplying retail chains across Maharashtra. Looking for fresh Onions, Soybean & Wheat.",
    keyStats: [
      { label: "Verified Buyer", value: "APMC Tier-1" },
      { label: "Active Bids", value: "4 Offers" },
      { label: "Total Traded", value: "140+ Tons" },
    ],
    dashboardPath: "/buyer/dashboard",
  },
  LABOUR: {
    role: "LABOUR",
    name: "Sunil Shinde",
    nameMr: "सुनील शिंदे",
    nameHi: "सुनील शिंदे",
    title: "Skilled Harvest & Sowing Lead Worker",
    email: "labour@demo.shetkarisathi.com",
    phone: "+91 91580 98765",
    location: "Karad, Satara, Maharashtra",
    avatarBg: "linear-gradient(135deg, #e65100, #fb8c00)",
    avatarEmoji: "👷‍♂️",
    description: "Expert in sugarcane harvesting, cotton picking, and modern sowing machinery with a trusted crew of 6 skilled workers.",
    keyStats: [
      { label: "Rating", value: "4.9 ★ (38)" },
      { label: "Daily Rate", value: "₹450 / day" },
      { label: "Completed Jobs", value: "42 Fields" },
    ],
    dashboardPath: "/labour/dashboard",
  },
  TRACTOR_OWNER: {
    role: "TRACTOR_OWNER",
    name: "Ganesh Krishi Yantra",
    nameMr: "गणेश कृषी यंत्र",
    nameHi: "गणेश कृषि यंत्र",
    title: "Custom Hiring Center / Tractor Owner",
    email: "tractor@demo.shetkarisathi.com",
    phone: "+91 99211 44556",
    location: "Shirol, Kolhapur, Maharashtra",
    avatarBg: "linear-gradient(135deg, #c2185b, #e91e63)",
    avatarEmoji: "🚜",
    description: "Equipped with Mahindra 575 DI (55HP), 9-Tyne Cultivator, Rotavator, and Multi-crop Harvester available for rental booking.",
    keyStats: [
      { label: "Machinery", value: "55HP + Harvester" },
      { label: "Hourly Rate", value: "₹850 / hr" },
      { label: "Service Radius", value: "35 km" },
    ],
    dashboardPath: "/tractor/dashboard",
  },
  TRANSPORT_PROVIDER: {
    role: "TRANSPORT_PROVIDER",
    name: "Maruti Agro Logistics",
    nameMr: "मारुती ॲग्रो लॉजिस्टिक्स",
    nameHi: "मारुति एग्रो लॉजिस्टिक्स",
    title: "Farm-to-Mandi Freight Transporter",
    email: "transport@demo.shetkarisathi.com",
    phone: "+91 97632 77889",
    location: "Miraj, Sangli, Maharashtra",
    avatarBg: "linear-gradient(135deg, #00838f, #00acc1)",
    avatarEmoji: "🚚",
    description: "Operates 5-Ton Bolero Maxi Trucks & Eicher 14-Footers with covered tarpaulin for prompt crop delivery to major mandis.",
    keyStats: [
      { label: "Fleet Capacity", value: "5T & 10T Trucks" },
      { label: "Trips Completed", value: "115+ Trips" },
      { label: "Base Rate", value: "₹28 / km" },
    ],
    dashboardPath: "/transport/dashboard",
  },
  MACHINERY_PROVIDER: {
    role: "MACHINERY_PROVIDER",
    name: "Baliraja Agro Implements",
    nameMr: "बळीराजा ॲग्रो इम्प्लिमेंट्स",
    nameHi: "बलिराजा एग्रो इंप्लीमेंट्स",
    title: "Heavy Agri Equipment Provider",
    email: "machinery@demo.shetkarisathi.com",
    phone: "+91 98900 11223",
    location: "Baramati, Pune, Maharashtra",
    avatarBg: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
    avatarEmoji: "⚙️",
    description: "Provides Drone sprayers, Automatic seed drills, Laser land levelers, and Sugar cane combine harvesters.",
    keyStats: [
      { label: "Equipments", value: "8 Machines" },
      { label: "Drones", value: "2 DGCA Certified" },
      { label: "Rating", value: "4.8 ★" },
    ],
    dashboardPath: "/farmer/dashboard",
  },
  ADMIN: {
    role: "ADMIN",
    name: "Dr. Rajesh Deshmukh",
    nameMr: "डॉ. राजेश देशमुख",
    nameHi: "डॉ. राजेश देशमुख",
    title: "Taluka Agriculture Officer (MH Agri Dept)",
    email: "admin@demo.shetkarisathi.com",
    phone: "+91 20 2605 1122",
    location: "District Agri Office, Nashik",
    avatarBg: "linear-gradient(135deg, #37474f, #546e7a)",
    avatarEmoji: "🛡️",
    description: "Official verifying farmer 7/12 land records, subsidy applications, and labour safety standards across the sub-district.",
    keyStats: [
      { label: "Pending Verifications", value: "6 Profiles" },
      { label: "Approved Grants", value: "₹18.4 Lakh" },
      { label: "Jurisdiction", value: "Nashik Div." },
    ],
    dashboardPath: "/admin",
  },
  AUTHORIZED_PAYMENT_AGENT: {
    role: "AUTHORIZED_PAYMENT_AGENT",
    name: "Sanjay More (Seva Kendra)",
    nameMr: "संजय मोरे (सेवा केंद्र)",
    nameHi: "संजय मोरे (सेवा केंद्र)",
    title: "Authorized Offline Payment Agent",
    email: "agent@demo.shetkarisathi.com",
    phone: "+91 97654 98765",
    location: "Niphad, Nashik, Maharashtra",
    avatarBg: "linear-gradient(135deg, #00796b, #009688)",
    avatarEmoji: "💼",
    description: "Authorized local CSC / payment collection agent for cash receipts, UPI validation, and farmer settlement.",
    keyStats: [
      { label: "Cashbook Balance", value: "₹42,500" },
      { label: "Verified Today", value: "12 Receipts" },
      { label: "Commission", value: "₹1,250" },
    ],
    dashboardPath: "/farmer/dashboard",
  },
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    name: "State Portal Administrator",
    nameMr: "राज्य पोर्टल प्रशासक",
    nameHi: "राज्य पोर्टल प्रशासक",
    title: "System & State Level Administrator",
    email: "superadmin@demo.shetkarisathi.com",
    phone: "+91 22 2202 5500",
    location: "Mantralaya, Mumbai, Maharashtra",
    avatarBg: "linear-gradient(135deg, #212121, #424242)",
    avatarEmoji: "👑",
    description: "State level administration controlling officer permissions, district policies, system uptime, and aggregate analytics.",
    keyStats: [
      { label: "Active Users", value: "14,820+" },
      { label: "Officers Managed", value: "48 Admins" },
      { label: "Status", value: "All Systems 100%" },
    ],
    dashboardPath: "/super-admin/admins",
  },
};

/**
 * Creates a mock JWT token with role claim and user details in the payload.
 */
export function createMockToken(persona: DemoPersona): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    userId: `demo-${persona.role.toLowerCase()}-001`,
    email: persona.email,
    name: persona.name,
    role: persona.role,
    isDemo: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
  };

  const encodeBase64Url = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(payload);
  const signature = "demo_signature_for_instant_preview";

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Logs in directly as the specified demo role.
 * Sets the mock JWT token in sessionStorage and seeds relevant sample state.
 */
export function loginAsDemoUser(role: Role): DemoPersona {
  const persona = DEMO_PERSONAS[role] || DEMO_PERSONAS.FARMER;
  const token = createMockToken(persona);
  setStoredToken(token);

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem("shetkari-sathi:demo-role", role);
    window.sessionStorage.setItem("shetkari-sathi:demo-user", JSON.stringify(persona));
  }

  return persona;
}

/**
 * Checks if current logged-in user is a demo session.
 */
export function isCurrentSessionDemo(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("shetkari-sathi:demo-role") !== null;
}

/**
 * Gets the current active demo persona details, or default farmer if none.
 */
export function getCurrentDemoPersona(): DemoPersona | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem("shetkari-sathi:demo-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoPersona;
  } catch {
    return null;
  }
}
