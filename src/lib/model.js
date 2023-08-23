import Dexie from 'dexie'

export const DB = new Dexie('acewords')

// id is index in book
DB.version(1).stores({
  lib: 'id', // { id, _id, word, definition, translation, ... }
  pro: 'id, due' // { id, due, step }
})
export const time = () => Math.floor(Date.now() / 1000)

export const model = {
  // in seconds
  stepTime: [0, 10, 30, 120, 300, 1800, 43200, 86400, 172800, 345600, 604800, 1296000, 2592000, 5184000, 8640000, 15552000, 300000000],
  time: () => Math.floor(Date.now() / 1000),
  // ALL functions are ASYNC
  lib: {
    async put (words) {
      for (const w of words) await DB.lib.put(w)
    },
    get: id => DB.lib.get(id),
    clear: () => DB.lib.clear()
  },
  pro: {
    put: pro => DB.pro.put(pro),
    all: (onlyID = false) => onlyID
      ? DB.pro.toCollection().primaryKeys()
      : DB.pro.toArray(),
    due: d => DB.pro.where('due').below(d).sortBy('due'),
    first: () => DB.pro.orderBy('due').first(),
    clear: () => DB.pro.clear()
  },
  async export () {
    console.log(this)
  },
  async import () {
  }
}

export default model
