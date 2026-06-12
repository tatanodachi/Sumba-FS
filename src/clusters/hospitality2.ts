import { DEFAULT_ASSET_ASSUMPTIONS } from "./base";

export const HOSPITALITY2_ASSUMPTIONS = {
  ...DEFAULT_ASSET_ASSUMPTIONS,
  landArea: 41139,
  buildArea: 10000,
  rooms: 45,
  adr: 2200000,
  stabilizedOccupancy: 0.70,
  buildCost: 13.0,
  includeLand: true,
  includeMedEq: false,
  capexSharingDevQty: 1946,
};
