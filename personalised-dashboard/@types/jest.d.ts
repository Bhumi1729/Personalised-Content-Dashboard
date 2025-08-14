import '@testing-library/jest-dom';

// Ensure Jest types are properly extended
declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeNull(): R;
      toBeUndefined(): R;
      toBeDefined(): R;
      toBeInstanceOf(expected: any): R;
      toContain(expected: any): R;
      toHaveLength(expected: number): R;
      toHaveProperty(keyPath: string, value?: any): R;
      toMatch(expected: string | RegExp): R;
      toMatchObject(expected: object): R;
      toThrow(expected?: string | RegExp | jest.Constructable | Error): R;
      toThrowError(expected?: string | RegExp | jest.Constructable | Error): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toBeCloseTo(expected: number, precision?: number): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveBeenCalledWith(...params: any[]): R;
      toHaveBeenLastCalledWith(...params: any[]): R;
      toHaveBeenNthCalledWith(nthCall: number, ...params: any[]): R;
      toHaveReturnedWith(expected: any): R;
      toHaveLastReturnedWith(expected: any): R;
      toHaveNthReturnedWith(nthCall: number, expected: any): R;
    }

    interface Expect {
      <T = any>(actual: T): jest.Matchers<void>;
      any(expectedObject: any): any;
      anything(): any;
      arrayContaining(sample: any[]): any;
      objectContaining(sample: object): any;
      stringContaining(expected: string): any;
      stringMatching(expected: string | RegExp): any;
      addSnapshotSerializer(serializer: any): void;
      assertions(numberOfAssertions: number): void;
      hasAssertions(): void;
      extend(matchers: { [name: string]: any }): void;
    }
  }
}

export {};
