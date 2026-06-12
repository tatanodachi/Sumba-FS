import { DEFAULT_ASSET_ASSUMPTIONS } from "./base";

export const HOSPITALITY1_ASSUMPTIONS = {
  ...DEFAULT_ASSET_ASSUMPTIONS,
  landArea: 104143,
  buildArea: 25000,
  rooms: 60,
  adr: 1800000,
  stabilizedOccupancy: 0.65,
  buildCost: 14.0,
  includeLand: true,
  includeMedEq: false,
  capexSharingDevQty: 4700,
};
