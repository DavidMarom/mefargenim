export const getDisplayLabel = (key: string): string => {
  if (key === "title") {
    return "שם העסק";
  }
  if (key === "type") {
    return "סוג העסק";
  }
  if (key === "phone") {
    return "טלפון";
  }
  if (key === "city") {
    return "עיר";
  }
  return key;
};

export const formatPhoneForTel = (phone: unknown): string => {
  if (!phone) return "";
  // Remove all non-digit characters except + for international numbers
  return phone.toString().replace(/[^\d+]/g, "");
};

