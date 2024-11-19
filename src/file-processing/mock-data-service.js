const generateMockData = (
  properties,
  index = 0,
  parentName = "",
  options = {}
) => {
  const mockData = {};
  properties.forEach((prop) => {
    const labelPrefix = parentName
      ? `${parentName} ${prop.label || prop.name}`
      : prop.label || prop.name;

    if (prop.yupType === "string") {
      mockData[prop.name] = `${labelPrefix} ${index}`;
    } else if (prop.yupType === "number") {
      mockData[prop.name] = Math.floor(Math.random() * 100) + index;
    } else if (prop.yupType === "date") {
      mockData[prop.name] = new Date();
    } else if (prop.yupType === "array") {
      mockData[prop.name] = [];
    } else if (prop.yupType === "object") {
      mockData[prop.name] = null;
    } else if (prop.type === "multi-select" || prop.type === "select") {
      // Assign a random value from the generated options, if available
      const generatedOptions = options[prop.name];
      if (generatedOptions && generatedOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * generatedOptions.length);
        mockData[prop.name] =
          prop.type === "multi-select"
            ? [generatedOptions[randomIndex].value] // Assign an array with one selected option for multi-select
            : generatedOptions[randomIndex].value; // Assign a single selected option for select
      } else {
        mockData[prop.name] = prop.type === "multi-select" ? [] : null;
      }
    }
  });
  return mockData;
};

const generateMockArray = (
  arrayLength = 3,
  properties,
  parentName = "",
  options = {}
) => {
  return Array(arrayLength)
    .fill(null)
    .map((_, index) => {
      const mockObject = generateMockData(
        properties,
        index,
        parentName,
        options
      );
      const labelProp = properties.find((prop) => prop.optionsLabel);

      const uniquePart = Math.random().toString(36).substr(2, 5);
      const keyBase = labelProp
        ? mockObject[labelProp.name]
        : `Unknown-${index}`;
      const uniqueId = `${keyBase}-${index}-${uniquePart}`;

      return {
        value: mockObject,
        label: labelProp
          ? mockObject[labelProp.name]
          : `Unknown Label ${index}`,
        key: uniqueId,
      };
    });
};

module.exports = { generateMockArray };
