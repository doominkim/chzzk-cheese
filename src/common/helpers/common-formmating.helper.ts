const compareObjects = (targetObject: object, plainObject: object) => {
  const result = {};

  for (const key in targetObject) {
    for (const key2 in plainObject) {
      if (key === key2) {
        result[key] = plainObject[key];
      }
    }
  }

  return result;
};

export { compareObjects };
