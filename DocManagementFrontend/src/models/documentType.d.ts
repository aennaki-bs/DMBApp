
export interface DocumentTypeUpdateRequest {
  typeKey?: string;
  typeName?: string;
  typeAttr?: string;
  documentCounter?: number; // Adding this field to match the usage in DocumentTypeForm
}
