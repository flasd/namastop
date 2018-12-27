exports.trimObject = function trimObject(target) {
  const copy = Object.assign({}, target);

  Object.keys(copy).forEach(key => {
    if (copy[key] === undefined || copy[key] === null) {
      delete copy[key];
    }
  });

  return copy;
};
