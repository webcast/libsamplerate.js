export type Data = Int16Array | Float32Array

export declare enum Converter {
  BEST_QUALITY = 0,
  MEDIUM_QUALITY = 1,
  FASTEST = 2,
  ZERO_ORDER_HOLD = 3,
  LINEAR = 4
}

export declare class Samplerate {
  static initialized: Promise<void>
  static isValidRatio(ratio: number): boolean
  constructor(type: Converter)
  close(): void
  reset(): void
  process<T extends Data>(arg: {
    data: T;
    ratio: number;
    last?: boolean
  }): {
    data: T,
    used: number
  }
}
