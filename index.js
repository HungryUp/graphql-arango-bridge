const { requestedFields } = require('./introspector');

const cmodule = {
  /**
   * Helper to get automatically arangoDB Projection along to params
   *
   * @param resolverFunction
   * @param authorizedProjection
   * @returns {function(*, *=, *, *=)}
   */
  arangoSugarResolver(authorizedProjection, resolverFunction) {
    return async (obj, args, context, info) => {
      const resolvedProjection = cmodule.getArangoDBProjection(info, authorizedProjection);
      return resolverFunction(args, resolvedProjection, { info, context, obj });
    };
  },

  /**
   * Helper to abstract arangoDB projection & graphQL info object to filter retrievied fields.
   *
   * @param info
   * @param authorizedProjection
   * @returns {{_key: boolean, _id: boolean, _rev: boolean}}
   */
  getArangoDBProjection(info, authorizedProjection) {
    let fields = requestedFields(info);
    if (authorizedProjection) {
      authorizedProjection = new Set(authorizedProjection);
      fields = [...fields].filter(v => authorizedProjection.has(v));
    }
    const o = {
      _key: false,
      _id: false,
      _rev: false,
    };
    for (const field of fields) {
      switch (field) {
        case 'id':
          o._key = true;
          break;
        case 'revision':
          o._rev = true;
          break;
        default:
          o[field] = true;
          break;
      }
    }
    return o;
  },

  /**
   * Is used to generate basic resolvers for arangodb (id & revision)
   *
   * @param params
   * @param resolvers
   * @returns {*}
   */
  arangoSugarObject(params = [], resolvers = {}) {
    const o = {};
    if (params.includes('id')) {
      o.id = obj => obj.key || obj._discriminators._key
    }
    if (params.includes('revision')) {
      o.revision = obj => obj.revision || obj._discriminators._rev;
    }
    return Object.assign(o, resolvers);
  },
};

module.exports = cmodule;