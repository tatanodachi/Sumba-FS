import React, { useState } from "react";
import {
  Plus,
  Trash2,
  HelpCircle,
  Info,
  Calculator,
  Percent,
  Bed,
  Footprints,
} from "lucide-react";
import { GlampingUnitType } from "../clusters/glamping";

interface GlampingMixTableProps {
  mix: GlampingUnitType[];
  onChange: (newMix: GlampingUnitType[]) => void;
  isLocked: boolean;
}

export const GlampingMixTable: React.FC<GlampingMixTableProps> = ({
  mix = [],
  onChange,
  isLocked,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>(
    {},
  );

  // Initial dummy / default values for adding new types
  const handleAddRow = () => {
    if (isLocked) return;
    const nextId = mix.length > 0 ? Math.max(...mix.map((m) => m.id)) + 1 : 1;
    const newRow: GlampingUnitType = {
      id: nextId,
      name: `New Tent Model #${nextId}`,
      size: "5 x 5",
      qty: 1,
      villaCost: 600000000, // 0.60 B IDR
      interiorCost: 150000000, // 0.15 B IDR
      isAccommodation: true,
    };
    onChange([...mix, newRow]);
  };

  const handleRemoveRow = (id: number) => {
    if (isLocked) return;
    onChange(mix.filter((m) => m.id !== id));
  };

  const handleBillionChange = (
    id: number,
    key: "villaCost" | "interiorCost",
    strValue: string,
  ) => {
    if (isLocked) return;
    const editKey = `${id}-${key}`;
    setEditingValues((prev) => ({ ...prev, [editKey]: strValue }));

    // Standardize: if user uses comma as thousand separator, we strip it.
    // If they use it as decimal (old behavior), we'd need to know intent, but user explicitly asked for comma=thousand, dot=decimal.
    const normalized = strValue.replace(/,/g, "");
    const num = parseFloat(normalized);

    const updated = mix.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          [key]: isNaN(num) ? 0 : Math.round(num * 1000000000),
        };
      }
      return row;
    });
    onChange(updated);
  };

  const getBillionString = (
    id: number,
    key: "villaCost" | "interiorCost",
    rawIDR: number,
  ) => {
    const editKey = `${id}-${key}`;
    if (editingValues[editKey] !== undefined) {
      return editingValues[editKey];
    }
    const bn = rawIDR / 1000000000;
    return bn === 0 ? "0" : bn.toFixed(2);
  };

  const handleCellChange = (
    id: number,
    key: keyof GlampingUnitType,
    value: any,
  ) => {
    if (isLocked) return;
    const updated = mix.map((row) => {
      if (row.id === id) {
        return { ...row, [key]: value };
      }
      return row;
    });
    onChange(updated);
  };

  // Calculations
  const totalUnits = mix.reduce((sum, item) => sum + (item.qty || 0), 0);
  const accommodationUnits = mix
    .filter((item) => item.isAccommodation)
    .reduce((sum, item) => sum + (item.qty || 0), 0);
  const facilityUnits = totalUnits - accommodationUnits;

  const grandTotalIDR = mix.reduce(
    (sum, item) =>
      sum +
      (item.qty || 0) * ((item.villaCost || 0) + (item.interiorCost || 0)),
    0,
  );

  const totalVillaSumproduct = mix.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.villaCost || 0),
    0,
  );

  const totalInteriorSumproduct = mix.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.interiorCost || 0),
    0,
  );

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatBillions = (val: number) => {
    const bn = val / 1000000000;
    return (
      bn.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " B"
    );
  };

  return (
    <div className="bg-[#F9F8F6] rounded-[16px] p-4 border border-[#D8D8D8] shadow-sm space-y-3 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <h3 className="text-sm font-black text-[#1E2F31] tracking-tight flex items-center gap-1.5">
              <Footprints className="text-[#1C6048]" size={14} />
              Glamping Mix
            </h3>
            <p className="text-[9px] text-[#4C4A4B] font-medium leading-relaxed">
              Tent model mix dictating active room counts and capex.
            </p>
          </div>

          {/* Mini Summary Rail (Option A) */}
          <div className="flex items-center gap-2 mt-1 md:mt-0 md:ml-4 md:pl-4 md:border-l md:border-[#D8D8D8]">
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-[#D8D8D8]/50">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                Total:
              </span>
              <span className="text-[11px] font-black text-[#1E2F31]">
                {totalUnits}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#1C6048]/5 rounded-lg border border-[#1C6048]/10 text-[#1C6048]">
              <Bed size={10} />
              <span className="text-[11px] font-black">
                {accommodationUnits}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#9B8B70]/5 rounded-lg border border-[#9B8B70]/10 text-[#9B8B70]">
              <Info size={10} />
              <span className="text-[11px] font-black">{facilityUnits}</span>
            </div>
          </div>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={handleAddRow}
            id="add-glamping-row-btn"
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1C6048] hover:bg-[#144836] text-white text-[10px] font-bold rounded-lg transition-all duration-300 shadow-sm"
          >
            <Plus size={12} strokeWidth={2.5} />
            Add Tent Model
          </button>
        )}
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-[#D8D8D8] bg-white">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#EFEBE7]/80 border-b border-[#D8D8D8] text-[9px] font-semibold text-[#1E2F31] uppercase tracking-wider">
              <th className="py-2.5 px-2 text-center w-8">No.</th>
              <th className="py-2.5 px-2 w-[18%]">Type (Structure)</th>
              <th className="py-2.5 px-2 text-center w-20">Size (m)</th>
              <th className="py-2.5 px-2 text-center w-12">Qty</th>
              <th className="py-2.5 px-2 w-24 text-right">Villa (B)</th>
              <th className="py-2.5 px-2 w-24 text-right">FF&E (B)</th>
              <th className="py-2.5 px-2 text-right w-24">Unit (B)</th>
              <th className="py-2.5 px-2 text-right w-24">Total (B)</th>
              <th className="py-2.5 px-2 text-center w-32">Category</th>
              <th className="py-2.5 px-2 bg-[#F9F8F6]/20 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D8D8]/50 text-xs text-[#1E2F31]">
            {mix.map((row, idx) => {
              const unitSum = (row.villaCost || 0) + (row.interiorCost || 0);
              const rowTotal = (row.qty || 0) * unitSum;

              return (
                <tr
                  key={row.id}
                  className={`transition-colors duration-200 ${
                    row.isAccommodation
                      ? "hover:bg-[#1C6048]/5"
                      : "hover:bg-[#9B8B70]/5"
                  }`}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* ID / Type */}
                  <td className="py-1 px-2 text-center font-mono font-medium text-gray-400 text-[10px]">
                    {idx + 1}
                  </td>

                  {/* Name */}
                  <td className="py-1 px-2 font-bold text-[#1E2F31]">
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-transparent hover:border-[#1C6048]/30 focus:border-[#1C6048] focus:outline-none py-0.5 text-xs transition-colors font-bold disabled:text-[#1E2F31]/80"
                      value={row.name}
                      disabled={isLocked}
                      onChange={(e) =>
                        handleCellChange(row.id, "name", e.target.value)
                      }
                    />
                  </td>

                  {/* Size */}
                  <td className="py-1 px-2 text-center">
                    <input
                      type="text"
                      className="w-16 text-center bg-[#F9F8F6] hover:bg-white focus:bg-white border border-[#D8D8D8]/60 focus:border-[#1C6048] rounded px-1 py-0.5 text-[10px] font-medium focus:outline-none transition-colors disabled:bg-transparent disabled:border-transparent disabled:text-[#1E2F31]"
                      value={row.size}
                      disabled={isLocked}
                      onChange={(e) =>
                        handleCellChange(row.id, "size", e.target.value)
                      }
                    />
                  </td>

                  {/* Qty */}
                  <td className="py-1 px-2 text-center">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="1"
                        className="w-10 text-center bg-[#F9F8F6] hover:bg-white focus:bg-white border border-[#D8D8D8]/60 focus:border-[#1C6048] rounded px-1 py-0.5 text-[10px] font-mono font-bold focus:outline-none transition-colors disabled:bg-transparent disabled:border-transparent disabled:text-[#1E2F31] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={row.qty === 0 ? "" : row.qty}
                        disabled={isLocked}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value) || 0;
                          handleCellChange(row.id, "qty", parsed);
                        }}
                      />
                    </div>
                  </td>

                  {/* Villa Cost (IDR B) */}
                  <td className="py-1 px-2">
                    <div className="flex items-center justify-end">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-16 text-right bg-[#F9F8F6] hover:bg-white focus:bg-white border border-[#D8D8D8]/60 focus:border-[#1C6048] rounded px-1 py-0.5 text-[10px] font-mono font-semibold focus:outline-none transition-colors disabled:bg-transparent disabled:border-transparent disabled:text-[#1E2F31]"
                        value={getBillionString(
                          row.id,
                          "villaCost",
                          row.villaCost,
                        )}
                        disabled={isLocked}
                        onChange={(e) =>
                          handleBillionChange(
                            row.id,
                            "villaCost",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </td>

                  {/* Interior Cost (IDR B) */}
                  <td className="py-1 px-2">
                    <div className="flex items-center justify-end">
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-16 text-right bg-[#F9F8F6] hover:bg-white focus:bg-white border border-[#D8D8D8]/60 focus:border-[#1C6048] rounded px-1 py-0.5 text-[10px] font-mono font-semibold focus:outline-none transition-colors disabled:bg-transparent disabled:border-transparent disabled:text-[#1E2F31]"
                        value={getBillionString(
                          row.id,
                          "interiorCost",
                          row.interiorCost,
                        )}
                        disabled={isLocked}
                        onChange={(e) =>
                          handleBillionChange(
                            row.id,
                            "interiorCost",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </td>

                  {/* Unit Sum */}
                  <td className="py-1 px-2 text-right font-mono font-bold text-[#4C4A4B] text-[10px]">
                    {(unitSum / 1000000000).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Total Cost */}
                  <td className="py-1 px-2 text-right font-mono font-bold text-[#1E2F31] text-[10px]">
                    {(rowTotal / 1000000000).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Use / Type (Accommodation vs Facility) */}
                  <td className="py-1 px-2 text-center">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() =>
                        handleCellChange(
                          row.id,
                          "isAccommodation",
                          !row.isAccommodation,
                        )
                      }
                      className={`px-2 py-1 rounded-lg text-[8px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 justify-center mx-auto min-w-[124px] ${
                        row.isAccommodation
                          ? "bg-[#1C6048]/10 text-[#1C6048] border border-[#1C6048]/10 hover:bg-[#1C6048]/20"
                          : "bg-[#9B8B70]/10 text-[#9B8B70] border border-[#9B8B70]/10 hover:bg-[#9B8B70]/20"
                      }`}
                    >
                      {row.isAccommodation ? (
                        <>
                          <Bed size={9} />
                          Accommodation
                        </>
                      ) : (
                        <>
                          <Info size={9} />
                          Amenity Tent
                        </>
                      )}
                    </button>
                  </td>

                  {/* Remove Row */}
                  <td className="py-1 px-2 text-center">
                    {!isLocked && mix.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className={`text-gray-300 hover:text-rose-600 transition-all p-0.5 rounded hover:bg-rose-50 ${
                          hoveredRow === row.id ? "opacity-100" : "opacity-40"
                        }`}
                        title="Remove model type"
                      >
                        <Trash2 size={11} />
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-[1.5px] border-[#D8D8D8] bg-[#EFEBE7]/50 text-[10px] font-bold text-[#1E2F31]">
            <tr>
              <td
                colSpan={4}
                className="py-2.5 px-2 text-left uppercase tracking-wider text-gray-500"
              >
                Sumproduct Totals
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-[#1C6048]">
                {(totalVillaSumproduct / 1000000000).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-[#1C6048]">
                {(totalInteriorSumproduct / 1000000000).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-gray-400">
                -
              </td>
              <td className="py-2.5 px-2 text-right font-mono text-[#1E2F31]">
                {(grandTotalIDR / 1000000000).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td colSpan={2} className="py-2.5 px-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
