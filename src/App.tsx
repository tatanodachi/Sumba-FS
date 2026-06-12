// @ts-nocheck
import {
  runAssetEngine,
  DEFAULT_ASSET_ASSUMPTIONS,
  formatNumber,
  formatCurrency,
  calculatePMT,
  calculatePayback,
  calculateIRR,
  calculateNPV,
  runConsolidatedAssetEngine,
  INITIAL_ASSET_CLUSTERS_ASSUMPTIONS,
} from "./financialEngine";
import { GlampingMixTable } from "./components/GlampingMixTable";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  memo,
  useCallback,
} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  Settings,
  LayoutDashboard,
  LayoutGrid,
  List,
  Users,
  Shield,
  Scale,
  AlignLeft,
  AlignRight,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Link2,
  Coins,
  Building2,
  Palmtree,
  Briefcase,
  ShieldCheck,
  Coffee,
  Sparkles,
  BrainCircuit,
  RefreshCcw,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Landmark,
  ArrowRightLeft,
  X,
  Download,
  AlertTriangle,
  Grid,
  Clock,
  Lock,
  Unlock,
  Info,
  MapPin,
  Building,
  Cloud,
  CloudOff,
  ChevronDown,
  GripHorizontal,
  Maximize,
  Minimize,
  BookOpen,
  Target,
  Search,
  FolderTree,
  BarChartHorizontal,
  Layers,
  Bed,
  Timer,
  Network,
  Plane,
  Utensils,
  Waves,
  Eye,
  Check,
  ArrowRight,
  Ruler,
  Calendar,
  CalendarDays,
  Plus,
  Trash2,
  ChevronsUpDown,
  ChevronsDownUp,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Award,
  CheckCircle2,
  HelpCircle,
  Zap,
} from "lucide-react";

const CHART_MARGINS_BAR = { top: 20, right: 0, left: 0, bottom: 0 };
const CHART_MARGINS_LINE = { top: 40, right: 35, left: 20, bottom: 0 };
const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid #D8D8D8",
  fontSize: "12px",
  color: "#1E2F31",
};
const CHART_CURSOR_STYLE = { fill: "#F9F8F6" };
const LEGEND_STYLE = { fontSize: "11px", paddingTop: "20px" };

// --- NEW STABLE REFERENCES FOR OPPORTUNITIES TAB ---
const TICK_STYLE = { fontSize: 10, fill: "#4C4A4B" };
const PREM_MKT_PIE_DATA = [
  { name: "SES A & B", value: 18 },
  { name: "General / BPJS", value: 82 },
];
const formatCancerCases = (val) => new Intl.NumberFormat("en-US").format(val);
const formatInsuranceTooltip = (val) => val.toFixed(2) + "T IDR";
const formatInsuranceLabel = (val) => val.toFixed(2);
const LINE_LABEL_STYLE = {
  position: "top",
  fill: "#4C4A4B",
  fontSize: 10,
  dy: -10,
  formatter: formatInsuranceLabel,
};

const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={index === 0 ? "#9B8B70" : "#8A9A9C"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
    >
      <tspan x={x} dy="-0.4em">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(0)}%`}</tspan>
    </text>
  );
};
// ---------------------------------------------------

// --- TIMELINE CONSTANTS & DATA ---
const START_YEAR = 2027;
const DEFAULT_END_YEAR = 2029;
const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const generateTimelineMonths = (start, end) => {
  const months = [];
  let num = 1;
  for (let year = start; year <= end; year++) {
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const mName = `${MONTH_NAMES_SHORT[monthIdx]} ${String(year).slice(-2)}`;
      let phase = "Operations";
      if (year === start) {
        if (monthIdx < 3) phase = "Feasibility";
        else if (monthIdx < 6) phase = "Design";
        else phase = "Licensing";
      } else if (year === start + 1) {
        if (monthIdx < 9) phase = "Construction";
        else phase = "Procurement";
      } else if (year === start + 2) {
        if (monthIdx < 6) phase = "EPC Core";
        else phase = "Commission";
      } else if (year > start + 2) {
        phase = year === end ? "Maturity" : "Operations";
      }
      months.push({ num: num++, name: mName, year: year, phase: phase });
    }
  }
  return months;
};

const INITIAL_GROUPS = [
  {
    id: "capex",
    name: "0. CAPEX & Setup",
    color: "from-indigo-600 to-indigo-800",
    bgLight: "bg-indigo-50",
    tasks: [
      {
        id: "c1",
        name: "Land Acquisition",
        start: 1,
        duration: 1,
        progress: 100,
        dependencies: [],
        owner: "Finance Board",
        cost: 0,
        desc: "Final settlement and site handover for the specialized hospital facility.",
        critical: true,
      },
      {
        id: "c2",
        name: "Licensing & Permits",
        start: 1,
        duration: 12,
        progress: 0,
        dependencies: [],
        owner: "Legal / Ops",
        cost: 1.2,
        desc: "Strategic licenses, setup fees, and initial MoH administrative registrations.",
        critical: false,
      },
      {
        id: "c3",
        name: "Consultant (Design/Legal/Financial)",
        start: 2,
        duration: 6,
        progress: 0,
        dependencies: [],
        owner: "Project Mgmt",
        cost: 4.8,
        desc: "Design consultants, financial audit groups, and clinical strategy advisors.",
        critical: true,
      },
      {
        id: "c4",
        name: "Hospital FF&E Setup",
        start: 21,
        duration: 4,
        progress: 0,
        dependencies: ["t7_1"],
        owner: "Procurement",
        cost: 26.0,
        desc: "Furniture, Fixtures & Equipment fit-out for clinical and admin zones, scheduled sequentially post-Interior Fit-Out.",
        critical: false,
      },
      {
        id: "c5",
        name: "Cluster Infrastructure",
        start: 1,
        duration: 12,
        progress: 0,
        dependencies: [],
        owner: "IT / Facilities",
        cost: 5.8,
        desc: "Network backbone, server rooms, and primary medical data clustering setup.",
        critical: false,
      },
      {
        id: "c6",
        name: "Sharing Development",
        start: 1,
        duration: 12,
        progress: 0,
        dependencies: [],
        owner: "Tech Team",
        cost: 4.3,
        desc: "Software systems and R&D cost sharing for multi-tenant integrated apps.",
        critical: false,
      },
      {
        id: "c7",
        name: "Hospital Construction",
        start: 1,
        duration: 20,
        progress: 0,
        dependencies: ["c2"],
        owner: "EPC Contractor",
        cost: 149.5,
        desc: "Main building structural construction, piling, and core envelope setup.",
        critical: true,
      },
      {
        id: "c8",
        name: "Medical Equipment Setup",
        start: 61,
        duration: 3,
        progress: 0,
        dependencies: ["c7"],
        owner: "Procurement",
        cost: 45.0,
        desc: "Procurement, rigging, and installation of major medical and oncology equipment.",
        critical: true,
      },
    ],
  },
  {
    id: "design",
    name: "1. Design & Planning",
    color: "from-[#1C6048] to-[#2E8563]",
    bgLight: "bg-[#1C6048]/5",
    tasks: [
      {
        id: "t1",
        name: "JV & Feasibility",
        start: 1,
        duration: 4,
        progress: 100,
        owner: "Sponsor Board",
        cost: 2.5,
        desc: "Finalizing joint-venture structure, GFA allocations, and financial underpinnings.",
        critical: false,
        dependencies: [],
      },
      {
        id: "t2",
        name: "Architectural Planning",
        start: 4,
        duration: 4,
        progress: 60,
        owner: "Lead Architect",
        cost: 4.0,
        desc: "Development of detailed schematics, building footprint optimization, and landscape integration.",
        critical: true,
        dependencies: ["t1"],
      },
      {
        id: "t3",
        name: "MEP & Vault Layouts",
        start: 6,
        duration: 4,
        progress: 10,
        owner: "MEP Engineers",
        cost: 2.2,
        desc: "Designing complex ventilation, electrical backups, and customized structural reinforced vaults.",
        critical: true,
        dependencies: ["t2"],
      },
    ],
  },
  {
    id: "licensing",
    name: "2. Licensing & Regulatory",
    color: "from-[#9B8B70] to-[#B5A58A]",
    bgLight: "bg-[#9B8B70]/5",
    tasks: [
      {
        id: "t4",
        name: "Hospital Clearances (IMB)",
        start: 4,
        duration: 6,
        progress: 0,
        owner: "Legal Team",
        cost: 1.5,
        desc: "Securing local building approvals (IMB), environmental impact assessments (AMDAL), and initial MoH registrations.",
        critical: false,
        dependencies: ["t2"],
      },
      {
        id: "t5",
        name: "BAPETEN Vault Licence",
        start: 13,
        duration: 3,
        progress: 0,
        owner: "Nuclear Physicist / Legal",
        cost: 3.5,
        desc: "Critical-path approval for heavy particle bunker construction and nuclear medicine operations.",
        critical: true,
        dependencies: ["t3"],
      },
    ],
  },
  {
    id: "construction",
    name: "3. Civil & Construction",
    color: "from-[#1E2F31] to-[#364F52]",
    bgLight: "bg-[#1E2F31]/5",
    tasks: [
      {
        id: "t6_1",
        name: "Piling, Excavation & Foundation",
        start: 1,
        duration: 4,
        progress: 0,
        owner: "EPC Contractor",
        cost: 22.4,
        desc: "Civil site preparation, drilling, setting foundation piles, and mass excavation.",
        critical: true,
        dependencies: ["t4"],
      },
      {
        id: "t6_2",
        name: "Main Structural Superstructure",
        start: 5,
        duration: 10,
        progress: 0,
        owner: "EPC Contractor",
        cost: 59.8,
        desc: "Reinforced concrete structural skeleton, pillars, floors, and slabs work.",
        critical: true,
        dependencies: ["t6_1"],
      },
      {
        id: "t6_3",
        name: "Heavy Concrete Shielding Bunkers",
        start: 9,
        duration: 4,
        progress: 0,
        owner: "Bunker Specialist",
        cost: 22.4,
        desc: "Pouring high-density barytes concrete shielding for oncology linac bunkers.",
        critical: true,
        dependencies: ["t6_2"],
      },
      {
        id: "t6_4",
        name: "HVAC & Hospital MEP Setup",
        start: 12,
        duration: 8,
        progress: 0,
        owner: "MEP Subcontractor",
        cost: 44.9,
        desc: "Deploying hospital-grade HEPA HVAC filtration, central plant and primary electrical conduits.",
        critical: true,
        dependencies: ["t6_2"],
      },
      {
        id: "t7_1",
        name: "Interior Fit-Out & Finishes",
        start: 18,
        duration: 4,
        progress: 0,
        owner: "Interior Designer",
        cost: 13.0,
        desc: "Hanging hygienic drywall, antibacterial coatings, ceiling treatment, and specialized lighting panels.",
        critical: false,
        dependencies: ["t6_2"],
      },
      {
        id: "t7_2",
        name: "Clinical Furniture Integration",
        start: 21,
        duration: 4,
        progress: 0,
        owner: "Procurement Lead",
        cost: 13.0,
        desc: "Installation of nurse desks, clinical counters, patient lockers, and back-office furniture.",
        critical: false,
        dependencies: ["t7_1"],
      },
    ],
  },
  {
    id: "infrastructure",
    name: "4. Infrastructure",
    color: "from-[#2C5E4E] to-[#1E2F31]",
    bgLight: "bg-[#2C5E4E]/5",
    tasks: [
      {
        id: "t8",
        name: "Cluster Infrastructure",
        start: 1,
        duration: 12,
        progress: 0,
        owner: "IT / Facilities",
        cost: 5.8,
        desc: "Physical setup of server hardware, clinical networks, and local area connectivity within the hospital facility.",
        critical: false,
        dependencies: [],
      },
      {
        id: "t9",
        name: "Sharing Development",
        start: 1,
        duration: 12,
        progress: 0,
        owner: "Tech Team",
        cost: 4.3,
        desc: "Software integrations, patient portal configurations, and collaborative platform development.",
        critical: false,
        dependencies: [],
      },
    ],
  },
  {
    id: "equipment",
    name: "5. Equipment & Launch",
    color: "from-[#99B6AA] to-[#B3CFC3]",
    bgLight: "bg-[#99B6AA]/10",
    tasks: [
      {
        id: "t10",
        name: "Oncology Asset Lease",
        start: 61,
        duration: 3,
        progress: 0,
        owner: "Procurement Board",
        cost: 45.0,
        desc: "Finalizing delivery parameters and lease schedules with direct global medical technology manufacturers.",
        critical: true,
        dependencies: ["t5"],
      },
      {
        id: "t11",
        name: "Machinery Rigging & Fit",
        start: 19,
        duration: 3,
        progress: 0,
        owner: "Install Engineers",
        cost: 8.0,
        desc: "Physical transport, crane-rigging, and mounting of medical assets into BAPETEN-approved bunkers.",
        critical: true,
        dependencies: ["t6_3", "t10"],
      },
      {
        id: "t12",
        name: "Testing & Staff Drills",
        start: 22,
        duration: 3,
        progress: 0,
        owner: "Clinical Director",
        cost: 4.5,
        desc: "Calibration of high-energy photon beams, safety sweeps, mock patient cycles, and emergency simulations.",
        critical: true,
        dependencies: ["t11", "t7_1"],
      },
      {
        id: "t13",
        name: "Commercial Opening",
        start: 25,
        duration: 1,
        progress: 0,
        owner: "Operations GM",
        cost: 6.0,
        desc: "Grand public ribbon-cutting, commercial patient onboarding, and grand-opening marketing sweeps.",
        critical: true,
        dependencies: ["t12"],
      },
    ],
  },
];

const DEFAULT_OPERATION_ASSUMPTIONS = {
  beds: 100, // Keys
  alos: 3.5,
  opIpRatio: 0.45, // F&B Capture %
  borStart: 45,
  borMax: 82,
  borIncrement: 5,
  ipRevenue: 3.5, // ADR (M)
  opRevenue: 0.8, // Ancillary Rev (M)
  priceIncYears1_6: 4,
  ipMedSupply: 0.7, // Room COGS (M)
  opMedSupply: 0.3, // Ancillary COGS (M)
  docFeeIp: 15, // Service Charge %
  docFeeOp: 10, // Activity Fee %
  monthlyStaffCost: 1.2,
  staffInf: 5,
  adminExpRate: 8,
  rentStructureType: "flatEbitdar",
  rentFlatEbitdarRate: 25,
  rentRevRate: 8,
  rentProfitRate: 15,
  rentTier1Limit: 50,
  rentTier1Rate: 18,
  rentTier2Limit: 120,
  rentTier2Rate: 22,
  rentTier3Rate: 28,
  discountRate: 12,
  corporateTax: 20,
  partnerAEquity: 45,
  partnerBEquity: 45,
  sharingPercentA: 50,
};

const runOperationEngine = (assumptions, config) => {
  const projYears = config?.projYears || 10;
  const startYear = config?.startYear || 2027;
  const monthlyData = [];

  let currentBor = assumptions.borStart || 45;
  const keys = assumptions.beds || 100;
  const adr = assumptions.ipRevenue || 3.5;
  const ancilRev = assumptions.opRevenue || 0.8;

  for (let i = 1; i <= projYears; i++) {
    const esc = Math.pow(1 + (assumptions.priceIncYears1_6 || 4) / 100, i - 1);
    const occupiedRoomNights = keys * (currentBor / 100) * 365;

    const roomRevenue = (occupiedRoomNights * adr * esc) / 1000;
    const ancillaryRevenue = (occupiedRoomNights * ancilRev * esc) / 1000;
    const totalRevenue = roomRevenue + ancillaryRevenue;

    const roomCogs =
      (occupiedRoomNights * (assumptions.ipMedSupply || 0.7) * esc) / 1000;
    const ancilCogs =
      (occupiedRoomNights * (assumptions.opMedSupply || 0.3) * esc) / 1000;
    const totalCogs = roomCogs + ancilCogs;

    const staffCost =
      (assumptions.monthlyStaffCost || 1.2) *
      12 *
      Math.pow(1 + (assumptions.staffInf || 5) / 100, i - 1);
    const adminExp = totalRevenue * ((assumptions.adminExpRate || 8) / 100);

    const totalOpex = totalCogs + staffCost + adminExp;
    const ebitdar = totalRevenue - totalOpex;

    let rent = 0;
    if (assumptions.rentStructureType === "flatEbitdar") {
      rent = ebitdar * ((assumptions.rentFlatEbitdarRate || 25) / 100);
    } else if (assumptions.rentStructureType === "revAndProfit") {
      rent =
        totalRevenue * ((assumptions.rentRevRate || 8) / 100) +
        ebitdar * ((assumptions.rentProfitRate || 15) / 100);
    } else if (assumptions.rentStructureType === "tiered") {
      if (totalRevenue < assumptions.rentTier1Limit) {
        rent = totalRevenue * (assumptions.rentTier1Rate / 100);
      } else if (totalRevenue < assumptions.rentTier2Limit) {
        rent = totalRevenue * (assumptions.rentTier2Rate / 100);
      } else {
        rent = totalRevenue * (assumptions.rentTier3Rate / 100);
      }
    }

    const ebitda = ebitdar - rent;
    const tax = ebitda > 0 ? ebitda * (assumptions.corporateTax / 100) : 0;
    const netIncome = ebitda - tax;

    monthlyData.push({
      month: `Month ${i}`,
      year: startYear + i - 1,
      isOperating: true,
      revenue: totalRevenue,
      roomRevenue,
      ancillaryRevenue,
      totalCogs,
      staffCost,
      adminExp,
      totalOpex,
      ebitdar,
      rent,
      ebitda,
      netIncome,
      fcfe: netIncome, // simplified
    });

    currentBor = Math.min(
      assumptions.borMax || 82,
      currentBor + (assumptions.borIncrement || 5),
    );
  }

  return {
    monthlyData,
    metrics: {
      totalRevenue: monthlyData.reduce((acc, d) => acc + d.revenue, 0),
      totalEbitda: monthlyData.reduce((acc, d) => acc + d.ebitda, 0),
      avgOccupancy:
        monthlyData.length > 0
          ? monthlyData.reduce((acc, d) => acc + (d.revenue > 0 ? 1 : 0), 0) /
            monthlyData.length
          : 0,
      ebitdaMargin:
        monthlyData.reduce((acc, d) => acc + d.revenue, 0) > 0
          ? monthlyData.reduce((acc, d) => acc + d.ebitda, 0) /
            monthlyData.reduce((acc, d) => acc + d.revenue, 0)
          : 0,
    },
    totals: {
      revenue: monthlyData.reduce((acc, d) => acc + d.revenue, 0),
      totalCogs: monthlyData.reduce((acc, d) => acc + d.totalCogs, 0),
      staffCost: monthlyData.reduce((acc, d) => acc + d.staffCost, 0),
      adminExp: monthlyData.reduce((acc, d) => acc + d.adminExp, 0),
      ebitda: monthlyData.reduce((acc, d) => acc + d.ebitda, 0),
      rent: monthlyData.reduce((acc, d) => acc + d.rent, 0),
      netIncome: monthlyData.reduce((acc, d) => acc + d.netIncome, 0),
      fcfe: monthlyData.reduce((acc, d) => acc + d.fcfe, 0),
    },
    opsMetrics: {
      beds: keys,
    },
  };
};

// 3. UI ATOMIC COMPONENTS
// ==========================================

const ROW_TOOLTIPS: Record<string, any> = {
  "Bed Occupancy Rate (BOR)": {
    desc: "Percentage of available beds that are occupied over the period.",
    formula:
      "Inpatient Cases * (Avg Length of Stay) / (Operational Beds * 365)",
  },
  "Inpatient Cases": {
    desc: "Total number of admitted patients requiring a bed.",
    formula: "Operational Beds * 365 * BOR / Avg Length of Stay",
  },
  "Outpatient Visits": {
    desc: "Total number of non-admitted patient visits.",
    formula: "Inpatient Cases * Outpatient to Inpatient Ratio",
  },
  "Inpatient Revenue": {
    desc: "Revenue generated from inpatient services, including room, procedures, and care.",
    formula: "Inpatient Cases * Revenue per Inpatient Case",
  },
  "Outpatient Revenue": {
    desc: "Revenue generated from outpatient visits, diagnostics, and consultations.",
    formula: "Outpatient Visits * Revenue per Outpatient Visit",
  },
  "NET REVENUE": {
    desc: "Total top-line revenue after any applicable direct allowances or discounts.",
    formula: "Inpatient Revenue + Outpatient Revenue",
  },
  "Medical Supplies": {
    desc: "Cost of medicine, consumables, and direct healthcare supplies.",
    formula: "Net Revenue * Medical Supplies Margin (%)",
  },
  "Doctor Fees": {
    desc: "Compensation and profit-sharing paid directly to physicians.",
    formula: "Net Revenue * Doctor Fees Margin (%)",
  },
  "GROSS PROFIT": {
    desc: "Net revenue minus direct cost of goods sold (supplies and doctor fees).",
    formula: "Net Revenue - Medical Supplies - Doctor Fees",
  },
  "Staffing & Labor": {
    desc: "Salaries and benefits for nurses, administrators, and non-physician staff.",
    formula: "(Nurse headcount * Salary) + (Admin Headcount * Salary)",
  },
  "Other OpEx": {
    desc: "General overhead, utilities, marketing, and administrative expenses.",
    formula: "Net Revenue * Other OpEx Margin (%)",
  },
  EBITDAR: {
    desc: "Earnings Before Interest, Taxes, Depreciation, Amortization, and Rent.",
    formula: "Gross Profit - Staffing & Labor - Other OpEx",
  },
  "Building Rental": {
    desc: "Lease payments made to PropCo for using the hospital facility.",
    formula: "EBITDAR * Rental Revenue % (from PropCo)",
  },
  EBITDA: {
    desc: "Earnings Before Interest, Taxes, Depreciation, and Amortization.",
    formula: "EBITDAR - Building Rental",
  },
  "Corporate Tax": {
    desc: "Estimated tax liabilities on taxable income.",
    formula: "EBT * Corporate Tax Rate",
  },
  "NET INCOME": {
    desc: "Bottom-line profit after all expenses, interest, and taxes.",
    formula: "EBT - Corporate Tax",
  },
  "Cumulative Net Income": {
    desc: "Running sum of net income since operations began.",
    formula: "Previous Cum. Net Income + Net Income",
  },
  "Distributable Profit": {
    desc: "Cash flow available for distribution to shareholders after retained earnings.",
    formula: "Net Income - Retained Earnings",
  },
  "Retained Earnings": {
    desc: "Portion of net income held back to fund future growth or reserves.",
    formula: "Net Income * Retained Earnings %",
  },
  "Cumulative Retained Cash": {
    desc: "Running total of retained earnings held by the company.",
    formula: "Previous Cum. Retained Cash + Retained Earnings",
  },
  "OpCo Enterprise Value (EV)": {
    desc: "Estimated value of the operating company based on an EBITDA multiple at exit.",
    formula: "EBITDA * Exit Multiple",
  },
  "+ Retained Cash Sweep": {
    desc: "Cash balance added to the exit value derived from accumulated retained earnings.",
    formula: "Total Cumulative Retained Cash at Exit",
  },
  "Total Exit Equity Value": {
    desc: "Total proceeds available to equity holders upon exit.",
    formula: "OpCo Enterprise Value (EV) + Retained Cash Sweep",
  },
  "Land Cost": {
    desc: "Initial capital expenditure to acquire the land.",
    formula: "Land Area * Price per sqm",
  },
  "Total Hard Costs": {
    desc: "Direct construction, materials, and physical development costs.",
    formula: "Gross Floor Area (GFA) * Hard Cost per sqm",
  },
  "Total Soft Costs": {
    desc: "Indirect development costs including architecture, engineering, and legal fees.",
    formula: "Total Hard Costs * Soft Cost %",
  },
  "PROJECT DEVELOPMENT SPEND": {
    desc: "Total capital expenditure required to develop the project.",
    formula: "Land Cost + Hard Costs + Soft Costs",
  },
  "Debt Drawdown": {
    desc: "Capital drawn from the debt facility to cover project costs.",
    formula: "Project Development Spend * LTV %",
  },
  "Rental Revenue": {
    desc: "Income generated from leasing the property to the operating company.",
    formula: "OpCo EBITDAR * Rent %",
  },
  "Maintenance OpEx": {
    desc: "Recurrent costs to maintain the building and physical property.",
    formula: "Gross Floor Area (GFA) * Maintenance Cost per sqm",
  },
  "Property Taxes": {
    desc: "Government taxes levied on the real estate asset.",
    formula: "Asset Revenue * Property Tax %",
  },
  "EBITDA (NOI)": {
    desc: "Net Operating Income; property revenue minus operating expenses.",
    formula: "Rental Revenue - Maintenance OpEx - Property Taxes",
  },
  "Interest Expense": {
    desc: "Cost of borrowing on the outstanding debt balance.",
    formula: "Outstanding Debt * Interest Rate",
  },
  "Principal Repayment": {
    desc: "Scheduled paydown of the principal debt amount.",
    formula: "Total Debt Amount / Debt Tenure",
  },
  "Earnings Before Tax (EBT)": {
    desc: "Profit after debt service but before corporate income tax.",
    formula: "EBITDA - Interest Expense - Principal Repayment",
  },
  "Net Exit Proceeds": {
    desc: "Cash received from selling the property, net of debt payoff and closing costs.",
    formula: "Exit Value (NOI / Cap Rate) - Outstanding Debt",
  },
  "FCFE (Levered)": {
    desc: "Free Cash Flow to Equity; cash available to investors after debt service.",
    formula:
      "Net Income + Non-cash - Capex - Principal Repayment + Debt Drawdown",
  },
  "Cumulative FCFE": {
    desc: "Running total of all Free Cash Flow to Equity distributed over time.",
    formula: "Previous Cum. FCFE + FCFE",
  },
};

const AISparklesIcon = memo(({ size = 14, className = "" }) => {
  const badgeFontSize = Math.max(7, size * 0.35);
  const rightOffset = size > 24 ? "-right-3" : "-right-2";
  const topOffset = size > 24 ? "-top-2" : "-top-1";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Sparkles size={size} />
      <span
        className={`absolute ${topOffset} ${rightOffset} bg-gradient-to-br from-[#1C6048] to-[#1E2F31] text-white font-black px-1 rounded-sm shadow-sm leading-none border border-white/50`}
        style={{ fontSize: badgeFontSize }}
      >
        AI
      </span>
    </div>
  );
});

// Custom Brand SVGs based on exact user images
// Strictly Line-Art (Fill: none) + High Detail + Scalable Viewbox
const CustomBedIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Heartbeat Monitor */}
    <rect x="34" y="10" width="20" height="14" rx="2" />
    <polyline points="36,17 40,17 43,12 46,22 49,17 52,17" />
    {/* Bed Frame & Headboard */}
    <line x1="10" y1="16" x2="10" y2="52" />
    <line x1="10" y1="44" x2="56" y2="44" />
    <line x1="56" y1="44" x2="56" y2="52" />
    {/* Patient Head & Blanket */}
    <circle cx="20" cy="26" r="5" />
    <path d="M 10 34 L 26 34 C 30 26 34 26 38 34 L 56 34 L 56 44" />
  </svg>
));

const CustomScaleIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Base & Stand */}
    <line x1="16" y1="56" x2="48" y2="56" />
    <line x1="22" y1="50" x2="42" y2="50" />
    <line x1="32" y1="50" x2="32" y2="10" />
    <circle cx="32" cy="10" r="3" />
    {/* Angled Crossbar */}
    <line x1="10" y1="16" x2="54" y2="28" />
    {/* Left Strings & Pan */}
    <path d="M 10 16 L 4 36 L 16 36 Z" />
    <path d="M 4 36 C 4 46 16 46 16 36" />
    {/* Right Strings & Pan */}
    <path d="M 54 28 L 48 48 L 60 48 Z" />
    <path d="M 48 48 C 48 58 60 58 60 48" />
  </svg>
));

const CustomKnotIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Continuous overlapping path simulating a tangled thread/yarn with a loose end */}
    <path d="M 12 52 C 16 44 24 36 20 28 C 16 16 32 8 44 16 C 56 24 52 44 40 52 C 28 60 12 48 16 32 C 20 16 40 12 52 24 C 64 36 56 56 44 60 C 32 64 20 52 24 40 C 28 28 44 28 48 40 C 52 52 36 60 28 52" />
  </svg>
));

const CustomStethoscopeIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Earpieces (Y-Split) */}
    <path d="M 10 8 C 10 16 16 20 16 26" />
    <path d="M 22 8 C 22 16 16 20 16 26" />
    <line x1="7" y1="8" x2="13" y2="8" />
    <line x1="19" y1="8" x2="25" y2="8" />
    {/* Left Arm & U-Bend */}
    <line x1="16" y1="26" x2="16" y2="44" />
    <path d="M 16 44 C 16 60 48 60 48 44" />
    {/* Right Arm & Chestpiece */}
    <line x1="48" y1="44" x2="48" y2="26" />
    <circle cx="48" cy="18" r="8" />
    <circle cx="48" cy="18" r="3" />
    {/* Medical Cross Circle (Lowered and Centered) */}
    <circle cx="32" cy="38" r="6" />
    <line x1="32" y1="35" x2="32" y2="41" />
    <line x1="29" y1="38" x2="35" y2="38" />
  </svg>
));

const CustomPhysicianIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Simple Head */}
    <circle cx="32" cy="16" r="10" />
    {/* Simple Body Outline */}
    <path d="M 12 56 C 12 40 20 32 32 32 C 44 32 52 40 52 56" />

    {/* Asymmetric Stethoscope Drape */}
    {/* Left Side: Earpieces hanging down */}
    <path d="M 25 33.5 C 22 37 22 43 23 48" />
    <path d="M 19 53 L 23 48 L 27 53" />

    {/* Right Side: Chestpiece hanging down */}
    <path d="M 39 33.5 C 42 37 42 43 41 50" />
    <circle cx="41" cy="53" r="3" />
  </svg>
));

const CustomPopulationIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Row 1 (Top) - 3 people */}
    {[22, 32, 42].map((x) => (
      <g key={`r1-${x}`}>
        <path
          d={`M ${x - 5.5} 27 C ${x - 5.5} 19 ${x + 5.5} 19 ${x + 5.5} 27`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="14" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
    {/* Row 2 (Middle) - 4 people */}
    {[17, 27, 37, 47].map((x) => (
      <g key={`r2-${x}`}>
        <path
          d={`M ${x - 5.5} 43 C ${x - 5.5} 35 ${x + 5.5} 35 ${x + 5.5} 43`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="30" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
    {/* Row 3 (Bottom) - 5 people */}
    {[12, 22, 32, 42, 52].map((x) => (
      <g key={`r3-${x}`}>
        <path
          d={`M ${x - 5.5} 59 C ${x - 5.5} 51 ${x + 5.5} 51 ${x + 5.5} 59`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="46" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
  </svg>
));

const CustomDiagnosticsIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor Base */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    <rect
      x="18"
      y="56"
      width="28"
      height="4"
      fill="currentColor"
      stroke="none"
    />

    {/* Outer Scanner Body (Tall Pill Shape) */}
    <rect x="10" y="4" width="44" height="52" rx="20" strokeWidth="2.5" />

    {/* High-Tech Ticked Ring Array */}
    <circle
      cx="32"
      cy="26"
      r="16"
      strokeDasharray="1.5 2.5"
      strokeWidth="2"
      opacity="0.6"
    />
    <circle cx="32" cy="26" r="13" />

    {/* Targeting Crosshair */}
    <line x1="12" y1="26" x2="52" y2="26" strokeDasharray="2 3" opacity="0.4" />
    <line x1="32" y1="6" x2="32" y2="46" strokeDasharray="2 3" opacity="0.4" />
    <circle cx="32" cy="26" r="3" />

    {/* Bed Pedestal (Solid silhouette) */}
    <path
      d="M 27.5 40 L 36.5 40 L 40 60 L 24 60 Z"
      fill="currentColor"
      stroke="none"
      opacity="0.9"
    />

    {/* Sliding Patient Bed (Perspective) */}
    <path
      d="M 23 34 L 41 34 L 44 40 L 20 40 Z"
      fill="#F9F8F6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="miter"
    />

    {/* Bed Surface Lines */}
    <line x1="22" y1="36" x2="42" y2="36" strokeWidth="1.5" />
    <line x1="21" y1="38" x2="43" y2="38" strokeWidth="1.5" />

    {/* Base Vents / Indentations */}
    <line
      x1="14"
      y1="42"
      x2="14"
      y2="48"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="50"
      y1="42"
      x2="50"
      y2="48"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
));

const CustomLinacIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    {/* Base and Pillar */}
    <path d="M 40 60 V 8 C 40 4 44 2 48 2 C 52 2 56 4 56 8 V 60" />
    {/* Thick C-Arm Outline (drawn behind to merge nicely) */}
    <path
      d="M 48 16 C 48 4 34 4 22 4 H 12 V 30 H 26 V 16 C 32 16 36 20 36 28"
      fill="#E8EFEA"
    />
    {/* Rotating Joint */}
    <circle cx="48" cy="28" r="12" fill="#E8EFEA" />
    <circle cx="48" cy="28" r="4" fill="currentColor" />
    <circle cx="48" cy="28" r="8" strokeDasharray="2 4" opacity="0.5" />
    {/* Collimator / Head */}
    <path d="M 12 30 H 26 L 22 42 H 16 Z" fill="#E8EFEA" />
    <path d="M 16 42 L 17 46 H 21 L 22 42" fill="currentColor" />
    {/* Radiation Beams */}
    <path
      d="M 19 46 L 13 54 M 19 46 L 25 54 M 19 46 V 54"
      strokeDasharray="2 3"
      opacity="0.6"
      strokeWidth="1.5"
    />
    {/* Patient Bed */}
    <rect
      x="6"
      y="54"
      width="34"
      height="3"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
    <rect x="18" y="57" width="10" height="3" />
  </svg>
));

const CustomOverseasIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    {/* Bed Pillar */}
    <rect x="8" y="20" width="10" height="40" rx="2" />
    {/* Bed Arm & Surface */}
    <path d="M 18 42 H 28" strokeWidth="3" />
    <circle cx="28" cy="42" r="4" />
    <path d="M 28 46 V 50 H 42" strokeWidth="3" />
    <rect
      x="18"
      y="48"
      width="24"
      height="2"
      fill="currentColor"
      stroke="none"
    />
    {/* Robot Base */}
    <path d="M 42 60 V 46 C 42 38 52 38 52 46 V 60" />
    {/* Robot Arm Joints */}
    <circle cx="47" cy="40" r="5" />
    <path d="M 47 40 L 40 26" strokeWidth="4" />
    <circle cx="40" cy="26" r="4" />
    <path d="M 40 26 L 34 22" strokeWidth="4" />
    {/* Accelerator Head */}
    <polygon
      points="26,14 36,20 32,28 22,22"
      fill="#F9F8F6"
      stroke="currentColor"
      strokeLinejoin="miter"
    />
    <polygon points="22,22 32,28 30,32 20,26" fill="currentColor" />
    {/* Side Cabinet */}
    <rect x="54" y="34" width="8" height="26" rx="2" />
    <line x1="56" y1="42" x2="60" y2="42" strokeWidth="1.5" />
    <line x1="56" y1="46" x2="60" y2="46" strokeWidth="1.5" />
    <line x1="56" y1="50" x2="60" y2="50" strokeWidth="1.5" />
  </svg>
));

const CustomPalliativeIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />

    {/* IV Stand Base & Pole */}
    <line x1="48" y1="60" x2="56" y2="60" strokeWidth="3" />
    <circle cx="50" cy="58" r="2" fill="currentColor" stroke="none" />
    <circle cx="54" cy="58" r="2" fill="currentColor" stroke="none" />
    <line x1="52" y1="56" x2="52" y2="10" />
    <line x1="48" y1="10" x2="56" y2="10" />

    {/* IV Bag & Pump */}
    <rect x="50" y="14" width="4" height="6" rx="1" />
    <line x1="52" y1="10" x2="52" y2="14" strokeWidth="1" />
    <rect x="48" y="30" width="8" height="10" rx="1.5" fill="#F9F8F6" />
    <line x1="50" y1="33" x2="54" y2="33" strokeWidth="1" />
    <circle cx="50" cy="37" r="0.5" fill="currentColor" />
    <circle cx="52" cy="37" r="0.5" fill="currentColor" />
    <circle cx="54" cy="37" r="0.5" fill="currentColor" />

    {/* IV Tube */}
    <path d="M 52 20 C 48 26 48 30 52 30" strokeWidth="1.5" opacity="0.6" />
    <path d="M 48 36 C 42 44 38 38 34 36" strokeWidth="1.5" opacity="0.6" />

    {/* Recliner Base */}
    <line x1="22" y1="60" x2="34" y2="60" strokeWidth="3" />
    <circle cx="24" cy="58" r="2" fill="currentColor" stroke="none" />
    <circle cx="32" cy="58" r="2" fill="currentColor" stroke="none" />
    <rect x="24" y="46" width="8" height="10" rx="1" />
    <line x1="20" y1="46" x2="36" y2="46" strokeWidth="3" />

    {/* Recliner Seat & Leg Rest */}
    <path d="M 22 46 L 40 46 L 46 54" strokeWidth="6" strokeLinejoin="round" />
    {/* Recliner Backrest */}
    <path d="M 22 46 L 14 26" strokeWidth="6" strokeLinejoin="round" />

    {/* Armrest */}
    <path d="M 22 36 L 32 36 V 46" strokeWidth="2.5" />

    {/* Pillow / Headrest */}
    <circle cx="12" cy="24" r="3" fill="currentColor" />
  </svg>
));

const CustomClipboardIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Background shadow/depth */}
    <rect
      x="18"
      y="16"
      width="32"
      height="42"
      rx="3"
      fill="#EFEBE7"
      stroke="none"
    />

    {/* Main Board */}
    <rect x="14" y="12" width="32" height="42" rx="3" fill="#F9F8F6" />

    {/* Top Clip Mechanism */}
    <path d="M 22 12 V 8 C 22 6.5 23.5 5 25 5 H 35 C 36.5 5 38 6.5 38 8 V 12" />
    <rect
      x="24"
      y="9"
      width="12"
      height="6"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />

    {/* Medical Cross */}
    <path d="M 28 22 H 32 M 30 20 V 24" strokeWidth="2.5" />

    {/* Checklist lines and boxes */}
    <rect x="20" y="30" width="4" height="4" rx="1" />
    <line x1="28" y1="32" x2="40" y2="32" strokeWidth="2" opacity="0.6" />

    <rect x="20" y="38" width="4" height="4" rx="1" />
    <line x1="28" y1="40" x2="40" y2="40" strokeWidth="2" opacity="0.6" />

    {/* Giant checkmark */}
    <path d="M 18 48 L 22 52 L 34 38" strokeWidth="3.5" />
  </svg>
));

const MarkdownRenderer = memo(({ content, className = "" }) => {
  const createMarkup = (text) => {
    if (!text || typeof text !== "string") return { __html: "" };
    let html = text
      .replace(
        /^###\s+(.*$)/gim,
        '<h3 class="font-bold text-[14px] mt-4 mb-2">$1</h3>',
      )
      .replace(
        /^##\s+(.*$)/gim,
        '<h2 class="font-bold text-[15px] mt-5 mb-2">$1</h2>',
      )
      .replace(
        /^#\s+(.*$)/gim,
        '<h1 class="font-bold text-[16px] mt-6 mb-3">$1</h1>',
      )
      .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-5 list-disc mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\n/gim, "<br/>");
    return { __html: html };
  };
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  );
});

const NavButton = memo(({ active, onClick, icon, label, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
      disabled
        ? "opacity-20 cursor-not-allowed text-[#4C4A4B]"
        : active
          ? "bg-white text-[#1E2F31] shadow-md border border-[#D8D8D8]"
          : "text-[#4C4A4B] hover:text-[#1E2F31]"
    }`}
  >
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
));

const useTooltip = (tooltip) => {
  const [tooltipState, setTooltipState] = useState(false);
  const idRef = useRef(Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    if (tooltipState === "hover") {
      const handleScroll = () => setTooltipState(false);
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    } else if (tooltipState === "click") {
      const handleGlobalClick = () => setTooltipState(false);
      const handleCloseOther = (e) => {
        if (e.detail?.id !== idRef.current) setTooltipState(false);
      };
      const timeout = setTimeout(() => {
        window.addEventListener("click", handleGlobalClick, { passive: true });
        window.addEventListener("close-all-tooltips", handleGlobalClick, {
          passive: true,
        });
        window.addEventListener("close-other-tooltips", handleCloseOther, {
          passive: true,
        });
      }, 0);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", handleGlobalClick);
        window.removeEventListener("close-all-tooltips", handleGlobalClick);
        window.removeEventListener("close-other-tooltips", handleCloseOther);
      };
    }
  }, [tooltipState]);
  return { tooltipState, setTooltipState, tooltipId: idRef.current };
};

const KPITooltipIcon = memo(
  ({ tooltip, tooltipState, setTooltipState, tooltipId, align = "right" }) => {
    if (!tooltip) return null;
    const showTooltip = tooltipState !== false;

    const tooltipDesc = typeof tooltip === "string" ? tooltip : tooltip.desc;
    const tooltipFormula = typeof tooltip === "string" ? null : tooltip.formula;

    return (
      <div
        className={`relative ml-auto shrink-0 ${showTooltip ? "tooltip-open" : ""}`}
        onMouseEnter={() => {
          if (tooltipId) {
            window.dispatchEvent(
              new CustomEvent("close-other-tooltips", {
                detail: { id: tooltipId },
              }),
            );
          } else {
            window.dispatchEvent(new Event("close-all-tooltips"));
          }
          if (tooltipState !== "click") setTooltipState("hover");
        }}
        onMouseLeave={() => {
          if (tooltipState !== "click") setTooltipState(false);
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (tooltipState === "click") {
              setTooltipState(false);
            } else {
              window.dispatchEvent(new Event("close-all-tooltips"));
              setTooltipState("click");
            }
          }}
          className={`text-[#4C4A4B]/60 hover:text-[#1C6048] transition-colors focus:outline-none p-0.5 ${showTooltip ? "relative z-[80]" : ""}`}
          aria-label="More information"
        >
          <Info size={11} strokeWidth={2.5} />
        </button>

        {showTooltip && (
          <>
            <div
              className="fixed inset-0 z-[90] sm:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setTooltipState(false);
              }}
            />
            <div
              className={`absolute top-full mt-2 w-[240px] p-4 bg-[#1E2F31] text-white rounded-xl shadow-[0_8px_30px_rgba(30,47,49,0.9)] border border-[#1C6048]/40 z-[100] text-xs font-medium leading-relaxed normal-case tracking-normal animate-in fade-in slide-in-from-top-2 duration-200 ${
                align === "left" ? "left-0 sm:-left-2" : "right-0 sm:-right-2"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute -top-1.5 w-3 h-3 bg-[#1E2F31] rounded-sm transform rotate-45 border-t border-l border-[#1C6048]/40 ${
                  align === "left" ? "left-3" : "right-3"
                }`}
              ></div>
              <div className="relative z-10">
                <div className="font-bold text-white mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#99B6AA]">
                  <Info size={12} className="text-[#99B6AA]" /> Metric Insight
                </div>
                <div className="text-white/90 text-[11px] leading-relaxed mb-3 whitespace-pre-wrap">
                  {tooltipDesc}
                </div>
                {tooltipFormula && (
                  <div className="bg-black/20 p-2 rounded-lg border border-white/10 font-mono text-[9px] text-[#48B084]">
                    <span className="text-white/40 block text-[8px] uppercase font-sans font-bold tracking-widest mb-1 shadow-sm">
                      Formula
                    </span>
                    {tooltipFormula}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
);

const StatefulTooltipIcon = memo(({ tooltip, align = "right" }) => {
  const { tooltipState, setTooltipState, tooltipId } = useTooltip(tooltip);
  return (
    <KPITooltipIcon
      tooltip={tooltip}
      tooltipState={tooltipState}
      setTooltipState={setTooltipState}
      tooltipId={tooltipId}
      align={align}
    />
  );
});

const KPICard = memo(({ title, value, icon, color, subtitle, tooltip }) => {
  const { tooltipState, setTooltipState, tooltipId } = useTooltip(tooltip);

  const zClass =
    tooltipState === "click"
      ? "z-[110]"
      : tooltipState === "hover"
        ? "z-[100]"
        : "z-10 hover:z-[60]";

  const textColors = {
    blue: "text-[#1C6048]",
    emerald: "text-[#1E2F31]",
    indigo: "text-[#9B8B70]",
  };

  return (
    <div
      className={`p-4 lg:p-5 rounded-2xl border border-[#D8D8D8] bg-white flex flex-col shadow-sm transition-transform md:hover:-translate-y-1 relative group ${zClass} focus-within:z-[60]`}
    >
      <div
        className={`flex items-center justify-between mb-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${textColors[color] || "text-[#1E2F31]"}`}
      >
        <div className="flex items-center gap-1.5 opacity-80">
          {icon} {title}
        </div>
        <KPITooltipIcon
          tooltip={tooltip}
          tooltipState={tooltipState}
          setTooltipState={setTooltipState}
          tooltipId={tooltipId}
        />
      </div>
      <div
        className={`text-lg lg:text-xl font-black mb-1 ${textColors[color] || "text-[#1E2F31]"}`}
      >
        {value}
      </div>
      <div className="text-[8px] lg:text-[9px] font-bold uppercase text-[#4C4A4B] opacity-60 tracking-tighter">
        {subtitle}
      </div>
    </div>
  );
});

const MiniKPICard = memo(({ title, value, subtitle }) => (
  <div className="p-3 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8]">
    <p className="text-[9px] text-[#4C4A4B] font-bold uppercase mb-1">
      {title}
    </p>
    <p className="text-lg font-black text-[#1E2F31]">{value}</p>
    <p className="text-[8px] text-[#99B6AA] font-bold uppercase mt-1">
      {subtitle}
    </p>
  </div>
));

const DualKPICard = memo(
  ({
    title1,
    value1,
    color1,
    tooltip1,
    title2,
    value2,
    color2,
    tooltip2,
    icon,
  }) => {
    const {
      tooltipState: ts1,
      setTooltipState: setTs1,
      tooltipId: tid1,
    } = useTooltip(tooltip1);
    const {
      tooltipState: ts2,
      setTooltipState: setTs2,
      tooltipId: tid2,
    } = useTooltip(tooltip2);

    const zClass =
      ts1 === "click" || ts2 === "click"
        ? "z-[110]"
        : ts1 === "hover" || ts2 === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    const tColors = {
      blue: "text-[#1C6048]",
      emerald: "text-[#1E2F31]",
      indigo: "text-[#9B8B70]",
      teal: "text-[#1C6048]",
      amber: "text-[#9B8B70]",
      rose: "text-[#4C4A4B]",
    };
    return (
      <div
        className={`p-4 lg:p-5 rounded-2xl border border-[#D8D8D8] bg-white flex flex-col shadow-sm transition-transform hover:-translate-y-1 relative group ${zClass} focus-within:z-[60]`}
      >
        <div
          className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${tColors[color1] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            {icon} {title1}
          </div>
          <KPITooltipIcon
            tooltip={tooltip1}
            tooltipState={ts1}
            setTooltipState={setTs1}
            tooltipId={tid1}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black mb-1 ${tColors[color1] || "text-[#1E2F31]"}`}
        >
          {value1}
        </div>
        <div className="w-full h-px bg-[#D8D8D8] my-3"></div>
        <div
          className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${tColors[color2] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">{title2}</div>
          <KPITooltipIcon
            tooltip={tooltip2}
            tooltipState={ts2}
            setTooltipState={setTs2}
            tooltipId={tid2}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black ${tColors[color2] || "text-[#1E2F31]"}`}
        >
          {value2}
        </div>
      </div>
    );
  },
);

const SectionTitle = memo(({ title, icon, color }) => {
  const c = {
    blue: "text-[#1C6048]",
    emerald: "text-[#1C6048]",
    indigo: "text-[#9B8B70]",
    rose: "text-[#4C4A4B]",
    amber: "text-[#9B8B70]",
    teal: "text-[#4C4A4B]",
  };
  return (
    <div
      className={`flex items-center gap-2 pb-2 border-b-2 border-[#D8D8D8] ${c[color] || "text-[#1E2F31]"}`}
    >
      {icon}{" "}
      <h3 className="text-[10px] font-black uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );
});

const FormattedInput = memo(
  ({ val, set, className, placeholder, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <input
        type={isFocused ? "number" : "text"}
        value={
          isFocused
            ? val || ""
            : new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 4,
              }).format(val || 0)
        }
        onChange={(e) => set(e.target.value)}
        onFocus={(e) => {
          setIsFocused(true);
          setTimeout(() => e.target.select(), 0);
        }}
        onBlur={() => setIsFocused(false)}
        className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  },
);

const AssumptionRow = memo(({ label, val, set, unit, isLocked, tooltip }) => {
  const { tooltipState, setTooltipState, tooltipId } = useTooltip(tooltip);
  return (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors relative gap-2 min-h-[28px]">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <label
          className="text-[10px] text-[#4C4A4B] font-bold truncate"
          title={label}
        >
          {label}
        </label>
        <KPITooltipIcon
          tooltip={tooltip}
          tooltipState={tooltipState}
          setTooltipState={setTooltipState}
          tooltipId={tooltipId}
          align="left"
        />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <FormattedInput
          disabled={isLocked}
          val={val}
          set={set}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded focus:ring-2 focus:ring-[#1C6048] outline-none font-black text-[#1E2F31] bg-white"
        />
        <span
          className="text-[8px] text-[#4C4A4B] font-black uppercase w-14 whitespace-nowrap text-left block truncate"
          title={unit}
        >
          {unit}
        </span>
      </div>
    </div>
  );
});

const AssumptionDepreciationGroup = memo(
  ({ label, methodVal, lifeVal, setMethod, setLife, isLocked }) => (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded gap-2 min-h-[28px]">
      <label
        className="text-[10px] text-[#4C4A4B] font-bold truncate flex-1"
        title={label}
      >
        {label}
      </label>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-[#D8D8D8] rounded p-0.5">
          <button
            disabled={isLocked}
            onClick={() => setMethod("SL")}
            className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${methodVal === "SL" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
          >
            SL
          </button>
          <button
            disabled={isLocked}
            onClick={() => setMethod("DDB")}
            className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${methodVal === "DDB" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
          >
            DDB
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <FormattedInput
            disabled={isLocked}
            val={lifeVal}
            set={setLife}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-14 whitespace-nowrap text-left block truncate">
            Yrs
          </span>
        </div>
      </div>
    </div>
  ),
);

const ToggleRow = memo(({ label, desc, checked, onChange, isLocked }) => (
  <div
    className={`flex items-center justify-between p-3 bg-[#EFEBE7] border border-[#D8D8D8] rounded-xl ${isLocked ? "opacity-70" : ""}`}
  >
    <div>
      <p className="font-bold text-[#1E2F31] text-[11px]">{label}</p>
      <p className="text-[9px] text-[#4C4A4B] font-medium">{desc}</p>
    </div>
    <label
      className={`relative inline-flex items-center ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      <input
        disabled={isLocked}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9B8B70] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
    </label>
  </div>
));

const AssumptionRowCalculated = memo(
  ({ label, pctVal, setPct, calculatedVal, isLocked }) => (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded gap-2 min-h-[28px]">
      <label
        className="text-[10px] text-[#4C4A4B] font-bold truncate flex-1"
        title={label}
      >
        {label}
      </label>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-[#1C6048] font-bold w-12 text-right">
          {formatNumber(calculatedVal, 2)} B
        </span>
        <div className="flex items-center gap-1.5">
          <FormattedInput
            disabled={isLocked}
            val={pctVal}
            set={setPct}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-14 whitespace-nowrap text-left block truncate">
            %
          </span>
        </div>
      </div>
    </div>
  ),
);

const AssumptionRowQtyPrice = memo(
  ({ label, qtyVal, priceVal, setQty, setPrice, isLocked }) => (
    <div className="flex flex-col group py-1.5 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded gap-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
        <span className="text-[10px] text-[#1C6048] font-bold">
          {formatNumber(((qtyVal || 0) * (priceVal || 0)) / 1000, 2)} B
        </span>
      </div>
      <div className="flex justify-end items-center gap-1">
        <FormattedInput
          disabled={isLocked}
          val={qtyVal}
          set={setQty}
          className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          placeholder="Qty"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase mr-1">
          Qty
        </span>
        <span className="text-[8px] text-[#D8D8D8] font-black mx-1">×</span>
        <FormattedInput
          disabled={isLocked}
          val={priceVal}
          set={setPrice}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          placeholder="Price"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-8">
          M / ea
        </span>
      </div>
    </div>
  ),
);

const AssumptionRowQtyPriceWithToggle = memo(
  ({
    label,
    qtyVal,
    priceVal,
    setQty,
    setPrice,
    checked,
    onToggle,
    isLocked,
    calcVal,
    hideInputs = false,
  }) => (
    <div
      className={`flex flex-col group py-1.5 border-b border-[#D8D8D8] last:border-0 px-1 rounded gap-1 ${!checked ? "opacity-60 bg-[#EFEBE7]/50" : "hover:bg-[#EFEBE7]"}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label
            className={`relative inline-flex items-center ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              disabled={isLocked}
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <div className="w-7 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
          <label className="text-[10px] text-[#4C4A4B] font-bold">
            {label}
          </label>
        </div>
        <span className="text-[10px] text-[#1C6048] font-bold">
          {formatNumber(
            calcVal !== undefined
              ? calcVal
              : checked
                ? ((qtyVal || 0) * (priceVal || 0)) / 1000
                : 0,
            2,
          )}{" "}
          B
        </span>
      </div>
      {hideInputs ? (
        <div className="flex justify-end items-center px-1">
          <span className="text-[9px] text-[#8a8175] font-black uppercase leading-none italic bg-white/40 px-1.5 py-1 rounded border border-[#D8D8D8]/30">
            Weighted from Glamping Mix
          </span>
        </div>
      ) : (
        <div className="flex justify-end items-center gap-1">
          <FormattedInput
            disabled={isLocked || !checked}
            val={qtyVal}
            set={setQty}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white disabled:bg-[#D8D8D8]/30"
            placeholder="Qty"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase mr-1">
            Qty
          </span>
          <span className="text-[8px] text-[#D8D8D8] font-black mx-1">×</span>
          <FormattedInput
            disabled={isLocked || !checked}
            val={priceVal}
            set={setPrice}
            className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white disabled:bg-[#D8D8D8]/30"
            placeholder="Price"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-8">
            M / ea
          </span>
        </div>
      )}
    </div>
  ),
);

const SettingsHeader = memo(
  ({
    title,
    icon,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    onValidate,
    isCloudSync,
    children,
  }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[#D8D8D8] pb-4 w-full">
      <div className="flex items-center">
        <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
          {icon} {title}{" "}
          {isLocked && <Lock size={16} className="text-[#9B8B70] ml-2" />}
        </h2>
      </div>

      {/* Center Slot for Nav */}
      <div className="w-full md:flex-1 min-w-0 overflow-x-auto overflow-y-hidden minimal-scrollbar py-2">
        <div className="inline-flex min-w-full justify-center">{children}</div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-2 shrink-0">
        <button
          onClick={onToggleLock}
          className={`flex-1 md:flex-none justify-center text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${isLocked ? "bg-[#9B8B70] hover:bg-[#1E2F31] text-white" : "bg-white border border-[#D8D8D8] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}{" "}
          {isLocked ? "Unlock" : "Lock Inputs"}
        </button>
        <button
          onClick={onValidate}
          disabled={isLocked}
          className="flex-1 md:flex-none justify-center bg-[#1E2F31] hover:opacity-90 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Sparkles size={14} /> ✨ Validate
        </button>
        <div className="h-8 w-px bg-[#D8D8D8] hidden md:block"></div>

        {isCloudSync && (
          <button
            onClick={onSave}
            disabled={saveStatus !== "idle" || isLocked}
            className={`flex-1 md:flex-none justify-center text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 px-2 py-2 md:py-0 border md:border-0 rounded-lg md:rounded-none border-[#D8D8D8] ${saveStatus === "saved" ? "text-[#1C6048]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
          >
            {saveStatus === "saving" ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}{" "}
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved!"
                : "Set Defaults"}
          </button>
        )}
        <button
          onClick={onReset}
          disabled={isLocked}
          className="text-xs font-bold text-[#4C4A4B] hover:text-[#1E2F31] flex items-center justify-center gap-1 transition-colors disabled:opacity-50 px-2 py-2 md:py-0 border md:border-0 rounded-lg md:rounded-none border-[#D8D8D8]"
        >
          <RefreshCcw size={14} /> Reset
        </button>
      </div>
    </div>
  ),
);

const TableRow = memo(
  ({
    label,
    data,
    dk,
    total,
    highlight,
    indigo,
    emerald,
    crossover,
    isIndent,
    isDoubleIndent,
    tooltip,
    isCollapsible,
    isExpanded,
    onToggle,
  }) => {
    const tooltipBody = tooltip || ROW_TOOLTIPS[label];
    let baseColorClass = "bg-white font-medium text-[#4C4A4B]";
    if (highlight) {
      if (indigo) baseColorClass = "bg-[#EBEFEE] font-bold text-[#1E2F31]";
      else if (emerald)
        baseColorClass = "bg-[#E8EFEA] font-black text-[#1C6048]";
      else baseColorClass = "bg-[#EFEBE7] font-bold text-[#1E2F31]";
    }

    let indentClass = "text-[11px]";
    if (isDoubleIndent) {
      indentClass = "pl-12 text-[10px]";
    } else if (isIndent) {
      indentClass = "pl-8 text-[10px]";
    }

    let firstColClass = `px-4 py-2 sticky left-0 z-10 group-hover:z-[30] focus-within:z-[30] [&:has(.tooltip-open)]:z-[40] border-r border-b border-[#D8D8D8] whitespace-nowrap transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${baseColorClass} ${indentClass} ${isCollapsible ? "cursor-pointer select-none" : ""}`;
    let totalColClass = `px-3 py-2 text-right font-bold font-mono border-l border-b border-[#D8D8D8] sticky right-0 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] ${baseColorClass} ${!highlight ? "group-hover:bg-[#F9F8F6]" : ""}`;

    return (
      <tr className={`group ${highlight ? "" : "hover:bg-[#F9F8F6]"}`}>
        <td
          className={firstColClass}
          onClick={isCollapsible ? onToggle : undefined}
        >
          <div className="flex items-center justify-between gap-2 overflow-visible">
            <div className="relative flex items-center">
              {isCollapsible && (
                <span className="absolute -left-[14px] text-[#9B8B70] transition-transform duration-200">
                  {isExpanded ? (
                    <ChevronDown size={11} />
                  ) : (
                    <ChevronRight size={11} />
                  )}
                </span>
              )}
              <span>{label}</span>
            </div>
            {tooltipBody && (
              <StatefulTooltipIcon tooltip={tooltipBody} align="left" />
            )}
          </div>
        </td>
        {data.map((d, i) => {
          const val = d[dk] || 0;
          const isCrossover =
            crossover && val >= 0 && i > 0 && data[i - 1][dk] < 0;
          const cellBg = highlight
            ? indigo
              ? "bg-[#EBEFEE]"
              : emerald
                ? "bg-[#E8EFEA]"
                : "bg-[#EFEBE7]/50"
            : "bg-white group-hover:bg-[#F9F8F6]";
          return (
            <td
              key={i}
              className={`px-3 py-2 text-right border-r border-b border-[#D8D8D8] font-mono transition-colors ${cellBg} ${val < 0 ? "text-[#9B8B70]" : highlight ? "text-[#1E2F31] font-bold" : "text-[#4C4A4B]"} ${isCrossover ? "bg-[#9B8B70]/20 ring-1 ring-inset ring-[#9B8B70] text-[#1E2F31] font-bold" : ""}`}
            >
              {val === 0 && val >= 0 ? "-" : formatNumber(val, 1)}
            </td>
          );
        })}
        {total !== undefined ? (
          <td className={totalColClass}>{formatNumber(total, 1)}</td>
        ) : (
          <td className={totalColClass}></td>
        )}
      </tr>
    );
  },
);

const TableSection = memo(
  ({
    title,
    colSpan,
    type = "default",
    isCollapsible,
    isCollapsed,
    onToggle,
  }) => {
    const bgClass =
      type === "emerald"
        ? "bg-[#1C6048] text-white"
        : "bg-[#1E2F31] text-white";
    return (
      <tr
        onClick={isCollapsible ? onToggle : undefined}
        className={isCollapsible ? "cursor-pointer select-none" : ""}
      >
        <td
          colSpan={colSpan}
          className={`p-0 border-y-2 border-white ${bgClass} transition-colors`}
        >
          <div
            className={`px-4 py-2.5 font-black uppercase text-[10px] tracking-widest sticky left-0 flex items-center justify-between whitespace-nowrap ${bgClass}`}
          >
            <span>{title}</span>
            {isCollapsible && (
              <span className="text-[8px] font-bold text-white/85 bg-white/10 px-1.5 py-0.5 rounded mr-2 flex items-center gap-0.5">
                {isCollapsed ? "EXPAND" : "COLLAPSE"}
                {isCollapsed ? (
                  <ChevronRight size={10} />
                ) : (
                  <ChevronDown size={10} />
                )}
              </span>
            )}
          </div>
        </td>
      </tr>
    );
  },
);

const CapexRow = memo(
  ({
    label,
    amount,
    total,
    isHeader,
    isSubtotal,
    isIndent,
    isDoubleIndent,
    isCollapsible,
    isExpanded,
    onToggle,
  }) => (
    <tr
      className={`group ${isSubtotal ? "font-bold text-[#1E2F31]" : isDoubleIndent ? "text-[#8A8989]" : "text-[#4C4A4B]"} ${isHeader ? "font-bold text-[#1E2F31]" : ""} ${isCollapsible ? "cursor-pointer hover:bg-[#F9F8F6]/80" : ""}`}
      onClick={isCollapsible ? onToggle : undefined}
    >
      <td
        className={`px-4 py-2 border-r border-b border-[#D8D8D8] transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50" : "bg-white group-hover:bg-[#F9F8F6]"} ${isDoubleIndent ? "pl-12 text-[#8A8989]" : isIndent ? "pl-8" : ""}`}
      >
        <div className="relative flex items-center select-none">
          {isCollapsible && (
            <span className="absolute -left-[14px] text-[#9B8B70] transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown size={11} />
              ) : (
                <ChevronRight size={11} />
              )}
            </span>
          )}
          <span>{label}</span>
        </div>
      </td>
      <td
        className={`px-4 py-2 text-right border-r border-b border-[#D8D8D8] font-mono transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50" : "bg-white group-hover:bg-[#F9F8F6]"}`}
      >
        {formatNumber(amount, 1)}
      </td>
      <td
        className={`px-4 py-2 text-right font-mono border-b border-[#D8D8D8] transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50 text-[#1E2F31]" : isDoubleIndent ? "bg-white group-hover:bg-[#F9F8F6] text-[#8A8989]" : "bg-white group-hover:bg-[#F9F8F6] text-[#4C4A4B]"}`}
      >
        {formatNumber(total > 0 ? (amount / total) * 100 : 0, 1)}%
      </td>
    </tr>
  ),
);

const ExpandableCapexRow = memo(
  ({ icon, title, amount, totalCapex, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const pct = totalCapex > 0 ? (amount / totalCapex) * 100 : 0;

    return (
      <div className="border-b border-[#D8D8D8] last:border-0 pb-1 mb-1">
        <div
          className={`flex justify-between items-center py-2 px-2 -mx-2 rounded-lg transition-colors ${details && details.length > 0 ? "cursor-pointer hover:bg-[#EFEBE7]/50" : ""}`}
          onClick={() =>
            details && details.length > 0 && setIsExpanded(!isExpanded)
          }
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EFEBE7] rounded-lg">{icon}</div>
            <div>
              <p className="text-xs text-[#1E2F31] font-bold flex items-center gap-1.5">
                {title}
                {details && details.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`text-[#9B8B70] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-black text-[#1E2F31] text-sm">
              {formatNumber(amount, 1)} B
            </p>
            <p className="text-[9px] text-[#1C6048] font-bold uppercase">
              {formatNumber(pct, 1)}%
            </p>
          </div>
        </div>

        {isExpanded && details && details.length > 0 && (
          <div className="pl-12 pr-2 pb-2 pt-1 space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
            {details.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[10px] group"
              >
                <span className="text-[#4C4A4B] font-medium flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#D8D8D8] group-hover:bg-[#1C6048] transition-colors"></div>
                  {item.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[#1E2F31] font-bold">
                    {formatNumber(item.amount, 1)}
                  </span>
                  <span className="font-mono text-[#9B8B70] w-8 text-right">
                    {formatNumber(
                      totalCapex > 0 ? (item.amount / totalCapex) * 100 : 0,
                      1,
                    )}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

const PartnerReturnCard = ({ name, metrics, equity, share, color }) => {
  const c =
    color === "blue"
      ? {
          text: "text-[#1C6048]",
          bg: "bg-[#EFEBE7]",
          border: "border-[#D8D8D8]",
        }
      : {
          text: "text-[#9B8B70]",
          bg: "bg-[#EFEBE7]",
          border: "border-[#D8D8D8]",
        };
  return (
    <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] relative transition-all hover:shadow-md">
      <div
        className={`absolute top-0 right-0 p-3 lg:p-4 ${c.bg} rounded-bl-3xl border-l border-b ${c.border}`}
      >
        <p className="text-[10px] font-bold text-[#4C4A4B] uppercase leading-none mb-1 text-right tracking-widest">
          Share
        </p>
        <p className={`text-lg font-black ${c.text}`}>
          {(share || 0).toFixed(2)}%
        </p>
      </div>
      <div className="mb-6 pr-20 lg:pr-24">
        <h3
          className={`text-lg font-bold text-[#1E2F31] flex items-start gap-2 mb-1`}
        >
          <Users size={20} className={`shrink-0 mt-0.5 ${c.text}`} />
          <span className="leading-tight">{name}</span>
        </h3>
        <p className="text-xs text-[#4C4A4B] font-medium">
          Avg Dividend Yield:{" "}
          <b className={c.text}>{formatNumber(metrics?.avgYield, 1)}%</b>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 text-center">
        <div className="p-3 lg:p-4 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] hover:bg-white">
          <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-wider mb-1">
            Equity IRR
          </p>
          <p className={`text-xl lg:text-2xl font-black ${c.text}`}>
            {formatNumber((metrics?.irr || 0) * 100, 2)}%
          </p>
        </div>
        <div className="p-3 lg:p-4 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] hover:bg-white">
          <p className="text-[10px] text-[#9B8B70] font-bold uppercase tracking-wider mb-1">
            Payback
          </p>
          <p className="text-xl lg:text-2xl font-black text-[#9B8B70]">
            {formatNumber(metrics?.payback, 1)}{" "}
            <span className="text-xs font-bold text-[#4C4A4B] uppercase">
              Yrs
            </span>
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#4C4A4B] uppercase tracking-tighter flex items-center gap-1">
            <Coins size={12} /> Recovery
          </span>
          <span className="font-black text-[#1E2F31]">
            {equity > 0 && metrics?.totalCash >= equity
              ? "100%"
              : `${equity > 0 ? (((metrics?.totalCash || 0) / equity) * 100).toFixed(1) : "0"}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-[#D8D8D8] rounded-full overflow-hidden">
          <div
            className={`h-full ${color === "blue" ? "bg-[#1C6048]" : "bg-[#9B8B70]"} rounded-full`}
            style={{
              width: `${Math.min(100, equity > 0 ? ((metrics?.totalCash || 0) / equity) * 100 : 0)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[#4C4A4B]">
          <span>MOIC: {(metrics?.moic || 0).toFixed(2)}x</span>
          <span>{formatCurrency(metrics?.totalCash)}</span>
        </div>
      </div>
    </div>
  );
};

const SensitivityTable = memo(
  ({
    title,
    subtitle,
    xLabel,
    yLabel,
    xValues,
    yValues,
    matrix,
    formatFn,
    reverseColors,
  }) => {
    const all = matrix.flat().filter((v) => v !== 0 && !isNaN(v));
    const min = all.length > 0 ? Math.min(...all) : 0;
    const max = all.length > 0 ? Math.max(...all) : 0;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
        <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8]">
          <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
            <Grid size={16} className="text-[#1C6048]" /> {title}
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-r-2 border-[#D8D8D8] text-[10px] p-2 text-right align-bottom">
                    {xLabel} ➔<br />
                    {yLabel} ⬇
                  </th>
                  {xValues.map((x, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-xs font-bold text-[#1E2F31] bg-[#EFEBE7]/50 border-b border-[#D8D8D8]"
                    >
                      {String(x)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yValues.map((y, r) => (
                  <tr key={r}>
                    <th className="px-3 py-3 text-xs font-bold text-[#1E2F31] bg-[#EFEBE7]/50 border-r border-[#D8D8D8] whitespace-nowrap">
                      {String(y)}
                    </th>
                    {matrix[r].map((val, c) => {
                      let color = "";
                      if (val === 0 || isNaN(val)) {
                        color = "bg-[#9B8B70] text-white"; // Never / Bad is always brown
                      } else {
                        let ratio =
                          max === min ? 0.5 : (val - min) / (max - min);
                        if (reverseColors) ratio = 1 - ratio;
                        color =
                          ratio > 0.6
                            ? "bg-[#1C6048] text-white"
                            : ratio > 0.3
                              ? "bg-[#99B6AA]/50 text-[#1E2F31]"
                              : "bg-[#9B8B70] text-white";
                      }
                      return (
                        <td
                          key={c}
                          className={`px-3 py-3 border border-white text-xs font-mono font-bold transition-all hover:opacity-80 ${color}`}
                        >
                          {formatFn(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
);

const ProjectInfoFieldComp = memo(
  ({ label, value, onChange, isLocked, icon }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5 ml-1">
        {icon} {label}
      </label>
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLocked}
        className="w-full p-3 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-2 focus:ring-[#1C6048] outline-none disabled:opacity-70 transition-all shadow-inner"
      />
    </div>
  ),
);

const SelectionPopupComp = memo(({ state, setState, onAsk }) => {
  const popupRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
  });

  // Reset drag position when the popup spawns at a new text selection
  useEffect(() => {
    if (popupRef.current) {
      dragRef.current.translateX = 0;
      dragRef.current.translateY = 0;
      popupRef.current.style.transform = "translate(-50%, 0px)";
    }
  }, [state.x, state.y]);

  const handlePointerDown = (e) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX - dragRef.current.translateX;
    dragRef.current.startY = e.clientY - dragRef.current.translateY;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging || !popupRef.current) return;
    const x = e.clientX - dragRef.current.startX;
    const y = e.clientY - dragRef.current.startY;
    dragRef.current.translateX = x;
    dragRef.current.translateY = y;
    // Apply CSS transform directly to bypass React render cycle for 60fps smoothness
    popupRef.current.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
  };

  const handlePointerUp = (e) => {
    dragRef.current.isDragging = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  if (!state.show) return null;
  return (
    <div
      id="ai-selection-popup"
      ref={popupRef}
      className="absolute z-[100] flex flex-col items-center animate-in fade-in zoom-in duration-200"
      style={{
        left: state.x,
        top: state.y,
        transform: `translate(calc(-50% + ${dragRef.current.translateX}px), ${dragRef.current.translateY}px)`,
      }}
    >
      {!state.isOpen ? (
        <button
          onClick={() => setState((p) => ({ ...p, isOpen: true }))}
          className="bg-[#1E2F31] text-white p-2.5 rounded-full shadow-xl border border-[#D8D8D8] hover:scale-110 transition-all flex items-center justify-center"
        >
          <Sparkles size={20} className="text-white" />
        </button>
      ) : (
        <div className="bg-white w-72 md:w-80 p-4 lg:p-5 rounded-2xl shadow-2xl border border-[#1E2F31] flex flex-col gap-3 relative mt-2">
          <div
            className="w-full flex justify-center items-center cursor-grab active:cursor-grabbing pb-2 -mt-2 pt-1 opacity-50 hover:opacity-100 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <GripHorizontal
              size={16}
              className="text-[#4C4A4B] pointer-events-none"
            />
          </div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-black flex items-center gap-1.5 text-[#1E2F31]">
              <Sparkles size={16} className="text-[#1C6048]" /> Selection AI
            </h4>
            <button
              onClick={() =>
                setState((p) => ({ ...p, show: false, isOpen: false }))
              }
              className="text-[#4C4A4B] hover:text-[#1E2F31] bg-[#EFEBE7] rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
          <div className="bg-[#EFEBE7] p-3 rounded-lg text-[11px] text-[#4C4A4B] italic border border-[#D8D8D8] max-h-20 overflow-hidden relative font-medium">
            "{String(state.text)}"
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#EFEBE7] to-transparent pointer-events-none"></div>
          </div>
          <textarea
            value={state.query}
            onChange={(e) => setState((p) => ({ ...p, query: e.target.value }))}
            placeholder="What do you want to know about this?"
            className="w-full text-xs p-3 border border-[#D8D8D8] rounded-xl focus:ring-2 focus:ring-[#1C6048] outline-none resize-none h-20 shadow-inner text-[#1E2F31]"
            autoFocus
          />
          {state.response && (
            <div className="bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8] max-h-48 overflow-y-auto overscroll-contain shadow-inner">
              <MarkdownRenderer
                content={state.response}
                className="text-[12px] text-[#4C4A4B] leading-relaxed"
              />
            </div>
          )}
          <button
            onClick={onAsk}
            disabled={state.isLoading || !state.query.trim()}
            className="w-full bg-[#1C6048] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2"
          >
            {state.isLoading ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <BrainCircuit size={14} />
            )}
            {state.isLoading ? "Thinking..." : "Ask Gemini"}
          </button>
        </div>
      )}
    </div>
  );
});

const MarketValidationDisplay = memo(({ content, loading, onClose, color }) => (
  <div
    className={`mb-8 bg-white p-5 lg:p-6 rounded-2xl border border-[#D8D8D8] border-l-4 relative shadow-sm animate-in slide-in-from-top-4 ${color === "blue" ? "border-l-[#1C6048]" : "border-l-[#9B8B70]"}`}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-[#4C4A4B] hover:text-[#1E2F31] bg-[#EFEBE7] rounded-full p-1"
    >
      <X size={16} />
    </button>
    <h3 className="font-black text-[#1E2F31] mb-3 flex items-center gap-2 text-sm">
      <Scale size={18} /> AI Market Check
    </h3>
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-2 bg-[#D8D8D8] rounded w-full"></div>
        <div className="h-2 bg-[#D8D8D8] rounded w-5/6"></div>
      </div>
    ) : (
      <MarkdownRenderer
        content={content}
        className="text-[13px] text-[#4C4A4B] font-medium"
      />
    )}
  </div>
));

// ==========================================
// 4. STRATEGIC FOUNDATION (BENTO UI)
// ==========================================

const BentoBox = memo(
  ({ children, className = "", colSpan = "col-span-12" }) => (
    <div
      className={`bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col transition-all hover:shadow-md ${colSpan} ${className}`}
    >
      {children}
    </div>
  ),
);

const BentoIcon = memo(({ icon, color = "blue", className = "" }) => {
  const bgColors = {
    blue: "bg-[#1C6048]/10 text-[#1C6048]",
    emerald: "bg-[#1E2F31]/10 text-[#1E2F31]",
    indigo: "bg-[#9B8B70]/10 text-[#9B8B70]",
    rose: "bg-[#4C4A4B]/10 text-[#4C4A4B]",
    amber: "bg-[#99B6AA]/20 text-[#1E2F31]",
    transparent: "bg-transparent",
  };
  return (
    <div
      className={`flex items-center justify-center mb-5 shrink-0 ${color !== "transparent" ? "w-14 h-14 rounded-[20px]" : ""} ${bgColors[color]} ${className}`}
    >
      {icon}
    </div>
  );
});

const LAND_ZONING = [
  {
    proportion: "Glamping",
    clusterArea: 39138,
    sharingArea: 1904,
    area: 41042,
    ratio: 9.8,
    color: "#14B8A6",
  },
  {
    proportion: "Commercial Compound",
    clusterArea: 63754,
    sharingArea: 3102,
    area: 66856,
    ratio: 15.9,
    color: "#9B8B70",
  },
  {
    proportion: "Hills Villa",
    clusterArea: 63878,
    sharingArea: 3108,
    area: 66986,
    ratio: 16.0,
    color: "#99B6AA",
  },
  {
    proportion: "Hospitality 1",
    clusterArea: 99312,
    sharingArea: 4831,
    area: 104143,
    ratio: 24.8,
    color: "#DCD8D3",
  },
  {
    proportion: "Hospitality 2",
    clusterArea: 39230,
    sharingArea: 1909,
    area: 41139,
    ratio: 9.8,
    color: "#1C6048",
  },
  {
    proportion: "Adventure & Stable",
    clusterArea: 94736,
    sharingArea: 4609,
    area: 99345,
    ratio: 23.7,
    color: "#4C4A4B",
  },
];

const getZoningItem = (idx: any) => {
  if (idx === null || idx === undefined) return null;
  if (idx === 6) {
    return {
      proportion: "Sharing Development Area",
      clusterArea: 0,
      sharingArea: 19463,
      area: 19463,
      ratio: 4.7,
      color: "#A95C3E",
      isSharingInfra: true,
    };
  }
  return LAND_ZONING[idx] || null;
};

const ProjectOverviewView = memo(({ info, setInfo, isLocked }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [planView, setPlanView] = useState("master");

  const zoningPolygons = [
    { idx: 1, points: "36,58 52,61 47,79 28,71" }, // Commercial Hillside
    { idx: 2, points: "26,24 47,37 36,58 19,43" }, // Hillside Villa
    { idx: 3, points: "47,37 63,28 69,43 53,49" }, // Hospitality A
    { idx: 4, points: "58,58 73,55 81,80 56,88 47,79" }, // Hospitality B
    { idx: 0, points: "53,49 69,43 73,55 58,58" }, // Glamping
    { idx: 5, points: "21,15 62,28 47,37 26,24" }, // Adventure
    { idx: 6, points: "47,79 56,88 45,92 28,71" }, // City Dev
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-500 pb-12">
      {/* Main General Info Bento */}
      <BentoBox colSpan="md:col-span-12">
        <div className="flex items-center gap-4 mb-6">
          <BentoIcon
            icon={<Building size={28} />}
            color="blue"
            className="mb-0"
          />
          <div>
            <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
              Project Overview
            </h2>
            <p className="text-xs text-[#4C4A4B] font-medium mt-1">
              Integrated Resort & Hospitality Development
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          <ProjectInfoFieldComp
            label="Project Name"
            value={info.name}
            onChange={(v) => setInfo({ ...info, name: v })}
            isLocked={isLocked}
            icon={<FileText size={14} />}
          />
          <ProjectInfoFieldComp
            label="Location"
            value={info.location}
            onChange={(v) => setInfo({ ...info, location: v })}
            isLocked={isLocked}
            icon={<MapPin size={14} />}
          />
          <ProjectInfoFieldComp
            label="Resort Class"
            value={info.type}
            onChange={(v) => setInfo({ ...info, type: v })}
            isLocked={isLocked}
            icon={<Palmtree size={14} />}
          />
          <ProjectInfoFieldComp
            label="Development Status"
            value={info.status}
            onChange={(v) => setInfo({ ...info, status: v })}
            isLocked={isLocked}
            icon={<Clock size={14} />}
          />
        </div>
      </BentoBox>

      {/* Master Plan Visuals Bento (Left side, large map) */}
      <BentoBox
        colSpan="md:col-span-12 lg:col-span-8"
        className="p-0 overflow-hidden border-[#D8D8D8] min-h-[450px] lg:min-h-[100%] relative rounded-[28px] shadow-sm group select-none"
      >
        {/* Toggle Controls for Map view modes */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-[#D8D8D8] p-1 rounded-2xl flex gap-1 shadow-md">
          <button
            onClick={() => setPlanView("master")}
            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              planView === "master"
                ? "bg-[#1E2F31] text-white shadow-sm"
                : "text-[#4C4A4B] hover:bg-[#F9F8F6]"
            }`}
          >
            Realistic Concept
          </button>
          <button
            onClick={() => setPlanView("zoning")}
            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              planView === "zoning"
                ? "bg-[#1E2F31] text-white shadow-sm"
                : "text-[#4C4A4B] hover:bg-[#F9F8F6]"
            }`}
          >
            Land Zoning Map
          </button>
        </div>

        {/* Dynamic Image Overlay */}
        <img
          src={planView === "zoning" ? "/Zoning.jpg" : "/Site.jpg"}
          alt="Site Plan"
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          onError={(e) => {
            // fallback gracefully to base plan if custom file isn't found
            if (e.target.src !== window.location.origin + "/Site.jpg") {
              e.target.src = "/Site.jpg";
            }
          }}
          referrerPolicy="no-referrer"
        />

        {/* Interactive SVG Polygons Layer */}
        <svg
          className="absolute inset-0 w-full h-full z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {zoningPolygons.map((polygon) => {
            const item = getZoningItem(polygon.idx);
            if (!item) return null;
            const isHovered = hoveredIdx === polygon.idx;
            // set opacity: when in zoning view, show soft colors. When in master/realistic view, show only on hover
            const fillOpacity = isHovered
              ? 0.55
              : planView === "zoning"
                ? 0.28
                : 0;

            const strokeColor = isHovered
              ? "#1E2F31"
              : planView === "zoning"
                ? item.color
                : "none";

            return (
              <polygon
                key={polygon.idx}
                points={polygon.points}
                fill={item.color}
                fillOpacity={fillOpacity}
                stroke={strokeColor}
                strokeWidth={isHovered ? 1.5 : planView === "zoning" ? 0.3 : 0}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isHovered
                    ? "drop-shadow(0 4px 8px rgba(30, 47, 49, 0.25))"
                    : "none",
                }}
                onMouseEnter={() => setHoveredIdx(polygon.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Active Hover Floating HUD Card */}
        {hoveredIdx !== null && getZoningItem(hoveredIdx) && (
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-[#D8D8D8] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-widest">
              Selected Zone
            </span>
            <span className="text-xs font-black text-[#1E2F31] mt-0.5">
              {getZoningItem(hoveredIdx)?.proportion}
            </span>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-[#EFEBE7]">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-[#4C4A4B] uppercase tracking-wider">
                  Area
                </span>
                <span className="text-xs font-black text-[#1E2F31] font-mono">
                  {new Intl.NumberFormat("en-US").format(
                    getZoningItem(hoveredIdx)?.area || 0,
                  )}{" "}
                  Sqm
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-[#4C4A4B] uppercase tracking-wider">
                  Ratio
                </span>
                <span className="text-xs font-black text-[#1C6048]">
                  {getZoningItem(hoveredIdx)?.ratio}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2F31]/60 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-[#D8D8D8] flex items-center gap-3 z-20">
          <Map size={20} className="text-[#1C6048]" />
          <div>
            <span className="block text-xs font-black text-[#1E2F31] uppercase tracking-widest">
              Master Site Plan
            </span>
            <span className="block text-[9px] font-bold text-[#4C4A4B]">
              Raya Daan Mogot (ROW ±30m)
            </span>
          </div>
        </div>
      </BentoBox>

      {/* Site Specs Bento (Right side, stacked render + cards) */}
      <BentoBox
        colSpan="md:col-span-12 lg:col-span-4"
        className="!bg-[#EFEBE7] border-transparent p-0 overflow-hidden flex flex-col"
      >
        {/* ⚠️ SWAP THIS URL WITH YOUR 3D RENDER IMAGE */}
        <div className="w-full h-48 lg:h-56 relative shrink-0 bg-gray-200">
          <img
            src="/Render.jpg"
            alt="3D Render"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black uppercase text-[#1E2F31] shadow-sm tracking-widest">
            Proposed Concept
          </div>
        </div>

        <div className="p-6 lg:p-8 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Map size={24} className="text-[#9B8B70]" />
            <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
              Site Specifications
            </h2>
          </div>

          <div className="space-y-3 flex-1">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-4 bg-white rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col justify-center text-center hover:-translate-y-1 transition-transform">
                <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                  Total Land
                </span>
                <span className="text-lg font-black text-[#1E2F31] leading-none">
                  {String(info.totalLand)}
                </span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col justify-center text-center hover:-translate-y-1 transition-transform">
                <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                  Building GFA
                </span>
                <span className="text-lg font-black text-[#1E2F31] leading-none">
                  {String(info.totalBuilding)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#D8D8D8] shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  Zoning
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.zoning}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  Land Title
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.landTitle}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  BCR / KDB
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.bcr}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  FAR / KLB
                </span>
                <span className="text-xs font-black text-[#1E2F31]">
                  {info.far}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                  Green Area
                </span>
                <span className="text-xs font-black text-[#1C6048]">
                  {info.greenArea}
                </span>
              </div>
            </div>
          </div>
        </div>
      </BentoBox>

      {/* Land Zoning Breakdown */}
      <BentoBox colSpan="md:col-span-12" className="mt-2">
        <div className="flex flex-col md:flex-row gap-8 items-center col-span-12">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <PieChartIcon size={24} className="text-[#1C6048]" />
                <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                  Land Zoning & Infrastructure Distribution
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-[#1C6048]/10 text-[#1C6048] rounded-xl self-start">
                Pro-Rata Allocation Active
              </span>
            </div>

            <div className="overflow-x-auto border border-[#EFEBE7] rounded-xl shadow-sm">
              <table className="w-full text-left text-xs bg-white text-[#4C4A4B] min-w-[650px]">
                <thead className="bg-[#1E2F31] text-white font-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8]">
                      Zoning Cluster Component
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right">
                      Gross Cluster Area (Sqm)
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right text-[#99B6AA]">
                      Sharing Infra Pro-Rata (Sqm)
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right">
                      Gross Land Area (Sqm)
                    </th>
                    <th className="px-4 py-3.5 border-b border-[#D8D8D8] text-right">
                      Gross Ratio (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE7] font-medium">
                  {LAND_ZONING.map((item, idx) => {
                    const isHovered = hoveredIdx === idx;
                    const isSharing = item.isSharingInfra;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors duration-150 cursor-pointer ${
                          isHovered
                            ? "bg-[#1C6048]/10 text-[#1C6048] font-bold"
                            : isSharing
                              ? "bg-[#A95C3E]/5 italic text-[#A95C3E]"
                              : "hover:bg-[#F9F8F6]"
                        }`}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        <td className="px-4 py-3.5 flex items-center gap-2 font-semibold text-[#1E2F31]">
                          <span
                            className="w-3 h-3 rounded-full inline-block shrink-0 border border-[#D8D8D8] transition-transform duration-150"
                            style={{
                              backgroundColor: item.color,
                              transform: isHovered ? "scale(1.25)" : "scale(1)",
                            }}
                          ></span>
                          <span>{item.proportion}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#4C4A4B]">
                          {isSharing
                            ? "-"
                            : new Intl.NumberFormat("en-US").format(
                                item.clusterArea,
                              )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#9B8B70] font-semibold">
                          {isSharing
                            ? new Intl.NumberFormat("en-US").format(
                                item.sharingArea,
                              )
                            : `+${new Intl.NumberFormat("en-US").format(item.sharingArea)}`}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-[#1E2F31] font-bold">
                          {new Intl.NumberFormat("en-US").format(item.area)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#1C6048] font-mono">
                          {item.ratio}%
                        </td>
                      </tr>
                    );
                  })}

                  {/* Calculated Math Proof Totals */}
                  <tr className="bg-[#F9F8F6] font-bold text-[#1E2F31] border-t border-[#D8D8D8]">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#4C4A4B] rounded-sm"></span>
                      Total Gross Cluster Area
                    </td>
                    <td className="px-4 py-3 text-right font-mono">400,048</td>
                    <td className="px-4 py-3 text-right font-mono text-[#9B8B70]">
                      -
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#1E2F31]">
                      400,048
                    </td>
                    <td className="px-4 py-3 text-right text-[#1C6048] font-mono">
                      95.3%
                    </td>
                  </tr>
                  <tr className="bg-[#A95C3E]/5 font-bold text-[#A95C3E]">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#A95C3E] rounded-sm animate-pulse"></span>
                      Sharing Infrastructure Area
                    </td>
                    <td className="px-4 py-3 text-right font-mono">-</td>
                    <td className="px-4 py-3 text-right font-mono">19,463</td>
                    <td className="px-4 py-3 text-right font-mono">19,463</td>
                    <td className="px-4 py-3 text-right text-[#A95C3E] font-mono">
                      4.7%
                    </td>
                  </tr>
                  <tr className="bg-[#1E2F31] font-black text-white border-t-2 border-[#1E2F31]">
                    <td className="px-4 py-3.5 text-xs uppercase tracking-wider">
                      Gross Land Area (Total)
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      400,048
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[#99B6AA]">
                      +19,463
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-sm tracking-tight text-[#99B6AA]">
                      419,511
                    </td>
                    <td className="px-4 py-3.5 text-right text-[#99B6AA] font-mono">
                      100.0%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col items-center shrink-0 space-y-4">
            <div className="w-full h-60 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LAND_ZONING}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="area"
                    stroke="none"
                    onMouseEnter={(_, index) => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {LAND_ZONING.map((entry, index) => {
                      const isHovered = hoveredIdx === index;
                      const opacity =
                        hoveredIdx !== null && !isHovered ? 0.4 : 1;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={opacity}
                          stroke={isHovered ? "#1E2F31" : "none"}
                          strokeWidth={isHovered ? 2 : 0}
                          style={{
                            transition:
                              "opacity 0.2s ease, stroke-width 0.2s ease",
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
                <span className="text-[9px] uppercase font-bold text-[#4C4A4B] tracking-widest leading-tight mb-1 max-w-[130px] truncate-2-lines">
                  {hoveredIdx !== null
                    ? getZoningItem(hoveredIdx)?.proportion
                    : "Total Land"}
                </span>
                <span className="text-lg font-black text-[#1E2F31] leading-none">
                  {hoveredIdx !== null
                    ? `${getZoningItem(hoveredIdx)?.ratio}%`
                    : "419,511"}
                </span>
                {hoveredIdx === null && (
                  <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mt-0.5">
                    Sqm
                  </span>
                )}
              </div>
            </div>

            {/* Bottom HUD Box detailing the current selected chunk without any tooltips overlapping the canvas! */}
            <div className="w-full bg-[#F9F8F6] border border-[#EFEBE7] rounded-2xl p-4 transition-all duration-300">
              {hoveredIdx !== null ? (
                (() => {
                  const hoveredItem = getZoningItem(hoveredIdx);
                  if (!hoveredItem) return null;
                  return (
                    <div className="flex flex-col text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-black tracking-wider text-[#1E2F31] flex items-center gap-1.5 truncate max-w-[190px]">
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: hoveredItem.color }}
                          />
                          {hoveredItem.proportion}
                        </span>
                        <span className="font-mono font-black text-[#1C6048] bg-[#1C6048]/10 px-2 py-0.5 rounded-lg text-[10px]">
                          {hoveredItem.ratio}%
                        </span>
                      </div>
                      <div className="h-px bg-[#EFEBE7] my-1" />
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-[#9B8B70] uppercase">
                            Cluster
                          </span>
                          <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                            {hoveredItem.clusterArea > 0
                              ? new Intl.NumberFormat("en-US").format(
                                  hoveredItem.clusterArea,
                                )
                              : "-"}
                          </span>
                        </div>
                        <div className="flex flex-col border-x border-[#EFEBE7]">
                          <span className="text-[8px] font-bold text-[#9B8B70] uppercase">
                            Infra Share
                          </span>
                          <span className="font-mono font-bold text-[#9B8B70] mt-0.5">
                            +
                            {new Intl.NumberFormat("en-US").format(
                              hoveredItem.sharingArea,
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-[#9B8B70] uppercase">
                            Gross Area
                          </span>
                          <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                            {new Intl.NumberFormat("en-US").format(
                              hoveredItem.area,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1E2F31] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#1E2F31]" />
                      Gross Land Area
                    </span>
                    <span className="font-mono font-black text-[#1E2F31] bg-[#1E2F31]/10 px-2 py-0.5 rounded-lg text-[10px]">
                      100.0%
                    </span>
                  </div>
                  <div className="h-px bg-[#EFEBE7] my-1" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#4C4A4B] uppercase">
                        Total Cluster
                      </span>
                      <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                        400,048
                      </span>
                    </div>
                    <div className="flex flex-col border-x border-[#EFEBE7]">
                      <span className="text-[8px] font-bold text-[#4C4A4B] uppercase">
                        Total Infra
                      </span>
                      <span className="font-mono font-bold text-[#A95C3E] mt-0.5">
                        19,463
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-[#4C4A4B] uppercase">
                        Total Land
                      </span>
                      <span className="font-mono font-bold text-[#1E2F31] mt-0.5">
                        419,511
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </BentoBox>
    </div>
  );
});

const CollaborationStrategyView = memo(({ isPresenting }) => (
  <div className="space-y-6 animate-in fade-in duration-500 pb-12">
    <div className="bg-white rounded-[28px] p-8 shadow-sm border border-[#D8D8D8] text-center max-w-lg mx-auto mt-12 py-16">
      <Network className="text-[#1C6048] mx-auto mb-4" size={40} />
      <h2 className="text-xl font-bold text-[#1E2F31] mb-2">
        Collaboration Strategy
      </h2>
      <p className="text-xs text-[#4C4A4B] font-medium leading-relaxed">
        This section is currently under review and has been cleared.
      </p>
    </div>
  </div>
));

// === INTERACTIVE MAP CONSTANTS ===
const targetRegions = [];
const activeRegions = [];

const mapLocations = [
  // --- PROPOSED PROJECT ---
  {
    id: "vasanta",
    name: "Vasanta Eco-City Site",
    group: "Vasanta",
    desc: "Mixed-Use Development",
    lat: -9.475,
    lon: 120.189,
    color: "#1E3A8A",
    polygonCoords: [
      [-9.469879235, 120.185776123],
      [-9.471142029, 120.185421959],
      [-9.472096358, 120.186380387],
      [-9.473159118, 120.186508497],
      [-9.473950349, 120.186822544],
      [-9.474728088, 120.187132697],
      [-9.475358011, 120.18738518],
      [-9.475939528, 120.18761731],
      [-9.476559612, 120.187870875],
      [-9.477212898, 120.188129903],
      [-9.477853064, 120.188375298],
      [-9.478500022, 120.188634016],
      [-9.479197996, 120.189159036],
      [-9.479907771, 120.189679958],
      [-9.479096962, 120.192499978],
      [-9.478283208, 120.192396671],
      [-9.477463655, 120.192279852],
      [-9.476626803, 120.192045057],
      [-9.475869224, 120.191815352],
      [-9.475110238, 120.191579106],
      [-9.474363124, 120.191268511],
      [-9.473586262, 120.190876078],
      [-9.472879508, 120.190359684],
      [-9.472274718, 120.189737543],
      [-9.471549334, 120.188926019],
      [-9.470645474, 120.187568608],
    ],
  },

  // --- GENERAL NODES ---
  {
    id: "Soekarno-Hatta Airport",
    name: "Soekarno-Hatta Airport (CGK)",
    group: "Infrastructure",
    desc: "Primary National Transit Hub",
    query: "Bandar Udara Internasional Soekarno-Hatta",
    color: "#9b8b70", // Slate gray
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -6.1256,
    fallbackLon: 106.6558,
    fallbackRadius: 0.035,
  },
  {
    id: "Umbu Mehang Kunda Airport",
    name: "Umbu Mehang Kunda Airport (WGP)",
    group: "Infrastructure",
    desc: "Key Entry Point & Regional Hub",
    query: "Umbu Mehang Kunda Airport",
    color: "#9b8b70", // Slate gray
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -9.671389,
    fallbackLon: 120.306111,
    fallbackRadius: 0.015,
  },
  {
    id: "Tambolaka Airport",
    name: "Tambolaka Airport (TMC)",
    group: "Infrastructure",
    desc: "Sumba Barat Daya Gateway",
    query: "Tambolaka Airport",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -9.4097,
    fallbackLon: 119.2443,
    fallbackRadius: 0.015,
  },
  {
    id: "El Tari Airport",
    name: "El Tari Airport (KOE)",
    group: "Infrastructure",
    desc: "NTT Provincial Transit Hub",
    query: "El Tari Airport",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -10.1717,
    fallbackLon: 123.674,
    fallbackRadius: 0.015,
  },
  {
    id: "Komodo Airport",
    name: "Komodo Airport (LBJ)",
    group: "Infrastructure",
    desc: "Labuan Bajo Tourist Gateway",
    query: "Komodo Airport",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -8.4869,
    fallbackLon: 119.8883,
    fallbackRadius: 0.015,
  },
  {
    id: "Ngurah Rai Airport",
    name: "Ngurah Rai Airport (DPS)",
    group: "Infrastructure",
    desc: "Bali Gateway & Key Sub-Hub",
    query: "Bandara Internasional Ngurah Rai",
    color: "#9b8b70",
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    fallbackLat: -8.7481,
    fallbackLon: 115.1672,
    fallbackRadius: 0.015,
  },
];

const regionGroups = {};

const getGroupColor = (group) => "#9B8B70";

const generateFallbackGeoJSON = (centerLat, centerLon, radiusDegrees) => {
  const points = 32;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = ((i * 360) / points) * (Math.PI / 180);
    const lat = centerLat + radiusDegrees * Math.cos(angle);
    const lon =
      centerLon +
      (radiusDegrees * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);
    coords.push([lon, lat]);
  }
  coords.push(coords[0]);
  return { type: "Polygon", coordinates: [coords] };
};

// === FLIGHT CONNECTIVITY PATHS ENGINE ===
const airportCoordinates = {
  "Umbu Mehang Kunda Airport": {
    name: "Umbu Mehang Kunda Airport (WGP)",
    lat: -9.671389,
    lon: 120.306111,
  },
  "Tambolaka Airport": {
    name: "Tambolaka Airport (TMC)",
    lat: -9.4097,
    lon: 119.2443,
  },
  "El Tari Airport": {
    name: "El Tari Airport (KOE)",
    lat: -10.1717,
    lon: 123.674,
  },
  "Soekarno-Hatta Airport": {
    name: "Soekarno-Hatta Airport (CGK)",
    lat: -6.1256,
    lon: 106.6558,
  },
  "Komodo Airport": {
    name: "Komodo Airport (LBJ)",
    lat: -8.4869,
    lon: 119.8883,
  },
  "Ngurah Rai Airport": {
    name: "Ngurah Rai Airport (DPS)",
    lat: -8.7481,
    lon: 115.1672,
  },
};

const flightRoutes = [
  {
    id: "WGP-KOE",
    name: "Waingapu (WGP) ↔ Kupang (KOE)",
    desc: "Daily regional route essential for East Sumba referral and administrative transit to the provincial capital.",
    type: "Direct",
    carrier: "Wings Air",
    equipment: "ATR 72-600",
    duration: "45 mins",
    schedule: "Daily at 08:30 WITA",
    color: "#1C6048",
    legs: [{ from: "Umbu Mehang Kunda Airport", to: "El Tari Airport" }],
  },
  {
    id: "WGP-TMC",
    name: "Waingapu (WGP) ↔ Tambolaka (TMC)",
    desc: "Intra-island connecting route bridging East Sumba and West Sumba regional boundaries.",
    type: "Direct",
    carrier: "Wings Air / Trans Sumba",
    equipment: "ATR 72-600 (Seasonal)",
    duration: "30 mins",
    schedule: "Tue, Thu, Sat at 11:15 WITA",
    color: "#99B6AA",
    legs: [{ from: "Umbu Mehang Kunda Airport", to: "Tambolaka Airport" }],
  },
  {
    id: "WGP-KOE-CGK",
    name: "Waingapu (WGP) ↔ Jakarta (CGK) via Kupang",
    desc: "Multi-leg luxury transport and capital commute network linking East Sumba guests directly to national level airports.",
    type: "1-Stop Transit",
    carrier: "Wings Air + Batik Air",
    equipment: "ATR 72-600 + Boeing 737-800",
    duration: "4h 15m total (incl. 1h layover)",
    schedule: "Daily departures matching referral slots",
    color: "#E29A5C",
    legs: [
      { from: "Umbu Mehang Kunda Airport", to: "El Tari Airport" },
      { from: "El Tari Airport", to: "Soekarno-Hatta Airport" },
    ],
  },
  {
    id: "WGP-DPS-CGK",
    name: "Waingapu (WGP) ↔ Jakarta (CGK) via Bali",
    desc: "Major tourist and commercial transit corridor connecting East Sumba to Bali before flying into Jakarta.",
    type: "1-Stop Transit",
    carrier: "Nam Air / Wings Air + Citilink / Garuda",
    equipment: "Boeing 737-500 + Airbus A320",
    duration: "4h 30m total",
    schedule: "Daily departures at 11:45 WITA",
    color: "#A95C3E",
    legs: [
      { from: "Umbu Mehang Kunda Airport", to: "Ngurah Rai Airport" },
      { from: "Ngurah Rai Airport", to: "Soekarno-Hatta Airport" },
    ],
  },
  {
    id: "WGP-KOE-LBJ",
    name: "Waingapu (WGP) ↔ Labuan Bajo (LBJ) via Kupang",
    desc: "Key logistics and emergency guest service channel linking Sumba to Flores resort clusters.",
    type: "1-Stop Transit",
    carrier: "Wings Air + Citilink",
    equipment: "ATR 72-600 + ATR 72-600",
    duration: "3h 45m total",
    schedule: "Mon, Wed, Fri departures",
    color: "#8B5CF6",
    legs: [
      { from: "Umbu Mehang Kunda Airport", to: "El Tari Airport" },
      { from: "El Tari Airport", to: "Komodo Airport" },
    ],
  },
];

const getArcPoints = (startLat, startLon, endLat, endLon, numPoints = 60) => {
  const points = [];
  const midLat = (startLat + endLat) / 2;
  const midLon = (startLon + endLon) / 2;

  const dLat = endLat - startLat;
  const dLon = endLon - startLon;

  // Calculate perpendicular vector to add elegant curved offset
  const normalLat = -dLon * 0.15;
  const normalLon = dLat * 0.15;

  const controlLat = midLat + normalLat;
  const controlLon = midLon + normalLon;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat =
      (1 - t) * (1 - t) * startLat +
      2 * (1 - t) * t * controlLat +
      t * t * endLat;
    const lon =
      (1 - t) * (1 - t) * startLon +
      2 * (1 - t) * t * controlLon +
      t * t * endLon;
    points.push([lat, lon]);
  }
  return points;
};

const InteractiveDemographicMap = memo(() => {
  const [leafletReady, setLeafletReady] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const viewMode = "admin";
  const [regionsSectionExpanded, setRegionsSectionExpanded] = useState(true);
  const [poiSectionExpanded, setPoiSectionExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedPoiGroups, setExpandedPoiGroups] = useState({
    Vasanta: false,
    General: false,
    Infrastructure: false,
  });
  const [expandedSubGroups, setExpandedSubGroups] = useState({
    "Class A": false,
  });
  const [showRegionLabels, setShowRegionLabels] = useState(false);
  const [activePOIs, setActivePOIs] = useState(mapLocations.map((l) => l.id));
  const [loadingStatus, setLoadingStatus] = useState({
    active: true,
    text: "Initializing...",
    isError: false,
  });
  const [regionFetchStatuses, setRegionFetchStatuses] = useState({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const mapRef = useRef(null);
  const regionsLayersRef = useRef({});
  const geoJsonCacheRef = useRef({});
  const hoverTooltipRef = useRef(null);
  const poiGroupRef = useRef(null);
  const poiLayersRef = useRef({});
  const poiMarkersRef = useRef({});
  const isHoveringPoi = useRef(false);
  const activeClickedPoiRef = useRef(null);
  const measureStateRef = useRef({
    points: [],
    line: null,
    dynamicLine: null,
    tooltip: null,
    markers: [],
  });

  // --- AIR CONNECTIVITY CONTROL STATES ---
  const [mapTab, setMapTab] = useState("layers"); // "layers" or "flights"
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [isMapSelection, setIsMapSelection] = useState(false);
  const [selectedFlightLatLng, setSelectedFlightLatLng] = useState<any>(null);
  const [showFlightRoutes, setShowFlightRoutes] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.5); // Default to 1.5x
  const flightLayerGroupRef = useRef(null);

  // Sync route visibility switch with tab active status (Option 3C)
  useEffect(() => {
    if (mapTab === "flights") {
      setShowFlightRoutes(true);
    } else {
      setShowFlightRoutes(false);
    }
  }, [mapTab]);

  // Synchronize dynamic flights overlay and marker tracking animations on the map
  useEffect(() => {
    if (
      !leafletReady ||
      !isMapReady ||
      !mapRef.current ||
      !flightLayerGroupRef.current
    )
      return;
    const L = window.L;
    const map = mapRef.current;
    const group = flightLayerGroupRef.current;

    // 1. Clear any previous polylines/markers
    group.clearLayers();

    if (!showFlightRoutes) {
      return;
    }

    // 2. Determine selected route and coordinates
    const selectedFlight = selectedFlightId
      ? flightRoutes.find((f) => f.id === selectedFlightId)
      : null;

    // Calculate active coords sequence
    const selectedPathCoords = [];
    if (selectedFlight) {
      selectedFlight.legs.forEach((leg) => {
        const fromCoord = airportCoordinates[leg.from];
        const toCoord = airportCoordinates[leg.to];
        if (fromCoord && toCoord) {
          const points = getArcPoints(
            fromCoord.lat,
            fromCoord.lon,
            toCoord.lat,
            toCoord.lon,
            60,
          );
          selectedPathCoords.push(...points);
        }
      });
    }

    // 3. Draw entire flight network with selection prominence
    const hasSelection = !!selectedFlightId;
    flightRoutes.forEach((route) => {
      const isSelected = route.id === selectedFlightId;
      const color = isSelected ? "#1C6048" : "#9B8B70";
      // Prominence styling: active selected route is thick, other routes are faded out when something is selected.
      // If nothing is selected, we render them uniformly at a moderate weight.
      const weight = isSelected ? 3.5 : hasSelection ? 1.2 : 2.0;
      const opacity = isSelected ? 0.95 : hasSelection ? 0.2 : 0.65;

      route.legs.forEach((leg) => {
        const fromCoord = airportCoordinates[leg.from];
        const toCoord = airportCoordinates[leg.to];
        if (fromCoord && toCoord) {
          const arcCoords = getArcPoints(
            fromCoord.lat,
            fromCoord.lon,
            toCoord.lat,
            toCoord.lon,
            45,
          );
          const polyline = L.polyline(arcCoords, {
            color: color,
            weight: weight,
            opacity: opacity,
            dashArray: isSelected ? "3, 6" : undefined,
            pane: "flightsPane",
            className: "cursor-pointer",
          }).addTo(group);

          polyline.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            const isSelectedNow = selectedFlightId === route.id;
            setSelectedFlightId(isSelectedNow ? null : route.id);
            setIsMapSelection(isSelectedNow ? false : true);
            setSelectedFlightLatLng(isSelectedNow ? null : e.latlng);
            if (!isSelectedNow) {
              setShowFlightRoutes(true);
            }
          });
        }
      });
    });

    // 3b. Singular Selected Route Tooltip overlay centered directly at the click coordinates
    if (selectedFlight && selectedFlightLatLng && isMapSelection) {
      L.tooltip({
        className: "custom-tooltip selected-route-tooltip",
        permanent: true,
        direction: "top",
        offset: [0, -10],
      })
        .setLatLng(selectedFlightLatLng)
        .setContent(
          `<div style="font-family: inherit; font-size: 11px; padding: 4px 6px;">
          <b style="color:#1C6048">${selectedFlight.name}</b><br/>
          <span style="color:#666">Carrier: ${selectedFlight.carrier} (${selectedFlight.equipment})</span><br/>
          <span style="color:#888">Duration: ${selectedFlight.duration}</span>
        </div>`,
        )
        .addTo(group);
    }

    // 4. Set map viewport to track bounds dynamically
    const bounds = L.latLngBounds([]);
    if (selectedFlight && selectedPathCoords.length > 0) {
      selectedPathCoords.forEach((c) => bounds.extend(c));
    } else {
      Object.values(airportCoordinates).forEach((c) =>
        bounds.extend([c.lat, c.lon]),
      );
    }

    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [35, 35],
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }

    // 5. Selected Route Progressive Drawing Animation (A1 Hybrid)
    if (selectedFlight && selectedPathCoords.length > 0 && !isMapSelection) {
      const activeLine = L.polyline([selectedPathCoords[0]], {
        color: "#1C6048",
        weight: 4.5,
        opacity: 0.95,
        pane: "flightsPane",
      }).addTo(group);

      activeLine.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 4px 6px;">
          <b style="color:#1C6048">Active Tracking | FLIGHT ${selectedFlight.id}</b><br/>
          <span style="color:#444">${selectedFlight.carrier} • ${selectedFlight.equipment}</span>
        </div>`,
        { className: "custom-tooltip", direction: "top", offset: [0, -8] },
      );

      // Create a subtle glowing anchor/tip marker to lead the progressive line draw
      const pulseIcon = L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 14px; height: 14px;">
          <span class="relative flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1C6048] opacity-60"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-[#1C6048] border-2 border-[#FAF9F7] shadow-sm"></span>
          </span>
        </div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const leadMarker = L.marker(selectedPathCoords[0], {
        icon: pulseIcon,
        pane: "markersPane",
      }).addTo(group);

      let currentStepIndex = 0;
      let animationIntervalId = null;

      const refreshLineStep = () => {
        const activeCoords = selectedPathCoords.slice(0, currentStepIndex + 1);
        activeLine.setLatLngs(activeCoords);
        if (selectedPathCoords[currentStepIndex]) {
          leadMarker.setLatLng(selectedPathCoords[currentStepIndex]);
        }
      };

      // Perform initial render
      refreshLineStep();

      if (isAnimating) {
        const stepRateMs = Math.round(90 / animationSpeed);
        animationIntervalId = setInterval(() => {
          currentStepIndex = (currentStepIndex + 1) % selectedPathCoords.length;
          refreshLineStep();
        }, stepRateMs);
      }

      return () => {
        if (animationIntervalId) clearInterval(animationIntervalId);
      };
    }
  }, [
    leafletReady,
    isMapReady,
    selectedFlightId,
    isAnimating,
    animationSpeed,
    showFlightRoutes,
    isMapSelection,
    selectedFlightLatLng,
  ]);

  useEffect(() => {
    if (window.L && window.L.GestureHandling) {
      setLeafletReady(true);
      return;
    }

    const loadGestureHandling = () => {
      const ghCSS = document.createElement("link");
      ghCSS.rel = "stylesheet";
      ghCSS.href =
        "https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.css";
      document.head.appendChild(ghCSS);

      const ghJS = document.createElement("script");
      ghJS.src =
        "https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.js";
      ghJS.onload = () => setLeafletReady(true);
      document.body.appendChild(ghJS);
    };

    if (window.L) {
      loadGestureHandling();
      return;
    }

    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement("script");
    leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJS.onload = loadGestureHandling;
    document.body.appendChild(leafletJS);
  }, []);

  useEffect(() => {
    if (!leafletReady || mapRef.current) return;
    const L = window.L;

    // SAFEGUARD: Wipe dead ghost layers so they don't persist across React 18 remounts
    regionsLayersRef.current = {};
    geoJsonCacheRef.current = {};

    // SAFEGUARD: Clear residual map IDs
    const container = document.getElementById("demographics-map");
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = L.map("demographics-map", {
      zoomControl: false,
      gestureHandling: true,
    }).setView([-9.475, 120.189], 14);
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    map.createPane("labelsPane");
    map.getPane("labelsPane").style.zIndex = 405;
    map.createPane("ringsPane");
    map.getPane("ringsPane").style.zIndex = 410;
    map.createPane("flightsPane");
    map.getPane("flightsPane").style.zIndex = 415;
    map.createPane("markersPane");
    map.getPane("markersPane").style.zIndex = 420;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: "&copy; CARTO" },
    ).addTo(map);

    hoverTooltipRef.current = L.tooltip({
      className: "custom-tooltip",
      direction: "top",
      offset: [0, -10],
    });
    poiGroupRef.current = L.layerGroup().addTo(map);
    flightLayerGroupRef.current = L.layerGroup().addTo(map);

    map.on("click", () => {
      if (activeClickedPoiRef.current) {
        const prevId = activeClickedPoiRef.current;
        activeClickedPoiRef.current = null;
        handlePoiHover(prevId, false);
      }
      setSelectedFlightId(null);
      setIsMapSelection(false);
      setSelectedFlightLatLng(null);
    });

    mapRef.current = map;
    initPOIs(map);
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady]);

  const setupLayerInteractions = (layer, region, mapInstance) => {
    let lastLatLng = null;

    if (isHoveringPoi.current) return;
    // 1. Permanently bind the static text to the center of the region
    layer.bindTooltip(`<div class="static-region-name">${region.name}</div>`, {
      permanent: true,
      direction: "center",
      className: "static-region-tooltip",
      interactive: false,
      pane: "labelsPane",
    });

    // 2. Simple hover effect that respects the current View Mode colors
    layer.on("mouseover", (e) => {
      if (isHoveringPoi?.current) return;
      applyLayerStyle(layer, region.id, true, viewMode);
    });

    layer.on("mouseout", () => {
      applyLayerStyle(layer, region.id, false, viewMode);
    });

    // Hide the hover tooltip instantly if the user clicks to open the persistent popup
    layer.on("click", function () {
      clearTimeout(hoverTooltipRef.current._enterTimeout);
      if (mapInstance.hasLayer(hoverTooltipRef.current)) {
        mapInstance.removeLayer(hoverTooltipRef.current);
      }
    });

    layer.bindPopup(getTooltipContent(region, viewMode));
    regionsLayersRef.current[region.id] = layer;
    setRegionFetchStatuses((prev) => ({ ...prev, [region.id]: "success" }));
  };

  const syncRegionBorders = async (mapInstance, activeIds) => {
    const L = window.L;
    const missingIds = activeIds.filter(
      (id) =>
        !regionsLayersRef.current[id] && regionFetchStatuses[id] !== "loading",
    );

    if (missingIds.length === 0) {
      setLoadingStatus((prev) => ({ ...prev, active: false }));
      frameActiveRegions(mapInstance);
      return;
    }

    setRegionFetchStatuses((prev) => {
      const next = { ...prev };
      missingIds.forEach((id) => (next[id] = "loading"));
      return next;
    });

    for (const id of missingIds) {
      const region = targetRegions.find((r) => r.id === id);
      if (!region) continue;

      setLoadingStatus({
        active: true,
        text: `Loading boundary: ${region.name}`,
        isError: false,
      });

      try {
        // Fetch the REAL jagged polygon boundaries from OpenStreetMap
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region.query)}&polygon_geojson=1&format=json`,
        );
        if (!response.ok) throw new Error("API Error");
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("API Limit Reached");
        }

        let geojsonData;
        if (
          data &&
          data.length > 0 &&
          data[0].geojson &&
          data[0].geojson.type !== "Point" &&
          data[0].geojson.type !== "MultiPoint"
        ) {
          geojsonData = data[0].geojson;
        } else {
          geojsonData = generateFallbackGeoJSON(
            region.fallbackLat,
            region.fallbackLon,
            region.fallbackRadius,
          );
        }

        geoJsonCacheRef.current[id] = geojsonData;
        const layer = L.geoJSON(geojsonData, { className: "region-polygon" });

        // CRITICAL: We must save it to the cache and add it to the map physically!
        regionsLayersRef.current[id] = layer;
        layer.addTo(mapInstance);
        if (typeof setupLayerInteractions === "function") {
          setupLayerInteractions(layer, region, mapInstance);
        }
      } catch (error) {
        console.warn(
          `Failed to load real boundary for ${region.name}, using fallback.`,
        );

        // Draw the fallback circle boundary polyline
        const fallbackGeoJSON = generateFallbackGeoJSON(
          region.fallbackLat,
          region.fallbackLon,
          region.fallbackRadius,
        );
        geoJsonCacheRef.current[id] = fallbackGeoJSON;
        const layer = L.geoJSON(fallbackGeoJSON, {
          className: "region-polygon",
        });

        // Cache it and physically add it to the map
        regionsLayersRef.current[id] = layer;
        layer.addTo(mapInstance);
        if (typeof setupLayerInteractions === "function") {
          setupLayerInteractions(layer, region, mapInstance);
        }
      }

      // 300ms delay to keep the API happy without freezing your screen for 15 seconds
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setLoadingStatus((prev) => ({ ...prev, active: false }));
    frameActiveRegions(mapInstance);
  };

  const getTooltipContent = (region, mode) => {
    return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">${region.group}</span>`;
  };

  const applyLayerStyle = (layer, regionId, isHovered, mode) => {
    const region = targetRegions.find((r) => r.id === regionId);
    if (!region) return;

    const groupColor = getGroupColor(region.group);
    layer.setStyle({
      color: groupColor,
      weight: isHovered ? 2.5 : 0.5,
      dashArray: "4, 4",
      fillColor: groupColor,
      fillOpacity: isHovered ? 0.35 : 0.2,
    });
  };

  const initPOIs = (mapInstance) => {
    const L = window.L;
    mapLocations.forEach(async (loc) => {
      const singlePoiGroup = L.layerGroup();

      // Resolve coordinates dynamically (supports standard lat/lon or fallbackLat/fallbackLon)
      const lat = loc.lat !== undefined ? loc.lat : loc.fallbackLat;
      const lon = loc.lon !== undefined ? loc.lon : loc.fallbackLon;

      if (lat === undefined || lon === undefined) return;

      // Draw real polyline/polygon boundaries for locations if coordinates exist
      if (loc.polygonCoords) {
        L.polygon(loc.polygonCoords, {
          color: loc.color,
          weight: 2,
          dashArray: "4, 4",
          fillColor: loc.color,
          fillOpacity: 0.1,
          interactive: false,
          pane: "ringsPane",
        }).addTo(singlePoiGroup);
      } else if (loc.boundaryCoords) {
        L.polyline(loc.boundaryCoords, {
          color: loc.color,
          weight: 2,
          dashArray: "4, 4",
          fillColor: loc.color,
          fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
          interactive: false,
          pane: "ringsPane",
        }).addTo(singlePoiGroup);
      }

      // Draw dynamic boundaries if a query is defined in the location snippet
      if (loc.query) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc.query)}&polygon_geojson=1&format=json`,
          );
          if (!response.ok) throw new Error("API Error");
          const text = await response.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error("API Limit Reached");
          }

          let geojsonData;
          if (
            data &&
            data.length > 0 &&
            data[0].geojson &&
            data[0].geojson.type !== "Point" &&
            data[0].geojson.type !== "MultiPoint"
          ) {
            geojsonData = data[0].geojson;
          } else {
            geojsonData = generateFallbackGeoJSON(
              loc.fallbackLat,
              loc.fallbackLon,
              loc.fallbackRadius,
            );
          }

          L.geoJSON(geojsonData, {
            color: loc.color,
            weight: 2,
            dashArray: "4, 4",
            fillColor: loc.fillColor || loc.color,
            fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
            interactive: false,
            pane: "ringsPane",
          }).addTo(singlePoiGroup);
        } catch (error) {
          const fallbackGeoJSON = generateFallbackGeoJSON(
            loc.fallbackLat,
            loc.fallbackLon,
            loc.fallbackRadius,
          );
          L.geoJSON(fallbackGeoJSON, {
            color: loc.color,
            weight: 2,
            dashArray: "4, 4",
            fillColor: loc.fillColor || loc.color,
            fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
            interactive: false,
            pane: "ringsPane",
          }).addTo(singlePoiGroup);
        }
      }

      if (loc.radii) {
        loc.radii
          .sort((a, b) => b - a)
          .forEach((radius, index) => {
            const isOuter = index === 0;
            L.circle([lat, lon], {
              radius: radius,
              color: loc.color,
              weight: isOuter ? 2 : 2.5,
              dashArray: isOuter ? "4, 8" : "6, 6",
              fillColor: loc.color,
              fillOpacity: 0.1,
              interactive: false,
              pane: "ringsPane",
              className: isOuter ? "breathe-outer" : "breathe-inner",
            }).addTo(singlePoiGroup);
          });
      }

      let marker;
      const isAirport = [
        "Umbu Mehang Kunda Airport",
        "Soekarno-Hatta Airport",
        "Tambolaka Airport",
        "El Tari Airport",
        "Komodo Airport",
        "Ngurah Rai Airport",
      ].includes(loc.id);
      if (isAirport) {
        const iconHtml = `<div style="background-color: ${loc.color}; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #EFEBE7; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5-2.5-.5L2 17l4 4 1-.5-.5-2.5 3.5-3.5 5 6 1.2-.7.6-1.1c.4-.2.7-.6.6-1.1Z"/></svg>
        </div>`;
        marker = L.marker([lat, lon], {
          icon: L.divIcon({
            html: iconHtml,
            className: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          pane: "markersPane",
        }).addTo(singlePoiGroup);
      } else {
        marker = L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: loc.color,
          color: "#EFEBE7",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(singlePoiGroup);
      }

      marker.bindTooltip(
        `<b>${loc.name}</b><br><span style="font-size:11px;color:#777;">${loc.desc || loc.population || ""}</span>`,
        { direction: "top", offset: [0, -10], className: "custom-tooltip" },
      );

      poiLayersRef.current[loc.id] = singlePoiGroup;

      // Immediate sync: Force POIs to render instantly on map load
      if (activePOIs.includes(loc.id)) {
        singlePoiGroup.addTo(poiGroupRef.current);
      }
    });
  };

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    const map = mapRef.current;

    // Trigger our lazy-load engine
    syncRegionBorders(map, activeRegions);

    Object.entries(regionsLayersRef.current).forEach(([id, layer]) => {
      const isActive = activeRegions.includes(id);
      if (isActive && !map.hasLayer(layer)) {
        layer.addTo(map);
      } else if (!isActive && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
      if (isActive) {
        applyLayerStyle(layer, id, false, viewMode);
        const newContent = getTooltipContent(
          targetRegions.find((r) => r.id === id),
          viewMode,
        );
        layer.setPopupContent(newContent);
      }
    });

    if (hoverTooltipRef.current && map.hasLayer(hoverTooltipRef.current)) {
      map.removeLayer(hoverTooltipRef.current);
    }
  }, [activeRegions, viewMode, regionFetchStatuses, isMapReady]);

  useEffect(() => {
    if (!poiGroupRef.current) return;
    const group = poiGroupRef.current;
    group.clearLayers();
    activePOIs.forEach((id) => {
      if (poiLayersRef.current[id]) poiLayersRef.current[id].addTo(group);
    });
  }, [activePOIs]);

  const flyToWithOffset = useCallback((bounds, isPoint = false) => {
    if (!mapRef.current || !bounds || !bounds.isValid()) return;

    // Add 360px left padding on desktop to clear the panel, standard 40px on mobile
    const leftPadding = window.innerWidth > 640 ? 360 : 40;

    const options = {
      paddingTopLeft: [leftPadding, 40],
      paddingBottomRight: [40, 40],
      duration: 1.5,
      easeLinearity: 0.25,
    };
    if (isPoint) options.maxZoom = 12;
    mapRef.current.flyToBounds(bounds, options);
  }, []);

  const frameActiveRegions = useCallback(
    (mapInstance) => {
      const L = window.L;
      const activeLayers = activeRegions
        .map((id) => regionsLayersRef.current[id])
        .filter(Boolean);
      if (activeLayers.length > 0) {
        const boundaryGroup = L.featureGroup(activeLayers);
        flyToWithOffset(boundaryGroup.getBounds());
      }
    },
    [activeRegions, flyToWithOffset],
  );

  const handleRegionClick = (regionId) => {
    const layer = regionsLayersRef.current[regionId];
    if (layer && mapRef.current.hasLayer(layer) && layer.getBounds().isValid())
      flyToWithOffset(layer.getBounds());
  };

  const handlePoiClick = (lat, lon, id) => {
    const L = window.L;
    if (!L) return;
    flyToWithOffset(L.latLngBounds([lat, lon], [lat, lon]), true);
    if (id) {
      if (activeClickedPoiRef.current && activeClickedPoiRef.current !== id) {
        const prevId = activeClickedPoiRef.current;
        activeClickedPoiRef.current = id;
        handlePoiHover(prevId, false);
      } else {
        activeClickedPoiRef.current = id;
      }
      handlePoiHover(id, true);
    }
  };
  const handlePoiHover = useCallback((id, isHovering) => {
    if (
      isHovering &&
      activeClickedPoiRef.current &&
      activeClickedPoiRef.current !== id
    ) {
      const prevId = activeClickedPoiRef.current;
      activeClickedPoiRef.current = null;
      const prevLayer = poiLayersRef.current[prevId];
      if (prevLayer) {
        prevLayer.eachLayer((layer) => {
          if (layer.options && layer.options.pane === "markersPane") {
            if (typeof layer.setStyle === "function") {
              layer.setStyle({ className: "" });
            }
            const el =
              typeof layer.getElement === "function"
                ? layer.getElement()
                : null;
            if (el) el.classList.remove("glowing-marker");
          }
        });
      }
    }

    const layerGroup = poiLayersRef.current[id];
    if (layerGroup) {
      layerGroup.eachLayer((layer) => {
        if (layer.options && layer.options.pane === "markersPane") {
          const isGlowing = isHovering || activeClickedPoiRef.current === id;
          if (typeof layer.setStyle === "function") {
            layer.setStyle({
              className: isGlowing ? "glowing-marker" : "",
              radius: 8,
              weight: 2,
              opacity: 1,
            });
          }
          const el =
            typeof layer.getElement === "function" ? layer.getElement() : null;
          if (el) {
            if (isGlowing) el.classList.add("glowing-marker");
            else el.classList.remove("glowing-marker");
          }
          if (isGlowing && typeof layer.bringToFront === "function") {
            layer.bringToFront();
          }
        }
      });
    }
  }, []);

  const handleGroupHover = useCallback(
    (locs, isHovering) => {
      locs.forEach((loc) => handlePoiHover(loc.id, isHovering));
    },
    [handlePoiHover],
  );

  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If we clicked something that is not a location list item and is not on the map itself
      if (
        !e.target.closest(".location-list-item") &&
        !e.target.closest("#demographics-map")
      ) {
        if (activeClickedPoiRef.current) {
          const prevId = activeClickedPoiRef.current;
          activeClickedPoiRef.current = null;
          handlePoiHover(prevId, false);
        }
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [handlePoiHover]);

  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L) return;
    measureStateRef.current.isMeasuring = isMeasuring;

    const clearMeasure = () => {
      const state = measureStateRef.current;
      state.points = [];
      if (state.line) map.removeLayer(state.line);
      if (state.dynamicLine) map.removeLayer(state.dynamicLine);
      if (state.tooltip && map.hasLayer(state.tooltip))
        map.removeLayer(state.tooltip);
      state.markers.forEach((m) => map.removeLayer(m));
      state.markers = [];
      state.line = null;
      state.dynamicLine = null;
    };

    const onMeasureClick = (e) => {
      const state = measureStateRef.current;
      if (state.points.length === 0 || state.points.length === 2) {
        clearMeasure();
        state.points.push(e.latlng);
        const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "#1C6048",
          color: "#EFEBE7",
          weight: 2,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(map);
        state.markers.push(marker);
        state.dynamicLine = L.polyline([e.latlng, e.latlng], {
          color: "#1C6048",
          weight: 2.5,
          dashArray: "6, 8",
          pane: "ringsPane",
        }).addTo(map);
        state.tooltip = L.tooltip({
          permanent: true,
          className: "measure-tooltip",
          direction: "center",
        })
          .setLatLng(e.latlng)
          .setContent("0.00 km")
          .addTo(map);
      } else if (state.points.length === 1) {
        state.points.push(e.latlng);
        const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "#1C6048",
          color: "#EFEBE7",
          weight: 2,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(map);
        state.markers.push(marker);
        if (state.dynamicLine) map.removeLayer(state.dynamicLine);
        state.line = L.polyline(state.points, {
          color: "#1C6048",
          weight: 2.5,
          dashArray: "6, 8",
          pane: "ringsPane",
        }).addTo(map);
        const distance = (
          map.distance(state.points[0], state.points[1]) / 1000
        ).toFixed(2);
        state.tooltip
          .setLatLng([
            (state.points[0].lat + state.points[1].lat) / 2,
            (state.points[0].lng + state.points[1].lng) / 2,
          ])
          .setContent(`${distance} km`);
      }
    };

    const onMeasureMove = (e) => {
      const state = measureStateRef.current;
      if (state.points.length === 1) {
        state.dynamicLine.setLatLngs([state.points[0], e.latlng]);
        const distance = (
          map.distance(state.points[0], e.latlng) / 1000
        ).toFixed(2);
        state.tooltip
          .setLatLng([
            (state.points[0].lat + e.latlng.lat) / 2,
            (state.points[0].lng + e.latlng.lng) / 2,
          ])
          .setContent(`${distance} km`);
      }
    };

    if (isMeasuring) {
      map.getContainer().style.cursor = "crosshair";
      map.getContainer().classList.add("map-measuring");
      map.on("click", onMeasureClick);
      map.on("mousemove", onMeasureMove);
    } else {
      map.getContainer().style.cursor = "";
      map.getContainer().classList.remove("map-measuring");
      map.off("click", onMeasureClick);
      map.off("mousemove", onMeasureMove);
      clearMeasure();
    }
    return () => {
      if (map) {
        map.off("click", onMeasureClick);
        map.off("mousemove", onMeasureMove);
      }
    };
  }, [isMeasuring]);

  const toggleRegion = (id) => {};
  const toggleGroup = (groupName) => {};
  const toggleAllPoi = () =>
    setActivePOIs((prev) =>
      prev.length === mapLocations.length ? [] : mapLocations.map((l) => l.id),
    );

  const legendInfo = true;

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden relative z-10 font-sans border border-[#D8D8D8] shadow-sm">
      <style>{`
                /* --- 1. NEW STATIC REGION LABELS --- */
                .static-region-tooltip { 
                    background: transparent !important; 
                    border: none !important; 
                    box-shadow: none !important; 
                    pointer-events: none !important; 
                    transition: opacity 0.3s ease;
                    ${!showRegionLabels ? "opacity: 0 !important; visibility: hidden !important;" : ""}
                }
                .static-region-tooltip .leaflet-tooltip-tip { display: none; }
                .static-region-name { 
                    font-size: 11px; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 2px; 
                    color: rgba(30, 47, 49, 0.4);
                    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.8);
                }

                /* --- 2. ORIGINAL ESSENTIAL APP STYLES --- */
                .vignette {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    box-shadow: inset 0 0 200px rgba(30, 47, 49, 0.35);
                    pointer-events: none; z-index: 10;
                }
                
                @keyframes pulseGlow {
                    0% { filter: drop-shadow(0 0 8px rgba(30, 58, 138, 0.9)); fill-opacity: 0.9; }
                    100% { filter: drop-shadow(0 0 24px rgba(30, 58, 138, 1)); fill-opacity: 1; stroke-width: 5px; }
                }
                
                /* Glowing Marker on Hover */
                .glowing-marker {
                    animation: pulseGlow 1s infinite alternate ease-in-out;
                    transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
                }

                /* Fix the ugly square focus ring on map markers */
                .leaflet-interactive:focus { outline: none !important; }
                
                /* Ultra-Premium Glassmorphism Tooltips */
                .leaflet-tooltip.custom-tooltip, .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.5) !important; 
                    backdrop-filter: blur(16px) saturate(180%) !important; 
                    -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
                    border-radius: 12px !important; 
                    box-shadow: 0 8px 32px rgba(30, 47, 49, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
                    border: none !important; 
                    color: #1E2F31 !important;
                    font-weight: 600 !important; 
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                }
                /* Hide the little map arrows so the glass box floats cleanly */
                .leaflet-tooltip-tip, .leaflet-popup-tip-container { display: none !important; }
                .leaflet-tooltip.custom-tooltip { 
                    padding: 12px 16px; 
                    opacity: 1 !important; 
                    width: max-content !important;
                    min-width: 180px !important;
                    max-width: 250px !important;
                    white-space: normal !important;
                    word-wrap: break-word !important;
                    word-break: break-word !important;
                    box-sizing: border-box !important;
                }
                .leaflet-tooltip.custom-tooltip.selected-route-tooltip {
                    background: rgba(255, 255, 255, 0.8) !important;
                    border: 1px solid rgba(28, 96, 72, 0.3) !important;
                    box-shadow: 0 12px 36px rgba(28, 96, 72, 0.15) !important;
                    z-index: 1200 !important;
                }
                @media (max-width: 640px) {
                    .leaflet-tooltip.custom-tooltip {
                        width: max-content !important;
                        min-width: 130px !important;
                        max-width: 170px !important;
                        padding: 8px 10px !important;
                    }
                }
                .leaflet-popup-content { margin: 12px 16px; line-height: 1.4; }
                
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin: 16px 0; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 139, 112, 0.5); border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(155, 139, 112, 0.8); }
                
                /* UI Switches */
                .switch { position: relative; display: inline-block; flex-shrink: 0; }
                .switch.group { width: 32px; height: 18px; margin-left: 8px; }
                .switch.item { width: 24px; height: 14px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #D8D8D8; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; background-color: #EFEBE7; transition: .4s; border-radius: 50%; }
                .switch.group .slider:before { height: 12px; width: 12px; left: 3px; bottom: 3px; }
                .switch.item .slider:before { height: 10px; width: 10px; left: 2px; bottom: 2px; }
                .switch.group input:checked + .slider { background-color: #9B8B70; }
                .switch.item input:checked + .slider { background-color: #1E2f31; }
                .switch.group input:checked + .slider:before { transform: translateX(14px); }
                .switch.item input:checked + .slider:before { transform: translateX(10px); }
                
                /* Animations */
                @keyframes breathePulse { 0% { opacity: 0.1; } 100% { opacity: 0.5; } }
                .breathe-outer { animation: breathePulse 3s infinite alternate ease-in-out; }
                .breathe-inner { animation: breathePulse 3s infinite alternate-reverse ease-in-out; }
                
                /* Leaflet Controls */
                .leaflet-left .leaflet-control { margin-left: 16px !important; }
                .leaflet-bottom .leaflet-control { margin-bottom: 16px !important; }
                .leaflet-bar {
                    border: 2px solid rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.65) !important;
                    border-radius: 4px !important;
                    background-clip: padding-box !important;
                    overflow: hidden;
                }
                .leaflet-bar a, .leaflet-touch .leaflet-bar a {
                    background-color: white !important;
                    color: #4C4A4B !important;
                    width: 30px !important;
                    height: 30px !important;
                    line-height: 30px !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    border-bottom: 1px solid rgba(0,0,0,0.1) !important;
                }
                .leaflet-bar a:last-child { border-bottom: none !important; }
                .leaflet-bar a:hover {
                    background-color: #f4f4f4 !important;
                    color: #1C6048 !important;
                }
            `}</style>

      <div className="vignette"></div>
      <div id="demographics-map" className="w-full h-full z-[1]"></div>

      {/* Dynamic Dual Map Legend */}
      {legendInfo && !isLegendOpen && (
        <div
          onClick={() => setIsLegendOpen(true)}
          className={`absolute top-4 right-4 z-[950] bg-white/90 backdrop-blur-md px-2.5 py-2 sm:p-2.5 rounded-xl shadow-md border border-[#D8D8D8] cursor-pointer hover:bg-white text-[#1E2F31] font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 transition-all duration-300 flex`}
        >
          <span className="hidden sm:inline">Legend</span>
          <span className="sm:hidden">Legend</span>
          <ChevronRight
            size={14}
            className="text-[#1E2F31] shrink-0 rotate-180"
          />
        </div>
      )}

      {legendInfo && (
        <div
          onWheel={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`absolute top-4 right-4 z-[1010] bg-white/95 backdrop-blur-md border border-[#D8D8D8] rounded-xl shadow-lg w-[calc(100%-32px)] sm:w-[180px] max-h-[calc(100%-110px)] overflow-y-auto overscroll-contain custom-scrollbar flex flex-col pointer-events-auto transition-all duration-300 ${isLegendOpen ? "translate-x-0" : "translate-x-[120%]"}`}
        >
          <div className="p-3 border-b border-[#D8D8D8] flex justify-between items-center sticky top-0 bg-white/95 z-10">
            <h4 className="text-[11px] font-extrabold text-[#1E2F31] uppercase tracking-wider">
              Legend
            </h4>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-[#4C4A4B] hover:bg-[#EFEBE7] p-1 rounded-lg transition-colors flex items-center justify-center"
              title="Close Panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-3 flex flex-col gap-4">
            {/* 1. Infrastructure Section */}
            <div>
              <h4 className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-wider mb-2">
                Locations
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                    <span className="absolute inset-0 rounded-full border border-dashed border-[#1E3A8A] animate-[spin_10s_linear_infinite]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                  </div>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Vasanta Hub
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#1E2F31] shadow-sm flex-shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Class A
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#A95C3E] shadow-sm flex-shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Class B
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Air Referral Section */}
            <div>
              <h4 className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-wider mb-2">
                Air Referral
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[3px] rounded bg-[#1C6048] flex-shrink-0 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Active Route
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[2px] rounded bg-[#9B8B70] flex-shrink-0"></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                    Other Routes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-4 right-4 z-[1010] bg-white/70 backdrop-blur-sm border border-[#D8D8D8]/50 py-2 px-4 rounded-lg shadow-md text-xs font-medium text-[#4C4A4B] transition-opacity duration-500 pointer-events-none flex items-center ${loadingStatus.active ? "opacity-100" : "opacity-0"}`}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full mr-2 ${loadingStatus.active ? "bg-[#1C6048] animate-pulse" : "bg-[#1C6048]"}`}
        ></span>
        <span>{loadingStatus.text}</span>
      </div>

      <div
        onWheel={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={`absolute top-4 left-4 z-[1010] bg-white/95 backdrop-blur-md border border-[#D8D8D8] rounded-xl shadow-lg w-[calc(100%-32px)] sm:w-[320px] max-h-[calc(100%-110px)] overflow-y-auto overscroll-contain custom-scrollbar flex flex-col pointer-events-auto transition-all duration-300 ${isPanelOpen ? "translate-x-0" : "-translate-x-[120%]"}`}
      >
        <div className="p-4 border-b border-[#D8D8D8] flex flex-col gap-3 sticky top-0 bg-white/95 z-10 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="text-sm font-extrabold text-[#1E2f31] uppercase tracking-wider flex items-center gap-2">
              <Map size={16} className="text-[#1C6048]" />{" "}
              <span>Overview Map</span>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-[#9B8B70] hover:text-[#1E2F31]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex bg-[#EFEBE7] p-1 rounded-lg w-full">
            <button
              onClick={() => setMapTab("layers")}
              className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                mapTab === "layers"
                  ? "bg-[#1C6048] text-white shadow-sm"
                  : "text-[#4C4A4B] hover:text-[#1E2F31]"
              }`}
            >
              Layers
            </button>
            <button
              onClick={() => setMapTab("flights")}
              className={`flex-1 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                mapTab === "flights"
                  ? "bg-[#1C6048] text-white shadow-sm"
                  : "text-[#4C4A4B] hover:text-[#1E2F31]"
              }`}
            >
              Air Referral
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {mapTab === "flights" ? (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Show Routes Master Toggle */}
              <div className="flex justify-between items-center text-[11px] font-extrabold text-[#1C6048] uppercase tracking-wider pb-1.5 border-b border-dashed border-[#D8D8D8]">
                <span>Show Air Routes</span>
                <label className="switch group">
                  <input
                    type="checkbox"
                    checked={showFlightRoutes}
                    onChange={(e) => setShowFlightRoutes(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Referral Routes list */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#9B8B70] uppercase tracking-wider text-left">
                  Referral Routes
                </span>
                <div
                  onWheel={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="flex flex-col gap-2 max-h-[180px] overflow-y-auto overscroll-contain custom-scrollbar pr-1"
                >
                  {flightRoutes.map((route) => {
                    const isSelected = route.id === selectedFlightId;
                    const isDirect = route.type === "Direct";
                    return (
                      <div
                        key={route.id}
                        onClick={() => {
                          const newSelection = isSelected ? null : route.id;
                          setSelectedFlightId(newSelection);
                          setIsMapSelection(false);
                          setSelectedFlightLatLng(null);
                          if (newSelection) {
                            setShowFlightRoutes(true);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#1C6048] bg-[#F2F6F4] shadow-sm"
                            : "border-[#D8D8D8] hover:border-[#9B8B70] bg-white/50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-[11px] text-[#1E2F31] leading-snug">
                            {route.name}
                          </span>
                          <span
                            className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              isDirect
                                ? "bg-[#D1FAE5] text-[#065F46]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                            }`}
                          >
                            {route.type}
                          </span>
                        </div>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isSelected
                              ? "grid-rows-[1fr] opacity-100 mt-2"
                              : "grid-rows-[0fr] opacity-0 overflow-hidden pointer-events-none"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-[#4C4A4B] leading-relaxed">
                              {route.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div
                className="flex justify-between items-center text-[11px] font-extrabold text-[#1C6048] uppercase tracking-wider pb-1 border-b border-dashed border-[#d8d8d8] cursor-pointer pr-2"
                onClick={() => setPoiSectionExpanded(!poiSectionExpanded)}
              >
                <div className="flex items-center gap-1.5">
                  <span>Locations</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${!poiSectionExpanded ? "-rotate-90" : ""}`}
                  />
                </div>
                <label
                  className="switch group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={activePOIs.length === mapLocations.length}
                    onChange={toggleAllPoi}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {poiSectionExpanded && (
                <div className="flex flex-col">
                  {["Vasanta", "General", "Infrastructure"].map((groupName) => {
                    const groupLocs = mapLocations.filter(
                      (loc) => loc.group === groupName,
                    );
                    if (groupLocs.length === 0) return null;

                    return (
                      <div
                        key={groupName}
                        className={`flex flex-col transition-all`}
                      >
                        {/* TIER 1: The Main Group Header */}
                        <div
                          className={`flex justify-between items-center text-[10px] font-bold text-[#9B8B70] uppercase py-1 bg-[#F9F8F6] px-2 rounded cursor-pointer transition-all`}
                          onClick={() =>
                            setExpandedPoiGroups((p) => ({
                              ...p,
                              [groupName]: !p[groupName],
                            }))
                          }
                          onMouseEnter={() => handleGroupHover(groupLocs, true)}
                          onMouseLeave={() =>
                            handleGroupHover(groupLocs, false)
                          }
                        >
                          <div className="flex items-center gap-1.5">
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-300 ${!expandedPoiGroups[groupName] ? "-rotate-90" : ""}`}
                            />
                            <span>{groupName}</span>
                          </div>
                          <label
                            className="switch group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={groupLocs.every((l) =>
                                activePOIs.includes(l.id),
                              )}
                              onChange={() => {
                                const ids = groupLocs.map((l) => l.id);
                                const allActive = ids.every((id) =>
                                  activePOIs.includes(id),
                                );
                                setActivePOIs((prev) =>
                                  allActive
                                    ? prev.filter((id) => !ids.includes(id))
                                    : [...new Set([...prev, ...ids])],
                                );
                              }}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {expandedPoiGroups[groupName] && (
                          <div className="flex flex-col">
                            {/* Anchor / Base Locations (No SubGroup) */}
                            {groupLocs
                              .filter((l) => !l.subGroup)
                              .map((loc, index) => (
                                <div
                                  key={loc.id}
                                  className="location-list-item flex justify-between items-center py-1.5 pl-7 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                  onClick={() =>
                                    handlePoiClick(
                                      loc.lat !== undefined
                                        ? loc.lat
                                        : loc.fallbackLat,
                                      loc.lon !== undefined
                                        ? loc.lon
                                        : loc.fallbackLon,
                                      loc.id,
                                    )
                                  }
                                  onMouseEnter={() =>
                                    handlePoiHover?.(loc.id, true)
                                  }
                                  onMouseLeave={() =>
                                    handlePoiHover?.(loc.id, false)
                                  }
                                >
                                  <div className="truncate flex-1 min-w-0 pr-3">
                                    <span className="text-[#9B8B70] mr-1.5 font-bold">
                                      {index + 1}.
                                    </span>
                                    <span className="font-bold text-[#1E2F31]">
                                      {loc.name}
                                    </span>
                                    <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                      — {loc.desc}
                                    </span>
                                  </div>
                                  <label
                                    className="switch item"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={activePOIs.includes(loc.id)}
                                      onChange={() =>
                                        setActivePOIs((prev) =>
                                          prev.includes(loc.id)
                                            ? prev.filter((i) => i !== loc.id)
                                            : [...prev, loc.id],
                                        )
                                      }
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                              ))}

                            {/* TIER 2: Sub-Groups Loop (e.g., '< 5km Radius' or 'Class A') */}
                            {[
                              ...new Set(
                                groupLocs
                                  .filter((l) => l.subGroup)
                                  .map((l) => l.subGroup),
                              ),
                            ].map((subGroupName) => {
                              const subGroupLocs = groupLocs.filter(
                                (l) => l.subGroup === subGroupName,
                              );

                              // Determine if this is a distance folder or a standalone class
                              const isDistanceFolder =
                                subGroupName.includes("km Radius");

                              return (
                                <div
                                  key={subGroupName}
                                  className={`flex flex-col ${isDistanceFolder ? "mt-0.5" : ""}`}
                                >
                                  {isDistanceFolder ? (
                                    // 1. Collapsible Distance Folder with Master Toggle
                                    <div
                                      className="flex justify-between items-center pl-7 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={() =>
                                        setExpandedSubGroups((p) => ({
                                          ...p,
                                          [subGroupName]: !p[subGroupName],
                                        }))
                                      }
                                      onMouseEnter={() =>
                                        handleGroupHover(subGroupLocs, true)
                                      }
                                      onMouseLeave={() =>
                                        handleGroupHover(subGroupLocs, false)
                                      }
                                    >
                                      <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                        <ChevronDown
                                          size={10}
                                          className={`transition-transform duration-300 ${expandedSubGroups[subGroupName] === false ? "-rotate-90" : ""}`}
                                        />
                                        <span>{subGroupName}</span>
                                      </div>
                                      <label
                                        className="switch item scale-75 origin-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subGroupLocs.every((l) =>
                                            activePOIs.includes(l.id),
                                          )}
                                          onChange={() => {
                                            const ids = subGroupLocs.map(
                                              (l) => l.id,
                                            );
                                            const allActive = ids.every((id) =>
                                              activePOIs.includes(id),
                                            );
                                            setActivePOIs((prev) =>
                                              allActive
                                                ? prev.filter(
                                                    (id) => !ids.includes(id),
                                                  )
                                                : [
                                                    ...new Set([
                                                      ...prev,
                                                      ...ids,
                                                    ]),
                                                  ],
                                            );
                                          }}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  ) : (
                                    // 2. Standalone Class Header (e.g., Class A) with Toggle
                                    <div
                                      className="flex justify-between items-center pl-7 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={() =>
                                        setExpandedSubGroups((p) => ({
                                          ...p,
                                          [subGroupName]: !p[subGroupName],
                                        }))
                                      }
                                      onMouseEnter={() =>
                                        handleGroupHover(subGroupLocs, true)
                                      }
                                      onMouseLeave={() =>
                                        handleGroupHover(subGroupLocs, false)
                                      }
                                    >
                                      <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                        <ChevronDown
                                          size={10}
                                          className={`transition-transform duration-300 ${expandedSubGroups[subGroupName] === false ? "-rotate-90" : ""}`}
                                        />
                                        <span>{subGroupName}</span>
                                      </div>
                                      <label
                                        className="switch item scale-75 origin-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subGroupLocs.every((l) =>
                                            activePOIs.includes(l.id),
                                          )}
                                          onChange={() => {
                                            const ids = subGroupLocs.map(
                                              (l) => l.id,
                                            );
                                            const allActive = ids.every((id) =>
                                              activePOIs.includes(id),
                                            );
                                            setActivePOIs((prev) =>
                                              allActive
                                                ? prev.filter(
                                                    (id) => !ids.includes(id),
                                                  )
                                                : [
                                                    ...new Set([
                                                      ...prev,
                                                      ...ids,
                                                    ]),
                                                  ],
                                            );
                                          }}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  )}

                                  {/* TIER 3: Nested Items & Sub-Sub Headers (Rendered if Tier 2 is expanded) */}
                                  {expandedSubGroups[subGroupName] !==
                                    false && (
                                    <div className="flex flex-col mb-1">
                                      {/* Class A Sub-Header inside Distance Folder */}
                                      {isDistanceFolder &&
                                        subGroupLocs.some(
                                          (l) => l.tier === "Class A",
                                        ) && (
                                          <div
                                            className="flex justify-between items-center pl-9 pr-2 mt-1 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                                            onClick={() =>
                                              setExpandedSubGroups((p) => ({
                                                ...p,
                                                [`${subGroupName}_ClassA`]:
                                                  !p[`${subGroupName}_ClassA`],
                                              }))
                                            }
                                            onMouseEnter={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class A",
                                                ),
                                                true,
                                              )
                                            }
                                            onMouseLeave={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class A",
                                                ),
                                                false,
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                              <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-300 ${expandedSubGroups[`${subGroupName}_ClassA`] === false ? "-rotate-90" : ""}`}
                                              />
                                              <span>
                                                Class A (Comprehensive)
                                              </span>
                                            </div>
                                            <label
                                              className="switch item scale-75 origin-right"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <input
                                                type="checkbox"
                                                checked={subGroupLocs
                                                  .filter(
                                                    (l) => l.tier === "Class A",
                                                  )
                                                  .every((l) =>
                                                    activePOIs.includes(l.id),
                                                  )}
                                                onChange={() => {
                                                  const ids = subGroupLocs
                                                    .filter(
                                                      (l) =>
                                                        l.tier === "Class A",
                                                    )
                                                    .map((l) => l.id);
                                                  const allActive = ids.every(
                                                    (id) =>
                                                      activePOIs.includes(id),
                                                  );
                                                  setActivePOIs((prev) =>
                                                    allActive
                                                      ? prev.filter(
                                                          (id) =>
                                                            !ids.includes(id),
                                                        )
                                                      : [
                                                          ...new Set([
                                                            ...prev,
                                                            ...ids,
                                                          ]),
                                                        ],
                                                  );
                                                }}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                          </div>
                                        )}

                                      {/* Class A Loop */}
                                      {expandedSubGroups[
                                        `${subGroupName}_ClassA`
                                      ] !== false &&
                                        subGroupLocs
                                          .filter(
                                            (l) =>
                                              l.tier === "Class A" ||
                                              !isDistanceFolder,
                                          )
                                          .map((loc, index) => (
                                            <div
                                              key={loc.id}
                                              className={`location-list-item flex justify-between items-center py-1.5 ${isDistanceFolder ? "pl-12" : "pl-10"} pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors`}
                                              onClick={() =>
                                                handlePoiClick(
                                                  loc.lat,
                                                  loc.lon,
                                                  loc.id,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                handlePoiHover?.(loc.id, true)
                                              }
                                              onMouseLeave={() =>
                                                handlePoiHover?.(loc.id, false)
                                              }
                                            >
                                              <div className="truncate flex-1 min-w-0 pr-3">
                                                <span className="text-[#9B8B70] mr-1.5 font-bold">
                                                  {index + 1}.
                                                </span>
                                                <span className="font-bold text-[#1E2F31]">
                                                  {loc.name}
                                                </span>
                                                <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                                  — {loc.desc}
                                                </span>
                                              </div>
                                              <label
                                                className="switch item"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={activePOIs.includes(
                                                    loc.id,
                                                  )}
                                                  onChange={() =>
                                                    setActivePOIs((prev) =>
                                                      prev.includes(loc.id)
                                                        ? prev.filter(
                                                            (i) => i !== loc.id,
                                                          )
                                                        : [...prev, loc.id],
                                                    )
                                                  }
                                                />
                                                <span className="slider"></span>
                                              </label>
                                            </div>
                                          ))}

                                      {/* Class B Sub-Header inside Distance Folder */}
                                      {isDistanceFolder &&
                                        subGroupLocs.some(
                                          (l) => l.tier === "Class B",
                                        ) && (
                                          <div
                                            className="flex justify-between items-center pl-9 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                                            onClick={() =>
                                              setExpandedSubGroups((p) => ({
                                                ...p,
                                                [`${subGroupName}_ClassB`]:
                                                  !p[`${subGroupName}_ClassB`],
                                              }))
                                            }
                                            onMouseEnter={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class B",
                                                ),
                                                true,
                                              )
                                            }
                                            onMouseLeave={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class B",
                                                ),
                                                false,
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                              <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-300 ${expandedSubGroups[`${subGroupName}_ClassB`] === false ? "-rotate-90" : ""}`}
                                              />
                                              <span>Class B (Specialized)</span>
                                            </div>
                                            <label
                                              className="switch item scale-75 origin-right"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <input
                                                type="checkbox"
                                                checked={subGroupLocs
                                                  .filter(
                                                    (l) => l.tier === "Class B",
                                                  )
                                                  .every((l) =>
                                                    activePOIs.includes(l.id),
                                                  )}
                                                onChange={() => {
                                                  const ids = subGroupLocs
                                                    .filter(
                                                      (l) =>
                                                        l.tier === "Class B",
                                                    )
                                                    .map((l) => l.id);
                                                  const allActive = ids.every(
                                                    (id) =>
                                                      activePOIs.includes(id),
                                                  );
                                                  setActivePOIs((prev) =>
                                                    allActive
                                                      ? prev.filter(
                                                          (id) =>
                                                            !ids.includes(id),
                                                        )
                                                      : [
                                                          ...new Set([
                                                            ...prev,
                                                            ...ids,
                                                          ]),
                                                        ],
                                                  );
                                                }}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                          </div>
                                        )}

                                      {/* Class B Loop */}
                                      {expandedSubGroups[
                                        `${subGroupName}_ClassB`
                                      ] !== false &&
                                        isDistanceFolder &&
                                        subGroupLocs
                                          .filter((l) => l.tier === "Class B")
                                          .map((loc, index) => (
                                            <div
                                              key={loc.id}
                                              className="location-list-item flex justify-between items-center py-1.5 pl-12 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                              onClick={() =>
                                                handlePoiClick(
                                                  loc.lat,
                                                  loc.lon,
                                                  loc.id,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                handlePoiHover?.(loc.id, true)
                                              }
                                              onMouseLeave={() =>
                                                handlePoiHover?.(loc.id, false)
                                              }
                                            >
                                              <div className="truncate flex-1 min-w-0 pr-3">
                                                <span className="text-[#9B8B70] mr-1.5 font-bold">
                                                  {index + 1}.
                                                </span>
                                                <span className="font-bold text-[#1E2F31]">
                                                  {loc.name}
                                                </span>
                                                <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                                  — {loc.desc}
                                                </span>
                                              </div>
                                              <label
                                                className="switch item"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={activePOIs.includes(
                                                    loc.id,
                                                  )}
                                                  onChange={() =>
                                                    setActivePOIs((prev) =>
                                                      prev.includes(loc.id)
                                                        ? prev.filter(
                                                            (i) => i !== loc.id,
                                                          )
                                                        : [...prev, loc.id],
                                                    )
                                                  }
                                                />
                                                <span className="slider"></span>
                                              </label>
                                            </div>
                                          ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isPanelOpen && (
        <div
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-4 left-4 z-[950] bg-white/90 backdrop-blur-md px-2.5 py-2 sm:p-2.5 rounded-xl shadow-md border border-[#D8D8D8] cursor-pointer hover:bg-white text-[#1E2F31] font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2"
        >
          <Map size={14} className="text-[#1C6048] shrink-0" />
          <span className="hidden sm:inline">Open Map Data</span>
          <span className="sm:hidden">Data</span>
        </div>
      )}
      {/* Combined Toolbar (Target & Ruler) matching Leaflet native style */}
      <div className="leaflet-bar absolute bottom-4 left-[60px] z-[1000] cursor-pointer">
        <a
          onClick={(e) => {
            e.preventDefault();
            frameActiveRegions(mapRef.current);
          }}
          title="Reset View to Active Regions"
          className="hover:!text-[#1C6048]"
        >
          <Target size={16} strokeWidth={2.5} />
        </a>
        <a
          onClick={(e) => {
            e.preventDefault();
            setIsMeasuring(!isMeasuring);
          }}
          title="Measure Distance"
          className={
            isMeasuring
              ? "!bg-[#E8EFEA] !text-[#1C6048]"
              : "hover:!text-[#1C6048]"
          }
        >
          <Ruler size={16} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
});
// === END INTERACTIVE MAP ===

const ClinicalProgrammingView = memo(() => {
  const [viewMode, setViewMode] = useState<"moh" | "private">("moh");

  const pieData = useMemo(
    () => [
      {
        name: "Standard",
        value: 48,
        color: viewMode === "private" ? "#4C4A4B" : "#9B8B70",
      },
      {
        name: "VIP/VVIP",
        value: 48,
        color: viewMode === "private" ? "#9B8B70" : "#99B6AA",
      },
      {
        name: "Isolation",
        value: 12,
        color: viewMode === "private" ? "#D8D8D8" : "#FFFFFF",
      },
      {
        name: "ICU",
        value: 12,
        color: viewMode === "private" ? "#1C6048" : "#48B084",
      },
    ],
    [viewMode],
  );

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <div className="border-b border-[#D8D8D8] pb-4 mb-6">
          <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
            Clinical & Facility Framework
          </h2>
          <p className="text-[12px] text-[#4C4A4B] font-medium mt-1">
            Proposed function room breakdown for an optimal oncology-focused
            hospital model.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Radiotherapy & Diagnostic Imaging */}
          <BentoBox
            colSpan="md:col-span-12 lg:col-span-7"
            className="bg-white border-[#D8D8D8]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-[#1C6048]" size={24} />
              <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                Radiotherapy & Diagnostic Imaging
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">LINAC Bunkers</p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  Standard 2-bunker initial rollout with provision for future
                  expansion. Core engine of the facility's revenue.
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">PET-CT Suite</p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  Dedicated diagnostic room for precise oncology staging.
                  Requires dedicated hot-lab and patient resting area.
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">
                  MRI & CT Simulator
                </p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  1.5T to 3T MRI unit along with CT Simulator for precise
                  radiation planning.
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">
                  General Imaging
                </p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  Digital X-Ray, Mammography, and Ultrasound suites
                  complementing core diagnostics.
                </p>
              </div>
            </div>
          </BentoBox>

          {/* Chemotherapy & Outpatient */}
          <BentoBox
            colSpan="md:col-span-12 lg:col-span-5"
            className="!bg-[#EFEBE7] border-transparent"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-[#9B8B70]" size={24} />
              <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                Outpatient & Day Care
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8]">
                <div className="w-8 h-8 rounded-full bg-[#1C6048]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1C6048] font-bold text-xs">A</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2F31] text-sm mb-1">
                    Chemotherapy Day Care
                  </h4>
                  <p className="text-xs text-[#4C4A4B] font-medium">
                    15-20 infusion chairs with a mix of open bays and private
                    isolation rooms for comfort and infection control.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8]">
                <div className="w-8 h-8 rounded-full bg-[#1C6048]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1C6048] font-bold text-xs">B</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2F31] text-sm mb-1">
                    Oncology Consult Clinics
                  </h4>
                  <p className="text-xs text-[#4C4A4B] font-medium">
                    10-15 consultation rooms optimized for fast turnaround,
                    bundled with integrated minor procedure rooms.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8]">
                <div className="w-8 h-8 rounded-full bg-[#1C6048]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1C6048] font-bold text-xs">C</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2F31] text-sm mb-1">
                    Palliative & Pain Mgmt
                  </h4>
                  <p className="text-xs text-[#4C4A4B] font-medium">
                    Dedicated outpatient unit focused on quality of life and
                    symptomatic relief.
                  </p>
                </div>
              </li>
            </ul>
          </BentoBox>

          {/* Inpatient & Surgical */}
          <BentoBox
            colSpan="md:col-span-12"
            className="!bg-[#1E2F31] !text-white border-transparent py-8"
          >
            <div className="flex flex-col xl:flex-row justify-between items-center mb-8 px-4 lg:px-8 gap-4">
              <h2 className="text-xl font-black tracking-tight text-white mb-0 text-center xl:text-left">
                Inpatient, Surgical, & Critical Care Architecture
              </h2>
              <div className="flex bg-[#121E20] p-1 rounded-lg border border-white/10 shrink-0 mx-auto xl:mx-0">
                <button
                  onClick={() => setViewMode("moh")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors border outline-none focus:outline-none ${viewMode === "moh" ? "bg-[#1C6048] border-[#1C6048] text-white shadow-sm" : "border-transparent text-white/50 hover:text-white"}`}
                >
                  MoH Regulatory Requirement
                </button>
                <button
                  onClick={() => setViewMode("private")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors border outline-none focus:outline-none ${viewMode === "private" ? "bg-[#9B8B70] border-[#9B8B70] text-white shadow-sm" : "border-transparent text-white/50 hover:text-white"}`}
                >
                  Private Hospital Optimization
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 lg:px-8">
              {/* Chart Column (Span 3) */}
              <div className="lg:col-span-3 flex flex-col justify-center items-center lg:border-r border-white/20 pb-6 lg:pb-0 lg:pr-6 border-b lg:border-b-0">
                <div className="h-40 w-full relative flex items-center justify-center">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">120</span>
                    <span className="text-[10px] font-bold text-white/60 -mt-1 uppercase tracking-widest">
                      Beds
                    </span>
                  </div>
                </div>
              </div>

              {/* Wards Column (Span 4) */}
              <div className="lg:col-span-4 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-l-2 border-[#1C6048] pl-3">
                  Inpatient Wards (108)
                </h3>
                <ul className="text-xs space-y-3 text-white/80 list-none pl-1">
                  <li className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 transition-colors duration-500 ${viewMode === "private" ? "bg-[#4C4A4B]" : "bg-[#9B8B70]"}`}
                    />
                    <div className="flex-1">
                      <strong className="text-white">Standard (KRIS)</strong>:
                      48 Beds
                      <p
                        className={`text-[10px] min-h-[32px] leading-tight mt-0.5 transition-colors duration-300 ${viewMode === "private" ? "text-white/60" : "text-white/50"}`}
                      >
                        {viewMode === "moh"
                          ? "Min 40% of total beds per MoH requirement"
                          : "High-volume absorption to capture initial patient funnel"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 transition-colors duration-500 ${viewMode === "private" ? "bg-[#9B8B70]" : "bg-[#99B6AA]"}`}
                    />
                    <div className="flex-1">
                      <strong className="text-white">
                        Premium (VIP / VVIP)
                      </strong>
                      : 48 Beds
                      <p
                        className={`text-[10px] min-h-[32px] leading-tight mt-0.5 transition-colors duration-300 ${viewMode === "private" ? "text-[#9B8B70] font-bold" : "text-white/50"}`}
                      >
                        {viewMode === "moh"
                          ? "Remaining allocation for commercial & private stays"
                          : "High-margin core driver for luxury tourism & corporate retreats"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 shadow-[0_0_4px_rgba(255,255,255,0.5)] transition-colors duration-500 ${viewMode === "private" ? "bg-[#D8D8D8]" : "bg-[#FFFFFF]"}`}
                    />
                    <div className="flex-1">
                      <strong className="text-white">Isolation</strong>: 12 Beds
                      <p className="text-[10px] min-h-[32px] text-white/50 leading-tight mt-0.5">
                        {viewMode === "moh"
                          ? "Min 10% of total beds per MoH requirement"
                          : "Specialized infection control shielding broader hospital assets"}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* ICU Column (Span 2) */}
              <div className="lg:col-span-2 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-l-2 border-[#48B084] pl-3">
                  ICU (12)
                </h3>
                <div className="flex items-start gap-2 pl-1 w-full">
                  <div
                    className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 shadow-[0_0_8px_rgba(72,176,132,0.6)] transition-colors duration-500 ${viewMode === "private" ? "bg-[#1C6048]" : "bg-[#48B084]"}`}
                  />
                  <div className="w-full">
                    <p
                      className={`text-[10px] min-h-[28px] font-bold mb-2 transition-colors duration-300 ${viewMode === "private" ? "text-[#48B084]" : "text-[#48B084]"}`}
                    >
                      {viewMode === "moh"
                        ? "Meets MoH minimum 8%"
                        : "High-margin intensive revenue center"}
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-white/80 w-full">
                      <li className="flex justify-between border-b border-white/10 pb-1">
                        <span>General:</span>
                        <b className="text-white">6</b>
                      </li>
                      <li className="flex justify-between border-b border-white/10 pb-1">
                        <span>HCU:</span>
                        <b className="text-white">4</b>
                      </li>
                      <li className="flex justify-between">
                        <span>Isolation:</span>
                        <b className="text-white">2</b>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* OTs Column (Span 3) */}
              <div className="lg:col-span-3 flex flex-col lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-6 border-t lg:border-t-0 mt-2 lg:mt-0">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider border-l-2 border-[#9B8B70] pl-3">
                  Operating Theaters
                </h3>
                <p className="text-[11px] text-white/70 font-medium leading-relaxed mb-3">
                  Target: 3-4 Major OTs.
                </p>
                <ul className="text-[11px] space-y-2 text-white/80 list-disc pl-4">
                  <li>Oncology/General Surgery OT</li>
                  <li>Minimally Invasive / Endoscopy Suite</li>
                  <li>Recovery / PACU (5-6 beds)</li>
                  <li>Central Sterile Services Dept (CSSD)</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 px-4 lg:px-8 text-[10px] text-white/40 border-t border-white/10 pt-4 flex items-center justify-center lg:justify-start">
              <span>* MoH (Ministry of Health)</span>
            </div>
          </BentoBox>
        </div>
      </div>
    </div>
  );
});

const OperationDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    isPresenting,
  }) => (
    <div
      className={
        isPresenting
          ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
          : "space-y-6 animate-in fade-in"
      }
    >
      {/* LEFT PANEL: Executive & Returns (Spans 4 columns in Present Mode) */}
      <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
            Executive Overview
          </h2>
          <button
            onClick={generateTeaser}
            disabled={isTeaserLoading}
            className="bg-[#1C6048] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isTeaserLoading ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            ✨ Pitch Teaser
          </button>
        </div>

        {showTeaser && (
          <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#1C6048] shadow-sm relative">
            <button
              onClick={() => setShowTeaser(false)}
              className="absolute top-4 right-4 bg-[#EFEBE7] p-1 rounded-full"
            >
              <X size={16} />
            </button>
            <h3 className="font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
              <FileText size={18} /> AI Pitch Teaser
            </h3>
            <MarkdownRenderer content={teaserContent} />
          </div>
        )}

        <div
          className={`grid grid-cols-2 ${isPresenting ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-4`}
        >
          <KPICard
            title="Project NPV"
            value={formatCurrency(data.projectNPV)}
            icon={<TrendingUp size={18} />}
            color="blue"
            subtitle={`@${String(assumptions.discountRate)}% Disc Rate`}
          />
          <KPICard
            title="Cash Multiple"
            value={`${data.totalEquity > 0 ? (data.totals.fcf / data.totalEquity).toFixed(2) : "0"}x`}
            icon={<BarChart3 size={18} />}
            color="emerald"
            subtitle="Project MOIC"
            tooltip={{
              desc: "Indicates absolute wealth creation. While IRR measures compounding speed over time, the Cash Multiple (MOIC) shows the absolute magnitude of your cash return. A typical healthcare infrastructure target is 2.5x - 3.0x+.",
              formula:
                "Total Project Free Cash Flow ÷ Cumulative Partner Equity Invested",
            }}
          />
          <KPICard
            title="Project IRR"
            value={`${formatNumber((data.projectIRR || 0) * 100, 2)}%`}
            icon={<Activity size={18} />}
            color="blue"
            subtitle="Compounded Return"
          />
          <KPICard
            title="Avg Div. Yield"
            value={`${formatNumber(data.partnerA.avgYield, 1)}%`}
            icon={<Coins size={18} />}
            color="indigo"
            subtitle="Mean Operating Yield"
            tooltip={{
              desc: "The average annual cash distribution yield. It acts as the steady engine driving the overall Cash Multiple over the asset's lifecycle.",
              formula:
                "Average of (Annual Cash Flow ÷ Invested Equity) across operating years",
            }}
          />
        </div>

        <div
          className={`grid grid-cols-1 ${isPresenting ? "lg:grid-cols-1" : "lg:grid-cols-2"} gap-6`}
        >
          <PartnerReturnCard
            name={`Strategic Partner (${assumptions.sharingPercentA}%)`}
            metrics={data.partnerA}
            equity={assumptions.partnerAEquity}
            share={assumptions.sharingPercentA}
            color="blue"
          />
          <PartnerReturnCard
            name={`Vasanta (${100 - assumptions.sharingPercentA}%)`}
            metrics={data.partnerB}
            equity={assumptions.partnerBEquity}
            share={100 - assumptions.sharingPercentA}
            color="indigo"
          />
        </div>
      </div>

      {/* RIGHT PANEL: Operations & Trajectory (Spans 8 columns in Present Mode) */}
      <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniKPICard
            title="Stabilized Vol."
            value={`${formatNumber(data.opsMetrics.stabilizedVolume, 0)}`}
            subtitle="Peak Yr Patients"
          />
          <MiniKPICard
            title="Rev. Per Bed"
            value={`${formatNumber(data.opsMetrics.revPab, 1)} B`}
            subtitle="At Stabilization"
          />
          <MiniKPICard
            title="EBITDA Per Bed"
            value={`${formatNumber(data.opsMetrics.ebitdaPerBed, 1)} B`}
            subtitle="At Stabilization"
          />
          <MiniKPICard
            title="Fixed Cost Ratio"
            value={`${formatNumber(data.opsMetrics.fixedCostPct, 1)}%`}
            subtitle="At Stabilization"
          />
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#1C6048]" /> Operating Cash
            Flow Trajectory
          </h3>
          <div className={isPresenting ? "h-[300px]" : "h-72"}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.operatingData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#D8D8D8"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#1E2F31" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val, name) =>
                    formatNumber(val, 1) +
                    (name === "Occupancy (BOR)" ? "%" : "B")
                  }
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  dataKey="totalRev"
                  name="Net Revenue"
                  fill="#1C6048"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ebitda"
                  name="EBITDA"
                  stroke="#1E2F31"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1E2F31",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netIncome"
                  name="Net Income"
                  stroke="#9B8B70"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#9B8B70",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bor"
                  name="Occupancy (BOR)"
                  stroke="#99B6AA"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
              <Activity size={18} className="text-[#1E2F31]" /> Cash-on-Cash
              Trajectory
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.operatingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => formatNumber(val, 1) + "%"}
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="pA_Yield"
                    name="Strategic Ptnr Yield"
                    stroke="#1C6048"
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="roe"
                    name="Project ROE"
                    stroke="#9B8B70"
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
              <Target size={18} className="text-[#99B6AA]" /> Breakeven Audit
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.operatingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => formatNumber(val, 1) + "%"}
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
                  <Bar
                    dataKey="breakEvenBor"
                    name="Breakeven BOR required"
                    fill="#D8D8D8"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="bor"
                    name="Actual Projected BOR"
                    stroke="#1E2F31"
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
);

const OperationCascadeView = memo(
  ({ data, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.monthlyData || data.annualData || [],
      viewResolution,
    );
    const scrollRef = React.useRef(null);
    const [showSetupBudget, setShowSetupBudget] = React.useState(true);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("all");

    const overallSetup = (data.totals?.recurringOpex || 0) * 0.2; // mock display

    return (
      <div
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showSetupBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showSetupBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Briefcase size={18} className="text-[#1C6048]" /> OpCo Setup
                  Budget
                </h3>
                <button
                  onClick={() => setShowSetupBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="mt-1.5 p-2 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8] shrink-0">
                <div className="text-[8.5px] text-[#4C4A4B] leading-relaxed space-y-1">
                  <p>Operating Setup Costs details.</p>
                </div>
              </div>
            </div>
          )}

          <div
            className={`${showSetupBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-320px)]"} flex flex-col`}
          >
            <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> OpCo P&L & Cash Flow
                {!showSetupBudget && (
                  <button
                    onClick={() => setShowSetupBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Setup Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    CF
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#9B8B70] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronLeft size={13} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="overflow-auto min-h-0 flex-1">
              <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
                  <tr>
                    <th className="px-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-[#EFEBE7] z-[60] w-[260px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
                      Line Item
                    </th>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        onClick={
                          col.colType === "year"
                            ? () => toggleYear(col.defaultLabel)
                            : undefined
                        }
                        className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${col.colType === "year" ? "cursor-pointer hover:bg-white font-black underline decoration-dashed underline-offset-4 " : "font-medium text-[10px] "} bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
                      >
                        {col.colType === "year" ? (
                          <div className="flex items-center justify-end gap-1">
                            {expandedYears[col.defaultLabel] ? "-" : "+"}
                            {String(col.defaultLabel)}
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            {String(col.defaultLabel)}
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right bg-[#EFEBE7] text-[#1E2F31] sticky right-0 top-0 z-[60] border-l border-b-2 border-[#D8D8D8] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewMode === "all" || viewMode === "pl") && (
                    <>
                      <TableSection
                        title="A. Operating Volume"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Bed Occupancy Rate (BOR)"
                        data={columns}
                        dk="bor"
                      />
                      <TableRow
                        label="Inpatient Cases"
                        data={columns}
                        dk="ipCases"
                      />
                      <TableRow
                        label="Outpatient Visits"
                        data={columns}
                        dk="opVisits"
                      />

                      <TableSection
                        title="B. Revenue"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Inpatient Revenue"
                        data={columns}
                        dk="ipRev"
                        total={data.totals?.ipRev}
                        isIndent
                      />
                      <TableRow
                        label="Outpatient Revenue"
                        data={columns}
                        dk="opRev"
                        total={data.totals?.opRev}
                        isIndent
                      />
                      <TableRow
                        label="NET REVENUE"
                        data={columns}
                        dk="totalRev"
                        total={data.totals?.totalRev}
                        highlight
                      />

                      <TableSection
                        title="C. Cost of Goods Sold"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Medical Supplies"
                        data={columns}
                        dk="totalMedSupp"
                        total={data.totals?.totalMedSupp}
                        isIndent
                      />
                      <TableRow
                        label="Doctor Fees"
                        data={columns}
                        dk="totalDocFee"
                        total={data.totals?.totalDocFee}
                        isIndent
                      />
                      <TableRow
                        label="GROSS PROFIT"
                        data={columns}
                        dk="grossProfit"
                        total={data.totals?.grossProfit}
                        highlight
                      />

                      <TableSection
                        title="D. Operating Expenses"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Staffing & Labor"
                        data={columns}
                        dk="staffCost"
                        isIndent
                      />
                      <TableRow
                        label="Other OpEx"
                        data={columns}
                        dk="recurringOpex"
                        total={data.totals?.recurringOpex}
                        isIndent
                      />
                      <TableRow
                        label="EBITDAR"
                        data={columns}
                        dk="ebitdar"
                        total={data.totals?.ebitdar}
                        highlight
                      />

                      <TableSection
                        title="E. Rent & Taxes"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Building Rental"
                        data={columns}
                        dk="rent"
                        total={data.totals?.rent}
                        isIndent
                      />
                      <TableRow
                        label="EBITDA"
                        data={columns}
                        dk="ebitda"
                        total={data.totals?.ebitda}
                        highlight
                      />
                      <TableRow
                        label="Corporate Tax"
                        data={columns}
                        dk="tax"
                        total={data.totals?.tax}
                        isIndent
                      />
                      <TableRow
                        label="NET INCOME"
                        data={columns}
                        dk="netIncome"
                        total={data.totals?.netIncome}
                        highlight
                        emerald
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "cf") && (
                    <>
                      <TableSection
                        title="F. Free Cash Flow & Retained Earnings"
                        colSpan={columns.length + 2}
                        type="emerald"
                      />
                      <TableRow
                        label="Cumulative Net Income"
                        data={columns}
                        dk="cumNI"
                        highlight
                        crossover
                        bold
                        indigo
                      />
                      <TableRow
                        label="Distributable Profit"
                        data={columns}
                        dk="distributableProfit"
                        total={data.totals?.distributableProfit}
                        highlight
                      />
                      <TableRow
                        label="Retained Earnings"
                        data={columns}
                        dk="retainedThisYear"
                        total={data.totals?.retainedThisYear}
                        isIndent
                      />
                      <TableRow
                        label="Cumulative Retained Cash"
                        data={columns}
                        dk="cumulativeRetainedEarnings"
                        highlight
                        crossover
                        bold
                        indigo
                      />

                      <TableSection
                        title="G. Terminal Value (Exit)"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="OpCo Enterprise Value (EV)"
                        data={columns}
                        dk="ev"
                        total={data.totals?.ev}
                        highlight
                      />
                      <TableRow
                        label="+ Retained Cash Sweep"
                        data={columns}
                        dk="cumulativeRetainedEarnings"
                        total={data.totals?.retainedThisYear}
                        isIndent
                      />
                      <TableRow
                        label="Total Exit Equity Value"
                        data={columns}
                        dk="opCoExit"
                        total={data.totals?.opCoExit}
                        highlight
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const AssetDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    setTab,
    isPresenting,
  }) => {
    const pieData = useMemo(
      () => [
        { name: "Equity", value: data.metrics.totalEquity },
        { name: "Bank Loan", value: data.metrics.totalDebt },
      ],
      [data.metrics.totalEquity, data.metrics.totalDebt],
    );

    const [chartMode, setChartMode] = useState("full");
    const chartData =
      chartMode === "full" ? data.monthlyData : data.operatingData;
    const devYears = Math.max(
      1,
      Math.ceil((assumptions.devDurationMonths || 12) / 12),
    );

    return (
      <div
        className={
          isPresenting
            ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
            : "space-y-6 animate-in fade-in"
        }
      >
        <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
              Asset Executive Summary
            </h2>
            <button
              onClick={generateTeaser}
              disabled={isTeaserLoading}
              className="bg-[#9B8B70] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isTeaserLoading ? (
                <RefreshCcw size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              ✨ Pitch Teaser
            </button>
          </div>

          {showTeaser && (
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#9B8B70] shadow-sm relative">
              <button
                onClick={() => setShowTeaser(false)}
                className="absolute top-4 right-4 bg-[#EFEBE7] p-1 rounded-full"
              >
                <X size={16} />
              </button>
              <h3 className="font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
                <FileText size={18} /> AI Pitch Teaser
              </h3>
              <MarkdownRenderer content={teaserContent} />
            </div>
          )}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${isPresenting ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-4`}
          >
            <DualKPICard
              title1="Levered IRR"
              value1={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
              color1="indigo"
              title2="Equity NPV"
              value2={formatCurrency(data.metrics.npv)}
              color2="emerald"
              icon={<Activity size={18} />}
            />
            <DualKPICard
              title1="Unlevered IRR"
              value1={`${formatNumber((data.metrics.unleveredIrr || 0) * 100, 2)}%`}
              color1="emerald"
              title2="Project NPV"
              value2={formatCurrency(data.metrics.unleveredNpv)}
              color2="blue"
              icon={<Building2 size={18} />}
            />
            <DualKPICard
              title1="IRR (ex-Land)"
              value1={`${formatNumber((data.metrics.irrExLand || 0) * 100, 2)}%`}
              color1="blue"
              title2="NPV (ex-Land)"
              value2={formatCurrency(data.metrics.npvExLand)}
              color2="teal"
              icon={<TrendingUp size={18} />}
            />
            <DualKPICard
              title1="Avg Cash Yield"
              value1={`${formatNumber(data.metrics.avgYield, 1)}%`}
              color1="teal"
              tooltip1={{
                desc: "The average annual cash distribution yield generated from asset operations, reflecting the stable income generation capacity of the standalone infrastructure.",
                formula:
                  "Average of (Annual Operating FCFE ÷ Total Asset Equity) across operating years",
              }}
              title2="YOC (ex-Land)"
              value2={`${formatNumber((data.metrics.yocExLand || 0) * 100, 1)}%`}
              color2="amber"
              icon={<Coins size={18} />}
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2">
                <DollarSign size={20} className="text-[#1C6048]" /> Sources &
                Uses of Funds
              </h3>
              <button
                onClick={() => setTab("assumptions")}
                className="text-[10px] bg-[#EFEBE7] hover:bg-[#D8D8D8] text-[#4C4A4B] font-bold px-2 py-1 rounded transition-colors uppercase"
              >
                Edit Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sources Pie */}
              <div>
                <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-2">
                  Sources
                </h4>
                <div
                  className={`w-full relative flex justify-center ${isPresenting ? "h-40" : "h-36"}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: "none" }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        className="outline-none focus:outline-none"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-src-${index}`}
                            fill={index === 0 ? "#1C6048" : "#D8D8D8"}
                            className="outline-none focus:outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-black text-[#1E2F31]">
                      {formatNumber(data.metrics.totalCapex, 0)}B
                    </span>
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="bg-[#EFEBE7] p-2 rounded border border-[#D8D8D8]">
                    <p className="text-[9px] font-bold uppercase text-[#4C4A4B] mb-1">
                      Equity
                    </p>
                    <p className="font-black text-[#1E2F31]">
                      {formatCurrency(data.metrics.totalEquity)}
                    </p>
                  </div>
                  <div className="bg-[#D8D8D8]/30 p-2 rounded border border-[#D8D8D8]">
                    <p className="text-[9px] font-bold uppercase text-[#4C4A4B] mb-1">
                      Loan
                    </p>
                    <p className="font-black text-[#1E2F31]">
                      {formatCurrency(data.metrics.totalDebt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uses Expandable Table */}
              <div>
                <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-4">
                  Uses Breakdown
                </h4>
                <div className="bg-[#F9F8F6] p-2 rounded-xl border border-[#D8D8D8]">
                  <ExpandableCapexRow
                    icon={<Map size={16} className="text-[#9B8B70]" />}
                    title="Land Acquisition"
                    amount={data.capexDetails.landCost}
                    totalCapex={data.metrics.totalCapex}
                  />
                  <ExpandableCapexRow
                    icon={<Building2 size={16} className="text-[#1E2F31]" />}
                    title="Hard Costs"
                    amount={
                      data.capexDetails.buildCost +
                      (data.capexDetails.civilMepCost || 0) +
                      data.capexDetails.ffeCost +
                      data.capexDetails.infraCost +
                      (data.capexDetails.sharingDevCost || 0)
                    }
                    totalCapex={data.metrics.totalCapex}
                    details={[
                      {
                        label: "Glamping Tent",
                        amount: data.capexDetails.buildCost,
                      },
                      data.capexDetails.civilMepCost > 0
                        ? {
                            label: "Glamping Civil & MEP",
                            amount: data.capexDetails.civilMepCost,
                          }
                        : null,
                      {
                        label: "Glamping FF&E / Interiors",
                        amount: data.capexDetails.ffeCost,
                      },
                      {
                        label: "Infrastructure",
                        amount: data.capexDetails.infraCost,
                      },
                      data.capexDetails.sharingDevCost > 0
                        ? {
                            label: "Sharing Development",
                            amount: data.capexDetails.sharingDevCost,
                          }
                        : null,
                    ].filter(
                      (d): d is { label: string; amount: number } =>
                        d !== null && d.amount > 0,
                    )}
                  />
                  {data.capexDetails.medEqCost > 0 && (
                    <ExpandableCapexRow
                      icon={<Utensils size={16} className="text-[#1C6048]" />}
                      title="Ancillary Eq."
                      amount={data.capexDetails.medEqCost}
                      totalCapex={data.metrics.totalCapex}
                    />
                  )}
                  <ExpandableCapexRow
                    icon={<Briefcase size={16} className="text-[#99B6AA]" />}
                    title="Soft Costs"
                    amount={data.capexDetails.totalSoftCosts}
                    totalCapex={data.metrics.totalCapex}
                    details={[
                      {
                        label: "Consulting & Design",
                        amount: data.capexDetails.consultantCost,
                      },
                      {
                        label: "Licenses & Permits",
                        amount: data.capexDetails.licenseCost,
                      },
                      { label: "VAT", amount: data.capexDetails.vatCost },
                      {
                        label: "Contingency",
                        amount: data.capexDetails.contingencyCost,
                      },
                    ].filter((d) => d.amount > 0)}
                  />
                  <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-[#D8D8D8] px-2">
                    <span className="text-[10px] font-black text-[#1E2F31] uppercase tracking-widest">
                      Total Uses (Capex)
                    </span>
                    <span className="font-mono text-sm font-black text-[#1C6048]">
                      {formatNumber(data.metrics.totalCapex, 1)} B
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MiniKPICard
              title="Equity Payback"
              value={`${formatNumber(data.metrics.payback > 0 ? Math.max(0, data.metrics.payback - devYears) : 0, 1)} Yrs`}
              subtitle="From Operations"
            />
            <MiniKPICard
              title="Op. Payback"
              value={`${formatNumber(data.metrics.operatingPayback > 0 ? Math.max(0, data.metrics.operatingPayback - devYears) : 0, 1)} Yrs`}
              subtitle="From Operations"
            />
            <MiniKPICard
              title="Avg DSCR"
              value={`${formatNumber(data.metrics.avgDscr, 2)}x`}
              subtitle="Debt Coverage"
            />
            <MiniKPICard
              title="Min DSCR"
              value={`${formatNumber(data.metrics.minDscr, 2)}x`}
              subtitle="Lowest Coverage"
            />
            <MiniKPICard
              title="Cost per Bed"
              value={`${formatCurrency(data.metrics.costPerBed)}`}
              subtitle="Total / Beds"
            />
            <MiniKPICard
              title="Cost per Sqm"
              value={`${formatNumber(data.metrics.costPerSqm, 1)} M`}
              subtitle="Total / Sqm"
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#9B8B70]" /> Asset Cash
                Flow Trajectory
              </h3>
              <div className="flex bg-[#EFEBE7] p-1 rounded-lg border border-[#D8D8D8]">
                <button
                  onClick={() => setChartMode("full")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "full" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  Full Lifecycle
                </button>
                <button
                  onClick={() => setChartMode("operating")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "operating" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  Operating Only
                </button>
              </div>
            </div>
            <div className={isPresenting ? "h-[450px]" : "h-[400px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#1E2F31" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => formatNumber(val, 1) + "B"}
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                  <Bar
                    yAxisId="left"
                    dataKey="ebitda"
                    name="EBITDA (NOI)"
                    fill="#9B8B70"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="fcfe"
                    name="FCFE"
                    stroke="#1E2F31"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#1E2F31",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumFcfe"
                    name="Cumulative FCFE"
                    stroke="#1C6048"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.clustersData && (
            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h3 className="font-bold text-[#1E2F31] flex items-center gap-2 mb-2 text-sm">
                <Map size={18} className="text-[#9B8B70]" /> Standalone Cluster
                Engines & Consolidation
              </h3>
              <p className="text-[11px] text-[#4C4A4B] mb-4">
                Below are the metrics of each land zoning cluster calculated
                through its standalone financial engine. These individual caches
                consolidated on-the-fly drive the total Asset Master Financial
                model.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7] text-[#1E2F31] font-bold">
                      <th className="px-3 py-2 border border-[#D8D8D8] rounded-tl-lg">
                        Cluster Component
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Land Area (Sqm)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Build Area (Sqm)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Capex (B)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Base Rent Y1 (B)
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right">
                        Levered IRR
                      </th>
                      <th className="px-3 py-2 border border-[#D8D8D8] text-right rounded-tr-lg">
                        Equity NPV
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(data.clustersData).map((name) => {
                      const cluster = data.clustersData[name];
                      const zIdx = LAND_ZONING.findIndex(
                        (z) => z.proportion === name,
                      );
                      const zItem = getZoningItem(zIdx === -1 ? null : zIdx);
                      const color = zItem?.color || "#4C4A4B";
                      return (
                        <tr
                          key={name}
                          className="hover:bg-[#F9F8F6] transition-colors"
                        >
                          <td className="px-3 py-2.5 border border-[#D8D8D8] font-bold text-[#1E2F31] flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            {name}
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-[#1E2F31]">
                            {formatNumber(
                              assumptions.clusters?.[name]?.landArea || 0,
                              0,
                            )}{" "}
                            Sqm
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-[#1E2F31]">
                            {formatNumber(
                              assumptions.clusters?.[name]?.buildArea || 0,
                              0,
                            )}{" "}
                            Sqm
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono font-bold text-[#1C6048]">
                            {formatNumber(cluster.metrics.totalCapex, 1)} B
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-[#9B8B70] font-bold">
                            {formatNumber(
                              assumptions.clusters?.[name]?.manualBaseRent || 0,
                              1,
                            )}{" "}
                            B
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono font-bold text-[#1E2F31] bg-[#1E2F31]/5">
                            {formatNumber((cluster.metrics.irr || 0) * 100, 2)}%
                          </td>
                          <td className="px-3 py-2.5 border border-[#D8D8D8] text-right font-mono text-emerald-800 font-bold bg-emerald-50">
                            {formatCurrency(cluster.metrics.npv)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

const AssetCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.monthlyData || data.annualData || [],
      viewResolution,
    );
    const scrollRef = React.useRef(null);
    const [showDevBudget, setShowDevBudget] = React.useState(true);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("all");
    const [isHardCostsExpanded, setIsHardCostsExpanded] = React.useState(true);
    const [isBuildingCostExpanded, setIsBuildingCostExpanded] =
      React.useState(true);
    const [isCascadeHardExpanded, setIsCascadeHardExpanded] =
      React.useState(true);
    const [isCascadeSoftExpanded, setIsCascadeSoftExpanded] =
      React.useState(true);

    return (
      <div
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showDevBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showDevBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Map size={18} className="text-[#1C6048]" /> Development
                  Budget
                </h3>
                <button
                  onClick={() => setShowDevBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const finalTotal =
                        (data.metrics?.totalCapex || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);
                      const finalSoftCosts =
                        (data.capexDetails?.totalSoftCosts || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);
                      return (
                        <>
                          <CapexRow
                            label="Land Cost"
                            amount={data.capexDetails?.landCost || 0}
                            total={finalTotal}
                            isHeader
                          />

                          <CapexRow
                            label="Total Hard Costs"
                            amount={data.capexDetails?.totalHardCosts || 0}
                            total={finalTotal}
                            isHeader
                            isCollapsible
                            isExpanded={isHardCostsExpanded}
                            onToggle={() =>
                              setIsHardCostsExpanded(!isHardCostsExpanded)
                            }
                          />
                          {isHardCostsExpanded && (
                            <>
                              {(() => {
                                const buildCost =
                                  data.capexDetails?.buildCost || 0;
                                const civilMepCost =
                                  data.capexDetails?.civilMepCost || 0;
                                const buildingCost = buildCost + civilMepCost;
                                return (
                                  <>
                                    <CapexRow
                                      label="Building Cost"
                                      amount={buildingCost}
                                      total={finalTotal}
                                      isIndent
                                      isCollapsible
                                      isExpanded={isBuildingCostExpanded}
                                      onToggle={() =>
                                        setIsBuildingCostExpanded(
                                          !isBuildingCostExpanded,
                                        )
                                      }
                                    />
                                    {isBuildingCostExpanded && (
                                      <>
                                        <CapexRow
                                          label="Glamping Tent"
                                          amount={buildCost}
                                          total={finalTotal}
                                          isDoubleIndent
                                        />
                                        {civilMepCost > 0 && (
                                          <CapexRow
                                            label="Glamping Civil & MEP"
                                            amount={civilMepCost}
                                            total={finalTotal}
                                            isDoubleIndent
                                          />
                                        )}
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                              <CapexRow
                                label="Glamping FF&E / Interiors"
                                amount={data.capexDetails?.ffeCost || 0}
                                total={finalTotal}
                                isIndent
                              />
                              <CapexRow
                                label="Infrastructure"
                                amount={data.capexDetails?.infraCost || 0}
                                total={finalTotal}
                                isIndent
                              />
                              {data.capexDetails?.sharingDevCost > 0 && (
                                <CapexRow
                                  label="Sharing Development"
                                  amount={
                                    data.capexDetails?.sharingDevCost || 0
                                  }
                                  total={finalTotal}
                                  isIndent
                                />
                              )}
                              {data.capexDetails?.medEqCost > 0 && (
                                <CapexRow
                                  label="Ancillary Eq."
                                  amount={data.capexDetails?.medEqCost || 0}
                                  total={finalTotal}
                                  isIndent
                                />
                              )}
                            </>
                          )}

                          <CapexRow
                            label="Total Soft Costs"
                            amount={finalSoftCosts}
                            total={finalTotal}
                            isHeader
                          />
                          <CapexRow
                            label="Consultant"
                            amount={data.capexDetails?.consultantCost || 0}
                            total={finalTotal}
                            isIndent
                          />
                          <CapexRow
                            label="License"
                            amount={data.capexDetails?.licenseCost || 0}
                            total={finalTotal}
                            isIndent
                          />
                          {data.capexDetails?.vatCost > 0 && (
                            <CapexRow
                              label="VAT"
                              amount={data.capexDetails?.vatCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {data.capexDetails?.contingencyCost > 0 && (
                            <CapexRow
                              label="Contingency"
                              amount={data.capexDetails?.contingencyCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devGa || 0) > 0 && (
                            <CapexRow
                              label="G&A"
                              amount={data.capexDetails?.devGa || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devCar || 0) > 0 && (
                            <CapexRow
                              label="Dev. CAR Insurance"
                              amount={data.capexDetails?.devCar || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devPreOpening || 0) > 0 && (
                            <CapexRow
                              label="Pre-Opening"
                              amount={data.capexDetails?.devPreOpening || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}

                          <CapexRow
                            label="TOTAL PROPCO INVESTMENT"
                            amount={finalTotal}
                            total={finalTotal}
                            isSubtotal
                          />
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            className={`${showDevBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-320px)]"} flex flex-col`}
          >
            <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> PropCo P&L & Cash Flow
                {!showDevBudget && (
                  <button
                    onClick={() => setShowDevBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Dev Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    CF
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#9B8B70] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronLeft size={13} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="overflow-auto min-h-0 flex-1">
              <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
                  <tr>
                    <th className="px-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-[#EFEBE7] z-[60] w-[260px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
                      Line Item
                    </th>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        onClick={
                          col.colType === "year"
                            ? () => toggleYear(col.defaultLabel)
                            : undefined
                        }
                        className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${col.colType === "year" ? "cursor-pointer hover:bg-white font-black underline decoration-dashed underline-offset-4 " : "font-medium text-[10px] "} bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
                      >
                        {col.colType === "year" ? (
                          <div className="flex items-center justify-end gap-1">
                            {expandedYears[col.defaultLabel] ? "-" : "+"}
                            {String(col.defaultLabel)}
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            {String(col.defaultLabel)}
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right bg-[#EFEBE7] text-[#1E2F31] sticky right-0 top-0 z-[60] border-l border-b-2 border-[#D8D8D8] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewMode === "all" || viewMode === "cf") && (
                    <>
                      <TableSection
                        title="A. Project Development Spending"
                        colSpan={columns.length + 2}
                        type="indigo"
                      />
                      <TableRow
                        label="Land Cost"
                        data={columns}
                        dk="landSpend"
                        total={data.totals?.landSpend}
                        isIndent
                      />
                      <TableRow
                        label="Total Hard Costs"
                        data={columns}
                        dk="hardSpend"
                        total={data.totals?.hardSpend}
                        isIndent
                        isCollapsible
                        isExpanded={isCascadeHardExpanded}
                        onToggle={() =>
                          setIsCascadeHardExpanded(!isCascadeHardExpanded)
                        }
                      />
                      {isCascadeHardExpanded && (
                        <>
                          <TableRow
                            label="Building Cost"
                            data={columns}
                            dk="buildSpend"
                            total={data.totals?.buildSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.eqSpend || 0) > 0 && (
                            <TableRow
                              label="Ancillary Eq."
                              data={columns}
                              dk="eqSpend"
                              total={data.totals?.eqSpend}
                              isDoubleIndent
                            />
                          )}
                          <TableRow
                            label="Glamping FF&E / Interiors"
                            data={columns}
                            dk="ffeSpend"
                            total={data.totals?.ffeSpend}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Infrastructure"
                            data={columns}
                            dk="infraSpend"
                            total={data.totals?.infraSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.sharingSpend || 0) > 0 && (
                            <TableRow
                              label="Sharing Development"
                              data={columns}
                              dk="sharingSpend"
                              total={data.totals?.sharingSpend}
                              isDoubleIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="Total Soft Costs"
                        data={columns}
                        dk="softSpend"
                        total={data.totals?.softSpend}
                        isIndent
                        isCollapsible
                        isExpanded={isCascadeSoftExpanded}
                        onToggle={() =>
                          setIsCascadeSoftExpanded(!isCascadeSoftExpanded)
                        }
                      />
                      {isCascadeSoftExpanded && (
                        <>
                          <TableRow
                            label="Consultant"
                            data={columns}
                            dk="consultantSpend"
                            total={data.totals?.consultantSpend}
                            isDoubleIndent
                          />
                          <TableRow
                            label="License"
                            data={columns}
                            dk="licenseSpend"
                            total={data.totals?.licenseSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.vatSpend || 0) > 0 && (
                            <TableRow
                              label="VAT"
                              data={columns}
                              dk="vatSpend"
                              total={data.totals?.vatSpend}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.contingencySpend || 0) > 0 && (
                            <TableRow
                              label="Contingency"
                              data={columns}
                              dk="contingencySpend"
                              total={data.totals?.contingencySpend}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.devGa || 0) > 0 && (
                            <TableRow
                              label="G&A"
                              data={columns}
                              dk="devGa"
                              total={data.totals?.devGa}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.devCar || 0) > 0 && (
                            <TableRow
                              label="Dev. CAR Insurance"
                              data={columns}
                              dk="devCar"
                              total={data.totals?.devCar}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.devPreOpening || 0) > 0 && (
                            <TableRow
                              label="Pre-Opening"
                              data={columns}
                              dk="devPreOpening"
                              total={data.totals?.devPreOpening}
                              isDoubleIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="PROJECT DEVELOPMENT SPEND"
                        data={columns}
                        dk="totalSpend"
                        total={data.totals?.totalSpend}
                        highlight
                      />
                      <TableRow
                        label="Debt Drawdown"
                        data={columns}
                        dk="debtDraw"
                        total={data.totals?.debtDraw}
                        isIndent
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "pl") && (
                    <>
                      <TableSection
                        title="B. Operating Revenue & Expense"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Rental Revenue"
                        data={columns}
                        dk="revenue"
                        total={data.totals?.revenue}
                      />
                      <TableRow
                        label="Maintenance OpEx"
                        data={columns}
                        dk="maintOpex"
                        total={data.totals?.maintOpex}
                        isIndent
                      />
                      <TableRow
                        label="Property Taxes"
                        data={columns}
                        dk="taxOpex"
                        total={data.totals?.taxOpex}
                        isIndent
                      />
                      <TableRow
                        label="EBITDA (NOI)"
                        data={columns}
                        dk="ebitda"
                        total={data.totals?.ebitda}
                        highlight
                      />
                    </>
                  )}

                  {(viewMode === "all" ||
                    viewMode === "pl" ||
                    viewMode === "cf") && (
                    <>
                      <TableSection
                        title="C. Debt Service & Taxes"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Interest Expense"
                        data={columns}
                        dk="interest"
                        total={data.totals?.interest}
                        isIndent
                      />
                      <TableRow
                        label="Principal Repayment"
                        data={columns}
                        dk="principal"
                        total={data.totals?.principal}
                        isIndent
                      />
                      <TableRow
                        label="Earnings Before Tax (EBT)"
                        data={columns}
                        dk="ebt"
                        total={data.totals?.ebt}
                        highlight
                      />
                      <TableRow
                        label="Corporate Tax"
                        data={columns}
                        dk="corpTax"
                        total={data.totals?.corpTax}
                        isIndent
                      />
                      <TableRow
                        label="NET INCOME"
                        data={columns}
                        dk="netIncome"
                        total={data.totals?.netIncome}
                        highlight
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "cf") && (
                    <>
                      <TableSection
                        title="D. Return Metrics"
                        colSpan={columns.length + 2}
                        type="emerald"
                      />
                      <TableRow
                        label="Net Exit Proceeds"
                        data={columns}
                        dk="netExitProceeds"
                        total={data.totals?.netExitProceeds}
                        highlight
                      />
                      <TableRow
                        label="FCFE (Levered)"
                        data={columns}
                        dk="fcfe"
                        highlight
                        emerald
                        total={data.totals?.fcfe}
                      />
                      <TableRow
                        label="Cumulative FCFE"
                        data={columns}
                        dk="cumFcfe"
                        highlight
                        crossover
                        bold
                        indigo
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const ConsolidatedDashboardView = memo(
  ({
    data,
    operationAssumptions,
    assetAssumptions,
    handleAssetChange,
    isPresenting,
    consolidatedScenario,
    setConsolidatedScenario,
  }) => (
    <div
      className={
        isPresenting
          ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
          : "space-y-6 animate-in fade-in"
      }
    >
      <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
              <Target size={16} className="text-[#1C6048]" /> Master Exit
              Strategy
            </h3>
            <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
              Override individual entity settings to simulate master portfolio
              exits and visualize long-term holding yields.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <button
              onClick={() => setConsolidatedScenario("manual")}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "manual" ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
            >
              Manual (Settings)
            </button>
            <button
              onClick={() => setConsolidatedScenario("yr10")}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "yr10" ? "bg-[#1E2F31] shadow-sm border border-[#1E2F31] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
            >
              Exit in Yr 10
            </button>
            <button
              onClick={() => setConsolidatedScenario("breakeven")}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "breakeven" ? "bg-[#1C6048] shadow-sm border border-[#1C6048] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
            >
              Exit at Breakeven
            </button>
            <button
              onClick={() => setConsolidatedScenario("debt_free")}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "debt_free" ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
            >
              Exit Post-Debt
            </button>
            <button
              onClick={() => setConsolidatedScenario("none")}
              className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${consolidatedScenario === "none" ? "bg-white shadow-sm border border-[#1C6048] text-[#1C6048]" : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
            >
              No Exit (Yield)
            </button>
          </div>
          <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-[#D8D8D8]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt
                Financing (Asset Level)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={assetAssumptions?.includeFinancing || false}
                  onChange={(e) =>
                    handleAssetChange("includeFinancing", e.target.checked)
                  }
                />
                <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                <Map size={14} className="text-[#9B8B70]" /> Include Land Cost
                (Asset Level)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={assetAssumptions?.includeLand ?? true}
                  onChange={(e) =>
                    handleAssetChange("includeLand", e.target.checked)
                  }
                />
                <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-4`}>
          <KPICard
            title="Blended Equity NPV"
            value={formatCurrency(data.metrics.npv)}
            icon={<TrendingUp size={18} />}
            color="emerald"
            subtitle={`@${String(operationAssumptions.consolidatedDiscountRate)}% Disc Rate`}
          />
          <KPICard
            title="Blended Cash Multiple"
            value={`${formatNumber(data.metrics.moic, 2)}x`}
            icon={<BarChart3 size={18} />}
            color="blue"
            subtitle="Consolidated MOIC"
            tooltip={{
              desc: "Consolidated MOIC representing the aggregate wealth creation for the entire Group. It combines both the Strategic Hospital Operator and Financial Partner cash profiles into a single unified multiple.",
              formula:
                "Total Consolidated Distributions ÷ Cumulative Equity Contribution",
            }}
          />
          <KPICard
            title="Blended Equity IRR"
            value={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
            icon={<Activity size={18} />}
            color="emerald"
            subtitle="Compounded Return"
          />
          <KPICard
            title="Blended Payback"
            value={`${formatNumber(data.metrics.payback, 2)} Yrs`}
            icon={<Clock size={18} />}
            color="indigo"
            subtitle="From Year 1"
          />
          <KPICard
            title="Project Avg Net Margin"
            value={`${formatNumber(data.totals.lookThroughMargin, 1)}%`}
            icon={<PieChartIcon size={18} />}
            color="blue"
            subtitle="Across 12-Year Lifecycle"
          />
          <KPICard
            title="Consolidated DSCR"
            value={`${formatNumber(data.metrics.avgConsolidatedDscr, 2)}x`}
            icon={<ShieldCheck size={18} />}
            color="amber"
            subtitle="Consolidated Debt Coverage"
          />
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2 mb-1">
            <Layers size={20} className="text-[#1E2F31]" /> Consolidated Group
            Position
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-medium mb-6">
            Combined position representing 100% of Asset cash flows and 49% of
            Operation operating dividends.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Total Combined Equity Outlay
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.metrics.totalEquity)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Asset Total FCFE (100%)
              </span>
              <span className="font-black text-[#9B8B70]">
                {formatCurrency(data.totals.propCoFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Operation Total Dividends (49%)
              </span>
              <span className="font-black text-[#1C6048]">
                {formatCurrency(data.totals.opCoFlow)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1E2F31] uppercase tracking-wider">
                Net Combined Return
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.totals.netFlow)}
              </span>
            </div>
          </div>
        </div>

        {/* Unified Partnership Split */}
        {data.metrics.partnerA && (
          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h3 className="text-lg font-bold text-[#1E2F31] mb-5 flex items-center gap-2">
              <Users size={20} className="text-[#1C6048]" /> Integrated Capital
              Split
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PartnerReturnCard
                partner="Strategic Partner"
                equity={formatCurrency(data.metrics.partnerA.equity)}
                fcf={formatCurrency(data.metrics.partnerA.fcf)}
                irr={`${formatNumber((data.metrics.partnerA.irr || 0) * 100, 1)}%`}
                yield={`${formatNumber(data.metrics.partnerA.avgYield || 0, 1)}%`}
                share={`${data.metrics.partnerA.share}%`}
                color="indigo"
              />
              <PartnerReturnCard
                partner="Vasanta (GP)"
                equity={formatCurrency(data.metrics.partnerB.equity)}
                fcf={formatCurrency(data.metrics.partnerB.fcf)}
                irr={`${formatNumber((data.metrics.partnerB.irr || 0) * 100, 1)}%`}
                yield={`${formatNumber(data.metrics.partnerB.avgYield || 0, 1)}%`}
                share={`${data.metrics.partnerB.share}%`}
                color="emerald"
              />
            </div>
          </div>
        )}
      </div>

      <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#99B6AA]" /> Managerial
            Look-Through PnL
          </h3>
          <div className={isPresenting ? "h-[300px]" : "h-72"}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.operatingData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#D8D8D8"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#1E2F31" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val, name) =>
                    formatNumber(val, 1) + (name.includes("Margin") ? "%" : "B")
                  }
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  dataKey="lookThroughRevenue"
                  name="Look-Through Revenue"
                  fill="#EFEBE7"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  dataKey="lookThroughEbitda"
                  name="Look-Through EBITDA"
                  fill="#9B8B70"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lookThroughMargin"
                  name="Net Profit Margin"
                  stroke="#1C6048"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1C6048",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#1E2F31]" /> Consolidated Cash
            Flow Trajectory
          </h3>
          <div className={isPresenting ? "h-[450px]" : "h-80"}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#D8D8D8"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#1E2F31" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val) => formatNumber(val, 1) + "B"}
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="propCoFlow"
                  name="Asset FCFE"
                  fill="#9B8B70"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoOperatingFlow"
                  name="Operation Dividend (49%)"
                  fill="#1C6048"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoExitFlow"
                  name="Operation Exit (49%)"
                  fill="#99B6AA"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumCf"
                  name="Cumulative Net Position"
                  stroke="#1E2F31"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1E2F31",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={0}
                  stroke="#D8D8D8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  ),
);

const ConsolidatedCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.monthlyData || data.annualData || [],
      viewResolution,
    );
    const scrollRef = React.useRef(null);
    const [showDevBudget, setShowDevBudget] = React.useState(true);
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [viewMode, setViewMode] = React.useState("all");
    const [isHardCostsExpanded, setIsHardCostsExpanded] = React.useState(true);
    const [isBuildingCostExpanded, setIsBuildingCostExpanded] =
      React.useState(true);
    const [isConsCascadeHardExpanded, setIsConsCascadeHardExpanded] =
      React.useState(true);
    const [isConsCascadeSoftExpanded, setIsConsCascadeSoftExpanded] =
      React.useState(true);

    return (
      <div
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showDevBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showDevBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Map size={18} className="text-[#1C6048]" /> Consolidated
                  Development
                </h3>
                <button
                  onClick={() => setShowDevBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const finalTotal =
                        (data.metrics?.totalCapex || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);
                      const finalSoftCosts =
                        (data.capexDetails?.totalSoftCosts || 0) +
                        (data.capexDetails?.devGa || 0) +
                        (data.capexDetails?.devCar || 0) +
                        (data.capexDetails?.devPreOpening || 0);
                      return (
                        <>
                          <CapexRow
                            label="Land Cost"
                            amount={data.capexDetails?.landCost || 0}
                            total={finalTotal}
                            isHeader
                          />

                          <CapexRow
                            label="Total Hard Costs"
                            amount={data.capexDetails?.totalHardCosts || 0}
                            total={finalTotal}
                            isHeader
                            isCollapsible
                            isExpanded={isHardCostsExpanded}
                            onToggle={() =>
                              setIsHardCostsExpanded(!isHardCostsExpanded)
                            }
                          />
                          {isHardCostsExpanded && (
                            <>
                              {(() => {
                                const buildCost =
                                  data.capexDetails?.buildCost || 0;
                                const civilMepCost =
                                  data.capexDetails?.civilMepCost || 0;
                                const buildingCost = buildCost + civilMepCost;
                                return (
                                  <>
                                    <CapexRow
                                      label="Building Cost"
                                      amount={buildingCost}
                                      total={finalTotal}
                                      isIndent
                                      isCollapsible
                                      isExpanded={isBuildingCostExpanded}
                                      onToggle={() =>
                                        setIsBuildingCostExpanded(
                                          !isBuildingCostExpanded,
                                        )
                                      }
                                    />
                                    {isBuildingCostExpanded && (
                                      <>
                                        <CapexRow
                                          label="Glamping Tent"
                                          amount={buildCost}
                                          total={finalTotal}
                                          isDoubleIndent
                                        />
                                        {civilMepCost > 0 && (
                                          <CapexRow
                                            label="Glamping Civil & MEP"
                                            amount={civilMepCost}
                                            total={finalTotal}
                                            isDoubleIndent
                                          />
                                        )}
                                      </>
                                    )}
                                  </>
                                );
                              })()}
                              <CapexRow
                                label="Glamping FF&E / Interiors"
                                amount={data.capexDetails?.ffeCost || 0}
                                total={finalTotal}
                                isIndent
                              />
                              <CapexRow
                                label="Infrastructure"
                                amount={data.capexDetails?.infraCost || 0}
                                total={finalTotal}
                                isIndent
                              />
                              {data.capexDetails?.sharingDevCost > 0 && (
                                <CapexRow
                                  label="Sharing Development"
                                  amount={
                                    data.capexDetails?.sharingDevCost || 0
                                  }
                                  total={finalTotal}
                                  isIndent
                                />
                              )}
                              {data.capexDetails?.medEqCost > 0 && (
                                <CapexRow
                                  label="Ancillary Eq."
                                  amount={data.capexDetails?.medEqCost || 0}
                                  total={finalTotal}
                                  isIndent
                                />
                              )}
                            </>
                          )}

                          <CapexRow
                            label="Total Soft Costs"
                            amount={finalSoftCosts}
                            total={finalTotal}
                            isHeader
                          />
                          <CapexRow
                            label="Consultant"
                            amount={data.capexDetails?.consultantCost || 0}
                            total={finalTotal}
                            isIndent
                          />
                          <CapexRow
                            label="License"
                            amount={data.capexDetails?.licenseCost || 0}
                            total={finalTotal}
                            isIndent
                          />
                          {data.capexDetails?.vatCost > 0 && (
                            <CapexRow
                              label="VAT"
                              amount={data.capexDetails?.vatCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {data.capexDetails?.contingencyCost > 0 && (
                            <CapexRow
                              label="Contingency"
                              amount={data.capexDetails?.contingencyCost || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devGa || 0) > 0 && (
                            <CapexRow
                              label="G&A"
                              amount={data.capexDetails?.devGa || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devCar || 0) > 0 && (
                            <CapexRow
                              label="Dev. CAR Insurance"
                              amount={data.capexDetails?.devCar || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}
                          {(data.capexDetails?.devPreOpening || 0) > 0 && (
                            <CapexRow
                              label="Pre-Opening"
                              amount={data.capexDetails?.devPreOpening || 0}
                              total={finalTotal}
                              isIndent
                            />
                          )}

                          <CapexRow
                            label="TOTAL PROPCO INVESTMENT"
                            amount={finalTotal}
                            total={finalTotal}
                            isSubtotal
                          />
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            className={`${showDevBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-320px)]"} flex flex-col`}
          >
            <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> Consolidated P&L & Cash Flow
                {!showDevBudget && (
                  <button
                    onClick={() => setShowDevBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Dev Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    CF
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#9B8B70] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronLeft size={13} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() =>
                    scrollRef.current?.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    })
                  }
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6]"
                >
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="overflow-auto min-h-0 flex-1">
              <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
                  <tr>
                    <th className="px-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-[#EFEBE7] z-[60] w-[260px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
                      Line Item
                    </th>
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        onClick={
                          col.colType === "year"
                            ? () => toggleYear(col.defaultLabel)
                            : undefined
                        }
                        className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${col.colType === "year" ? "cursor-pointer hover:bg-white font-black underline decoration-dashed underline-offset-4 " : "font-medium text-[10px] "} bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
                      >
                        {col.colType === "year" ? (
                          <div className="flex items-center justify-end gap-1">
                            {expandedYears[col.defaultLabel] ? "-" : "+"}
                            {String(col.defaultLabel)}
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            {String(col.defaultLabel)}
                          </div>
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right bg-[#EFEBE7] text-[#1E2F31] sticky right-0 top-0 z-[60] border-l border-b-2 border-[#D8D8D8] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewMode === "all" || viewMode === "cf") && (
                    <>
                      <TableSection
                        title="A. Project Development Spending"
                        colSpan={columns.length + 2}
                        type="indigo"
                      />
                      <TableRow
                        label="Land Cost"
                        data={columns}
                        dk="landSpend"
                        total={data.totals?.landSpend}
                        isIndent
                      />
                      <TableRow
                        label="Total Hard Costs"
                        data={columns}
                        dk="hardSpend"
                        total={data.totals?.hardSpend}
                        isIndent
                        isCollapsible
                        isExpanded={isConsCascadeHardExpanded}
                        onToggle={() =>
                          setIsConsCascadeHardExpanded(
                            !isConsCascadeHardExpanded,
                          )
                        }
                      />
                      {isConsCascadeHardExpanded && (
                        <>
                          <TableRow
                            label="Building Cost"
                            data={columns}
                            dk="buildSpend"
                            total={data.totals?.buildSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.eqSpend || 0) > 0 && (
                            <TableRow
                              label="Ancillary Eq."
                              data={columns}
                              dk="eqSpend"
                              total={data.totals?.eqSpend}
                              isDoubleIndent
                            />
                          )}
                          <TableRow
                            label="Glamping FF&E / Interiors"
                            data={columns}
                            dk="ffeSpend"
                            total={data.totals?.ffeSpend}
                            isDoubleIndent
                          />
                          <TableRow
                            label="Infrastructure"
                            data={columns}
                            dk="infraSpend"
                            total={data.totals?.infraSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.sharingSpend || 0) > 0 && (
                            <TableRow
                              label="Sharing Development"
                              data={columns}
                              dk="sharingSpend"
                              total={data.totals?.sharingSpend}
                              isDoubleIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="Total Soft Costs"
                        data={columns}
                        dk="softSpend"
                        total={data.totals?.softSpend}
                        isIndent
                        isCollapsible
                        isExpanded={isConsCascadeSoftExpanded}
                        onToggle={() =>
                          setIsConsCascadeSoftExpanded(
                            !isConsCascadeSoftExpanded,
                          )
                        }
                      />
                      {isConsCascadeSoftExpanded && (
                        <>
                          <TableRow
                            label="Consultant"
                            data={columns}
                            dk="consultantSpend"
                            total={data.totals?.consultantSpend}
                            isDoubleIndent
                          />
                          <TableRow
                            label="License"
                            data={columns}
                            dk="licenseSpend"
                            total={data.totals?.licenseSpend}
                            isDoubleIndent
                          />
                          {(data.totals?.vatSpend || 0) > 0 && (
                            <TableRow
                              label="VAT"
                              data={columns}
                              dk="vatSpend"
                              total={data.totals?.vatSpend}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.contingencySpend || 0) > 0 && (
                            <TableRow
                              label="Contingency"
                              data={columns}
                              dk="contingencySpend"
                              total={data.totals?.contingencySpend}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.devGa || 0) > 0 && (
                            <TableRow
                              label="G&A"
                              data={columns}
                              dk="devGa"
                              total={data.totals?.devGa}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.devCar || 0) > 0 && (
                            <TableRow
                              label="Dev. CAR Insurance"
                              data={columns}
                              dk="devCar"
                              total={data.totals?.devCar}
                              isDoubleIndent
                            />
                          )}
                          {(data.totals?.devPreOpening || 0) > 0 && (
                            <TableRow
                              label="Pre-Opening"
                              data={columns}
                              dk="devPreOpening"
                              total={data.totals?.devPreOpening}
                              isDoubleIndent
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="PROJECT DEVELOPMENT SPEND"
                        data={columns}
                        dk="totalSpend"
                        total={data.totals?.totalSpend}
                        highlight
                      />
                      <TableRow
                        label="Debt Drawdown"
                        data={columns}
                        dk="debtDraw"
                        total={data.totals?.debtDraw}
                        isIndent
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "pl") && (
                    <>
                      <TableSection
                        title="B. Operating Revenue & Expense"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Rental Revenue"
                        data={columns}
                        dk="revenue"
                        total={data.totals?.revenue}
                      />
                      <TableRow
                        label="Maintenance OpEx"
                        data={columns}
                        dk="maintOpex"
                        total={data.totals?.maintOpex}
                        isIndent
                      />
                      <TableRow
                        label="Property Taxes"
                        data={columns}
                        dk="taxOpex"
                        total={data.totals?.taxOpex}
                        isIndent
                      />
                      <TableRow
                        label="EBITDA (NOI)"
                        data={columns}
                        dk="ebitda"
                        total={data.totals?.ebitda}
                        highlight
                      />
                    </>
                  )}

                  {(viewMode === "all" ||
                    viewMode === "pl" ||
                    viewMode === "cf") && (
                    <>
                      <TableSection
                        title="C. Debt Service & Taxes"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Interest Expense"
                        data={columns}
                        dk="interest"
                        total={data.totals?.interest}
                        isIndent
                      />
                      <TableRow
                        label="Principal Repayment"
                        data={columns}
                        dk="principal"
                        total={data.totals?.principal}
                        isIndent
                      />
                      <TableRow
                        label="Earnings Before Tax (EBT)"
                        data={columns}
                        dk="ebt"
                        total={data.totals?.ebt}
                        highlight
                      />
                      <TableRow
                        label="Corporate Tax"
                        data={columns}
                        dk="corpTax"
                        total={data.totals?.corpTax}
                        isIndent
                      />
                      <TableRow
                        label="NET INCOME"
                        data={columns}
                        dk="netIncome"
                        total={data.totals?.netIncome}
                        highlight
                      />
                    </>
                  )}

                  {(viewMode === "all" || viewMode === "cf") && (
                    <>
                      <TableSection
                        title="D. Return Metrics"
                        colSpan={columns.length + 2}
                        type="emerald"
                      />
                      <TableRow
                        label="Net Exit Proceeds"
                        data={columns}
                        dk="netExitProceeds"
                        total={data.totals?.netExitProceeds}
                        highlight
                      />
                      <TableRow
                        label="FCFE (Levered)"
                        data={columns}
                        dk="fcfe"
                        highlight
                        emerald
                        total={data.totals?.fcfe}
                      />
                      <TableRow
                        label="Cumulative FCFE"
                        data={columns}
                        dk="cumFcfe"
                        highlight
                        crossover
                        bold
                        indigo
                      />
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const OperationSettingsView = memo(
  ({
    assumptions,
    onChange,
    onSyncEquity,
    onValidate,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    isCloudSync,
    isPresenting,
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-5 lg:p-8 mb-12 text-xs">
      <SettingsHeader
        title="Operation Configuration"
        icon={<Settings className="text-[#1C6048]" />}
        onToggleLock={onToggleLock}
        isLocked={isLocked}
        onSave={onSave}
        saveStatus={saveStatus}
        onReset={onReset}
        onValidate={onValidate}
        isCloudSync={isCloudSync}
      />

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 ${isPresenting ? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}
      >
        <div className="space-y-4">
          <SectionTitle
            title="Inventory & Capacity"
            icon={<Building2 size={16} />}
            color="blue"
          />
          <AssumptionRow
            label="Total Keys"
            val={assumptions.beds}
            set={(v) => onChange("beds", v)}
            unit="Keys"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Avg Length of Stay"
            val={assumptions.alos}
            set={(v) => onChange("alos", v)}
            unit="Days"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="F&B Capture Rate"
            val={assumptions.opIpRatio}
            set={(v) => onChange("opIpRatio", v)}
            unit="%"
            isLocked={isLocked}
            tooltip="Percentage of guests utilizing in-house food and beverage services. Impacts ancillary revenue streams beyond room nights."
          />
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Occupancy & Growth"
            icon={<TrendingUp size={16} />}
            color="emerald"
          />
          <AssumptionRow
            label="Starting Occupancy"
            val={assumptions.borStart}
            set={(v) => onChange("borStart", v)}
            unit="%"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Max Occupancy"
            val={assumptions.borMax}
            set={(v) => onChange("borMax", v)}
            unit="%"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Annual Occ Growth"
            val={assumptions.borIncrement}
            set={(v) => onChange("borIncrement", v)}
            unit="%"
            isLocked={isLocked}
          />
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Revenue Dynamics"
            icon={<Palmtree size={16} />}
            color="indigo"
          />
          <AssumptionRow
            label="Avg Daily Rate (ADR)"
            val={assumptions.ipRevenue}
            set={(v) => onChange("ipRevenue", v)}
            unit="M"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Ancil Rev / Guest"
            val={assumptions.opRevenue}
            set={(v) => onChange("opRevenue", v)}
            unit="M"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Y1-6 Price Incr."
            val={assumptions.priceIncYears1_6}
            set={(v) => onChange("priceIncYears1_6", v)}
            unit="%"
            isLocked={isLocked}
          />
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Operating Costs (COGS)"
            icon={<Utensils size={16} />}
            color="rose"
          />
          <AssumptionRow
            label="Room COGS"
            val={assumptions.ipMedSupply}
            set={(v) => onChange("ipMedSupply", v)}
            unit="M"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Ancillary COGS"
            val={assumptions.opMedSupply}
            set={(v) => onChange("opMedSupply", v)}
            unit="M"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Operator Fee"
            val={assumptions.docFeeIp}
            set={(v) => onChange("docFeeIp", v)}
            unit="%"
            isLocked={isLocked}
            tooltip="Incentive fee for the third-party resort operator based on gross operating profit."
          />
          <AssumptionRow
            label="GOP Service Fee"
            val={assumptions.docFeeOp}
            set={(v) => onChange("docFeeOp", v)}
            unit="%"
            isLocked={isLocked}
          />
        </div>
        <div className="space-y-4 row-span-2">
          <SectionTitle
            title="Operational Expenses"
            icon={<Briefcase size={16} />}
            color="amber"
          />
          <AssumptionRow
            label="Staff Cost (Mo)"
            val={assumptions.monthlyStaffCost}
            set={(v) => onChange("monthlyStaffCost", v)}
            unit="B"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Staff Inflation"
            val={assumptions.staffInf}
            set={(v) => onChange("staffInf", v)}
            unit="%"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Admin Rate"
            val={assumptions.adminExpRate}
            set={(v) => onChange("adminExpRate", v)}
            unit="%"
            isLocked={isLocked}
          />
          <div className="pt-2 border-t border-[#D8D8D8]">
            <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] px-1 rounded transition-colors mb-2">
              <label className="text-[10px] text-[#4C4A4B] font-bold">
                Rent Scheme
              </label>
              <select
                disabled={isLocked}
                value={assumptions.rentStructureType}
                onChange={(e) => onChange("rentStructureType", e.target.value)}
                className="p-1 bg-[#F9F8F6] border border-[#D8D8D8] rounded text-[9px] font-bold text-[#1E2F31] outline-none cursor-pointer"
              >
                <option value="flatEbitdar">Flat EBITDAR %</option>
                <option value="tiered">Tiered RevPAB</option>
                <option value="revAndProfit">% Rev + % Profit</option>
              </select>
            </div>

            {assumptions.rentStructureType === "flatEbitdar" && (
              <AssumptionRow
                label="Flat Rent (EBITDAR)"
                val={assumptions.rentFlatEbitdarRate}
                set={(v) => onChange("rentFlatEbitdarRate", v)}
                unit="%"
                isLocked={isLocked}
              />
            )}

            {assumptions.rentStructureType === "revAndProfit" && (
              <>
                <AssumptionRow
                  label="Rent from Net Rev"
                  val={assumptions.rentRevRate}
                  set={(v) => onChange("rentRevRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Rent from Profit"
                  val={assumptions.rentProfitRate}
                  set={(v) => onChange("rentProfitRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </>
            )}

            {assumptions.rentStructureType === "tiered" && (
              <>
                <div className="flex justify-between items-center mb-1 pl-1">
                  <p className="text-[9px] font-bold text-[#1C6048]">
                    RevPAB Thresholds
                  </p>
                  <div className="flex gap-1 items-center">
                    <FormattedInput
                      disabled={isLocked}
                      val={assumptions.rentTier1Limit}
                      set={(v) => onChange("rentTier1Limit", v)}
                      className="w-8 p-0.5 text-center text-[8px] border border-[#D8D8D8] rounded font-black text-[#1E2F31]"
                      placeholder="T1"
                    />
                    <span className="text-[8px] font-bold text-[#4C4A4B]">
                      B
                    </span>
                    <FormattedInput
                      disabled={isLocked}
                      val={assumptions.rentTier2Limit}
                      set={(v) => onChange("rentTier2Limit", v)}
                      className="w-8 p-0.5 text-center text-[8px] border border-[#D8D8D8] rounded font-black text-[#1E2F31]"
                      placeholder="T2"
                    />
                    <span className="text-[8px] font-bold text-[#4C4A4B]">
                      B
                    </span>
                  </div>
                </div>
                <AssumptionRow
                  label={`Tier 1 (<${assumptions.rentTier1Limit}B)`}
                  val={assumptions.rentTier1Rate}
                  set={(v) => onChange("rentTier1Rate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label={`Tier 2 (<${assumptions.rentTier2Limit}B)`}
                  val={assumptions.rentTier2Rate}
                  set={(v) => onChange("rentTier2Rate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label={`Tier 3 (>${assumptions.rentTier2Limit}B)`}
                  val={assumptions.rentTier3Rate}
                  set={(v) => onChange("rentTier3Rate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Capital Framework"
            icon={<Scale size={16} />}
            color="blue"
          />
          <AssumptionRow
            label="Dividend Payout Ratio"
            val={assumptions.dividendPayoutRatio ?? 100}
            set={(v) => onChange("dividendPayoutRatio", v)}
            unit="%"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Strategic Ptnr Eq."
            val={assumptions.partnerAEquity}
            set={(v) => onChange("partnerAEquity", v)}
            unit="B"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Vasanta Equity"
            val={assumptions.partnerBEquity}
            set={(v) => onChange("partnerBEquity", v)}
            unit="B"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Strategic Ptnr Share"
            val={assumptions.sharingPercentA}
            set={(v) => onChange("sharingPercentA", v)}
            unit="%"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Operation Disc. Rate"
            val={assumptions.discountRate}
            set={(v) => onChange("discountRate", v)}
            unit="%"
            isLocked={isLocked}
          />
          <AssumptionRow
            label="Consolidated Disc. Rate"
            val={assumptions.holdCoDiscountRate}
            set={(v) => onChange("holdCoDiscountRate", v)}
            unit="%"
            isLocked={isLocked}
          />
          <button
            onClick={onSyncEquity}
            disabled={isLocked}
            className="w-full py-2 bg-[#1E2F31] text-white rounded-lg text-[10px] font-bold shadow-md hover:opacity-90 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link2 size={12} /> Align Equity
          </button>
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Exit Strategy"
            icon={<DollarSign size={16} />}
            color="amber"
          />
          <ToggleRow
            label="Include Exit in Yr 10"
            desc="Calculate Operation Valuation."
            checked={assumptions.includeTerminalValue}
            onChange={(v) => onChange("includeTerminalValue", v)}
            isLocked={isLocked}
          />
          {assumptions.includeTerminalValue && (
            <>
              <AssumptionRow
                label="Exit Multiple"
                val={assumptions.exitMultiple}
                set={(v) => onChange("exitMultiple", v)}
                unit="x"
                isLocked={isLocked}
              />
              <AssumptionRow
                label="Selling Costs"
                val={assumptions.sellingCosts}
                set={(v) => onChange("sellingCosts", v)}
                unit="%"
                isLocked={isLocked}
              />
            </>
          )}
        </div>
      </div>
    </div>
  ),
);

const AssetSettingsView = memo(
  ({
    assumptions,
    onChange,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    onValidate,
    isCloudSync,
    isPresenting,
    clusterFilter = "consolidated",
    setClusterFilter = () => {},
  }) => {
    const clusterKeys = useMemo(() => {
      return Object.keys(
        assumptions?.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters,
      );
    }, [assumptions]);
    const firstClusterKey = clusterKeys[0] || "Glamping";

    const [localActiveSubTab, setLocalActiveSubTab] = useState(
      clusterFilter === "consolidated" ? firstClusterKey : clusterFilter,
    );

    useEffect(() => {
      if (clusterFilter !== "consolidated") {
        setLocalActiveSubTab(clusterFilter);
      }
    }, [clusterFilter]);

    const activeSubTab = localActiveSubTab;
    const setActiveSubTab = (tab) => {
      setLocalActiveSubTab(tab);
      if (clusterFilter !== "consolidated") {
        setClusterFilter(tab);
      }
    };

    const hasClusters = assumptions && !!assumptions.clusters;
    const activeAssumptionsRaw = hasClusters
      ? assumptions.clusters[activeSubTab]
      : assumptions;

    const activeAssumptions = useMemo(() => {
      if (!hasClusters || !assumptions.clusters || !activeAssumptionsRaw)
        return activeAssumptionsRaw;
      const totalLandArea = Object.values(assumptions.clusters).reduce(
        (sum, c: any) => sum + (c.landArea || 0),
        0,
      );
      const clusterRatio =
        totalLandArea > 0
          ? (activeAssumptionsRaw.landArea || 0) / totalLandArea
          : 0;
      return {
        ...activeAssumptionsRaw,
        capexSharingDevQty:
          (assumptions.global?.capexSharingDevQty || 0) * clusterRatio,
      };
    }, [
      activeAssumptionsRaw,
      assumptions.global?.capexSharingDevQty,
      assumptions.clusters,
      hasClusters,
      activeSubTab,
    ]);

    const handleKeyChange = (key, val) => {
      if (hasClusters) {
        onChange(key, val, activeSubTab);
      } else {
        onChange(key, val);
      }
    };

    const [isEditingSeasonality, setIsEditingSeasonality] = useState(false);
    const [showFinancing, setShowFinancing] = useState(true);
    const [showExit, setShowExit] = useState(true);

    const activeRoomUnits =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? activeAssumptions.glampingMix
            .filter((item: any) => item.isAccommodation)
            .reduce((sum: number, item: any) => sum + (item.qty || 0), 0)
        : activeAssumptions.roomUnits || 15;

    const totalGUnits =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? activeAssumptions.glampingMix.reduce(
            (sum: number, item: any) => sum + (item.qty || 0),
            0,
          )
        : activeAssumptions.roomUnits || 15;

    const buildCostForUi =
      activeAssumptions.type === "glamping"
        ? activeAssumptions.glampingMix
          ? activeAssumptions.glampingMix.reduce(
              (sum: number, item: any) =>
                sum + (item.qty || 0) * (item.villaCost || 0),
              0,
            ) / 1e9
          : ((activeAssumptions.roomUnits || 0) *
              (activeAssumptions.buildCost || 0)) /
            1000
        : ((activeAssumptions.buildArea || 0) *
            (activeAssumptions.buildCost || 0)) /
          1000;

    const averageGlampingCostPerUnit =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? Math.round(((buildCostForUi * 1000) / (totalGUnits || 1)) * 10) / 10
        : activeAssumptions.buildCost;
    const ffeCostForUi =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? activeAssumptions.glampingMix.reduce(
            (sum: number, item: any) =>
              sum + (item.qty || 0) * (item.interiorCost || 0),
            0,
          ) / 1e9
        : (activeAssumptions.capexFFEQty * activeAssumptions.capexFFEPrice) /
          1000;
    const averageFfeCostPerUnit =
      activeAssumptions.type === "glamping" && activeAssumptions.glampingMix
        ? Math.round(((ffeCostForUi * 1000) / (totalGUnits || 1)) * 10) / 10
        : activeAssumptions.capexFFEPrice;
    const medEqCostForUi =
      activeAssumptions.includeMedEq &&
      activeAssumptions.medEqProcurement !== "lease"
        ? (activeAssumptions.capexMedEqQty *
            activeAssumptions.capexMedEqPrice) /
          1000
        : 0;
    const infraCostForUi =
      activeAssumptions.type === "glamping"
        ? (activeAssumptions.capexInfraQty * activeAssumptions.capexInfraPrice +
            activeRoomUnits * (activeAssumptions.civilMepCostPerUnit || 150)) /
          1000
        : (activeAssumptions.capexInfraQty *
            activeAssumptions.capexInfraPrice) /
          1000;
    const coreCostForPctUi =
      buildCostForUi + ffeCostForUi + medEqCostForUi + infraCostForUi;
    const consultantCostUi =
      coreCostForPctUi * ((activeAssumptions.capexConsultantPct || 0) / 100);
    const licenseCostUi =
      coreCostForPctUi * ((activeAssumptions.capexLicensePct || 0) / 100);
    const sharingDevCostForUi =
      (activeAssumptions.capexSharingDevQty *
        activeAssumptions.capexSharingDevPrice) /
      1000;
    const vatBaseUi =
      consultantCostUi +
      buildCostForUi +
      ffeCostForUi +
      medEqCostForUi +
      infraCostForUi +
      sharingDevCostForUi;
    const vatCostUi = vatBaseUi * ((activeAssumptions.capexVat || 0) / 100);
    const contingencyBaseUi =
      licenseCostUi +
      consultantCostUi +
      buildCostForUi +
      ffeCostForUi +
      medEqCostForUi +
      infraCostForUi +
      sharingDevCostForUi +
      vatCostUi;
    const contingencyCostUi =
      contingencyBaseUi * ((activeAssumptions.capexContingencyPct || 0) / 100);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-5 lg:p-8 mb-12 text-xs">
        <SettingsHeader
          title="Asset Configuration"
          icon={<Settings className="text-[#9B8B70]" />}
          onToggleLock={onToggleLock}
          isLocked={isLocked}
          onSave={onSave}
          saveStatus={saveStatus}
          onReset={onReset}
          onValidate={onValidate}
          isCloudSync={isCloudSync}
        >
          {/* Multi-engine Active Tab Switcher (Relocated to Center) */}
          <div className="flex items-center gap-1.5 bg-[#F9F8F6] p-1 rounded-xl border border-[#D8D8D8] shadow-sm transform scale-90 origin-center -my-2 uppercase tracking-wide">
            {Object.keys(
              assumptions.clusters ||
                INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters,
            ).map((name) => {
              const cluster =
                assumptions.clusters?.[name] ||
                INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters[name];
              const zIdx = LAND_ZONING.findIndex((z) => z.proportion === name);
              const zItem = getZoningItem(zIdx === -1 ? null : zIdx);
              const color = zItem?.color || "#4C4A4B";
              const isSelected = activeSubTab === name;

              return (
                <button
                  key={name}
                  onClick={() => setActiveSubTab(name)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? "bg-white text-[#1E2F31] shadow-sm border-[#1E2F31] font-bold"
                      : "bg-transparent border-transparent text-[#4C4A4B] hover:bg-white/50 font-medium"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] whitespace-nowrap">
                    {name.replace(" Compound", "").replace(" Area", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </SettingsHeader>

        {/* CLUSTER SPECIFIC MANIFEST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-10">
          {/* Column 1: Development & Capex */}
          <div className="space-y-4">
            <SectionTitle
              title="Development & Capex"
              icon={<Building size={16} />}
              color="rose"
            />
            <div className="space-y-4">
              <ToggleRow
                label="Include Land Cost"
                desc="Amortize land price in Year 0."
                checked={activeAssumptions.includeLand ?? true}
                onChange={(v) => handleKeyChange("includeLand", v)}
                isLocked={isLocked}
              />
              {(activeAssumptions.includeLand ?? true) && (
                <div className="pl-2 border-l border-[#D8D8D8] space-y-0">
                  <AssumptionRow
                    label="Land Price"
                    val={activeAssumptions.landPrice}
                    set={(v) => handleKeyChange("landPrice", v)}
                    unit="M/Sqm"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Land Area"
                    val={activeAssumptions.landArea}
                    set={(v) => handleKeyChange("landArea", v)}
                    unit="Sqm"
                    isLocked={isLocked}
                  />
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-[#D8D8D8]/50 space-y-0">
              <AssumptionRow
                label={
                  activeAssumptions.type === "glamping"
                    ? "Est. Build Area"
                    : "Building Area (GFA)"
                }
                val={activeAssumptions.buildArea}
                set={(v) => handleKeyChange("buildArea", v)}
                unit="Sqm"
                isLocked={isLocked}
              />
              <AssumptionRow
                label={
                  activeAssumptions.type === "glamping"
                    ? "Glamping Cost per Unit"
                    : "Construction Cost"
                }
                val={
                  activeAssumptions.type === "glamping"
                    ? averageGlampingCostPerUnit
                    : activeAssumptions.buildCost
                }
                set={(v) => {
                  if (activeAssumptions.type !== "glamping") {
                    handleKeyChange("buildCost", v);
                  }
                }}
                unit={
                  activeAssumptions.type === "glamping" ? "M/Unit" : "M/Sqm"
                }
                isLocked={isLocked || activeAssumptions.type === "glamping"}
                tooltip={
                  activeAssumptions.type === "glamping"
                    ? "Weighted average cost of tent structures and interiors, dynamically derived from the Glamping Mix table below."
                    : undefined
                }
              />
              <AssumptionRow
                label="FF&E Setup"
                val={
                  activeAssumptions.type === "glamping"
                    ? averageFfeCostPerUnit
                    : activeAssumptions.capexFFEPrice
                }
                set={(v) => {
                  if (activeAssumptions.type !== "glamping") {
                    handleKeyChange("capexFFEPrice", v);
                  }
                }}
                unit={activeAssumptions.type === "glamping" ? "M/Unit" : "M"}
                isLocked={isLocked || activeAssumptions.type === "glamping"}
                tooltip={
                  activeAssumptions.type === "glamping"
                    ? "Weighted average interior cost of tents, dynamically derived from the Glamping Mix table below."
                    : undefined
                }
              />
              {activeAssumptions.type === "glamping" && (
                <AssumptionRow
                  label="Civil & MEP / Unit"
                  val={activeAssumptions.civilMepCostPerUnit}
                  set={(v) => handleKeyChange("civilMepCostPerUnit", v)}
                  unit="M/Unit"
                  isLocked={isLocked}
                />
              )}
              <AssumptionRow
                label="Dev. Duration"
                val={activeAssumptions.devDurationMonths}
                set={(v) => handleKeyChange("devDurationMonths", v)}
                unit="Mos"
                isLocked={isLocked}
              />
              <AssumptionRow
                label="Year 1 Capex Draw"
                val={activeAssumptions.equityDrawYear1Pct ?? 100}
                set={(v) =>
                  handleKeyChange(
                    "equityDrawYear1Pct",
                    Math.min(100, Math.max(0, parseFloat(v) || 0)),
                  )
                }
                unit="%"
                isLocked={isLocked || activeAssumptions.devDurationMonths <= 12}
              />
            </div>

            <div className="pt-2 border-t border-[#D8D8D8]/50 space-y-0">
              <AssumptionRowQtyPrice
                label="Cluster Infrastructure"
                qtyVal={activeAssumptions.capexInfraQty}
                priceVal={activeAssumptions.capexInfraPrice}
                setQty={(v) => handleKeyChange("capexInfraQty", v)}
                setPrice={(v) => handleKeyChange("capexInfraPrice", v)}
                isLocked={isLocked}
              />
              <AssumptionRowQtyPrice
                label="Sharing Development"
                qtyVal={activeAssumptions.capexSharingDevQty}
                priceVal={activeAssumptions.capexSharingDevPrice}
                setQty={(v) => handleKeyChange("capexSharingDevQty", v)}
                setPrice={(v) => handleKeyChange("capexSharingDevPrice", v)}
                isLocked={isLocked || activeSubTab !== "global"}
              />
              <AssumptionRowCalculated
                label="Design & Consultant Fees"
                pctVal={activeAssumptions.capexConsultantPct}
                setPct={(v) => handleKeyChange("capexConsultantPct", v)}
                calculatedVal={consultantCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Licensing & Registrations"
                pctVal={activeAssumptions.capexLicensePct}
                setPct={(v) => handleKeyChange("capexLicensePct", v)}
                calculatedVal={licenseCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Capitalized VAT"
                pctVal={activeAssumptions.capexVat}
                setPct={(v) => handleKeyChange("capexVat", v)}
                calculatedVal={vatCostUi}
                isLocked={isLocked}
              />
              <AssumptionRowCalculated
                label="Development Contingency"
                pctVal={activeAssumptions.capexContingencyPct}
                setPct={(v) => handleKeyChange("capexContingencyPct", v)}
                calculatedVal={contingencyCostUi}
                isLocked={isLocked}
              />
            </div>
          </div>

          {/* Column 2: Commercial & Operations */}
          <div className="space-y-4">
            <SectionTitle
              title="Commercial & Operations"
              icon={<Palmtree size={16} />}
              color="indigo"
            />
            {activeAssumptions.type !== "glamping" && (
              <div className="space-y-0">
                <AssumptionRow
                  label="Manual Base Rent Y1"
                  val={activeAssumptions.manualBaseRent}
                  set={(v) => handleKeyChange("manualBaseRent", v)}
                  unit="B"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Rent Escalation / Yr"
                  val={activeAssumptions.manualRentEscalation}
                  set={(v) => handleKeyChange("manualRentEscalation", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            )}
            {activeAssumptions.type === "glamping" && (
              <div className="space-y-0">
                <AssumptionRow
                  label="Glamping Units"
                  val={activeRoomUnits}
                  set={(v) => {}}
                  unit="Rooms"
                  isLocked={true}
                  tooltip="Calculated dynamically based on active Accommodation structures in the Tent Model Mix table below."
                />
                <AssumptionRow
                  label="Bar Units"
                  val={activeAssumptions.barUnits}
                  set={(v) => handleKeyChange("barUnits", v)}
                  unit="Unit"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Average Daily Rate"
                  val={activeAssumptions.adr}
                  set={(v) => handleKeyChange("adr", v)}
                  unit="IDR"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="ADR Esc. (Yr 1-5)"
                  val={activeAssumptions.adrEscalationYear1to5}
                  set={(v) => handleKeyChange("adrEscalationYear1to5", v)}
                  unit="%/Yr"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="ADR Esc. (Yr 6+)"
                  val={activeAssumptions.adrEscalationAfterYear5}
                  set={(v) => handleKeyChange("adrEscalationAfterYear5", v)}
                  unit="%/Yr"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Bar Revenue"
                  val={activeAssumptions.barRevenuePctOfRoom * 100}
                  set={(v) => handleKeyChange("barRevenuePctOfRoom", v / 100)}
                  unit="% of ADR"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="F&B COGS"
                  val={activeAssumptions.fbCogsPct}
                  set={(v) => handleKeyChange("fbCogsPct", v)}
                  unit="% of F&B"
                  isLocked={isLocked}
                />
                <div className="pt-2">
                  <AssumptionRow
                    label="Initial Occupancy"
                    val={activeAssumptions.initialOccupancy * 100}
                    set={(v) => handleKeyChange("initialOccupancy", v / 100)}
                    unit="%"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Stabilized Occupancy"
                    val={activeAssumptions.stabilizedOccupancy * 100}
                    set={(v) => handleKeyChange("stabilizedOccupancy", v / 100)}
                    unit="%"
                    isLocked={isLocked}
                  />
                </div>

                <div className="pt-4 mt-2 border-t border-[#D8D8D8]/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[#1E2F31]">
                      Sumba Seasonality Curve
                    </h4>
                    <button
                      onClick={() =>
                        setIsEditingSeasonality(!isEditingSeasonality)
                      }
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full transition-all ${
                        isEditingSeasonality
                          ? "bg-[#1E2F31] text-white"
                          : "bg-[#1C6048]/10 text-[#1C6048] hover:bg-[#1C6048]/20"
                      }`}
                    >
                      {isEditingSeasonality
                        ? "Close Panel"
                        : "Adjust Multipliers"}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#4C4A4B] mb-3 leading-relaxed">
                    Adjusts active ADR and room revenue dynamically based on
                    dry/wet travel months. Peaks during high season in{" "}
                    <span className="font-bold text-[#1C6048]">July</span> and
                    dips during rainy season in{" "}
                    <span className="font-bold text-[#9B8B70]">February</span>.
                  </p>
                  <div className="grid grid-cols-12 gap-1 bg-[#EFEBE7]/40 p-2.5 rounded-xl border border-[#D8D8D8]/30 mb-2">
                    {(() => {
                      const MONTH_LABELS = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      const currentSeasonality =
                        activeAssumptions.seasonality || [
                          0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9,
                          0.8,
                        ];
                      const maxVal = Math.max(...currentSeasonality, 1.0);
                      return currentSeasonality.map((val, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end h-16 group relative"
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#1E2F31] text-white text-[9px] font-bold py-0.5 px-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {Number(val).toFixed(2)}x
                          </div>
                          <div
                            className={`w-full rounded-t-[3px] transition-all duration-300 ${
                              val >= 1.3
                                ? "bg-[#1C6048]"
                                : val <= 0.8
                                  ? "bg-[#9B8B70]"
                                  : "bg-[#99B6AA]"
                            }`}
                            style={{ height: `${(val / maxVal) * 100}%` }}
                          />
                          <div className="text-[9px] font-mono font-bold mt-1 text-[#4C4A4B] text-center w-full">
                            {MONTH_LABELS[idx][0]}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {isEditingSeasonality && (
                    <div className="mt-3 p-3 bg-[#EFEBE7]/20 rounded-xl border border-[#D8D8D8]/40 space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center pb-1 border-b border-[#D8D8D8]/30">
                        <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-wider">
                          Adjustment Panel
                        </span>
                        <button
                          onClick={() =>
                            handleKeyChange(
                              "seasonality",
                              [
                                0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2,
                                1.0, 0.9, 0.8,
                              ],
                            )
                          }
                          className="text-[10px] text-[#1C6048] hover:underline font-bold font-mono"
                        >
                          Reset to Default
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                        {(() => {
                          const MONTH_LABELS = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          const currentSeasonality =
                            activeAssumptions.seasonality || [
                              0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0,
                              0.9, 0.8,
                            ];
                          return currentSeasonality.map((val, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-[10px] font-semibold text-[#1E2F31]">
                                <span>{MONTH_LABELS[idx]}</span>
                                <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#D8D8D8]/40 font-bold text-[#1C6048]">
                                  {Number(val).toFixed(2)}x
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.1"
                                max="3.0"
                                step="0.05"
                                value={val}
                                disabled={isLocked}
                                onChange={(e) => {
                                  const nextSeasonality = [
                                    ...currentSeasonality,
                                  ];
                                  nextSeasonality[idx] = parseFloat(
                                    e.target.value,
                                  );
                                  handleKeyChange(
                                    "seasonality",
                                    nextSeasonality,
                                  );
                                }}
                                className="w-full accent-[#1C6048] h-1 bg-[#D8D8D8]/60 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-[#D8D8D8]/50">
                  <h4 className="text-xs font-bold text-[#1E2F31] mb-3">
                    Glamping OpEx (% of Revenue)
                  </h4>
                  <div className="space-y-0">
                    <AssumptionRow
                      label="Direct Labor"
                      val={(activeAssumptions.directLaborPct ?? 0.15) * 100}
                      set={(v) => handleKeyChange("directLaborPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Direct Repairs"
                      val={(activeAssumptions.directRepairsPct ?? 0.07) * 100}
                      set={(v) => handleKeyChange("directRepairsPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Direct Utilities"
                      val={(activeAssumptions.directUtilitiesPct ?? 0.05) * 100}
                      set={(v) =>
                        handleKeyChange("directUtilitiesPct", v / 100)
                      }
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Admin Labor"
                      val={(activeAssumptions.adminLaborPct ?? 0.1) * 100}
                      set={(v) => handleKeyChange("adminLaborPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Marketing"
                      val={(activeAssumptions.marketingPct ?? 0.05) * 100}
                      set={(v) => handleKeyChange("marketingPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Admin General"
                      val={(activeAssumptions.adminGeneralPct ?? 0.05) * 100}
                      set={(v) => handleKeyChange("adminGeneralPct", v / 100)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Financial Framework */}
          <div className="space-y-4">
            <SectionTitle
              title="Financial Framework"
              icon={<Scale size={16} />}
              color="teal"
            />

            {/* Sub-group 1: Pre-Operational & Development Expenses */}
            <div className="flex flex-col gap-2.5 p-3 bg-[#EFEBE7]/20 rounded-xl border border-[#D8D8D8]/40">
              <div className="flex items-center justify-between pb-1 border-b border-[#D8D8D8]/50">
                <span className="text-[10px] text-[#1C6048] font-black uppercase tracking-wider">
                  A. Pre-Operational Phase
                </span>
                <span className="text-[8px] bg-[#1C6048]/10 text-[#1C6048] font-bold px-1.5 py-0.5 rounded uppercase">
                  Expensed
                </span>
              </div>
              <p className="text-[9px] text-[#8a8175] italic leading-tight">
                Direct G&A and CAR insurance are expensed as incurred during
                development (and excluded from capitalized soft cost draws).
              </p>
              <div className="space-y-0">
                <AssumptionRow
                  label="Const. G&A Overhead"
                  val={activeAssumptions.constructionOpexMonthly}
                  set={(v) => handleKeyChange("constructionOpexMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Pre-operating development overhead/G&A expensed monthly during construction."
                />
                <AssumptionRowCalculated
                  label="Const. All Risk (CAR)"
                  pctVal={activeAssumptions.capexCarPct}
                  setPct={(v) => handleKeyChange("capexCarPct", v)}
                  calculatedVal={
                    buildCostForUi *
                    ((activeAssumptions.capexCarPct || 0) / 100)
                  }
                  isLocked={isLocked}
                  tooltip="Construction All Risk insurance premium expensed as incurred during development."
                />
                <AssumptionRow
                  label="Pre-Opening Cost"
                  val={activeAssumptions.preOpeningMonthly}
                  set={(v) => handleKeyChange("preOpeningMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Pre-opening marketing and setup cost expensed monthly."
                />
                <AssumptionRow
                  label="Pre-Opening Duration"
                  val={activeAssumptions.preOpeningDuration}
                  set={(v) => handleKeyChange("preOpeningDuration", v)}
                  unit="Mo"
                  isLocked={isLocked}
                  tooltip="Months prior to Commercial Opening for pre-opening operations."
                />
              </div>
            </div>

            {/* Sub-group 2: Operating & Hospital Phase Expenses */}
            <div className="flex flex-col gap-2.5 p-3 bg-white rounded-xl border border-[#D8D8D8]/40">
              <div className="flex items-center justify-between pb-1 border-b border-[#D8D8D8]/50">
                <span className="text-[10px] text-[#9B8B70] font-black uppercase tracking-wider">
                  B. Operating Phase (OPCO)
                </span>
                <span className="text-[8px] bg-[#9B8B70]/10 text-[#9B8B70] font-bold px-1.5 py-0.5 rounded uppercase">
                  Ancillary OPEX
                </span>
              </div>
              <p className="text-[9px] text-[#8a8175] italic leading-tight">
                Recurring expenses, property taxes, maintenance, and
                administrative overheads during active clinical operations.
              </p>
              <div className="space-y-0">
                <AssumptionRow
                  label="Op. Overhead / G&A"
                  val={activeAssumptions.opOverheadMonthly}
                  set={(v) => handleKeyChange("opOverheadMonthly", v)}
                  unit="B/Mo"
                  isLocked={isLocked}
                  tooltip="Fixed operating overhead and clinical administration expenses."
                />
                <AssumptionRow
                  label="Overhead Incr. (Inflation)"
                  val={activeAssumptions.opOverheadInc}
                  set={(v) => handleKeyChange("opOverheadInc", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Maintenance Rate"
                  val={activeAssumptions.maintRate}
                  set={(v) => handleKeyChange("maintRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Property Tax Rate"
                  val={activeAssumptions.propTaxRate}
                  set={(v) => handleKeyChange("propTaxRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="FF&E Reserve"
                  val={activeAssumptions.ffeReservePct}
                  set={(v) => handleKeyChange("ffeReservePct", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#D8D8D8]/50">
              <SectionTitle
                title="Depreciation (D&A)"
                icon={<Calculator size={16} />}
                color="blue"
              />
              <div className="space-y-0 mt-3">
                <AssumptionDepreciationGroup
                  label="Building"
                  methodVal={activeAssumptions.depMethodBuilding}
                  lifeVal={activeAssumptions.depLifeBuilding}
                  setMethod={(v) => handleKeyChange("depMethodBuilding", v)}
                  setLife={(v) => handleKeyChange("depLifeBuilding", v)}
                  isLocked={isLocked}
                />
                <AssumptionDepreciationGroup
                  label="Infrastructure"
                  methodVal={activeAssumptions.depMethodInfra}
                  lifeVal={activeAssumptions.depLifeInfra}
                  setMethod={(v) => handleKeyChange("depMethodInfra", v)}
                  setLife={(v) => handleKeyChange("depLifeInfra", v)}
                  isLocked={isLocked}
                />
                <AssumptionDepreciationGroup
                  label="FF&E"
                  methodVal={activeAssumptions.depMethodFFE}
                  lifeVal={activeAssumptions.depLifeFFE}
                  setMethod={(v) => handleKeyChange("depMethodFFE", v)}
                  setLife={(v) => handleKeyChange("depLifeFFE", v)}
                  isLocked={isLocked}
                />
              </div>
            </div>
            {/* Collapsible Cluster Capital Structure & Debt */}
            <div className="pt-4 border-t border-[#D8D8D8]/50 space-y-3">
              <button
                type="button"
                onClick={() => setShowFinancing(!showFinancing)}
                className="w-full flex justify-between items-center text-left py-2 border-b border-[#D8D8D8] text-[11px] font-bold text-[#1E2F31] hover:bg-[#EFEBE7]/50 px-1 rounded transition-all"
              >
                <span className="flex items-center gap-2">
                  <Landmark size={14} className="text-[#1C6048]" /> Cluster
                  Capital Structure & Debt
                </span>
                <span className="text-xs">{showFinancing ? "−" : "+"}</span>
              </button>
              {showFinancing && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <ToggleRow
                    label="Include Debt Financing"
                    desc="Use bank loan for construction."
                    checked={activeAssumptions.includeFinancing}
                    onChange={(v) => handleKeyChange("includeFinancing", v)}
                    isLocked={isLocked}
                  />
                  <div className="space-y-0">
                    <AssumptionRow
                      label="Loan To Value (LTV)"
                      val={activeAssumptions.ltv}
                      set={(v) => handleKeyChange("ltv", v)}
                      unit="%"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="Interest Rate"
                      val={activeAssumptions.interestRate}
                      set={(v) => handleKeyChange("interestRate", v)}
                      unit="%"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="Loan Tenor"
                      val={activeAssumptions.loanTenor}
                      set={(v) => handleKeyChange("loanTenor", v)}
                      unit="Yrs"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="IO Grace Period"
                      val={activeAssumptions.ioGracePeriodYears}
                      set={(v) => handleKeyChange("ioGracePeriodYears", v)}
                      unit="Yrs"
                      isLocked={isLocked || !activeAssumptions.includeFinancing}
                    />
                    <AssumptionRow
                      label="Discount Rate"
                      val={activeAssumptions.discountRate}
                      set={(v) => handleKeyChange("discountRate", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Cluster Exit Strategy & Tax */}
            <div className="pt-4 border-t border-[#D8D8D8]/50 space-y-3">
              <button
                type="button"
                onClick={() => setShowExit(!showExit)}
                className="w-full flex justify-between items-center text-left py-2 border-b border-[#D8D8D8] text-[11px] font-bold text-[#1E2F31] hover:bg-[#EFEBE7]/50 px-1 rounded transition-all"
              >
                <span className="flex items-center gap-2">
                  <DollarSign size={14} className="text-[#9B8B70]" /> Cluster
                  Exit Strategy & Tax
                </span>
                <span className="text-xs">{showExit ? "−" : "+"}</span>
              </button>
              {showExit && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <ToggleRow
                    label="Include Exit in Yr 10"
                    desc="Calculate Terminal Value."
                    checked={activeAssumptions.includeTerminalValue}
                    onChange={(v) => handleKeyChange("includeTerminalValue", v)}
                    isLocked={isLocked}
                  />
                  <div className="space-y-0">
                    {activeAssumptions.includeTerminalValue && (
                      <>
                        <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors min-h-[28px] gap-2">
                          <label className="text-[10px] text-[#4C4A4B] font-bold">
                            Valuation Method
                          </label>
                          <div className="flex items-center bg-[#D8D8D8] rounded p-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                handleKeyChange("exitMethod", "capRate")
                              }
                              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeAssumptions.exitMethod !== "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                            >
                              Cap Rate
                            </button>
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() =>
                                handleKeyChange("exitMethod", "multiple")
                              }
                              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeAssumptions.exitMethod === "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                            >
                              EV/EBITDA
                            </button>
                          </div>
                        </div>
                        {activeAssumptions.exitMethod === "multiple" ? (
                          <AssumptionRow
                            label="Exit Multiple"
                            val={activeAssumptions.exitMultiple}
                            set={(v) => handleKeyChange("exitMultiple", v)}
                            unit="x"
                            isLocked={isLocked}
                          />
                        ) : (
                          <AssumptionRow
                            label="Exit Cap Rate"
                            val={activeAssumptions.exitCapRate}
                            set={(v) => handleKeyChange("exitCapRate", v)}
                            unit="%"
                            isLocked={isLocked}
                          />
                        )}
                        <AssumptionRow
                          label="Selling Costs"
                          val={activeAssumptions.sellingCosts}
                          set={(v) => handleKeyChange("sellingCosts", v)}
                          unit="%"
                          isLocked={isLocked}
                        />
                      </>
                    )}
                    <AssumptionRow
                      label="Corporate Tax"
                      val={activeAssumptions.corporateTax}
                      set={(v) => handleKeyChange("corporateTax", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Glamping Mix Table - Relocated to span Col 1+2 (Red Annotation) */}
          {activeAssumptions.type === "glamping" && (
            <div className="lg:col-span-2 pt-6">
              <GlampingMixTable
                mix={activeAssumptions.glampingMix || []}
                onChange={(newMix) => handleKeyChange("glampingMix", newMix)}
                isLocked={isLocked}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

const OperationSensitivityView = memo(({ assumptions }) => {
  const borSteps = [45, 55, 65, 75, 85];
  const bedSteps = [80, 100, 120, 140, 160];
  const irrMatrix = borSteps.map((bor) =>
    bedSteps.map(
      (beds) =>
        (runOperationEngine({ ...assumptions, borMax: bor, beds }).projectIRR ||
          0) * 100,
    ),
  );
  return (
    <SensitivityTable
      title="Project IRR Sensitivity"
      subtitle="Beds vs. Max BOR"
      xLabel="Beds"
      yLabel="BOR"
      xValues={bedSteps}
      yValues={borSteps}
      matrix={irrMatrix}
      formatFn={(v) => formatNumber(v, 1) + "%"}
    />
  );
});

const AssetSensitivityView = memo(({ assumptions }) => {
  const costSteps = [9, 10, 11.5, 13, 14];
  const rateSteps = [8, 9, 10.5, 12, 13];
  const paybackMatrix = costSteps.map((bc) =>
    rateSteps.map((ir) => {
      // Build a temporary assumptions state with modified interestRate in global and buildCost under each cluster
      const tempAssumptions = {
        global: {
          ...(assumptions.global || assumptions),
          interestRate: ir,
        },
        clusters: assumptions.clusters
          ? Object.keys(assumptions.clusters).reduce((acc, cName) => {
              acc[cName] = {
                ...assumptions.clusters[cName],
                buildCost: bc,
              };
              return acc;
            }, {})
          : {
              default: {
                ...assumptions,
                buildCost: bc,
              },
            },
      };
      return (
        runConsolidatedAssetEngine(tempAssumptions).metrics.operatingPayback ||
        0
      );
    }),
  );
  return (
    <SensitivityTable
      title="Operating Payback Sensitivity"
      subtitle="Interest Rate vs. Build Cost"
      xLabel="Rate"
      yLabel="Cost"
      xValues={rateSteps}
      yValues={costSteps}
      matrix={paybackMatrix}
      formatFn={(v) => (v === 0 ? "Never" : formatNumber(v, 1) + " Yrs")}
      reverseColors
    />
  );
});

function AIAuditView({
  aiInsights,
  isAiLoading,
  generateAIInsights,
  askQuery,
  setAskQuery,
  handleAskAI,
  isAskLoading,
  askResponse,
  activeCompany,
}) {
  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 pb-12">
      <div className="bg-white rounded-2xl shadow-lg border border-[#D8D8D8] overflow-hidden">
        <div
          className={`p-8 bg-gradient-to-br text-white flex flex-col md:flex-row justify-between items-center gap-6 ${activeCompany === "operation" ? "from-[#1E2F31] to-[#1C6048]" : "from-[#4C4A4B] to-[#9B8B70]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md hidden sm:block">
              <AISparklesIcon size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">✨ Intelligent Audit</h2>
              <p className="text-white/80 text-sm max-w-md">
                Benchmarking Project NPV, MOIC, Yields, and Margin efficiency.
              </p>
            </div>
          </div>
          <button
            onClick={generateAIInsights}
            disabled={isAiLoading}
            className="bg-white px-6 py-3 rounded-xl font-bold text-[#1E2F31] shadow-xl hover:bg-opacity-90 transition-all"
          >
            {isAiLoading ? (
              <RefreshCcw size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}{" "}
            Run Yield Audit
          </button>
        </div>
        <div className="p-8 bg-white min-h-[300px]">
          {aiInsights && (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-[#D8D8D8] border-l-4 border-l-[#1C6048]">
              <MarkdownRenderer content={aiInsights} />
            </div>
          )}
          {!aiInsights && !isAiLoading && (
            <p className="text-center text-gray-500">
              Run the audit to see AI-generated financial insights.
            </p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-[#D8D8D8] p-8 mt-6">
        <h3 className="text-lg font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
          <AISparklesIcon size={20} className="text-[#1C6048]" /> Ask AI
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
            placeholder="Ask anything about the numbers..."
            className="flex-1 p-4 bg-white border border-[#D8D8D8] rounded-xl outline-none"
          />
          <button
            onClick={handleAskAI}
            disabled={isAskLoading || !askQuery.trim()}
            className="bg-[#1E2F31] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md"
          >
            {isAskLoading ? "Thinking..." : "Ask"}
          </button>
        </div>
        {askResponse && (
          <div className="mt-8 p-6 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
            <MarkdownRenderer content={askResponse} />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MASTER TIMELINE VIEW (GANTT CHART)
// ==========================================
const MasterTimelineView = memo(({ isPresenting, groups, setGroups }) => {
  const [activeYearFilter, setActiveYearFilter] = useState("All");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(5);
  const [highlightCritical, setHighlightCritical] = useState(true);
  const [timelineSearch, setTimelineSearch] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const [endYear, setEndYear] = useState(DEFAULT_END_YEAR);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    groupId: "design",
    start: 5,
    duration: 4,
    progress: 0,
    owner: "",
    desc: "",
    critical: false,
  });

  const [activeMonthPicker, setActiveMonthPicker] = useState(null);
  const [tempPickerYear, setTempPickerYear] = useState(START_YEAR);

  const TIMELINE_MONTHS = useMemo(
    () => generateTimelineMonths(START_YEAR, endYear),
    [endYear],
  );
  const maxMonths = TIMELINE_MONTHS.length;
  const uniqueYears = useMemo(
    () =>
      [...new Set(TIMELINE_MONTHS.map((m) => m.year))].sort((a, b) => a - b),
    [TIMELINE_MONTHS],
  );

  const minYear = START_YEAR;
  const maxYear = endYear;

  const [collapsedYears, setCollapsedYears] = useState(() => {
    const initial = {};
    uniqueYears.forEach((yr) => {
      initial[yr] = true;
    });
    return initial;
  });

  useEffect(() => {
    setCollapsedYears((prev) => {
      const updated = { ...prev };
      uniqueYears.forEach((yr) => {
        if (updated[yr] === undefined) updated[yr] = true;
      });
      return updated;
    });
  }, [uniqueYears]);

  const [expandedGroups, setExpandedGroups] = useState({
    design: true,
    licensing: true,
    construction: false,
    equipment: false,
  });
  const [selectedTaskId, setSelectedTaskId] = useState("t5");

  const timelineScrollRef = useRef(null);
  const pickerRef = useRef(null);
  const lastValidValRef = useRef(null);
  const monthWidth = 64;

  const totalTimelineWidth = useMemo(() => {
    return 288 + maxMonths * monthWidth + 64;
  }, [maxMonths]);

  const handleTaskUpdate = (groupId, taskId, key, value) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            let parsedValue = value;
            if (key === "start") {
              if (value === "") parsedValue = "";
              else
                parsedValue = Math.max(
                  1,
                  Math.min(maxMonths, parseInt(value) || 1),
                );
            } else if (key === "duration") {
              if (value === "") parsedValue = "";
              else parsedValue = value;
            } else if (key === "progress") {
              parsedValue = Math.max(0, Math.min(100, parseInt(value) || 0));
            } else if (key === "cost") {
              parsedValue = Math.max(0, parseFloat(value) || 0);
            }
            return { ...task, [key]: parsedValue };
          }),
        };
      }),
    );
  };

  const openMonthPicker = (type, currentVal, onSelect) => {
    const currentYear = TIMELINE_MONTHS[currentVal - 1]?.year || minYear;
    setTempPickerYear(currentYear);
    setActiveMonthPicker({ type, currentVal, onSelect });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        activeMonthPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setActiveMonthPicker(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMonthPicker]);

  const handleTaskDelete = (groupId, taskId) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.filter((task) => task.id !== taskId),
        };
      }),
    );
    setSelectedTaskId(null);
  };

  const handleTaskCreate = (e) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;
    const createdId = `t_${Date.now()}`;
    const taskObj = {
      id: createdId,
      name: newTask.name,
      start: parseInt(newTask.start) || 1,
      duration: parseInt(newTask.duration) || 1,
      progress: parseInt(newTask.progress) || 0,
      owner: newTask.owner || "Project Board",
      cost: 0,
      desc: newTask.desc || "No detailed description added.",
      critical: newTask.critical,
      dependencies: [],
    };
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== newTask.groupId) return group;
        return { ...group, tasks: [...group.tasks, taskObj] };
      }),
    );
    setExpandedGroups((prev) => ({ ...prev, [newTask.groupId]: true }));
    setSelectedTaskId(createdId);
    setIsCreatingTask(false);
    setNewTask({
      name: "",
      groupId: "design",
      start: selectedMonthIndex,
      duration: 4,
      progress: 0,
      owner: "",
      desc: "",
      critical: false,
    });
  };

  const getTaskNameById = (id) => {
    for (const group of groups) {
      const found = group.tasks.find((t) => t.id === id);
      if (found) return found.name;
    }
    return id.toUpperCase();
  };

  const getTaskDateRangeString = (start, duration) => {
    const safeStart = Math.min(Math.max(1, start), maxMonths);
    const safeEnd = Math.min(
      Math.max(1, start + (parseInt(duration) || 1) - 1),
      maxMonths,
    );
    const startMonth = TIMELINE_MONTHS[safeStart - 1];
    const endMonth = TIMELINE_MONTHS[safeEnd - 1];
    if (!startMonth || !endMonth) return "";
    return `${startMonth.name} – ${endMonth.name}`;
  };

  const groupSummaryBars = useMemo(() => {
    const summaries = {};
    groups.forEach((group) => {
      if (group.tasks.length === 0) return;
      let minStart = maxMonths;
      let maxEnd = 1;
      group.tasks.forEach((task) => {
        if (task.start < minStart) minStart = task.start;
        const end = task.start + (parseInt(task.duration) || 1) - 1;
        if (end > maxEnd) maxEnd = Math.min(end, maxMonths);
      });
      summaries[group.id] = {
        start: minStart,
        duration: maxEnd - minStart + 1,
      };
    });
    return summaries;
  }, [groups, maxMonths]);

  const allGroupsCollapsed = useMemo(
    () => Object.values(expandedGroups).every((val) => !val),
    [expandedGroups],
  );
  const toggleAllGroups = () => {
    if (allGroupsCollapsed)
      setExpandedGroups({
        design: true,
        licensing: true,
        construction: true,
        equipment: true,
      });
    else
      setExpandedGroups({
        design: false,
        licensing: false,
        construction: false,
        equipment: false,
      });
  };

  const allYearsCollapsed = useMemo(
    () => Object.values(collapsedYears).every((val) => val),
    [collapsedYears],
  );
  const toggleAllYears = () => {
    setCollapsedYears((prev) => {
      const nextState = {};
      uniqueYears.forEach((yr) => {
        nextState[yr] = !allYearsCollapsed;
      });
      return nextState;
    });
  };

  const compressedBlocks = useMemo(() => {
    const blocks = [];
    let currentBlock = null;
    for (let num = 1; num <= maxMonths; num++) {
      const monthInfo = TIMELINE_MONTHS[num - 1];
      const activeTaskIds = [];
      groups.forEach((group) => {
        group.tasks.forEach((task) => {
          const taskEnd = task.start + (parseInt(task.duration) || 1) - 1;
          if (num >= task.start && num <= taskEnd) activeTaskIds.push(task.id);
        });
      });
      activeTaskIds.sort();
      const signature = activeTaskIds.join(",");
      if (
        !currentBlock ||
        currentBlock.signature !== signature ||
        currentBlock.year !== monthInfo.year
      ) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          startMonth: num,
          endMonth: num,
          startName: monthInfo.name,
          endName: monthInfo.name,
          year: monthInfo.year,
          phase: monthInfo.phase,
          activeTaskIds,
          signature,
        };
      } else {
        currentBlock.endMonth = num;
        currentBlock.endName = monthInfo.name;
      }
    }
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }, [groups, maxMonths, TIMELINE_MONTHS]);

  const blocksByYear = useMemo(() => {
    return compressedBlocks.reduce((acc, curr) => {
      if (!acc[curr.year]) acc[curr.year] = [];
      acc[curr.year].push(curr);
      return acc;
    }, {});
  }, [compressedBlocks]);

  const activeBlock = useMemo(
    () =>
      compressedBlocks.find(
        (b) =>
          selectedMonthIndex >= b.startMonth &&
          selectedMonthIndex <= b.endMonth,
      ),
    [compressedBlocks, selectedMonthIndex],
  );

  const getBlockColorInfo = (block) => {
    if (!block)
      return {
        dot: "bg-gray-400",
        border: "border-l-gray-400",
        text: "text-gray-500",
        bgSelected: "bg-gray-500",
        bgLight: "bg-gray-50",
      };
    let groupId = "";
    if (block.activeTaskIds && block.activeTaskIds.length > 0) {
      const firstTaskId = block.activeTaskIds[0];
      const group = groups.find((g) =>
        g.tasks.some((t) => t.id === firstTaskId),
      );
      if (group) groupId = group.id;
    }
    if (!groupId) {
      const phase = block.phase.toLowerCase();
      if (phase.includes("feasibility") || phase.includes("design"))
        groupId = "design";
      else if (phase.includes("licensing")) groupId = "licensing";
      else if (
        phase.includes("civil") ||
        phase.includes("epc") ||
        phase.includes("construction") ||
        phase.includes("works")
      )
        groupId = "construction";
      else groupId = "equipment";
    }
    if (groupId === "design")
      return {
        dot: "bg-[#1C6048]",
        border: "border-l-[#1C6048]",
        text: "text-[#1C6048]",
        bgSelected: "bg-[#1C6048]",
        bgLight: "bg-[#1C6048]/5",
        borderDashed: "border-[#1C6048]/35",
      };
    if (groupId === "licensing")
      return {
        dot: "bg-[#9B8B70]",
        border: "border-l-[#9B8B70]",
        text: "text-[#9B8B70]",
        bgSelected: "bg-[#9B8B70]",
        bgLight: "bg-[#9B8B70]/10",
        borderDashed: "border-[#9B8B70]/35",
      };
    if (groupId === "construction")
      return {
        dot: "bg-[#1E2F31]",
        border: "border-l-[#1E2F31]",
        text: "text-[#1E2F31]",
        bgSelected: "bg-[#1E2F31]",
        bgLight: "bg-[#1E2F31]/5",
        borderDashed: "border-[#1E2F31]/35",
      };
    return {
      dot: "bg-[#99B6AA]",
      border: "border-l-[#99B6AA]",
      text: "text-[#99B6AA]",
      bgSelected: "bg-[#99B6AA]",
      bgLight: "bg-[#99B6AA]/15",
      borderDashed: "border-[#99B6AA]/35",
    };
  };

  const getMonthColorInfo = (num) => {
    const block = compressedBlocks.find(
      (b) => num >= b.startMonth && num <= b.endMonth,
    );
    return block ? getBlockColorInfo(block) : null;
  };

  const activeTasksForSelectedMonth = useMemo(() => {
    const active = [];
    groups.forEach((group) => {
      group.tasks.forEach((task) => {
        const taskEnd = task.start + (parseInt(task.duration) || 1) - 1;
        if (selectedMonthIndex >= task.start && selectedMonthIndex <= taskEnd)
          active.push(task.id);
      });
    });
    return active;
  }, [groups, selectedMonthIndex]);

  const selectedTask = useMemo(() => {
    for (const group of groups) {
      const task = group.tasks.find((t) => t.id === selectedTaskId);
      if (task)
        return {
          ...task,
          groupId: group.id,
          groupName: group.name,
          groupColor: group.color,
        };
    }
    return null;
  }, [groups, selectedTaskId]);

  const taskConflicts = useMemo(() => {
    const allTasksMap = {};
    groups.forEach((g) => {
      g.tasks.forEach((t) => {
        allTasksMap[t.id] = { ...t, groupName: g.name };
      });
    });

    const conflicts = {};

    groups.forEach((g) => {
      g.tasks.forEach((t) => {
        const warnings = [];
        const tStart = parseInt(t.start) || 1;
        const tDuration = parseInt(t.duration) || 1;
        const tEnd = tStart + tDuration - 1;

        // 1. Dependency-based sequence checks
        if (t.dependencies && t.dependencies.length > 0) {
          t.dependencies.forEach((depId) => {
            const depTask = allTasksMap[depId];
            if (depTask) {
              const depStart = parseInt(depTask.start) || 1;
              const depDuration = parseInt(depTask.duration) || 1;
              const depEnd = depStart + depDuration - 1;

              if (tStart <= depEnd) {
                const depEndMonthName =
                  TIMELINE_MONTHS[depEnd - 1]?.name || `Month ${depEnd}`;
                const tStartMonthName =
                  TIMELINE_MONTHS[tStart - 1]?.name || `Month ${tStart}`;
                warnings.push(
                  `Predecessor overlap: Scheduled to start in ${tStartMonthName} but relies on ${depId.toUpperCase()} "${depTask.name}" which finishes later in ${depEndMonthName}.`,
                );
              }
            }
          });
        }

        // 2. Additional construction sequence feasibility checks
        if (t.id === "t7_1" || t.id === "t7_2") {
          const t6_2 = allTasksMap["t6_2"];
          if (t6_2) {
            const t6_2End =
              (parseInt(t6_2.start) || 1) + (parseInt(t6_2.duration) || 1) - 1;
            if (tStart <= t6_2End) {
              warnings.push(
                "Civil sequence constraint: Interior fit-outs cannot realistically start until the main structural superstructure (T6_2) is complete.",
              );
            }
          }
        }

        if (t.id === "t12") {
          const t6_3 = allTasksMap["t6_3"];
          if (t6_3) {
            const t6_3End =
              (parseInt(t6_3.start) || 1) + (parseInt(t6_3.duration) || 1) - 1;
            if (tStart <= t6_3End) {
              warnings.push(
                "Drills safety warning: Emergency drills (T12) and high-energy calibrations cannot proceed inside incomplete concrete vault shielding core (T6_3).",
              );
            }
          }
        }

        if (warnings.length > 0) {
          conflicts[t.id] = warnings;
        }
      });
    });

    return conflicts;
  }, [groups, TIMELINE_MONTHS]);

  const selectedTaskConflicts = selectedTaskId
    ? taskConflicts[selectedTaskId] || []
    : [];

  const toggleGroup = (groupId) =>
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  const toggleYear = (year) =>
    setCollapsedYears((prev) => ({ ...prev, [year]: !prev[year] }));

  const scrollToMonth = (idx) => {
    if (timelineScrollRef.current) {
      const targetScroll =
        (idx - 1) * monthWidth -
        timelineScrollRef.current.clientWidth / 2 +
        144 +
        32;
      timelineScrollRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  };

  const handleYearFilterChange = (year) => {
    setActiveYearFilter(year);
    if (year !== "All") {
      setCollapsedYears((prev) => ({ ...prev, [year]: false }));
      const firstMonthOfYr =
        TIMELINE_MONTHS.find((m) => m.year === parseInt(year))?.num || 1;
      setSelectedMonthIndex(firstMonthOfYr);
    } else {
      setSelectedMonthIndex(5);
    }
  };

  useEffect(() => {
    scrollToMonth(selectedMonthIndex);
  }, [selectedMonthIndex]);

  const isMonthInActiveBlock = (num) => {
    if (!activeBlock) return false;
    return num >= activeBlock.startMonth && num <= activeBlock.endMonth;
  };

  const renderInlineCalendarContent = (picker) => {
    const duration =
      picker.type === "edit"
        ? parseInt(selectedTask?.duration) || 1
        : parseInt(newTask?.duration) || 4;
    let activeColor = "#1C6048";
    if (picker.type === "edit" && selectedTask) {
      if (selectedTask.groupId === "licensing") activeColor = "#9B8B70";
      else if (selectedTask.groupId === "construction") activeColor = "#1E2F31";
      else if (selectedTask.groupId === "equipment") activeColor = "#99B6AA";
    } else {
      const group = groups.find((g) => g.id === newTask.groupId);
      if (group) {
        if (group.id === "licensing") activeColor = "#9B8B70";
        else if (group.id === "construction") activeColor = "#1E2F31";
        else if (group.id === "equipment") activeColor = "#99B6AA";
      }
    }

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between py-1 bg-white/40 rounded-lg border border-white/30 px-2 shadow-sm">
          <button
            type="button"
            disabled={tempPickerYear <= minYear}
            onClick={(e) => {
              e.stopPropagation();
              setTempPickerYear((prev) => Math.max(minYear, prev - 1));
            }}
            className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={13} className="text-[#1E2F31] stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-black text-[#1E2F31] uppercase tracking-wider">
            {tempPickerYear}
          </span>
          <button
            type="button"
            disabled={tempPickerYear >= maxYear}
            onClick={(e) => {
              e.stopPropagation();
              setTempPickerYear((prev) => Math.min(maxYear, prev + 1));
            }}
            className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight size={13} className="text-[#1E2F31] stroke-[2.5]" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {MONTH_NAMES_SHORT.map((mName, idx) => {
            const globalNum = (tempPickerYear - minYear) * 12 + (idx + 1);
            const isSelected = picker.currentVal === globalNum;
            const isInRange =
              globalNum > picker.currentVal &&
              globalNum < picker.currentVal + duration;
            const isEnd =
              globalNum === picker.currentVal + duration - 1 && duration > 1;
            const isCurrentMonth = globalNum === 5;

            let btnStyle =
              "bg-[#F9F8F6]/50 border-white/40 hover:bg-white/90 text-[#1E2F31]";
            let customInlineColor = {};

            if (isSelected) {
              btnStyle = "text-white font-black shadow-sm scale-105 z-10";
              customInlineColor = {
                backgroundColor: activeColor,
                borderColor: activeColor,
              };
            } else if (isInRange) {
              btnStyle = "font-extrabold text-[9px] border-dashed";
              customInlineColor = {
                backgroundColor: `${activeColor}15`,
                borderColor: `${activeColor}40`,
                color: activeColor,
              };
            } else if (isEnd) {
              btnStyle = "font-black border-dashed";
              customInlineColor = {
                backgroundColor: `${activeColor}25`,
                borderColor: activeColor,
                color: activeColor,
              };
            }

            return (
              <button
                key={mName}
                type="button"
                style={customInlineColor}
                disabled={globalNum > maxMonths}
                onClick={(e) => {
                  e.stopPropagation();
                  picker.onSelect(globalNum);
                  setActiveMonthPicker(null);
                }}
                className={`py-1.5 rounded-xl text-[9px] font-bold transition-all border relative flex flex-col items-center justify-center disabled:opacity-20 disabled:pointer-events-none ${btnStyle}`}
              >
                {mName}
                {isCurrentMonth && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-[#1C6048] rounded-full animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-[#9B8B70] border-t border-white/20 pt-2 px-1">
          <span className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeColor }}
            ></span>{" "}
            Start Month
          </span>
          {duration > 1 && (
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-1.5 rounded-sm border border-dashed"
                style={{
                  backgroundColor: `${activeColor}15`,
                  borderColor: `${activeColor}40`,
                }}
              ></span>{" "}
              {duration - 1} Mo span
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-[#1E2F31] flex flex-col gap-6 relative animate-in fade-in duration-500 pb-12">
      {/* Diagonal Watermark Overlay */}
      <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden rounded-3xl">
        <div className="transform -rotate-[20deg] px-8 md:scale-100 scale-75 origin-center w-full">
          <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-[#1E2F31]/10 uppercase tracking-widest text-center leading-tight select-none drop-shadow-sm">
            Date and items have not been
            <br />
            filled out or updated yet
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 bg-white p-4 rounded-2xl border border-[#D8D8D8] shadow-sm">
        <div className="md:col-span-8 flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search milestone or task..."
              value={timelineSearch}
              onChange={(e) => setTimelineSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-2 focus:ring-[#1C6048] outline-none shadow-inner transition-all"
            />
            <Search
              size={14}
              className="absolute left-3.5 top-3.5 text-[#9B8B70]"
            />
          </div>
          <div className="flex bg-[#F9F8F6] p-1 rounded-xl border border-[#D8D8D8] shrink-0">
            {["All", ...uniqueYears.map(String)].map((year) => (
              <button
                key={year}
                onClick={() => handleYearFilterChange(year)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeYearFilter === year ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                {year}
              </button>
            ))}
          </div>
          <button
            onClick={() => setHighlightCritical(!highlightCritical)}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all border ${highlightCritical ? "bg-[#9B8B70] text-white border-[#9B8B70] shadow-sm" : "bg-transparent border-[#D8D8D8] text-[#4C4A4B] hover:bg-[#F9F8F6]"}`}
          >
            <ShieldAlert size={14} /> Critical Path
          </button>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <div className="bg-[#EFEBE7] border border-[#D8D8D8] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase text-[#4C4A4B] flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1C6048] animate-pulse"></span>{" "}
            Current Phase: H1 2027 (Feasibility)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch relative z-10">
        <div className="xl:col-span-3 bg-white border border-[#D8D8D8] rounded-[24px] p-5 flex flex-col gap-4 shadow-sm max-h-[640px]">
          <div className="pb-3 border-b border-[#D8D8D8] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#1E2F31] flex items-center gap-2">
                <CalendarDays size={16} className="text-[#1C6048]" /> Monthly
                Indexer
              </span>
              <button
                type="button"
                onClick={toggleAllYears}
                className="p-1 rounded bg-[#F9F8F6] hover:bg-[#EFEBE7] border border-[#D8D8D8] text-[#1E2F31] transition-all hover:scale-105"
                title={
                  allYearsCollapsed ? "Expand All Years" : "Collapse All Years"
                }
              >
                {allYearsCollapsed ? (
                  <ChevronsUpDown size={12} />
                ) : (
                  <ChevronsDownUp size={12} />
                )}
              </button>
            </div>
            <span className="text-[9px] font-black text-white bg-[#1C6048] px-2.5 py-0.5 rounded-full">
              {activeBlock
                ? activeBlock.startMonth === activeBlock.endMonth
                  ? activeBlock.startName
                  : `${activeBlock.startName.split(" ")[0]} - ${activeBlock.endName}`
                : ""}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {Object.entries(blocksByYear).map(([year, blocks]) => {
              if (activeYearFilter !== "All" && activeYearFilter !== year)
                return null;
              const isYearCollapsed = collapsedYears[year];
              return (
                <div key={year} className="space-y-1.5">
                  <div
                    onClick={() => toggleYear(year)}
                    className="text-[10px] font-black text-[#9B8B70] uppercase px-1 border-l-2 border-[#9B8B70] tracking-wider mb-2 flex justify-between items-center cursor-pointer hover:text-[#1E2F31] transition-all"
                  >
                    <span>Year {year}</span>
                    {isYearCollapsed ? (
                      <ChevronRight size={14} className="text-[#9B8B70]" />
                    ) : (
                      <ChevronDown size={14} className="text-[#9B8B70]" />
                    )}
                  </div>
                  {!isYearCollapsed && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {blocks.map((block) => {
                        const isSelected =
                          selectedMonthIndex >= block.startMonth &&
                          selectedMonthIndex <= block.endMonth;
                        const colorInfo = getBlockColorInfo(block);
                        const activeCount = block.activeTaskIds.length;
                        let isCurrent =
                          5 >= block.startMonth && 5 <= block.endMonth;
                        const dotClass = `w-2 h-2 rounded-full ${colorInfo.dot} ${isCurrent ? "animate-pulse ring-2 ring-offset-1 ring-emerald-500" : ""}`;
                        const rangeLabel =
                          block.startMonth === block.endMonth
                            ? block.startName
                            : `${block.startName.split(" ")[0]} - ${block.endName}`;
                        return (
                          <div
                            key={block.startMonth}
                            onClick={() =>
                              setSelectedMonthIndex(block.startMonth)
                            }
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer border-y border-r border-l-4 ${colorInfo.border} ${isSelected ? "bg-[#1E2F31] border-[#1E2F31] text-white shadow-md transform translate-x-1" : "bg-[#F9F8F6] border-[#D8D8D8] hover:bg-[#EFEBE7]/50 text-[#4C4A4B]"}`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className={dotClass}></span>
                                <span className="text-[11px] font-black">
                                  {rangeLabel}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase ${isSelected ? "text-white/60" : "text-gray-400"}`}
                                >
                                  ({block.phase})
                                </span>
                              </div>
                              <p
                                className={`text-[9px] font-medium leading-none ml-4 ${isSelected ? "text-white/70" : "text-[#4C4A4B]/60"}`}
                              >
                                {activeCount === 0
                                  ? "No Active Milestones"
                                  : activeCount === 1
                                    ? "1 Active Milestone"
                                    : `${activeCount} Active Milestones`}
                              </p>
                            </div>
                            {activeCount > 0 && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${isSelected ? "bg-white/20 text-white" : `${colorInfo.bgLight} ${colorInfo.text}`}`}
                              >
                                {activeCount} Active
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`bg-white border border-[#D8D8D8] rounded-[24px] overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 ${showDetailPanel ? "xl:col-span-6" : "xl:col-span-9"}`}
        >
          <div className="p-5 border-b border-[#D8D8D8] flex flex-wrap justify-between items-center bg-[#F9F8F6]/30 gap-4">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-[#1C6048]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#1E2F31]">
                Timeline Mapping Canvas
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[9px] text-[#4C4A4B] font-extrabold uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-xl border border-[#D8D8D8]/50 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#1C6048] rounded-full"></span>{" "}
                Planning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#9B8B70] rounded-full"></span>{" "}
                Licensing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#1E2F31] rounded-full"></span>{" "}
                Construction
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#99B6AA] rounded-full"></span>{" "}
                Commissioning
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDetailPanel(!showDetailPanel)}
                className="px-3 py-1 bg-white hover:bg-[#EFEBE7] border border-[#D8D8D8] rounded-[10px] text-[9px] font-black uppercase text-[#1E2F31] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {showDetailPanel ? (
                  <EyeOff size={11} className="text-[#9B8B70]" />
                ) : (
                  <Eye size={11} className="text-[#1C6048]" />
                )}
                {showDetailPanel ? "Hide Details" : "Show Details"}
              </button>
              <span className="text-[10px] text-[#4C4A4B] font-bold bg-[#EFEBE7] px-2 py-0.5 rounded border border-[#D8D8D8]">
                Active Range Focus
              </span>
            </div>
          </div>
          <div
            ref={timelineScrollRef}
            className="overflow-x-auto custom-scrollbar w-full flex-1"
          >
            <div
              style={{ width: `${totalTimelineWidth}px` }}
              className="pb-6 relative select-none"
            >
              <div className="flex border-b border-[#D8D8D8] sticky top-0 bg-white z-20 shadow-sm">
                <div className="w-44 px-4 py-3 text-[10px] font-black uppercase text-[#9B8B70] text-left border-r border-[#EFEBE7]/60 bg-white sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-center justify-between">
                  <span>Milestone Task</span>
                  <button
                    type="button"
                    onClick={toggleAllGroups}
                    className="p-1 rounded bg-[#F9F8F6] hover:bg-[#EFEBE7] border border-[#D8D8D8] text-[#1E2F31] transition-all hover:scale-105"
                    title={
                      allGroupsCollapsed
                        ? "Expand All Stages"
                        : "Collapse All Stages"
                    }
                  >
                    {allGroupsCollapsed ? (
                      <ChevronsUpDown size={12} />
                    ) : (
                      <ChevronsDownUp size={12} />
                    )}
                  </button>
                </div>
                <div className="w-28 px-2 py-3 text-[10px] font-black uppercase text-[#9B8B70] text-center border-r border-[#D8D8D8] bg-white sticky left-44 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Schedule
                </div>
                <div className="flex">
                  {TIMELINE_MONTHS.map((m) => {
                    const isSelected = selectedMonthIndex === m.num;
                    const isInBlock = isMonthInActiveBlock(m.num);
                    const monthColor = getMonthColorInfo(m.num);
                    let headerBgClass = "text-[#1E2F31] hover:bg-[#F9F8F6]";
                    if (isSelected && monthColor)
                      headerBgClass = `${monthColor.bgSelected} text-white font-extrabold`;
                    else if (isInBlock && monthColor)
                      headerBgClass = `${monthColor.bgLight} ${monthColor.text} font-extrabold`;
                    return (
                      <div
                        key={m.num}
                        onClick={() => setSelectedMonthIndex(m.num)}
                        className={`w-16 py-3 text-[9px] font-black uppercase tracking-tighter text-center border-r border-[#EFEBE7] transition-all cursor-pointer ${headerBgClass}`}
                      >
                        {m.name.split(" ")[0]}
                        <br />'{m.name.split(" ")[1]}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    disabled={endYear >= 2035}
                    onClick={() =>
                      setEndYear((prev) => Math.min(2035, prev + 1))
                    }
                    className="w-16 py-3 text-[9px] font-black uppercase tracking-tighter text-center bg-[#E8EFEA] hover:bg-[#1C6048] hover:text-white text-[#1C6048] border-r border-b border-[#D8D8D8] transition-all flex flex-col items-center justify-center gap-0.5 shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                    title="Add 1 Year to Timeline"
                  >
                    <Plus size={12} />
                    <span>+ Yr</span>
                  </button>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none flex">
                <div className="w-44 border-r border-[#EFEBE7]/60 bg-white/20 sticky left-0 z-10"></div>
                <div className="w-28 border-r border-[#D8D8D8] bg-white/20 sticky left-44 z-10"></div>
                <div className="flex">
                  {TIMELINE_MONTHS.map((m) => {
                    const isSelected = selectedMonthIndex === m.num;
                    const isInBlock = isMonthInActiveBlock(m.num);
                    const monthColor = getMonthColorInfo(m.num);
                    let guideStyle =
                      "w-16 h-full border-r border-[#EFEBE7]/40 relative last:border-0";
                    if (isSelected && monthColor)
                      guideStyle += ` ${monthColor.bgLight} border-l border-r border-dashed ${monthColor.borderDashed}`;
                    else if (isInBlock && monthColor)
                      guideStyle += ` ${monthColor.bgLight}`;
                    return (
                      <div key={m.num} className={guideStyle}>
                        {m.num === 5 && (
                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#1C6048] opacity-60 z-10">
                            <div className="absolute top-4 -translate-x-1/2 bg-[#1C6048] text-white text-[7px] px-1 rounded uppercase font-black">
                              Now
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="w-16 h-full border-r border-b border-[#EFEBE7]/20"></div>
                </div>
              </div>
              <div className="relative z-10">
                {groups.map((group) => {
                  const isExpanded = expandedGroups[group.id];
                  const visibleTasks = group.tasks.filter(
                    (t) =>
                      t.name
                        .toLowerCase()
                        .includes(timelineSearch.toLowerCase()) ||
                      group.name
                        .toLowerCase()
                        .includes(timelineSearch.toLowerCase()),
                  );
                  if (visibleTasks.length === 0) return null;
                  return (
                    <div
                      key={group.id}
                      className="border-b border-[#D8D8D8]/50 last:border-0"
                    >
                      <div className="flex items-center bg-[#F9F8F6]/90 border-b border-[#EFEBE7] h-10 select-none">
                        <div
                          onClick={() => toggleGroup(group.id)}
                          className="w-72 sticky left-0 bg-[#F9F8F6] px-4 py-2 flex items-center gap-1.5 text-[10px] font-black uppercase text-[#1E2F31] cursor-pointer border-r border-[#D8D8D8] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0 h-full"
                        >
                          {isExpanded ? (
                            <ChevronDown size={14} className="text-[#9B8B70]" />
                          ) : (
                            <ChevronRight
                              size={14}
                              className="text-[#9B8B70]"
                            />
                          )}
                          <span
                            className={`w-2.5 h-2.5 rounded bg-gradient-to-r ${group.color}`}
                          ></span>
                          <span className="truncate">{group.name}</span>
                        </div>
                        <div className="flex-1 h-full relative flex items-center">
                          {groupSummaryBars[group.id] && (
                            <div
                              className={`h-2.5 rounded-full absolute transition-all duration-300 opacity-60 bg-gradient-to-r ${group.color} border border-white/20`}
                              style={{
                                left: `${(groupSummaryBars[group.id].start - 1) * monthWidth}px`,
                                width: `${groupSummaryBars[group.id].duration * monthWidth}px`,
                              }}
                              title={`${group.name} Span: ${getTaskDateRangeString(groupSummaryBars[group.id].start, groupSummaryBars[group.id].duration)}`}
                            ></div>
                          )}
                        </div>
                      </div>
                      {isExpanded &&
                        visibleTasks.map((task) => {
                          const isSelected = selectedTaskId === task.id;
                          const isCriticalPath =
                            task.critical && highlightCritical;
                          const isActiveInSelectedMonth =
                            activeTasksForSelectedMonth.includes(task.id);
                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setIsCreatingTask(false);
                                setShowDetailPanel(true);
                              }}
                              className={`flex items-center transition-all cursor-pointer border-b border-[#EFEBE7]/30 last:border-0 ${isSelected ? "bg-[#EFEBE7]/80" : "hover:bg-[#F9F8F6]"}`}
                            >
                              <div className="w-44 px-4 py-3 flex items-center gap-2 border-r border-[#EFEBE7]/60 sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCriticalPath ? "bg-[#9B8B70] animate-pulse" : "bg-transparent"}`}
                                ></span>
                                <span className="text-[8px] font-black text-[#9B8B70] uppercase shrink-0">
                                  [{task.id.toUpperCase()}]
                                </span>
                                <p
                                  className={`text-[10px] truncate ${isSelected ? "font-extrabold text-[#1C6048]" : "text-[#1E2F31]"}`}
                                  title={task.name}
                                >
                                  {task.name}
                                </p>
                                {taskConflicts[task.id] && (
                                  <AlertTriangle
                                    size={11}
                                    className="text-amber-500 shrink-0 select-none animate-bounce"
                                    title={`Schedule Clash: ${taskConflicts[task.id][0]}`}
                                  />
                                )}
                              </div>
                              <div className="w-28 px-2 py-3 border-r border-[#D8D8D8] sticky left-44 bg-white z-20 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0">
                                <span className="text-[9px] font-mono font-black text-[#4C4A4B] bg-[#EFEBE7] px-1.5 py-0.5 rounded whitespace-nowrap">
                                  {getTaskDateRangeString(
                                    task.start,
                                    task.duration,
                                  )}
                                </span>
                              </div>
                              <div className="flex-1 h-12 relative flex items-center">
                                <div
                                  className={`h-4.5 rounded-full absolute transition-all duration-300 flex items-center justify-between overflow-hidden shadow-sm ${isActiveInSelectedMonth ? "ring-2 ring-[#1E2F31] ring-offset-1" : ""} ${isCriticalPath ? "bg-gradient-to-r from-[#9B8B70] to-[#B5A58A]" : `bg-gradient-to-r ${group.color}`}`}
                                  style={{
                                    left: `${(task.start - 1) * monthWidth}px`,
                                    width: `${(parseInt(task.duration) || 1) * monthWidth}px`,
                                  }}
                                >
                                  <div
                                    className="absolute top-0 bottom-0 left-0 bg-white/20"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                  {task.duration >= 3 && (
                                    <span className="text-[8px] font-black text-white uppercase ml-3.5 z-10 mix-blend-overlay">
                                      {task.progress}% Complete
                                    </span>
                                  )}
                                  {isCriticalPath && (
                                    <ShieldAlert
                                      size={10}
                                      className="text-white mr-3.5 z-10 shrink-0"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#D8D8D8] bg-[#F9F8F6]/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-[#4C4A4B] font-medium shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#1C6048]" /> Complete
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="text-[#9B8B70]" /> Underway
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#4C4A4B]/60" /> Future Phase
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 text-[#1E2F31]">
                <Info size={13} className="text-[#9B8B70]" /> Click months in
                sidebar indexer to auto-scroll canvas.
              </div>
              <button
                onClick={() => {
                  setIsCreatingTask(true);
                  setSelectedTaskId(null);
                  setShowDetailPanel(true);
                }}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all bg-[#1C6048] hover:bg-opacity-95 text-white border border-[#1C6048] shadow-sm shrink-0"
              >
                <Plus size={12} /> Add Milestone
              </button>
            </div>
          </div>
        </div>

        {showDetailPanel && (
          <div className="xl:col-span-3 flex flex-col gap-6">
            {isCreatingTask ? (
              <form
                onSubmit={handleTaskCreate}
                className="bg-white border border-[#D8D8D8] rounded-[24px] p-5 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300"
              >
                <div className="flex justify-between items-center pb-2 border-b border-[#EFEBE7]">
                  <h3 className="text-sm font-black text-[#1E2F31] uppercase tracking-tight flex items-center gap-2">
                    <Plus size={16} className="text-[#1C6048]" /> New Milestone
                  </h3>
                  <span className="text-[9px] text-[#4C4A4B] font-bold uppercase">
                    Wizard
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Procurement Sweep"
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Project Stage
                  </label>
                  <select
                    value={newTask.groupId}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, groupId: e.target.value }))
                    }
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none cursor-pointer"
                  >
                    <option value="design">1. Design & Planning</option>
                    <option value="licensing">2. Licensing & Regulatory</option>
                    <option value="construction">
                      3. Civil & Construction
                    </option>
                    <option value="equipment">4. Equipment & Launch</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="space-y-1.5 relative"
                    ref={
                      activeMonthPicker?.type === "create" ? pickerRef : null
                    }
                  >
                    <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                      Start Month
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeMonthPicker?.type === "create")
                          setActiveMonthPicker(null);
                        else
                          openMonthPicker("create", newTask.start, (val) =>
                            setNewTask((p) => ({ ...p, start: val })),
                          );
                      }}
                      className="w-full p-2 bg-[#F9F8F6] hover:bg-[#EFEBE7]/50 border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] flex items-center justify-between transition-colors shadow-sm text-left h-[34px] relative z-10"
                    >
                      <span>
                        {TIMELINE_MONTHS[
                          Math.min(Math.max(1, newTask.start), maxMonths) - 1
                        ]?.name || "Select"}
                      </span>
                      <ChevronDown size={14} className="text-[#9B8B70]" />
                    </button>
                    {activeMonthPicker?.type === "create" && (
                      <div className="absolute right-0 bottom-full mb-2 z-50 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 w-64 shadow-[0_12px_40px_rgba(30,47,49,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] animate-in fade-in slide-in-from-bottom-2 duration-150">
                        {renderInlineCalendarContent(activeMonthPicker)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={maxMonths}
                      value={newTask.duration}
                      onChange={(e) =>
                        setNewTask((p) => ({ ...p, duration: e.target.value }))
                      }
                      onFocus={() => {
                        lastValidValRef.current = newTask.duration;
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        const fallback =
                          lastValidValRef.current !== null
                            ? lastValidValRef.current
                            : 4;
                        const cleanVal =
                          isNaN(val) || val < 1
                            ? fallback
                            : Math.min(maxMonths, val);
                        setNewTask((p) => ({ ...p, duration: cleanVal }));
                      }}
                      className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-black text-[#9B8B70] uppercase">
                    <span>Initial Progress</span>
                    <span>{newTask.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={(e) =>
                      setNewTask((p) => ({
                        ...p,
                        progress: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-[#D8D8D8] rounded-lg appearance-none cursor-pointer accent-[#1C6048]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Milestone Owner
                  </label>
                  <input
                    type="text"
                    value={newTask.owner}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, owner: e.target.value }))
                    }
                    placeholder="e.g. Clinical Director"
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Detailed Description
                  </label>
                  <textarea
                    value={newTask.desc}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, desc: e.target.value }))
                    }
                    placeholder="Summarize the core target vectors..."
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-[10px] font-medium text-[#4C4A4B] focus:ring-1 focus:ring-[#1C6048] outline-none h-14 resize-none leading-snug"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                  <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                    Critical Path Task?
                  </span>
                  <input
                    type="checkbox"
                    checked={newTask.critical}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, critical: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1C6048] accent-[#1C6048] border-[#D8D8D8] cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTask(false)}
                    className="py-2 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 rounded-xl text-xs font-bold text-white bg-[#1C6048] hover:bg-opacity-95 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : selectedTask ? (
              <div className="bg-white border border-[#D8D8D8] rounded-[24px] p-5 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2.5 py-1 rounded text-[8px] font-black uppercase text-white bg-gradient-to-r ${selectedTask.groupColor}`}
                  >
                    {selectedTask.groupName.split(" ")[1]} Milestone
                  </span>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to permanently delete "${selectedTask.name}"?`,
                        )
                      )
                        handleTaskDelete(selectedTask.groupId, selectedTask.id);
                    }}
                    className="text-gray-400 hover:text-[#9B8B70] transition-colors p-1 bg-[#F9F8F6] border border-[#D8D8D8] rounded-lg"
                    title="Delete Milestone"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    value={selectedTask.name}
                    onChange={(e) =>
                      handleTaskUpdate(
                        selectedTask.groupId,
                        selectedTask.id,
                        "name",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                  />
                  <textarea
                    value={selectedTask.desc}
                    onChange={(e) =>
                      handleTaskUpdate(
                        selectedTask.groupId,
                        selectedTask.id,
                        "desc",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-[10px] font-medium text-[#4C4A4B] focus:ring-1 focus:ring-[#1C6048] outline-none h-14 resize-none leading-snug"
                  />
                </div>
                <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#D8D8D8] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#4C4A4B]">
                    <span>WORK PROGRESS</span>
                    <span
                      className={
                        selectedTask.progress === 100
                          ? "text-[#1C6048] font-black"
                          : "text-[#9B8B70] font-black"
                      }
                    >
                      {selectedTask.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    onChange={(e) =>
                      handleTaskUpdate(
                        selectedTask.groupId,
                        selectedTask.id,
                        "progress",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full h-1.5 bg-[#D8D8D8] rounded-lg appearance-none cursor-pointer accent-[#1C6048]"
                  />
                </div>
                <div className="border border-[#D8D8D8] rounded-2xl divide-y divide-[#D8D8D8] bg-white">
                  <div className="flex justify-between p-3 text-[10px] bg-[#F9F8F6]/30 items-center rounded-t-2xl">
                    <span className="font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5">
                      <Users size={14} className="text-[#9B8B70]" /> Owner
                    </span>
                    <input
                      type="text"
                      value={selectedTask.owner}
                      onChange={(e) =>
                        handleTaskUpdate(
                          selectedTask.groupId,
                          selectedTask.id,
                          "owner",
                          e.target.value,
                        )
                      }
                      className="w-28 p-1 text-right border border-[#D8D8D8] rounded font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                    />
                  </div>
                  <div
                    className="flex justify-between p-3 text-[10px] bg-[#F9F8F6]/30 items-center relative"
                    ref={activeMonthPicker?.type === "edit" ? pickerRef : null}
                  >
                    <span className="font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#99B6AA]" /> Start
                      Month
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeMonthPicker?.type === "edit")
                          setActiveMonthPicker(null);
                        else
                          openMonthPicker("edit", selectedTask.start, (val) =>
                            handleTaskUpdate(
                              selectedTask.groupId,
                              selectedTask.id,
                              "start",
                              val,
                            ),
                          );
                      }}
                      className="w-28 p-1 bg-white hover:bg-[#F9F8F6]/80 border border-[#D8D8D8] rounded font-bold text-[#1E2F31] text-right text-[10px] flex items-center justify-between px-2 h-[26px] relative z-10"
                    >
                      <span>
                        {TIMELINE_MONTHS[
                          Math.min(Math.max(1, selectedTask.start), maxMonths) -
                            1
                        ]?.name || "Select"}
                      </span>
                      <ChevronDown
                        size={12}
                        className="text-[#9B8B70] ml-1 shrink-0"
                      />
                    </button>
                    {activeMonthPicker?.type === "edit" && (
                      <div className="absolute right-3 bottom-full mb-1 z-50 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 w-64 shadow-[0_12px_40px_rgba(30,47,49,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] animate-in fade-in slide-in-from-bottom-2 duration-150 text-left animate-out">
                        {renderInlineCalendarContent(activeMonthPicker)}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between p-3 text-[10px] bg-[#F9F8F6]/30 items-center rounded-b-2xl">
                    <span className="font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5">
                      <Clock size={14} className="text-[#9B8B70]" /> Duration
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max={maxMonths - selectedTask.start + 1}
                        value={selectedTask.duration}
                        onChange={(e) =>
                          handleTaskUpdate(
                            selectedTask.groupId,
                            selectedTask.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        onFocus={() => {
                          lastValidValRef.current = selectedTask.duration;
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          const fallback =
                            lastValidValRef.current !== null
                              ? lastValidValRef.current
                              : 1;
                          const cleanVal =
                            isNaN(val) || val < 1
                              ? fallback
                              : Math.min(
                                  maxMonths - selectedTask.start + 1,
                                  val,
                                );
                          handleTaskUpdate(
                            selectedTask.groupId,
                            selectedTask.id,
                            "duration",
                            cleanVal,
                          );
                        }}
                        className="w-12 p-1 text-right border border-[#D8D8D8] rounded font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                      />
                      <span className="font-bold text-[#4C4A4B] text-[9px] uppercase">
                        Mos
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[#9B8B70] tracking-wider mb-2">
                    Target Dependencies
                  </h4>
                  {(selectedTask.dependencies || []).length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {(selectedTask.dependencies || []).map((depId) => {
                        const depName = getTaskNameById(depId);
                        return (
                          <div
                            key={depId}
                            onClick={() => setSelectedTaskId(depId)}
                            className="px-3 py-2 bg-[#EFEBE7] hover:bg-[#D8D8D8] rounded-xl border border-[#D8D8D8] text-[10px] font-bold text-[#1E2F31] cursor-pointer transition-colors flex items-center justify-between group shadow-sm"
                            title={`Click to focus predecessor: ${depName}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ArrowRight
                                size={10}
                                className="text-[#9B8B70] group-hover:translate-x-0.5 transition-transform"
                              />
                              <span className="text-[#9B8B70] shrink-0 font-extrabold">
                                {depId.toUpperCase()}:
                              </span>
                              <span className="truncate text-[#4C4A4B] group-hover:text-[#1E2F31]">
                                {depName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#4C4A4B]/60 italic font-medium">
                      None. This is an initial parent task.
                    </span>
                  )}
                </div>
                {selectedTask.critical && highlightCritical && (
                  <div className="p-4 bg-[#EFEBE7] border border-[#9B8B70]/30 rounded-2xl flex items-start gap-3">
                    <ShieldAlert
                      size={18}
                      className="text-[#9B8B70] shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#1E2F31]">
                        Critical Path Notice
                      </h4>
                      <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-medium mt-1">
                        Delays in this milestone directly disrupt downstream
                        equipment fitment, nuclear physics calibration, and
                        final commercial opening.
                      </p>
                    </div>
                  </div>
                )}
                {selectedTaskConflicts && selectedTaskConflicts.length > 0 && (
                  <div className="p-4 bg-[#F9F8F6] border-2 border-amber-500/40 rounded-2xl flex flex-col gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={18}
                        className="text-amber-600 shrink-0 mt-0.5 animate-pulse"
                      />
                      <div>
                        <h4 className="font-extrabold text-xs text-[#1E2F31] uppercase tracking-wider">
                          Timeline Clash Warning
                        </h4>
                        <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-bold mt-1">
                          We detected sequencing issues that are unrealistic or
                          conflict with predecessors:
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 pl-7">
                      {selectedTaskConflicts.map((msg, idx) => (
                        <p
                          key={idx}
                          className="text-[10px] text-[#1E2F31] font-bold leading-normal relative before:content-['•'] before:absolute before:-left-3 before:text-[#9B8B70]"
                        >
                          {msg}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#D8D8D8] rounded-[24px] p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
                <HelpCircle size={40} className="text-[#D8D8D8] mb-4" />
                <p className="text-xs text-[#4C4A4B] font-bold uppercase tracking-wider">
                  No Milestone Selected
                </p>
                <p className="text-[10px] text-[#4C4A4B]/60 font-medium mt-2 max-w-[200px]">
                  Click any element on the timeline or click "+ Add Milestone"
                  to construct new tasks.
                </p>
              </div>
            )}
            <div className="bg-[#EFEBE7] rounded-[24px] p-6 border border-[#D8D8D8] flex flex-col gap-4">
              <h3 className="font-black text-xs text-[#1E2F31] uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-[#1C6048]" /> Moat Milestone
                Strategy
              </h3>
              <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium">
                By securing the <strong>BAPETEN Nuclear Licensing</strong> in
                Phase 2 (Months 9-16), we lock in our legal monopoly. Since no
                general competitor in the Tangerang sector holds these
                permissions, this approval protects our oncology revenues even
                before physical construction is finalized.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================

// --- GLASSMORPHISM CSS INJECTION ---
const style = document.createElement("style");
style.textContent = `
    .glass-tooltip-container {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }
    .glass-tooltip-container .leaflet-tooltip-tip {
        display: none;
    }
    .glass-region-label {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 12px;
        padding: 10px 16px;
        color: #1E2F31;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        pointer-events: none;
    }
    .glass-title { font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1C6048; }
    .glass-sub { font-size: 11px; font-weight: 700; color: #4C4A4B; margin-top: 2px; display: block; }
`;
document.head.appendChild(style);

const SettingsPasswordGate = ({ children }) => {
  return children;
};

export const useMonthlyColumns = (monthlyData, viewResolution = "annual") => {
  const [expandedYears, setExpandedYears] = useState({});
  const toggleYear = (yr) =>
    setExpandedYears((prev) => ({ ...prev, [yr]: !prev[yr] }));

  const columns = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    let cols = [];

    // Check if the input is monthly data with repeated years
    const yearCounts = {};
    monthlyData.forEach((d) => {
      yearCounts[d.year] = (yearCounts[d.year] || 0) + 1;
    });
    const isMonthlyInput = Object.values(yearCounts).some(
      (count) => (count as number) > 1,
    );

    if (isMonthlyInput) {
      // Group monthly data by year
      const yearsMap = {};
      monthlyData.forEach((d) => {
        if (!yearsMap[d.year]) {
          yearsMap[d.year] = [];
        }
        yearsMap[d.year].push(d);
      });

      const sortedYears = Object.keys(yearsMap)
        .map(Number)
        .sort((a, b) => a - b);

      sortedYears.forEach((yr) => {
        const months = yearsMap[yr];

        // Compute aggregated annual values
        const isRate = [
          "bor",
          "ebitdaMargin",
          "netMargin",
          "breakEvenBor",
          "pA_Yield",
          "pB_Yield",
          "avgDscr",
          "avgYield",
          "moic",
          "costPerBed",
          "costPerSqm",
          "yocExLand",
          "irr",
          "lpIrr",
          "gpIrr",
          "isOperating",
          "dscr",
        ];
        const isBalance = ["debtBalance", "debtBalanceExLand"];

        let annualObj = {
          year: yr,
          month: `Year ${yr}`,
          isOperating: months.some((m) => m.isOperating),
          colType: "year",
          defaultLabel: yr,
        };

        Object.keys(months[0]).forEach((k) => {
          if (k === "year" || k === "month" || k === "isOperating") return;
          if (typeof months[0][k] === "number") {
            if (isBalance.includes(k)) {
              // Balance: end of year status
              annualObj[k] = months[months.length - 1][k] || 0;
            } else if (isRate.includes(k)) {
              // Average non-zero rate
              const nonZero = months
                .map((m) => m[k] || 0)
                .filter((v) => v !== 0);
              annualObj[k] =
                nonZero.length > 0
                  ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
                  : 0;
            } else if (
              k === "cumNI" ||
              k === "cumulativeRetainedEarnings" ||
              k === "pA_Cum" ||
              k === "pB_Cum" ||
              k === "cumFcfe" ||
              k === "cumFcfeExLand" ||
              k === "cumFreeCashFlow" ||
              k === "cumCf"
            ) {
              // Cumulative attributes: take end of year value
              annualObj[k] = months[months.length - 1][k] || 0;
            } else {
              // Flow fields: sum values
              annualObj[k] = months.reduce((sum, m) => sum + (m[k] || 0), 0);
            }
          } else if (typeof months[0][k] === "boolean") {
            annualObj[k] = months.some((m) => m[k]);
          }
        });

        if (viewResolution !== "monthly") {
          cols.push(annualObj);
        }

        if (expandedYears[yr] || viewResolution === "monthly") {
          months.forEach((m, idx) => {
            const monthLabel =
              viewResolution === "monthly"
                ? `${String(yr).slice(-2)} M${idx + 1}`
                : `M${idx + 1}`;
            cols.push({
              ...m,
              colType: "month",
              defaultLabel: monthLabel,
              isMonth: true,
              parentYear: yr,
            });
          });
        }
      });
    } else {
      // Input is already annual data (from operation model)
      monthlyData.forEach((d) => {
        if (viewResolution !== "monthly") {
          cols.push({ ...d, colType: "year", defaultLabel: d.year });
        }

        if (expandedYears[d.year] || viewResolution === "monthly") {
          for (let m = 1; m <= 12; m++) {
            let monthLabel =
              viewResolution === "monthly"
                ? `${String(d.year).slice(-2)} M${m}`
                : `M${m}`;
            let monthData = {
              ...d,
              colType: "month",
              defaultLabel: monthLabel,
              isMonth: true,
              parentYear: d.year,
            };
            const isRate = [
              "bor",
              "ebitdaMargin",
              "netMargin",
              "breakEvenBor",
              "pA_Yield",
              "pB_Yield",
              "avgDscr",
              "avgYield",
              "moic",
              "costPerBed",
              "costPerSqm",
              "yocExLand",
              "irr",
              "lpIrr",
              "gpIrr",
              "isOperating",
              "year",
              "colType",
              "defaultLabel",
              "isMonth",
              "parentYear",
            ];
            const isBalance = ["debtBalance", "debtBalanceExLand"];
            Object.keys(d).forEach((k) => {
              if (
                !isRate.includes(k) &&
                !isBalance.includes(k) &&
                typeof d[k] === "number"
              ) {
                if (
                  k === "cumNI" ||
                  k === "cumulativeRetainedEarnings" ||
                  k === "pA_Cum" ||
                  k === "pB_Cum" ||
                  k === "cumFcfe" ||
                  k === "cumFcfeExLand" ||
                  k === "cumFreeCashFlow" ||
                  k === "cumCf"
                ) {
                  let flowKey = "";
                  if (k === "cumNI") flowKey = "netIncome";
                  if (k === "cumulativeRetainedEarnings")
                    flowKey = "retainedThisYear";
                  if (k === "pA_Cum") flowKey = "pA_Net";
                  if (k === "pB_Cum") flowKey = "pB_Net";
                  if (k === "cumFcfe") flowKey = "fcfe";
                  if (k === "cumFcfeExLand") flowKey = "fcfeExLand";
                  if (k === "cumFreeCashFlow") flowKey = "freeCashFlow";
                  if (k === "cumCf") flowKey = "netFlow";

                  const flow = d[flowKey] || 0;
                  const startBase = d[k] - flow;
                  monthData[k] = startBase + (flow / 12) * m;
                } else {
                  monthData[k] = d[k] / 12;
                }
              }
            });
            cols.push(monthData);
          }
        }
      });
    }
    return cols;
  }, [monthlyData, expandedYears, viewResolution]);

  return { columns, expandedYears, toggleYear };
};

export default function App() {
  const [activeGroup, setActiveGroup] = useState("financials"); // 'context' or 'financials'
  const [activeCompany, setActiveCompany] = useState("asset");
  const [activeTab, setActiveTab] = useState("assumptions");
  const [assetClusterFilter, setAssetClusterFilter] = useState("Glamping");
  const [isClusterDropdownOpen, setIsClusterDropdownOpen] = useState(false);
  const [viewResolution, setViewResolution] = useState("annual");
  const [isLockedOperation, setIsLockedOperation] = useState(true);
  const [isLockedAsset, setIsLockedAsset] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [hubPosition, setHubPosition] = useState("center"); // 'center', 'left', 'right', 'minimized'
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = useState(false);

  // Cloud Sync State
  const [isCloudSync, setIsCloudSync] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("offline");
  const [user, setUser] = useState(null);

  const [projectInfo, setProjectInfo] = useState({
    name: "Vasanta Eco-City Development",
    location: "Waingapu Area",
    type: "Mixed-Use / Eco-City",
    totalLand: "419,511 Sqm",
    totalBuilding: "TBD",
    status: "Planning / Feasibility Phase",
    zoning: "K1 - Trade & Services",
    landTitle: "Right to Build (HGB)",
    bcr: "55%",
    far: "6.39",
    greenArea: "20%",
  });

  const [aiInsights, setAiInsights] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [teaserContent, setTeaserContent] = useState("");
  const [isTeaserLoading, setIsTeaserLoading] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [marketValidation, setMarketValidation] = useState("");
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [showMarketValidation, setShowMarketValidation] = useState(false);
  const [askQuery, setAskQuery] = useState("");
  const [askResponse, setAskResponse] = useState("");
  const [isAskLoading, setIsAskLoading] = useState(false);
  const [selectionState, setSelectionState] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
    isOpen: false,
    query: "",
    response: "",
    isLoading: false,
  });

  // Confirmation Dialog State
  const [syncConfirmDialog, setSyncConfirmDialog] = useState({
    isOpen: false,
    targetState: false,
  });

  const [saveStatusOperation, setSaveStatusOperation] = useState("idle");
  const [saveStatusAsset, setSaveStatusAsset] = useState("idle");

  const [operationAssumptions, setOperationAssumptions] = useState(
    DEFAULT_OPERATION_ASSUMPTIONS,
  );
  const [assetAssumptions, setAssetAssumptions] = useState(
    INITIAL_ASSET_CLUSTERS_ASSUMPTIONS,
  );
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  const [consolidatedScenario, setConsolidatedScenario] = useState("manual");
  // --- PRESENTATION NAVIGATION LOGIC ---
  const presentationSteps = useMemo(
    () => [
      {
        group: "context",
        tab: "overview",
        company: "operation",
        label: "1. Project Context",
      },
      {
        group: "context",
        tab: "map",
        company: "operation",
        label: "2. Site Map",
      },
      {
        group: "context",
        tab: "collab",
        company: "operation",
        label: "3. Collaboration Model",
      },
      {
        group: "financials",
        tab: "timeline",
        company: "asset",
        label: "4. Master Timeline",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "asset",
        label: "5. Unified Financial Model",
      },
    ],
    [],
  );

  const currentSlideIndex = presentationSteps.findIndex(
    (s) =>
      s.group === activeGroup &&
      (activeGroup === "context"
        ? s.tab === activeTab
        : s.company === activeCompany && s.tab === "dashboard"),
  );
  const safeSlideIndex = Math.max(0, currentSlideIndex);

  const goToNextSlide = () => {
    if (safeSlideIndex < presentationSteps.length - 1) {
      const next = presentationSteps[safeSlideIndex + 1];
      setActiveGroup(next.group);
      setActiveTab(next.tab);
      setActiveCompany(next.company);
    }
  };

  const goToPrevSlide = () => {
    if (safeSlideIndex > 0) {
      const prev = presentationSteps[safeSlideIndex - 1];
      setActiveGroup(prev.group);
      setActiveTab(prev.tab);
      setActiveCompany(prev.company);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea
      const tag = (e.target || e.srcElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "F5") {
        e.preventDefault();
        if (!isPresenting) {
          setIsPresenting(true);
        }
        return;
      }

      if (!isPresenting) return;

      if (
        e.key === "PageDown" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "AudioVolumeDown" ||
        e.key === "VolumeDown"
      ) {
        e.preventDefault();
        goToNextSlide();
      } else if (
        e.key === "PageUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "AudioVolumeUp" ||
        e.key === "VolumeUp"
      ) {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, safeSlideIndex, presentationSteps.length]);

  const projConfig = useMemo(() => {
    if (consolidatedScenario === "manual")
      return {
        exitYear: operationAssumptions.includeTerminalValue ? 10 : -1,
        projYears: 10,
        startYear: START_YEAR,
      };
    if (consolidatedScenario === "none") {
      const y = Math.max(
        15,
        (assetAssumptions.global?.loanTenor ??
          assetAssumptions.loanTenor ??
          15) + 2,
      );
      return {
        exitYear: -1,
        projYears: Math.min(y, 30),
        startYear: START_YEAR,
      };
    }
    if (consolidatedScenario === "yr10")
      return { exitYear: 10, projYears: 10, startYear: START_YEAR };
    if (consolidatedScenario === "debt_free") {
      const y = Math.max(
        1,
        assetAssumptions.global?.loanTenor ?? assetAssumptions.loanTenor ?? 15,
      );
      return {
        exitYear: Math.min(y, 30),
        projYears: Math.min(y, 30),
        startYear: START_YEAR,
      };
    }
    if (consolidatedScenario === "breakeven") {
      const p1 = { exitYear: -1, projYears: 30, startYear: START_YEAR }; // -1 forces the engine to ignore individual settings and test pure operations
      const pr1 = runConsolidatedAssetEngine(assetAssumptions, p1, groups);

      let beOpYear = 30;
      const pb = pr1.metrics?.operatingPayback || 0;
      if (pb > 0) {
        const devYears = Math.max(
          1,
          Math.ceil(
            (assetAssumptions.global?.devDurationMonths ??
              assetAssumptions.devDurationMonths ??
              12) / 12,
          ),
        );
        beOpYear = Math.max(1, Math.ceil(pb - devYears));
      }

      return {
        exitYear: Math.min(beOpYear, 30),
        projYears: Math.min(beOpYear, 30),
        startYear: START_YEAR,
      };
    }
    return { exitYear: 10, projYears: 10, startYear: START_YEAR };
  }, [consolidatedScenario, operationAssumptions, assetAssumptions, groups]);

  const operationModelData = useMemo(
    () => runOperationEngine(operationAssumptions, projConfig),
    [operationAssumptions, projConfig],
  );
  const assetModelData = useMemo(
    () => runConsolidatedAssetEngine(assetAssumptions, projConfig, groups),
    [assetAssumptions, projConfig, groups],
  );
  const activeAssetData = useMemo(() => {
    if (assetClusterFilter === "consolidated") {
      return assetModelData;
    }
    return assetModelData.clustersData?.[assetClusterFilter] || assetModelData;
  }, [assetClusterFilter, assetModelData]);

  const activeAssetAssumptions = useMemo(() => {
    if (assetClusterFilter === "consolidated") {
      return assetAssumptions.global || assetAssumptions;
    }
    return {
      ...(assetAssumptions.global || {}),
      ...(assetAssumptions.clusters?.[assetClusterFilter] || {}),
    };
  }, [assetClusterFilter, assetAssumptions]);

  const consolidatedModelData = assetModelData;

  // Synchronize dynamic model parameters with timeline tasks (Option A)
  useEffect(() => {
    if (!assetModelData?.capexDetails) return;
    const details = assetModelData.capexDetails;

    // Construction timing
    const buildStart = 1;
    const buildDuration = Math.max(
      1,
      activeAssetAssumptions.devDurationMonths || 12,
    );

    let changed = false;
    const newGroups = groups.map((g) => {
      const newTasks = g.tasks.map((task) => {
        let updatedTask = { ...task };
        let costToSet = task.cost;
        let startToSet = task.start;
        let durationToSet = task.duration;

        // Map task costs from capexDetails
        if (task.id === "c1" || task.name === "Land Acquisition") {
          costToSet = Math.round((details.landCost || 0) * 10) / 10;
        } else if (task.id === "c2" || task.name === "Licensing & Permits") {
          costToSet = Math.round((details.licenseCost || 0) * 10) / 10;
        } else if (task.id === "c3" || task.name?.includes("Consultant")) {
          costToSet = Math.round((details.consultantCost || 0) * 10) / 10;
        } else if (task.id === "c4" || task.name?.includes("FF&E")) {
          costToSet = Math.round((details.ffeCost || 0) * 10) / 10;
        } else if (task.id === "c5" || task.name?.includes("Infrastructure")) {
          costToSet = Math.round((details.infraCost || 0) * 10) / 10;
        } else if (
          task.id === "c6" ||
          task.name?.includes("Sharing Development")
        ) {
          costToSet = Math.round((details.sharingDevCost || 0) * 10) / 10;
        } else if (
          task.id === "c7" ||
          task.name === "Construction" ||
          task.name === "Hospital Construction" ||
          task.id === "t6" ||
          task.name === "Main Structure & Core"
        ) {
          costToSet = Math.round((details.buildCost || 0) * 10) / 10;
          startToSet = buildStart;
          durationToSet = buildDuration;
        } else if (
          task.id === "c8" ||
          task.name === "Medical Equipment Setup" ||
          task.id === "t10" ||
          task.name === "Oncology Asset Lease"
        ) {
          costToSet = Math.round((details.medEqCost || 0) * 10) / 10;
        }

        if (
          updatedTask.cost !== costToSet ||
          updatedTask.start !== startToSet ||
          updatedTask.duration !== durationToSet
        ) {
          updatedTask.cost = costToSet;
          updatedTask.start = startToSet;
          updatedTask.duration = durationToSet;
          changed = true;
        }
        return updatedTask;
      });

      return { ...g, tasks: newTasks };
    });

    if (changed) {
      setGroups(newGroups);
    }
  }, [assetModelData, activeAssetAssumptions.devDurationMonths]);

  // Compute Presentation Wrapper
  const containerClass = isPresenting
    ? "w-full max-w-full mx-auto px-4"
    : "w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8";

  // Navigation Logic
  const handleGroupChange = useCallback((group) => {
    setActiveGroup(group);
    if (group === "context") setActiveTab("overview");
    else setActiveTab("dashboard");
  }, []);

  const handleCompanyChange = useCallback((comp) => {
    setActiveCompany(comp);
    setActiveTab((prev) =>
      comp === "consolidated" &&
      (prev === "assumptions" || prev === "sensitivity")
        ? "dashboard"
        : prev,
    );
  }, []);

  // ==========================================
  // STABLE LOCAL-ONLY CLOUD SYNC BYPASS
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    const connectCloud = async () => {
      setCloudStatus("connecting");
      try {
        throw new Error(
          "Cloud Sync safely bypassed to maintain application stability.",
        );
      } catch (err) {
        if (isMounted) {
          setCloudStatus("error");
          setTimeout(() => setIsCloudSync(false), 3000);
        }
      }
    };
    if (isCloudSync) connectCloud();
    else {
      setCloudStatus("offline");
      setUser(null);
    }
    return () => {
      isMounted = false;
    };
  }, [isCloudSync]);

  const saveDefaultsToCloud = useCallback(
    async (type) => {
      if (!isCloudSync || cloudStatus !== "online") return;
      const setStatus =
        type === "operation" ? setSaveStatusOperation : setSaveStatusAsset;
      setStatus("saving");
      try {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (e) {
        setStatus("idle");
      }
    },
    [isCloudSync, cloudStatus],
  );

  const handleTextSelection = useCallback((e) => {
    if (e.target.closest("#ai-selection-popup")) return;
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      let safeX = Math.max(
        160,
        Math.min(
          rect.left + window.scrollX + rect.width / 2,
          document.body.clientWidth - 160,
        ),
      );
      setSelectionState({
        show: true,
        text,
        x: safeX,
        y:
          rect.top < 60
            ? rect.bottom + window.scrollY + 20
            : rect.top + window.scrollY - 60,
        isOpen: false,
        query: "",
        response: "",
        isLoading: false,
      });
    } else {
      setSelectionState((p) => (p.isOpen ? p : { ...p, show: false }));
    }
  }, []);

  const handleSelectionAsk = useCallback(async () => {
    if (!selectionState.query.trim()) return;
    setSelectionState((p) => ({ ...p, isLoading: true }));
    try {
      const res = await callGemini(selectionState.query, "Short analysis.");
      setSelectionState((p) => ({ ...p, response: res }));
    } catch (e) {
      setSelectionState((p) => ({ ...p, response: "Error." }));
    } finally {
      setSelectionState((p) => ({ ...p, isLoading: false }));
    }
  }, [selectionState.query]);

  const handleOperationChange = useCallback(
    (k, v) =>
      setOperationAssumptions((p) => ({
        ...p,
        [k]: ["includeTerminalValue", "rentStructureType"].includes(k)
          ? v
          : (v === "" ? 0 : parseFloat(v)) || 0,
      })),
    [],
  );
  const handleAssetChange = useCallback(
    (k, v, target = "global") =>
      setAssetAssumptions((p) => {
        const parsedValue = [
          "includeLand",
          "includeMedEq",
          "medEqProcurement",
          "includeFFE",
          "depMethodBuilding",
          "depMethodMedEq",
          "depMethodInfra",
          "depMethodFFE",
          "includeTerminalValue",
          "exitMethod",
          "includeFinancing",
          "seasonality",
          "glampingMix",
        ].includes(k)
          ? v
          : (v === "" ? 0 : parseFloat(v)) || 0;

        if (target === "global") {
          return {
            ...p,
            global: {
              ...(p.global || DEFAULT_ASSET_ASSUMPTIONS),
              [k]: parsedValue,
            },
          };
        } else {
          return {
            ...p,
            clusters: {
              ...(p.clusters || INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters),
              [target]: {
                ...(p.clusters?.[target] ||
                  INITIAL_ASSET_CLUSTERS_ASSUMPTIONS.clusters[target]),
                [k]: parsedValue,
              },
            },
          };
        }
      }),
    [],
  );

  const syncEquityWithSharing = useCallback(() => {
    setOperationAssumptions((p) => {
      const t = p.partnerAEquity + p.partnerBEquity;
      return {
        ...p,
        partnerAEquity: Number((t * (p.sharingPercentA / 100)).toFixed(2)),
        partnerBEquity: Number((t - t * (p.sharingPercentA / 100)).toFixed(2)),
      };
    });
  }, []);

  const generateTeaser = useCallback(async () => {
    setIsTeaserLoading(true);
    setShowTeaser(true);
    try {
      const res = await callGemini("Project Teaser", "Investment Banker");
      setTeaserContent(res || "Error.");
    } catch (e) {
      setTeaserContent("Error.");
    }
    setIsTeaserLoading(false);
  }, []);

  const generateAIInsights = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const res = await callGemini(
        "Full Yield Audit",
        "Healthcare Investment Analyst",
      );
      setAiInsights(res || "Error.");
    } catch (e) {
      setAiInsights("Error.");
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const validateAssumptions = useCallback(async () => {
    setIsMarketLoading(true);
    setShowMarketValidation(true);
    try {
      const res = await callGemini(
        "Assumptions check",
        "Healthcare feasibility consultant",
      );
      setMarketValidation(res || "Error.");
    } catch (e) {
      setMarketValidation("Error.");
    }
    setIsMarketLoading(false);
  }, []);

  const handleAskAI = useCallback(async () => {
    if (!askQuery.trim()) return;
    setIsAskLoading(true);
    try {
      const res = await callGemini(askQuery, "Financial AI");
      setAskResponse(res || "Error.");
    } catch (e) {
      setAskResponse("Error.");
    }
    setIsAskLoading(false);
  }, [askQuery]);

  return (
    <div
      className={`min-h-screen bg-[#F9F8F6] text-[#1E2F31] font-sans pb-12 relative text-xs`}
      onMouseUp={handleTextSelection}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&family=League+Spartan:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        /* Modern, geometric UI font for general text */
        .font-sans { 
            font-family: 'Jost', sans-serif !important; 
        }
        
        /* Bold, geometric and impactful font for headers replacing the old serif */
        .font-serif { 
            font-family: 'League Spartan', sans-serif !important; 
        }
        
        /* True monospaced font for perfect vertical alignment in financial tables */
        .font-mono { 
            font-family: 'JetBrains Mono', monospace !important; 
            letter-spacing: -0.03em;
        }
      `}</style>

      <div className="bg-[#1E2F31] text-white shadow-md relative z-[130] border-b-4 border-[#1C6048] transition-all">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${containerClass} ${isPresenting ? "py-1.5" : "py-3"}`}
        >
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <div
              className={`transition-all flex items-center justify-start ${isPresenting ? "h-10" : "h-16"}`}
            >
              <img 
                src="/vasanta-logo-gold.svg" 
                alt="Vasanta Group Logo" 
                className="w-auto h-full object-contain object-left drop-shadow-sm scale-[1.7] origin-left"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => setIsPresenting(!isPresenting)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                isPresenting
                  ? "bg-[#99B6AA] text-[#1E2F31] border-[#99B6AA] hover:bg-white"
                  : "bg-[#1E2F31] text-[#99B6AA] border-[#4C4A4B] hover:text-white"
              }`}
              title="Toggle Presentation Mode"
            >
              {isPresenting ? <Minimize size={14} /> : <Maximize size={14} />}
              <span className="hidden sm:inline">
                {isPresenting ? "Exit Present" : "Present"}
              </span>
            </button>

            <button
              onClick={() =>
                setSyncConfirmDialog({
                  isOpen: true,
                  targetState: !isCloudSync,
                })
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isCloudSync
                  ? cloudStatus === "online"
                    ? "bg-[#1C6048] text-white border-[#1C6048] shadow-lg"
                    : "bg-[#9B8B70] text-white border-[#9B8B70] shadow-lg"
                  : "bg-[#1E2F31] text-[#99B6AA] border-[#4C4A4B] hover:text-white"
              }`}
              title="Toggle Cloud Saving"
            >
              {isCloudSync ? (
                cloudStatus === "online" ? (
                  <Cloud size={14} />
                ) : (
                  <RefreshCcw size={14} className="animate-spin" />
                )
              ) : (
                <CloudOff size={14} />
              )}
              <span className="hidden sm:inline">
                {isCloudSync
                  ? cloudStatus === "online"
                    ? "Cloud Sync On"
                    : "Connecting..."
                  : "Local Mode"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY LAYER NAV */}
      <nav className="bg-white border-b border-[#D8D8D8] sticky top-0 z-[120] shadow-sm transition-all duration-300">
        <div className={`transition-all duration-300 ${containerClass}`}>
          {/* Group Switcher */}
          <div className="flex items-center justify-center gap-4 pt-3 border-b border-[#EFEBE7]">
            <button
              onClick={() => handleGroupChange("context")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "context" ? "text-[#1C6048]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <FolderTree size={14} /> Strategic Foundation
              </div>
              {activeGroup === "context" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1C6048] rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => handleGroupChange("financials")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "financials" ? "text-[#1E2F31]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <BarChartHorizontal size={14} /> Financial Engine
              </div>
              {activeGroup === "financials" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E2F31] rounded-t-full"></div>
              )}
            </button>
          </div>

          <div
            className={`flex flex-col md:flex-row justify-between items-center gap-2 lg:gap-3 transition-all duration-300 ${isPresenting ? "py-2" : "py-3"}`}
          >
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-[#1E2F31]">
                {activeTab === "overview" ? (
                  <Info className="text-[#1C6048]" />
                ) : activeTab === "map" ? (
                  <Map className="text-[#1C6048]" />
                ) : activeTab === "map" ? (
                  "Interactive Site Map"
                ) : activeTab === "collab" ? (
                  <Network className="text-[#1C6048]" />
                ) : activeTab === "timeline" ? (
                  <Calendar className="text-[#1E2F31]" />
                ) : activeCompany === "operation" ? (
                  <Activity className="text-[#1C6048]" />
                ) : activeCompany === "asset" ? (
                  <Building2 className="text-[#9B8B70]" />
                ) : (
                  <Layers className="text-[#1E2F31]" />
                )}
                {activeTab === "overview"
                  ? "Project Context"
                  : activeTab === "collab"
                    ? "Collaboration Strategy"
                    : activeTab === "timeline"
                      ? "Project Timeline"
                      : activeCompany === "asset"
                        ? "Unified Project Model"
                        : "Consolidated Roll-up"}
              </h1>
            </div>

            {/* CENTER SLOT: Financial Sub-navigation (Relocated) */}
            {activeGroup === "financials" && (
              <div
                className={`flex p-1 bg-[#EFEBE7] rounded-lg gap-1 border border-[#D8D8D8] items-center transition-all duration-300 ${isPresenting ? "scale-90" : "scale-100"} max-w-full overflow-x-auto`}
              >
                <NavButton
                  active={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  icon={<LayoutGrid size={14} />}
                  label="Dashboard"
                />
                <NavButton
                  active={activeTab === "comprehensive"}
                  onClick={() => setActiveTab("comprehensive")}
                  icon={<List size={14} />}
                  label="P&L"
                />
                <NavButton
                  active={activeTab === "sensitivity"}
                  onClick={() => setActiveTab("sensitivity")}
                  icon={<TrendingUp size={14} />}
                  label="Sensitivity"
                  disabled={activeCompany === "consolidated"}
                />
                <NavButton
                  active={activeTab === "assumptions"}
                  onClick={() => setActiveTab("assumptions")}
                  icon={<Settings size={14} />}
                  label="Settings"
                  disabled={activeCompany === "consolidated"}
                />
                <NavButton
                  active={activeTab === "timeline"}
                  onClick={() => setActiveTab("timeline")}
                  icon={<Calendar size={14} />}
                  label="Timeline"
                />
                <NavButton
                  active={activeTab === "ai"}
                  onClick={() => setActiveTab("ai")}
                  icon={<Sparkles size={14} />}
                  label="AI Audit"
                />
              </div>
            )}

            {/* SECONDARY LAYER NAV (Tabs) */}
            <div
              className={`flex p-1 bg-[#EFEBE7] rounded-lg gap-1 border border-[#D8D8D8] max-w-full items-center ${isClusterDropdownOpen ? "overflow-visible" : "overflow-x-auto"}`}
            >
              {activeGroup === "context" ? (
                <>
                  <NavButton
                    active={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                    icon={<FileText size={14} />}
                    label="Overview"
                  />
                  <NavButton
                    active={activeTab === "map"}
                    onClick={() => setActiveTab("map")}
                    icon={<Map size={14} />}
                    label="Site Map"
                  />
                  <NavButton
                    active={activeTab === "collab"}
                    onClick={() => setActiveTab("collab")}
                    icon={<Network size={14} />}
                    label="Collaboration Strategy"
                  />
                </>
              ) : (
                <>
                  {activeCompany === "asset" ? (
                    <div
                      className="relative inline-block text-left animate-in fade-in duration-150"
                      id="asset-cluster-dropdown-container"
                    >
                      <button
                        id="asset-cluster-dropdown-trigger"
                        onClick={() =>
                          setIsClusterDropdownOpen(!isClusterDropdownOpen)
                        }
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer bg-white text-[#1E2F31] shadow-md border border-[#D8D8D8]`}
                      >
                        <Building2 size={14} className="text-[#9B8B70]" />
                        <span>
                          {activeCompany === "consolidated"
                            ? "Full Project Roll-up"
                            : `${assetClusterFilter.replace(" Compound", "").replace(" Area", "")} Business Unit`}
                        </span>
                        <ChevronDown
                          size={12}
                          className="text-[#4C4A4B] transition-transform duration-200"
                          style={{
                            transform: isClusterDropdownOpen
                              ? "rotate(180deg)"
                              : "rotate(0)",
                          }}
                        />
                      </button>

                      {isClusterDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[190]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsClusterDropdownOpen(false);
                            }}
                          />
                          <div
                            id="asset-cluster-dropdown-menu"
                            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 z-[200] bg-white rounded-2xl border border-[#D8D8D8] shadow-[0_12px_40px_rgba(30,47,49,0.15)] p-2.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
                          >
                            <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-[#4C4A4B]/80 tracking-widest border-b border-[#EFEBE7] mb-1">
                              Select Cluster View
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssetClusterFilter("consolidated");
                                setActiveCompany("consolidated");
                                setIsClusterDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                assetClusterFilter === "consolidated"
                                  ? "bg-[#1E2F31] text-white shadow-sm"
                                  : "bg-[#F9F8F6] text-[#4C4A4B] hover:bg-[#EFEBE7] hover:text-[#1E2F31] border border-dashed border-[#D8D8D8]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1 rounded-lg ${assetClusterFilter === "consolidated" ? "bg-white/20" : "bg-[#1E2F31]/5"}`}
                                >
                                  <Layers size={14} />
                                </div>
                                <span>Consolidated Roll-up</span>
                              </div>
                              {assetClusterFilter === "consolidated" && (
                                <span className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                              )}
                            </button>

                            <div className="h-px bg-[#EFEBE7] mx-1 my-1" />

                            {Object.keys(assetAssumptions.clusters || {}).map(
                              (name) => {
                                const cluster = assetAssumptions.clusters[name];
                                const zIdx = LAND_ZONING.findIndex(
                                  (z) => z.proportion === name,
                                );
                                const zItem = getZoningItem(
                                  zIdx === -1 ? null : zIdx,
                                );
                                const color = zItem?.color || "#4C4A4B";
                                const isSelected = assetClusterFilter === name;

                                return (
                                  <button
                                    key={name}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAssetClusterFilter(name);
                                      setActiveCompany("asset");
                                      setIsClusterDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border group ${
                                      isSelected
                                        ? "bg-white text-[#1E2F31] border-[#1E2F31] shadow-sm"
                                        : "border-transparent text-[#4C4A4B] hover:bg-[#EFEBE7]/40 hover:text-[#1E2F31]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 ring-offset-2 ring-1 ring-transparent group-hover:ring-[#D8D8D8] transition-all"
                                        style={{ backgroundColor: color }}
                                      />
                                      <span>
                                        {name
                                          .replace(" Compound", "")
                                          .replace(" Area", "")}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <span className="w-1.5 h-1.5 bg-[#1E2F31] rounded-full" />
                                    )}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <NavButton
                      active={activeCompany === "asset"}
                      onClick={() => handleCompanyChange("asset")}
                      icon={<Building2 size={14} />}
                      label="Asset"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main
        className={`transition-all duration-300 ${containerClass} ${isPresenting ? "mt-4" : "mt-6"}`}
      >
        {activeTab === "map" && <InteractiveDemographicMap />}
        {activeTab === "overview" && (
          <ProjectOverviewView
            info={projectInfo}
            setInfo={setProjectInfo}
            isLocked={
              activeCompany === "operation" ? isLockedOperation : isLockedAsset
            }
          />
        )}
        {activeTab === "collab" && (
          <CollaborationStrategyView isPresenting={isPresenting} />
        )}
        {activeTab === "timeline" && (
          <MasterTimelineView
            isPresenting={isPresenting}
            groups={groups}
            setGroups={setGroups}
          />
        )}

        {activeTab !== "overview" &&
          activeTab !== "map" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "operation" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {activeTab === "dashboard" && (
                <OperationDashboardView
                  data={opCoModelData}
                  assumptions={operationAssumptions}
                  setTab={setActiveTab}
                  isPresenting={isPresenting}
                />
              )}
              {activeTab === "comprehensive" && (
                <OperationCascadeView
                  data={opCoModelData}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
              {activeTab === "sensitivity" && (
                <OperationSensitivityView assumptions={operationAssumptions} />
              )}
              {activeTab === "assumptions" && (
                <SettingsPasswordGate>
                  <OperationSettingsView
                    assumptions={operationAssumptions}
                    onChange={handleOperationChange}
                    onSyncEquity={syncEquityWithSharing}
                    onValidate={validateAssumptions}
                    isLocked={isLockedOperation}
                    onToggleLock={() =>
                      setIsLockedOperation(!isLockedOperation)
                    }
                    onSave={() => saveDefaultsToCloud("operation")}
                    saveStatus={saveStatusOperation}
                    onReset={() =>
                      setOperationAssumptions(DEFAULT_OPERATION_ASSUMPTIONS)
                    }
                    isCloudSync={isCloudSync}
                    isPresenting={isPresenting}
                  />
                </SettingsPasswordGate>
              )}
            </div>
          )}

        {activeTab !== "overview" &&
          activeTab !== "map" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "asset" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {activeTab === "dashboard" && (
                <AssetDashboardView
                  data={activeAssetData}
                  assumptions={activeAssetAssumptions}
                  generateTeaser={generateTeaser}
                  isTeaserLoading={isTeaserLoading}
                  showTeaser={showTeaser}
                  setShowTeaser={setShowTeaser}
                  teaserContent={teaserContent}
                  setTab={setActiveTab}
                  isPresenting={isPresenting}
                />
              )}
              {activeTab === "comprehensive" && (
                <AssetCascadeView
                  data={activeAssetData}
                  onExport={() => {}}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
              {activeTab === "sensitivity" && (
                <AssetSensitivityView assumptions={activeAssetAssumptions} />
              )}
              {activeTab === "assumptions" && (
                <SettingsPasswordGate>
                  <AssetSettingsView
                    assumptions={assetAssumptions}
                    onChange={handleAssetChange}
                    onValidate={validateAssumptions}
                    isLocked={isLockedAsset}
                    onToggleLock={() => setIsLockedAsset(!isLockedAsset)}
                    onSave={() => saveDefaultsToCloud("asset")}
                    saveStatus={saveStatusAsset}
                    onReset={() =>
                      setAssetAssumptions(INITIAL_ASSET_CLUSTERS_ASSUMPTIONS)
                    }
                    isCloudSync={isCloudSync}
                    isPresenting={isPresenting}
                    clusterFilter={assetClusterFilter}
                    setClusterFilter={setAssetClusterFilter}
                  />
                </SettingsPasswordGate>
              )}
            </div>
          )}

        {activeTab !== "overview" &&
          activeTab !== "map" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "consolidated" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500">
              {activeTab === "dashboard" && (
                <ConsolidatedDashboardView
                  data={consolidatedModelData}
                  operationAssumptions={operationAssumptions}
                  assetAssumptions={assetAssumptions}
                  handleAssetChange={handleAssetChange}
                  isPresenting={isPresenting}
                  consolidatedScenario={consolidatedScenario}
                  setConsolidatedScenario={setConsolidatedScenario}
                />
              )}
              {activeTab === "comprehensive" && (
                <ConsolidatedCascadeView
                  data={consolidatedModelData}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
            </div>
          )}

        {activeTab === "ai" && activeGroup === "financials" && (
          <AIAuditView
            activeCompany={activeCompany}
            aiInsights={aiInsights}
            isAiLoading={isAiLoading}
            generateAIInsights={generateAIInsights}
            askQuery={askQuery}
            setAskQuery={setAskQuery}
            handleAskAI={handleAskAI}
            isAskLoading={isAskLoading}
            askResponse={askResponse}
          />
        )}
      </main>

      {/* PRESENTER FLOATING HUB (Glassmorphic & Movable) */}
      {isPresenting &&
        (hubPosition === "minimized" ? (
          <button
            onClick={() => setHubPosition("center")}
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(30,47,49,0.15)] rounded-full text-[#1E2F31] hover:bg-white/70 transition-all animate-in zoom-in"
            title="Restore Hub"
          >
            <Maximize2 size={20} />
          </button>
        ) : (
          <div
            className={`fixed z-[100] flex items-center gap-1.5 p-2 rounded-full transition-all duration-700 ease-in-out bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(30,47,49,0.15)] ${
              hubPosition === "center"
                ? "bottom-6 left-1/2 -translate-x-1/2"
                : hubPosition === "left"
                  ? "bottom-6 left-6"
                  : "bottom-6 right-6"
            }`}
          >
            {/* Left Move Toggle */}
            {hubPosition !== "left" && (
              <button
                onClick={() =>
                  setHubPosition(hubPosition === "right" ? "center" : "left")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#4C4A4B] hover:bg-white/50 transition-all ml-1"
                title={
                  hubPosition === "right" ? "Move to Center" : "Move to Left"
                }
              >
                <AlignLeft size={16} />
              </button>
            )}

            <button
              onClick={goToPrevSlide}
              disabled={safeSlideIndex === 0}
              className="w-14 h-14 flex items-center justify-center bg-white/70 hover:bg-white disabled:opacity-30 disabled:hover:bg-white/70 rounded-full transition-all text-[#1E2F31] shadow-sm ml-1"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            {/* Info Area (Hover to reveal Hide button) */}
            <div className="flex flex-col items-center px-4 min-w-[180px] cursor-default group relative">
              <span className="text-[10px] font-bold text-[#1C6048] uppercase tracking-widest mb-0.5 drop-shadow-sm">
                Slide {safeSlideIndex + 1} of {presentationSteps.length}
              </span>
              <span className="text-sm font-black text-[#1E2F31] whitespace-nowrap drop-shadow-sm">
                {presentationSteps[safeSlideIndex].label}
              </span>

              <button
                onClick={() => setHubPosition("minimized")}
                className="absolute -top-10 bg-white/60 backdrop-blur-xl px-4 py-1.5 rounded-full text-[11px] font-bold text-[#1E2F31] opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-white/60 flex items-center gap-1.5 hover:bg-white/90"
              >
                <EyeOff size={14} /> Hide Hub
              </button>
            </div>

            <button
              onClick={goToNextSlide}
              disabled={safeSlideIndex === presentationSteps.length - 1}
              className="w-14 h-14 flex items-center justify-center bg-[#1C6048]/80 backdrop-blur-md hover:bg-[#1C6048] disabled:opacity-50 rounded-full transition-all text-white shadow-md mr-1"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>

            {/* Right Move Toggle */}
            {hubPosition !== "right" && (
              <button
                onClick={() =>
                  setHubPosition(hubPosition === "left" ? "center" : "right")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#4C4A4B] hover:bg-white/50 transition-all mr-1"
                title={
                  hubPosition === "left" ? "Move to Center" : "Move to Right"
                }
              >
                <AlignRight size={16} />
              </button>
            )}
          </div>
        ))}

      <SelectionPopupComp
        state={selectionState}
        setState={setSelectionState}
        onAsk={handleSelectionAsk}
      />

      {syncConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1E2F31]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#D8D8D8] transform scale-100">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-full ${syncConfirmDialog.targetState ? "bg-[#1C6048]/10 text-[#1C6048]" : "bg-[#9B8B70]/10 text-[#9B8B70]"}`}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#1E2F31]">
                {syncConfirmDialog.targetState
                  ? "Enable Cloud Sync?"
                  : "Switch to Local Mode?"}
              </h3>
            </div>
            <p className="text-[#4C4A4B] text-sm mb-6 leading-relaxed">
              {syncConfirmDialog.targetState
                ? "Connecting to the cloud will save your new configurations, but it may initially overwrite your current screen with previously saved defaults. Are you sure you want to proceed?"
                : "Switching to Local Mode means your inputs will no longer be saved to the cloud. If you refresh the page while in Local Mode, any unsaved custom inputs will be lost."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() =>
                  setSyncConfirmDialog({ isOpen: false, targetState: false })
                }
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCloudSync(syncConfirmDialog.targetState);
                  setSyncConfirmDialog({ isOpen: false, targetState: false });
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${syncConfirmDialog.targetState ? "bg-[#1C6048] hover:bg-opacity-90" : "bg-[#9B8B70] hover:bg-opacity-90"}`}
              >
                {syncConfirmDialog.targetState
                  ? "Yes, Enable Sync"
                  : "Yes, Switch to Local"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Menu for Global Toggles */}
      <div className="fixed bottom-6 left-6 z-[9000] flex flex-col-reverse items-start gap-3">
        {/* Toggle Button */}
        <button
          onClick={() => setIsFloatingPanelVisible(!isFloatingPanelVisible)}
          className={`flex items-center justify-center p-3 rounded-full shadow-lg transition-colors ${
            isFloatingPanelVisible ? "bg-[#1E2F31] text-[#EFEBE7]" : "bg-white text-[#1E2F31] border border-[#D8D8D8]"
          }`}
          title="Toggle Global Settings"
          aria-label="Toggle Global Settings"
        >
          <Settings size={20} className={isFloatingPanelVisible ? "opacity-100" : "opacity-80"} />
        </button>

        {/* The Panel */}
        <div
          className={`bg-white border border-[#D8D8D8] rounded-2xl shadow-xl w-72 overflow-hidden transition-all duration-300 origin-bottom-left ${
            isFloatingPanelVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-[#EFEBE7] px-4 py-3 border-b border-[#D8D8D8]">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#1E2F31] flex items-center gap-1.5">
              <Settings size={14} /> Global Model Settings
            </h4>
          </div>
          <div className="p-4 space-y-4">
            {/* Toggle Item: Bank Debt */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt Financing
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={assetAssumptions.global?.includeFinancing || false}
                  onChange={(e) =>
                    handleAssetChange("includeFinancing", e.target.checked)
                  }
                />
                <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            {/* Toggle Item: Land Cost */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Map size={14} className="text-[#9B8B70]" /> Include Land Cost
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={assetAssumptions.global?.includeLand ?? true}
                  onChange={(e) =>
                    handleAssetChange("includeLand", e.target.checked)
                  }
                />
                <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            {/* Dropdown: Master Exit Strategy */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Target size={14} className="text-[#1C6048]" /> Master Exit
              </span>
              <select
                className="w-[130px] bg-white border border-[#D8D8D8] text-[#1E2F31] text-[10px] rounded p-1 font-bold focus:outline-none focus:border-[#1C6048]"
                value={consolidatedScenario}
                onChange={(e) => setConsolidatedScenario(e.target.value)}
              >
                <option value="manual">Manual (Settings)</option>
                <option value="yr10">Exit in Yr 10</option>
                <option value="breakeven">Exit at Breakeven</option>
                <option value="debt_free" disabled={!assetAssumptions.global?.includeFinancing}>
                  Exit Post-Debt
                </option>
                <option value="none">No Exit (Yield)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
