function applyFieldPathUpdate(rootObj, fieldPath, newValue) {
  if (!rootObj || !fieldPath) return;

  const segments = fieldPath
    .replace(/\]/g, "")
    .split(".")
    .map((s) => s.replace("[", "."))
    .join(".")
    .split(".");

  let obj = rootObj;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    if (obj == null || !(key in obj)) return; // invalid path, ignore
    obj = obj[key];
  }
  const lastKey = segments[segments.length - 1];
  if (obj != null) {
    obj[lastKey] = newValue;
  }
}

module.exports = { applyFieldPathUpdate };