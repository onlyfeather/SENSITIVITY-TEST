import { useState, useEffect, useRef } from 'react';
import { generateFortune, generateCoupleFortune, type FortuneResult } from './utils/generator';
import { toPng } from 'html-to-image';
import { QRCodeCanvas } from 'qrcode.react';

function App() {
  // 模式状态：'single' | 'couple'
  const [mode, setMode] = useState<'single' | 'couple'>('single');
  
  const [name, setName] = useState('');
  const [name2, setName2] = useState(''); // 第二个名字
  
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayScore2, setDisplayScore2] = useState(0); // 第二个分数的动画状态

  // 用于截图的 DOM 引用
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 获取当前页面 URL 用于生成二维码
  const shareUrl = window.location.href;

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
  };

  // 截图处理函数
  const handleCapture = async () => {
    if (!captureRef.current) return;
    setIsCapturing(true);

    try {
      // html-to-image 的用法非常简单
      // cacheBust: true 可以防止图片跨域缓存问题
      const dataUrl = await toPng(captureRef.current, { 
        cacheBust: true,
        backgroundColor: '#0f0718', // 强制背景色
        pixelRatio: 2, // 2倍清晰度
      });

      const link = document.createElement('a');
      link.download = `Sensitivity_${result?.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("截图失败:", error);
      alert("生成图片失败，请重试~");
    } finally {
      setIsCapturing(false);
    }
  };

  // 动画逻辑
  useEffect(() => {
    if (!result) return;
    
    // 动画函数封装
    const animate = (target: number, setter: (n: number) => void) => {
      let start = 0;
      const duration = 1000;
      const incrementTime = duration / (target || 1); // 防止除以0
      const timer = setInterval(() => {
        start += 1;
        if (start > target) start = target;
        setter(start);
        if (start === target) clearInterval(timer);
      }, incrementTime);
      return timer;
    };

    const t1 = animate(result.score, setDisplayScore);
    // 让 TS 自己去推断 setInterval 返回什么类型（在浏览器里是 number）
    let t2: ReturnType<typeof setInterval>;
    if (result.type === 'couple' && result.score2 !== undefined) {
      t2 = animate(result.score2, setDisplayScore2);
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
      
      {/* 背景层 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[600px] h-[600px] rounded-full bg-rose-600/30 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] rounded-full bg-purple-800/40 blur-[100px] mix-blend-screen"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-pink-500/20 blur-[80px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-8">
        
        {/* 标题 */}
        <h1 className="font-extrabold mb-8 tracking-tight text-center">
          <span className="block text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-purple-300 pb-2">
            SENSITIVITY TEST
          </span>
          <div className="text-sm md:text-base font-medium text-rose-200/60 mt-1 tracking-widest uppercase">
            神经敏感度 / 怕痒等级检测
          </div>
        </h1>

        {/* 模式切换 Tab */}
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

        {/* 输入区域 */}
        <div className="relative group animate-fade-in">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-80 transition duration-1000"></div>
          
          <div className="relative flex flex-col gap-3 bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            {/* 名字 1 */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-base md:text-lg focus:outline-none placeholder-rose-200/30 font-medium text-white border-b border-white/10"
              placeholder={mode === 'couple' ? "输入名字 A (攻?)..." : "请输入名字..."}
            />
            
            {/* 名字 2 (仅双人模式显示) */}
            {mode === 'couple' && (
              <input
                type="text"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-base md:text-lg focus:outline-none placeholder-rose-200/30 font-medium text-white border-b border-white/10"
                placeholder="输入名字 B (受?)..."
              />
            )}

            <button
              onClick={handlePredict}
              className="w-full mt-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-lg font-bold text-sm md:text-base transition-all text-white shadow-lg shadow-rose-600/30 active:scale-95"
            >
              Start Analysis
            </button>
          </div>
        </div>

        {/* 结果展示区域 (需要被截图的部分) */}
        {result && (
          <div className="animate-fade-in space-y-6">
            
            {/* 这里加上 ref，表示整个卡片区域都会被截图 */}
            <div 
              ref={captureRef} 
              className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden"
            >
              {/* 装饰水印 (截图时才会有用) */}
              <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                 <svg className="w-16 h-16 text-rose-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>

              {/* 单人结果显示 */}
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

              {/* 双人结果显示 */}
              {result.type === 'couple' && (
                <div className="space-y-6">
                  {/* 选手 A */}
                  <div>
                    <div className="flex justify-between text-sm text-rose-200/80 mb-1">
                      <span className="font-bold">{result.name}</span>
                      <span className="font-mono">{displayScore}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getColor(result.score)}`} style={{ width: `${displayScore}%` }} />
                    </div>
                  </div>
                  
                  {/* VS 标志 */}
                  <div className="text-center text-xs font-black text-rose-500/50 tracking-[0.5em]">///// VS /////</div>

                  {/* 选手 B */}
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

              {/* 通用评语 */}
              <p className="mt-8 text-rose-100/90 text-base font-medium leading-relaxed text-justify indent-[2em]">
                {result.comment}
              </p>
              
              {/* [修复后的 Footer]：左边文字，右边二维码 */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end">
                
                {/* 左侧：版权信息 + 邀请文案 */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-rose-200/30 uppercase tracking-widest font-bold">
                    Sensitivity Analysis
                  </div>
                  <div className="text-xs text-rose-200/60 font-medium">
                    扫码测试你的<br/>神经敏感度
                  </div>
                </div>

                {/* 右侧：精致的二维码 */}
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

            {/* 截图按钮 */}
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-rose-200/80 transition-all flex items-center justify-center gap-2 border border-white/5"
            >
              {isCapturing ? '生成中...' : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  保存诊断卡片
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