import { ADDRESS, MISC } from "./constants/common";
import {BigNumber} from '@ethersproject/bignumber';


const jString = o => JSON.stringify(o);

const jObject = s => JSON.parse(s);

const rEqual = (a, b) => {
    return typeof a == 'string' ? 
    a.toLowerCase() === b.toLowerCase() :
    typeof a == 'number' ? a === b :
    typeof a == 'object' ? jString(a) === jString(b) : !1;
}

const notEqual = (a, b) => !rEqual(a, b);

const isNaN = n => rEqual(n, NaN) || rEqual(n, 'NaN') || rEqual(`${n}`, 'NaN');

const isDefined = v => notEqual(v, null) || notEqual(v, 'undefined') || notEqual(v, undefined);

const notDefined = v => !isDefined(v);

const notEmpty = v => typeof v == 'string' ? 
        notEqual(v, '') && notEqual(v, '0') : 
        v instanceof Array ? v.length :
        typeof v == 'object' ? 
        Object.entries(v).length : 
        !!v;

const isEmpty = v => !notEmpty(v);

const isAddr = addr => (
    isDefined(addr) &&
    notEmpty(addr) && 
    rEqual(addr.length, 42) && 
    rEqual(addr.substring(0,2), '0x') && 
    notEqual(addr, ADDRESS.ZERO)
    ) ? !0 : !1;

const trimZeroes = v => {
    let lastI = v.length - 1, beginI = 0, i = lastI;
    for(; i>=0 && rEqual('0', v[i]); --i);
    lastI = i;
    beginI = v.indexOf('.') - 1;
    return v.substring(beginI, lastI+1);
}

const evDispatch = (t, d) => dispatchEvent(new CustomEvent(t, {detail: d}));

const toDec = (v, dec) => {
    if(v instanceof BigNumber) v = v.toString(); 
    return v / 10 ** (isDefined(dec) && notEmpty(dec) ? dec : 18);
}

const toStd = v => v.toLocaleString('fullwide', {useGrouping: !1});

const toFixed = (v, by) => trimZeroes(Number(v).toFixed(isDefined(by) && notEmpty(by) ? by : 0));

const raiseBy = (v, dec) => Number(v) * 10 ** (isDefined(dec) && notEmpty(dec) ? dec : 18);

const stdRaiseBy = (v, dec) => toStd(raiseBy(v, dec));

const toBigNum = v => v instanceof BigNumber ? v : BigNumber.from(v);

export {
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
    notEmpty,
    toBigNum,
    isDefined,
    notDefined,
    stdRaiseBy,
    evDispatch,
}