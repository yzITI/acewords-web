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
  exchange: Boolean,
  skip: Boolean
}
LS.statistics = {
  true: Number,
  false: Number,
  trueTime: Number, // time in ms
  falseTime: Number
}
```
