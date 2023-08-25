export function load (ctx) {
  const newWordsNumber = Number(ctx.url.searchParams.get('new'))
  return { newWordsNumber }
}
