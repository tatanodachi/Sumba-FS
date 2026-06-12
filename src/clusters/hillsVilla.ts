import { DEFAULT_ASSET_ASSUMPTIONS } from "./base";

export const HILLS_VILLA_ASSUMPTIONS = {
  ...DEFAULT_ASSET_ASSUMPTIONS,
  landArea: 66986,
  buildArea: 12000,
  rooms: 15,
  adr: 4500000,
  stabilizedOccupancy: 0.60,
  buildCost: 12.0,
  includeLand: true,
  includeMedEq: false,
  capexSharingDevQty: 2700,
};
