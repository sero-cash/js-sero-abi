import { BigNumber, bigNumberify } from './utils/bignumber';

const AddressZero = '0x0000000000000000000000000000000000000000';
const HashZero = '0x0000000000000000000000000000000000000000000000000000000000000000';



const NegativeOne: BigNumber = bigNumberify(-1);
const Zero: BigNumber = bigNumberify(0);
const One: BigNumber = bigNumberify(1);
const Two: BigNumber = bigNumberify(2);
const MaxUint256: BigNumber = bigNumberify('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export {
    AddressZero,
    HashZero,


    NegativeOne,
    Zero,
    One,
    Two,
    MaxUint256
};
