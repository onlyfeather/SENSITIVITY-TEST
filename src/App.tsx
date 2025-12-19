import { useState, useEffect, useRef } from 'react';
import { generateFortune, generateCoupleFortune, type FortuneResult } from './utils/generator';
import { toPng } from 'html-to-image';
import { QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';

function App() {
  // --- 状态定义 ---
  const [mode, setMode] = useState<'single' | 'couple'>('single');
  const [name, setName] = useState('');
  const [name2, setName2] = useState('');
  
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayScore2, setDisplayScore2] = useState(0);

  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // 用于存储在 QQ/微信 环境下生成的图片
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // 分享链接 (建议替换为你绑定的域名)
  const shareUrl = "http://how-ticklish-are-you.xyz";

  // --- 辅助函数：检测是否为 QQ 或 微信 浏览器 ---
  const isWeChatOrQQ = () => {
    const ua = navigator.userAgent.toLowerCase();
    // micromessenger 是微信，qq/ 是QQ内置浏览器 (注意区分 MQQBrowser)
    return ua.includes('micromessenger') || ua.includes('qq/');
  };

  // --- 初始化逻辑：设置标题与图标 ---
  useEffect(() => {
    // 1. 设置图标
    const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
    link.type = 'image/svg+xml';
    link.rel = 'shortcut icon';
    link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔮</text></svg>`;
    document.getElementsByTagName('head')[0].appendChild(link);

    // 2. 设置默认标题
    if (!result) document.title = "默契度大挑战 | 怕痒等级检测";
  }, [result]);

  // --- 核心逻辑：分析/预测 ---
  const handlePredict = () => {
    if (!name.trim()) return;
    if (mode === 'couple' && !name2.trim()) return;

    let data;
    if (mode === 'couple') {
      data = generateCoupleFortune(name, name2);
    } else {
      data = generateFortune(name);
    }
    
    setResult(data);
    setDisplayScore(0);
    setDisplayScore2(0);
    document.title = `测试报告：${name} 的敏感度检测结果`;
  };

  // --- 核心逻辑：截图处理 (含延时与环境判断) ---
  const handleCapture = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);

    try {
      // 1. [新增] 强制延时 100ms，等待 DOM/动画 稳定
      await new Promise(resolve => setTimeout(resolve, 100));

      // 2. 生成图片
      const dataUrl = await toPng(captureRef.current, { 
        cacheBust: true,
        backgroundColor: '#0f0718', // 强制背景色，防止透明变黑
        pixelRatio: 2, // 高清
      });

      // 3. [核心修改] 根据环境决定行为
      if (isWeChatOrQQ()) {
        // 情况 A: QQ/微信 -> 存入状态，弹窗展示
        setGeneratedImage(dataUrl);
      } else {
        // 情况 B: 普通浏览器 -> 创建链接直接下载
        const link = document.createElement('a');
        link.download = `Sensitivity_${result?.name || 'Test'}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error("截图失败:", error);
      alert("生成图片失败，请重试~");
    } finally {
      setIsCapturing(false);
    }
  };

  // --- 动画逻辑 ---
  useEffect(() => {
    if (!result) return;
    let effectTriggered = false;

    const animate = (target: number, setter: (n: number) => void) => {
      let start = 0;
      const duration = 1500; 
      const incrementTime = duration / (target || 1); 

      const timer = setInterval(() => {
        start += 1;
        if (start > target) start = target;
        setter(start);

        // 80分以上触发粒子特效
        if (start === 80 && target >= 80 && !effectTriggered) {
          effectTriggered = true;
          confetti({
            origin: { y: 0.7 }, 
            zIndex: 9999,
            particleCount: 100,
            spread: 70,
            startVelocity: 40,
            colors: ['#be123c', '#fb7185', '#c084fc'], 
            shapes: ['circle', 'square'],
            decay: 0.9,
            scalar: 1.2
          });
        }
        if (start === target) clearInterval(timer);
      }, incrementTime);
      return timer;
    };

    const t1 = animate(result.score, setDisplayScore);
    let t2: ReturnType<typeof setInterval>;
    if (result.type === 'couple' && result.score2 !== undefined) {
      setTimeout(() => {
        t2 = animate(result.score2 || 0, setDisplayScore2);
      }, 300);
    }

    return () => {
      clearInterval(t1);
      if (t2) clearInterval(t2);
    };
  }, [result]);

  const getColor = (score: number) => {
    if (score >= 80) return "from-pink-500 to-rose-600 shadow-rose-500/50";
    if (score >= 50) return "from-purple-400 to-pink-500 shadow-pink-500/50";
    return "from-slate-400 to-slate-500 shadow-slate-500/50";
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-[15vh] md:justify-center md:pt-0 p-4 md:p-6 overflow-hidden bg-[#0f0718] text-slate-100 font-sans selection:bg-rose-500/30">
      
      {/* --- 图片结果展示弹窗 (仅在 QQ/微信 且 生成了图片时显示) --- */}
      {generatedImage && (
        <div 
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setGeneratedImage(null)} // 点击空白关闭
        >
          <div className="relative max-w-sm w-full animate-scale-in flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6 space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">诊断卡片已生成 ✨</h3>
              <p className="text-rose-400 text-base font-bold animate-pulse px-4 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 inline-block">
                请长按图片 ➝ 保存到手机
              </p>
            </div>

            <img 
              src={generatedImage} 
              alt="Result Card" 
              className="w-full rounded-2xl border-[3px] border-slate-700 shadow-2xl shadow-rose-500/30"
            />

            <button 
              onClick={() => setGeneratedImage(null)}
              className="mt-8 w-full py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl border border-white/10 transition-all"
            >
              关闭窗口
            </button>
          </div>
        </div>
      )}

      {/* 背景层 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[600px] h-[600px] rounded-full bg-rose-600/30 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] rounded-full bg-purple-800/40 blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-8">
        <h1 className="font-extrabold mb-8 tracking-tight text-center">
          <span className="block text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-purple-300 pb-2">
            怕痒等级检测
          </span>
          <div className="text-sm md:text-base font-medium text-rose-200/60 mt-1 tracking-widest uppercase">
            Sensitivity Test
          </div>
        </h1>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-900/50 p-1 rounded-lg flex border border-white/10 backdrop-blur-sm">
            <button 
              onClick={() => { setMode('single'); setResult(null); }}
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'single' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              单人检测
            </button>
            <button 
              onClick={() => { setMode('couple'); setResult(null); }}
              className={`px-6 py-1.5 rounded-md text-sm font-bold transition-all ${mode === 'couple' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              CP / 双人
            </button>
          </div>
        </div>

        <div className="relative group animate-fade-in">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-80 transition duration-1000"></div>
          
          <div className="relative flex flex-col gap-3 bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-base md:text-lg focus:outline-none placeholder-rose-200/30 font-medium text-white border-b border-white/10"
              placeholder={mode === 'couple' ? "输入你的名字..." : "请输入名字..."}
            />
            {mode === 'couple' && (
              <input
                type="text"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-base md:text-lg focus:outline-none placeholder-rose-200/30 font-medium text-white border-b border-white/10"
                placeholder="输入对方的名字..."
              />
            )}
            <button
              onClick={handlePredict}
              className="w-full mt-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-lg font-bold text-sm md:text-base transition-all text-white shadow-lg shadow-rose-600/30 active:scale-95"
            >
              开始分析
            </button>
          </div>
        </div>

        {result && (
          <div className="animate-fade-in space-y-6">
            <div 
              ref={captureRef} 
              className={`bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 border ${
                displayScore >= 80 
                  ? 'animate-shiver border-rose-500/50 shadow-[0_0_50px_rgba(225,29,72,0.3)]' 
                  : 'border-white/10'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                 <svg className="w-16 h-16 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>

              {result.type === 'single' && (
                <div className="text-center">
                  <div className="text-lg text-rose-200/80 mb-2 font-bold">{result.name}</div>
                  <div className={`text-7xl font-black font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,100,150,0.5)] ${displayScore >= 80 ? 'text-rose-300' : 'text-slate-100'}`}>
                    {displayScore}<span className="text-2xl ml-1">%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${getColor(result.score)}`} style={{ width: `${displayScore}%` }} />
                  </div>
                </div>
              )}

              {result.type === 'couple' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-rose-200/80 mb-1">
                      <span className="font-bold">{result.name}</span>
                      <span className="font-mono">{displayScore}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getColor(result.score)}`} style={{ width: `${displayScore}%` }} />
                    </div>
                  </div>
                  <div className="text-center text-xs font-black text-rose-500/50 tracking-[0.5em]">///// VS /////</div>
                  <div>
                    <div className="flex justify-between text-sm text-rose-200/80 mb-1">
                      <span className="font-bold">{result.name2}</span>
                      <span className="font-mono">{displayScore2}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getColor(result.score2 || 0)}`} style={{ width: `${displayScore2}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-8 text-rose-100/90 text-base font-medium leading-relaxed text-justify indent-[2em]">
                {result.comment}
              </p>
              
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-rose-200/30 uppercase tracking-widest font-bold">
                    Sensitivity Analysis
                  </div>
                  <div className="text-xs text-rose-200/60 font-medium">
                    扫码测试你的<br/>神经敏感度
                  </div>
                </div>

                <div className="p-1.5 bg-rose-50 rounded-lg shadow-lg shadow-rose-500/20">
                  <QRCodeCanvas
                    value={shareUrl} 
                    size={48} 
                    level="M" 
                    fgColor="#be123c" 
                    bgColor="#fff1f2"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-rose-200/80 transition-all flex items-center justify-center gap-2 border border-white/5"
            >
              {isCapturing ? '生成中...' : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  生成结果图片
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;