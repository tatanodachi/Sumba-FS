import { DEFAULT_ASSET_ASSUMPTIONS } from "./base";

export interface GlampingUnitType {
  id: number;
  name: string;
  size: string;
  qty: number;
  villaCost: number; // in IDR
  interiorCost: number; // in IDR
  isAccommodation: boolean;
}

export const GLAMPING_ASSUMPTIONS = {
  ...DEFAULT_ASSET_ASSUMPTIONS,
  type: "glamping",
  landArea: 41042,
  buildArea: 5000,
  capexInfraQty: 19569,
  capexInfraPrice: 0.45,
  devDurationMonths: 12,
  
  // Glamping Specifics
  roomUnits: 20,
  barUnits: 1,
  adr: 2500000, // IDR
  barRevenuePctOfRoom: 0.40,
  fbCogsPct: 35,
  civilMepCostPerUnit: 100, // million IDR
  adrEscalationYear1to5: 5,
  adrEscalationAfterYear5: 3,
  
  initialOccupancy: 0.30,
  stabilizedOccupancy: 0.55,
  seasonality: [0.8, 0.7, 0.9, 1.1, 1.2, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9, 0.8],
  
  // Glamping OpEx
  directLaborPct: 0.15,
  directRepairsPct: 0.07,
  directUtilitiesPct: 0.05,
  adminLaborPct: 0.10,
  marketingPct: 0.05,
  adminGeneralPct: 0.05,
  
  manualBaseRent: 0,
  manualRentEscalation: 0,
  
  buildCost: 650,
  includeLand: true,
  includeMedEq: false,
  capexSharingDevQty: 1904,

  // Option 1: Dynamic Glamping Mix
  glampingMix: [
    {
      id: 1,
      name: "1Br Tent - Deluxe",
      size: "5 x 5",
      qty: 12,
      villaCost: 649347750,
      interiorCost: 182913300,
      isAccommodation: true
    },
    {
      id: 2,
      name: "1Br Tent - Family",
      size: "5 x 7.5",
      qty: 6,
      villaCost: 683849250,
      interiorCost: 275237100,
      isAccommodation: true
    },
    {
      id: 3,
      name: "1Br Tent - Suite",
      size: "7.5 x 10",
      qty: 2,
      villaCost: 1046354850,
      interiorCost: 306805050,
      isAccommodation: true
    },
    {
      id: 4,
      name: "Spa Tent - Double Roof",
      size: "5 x 7.5",
      qty: 1,
      villaCost: 658757250,
      interiorCost: 191732400,
      isAccommodation: false
    },
    {
      id: 5,
      name: "Bar Tent - Double Roof",
      size: "5 x 7.5",
      qty: 1,
      villaCost: 599957100,
      interiorCost: 292838400,
      isAccommodation: false
    },
    {
      id: 6,
      name: "Restaurant Tent - Double Roof",
      size: "7.5 x 10",
      qty: 1,
      villaCost: 1006041600,
      interiorCost: 413113950,
      isAccommodation: false
    }
  ] as GlampingUnitType[]
};

