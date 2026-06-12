import { DEFAULT_ASSET_ASSUMPTIONS } from "./clusters/base";
export { DEFAULT_ASSET_ASSUMPTIONS };
import { GLAMPING_ASSUMPTIONS } from "./clusters/glamping";
import { COMMERCIAL_COMPOUND_ASSUMPTIONS } from "./clusters/commercialCompound";
import { HILLS_VILLA_ASSUMPTIONS } from "./clusters/hillsVilla";
import { HOSPITALITY1_ASSUMPTIONS } from "./clusters/hospitality1";
import { HOSPITALITY2_ASSUMPTIONS } from "./clusters/hospitality2";
import { ADVENTURE_STABLE_ASSUMPTIONS } from "./clusters/adventureStable";

export const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined) return "0";

  // 1. Clean and parse FIRST
  const num =
    typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  // 2. Then check if it's NaN or effectively zero
  if (isNaN(num) || Math.abs(num) < 1e-10) return "0";

  // 3. Format
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

export const formatCurrency = (val) => {
  if (val === null || val === undefined) return "Rp 0 B";

  const num =
    typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  if (isNaN(num) || Math.abs(num) < 1e-10) return "Rp 0 B";

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(num));
  return num < 0 ? `(Rp ${formatted} B)` : `Rp ${formatted} B`;
};

export const calculatePMT = (rate, nper, pv) =>
  rate === 0 ? -(pv / nper) : -(pv * rate) / (1 - Math.pow(1 + rate, -nper));

export const calculatePayback = (cfs, frequency = "annual") => {
  if (!cfs || cfs.length === 0) return 0;
  let cumulative = 0;
  for (let i = 0; i < cfs.length; i++) {
    let prevCumulative = cumulative;
    cumulative += cfs[i] || 0;
    if (cumulative >= 0 && prevCumulative < 0) {
      const fraction = Math.abs(prevCumulative) / (cfs[i] || 1);
      const periods = i + fraction;
      return frequency === "monthly" ? periods / 12 : periods;
    }
  }
  return 0; // Return 0 if the project never catches up, preventing fake extrapolation
};

export const calculateIRR = (cfs, frequency = "annual") => {
  if (!cfs || cfs.length === 0) return 0;
  let rate = frequency === "monthly" ? 0.01 : 0.1;
  for (let i = 0; i < 150; i++) {
    let npv = 0,
      dNpv = 0;
    for (let t = 0; t < cfs.length; t++) {
      const val = cfs[t] || 0;
      npv += val / Math.pow(1 + rate, t);
      if (t > 0) dNpv -= (t * val) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dNpv) < 1e-12) break;
    let newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < 1e-7) {
      if (frequency === "monthly") {
        const annualEquivalent = Math.pow(1 + newRate, 12) - 1;
        if (isNaN(annualEquivalent) || !isFinite(annualEquivalent)) return 0;
        return annualEquivalent;
      }
      return newRate;
    }
    rate = newRate;
  }
  return 0;
};

export const calculateNPV = (cfs, rate, frequency = "annual") => {
  if (!cfs) return 0;
  const discountRate = rate || 12;
  if (frequency === "monthly") {
    const rMonthly = Math.pow(1 + discountRate / 100, 1 / 12) - 1;
    return cfs.reduce(
      (acc, val, t) => acc + (val || 0) / Math.pow(1 + rMonthly, t),
      0,
    );
  }
  return cfs.reduce(
    (acc, val, i) => acc + (val || 0) / Math.pow(1 + discountRate / 100, i),
    0,
  );
};





const CANCER_DATA = [
  { name: "Breast", cases: 66271, fill: "#1C6048" },
  { name: "Lung", cases: 38904, fill: "#9B8B70" },
  { name: "Cervical", cases: 36964, fill: "#99B6AA" },
  { name: "Colorectal", cases: 35676, fill: "#EFEBE7" },
  { name: "Liver", cases: 23805, fill: "#D8D8D8" },
];

const INSURANCE_DATA = [
  { year: "2021", value: 14.3 },
  { year: "2022", value: 16.2 },
  { year: "2023", value: 18.8 },
  { year: "2024", value: 21.4 },
  { year: "2025", value: 24.1 },
  { year: "2026", value: 27.2 },
];

// @ts-ignore
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const callGemini = async (prompt, systemInstruction) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          throw new Error(`Client Error: ${response.status}`); // Don't retry 4xx errors
        }
        throw new Error("API Error");
      }
      const result = await response.json();
      return (
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated."
      );
    } catch (error) {
      if (error.message.includes("Client Error") || i === 4) throw error;
      await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000));
    }
  }
};

