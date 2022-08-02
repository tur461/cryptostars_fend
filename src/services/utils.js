import { ADDRESS, MISC } from "./constants/common";
import {BigNumber} from '@ethersproject/bignumber';

function spow(s, e) {
    s = s[0] === '.' ? '0' + s : s;
    let i = s.indexOf('.');
    i = i > 0 ? i : s.length;
    let int = s.slice(0, i);
    let dec = s.slice(i+1);
    let l = dec.length;
    i = {
        int: int,
        dec: dec,
        pow: e - l,
    };

    return `${i.int}${i.dec}${'0'.repeat(i.pow)}`;
}

function toGib(s, dec) {
    let d = s.length - dec,
        i = d<=0 ? 0 : d,
        l = s.slice(0, i),
        r = s.slice(i);
    if(!i) {
        r = '0'.repeat(d*-1) + r;
        l = '0';
    }
    return `${parseFloat(`${l}.${r}`)}`;
}


function bigDiv(N, D) {
    let x = BigNumber.from(Math.pow(10, MISC.DIV_DEC_PLACES));
    return `${toGib(N.mul(x).div(D).toBigInt().toString(), MISC.DIV_DEC_PLACES)}`;
}

function isValidAddr(address) {
    if(
        address &&
        address.length && 
        address.length == 42 && 
        address.substring(0,2) === '0x' && 
        address !== ADDRESS.ZERO
    ) return true;
    return false;
}

function evDispatch(t, d) {
    dispatchEvent(new CustomEvent(t, {detail: d}));
}

function toStd(v) {
    return v.toLocaleString('fullwide', {useGrouping: !1});
}

export {
    spow,
    toStd,
    toGib,
    bigDiv,
    isValidAddr,
    evDispatch,
}