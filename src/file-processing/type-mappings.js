const typeMappings = {
  string: { htmlType: "text", yupType: "string" },
  number: { htmlType: "number", yupType: "number" },
  Date: { htmlType: "date", yupType: "date" },
  boolean: { htmlType: "checkbox", yupType: "boolean" },
  bigint: { htmlType: "number", yupType: "number" },
  symbol: { htmlType: "text", yupType: "string" },
  any: { htmlType: "text", yupType: "mixed" },
};

module.exports = typeMappings;
