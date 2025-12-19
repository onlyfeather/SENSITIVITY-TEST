import { DeterministicRandom } from './random';

export interface FortuneResult {
  type: 'single' | 'couple';
  name: string;
  name2?: string;
  score: number; 
  score2?: number;
  comment: string;
}

// 😈 上帝名单：在这里定义名字和对应的分数
// Key: 名字 (建议全小写，方便匹配)
// Value: 0-100 的强制分数
const CHEAT_MAP: Record<string, number> = {
  "root": 100,      // 给自己满分
  "admin": 99,
  "gemini": 0,      // 比如你想黑一下我
  "老板": 1,        // 整蛊对象
  "测试": 88,
};

// 辅助函数：获取分数（优先查表，查不到再算哈希）
function getScore(name: string): number {
  const normalized = name.trim().toLowerCase(); // 忽略大小写
  
  // 1. 先看作弊名单里有没有
  if (normalized in CHEAT_MAP) {
    return CHEAT_MAP[normalized];
  }

  // 2. 没有的话，走正常的哈希算法
  const rng = new DeterministicRandom(name);
  return rng.nextInt(1, 100);
}

// 辅助函数：根据分数生成评语 (复用逻辑)
function getComment(score: number): string {
  if (score >= 80) return "你的神经末梢仿佛毫无遮蔽地暴露在空气中。哪怕只是羽毛拂过空气产生的微风，都能在你脊椎上激起一阵剧烈的电流。这种极致的敏感让你在任何触碰面前都毫无招架之力。";
  if (score >= 60) return "你的防御机制在指尖触碰的瞬间就会土崩瓦解。那种细密的酥麻感会迅速沿着神经网络扩散到四肢百骸，让理智瞬间蒸发。对于你来说，忍耐是一种奢望。";
  if (score >= 30) return "平日里你看似镇定自若，建立了一道尚可的防线。然而这道防线并非坚不可摧，一旦遭遇突袭，那种电流感依然会瞬间击穿你的意志力，暴露你内心深处柔软的一面。";
  if (score >= 10) return "你的神经系统似乎加装了一层厚厚的绝缘层。对于常人来说难以忍受的刺激，在你看来更像是一种略带力度的按压。你能够冷静地注视着对方的动作，让捉弄你的人感到挫败。";
  if (score >= 5) return "痛觉和触觉信号在传递过程中似乎发生了严重的衰减。外界的刺激很难在你平静的内心激起波澜，你就像处于一种半休眠状态，像是一座无法被撼动的孤岛。";
  return "绝对的免疫体质。无论是轻柔的试探还是剧烈的进攻，都会像泥牛入海般消失得无影无踪。你的身体仿佛由大理石雕刻而成，没有任何缝隙能让那种名为“痒”的感觉入侵。";
}

// 单人逻辑
export function generateFortune(name: string): FortuneResult {
  // 使用新的 getScore 函数
  const score = getScore(name);
  const comment = getComment(score);

  return { type: 'single', name, score, comment };
}


// 双人逻辑
export function generateCoupleFortune(name1: string, name2: string): FortuneResult {
  const score1 = getScore(name1);
  const score2 = getScore(name2);

  let comment = "";
  const diff = Math.abs(score1 - score2);

  // 1. 猎人与猎物 (分差 > 30)
  if (diff > 30) {
    const higher = score1 > score2 ? name1 : name2;
    const lower = score1 > score2 ? name2 : name1;
    comment = `这是深海与涟漪的宿命。${lower} 就像深不见底的静水，而 ${higher} 是水面上惊慌失措的波纹。面对 ${lower} 那种近乎残酷的从容，${higher} 所有的防御都显得苍白无力。这是一场无声的沦陷，${higher} 的每一次颤栗与喘息，都被 ${lower} 稳稳地圈禁在掌心之中，无处可逃。`;
  }
  // 2. 双高敏 (都 > 60)
  else if (score1 > 60 && score2 > 60) {
    comment = `当 ${name1} 的指尖触碰到 ${name2} 的瞬间，空气中立刻弥漫起危险的甜味。你们就像两颗处于临界点的恒星，任何轻微的互动都会在 ${name1} 与 ${name2} 之间引发感官的海啸。在这场共振中，没有赢家，只有两个人共同坠入那片名为“过载”的粉色迷雾，直到力气耗尽。`;
  }
  // 3. 双低敏 (都 < 30)
  else if (score1 < 30 && score2 < 30) {
    comment = `${name1} 和 ${name2} 仿佛两块被时光封存的琥珀。外界的电流与刺激被厚厚的屏障隔绝在外，${name1} 的抚摸对于 ${name2} 来说，更像是一种确认存在的仪式。在这片迟钝的温柔里，时间流速变慢了，比起激烈的博弈，你们更沉溺于这种互为孤岛的永恒安稳。`;
  }
  // 4. 势均力敌 (其他情况)
  else {
    comment = `这是一场属于 ${name1} 与 ${name2} 的指尖探戈。你们深知彼此的防线与弱点，${name1} 的每一次试探都在失控边缘徘徊，而 ${name2} 总能巧妙地化解并反击。呼吸的频率在交锋中逐渐同步，重要的不再是胜负，而是你们之间那种即将被捕获、却又侥幸逃脱的暧昧张力。`;
  }

  return { type: 'couple', name: name1, name2: name2, score: score1, score2: score2, comment };
}