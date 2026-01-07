function vacancyKey(v) {
  return `${v.vacancy.meta.source}:${v.vacancy.id}`;
}

function vacancyKeyByParts(source, id) {
  return `${source}:${id}`;
}

module.exports = {
  vacancyKey,
  vacancyKeyByParts,
};
