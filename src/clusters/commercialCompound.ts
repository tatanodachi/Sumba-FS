import { DEFAULT_ASSET_ASSUMPTIONS } from "./base";

export const COMMERCIAL_COMPOUND_ASSUMPTIONS = {
  ...DEFAULT_ASSET_ASSUMPTIONS,
  landArea: 66856,
  buildArea: 13000,
  rooms: 10,
  adr: 1500000,
  stabilizedOccupancy: 0.75,
  buildCost: 11.5,
  includeLand: true,
  includeMedEq: false,
  capexSharingDevQty: 2700,
};
