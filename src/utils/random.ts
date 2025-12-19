// src/utils/random.ts

/**
 * cyrb128 哈希算法
 * 作用：将任意字符串转换为 4 个 32 位整数（种子）
 * 特点：雪崩效应好，名字改一个字，结果天翻地覆
 */
export function stringToSeed(str: string): number {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  
  // 我们只需要返回其中一个作为主种子即可
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

/**
 * Mulberry32 伪随机数生成器
 * 作用：输入一个种子，返回一个能生成 0-1 之间小数的函数
 */
export function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * 封装一个方便的工具类
 * 不需要每次都手动调用 cyrb128 和 mulberry32
 */
export class DeterministicRandom {
  private rng: () => number;

  constructor(seedPhrase: string) {
    const seed = stringToSeed(seedPhrase);
    this.rng = mulberry32(seed);
  }

  // 获取 0 到 1 之间的小数
  next(): number {
    return this.rng();
  }

  // 获取 min 到 max 之间的整数
  nextInt(min: number, max: number): number {
    return Math.floor(this.rng() * (max - min + 1)) + min;
  }

  // 从数组中随机选取一个元素
  pick<T>(array: T[]): T {
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }
}