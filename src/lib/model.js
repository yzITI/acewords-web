import Dexie from 'dexie'

export const DB = new Dexie('acewords')

// id is index in book
DB.version(1).stores({
  lib: '_id', // { _id, word, definition, translation, ... }
  pro: 'id, time, due' // { id, step, time, due }
})
export const time = () => Math.floor(Date.now() / 1000)

export const model = {
  // in seconds, 0-16
  stepTime: [0, 10, 30, 120, 300, 1800, 43200, 86400, 172800, 345600, 604800, 1296000, 2592000, 5184000, 8640000, 15552000, 300000000],
  time: () => Math.floor(Date.now() / 1000),
  // ALL functions are ASYNC
  lib: {
    async put (words) {
      for (const w of words) await DB.lib.put(w)
    },
    get: _id => DB.lib.get(_id),
    clear: () => DB.lib.clear()
  },
  pro: {
    put: pro => DB.pro.put(pro),
    all: (onlyID = false) => onlyID
      ? DB.pro.toCollection().primaryKeys()
      : DB.pro.toArray(),
    due: d => DB.pro.where('due').below(d).sortBy('due'),
    after: d => DB.pro.where('time').above(d).sortBy('time'),
    first: () => DB.pro.orderBy('due').first(),
    clear: () => DB.pro.clear()
  },
  // encode with base 36
  async export () {
    const ps = await this.pro.all()
    let res = ''
    for (const p of ps) res += `${p.id.toString(36)},${p.step.toString(36)},${p.time.toString(36)}.`
    return res
  },
  async import (data) {
    await this.pro.clear()
    const raw = data.split('.').filter(x => x).map(x => x.split(',').map(y => parseInt(y, 36)))
    for (const p of raw) await this.pro.put({ id: p[0], step: p[1], time: p[2], due: model.stepTime[p[1]] + p[2] })
  }
}

export default model
