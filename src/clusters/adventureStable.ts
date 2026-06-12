import { DEFAULT_ASSET_ASSUMPTIONS } from "./base";

export const ADVENTURE_STABLE_ASSUMPTIONS = {
  ...DEFAULT_ASSET_ASSUMPTIONS,
  landArea: 99345,
  buildArea: 15000,
  rooms: 5,
  adr: 3500000,
  stabilizedOccupancy: 0.40,
  buildCost: 8.5,
  includeLand: true,
  includeMedEq: false,
  capexSharingDevQty: 4609,
};
