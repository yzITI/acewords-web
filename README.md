# acewords-web

> Although it is built by sveltkit, the SSR is **disabled** globally.

## LocalStorage Cache

```js
LS.user // user id
LS.token // user token
LS.meta // local meta object
LS.book // book cache
LS.settings = { // settings
  definition: Boolean,
  exchange: Boolean
}
LS.statistics = {
  T: Number,
  F: Number,
  TTime: Number, // time in ms
  FTime: Number
}
```
