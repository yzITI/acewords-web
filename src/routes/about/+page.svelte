<script>
  import logo from '$lib/images/logo.svg'
  import guideAndroid from '$lib/images/guide_android.png'
  import guideDesktop from '$lib/images/guide_desktop.png'
  import guideIOS from '$lib/images/guide_ios.png'
  import srpc from '$lib/srpc.js'

  export let data

  let guide = guideDesktop
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  if (/android/i.test(userAgent)) guide = guideAndroid
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) guide = guideIOS

  window.srpc = srpc
  window.token = data.user.token
</script>

<div class="min-h-screen w-full px-8 sm:px-10 py-10 bg-gray-100">
  <h1 class="flex items-center">
    <img class="w-16 h-16" alt="logo" src={logo}>
    <span class="text-2xl ml-2 font-semibold">关于 Acewords</span>
  </h1>
  <div style="max-width: 600px;" class="text-gray-700 text-sm">
    <h2 class="mt-4 mb-2 text-black text-xl">什么是Acewords？</h2>
    <p>Acewords是专门为语言考试集训设计的高效背单词工具，它几乎以灌顶的形式辅助用户快速记忆大量单词，扩展学生的认知单词量。</p>
    <h2 class="mt-4 mb-2 text-black text-xl">Acewords适合谁用？</h2>
    <p>适合那些愿意在语言学习上花费时间，有动力迫切提高词汇量的学生，特别是那些要参加升学语言考试的学生。</p>
    <h2 class="mt-4 mb-2 text-black text-xl">Acewords如何提高效率？</h2>
    <p>在算法上，Acewords使用艾宾浩斯模型对每个单词的记忆进度量化分析，精准地重现单词，不断滚动复习加深单词记忆。Acewords的单词复现频率远高于同类产品，对错误的容忍度也更低，在大规模背单词时可以帮您记得更牢，忘得更慢！</p>
    <h2 class="mt-4 mb-2 text-black text-xl">有什么使用建议吗？</h2>
    <p>一定要经常来看看是不是有复习任务！把大量的单词复习和学习任务分散在一天当中，会让记忆更加牢固，也会使Acewords的进度分析更加精准！</p>
    <h2 class="mt-4 mb-2 text-black text-xl">什么是Acewords小组？</h2>
    <p>一个人背单词往往很难坚持下去，但与朋友一起就可以互相监督。通过加入Acewords小组，您可以看到小组内所有用户的学习进度，方便大家<span class="line-through"> 内卷 </span>共同进步！</p>
    <h2 class="mt-4 mb-2 text-black text-xl">Acewords为什么非常简洁？</h2>
    <p>背单词本就是枯燥无味的事情，想要提高效率，必然需要集中精神。在设计上，Acewords使用最简单的界面布局，极力避免花里胡哨，让你的注意力无处逃逸。</p>
  </div>
  
  <h2 class="mt-4 mb-2 text-xl">如何安装Acewords应用？</h2>
  <p class="text-xs mb-2 text-gray-500">按照下面的图片指示获得更方便的背单词体验！</p>
  <div style="max-width: 600px;" class="flex flex-col bg-white shadow my-4 p-2 rounded">
    <div class="flex items-center flex-wrap">
      <div class="flex rounded overflow-hidden border font-bold">
        <button on:click={() => { guide = guideDesktop }} class={'transition-all p-2 w-20 ' + (guide === guideDesktop ? 'bg-blue-500 text-white' : 'bg-white text-black')}>桌面</button>
        <button on:click={() => { guide = guideAndroid }} class={'transition-all border-x p-2 w-20 ' + (guide === guideAndroid ? 'bg-blue-500 text-white' : 'bg-white text-black')}>安卓</button>
        <button on:click={() => { guide = guideIOS }} class={'transition-all p-2 w-20 ' + (guide === guideIOS ? 'bg-blue-500 text-white' : 'bg-white text-black')}>iOS</button>
      </div>
      <p class="text-sm text-gray-500 m-2">{guide === guideIOS ? 'Safari浏览器' : 'Google Chrome浏览器'}</p>
    </div>
    <img alt="desktop guide" class="rounded mt-2" src={guide}>
  </div>
</div>