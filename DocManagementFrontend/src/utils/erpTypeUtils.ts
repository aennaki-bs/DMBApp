import { TierType } from "@/models/document";

// ERP Type mappings based on type numbers from DataSeeder
export const ERP_TYPE_MAPPINGS = {
  // Customer types (0-5)
  0: "Sales Quote",
  1: "Sales Order", 
  2: "Sales Invoice",
  3: "Sales Credit Memo",
  4: "Sales Blanket Order",
  5: "Sales Return Order",
  
  // Vendor types (10-15)
  10: "Purchase Quote",
  11: "Purchase Order",
  12: "Purchase Invoice", 
  13: "Purchase Credit Memo",
  14: "Purchase Blanket Order",
  15: "Purchase Return Order"
} as const;

export const getErpTypeFromNumber = (typeNumber?: number): string => {
  if (typeNumber === undefined || typeNumber === null) {
    return "None";
  }

  const erpType = ERP_TYPE_MAPPINGS[typeNumber as keyof typeof ERP_TYPE_MAPPINGS];
  return erpType || "None";
};

export const getErpTypesByTierType = (tierType: TierType) => {
  switch (tierType) {
    case TierType.Customer:
      return [
        { typeNumber: 0, typeName: "Sales Quote", typeKey: "SQ", typeAttr: "Quote" },
        { typeNumber: 1, typeName: "Sales Order", typeKey: "SO", typeAttr: "Order" },
        { typeNumber: 2, typeName: "Sales Invoice", typeKey: "SI", typeAttr: "Invoice" },
        { typeNumber: 3, typeName: "Sales Credit Memo", typeKey: "SCM", typeAttr: "Credit Memo" },
        { typeNumber: 4, typeName: "Sales Blanket Order", typeKey: "CBO", typeAttr: "Blanket Order" },
        { typeNumber: 5, typeName: "Sales Return Order", typeKey: "CRO", typeAttr: "Return Order" },
      ];
    case TierType.Vendor:
      return [
        { typeNumber: 10, typeName: "Purchase Quote", typeKey: "PQ", typeAttr: "Quote" },
        { typeNumber: 11, typeName: "Purchase Order", typeKey: "PO", typeAttr: "Order" },
        { typeNumber: 12, typeName: "Purchase Invoice", typeKey: "PI", typeAttr: "Invoice" },
        { typeNumber: 13, typeName: "Purchase Credit Memo", typeKey: "PCM", typeAttr: "Credit Memo" },
        { typeNumber: 14, typeName: "Purchase Blanket Order", typeKey: "PBO", typeAttr: "Blanket Order" },
        { typeNumber: 15, typeName: "Purchase Return Order", typeKey: "VRO", typeAttr: "Return Order" },
      ];
    case TierType.None:
    default:
      return [];
  }
}; 