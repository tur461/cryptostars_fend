import { ADDRESS, MISC } from "./constants/common";
import {BigNumber} from '@ethersproject/bignumber';
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";


const isNumInput = v => /^[0-9]*[.,]?[0-9]*$/gmi.test(v);

const notNumInput = v => !isNumInput(v);

const jString = o => JSON.stringify(o);

const jObject = s => JSON.parse(s);

const isStr = s => typeof s === 'string';

const isObj = o => typeof o === 'object';

const isArr = v => v instanceof Array;

const isNum = n => typeof n === 'number';

const rEqual = (a, b) => {
    return isStr(a) && isStr(b) ? 
    a.toLowerCase() === b.toLowerCase() :
    isNum(a) && isNum(b) ? a === b :
    isObj(a) && isObj(b) ? jString(a) === jString(b) : 
    a === b;
}

const nullFunc = _ => { _.preventDefault(); console.log('null function'); }

const notEqual = (a, b) => !rEqual(a, b);

const isNaN = n => rEqual(n, NaN) || rEqual(n, 'NaN') || rEqual(`${n}`, 'NaN');

const isDefined = v => notEqual(v, null) || notEqual(v, 'undefined') || notEqual(v, undefined);

const notDefined = v => !isDefined(v);

const notEmpty = v => typeof v == 'string' ? 
        notEqual(v, '') && notEqual(v, '0') : 
        isArr(v) ? v.length :
        isObj(v) ? Object.entries(v).length : 
        !!v;

const isEmpty = v => !notEmpty(v);

const isAddr = addr => (
    isDefined(addr) &&
    notEmpty(addr) && 
    rEqual(addr.length, 42) && 
    rEqual(addr.substring(0,2), '0x') && 
    notEqual(addr, ADDRESS.ZERO)
    ) ? !0 : !1;

/*
    for 0000001234.5678000000
    right: 0000001234.
    left: .5678000000

*/

const rTrimZeroes = v => {
    let i = 0;
    for(; i < v.length  && notEqual('.', v[i]) && rEqual('0', v[i]); ++i);
    i -= rEqual('.', v[i]) ? 1 : 0;
    return v.substring(i);
}

const lTrimZeroes = v => {
    let i = v.length - 1;
    for(; i>=0 && notEqual('.', v[i]) && rEqual('0', v[i]); --i);
    i += rEqual('.', v[i]) ? 1 : 0;
    return v.substring(0, i+1);
}

const trimZeroes = v => rTrimZeroes(lTrimZeroes(v));

const evDispatch = (eName, d) => dispatchEvent(new CustomEvent(eName, {detail: d}));

const toDec = (v, dec) => {
    if(isBigNumberish(v)) v = v.toString(); 
    return v / 10 ** (isDefined(dec) && notEmpty(dec) ? dec : 18);
}

const toStd = v => v.toLocaleString('fullwide', {useGrouping: !1});

const toFixed = (v, by) => trimZeroes(Number(v).toFixed(isDefined(by) && notEmpty(by) ? by : 0));

const raiseBy = (v, dec) => Number(v) * 10 ** (isDefined(dec) && notEmpty(dec) ? dec : 18);

const stdRaiseBy = (v, dec) => toStd(raiseBy(v, dec));

const toBigNum = v => isBigNumberish(v) ? v : BigNumber.from(v);


export {
    isNum,
    isNaN,
    toStd,
    toDec,
    rEqual,
    isAddr,
    isEmpty,
    jObject,
    jString,
    toFixed,
    raiseBy,
    nullFunc,
    notEmpty,
    toBigNum,
    isDefined,
    notDefined,
    isNumInput,
    stdRaiseBy,
    evDispatch,
    notNumInput,
}
