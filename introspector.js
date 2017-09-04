module.exports = {
  requestedFields(info) {
    try {
      return [...new Set(info
        .fieldNodes
        .map(node => node.selectionSet.selections.map(selection => selection.name.value))
        .reduce([].concat.call))];
    } catch (e) {
      return [];
    }
  },
};