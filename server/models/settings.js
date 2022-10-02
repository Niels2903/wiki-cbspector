const Model = require('objection').Model
const _ = require('lodash')

/**
 * Settings model
 */
module.exports = class Setting extends Model {
  static get tableName() { return 'settings' }
  static get idColumn() { return 'key' }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['key'],

      properties: {
        key: {type: 'string'}
      }
    }
  }

  static get jsonAttributes() {
    return ['value']
  }

  static async getConfig() {
    const settings = await WIKI.db.settings.query()
    if (settings.length > 0) {
      return _.reduce(settings, (res, val, key) => {
        _.set(res, val.key, (_.has(val.value, 'v')) ? val.value.v : val.value)
        return res
      }, {})
    } else {
      return false
    }
  }
}
