import { BigNumber } from './bignumber';
import { BigNumberish } from './bignumber';
export declare function commify(value: string | number): string;
export declare function formatUnits(value: BigNumberish, unitType?: string | number): string;
export declare function parseUnits(value: string, unitType?: string | number): BigNumber;