// ==========================================
// 2. FINANCIAL ENGINES
// ==========================================
export const runAssetEngine = (assumptions: any, config?: any, groups?: any) => {
  const requestedMonths = (config?.projYears || 10) * 12;
  const projMonths = Math.min(requestedMonths, 30 * 12);

  let exitMonth = null;
  if (config?.exitYear !== undefined && config.exitYear !== null) {
    exitMonth = Math.min(config.exitYear * 12, 30 * 12);
  } else if (assumptions.includeTerminalValue) {
    exitMonth = 10 * 12;
  }

  const landCost =
    (assumptions.includeLand ?? true)
      ? (assumptions.landArea * assumptions.landPrice) / 1000
      : 0;

  const roomUnits =
    assumptions.type === "glamping" && assumptions.glampingMix
      ? assumptions.glampingMix
          .filter((item: any) => item.isAccommodation)
          .reduce((sum: number, item: any) => sum + (item.qty || 0), 0)
      : (assumptions.roomUnits || 15);

  const rawBuildCost =
    assumptions.type === "glamping"
      ? (assumptions.glampingMix
          ? assumptions.glampingMix.reduce((sum: number, item: any) => sum + (item.qty || 0) * (item.villaCost || 0), 0) / 1e9
          : ((assumptions.roomUnits || 0) * (assumptions.buildCost || 0)) / 1000)
      : ((assumptions.buildArea || 0) * (assumptions.buildCost || 0)) / 1000;

  const medEqFullValue = assumptions.includeMedEq
    ? (assumptions.capexMedEqQty * assumptions.capexMedEqPrice) / 1000
    : 0;
  const medEqCost = medEqFullValue;

  const upfrontMedEq = assumptions.medEqProcurement !== "lease" ? medEqCost : 0;
  const leasedMedEq = medEqCost - upfrontMedEq;

  const pureInfraCost = (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
  const civilMepCost = assumptions.type === "glamping"
    ? ((roomUnits * (assumptions.civilMepCostPerUnit || 150)) / 1000)
    : 0;

  const buildCost = rawBuildCost + civilMepCost;
  const infraCost = pureInfraCost;

  const ffeCost =
    assumptions.type === "glamping" && assumptions.glampingMix
      ? assumptions.glampingMix.reduce((sum: number, item: any) => sum + (item.qty || 0) * (item.interiorCost || 0), 0) / 1e9
      : (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000;

  const sharingDevCost =
    (assumptions.capexSharingDevQty * assumptions.capexSharingDevPrice) / 1000;

  const totalHardCosts = buildCost + medEqCost + infraCost + ffeCost + sharingDevCost;

  const consultantBase = buildCost + ffeCost + infraCost + medEqFullValue;
  const licenseBase = consultantBase;

  const upfrontConsultantCost = consultantBase * ((assumptions.capexConsultantPct || 0) / 100);
  const upfrontLicenseCost = licenseBase * ((assumptions.capexLicensePct || 0) / 100);
  
  const consultantCost = upfrontConsultantCost;
  const licenseCost = upfrontLicenseCost;

  const upfrontVatBase = upfrontConsultantCost + buildCost + ffeCost + infraCost + upfrontMedEq + sharingDevCost;
  const upfrontVatCost = upfrontVatBase * ((assumptions.capexVat || 0) / 100);
  const deferredVatBase = leasedMedEq;
  const deferredVatCost = deferredVatBase * ((assumptions.capexVat || 0) / 100);
  
  const vatCost = upfrontVatCost + deferredVatCost;

  const carCost = buildCost * ((assumptions.capexCarPct || 0) / 100);
  const devDurationMonths = Math.max(1, assumptions.devDurationMonths || 12);
  const devGaMonthlyValue = assumptions.constructionOpexMonthly ?? assumptions.devGaMonthly ?? 0.2;
  const devGaTotalCost = devGaMonthlyValue * devDurationMonths;
  const preOpeningMonthlyValue = assumptions.preOpeningMonthly !== undefined ? assumptions.preOpeningMonthly : 0.4;
  const preOpeningDuration = assumptions.preOpeningDuration !== undefined ? assumptions.preOpeningDuration : 4;
  const preOpeningTotalCost = preOpeningMonthlyValue * preOpeningDuration;
  const startYear = config?.startYear || 2027;

  const upfrontContingencyBase = upfrontLicenseCost + upfrontConsultantCost + buildCost + ffeCost + infraCost + sharingDevCost + upfrontVatCost + upfrontMedEq;
  const upfrontContingencyCost = upfrontContingencyBase * ((assumptions.capexContingencyPct || 0) / 100);
  const deferredContingencyBase = leasedMedEq + deferredVatCost;
  const deferredContingencyCost = deferredContingencyBase * ((assumptions.capexContingencyPct || 0) / 100);

  const contingencyCost = upfrontContingencyCost + deferredContingencyCost;

  const deferredSoftCosts = deferredVatCost + deferredContingencyCost;

  // Under PSAK 19, devG&A (pre-operating G&A) and CAR insurance are expensed as incurred rather than capitalized.
  // Therefore, they are excluded from capitalized soft costs, upfront asset value, and capitalized loan-drawing base.
  const totalSoftCosts = (consultantCost + licenseCost + vatCost + contingencyCost);
  const upfrontTotalCapex = landCost + buildCost + upfrontMedEq + infraCost + ffeCost + sharingDevCost + consultantCost + licenseCost + upfrontVatCost + upfrontContingencyCost;
  const totalCapex = upfrontTotalCapex + leasedMedEq + deferredSoftCosts;

  const effectiveLtv = assumptions.includeFinancing ? assumptions.ltv : 0;
  const totalDebt = (upfrontTotalCapex + (assumptions.includeLandInLoan ? 0 : -landCost)) * (effectiveLtv / 100);
  const totalEquity = upfrontTotalCapex - totalDebt;

  const ioMonths = (assumptions.ioGracePeriodYears || 0) * 12;
  const loanTenorMonths = (assumptions.loanTenor || 0) * 12;
  const amortizingTenorMonths = Math.max(1, loanTenorMonths - ioMonths);
  const rateMonthly = (assumptions.interestRate || 0) / 100 / 12;

  const postIoPmt = Math.abs(
    calculatePMT(rateMonthly, amortizingTenorMonths, totalDebt),
  );

  const totalCapexExLand = upfrontTotalCapex - landCost;
  const totalDebtExLand = totalCapexExLand * (effectiveLtv / 100);
  const totalEquityExLand = totalCapexExLand - totalDebtExLand;
  const postIoPmtExLand = Math.abs(
    calculatePMT(
      rateMonthly,
      amortizingTenorMonths,
      totalDebtExLand,
    ),
  );

  const vatRate = (assumptions.capexVat || 0) / 100;
  const contingencyRate = (assumptions.capexContingencyPct || 0) / 100;

  // Proportional VAT allocation (Licenses excluded)
  const buildVat = buildCost * vatRate;
  const medEqVatUpfront = upfrontMedEq * vatRate;
  const infraVat = infraCost * vatRate;
  const ffeVat = ffeCost * vatRate;
  const sharingVat = sharingDevCost * vatRate;
  const consultantVat = upfrontConsultantCost * vatRate;

  // Proportional Contingency allocation
  const buildContingency = (buildCost + buildVat) * contingencyRate;
  const medEqContingencyUpfront = (upfrontMedEq + medEqVatUpfront) * contingencyRate;
  const infraContingency = (infraCost + infraVat) * contingencyRate;
  const ffeContingency = (ffeCost + ffeVat) * contingencyRate;
  const sharingContingency = (sharingDevCost + sharingVat) * contingencyRate;
  const consultantContingency = (upfrontConsultantCost + consultantVat) * contingencyRate;
  const licenseContingency = upfrontLicenseCost * contingencyRate;

  const buildBasis_base = buildCost;
  let medEqBasis_base = upfrontMedEq;
  const infraBasis_base = infraCost;
  const ffeBasis_base = ffeCost;
  const sharingBasis_base = sharingDevCost;
  
  let consultantBasis_base = upfrontConsultantCost;
  let licenseBasis_base = upfrontLicenseCost;

  // --- OPTION A: Timeline-linked Project Development Spending Drawdowns ---
  let devMonths = Math.max(1, assumptions.devDurationMonths || 12);
  if (groups) {
    const commOpeningTask = groups
      .flatMap((g: any) => g.tasks || [])
      .find((t: any) => t.id === "t13" || t.name?.toLowerCase().includes("commercial opening"));
    if (commOpeningTask && commOpeningTask.start) {
      devMonths = Math.max(1, parseInt(commOpeningTask.start) - 1);
    }
  }

  const getTaskOrGroupSchedule = (id: string, defaultStart: number, defaultDuration: number) => {
    let start = defaultStart;
    let duration = defaultDuration;
    if (groups) {
      // 1. Try finding a task with this id first
      let foundTask: any = null;
      for (const grp of groups) {
        if (grp.tasks) {
          const t = grp.tasks.find((task: any) => task.id === id);
          if (t) {
            foundTask = t;
            break;
          }
        }
      }
      if (foundTask) {
        start = Math.max(1, parseInt(foundTask.start) || 1);
        duration = Math.max(1, parseInt(foundTask.duration) || 1);
      } else {
        // 2. Fallback: find group by id
        const g = groups.find((grp: any) => grp.id === id);
        if (g && g.tasks && g.tasks.length > 0) {
          let minStart = Infinity;
          let maxEnd = -Infinity;
          g.tasks.forEach((t: any) => {
            const s = Math.max(1, parseInt(t.start) || 1);
            const d = Math.max(1, parseInt(t.duration) || 1);
            if (s < minStart) minStart = s;
            if (s + d - 1 > maxEnd) maxEnd = s + d - 1;
          });
          if (minStart !== Infinity && maxEnd !== -Infinity) {
            start = minStart;
            duration = Math.max(1, maxEnd - minStart + 1);
          }
        }
      }
    }

    // Scale or shift the schedule if it exceeds the cluster's development duration
    if (start + duration - 1 > devDurationMonths) {
      if (id === "capex_ffe" || id === "c4" || id === "capex_medeq" || id === "c8" || id === "t10") {
        const dur = Math.max(1, Math.min(duration, Math.floor(devDurationMonths / 4)));
        const st = Math.max(1, devDurationMonths - dur + 1);
        return { start: st, duration: dur };
      }
      if (
        id === "capex_construction" || id === "t7" || id === "t6" ||
        id === "capex_infra" || id === "c5" ||
        id === "capex_sharing" || id === "c6" ||
        id === "capex_consultant"
      ) {
        return { start: 1, duration: devDurationMonths };
      }
      const ratio = devDurationMonths / (start + duration - 1);
      const newStart = Math.max(1, Math.floor((start - 1) * ratio) + 1);
      const newDuration = Math.max(1, Math.floor(duration * ratio));
      return { start: newStart, duration: newDuration };
    }
    return { start, duration };
  };

  const landSched = getTaskOrGroupSchedule("capex_land", 1, 1);
  const licenseSched = getTaskOrGroupSchedule("capex_licensing", 8, 8);
  const consultantSched = getTaskOrGroupSchedule("capex_consultant", 1, 9);
  const ffeSched = getTaskOrGroupSchedule("capex_ffe", 21, 4);
  const infraSched = getTaskOrGroupSchedule("c5", 1, 12);
  const sharingSched = getTaskOrGroupSchedule("c6", 1, 12);
  const buildSched = getTaskOrGroupSchedule("capex_construction", 13, 19);
  const eqSched = getTaskOrGroupSchedule("capex_medeq", 22, 15);

  let outstandingDebt = totalDebt,
    outstandingDebtExLand = totalDebtExLand,
    equityCum = 0,
    equityCumExLand = 0;

  let monthlyData: any[] = [],
    equityCfs: number[] = [],
    equityCfsExLand: number[] = [],
    unleveredCfs: number[] = [],
    operatingCfs: number[] = [];

  for (let md = 1; md <= devMonths; md++) {
    const isActive = (sched: { start: number; duration: number }) => {
      return md >= sched.start && md < sched.start + sched.duration;
    };

    const landSpend_m = isActive(landSched) ? (landCost / landSched.duration) : 0;
    const buildSpend_m = isActive(buildSched) ? (buildCost / buildSched.duration) : 0;
    const eqSpend_m = isActive(eqSched) ? (upfrontMedEq / eqSched.duration) : 0;
    const infraSpend_m = isActive(infraSched) ? (infraCost / infraSched.duration) : 0;
    const ffeSpend_m = isActive(ffeSched) ? (ffeCost / ffeSched.duration) : 0;
    const sharingSpend_m = isActive(sharingSched) ? (sharingDevCost / sharingSched.duration) : 0;
    
    const consultantSpend_m = isActive(consultantSched) ? (upfrontConsultantCost / consultantSched.duration) : 0;
    const licenseSpend_m = isActive(licenseSched) ? (upfrontLicenseCost / licenseSched.duration) : 0;

    // Proportional soft costs spending
    const vatSpend_m = (buildSpend_m + eqSpend_m + infraSpend_m + ffeSpend_m + sharingSpend_m + consultantSpend_m) * vatRate;
    const contingencySpend_m = (buildSpend_m + eqSpend_m + infraSpend_m + ffeSpend_m + sharingSpend_m + consultantSpend_m + licenseSpend_m + vatSpend_m) * contingencyRate;
    
    const devGa_m = (md <= devMonths) ? (assumptions.constructionOpexMonthly ?? assumptions.devGaMonthly ?? 0.2) : 0;
    const devCar_m = buildSpend_m * ((assumptions.capexCarPct || 0) / 100);
    const devPreOpeningDuration = preOpeningDuration;
    const devPreOpeningMonthly = preOpeningMonthlyValue;
    const devPreOpening_m = (md > devMonths - devPreOpeningDuration && md <= devMonths) ? devPreOpeningMonthly : 0;

    const hardSpend_m = buildSpend_m + eqSpend_m + infraSpend_m + ffeSpend_m + sharingSpend_m;
    // Standard capitalized soft cost spend
    const capitalizedSoft_m = consultantSpend_m + licenseSpend_m + vatSpend_m + contingencySpend_m;
    // Total soft spend includes capitalized soft spend plus the expensed items
    const softSpend_m = capitalizedSoft_m + devGa_m + devCar_m + devPreOpening_m;
    const totalSpend_m = landSpend_m + hardSpend_m + softSpend_m;
    
    // Under PSAK 19, debt funding draw is based on capitalized expenditures ONLY
    const capitalizedSpend_m = landSpend_m + hardSpend_m + capitalizedSoft_m;
    const debtDraw_m = capitalizedSpend_m * (effectiveLtv / 100);
    const eqDraw_m = totalSpend_m - debtDraw_m;

    const eqDraw = -eqDraw_m;
    
    // Equity draw ex land is capitalized spend ex land (weighted by LTV) plus 100% of the pre-op expensed items (G&A, CAR, and Pre-Opening)
    const capitalizedSpendExLand_m = hardSpend_m + capitalizedSoft_m;
    const eqDrawExLand = -(capitalizedSpendExLand_m * (1 - effectiveLtv / 100) + devGa_m + devCar_m + devPreOpening_m);

    equityCum += eqDraw;
    equityCumExLand += eqDrawExLand;
    equityCfs.push(eqDraw);
    equityCfsExLand.push(eqDrawExLand);
    unleveredCfs.push(-totalSpend_m);
    operatingCfs.push(eqDraw);

    const monthYear = startYear + Math.floor((md - 1) / 12);
    monthlyData.push({
      month: `Month ${md}`,
      year: monthYear,
      isOperating: false,
      revenue: 0,
      maintOpex: 0,
      taxOpex: 0,
      overheadOpex: 0,
      ffeReserve: 0,
      medEqLeaseOpex: 0,
      ebitda: -(devGa_m + devCar_m + devPreOpening_m),
      interest: 0,
      principal: 0,
      debtBalance: totalDebt,
      dep: 0,
      depBuild: 0,
      depMedEq: 0,
      depInfra: 0,
      depFfe: 0,
      depVat: 0,
      depContingency: 0,
      corpTax: 0,
      netIncome: -(devGa_m + devCar_m + devPreOpening_m),
      deferredCapex: 0,
      fcfe: eqDraw,
      cumFcfe: equityCum,
      dscr: 0,
      yield: 0,
      fcfeExLand: eqDrawExLand,
      cumFcfeExLand: equityCumExLand,
      interestExLand: 0,
      principalExLand: 0,
      debtBalanceExLand: totalDebtExLand,
      exit: 0,
      netExitProceeds: 0,
      netExitProceedsExLand: 0,
      ebt: -(devGa_m + devCar_m + devPreOpening_m),
      ebtExLand: -(devGa_m + devCar_m + devPreOpening_m),
      corpTaxExLand: 0,

      // Spending breakdowns
      landSpend: landSpend_m,
      buildSpend: buildSpend_m,
      eqSpend: eqSpend_m,
      infraSpend: infraSpend_m,
      ffeSpend: ffeSpend_m,
      sharingSpend: sharingSpend_m,
      hardSpend: hardSpend_m,
      consultantSpend: consultantSpend_m,
      licenseSpend: licenseSpend_m,
      vatSpend: vatSpend_m,
      contingencySpend: contingencySpend_m,
      devGa: devGa_m,
      devCar: devCar_m,
      devPreOpening: devPreOpening_m,
      softSpend: softSpend_m,
      totalSpend: totalSpend_m,
      debtDraw: debtDraw_m,
    });
  }

  let avgDscr = 0,
    avgYield = 0;
  let bvB_base = buildCost,
    bvB_vat = buildVat,
    bvB_contingency = buildContingency;

  let bvM_base = upfrontMedEq,
    bvM_vat = medEqVatUpfront,
    bvM_contingency = medEqContingencyUpfront;

  let bvI_base = infraCost,
    bvI_vat = infraVat,
    bvI_contingency = infraContingency;

  let bvF_base = ffeCost,
    bvF_vat = ffeVat,
    bvF_contingency = ffeContingency;

  let bvSharing_base = sharingDevCost,
    bvSharing_vat = sharingVat,
    bvSharing_contingency = sharingContingency;

  let bvConsultant_base = upfrontConsultantCost,
    bvConsultant_vat = consultantVat,
    bvConsultant_contingency = consultantContingency;

  let bvLicense_base = upfrontLicenseCost,
    bvLicense_vat = 0,
    bvLicense_contingency = licenseContingency;

  const SUMBA_SEASONALITY = assumptions.seasonality || [0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9, 0.8];

  for (let i = 1; i <= projMonths; i++) {
    const monthInYear = (i - 1) % 12;
    const yearOffset = Math.floor((i - 1) / 12);
    
    let revenue = 0;
    let maint = 0;
    let taxOp = 0;
    let overhead = 0;
    let reserve = 0;

    let seasonalityMultiplier = SUMBA_SEASONALITY[monthInYear];

    if (assumptions.type === 'glamping' || assumptions.isUnifiedModel) {
        const year = Math.floor((i - 1) / 12);
        const occupancy = Math.min(assumptions.stabilizedOccupancy || 0.5, (assumptions.initialOccupancy || 0.3) + (year * 0.05));
        
        let adrMultiplier = 1;
        for (let y = 1; y <= year; y++) {
          if (y <= 5) adrMultiplier *= (1 + ((assumptions.adrEscalationYear1to5 ?? 5) / 100));
          else adrMultiplier *= (1 + ((assumptions.adrEscalationAfterYear5 ?? 3) / 100));
        }

        const currentAdr = (assumptions.adr || 2000000) * adrMultiplier;
        const roomUnits = assumptions.type === "glamping" && assumptions.glampingMix
          ? assumptions.glampingMix
              .filter((item: any) => item.isAccommodation)
              .reduce((sum: number, item: any) => sum + (item.qty || 0), 0)
          : (assumptions.roomUnits || assumptions.rooms || 15);
        const roomRevenue = (roomUnits * 30 * currentAdr * occupancy * seasonalityMultiplier) / 1e9;
        const barRevenue = roomRevenue * (assumptions.barRevenuePctOfRoom || 0.3);
        revenue = roomRevenue + barRevenue;
        
        const directLaborPct = assumptions.directLaborPct ?? 0.15;
        const directRepairsPct = assumptions.directRepairsPct ?? 0.07;
        const directUtilitiesPct = assumptions.directUtilitiesPct ?? 0.05;
        const directFbCogs = barRevenue * ((assumptions.fbCogsPct ?? 40) / 100);

        const adminLaborPct = assumptions.adminLaborPct ?? 0.10;
        const marketingPct = assumptions.marketingPct ?? 0.05;
        const adminGeneralPct = assumptions.adminGeneralPct ?? 0.05;

        maint = revenue * directRepairsPct;
        taxOp = revenue * directUtilitiesPct;
        overhead = revenue * (directLaborPct + adminLaborPct + marketingPct + adminGeneralPct) + directFbCogs;
        
        reserve = revenue * ((assumptions.ffeReservePct || 0) / 100);
    } else {
        revenue =
          ((assumptions.manualBaseRent || 0) / 12) *
          Math.pow(1 + (assumptions.manualRentEscalation || 0) / 100, yearOffset);
        maint = (buildCost * (assumptions.maintRate / 100)) / 12;
        taxOp = (totalSoftCosts + totalHardCosts) * (assumptions.propTaxRate / 100) / 12;
        overhead =
          (assumptions.opOverheadMonthly || 0) *
          Math.pow(1 + (assumptions.opOverheadInc || 0) / 100, yearOffset);
        reserve = revenue * ((assumptions.ffeReservePct || 0) / 100);
    }

    let medEqLeaseOpex = 0;
    let deferredCapex = 0;

    if (assumptions.includeMedEq && assumptions.medEqProcurement === "lease") {
      if (i < (assumptions.medEqPurchaseOpYear || 4) * 12) {
        medEqLeaseOpex = (assumptions.medEqLeaseMonthly || 0);
      } else if (i === (assumptions.medEqPurchaseOpYear || 4) * 12) {
        const deferredCapexBase = (assumptions.medEqPurchaseAmount || 150000) / 1000;
        const deferredCapexVat = deferredCapexBase * vatRate;
        const deferredCapexContingency = (deferredCapexBase + deferredCapexVat) * contingencyRate;
        
        deferredCapex = deferredCapexBase + deferredCapexVat + deferredCapexContingency;
        
        bvM_base += deferredCapexBase;
        medEqBasis_base += deferredCapexBase;
        bvM_vat += deferredCapexVat;
        bvM_contingency += deferredCapexContingency;
      }
    }

    const ebitda = revenue - maint - taxOp - overhead - reserve - medEqLeaseOpex;

    let interest = 0,
      principal = 0,
      interestExLand = 0,
      principalExLand = 0;
    if (outstandingDebt > 0.01) {
      interest = outstandingDebt * ((assumptions.interestRate || 0) / 100 / 12);
      principal =
        i <= ioMonths ? 0 : Math.min(outstandingDebt, postIoPmt - interest);
      outstandingDebt -= principal;
    }
    if (outstandingDebtExLand > 0.01) {
      interestExLand = outstandingDebtExLand * ((assumptions.interestRate || 0) / 100 / 12);
      principalExLand =
        i <= ioMonths
          ? 0
          : Math.min(outstandingDebtExLand, postIoPmtExLand - interestExLand);
      outstandingDebtExLand -= principalExLand;
    }

    const calcDep = (bv, basis, life, method) => {
      if (method === "DDB") return Math.min(bv * (2 / life), bv);
      const monthlyRate = basis / (life * 12);
      return Math.min(monthlyRate, bv); 
    };

    // 1. Construction (Building)
    const m_dB_base = calcDep(bvB_base, buildBasis_base, assumptions.depLifeBuilding || 20, assumptions.depMethodBuilding);
    bvB_base -= m_dB_base;
    const m_dB_vat = calcDep(bvB_vat, buildVat, assumptions.depLifeBuilding || 20, assumptions.depMethodBuilding);
    bvB_vat -= m_dB_vat;
    const m_dB_contingency = calcDep(bvB_contingency, buildContingency, assumptions.depLifeBuilding || 20, assumptions.depMethodBuilding);
    bvB_contingency -= m_dB_contingency;
    const d1 = m_dB_base;

    // 2. Medical Equipment
    let m_dM_base = 0;
    let m_dM_vat = 0;
    let m_dM_contingency = 0;
    if (!(assumptions.includeMedEq && assumptions.medEqProcurement === "lease" && i < (assumptions.medEqPurchaseOpYear || 4) * 12)) {
      m_dM_base = calcDep(bvM_base, medEqBasis_base, assumptions.depLifeMedEq || 10, assumptions.depMethodMedEq);
      bvM_base -= m_dM_base;
      m_dM_vat = calcDep(bvM_vat, medEqVatUpfront, assumptions.depLifeMedEq || 10, assumptions.depMethodMedEq);
      bvM_vat -= m_dM_vat;
      m_dM_contingency = calcDep(bvM_contingency, medEqContingencyUpfront, assumptions.depLifeMedEq || 10, assumptions.depMethodMedEq);
      bvM_contingency -= m_dM_contingency;
    }
    const d2 = m_dM_base;

    // 3. Infrastructure
    const m_dI_base = calcDep(bvI_base, infraBasis_base, assumptions.depLifeInfra || 20, assumptions.depMethodInfra);
    bvI_base -= m_dI_base;
    const m_dI_vat = calcDep(bvI_vat, infraVat, assumptions.depLifeInfra || 20, assumptions.depMethodInfra);
    bvI_vat -= m_dI_vat;
    const m_dI_contingency = calcDep(bvI_contingency, infraContingency, assumptions.depLifeInfra || 20, assumptions.depMethodInfra);
    bvI_contingency -= m_dI_contingency;
    const d3 = m_dI_base;

    // 4. FF&E
    const m_dF_base = calcDep(bvF_base, ffeBasis_base, assumptions.depLifeFFE || 20, assumptions.depMethodFFE);
    bvF_base -= m_dF_base;
    const m_dF_vat = calcDep(bvF_vat, ffeVat, assumptions.depLifeFFE || 20, assumptions.depMethodFFE);
    bvF_vat -= m_dF_vat;
    const m_dF_contingency = calcDep(bvF_contingency, ffeContingency, assumptions.depLifeFFE || 20, assumptions.depMethodFFE);
    bvF_contingency -= m_dF_contingency;
    const d4 = m_dF_base;

    // 5. Sharing Development
    const m_dSharing_base = calcDep(bvSharing_base, sharingBasis_base, assumptions.depLifeInfra || 20, assumptions.depMethodInfra);
    bvSharing_base -= m_dSharing_base;
    const m_dSharing_vat = calcDep(bvSharing_vat, sharingVat, assumptions.depLifeInfra || 20, assumptions.depMethodInfra);
    bvSharing_vat -= m_dSharing_vat;
    const m_dSharing_contingency = calcDep(bvSharing_contingency, sharingContingency, assumptions.depLifeInfra || 20, assumptions.depMethodInfra);
    bvSharing_contingency -= m_dSharing_contingency;
    const dSharing = m_dSharing_base;

    // 6. Consultant
    const m_dConsultant_base = calcDep(bvConsultant_base, consultantBasis_base, assumptions.depLifeSoftCost || 20, assumptions.depMethodSoftCost || "SL");
    bvConsultant_base -= m_dConsultant_base;
    const m_dConsultant_vat = calcDep(bvConsultant_vat, consultantVat, assumptions.depLifeSoftCost || 20, assumptions.depMethodSoftCost || "SL");
    bvConsultant_vat -= m_dConsultant_vat;
    const m_dConsultant_contingency = calcDep(bvConsultant_contingency, consultantContingency, assumptions.depLifeSoftCost || 20, assumptions.depMethodSoftCost || "SL");
    bvConsultant_contingency -= m_dConsultant_contingency;
    const dConsultant = m_dConsultant_base;

    // 7. License
    const m_dLicense_base = calcDep(bvLicense_base, licenseBasis_base, assumptions.depLifeSoftCost || 20, assumptions.depMethodSoftCost || "SL");
    bvLicense_base -= m_dLicense_base;
    const m_dLicense_contingency = calcDep(bvLicense_contingency, licenseContingency, assumptions.depLifeSoftCost || 20, assumptions.depMethodSoftCost || "SL");
    bvLicense_contingency -= m_dLicense_contingency;
    const dLicense = m_dLicense_base;

    const m_dVat = m_dB_vat + m_dM_vat + m_dI_vat + m_dF_vat + m_dSharing_vat + m_dConsultant_vat;
    const m_dContingency = m_dB_contingency + m_dM_contingency + m_dI_contingency + m_dF_contingency + m_dSharing_contingency + m_dConsultant_contingency + m_dLicense_contingency;

    const dep = d1 + d2 + d3 + d4 + dSharing + dConsultant + dLicense + m_dVat + m_dContingency;

    const ebt = ebitda - interest - dep;
    const tax = ebt > 0 ? ebt * ((assumptions.corporateTax || 0) / 100) : 0;
    const netIncome = ebt - tax;

    let exit = 0,
      exitExLand = 0,
      exitUnlev = 0;
    if (exitMonth !== null && i === exitMonth) {
      let tv =
        assumptions.exitMethod === "multiple"
          ? ebitda * 12 * assumptions.exitMultiple
          : (ebitda * 12) / (assumptions.exitCapRate / 100);
      if (tv > 0) {
        const cost = tv * ((assumptions.sellingCosts || 0) / 100);
        exit = tv - cost - outstandingDebt;
        exitUnlev = tv - cost;
        exitExLand = tv - cost - outstandingDebtExLand - landCost;
        outstandingDebt = 0;
        outstandingDebtExLand = 0;
      }
    }

    const unleveredFcff =
      ebitda -
      dep -
      (ebitda - dep > 0
        ? (ebitda - dep) * ((assumptions.corporateTax || 0) / 100)
        : 0) +
      dep +
      exitUnlev -
      deferredCapex;
    unleveredCfs.push(unleveredFcff);

    const opFcfe = netIncome + dep - principal - deferredCapex;
    const fcfe = opFcfe + exit;
    const fcfeExLand =
      ebitda -
      interestExLand -
      dep -
      (ebitda - interestExLand - dep > 0
        ? (ebitda - interestExLand - dep) * ((assumptions.corporateTax || 0) / 100)
        : 0) +
      dep -
      principalExLand +
      exitExLand -
      deferredCapex;

    equityCum += fcfe;
    equityCumExLand += fcfeExLand;
    equityCfs.push(fcfe);
    equityCfsExLand.push(fcfeExLand);
    operatingCfs.push(opFcfe);
    
    const dscr = principal + interest > 0 ? ebitda / (principal + interest) : 0;
    avgDscr += dscr;
    avgYield += totalEquity > 0 ? (opFcfe / totalEquity) * 100 : 0;

    const monthYear = startYear + Math.floor((i + devMonths - 1) / 12);
    monthlyData.push({
      month: `Month ${i + devMonths}`,
      year: monthYear,
      isOperating: true,
      revenue,
      maintOpex: maint,
      taxOpex: taxOp,
      overheadOpex: overhead,
      ffeReserve: reserve,
      medEqLeaseOpex,
      ebitda,
      interest,
      principal,
      debtBalance: outstandingDebt,
      dep,
      depBuild: d1,
      depMedEq: d2,
      depInfra: d3,
      depFfe: d4,
      depVat: m_dVat,
      depContingency: m_dContingency,
      corpTax: tax,
      netIncome,
      deferredCapex,
      fcfe,
      cumFcfe: equityCum,
      dscr,
      yield: totalEquity > 0 ? (opFcfe / totalEquity) * 100 : 0,
      fcfeExLand,
      cumFcfeExLand: equityCumExLand,
      interestExLand,
      principalExLand,
      debtBalanceExLand: outstandingDebtExLand,
      exit,
      netExitProceeds: exit,
      ebt,
      netExitProceedsExLand: exitExLand,
      ebtExLand: ebitda - interestExLand - dep,
      corpTaxExLand:
        ebitda - interestExLand - dep > 0
          ? (ebitda - interestExLand - dep) * ((assumptions.corporateTax || 0) / 100)
          : 0,

      // Spending breakdowns during operations are zero
      landSpend: 0,
      buildSpend: 0,
      eqSpend: 0,
      infraSpend: 0,
      ffeSpend: 0,
      sharingSpend: 0,
      hardSpend: 0,
      consultantSpend: 0,
      licenseSpend: 0,
      vatSpend: 0,
      contingencySpend: 0,
      devGa: 0,
      devCar: 0,
      devPreOpening: 0,
      softSpend: 0,
      totalSpend: 0,
      debtDraw: 0,
    });
  }

  const operatingData = monthlyData.filter((d) => d.isOperating);

  return {
    monthlyData,
    operatingData,
    metrics: {
      totalCapex,
      totalDebt,
      totalEquity,
      irr: calculateIRR(equityCfs, "monthly"),
      npv: calculateNPV(equityCfs, assumptions.discountRate, "monthly"),
      unleveredIrr: calculateIRR(unleveredCfs, "monthly"),
      unleveredNpv: calculateNPV(unleveredCfs, assumptions.discountRate, "monthly"),
      irrExLand: calculateIRR(equityCfsExLand, "monthly"),
      npvExLand: calculateNPV(equityCfsExLand, assumptions.discountRate, "monthly"),
      payback: calculatePayback(equityCfs, "monthly"),
      operatingPayback: calculatePayback(operatingCfs, "monthly"),
      avgDscr: projMonths > 0 ? avgDscr / projMonths : 0,
      minDscr:
        operatingData.filter((d) => d.principal + d.interest > 0).length > 0
          ? Math.min(
              ...operatingData
                .filter((d) => d.principal + d.interest > 0)
                .map((d) => d.dscr),
            )
          : 0,
      avgYield: projMonths > 0 ? avgYield / projMonths : 0,
      moic:
        equityCfs.reduce((acc, val) => (val > 0 ? acc + val : acc), 0) /
        totalEquity,
      costPerBed: assumptions.beds > 0 ? (totalCapex / assumptions.beds) : 0,
      costPerSqm:
        assumptions.buildArea > 0
          ? (totalCapex * 1000) / assumptions.buildArea
          : 0,
      yocExLand:
        projMonths > 0
          ? operatingData.reduce((acc, d) => acc + d.ebitda, 0) /
            projMonths /
            totalCapexExLand
          : 0,
    },
    totals: {
      revenue: monthlyData.reduce((acc, d) => acc + (d.revenue || 0), 0),
      maintOpex: monthlyData.reduce((acc, d) => acc + (d.maintOpex || 0), 0),
      taxOpex: monthlyData.reduce((acc, d) => acc + (d.taxOpex || 0), 0),
      overheadOpex: monthlyData.reduce(
        (acc, d) => acc + (d.overheadOpex || 0),
        0,
      ),
      ffeReserve: monthlyData.reduce((acc, d) => acc + (d.ffeReserve || 0), 0),
      medEqLeaseOpex: monthlyData.reduce(
        (acc, d) => acc + (d.medEqLeaseOpex || 0),
        0,
      ),
      ebitda: monthlyData.reduce((acc, d) => acc + (d.ebitda || 0), 0),
      interest: monthlyData.reduce((acc, d) => acc + (d.interest || 0), 0),
      principal: monthlyData.reduce((acc, d) => acc + (d.principal || 0), 0),
      ds: monthlyData.reduce(
        (acc, d) => acc + (d.interest || 0) + (d.principal || 0),
        0,
      ),
      dep: monthlyData.reduce((acc, d) => acc + (d.dep || 0), 0),
      ebt: monthlyData.reduce((acc, d) => acc + (d.ebt || 0), 0),
      corpTax: monthlyData.reduce((acc, d) => acc + (d.corpTax || 0), 0),
      netIncome: monthlyData.reduce((acc, d) => acc + (d.netIncome || 0), 0),
      deferredCapex: monthlyData.reduce(
        (acc, d) => acc + (d.deferredCapex || 0),
        0,
      ),
      fcfe: monthlyData.reduce((acc, d) => acc + (d.fcfe || 0), 0),
      netExitProceeds: monthlyData.reduce(
        (acc, d) => acc + (d.netExitProceeds || 0),
        0,
      ),
      interestExLand: monthlyData.reduce(
        (acc, d) => acc + (d.interestExLand || 0),
        0,
      ),
      principalExLand: monthlyData.reduce(
        (acc, d) => acc + (d.principalExLand || 0),
        0,
      ),
      ebtExLand: monthlyData.reduce((acc, d) => acc + (d.ebtExLand || 0), 0),
      corpTaxExLand: monthlyData.reduce(
        (acc, d) => acc + (d.corpTaxExLand || 0),
        0,
      ),
      netExitProceedsExLand: monthlyData.reduce(
        (acc, d) => acc + (d.netExitProceedsExLand || 0),
        0,
      ),
      fcfeExLand: monthlyData.reduce((acc, d) => acc + (d.fcfeExLand || 0), 0),

      // Integrated Partnership Returns
      partnerA: {
        share: assumptions.sharingPercentA || 49,
        equity: totalEquity * ((assumptions.sharingPercentA || 49) / 100),
        fcf: monthlyData.reduce((acc, d) => acc + (d.fcfe || 0), 0) * ((assumptions.sharingPercentA || 49) / 100),
        irr: calculateIRR(equityCfs.map(v => v * ((assumptions.sharingPercentA || 49) / 100)), "monthly"),
        avgYield: projMonths > 0 ? (operatingCfs.reduce((acc, v) => acc + v, 0) * ((assumptions.sharingPercentA || 49) / 100) / (totalEquity * ((assumptions.sharingPercentA || 49) / 100)) * 100 / (projMonths / 12)) : 0,
      },
      partnerB: {
        share: 100 - (assumptions.sharingPercentA || 49),
        equity: totalEquity * ((100 - (assumptions.sharingPercentA || 49)) / 100),
        fcf: monthlyData.reduce((acc, d) => acc + (d.fcfe || 0), 0) * ((100 - (assumptions.sharingPercentA || 49)) / 100),
        irr: calculateIRR(equityCfs.map(v => v * ((100 - (assumptions.sharingPercentA || 49)) / 100)), "monthly"),
        avgYield: projMonths > 0 ? (operatingCfs.reduce((acc, v) => acc + v, 0) * ((100 - (assumptions.sharingPercentA || 49)) / 100) / (totalEquity * ((100 - (assumptions.sharingPercentA || 49)) / 100)) * 100 / (projMonths / 12)) : 0,
      },

      // Project Development spending totals
      landSpend: monthlyData.reduce((acc, d) => acc + (d.landSpend || 0), 0),
      buildSpend: monthlyData.reduce((acc, d) => acc + (d.buildSpend || 0), 0),
      eqSpend: monthlyData.reduce((acc, d) => acc + (d.eqSpend || 0), 0),
      infraSpend: monthlyData.reduce((acc, d) => acc + (d.infraSpend || 0), 0),
      ffeSpend: monthlyData.reduce((acc, d) => acc + (d.ffeSpend || 0), 0),
      sharingSpend: monthlyData.reduce((acc, d) => acc + (d.sharingSpend || 0), 0),
      hardSpend: monthlyData.reduce((acc, d) => acc + (d.hardSpend || 0), 0),
      consultantSpend: monthlyData.reduce((acc, d) => acc + (d.consultantSpend || 0), 0),
      licenseSpend: monthlyData.reduce((acc, d) => acc + (d.licenseSpend || 0), 0),
      vatSpend: monthlyData.reduce((acc, d) => acc + (d.vatSpend || 0), 0),
      contingencySpend: monthlyData.reduce((acc, d) => acc + (d.contingencySpend || 0), 0),
      devGa: monthlyData.reduce((acc, d) => acc + (d.devGa || 0), 0),
      devCar: monthlyData.reduce((acc, d) => acc + (d.devCar || 0), 0),
      devPreOpening: monthlyData.reduce((acc, d) => acc + (d.devPreOpening || 0), 0),
      softSpend: monthlyData.reduce((acc, d) => acc + (d.softSpend || 0), 0),
      totalSpend: monthlyData.reduce((acc, d) => acc + (d.totalSpend || 0), 0),
      debtDraw: monthlyData.reduce((acc, d) => acc + (d.debtDraw || 0), 0),
    },
    capexDetails: {
      landCost,
      buildCost: rawBuildCost,
      totalHardCosts,
      totalSoftCosts,
      totalCapex,
      medEqCost,
      infraCost: pureInfraCost,
      civilMepCost,
      ffeCost,
      consultantCost,
      licenseCost,
      vatCost,
      contingencyCost,
      sharingDevCost,
      devGa: monthlyData.reduce((acc, d) => acc + (d.devGa || 0), 0),
      devCar: monthlyData.reduce((acc, d) => acc + (d.devCar || 0), 0),
      devPreOpening: monthlyData.reduce((acc, d) => acc + (d.devPreOpening || 0), 0),
    },
  };
};

export const INITIAL_ASSET_CLUSTERS_ASSUMPTIONS = {
  global: {
    ...DEFAULT_ASSET_ASSUMPTIONS,
  },
  clusters: {
    "Glamping": GLAMPING_ASSUMPTIONS,
    "Commercial Compound": COMMERCIAL_COMPOUND_ASSUMPTIONS,
    "Hills Villa": HILLS_VILLA_ASSUMPTIONS,
    "Hospitality 1": HOSPITALITY1_ASSUMPTIONS,
    "Hospitality 2": HOSPITALITY2_ASSUMPTIONS,
    "Adventure & Stable": ADVENTURE_STABLE_ASSUMPTIONS,
  },
};

export const runConsolidatedAssetEngine = (assumptions: any, config?: any, groups?: any) => {
  if (!assumptions || !assumptions.clusters) {
    // Graceful fallback for single monolithic or uninitialized schemas
    return runAssetEngine(assumptions || DEFAULT_ASSET_ASSUMPTIONS, config, groups);
  }

  const clustersData: Record<string, any> = {};
  const clusterNames = Object.keys(assumptions.clusters);

  const totalLandArea = clusterNames.reduce((sum, name) => sum + (assumptions.clusters[name].landArea || 0), 0);

  clusterNames.forEach((name) => {
    const combined = {
      ...assumptions.global,
      ...assumptions.clusters[name],
    };

    // Dynamic pro-rating of Sharing Dev Qty based on land area ratio
    const clusterRatio = totalLandArea > 0 ? (combined.landArea || 0) / totalLandArea : 0;
    combined.capexSharingDevQty = (assumptions.global.capexSharingDevQty || 0) * clusterRatio;

    clustersData[name] = runAssetEngine(combined, config, groups);
  });

  const firstCluster = clustersData[clusterNames[0]];
  const totalMonths = firstCluster.monthlyData.length;
  const consolidatedMonthlyData: any[] = [];

  for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
    const monthItem: any = {
      month: firstCluster.monthlyData[monthIdx].month,
      year: firstCluster.monthlyData[monthIdx].year,
      isOperating: firstCluster.monthlyData[monthIdx].isOperating,
      revenue: 0,
      maintOpex: 0,
      taxOpex: 0,
      overheadOpex: 0,
      ffeReserve: 0,
      medEqLeaseOpex: 0,
      ebitda: 0,
      interest: 0,
      principal: 0,
      debtBalance: 0,
      dep: 0,
      depBuild: 0,
      depMedEq: 0,
      depInfra: 0,
      depFfe: 0,
      depVat: 0,
      depContingency: 0,
      corpTax: 0,
      netIncome: 0,
      deferredCapex: 0,
      fcfe: 0,
      cumFcfe: 0,
      dscr: 0,
      yield: 0,
      fcfeExLand: 0,
      cumFcfeExLand: 0,
      interestExLand: 0,
      principalExLand: 0,
      debtBalanceExLand: 0,
      exit: 0,
      netExitProceeds: 0,
      netExitProceedsExLand: 0,
      ebt: 0,
      ebtExLand: 0,
      corpTaxExLand: 0,

      // Initialize dynamic capex spending properties
      landSpend: 0,
      buildSpend: 0,
      eqSpend: 0,
      infraSpend: 0,
      ffeSpend: 0,
      sharingSpend: 0,
      hardSpend: 0,
      consultantSpend: 0,
      licenseSpend: 0,
      vatSpend: 0,
      contingencySpend: 0,
      devGa: 0,
      devCar: 0,
      devPreOpening: 0,
      softSpend: 0,
      totalSpend: 0,
      debtDraw: 0,
    };

    clusterNames.forEach((name) => {
      const monthly = clustersData[name].monthlyData[monthIdx];
      if (monthly) {
        monthItem.revenue += monthly.revenue || 0;
        monthItem.maintOpex += monthly.maintOpex || 0;
        monthItem.taxOpex += monthly.taxOpex || 0;
        monthItem.overheadOpex += monthly.overheadOpex || 0;
        monthItem.ffeReserve += monthly.ffeReserve || 0;
        monthItem.medEqLeaseOpex += monthly.medEqLeaseOpex || 0;
        monthItem.ebitda += monthly.ebitda || 0;
        monthItem.interest += monthly.interest || 0;
        monthItem.principal += monthly.principal || 0;
        monthItem.debtBalance += monthly.debtBalance || 0;
        monthItem.dep += monthly.dep || 0;
        monthItem.depBuild += monthly.depBuild || 0;
        monthItem.depMedEq += monthly.depMedEq || 0;
        monthItem.depInfra += monthly.depInfra || 0;
        monthItem.depFfe += monthly.depFfe || 0;
        monthItem.depVat += monthly.depVat || 0;
        monthItem.depContingency += monthly.depContingency || 0;
        monthItem.corpTax += monthly.corpTax || 0;
        monthItem.netIncome += monthly.netIncome || 0;
        monthItem.deferredCapex += monthly.deferredCapex || 0;
        monthItem.fcfe += monthly.fcfe || 0;
        monthItem.fcfeExLand += monthly.fcfeExLand || 0;
        monthItem.interestExLand += monthly.interestExLand || 0;
        monthItem.principalExLand += monthly.principalExLand || 0;
        monthItem.debtBalanceExLand += monthly.debtBalanceExLand || 0;
        monthItem.exit += monthly.exit || 0;
        monthItem.netExitProceeds += monthly.netExitProceeds || 0;
        monthItem.netExitProceedsExLand += monthly.netExitProceedsExLand || 0;
        monthItem.ebt += monthly.ebt || 0;
        monthItem.ebtExLand += monthly.ebtExLand || 0;
        monthItem.corpTaxExLand += monthly.corpTaxExLand || 0;

        // Sum spending breakdowns across clusters
        monthItem.landSpend += monthly.landSpend || 0;
        monthItem.buildSpend += monthly.buildSpend || 0;
        monthItem.eqSpend += monthly.eqSpend || 0;
        monthItem.infraSpend += monthly.infraSpend || 0;
        monthItem.ffeSpend += monthly.ffeSpend || 0;
        monthItem.sharingSpend += monthly.sharingSpend || 0;
        monthItem.hardSpend += monthly.hardSpend || 0;
        monthItem.consultantSpend += monthly.consultantSpend || 0;
        monthItem.licenseSpend += monthly.licenseSpend || 0;
        monthItem.vatSpend += monthly.vatSpend || 0;
        monthItem.contingencySpend += monthly.contingencySpend || 0;
        monthItem.devGa += monthly.devGa || 0;
        monthItem.devCar += monthly.devCar || 0;
        monthItem.devPreOpening += monthly.devPreOpening || 0;
        monthItem.softSpend += monthly.softSpend || 0;
        monthItem.totalSpend += monthly.totalSpend || 0;
        monthItem.debtDraw += monthly.debtDraw || 0;
      }
    });

    if (monthIdx === 0) {
      monthItem.cumFcfe = monthItem.fcfe;
      monthItem.cumFcfeExLand = monthItem.fcfeExLand;
    } else {
      monthItem.cumFcfe = consolidatedMonthlyData[monthIdx - 1].cumFcfe + monthItem.fcfe;
      monthItem.cumFcfeExLand = consolidatedMonthlyData[monthIdx - 1].cumFcfeExLand + monthItem.fcfeExLand;
    }

    const totalConsEquity = Object.values(clustersData).reduce((sum, c) => sum + c.metrics.totalEquity, 0);
    const opFcfe = monthItem.netIncome + monthItem.dep - monthItem.principal - monthItem.deferredCapex;
    monthItem.yield = totalConsEquity > 0 ? (opFcfe / totalConsEquity) * 100 : 0;

    const principalAndInterest = monthItem.principal + monthItem.interest;
    monthItem.dscr = principalAndInterest > 0 ? monthItem.ebitda / principalAndInterest : 0;

    consolidatedMonthlyData.push(monthItem);
  }

  const consolidatedEquityCfs = consolidatedMonthlyData.map((d) => d.fcfe);
  const consolidatedEquityCfsExLand = consolidatedMonthlyData.map((d) => d.fcfeExLand);

  const consolidatedUnleveredCfs: number[] = [];
  for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
    let unlevSum = 0;
    clusterNames.forEach((name) => {
      const monthly = clustersData[name].monthlyData[monthIdx];
      if (monthly) {
        const exitUnlev = monthly.exit > 0 ? monthly.exit + (monthly.debtBalance + monthly.principal) : 0;
        const unlevFlow =
          monthly.ebitda -
          monthly.dep -
          (monthly.ebitda - monthly.dep > 0 ? (monthly.ebitda - monthly.dep) * (((assumptions.clusters?.[name]?.corporateTax ?? assumptions.global.corporateTax) || 0) / 100) : 0) +
          monthly.dep +
          exitUnlev -
          monthly.deferredCapex;
        unlevSum += unlevFlow;
      }
    });
    consolidatedUnleveredCfs.push(unlevSum);
  }

  const totalCapex = Object.values(clustersData).reduce((sum, c) => sum + c.metrics.totalCapex, 0);
  const totalDebt = Object.values(clustersData).reduce((sum, c) => sum + c.metrics.totalDebt, 0);
  const totalEquity = Object.values(clustersData).reduce((sum, c) => sum + c.metrics.totalEquity, 0);

  const operatingData = consolidatedMonthlyData.filter((d) => d.isOperating);

  const metrics = {
    totalCapex,
    totalDebt,
    totalEquity,
    irr: calculateIRR(consolidatedEquityCfs, "monthly"),
    npv: Object.values(clustersData).reduce((sum, c: any) => sum + (c.metrics?.npv || 0), 0),
    unleveredIrr: calculateIRR(consolidatedUnleveredCfs, "monthly"),
    unleveredNpv: Object.values(clustersData).reduce((sum, c: any) => sum + (c.metrics?.unleveredNpv || 0), 0),
    irrExLand: calculateIRR(consolidatedEquityCfsExLand, "monthly"),
    npvExLand: Object.values(clustersData).reduce((sum, c: any) => sum + (c.metrics?.npvExLand || 0), 0),
    payback: calculatePayback(consolidatedEquityCfs, "monthly"),
    operatingPayback: calculatePayback(consolidatedUnleveredCfs, "monthly"),
    avgDscr: operatingData.filter((d) => d.principal + d.interest > 0).length > 0
      ? operatingData.filter((d) => d.principal + d.interest > 0).reduce((sum, d) => sum + d.dscr, 0) /
        operatingData.filter((d) => d.principal + d.interest > 0).length
      : 0,
    minDscr: operatingData.filter((d) => d.principal + d.interest > 0).length > 0
      ? Math.min(...operatingData.filter((d) => d.principal + d.interest > 0).map((d) => d.dscr))
      : 0,
    avgYield: operatingData.reduce((sum, d) => sum + d.yield, 0) / Math.max(1, operatingData.length),
    moic: consolidatedEquityCfs.reduce((acc, val) => (val > 0 ? acc + val : acc), 0) / Math.max(0.01, totalEquity),
    yocExLand: operatingData.reduce((sum, d) => sum + d.ebitda, 0) /
      Math.max(1, operatingData.length) /
      Math.max(0.01, totalCapex - Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.landCost, 0)),
    costPerBed: 0,
    costPerSqm: totalCapex * 1000 / Math.max(1, (Object.values(assumptions.clusters || {}) as any[]).reduce((sum: number, c: any) => sum + (c.buildArea || 0), 0)),
  };

  const totals = {
    revenue: consolidatedMonthlyData.reduce((acc, d) => acc + (d.revenue || 0), 0),
    maintOpex: consolidatedMonthlyData.reduce((acc, d) => acc + (d.maintOpex || 0), 0),
    taxOpex: consolidatedMonthlyData.reduce((acc, d) => acc + (d.taxOpex || 0), 0),
    overheadOpex: consolidatedMonthlyData.reduce((acc, d) => acc + (d.overheadOpex || 0), 0),
    ffeReserve: consolidatedMonthlyData.reduce((acc, d) => acc + (d.ffeReserve || 0), 0),
    medEqLeaseOpex: consolidatedMonthlyData.reduce((acc, d) => acc + (d.medEqLeaseOpex || 0), 0),
    ebitda: consolidatedMonthlyData.reduce((acc, d) => acc + (d.ebitda || 0), 0),
    interest: consolidatedMonthlyData.reduce((acc, d) => acc + (d.interest || 0), 0),
    principal: consolidatedMonthlyData.reduce((acc, d) => acc + (d.principal || 0), 0),
    ds: consolidatedMonthlyData.reduce((acc, d) => acc + (d.interest || 0) + (d.principal || 0), 0),
    dep: consolidatedMonthlyData.reduce((acc, d) => acc + (d.dep || 0), 0),
    ebt: consolidatedMonthlyData.reduce((acc, d) => acc + (d.ebt || 0), 0),
    corpTax: consolidatedMonthlyData.reduce((acc, d) => acc + (d.corpTax || 0), 0),
    netIncome: consolidatedMonthlyData.reduce((acc, d) => acc + (d.netIncome || 0), 0),
    deferredCapex: consolidatedMonthlyData.reduce((acc, d) => acc + (d.deferredCapex || 0), 0),
    fcfe: consolidatedMonthlyData.reduce((acc, d) => acc + (d.fcfe || 0), 0),
    netExitProceeds: consolidatedMonthlyData.reduce((acc, d) => acc + (d.netExitProceeds || 0), 0),
    interestExLand: consolidatedMonthlyData.reduce((acc, d) => acc + (d.interestExLand || 0), 0),
    principalExLand: consolidatedMonthlyData.reduce((acc, d) => acc + (d.principalExLand || 0), 0),
    ebtExLand: consolidatedMonthlyData.reduce((acc, d) => acc + (d.ebtExLand || 0), 0),
    corpTaxExLand: consolidatedMonthlyData.reduce((acc, d) => acc + (d.corpTaxExLand || 0), 0),
    netExitProceedsExLand: consolidatedMonthlyData.reduce((acc, d) => acc + (d.netExitProceedsExLand || 0), 0),
    fcfeExLand: consolidatedMonthlyData.reduce((acc, d) => acc + (d.fcfeExLand || 0), 0),

    // Sum spending totals across clusters
    landSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.landSpend || 0), 0),
    buildSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.buildSpend || 0), 0),
    eqSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.eqSpend || 0), 0),
    infraSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.infraSpend || 0), 0),
    ffeSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.ffeSpend || 0), 0),
    sharingSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.sharingSpend || 0), 0),
    hardSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.hardSpend || 0), 0),
    consultantSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.consultantSpend || 0), 0),
    licenseSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.licenseSpend || 0), 0),
    vatSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.vatSpend || 0), 0),
    contingencySpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.contingencySpend || 0), 0),
    devGa: consolidatedMonthlyData.reduce((acc, d) => acc + (d.devGa || 0), 0),
    devCar: consolidatedMonthlyData.reduce((acc, d) => acc + (d.devCar || 0), 0),
    devPreOpening: consolidatedMonthlyData.reduce((acc, d) => acc + (d.devPreOpening || 0), 0),
    softSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.softSpend || 0), 0),
    totalSpend: consolidatedMonthlyData.reduce((acc, d) => acc + (d.totalSpend || 0), 0),
    debtDraw: consolidatedMonthlyData.reduce((acc, d) => acc + (d.debtDraw || 0), 0),
  };

  const capexDetails = {
    landCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.landCost, 0),
    buildCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.buildCost, 0),
    totalHardCosts: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.totalHardCosts, 0),
    totalSoftCosts: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.totalSoftCosts, 0),
    totalCapex: totalCapex,
    medEqCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.medEqCost, 0),
    infraCost: Object.values(clustersData).reduce((sum, c) => sum + (c.capexDetails.infraCost || 0), 0),
    civilMepCost: Object.values(clustersData).reduce((sum, c) => sum + (c.capexDetails.civilMepCost || 0), 0),
    ffeCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.ffeCost, 0),
    consultantCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.consultantCost, 0),
    licenseCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.licenseCost, 0),
    vatCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.vatCost, 0),
    contingencyCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.contingencyCost, 0),
    sharingDevCost: Object.values(clustersData).reduce((sum, c) => sum + c.capexDetails.sharingDevCost, 0),
    devGa: Object.values(clustersData).reduce((sum, c) => sum + (c.capexDetails.devGa || 0), 0),
    devCar: Object.values(clustersData).reduce((sum, c) => sum + (c.capexDetails.devCar || 0), 0),
    devPreOpening: Object.values(clustersData).reduce((sum, c) => sum + (c.capexDetails.devPreOpening || 0), 0),
  };

  return {
    monthlyData: consolidatedMonthlyData,
    operatingData,
    metrics,
    totals,
    capexDetails,
    clustersData,
  };
};

