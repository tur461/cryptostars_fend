import { ADDRESS, EVENT, MISC, REGEX, URL } from "./constants/common";
import {BigNumber} from '@ethersproject/bignumber';
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";
import log from "./logging/logger";

// String.prototype.trim = function() {
//   return this.replace(/(^\s*|\s*$)/g, "");
// };

const isNumInput = v => v.match(REGEX.NUMERIC); 

const isInvalidNumeric = v => !isNumInput(v);

const jString = o => JSON.stringify(o);

const jObject = s => JSON.parse(s);

const isStr = s => typeof s === 'string';

const isObj = o => typeof o === 'object';

const isArr = v => v instanceof Array;

const isNum = n => typeof n === 'number';

const isFunc = fn => typeof fn === 'function';

const isNull = v => rEqual(`${v}`, 'null');

const notNull = v => !isNull(v);

// for time being it works only with depth 1
// for depth>1 we need to recursively 
// check keys as well as values
const compare2objs = (a, b) => {
    a = notNull(a) ? Object.keys(a).sort() : a;
    b = notNull(b) ? Object.keys(b).sort() : b;
    return jString(a) === jString(b);
}

const rEqual = (a, b) => {
    if(isObj(a) && isObj(b)) {
        let s1 = '', s2 = '';
        try { s1 = jString(a) } catch(e) { return compare2objs(a, b) }
        try { s2 = jString(b) } catch(e) { return compare2objs(a, b) }
        return s1 === s2;
    }
    return isStr(a) && isStr(b) ?
    a.toLowerCase() === b.toLowerCase() :
    isNum(a) && isNum(b) ? a === b : 
    a === b;
}

const nullFunc = _ => { _.preventDefault(); console.log('null function'); }

const notEqual = (a, b) => !rEqual(a, b);

const isNaNy = n => rEqual(n, NaN) || rEqual(n, 'NaN') || rEqual(`${n}`, 'NaN');

const isDefined = v => notEqual(v, 'null') && notEqual(v, null) && notEqual(v, 'undefined') && notEqual(v, undefined);

const notDefined = v => !isDefined(v);

const notEmpty = v => isStr(v) ? 
        notEqual(v, '') && notEqual(v, '0') : 
        isArr(v) ? v.length :
        isObj(v) ? Object.entries(v).length : 
        !!v;

const notZero = v => notEqual(Number(v), 0) && !isNaNy(Number(v));

const isEmpty = v => !notEmpty(v);

const contains = (txt, v) => txt.toLowerCase().indexOf(v.toLowerCase()) > -1;

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

const evDispatch = (eName, d) => document.dispatchEvent(new CustomEvent(eName, {detail: d}));

const toDec = (v, dec) => {
    if(isBigNumberish(v)) v = v.toString(); 
    return v / 10 ** (isDefined(dec) && notEmpty(dec) ? dec : 18);
}

const toStd = v => Number(v).toLocaleString('fullwide', {useGrouping: !1});

const toFixed = (v, by) => {
	return trimZeroes(Number(v).toFixed(isDefined(by) && notEmpty(by) ? by : 0));
}

const truncForUI = v => {
    v = `${v}`;
    return v.length >= 12 ? `${v.slice(0, 17)}..` : v;
}

const raiseBy = (v, dec) => Number(v) * 10 ** (isDefined(dec) && notEmpty(dec) ? dec : 18);

const stdRaiseBy = (v, dec) => toStd(raiseBy(v, dec));

const toBigNum = v => v instanceof BigNumber ? v : BigNumber.from(v);

const tStampJs = offset => Date.now() + ((isDefined(offset) ? offset : 0) * 1000);

const tStampNix = offset => Math.ceil(Date.now()/1000) + (isDefined(offset) ? offset : 0);

const toDateTimeStr = tStampJs => {
    const d = (new Date(tStampJs)).toString().split(' ');
    return `${d[1]} ${d[2]}, ${d[4]}`;
}

const eHandle = e => e.preventDefault() || !0;

const jsonp = (function(){
    let that = {};
    that.send = function(src, options) {
        return new Promise((r, j) => {
            const callback_name = options.callbackName || 'callback',
                timeout = options.timeout || 10; // sec
            const __getUrl = _ => {
                if(contains(src, '?')) return `${src}&callback=${callback_name}`;
                return `${src}?callback=${callback_name}`;
            }
            const timeout_trigger = window.setTimeout(function(){
                window[callback_name] = nullFunc;
                j('timed out!');
            }, timeout * 1000);

            window[callback_name] = data => {
                window.clearTimeout(timeout_trigger);
                r(data);
            }
            
            const id = btoa(`jsonp-CryptoStars-${options.id}`);
            const el = document.getElementById(id);
            if(notNull(el)) el.remove();

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = !0;
            script.src = __getUrl();
            script.id = id;
            script.addEventListener('error', j);
            document.getElementsByTagName('head')[0].appendChild(script);
        })
    }
    return that;
})();

const keepEyeOnInternetStatus = _ => {
	console.log('Watching internet connectivity!');
	// setInterval(_ => {
	// 		fetch(URL.NET_STATUS)
	// 		.then(response => {
	// 			console.log('status code', response.status);
	// 				if(response.status >= 200 && response.status < 300) 
	// 					evDispatch(EVENT.NET_STATUS, {connected: !0});
	// 				else
	// 					evDispatch(EVENT.NET_STATUS, {connected: !1});
	// 		})
	// 		.catch(er => {
	// 			console.log('fetch error', er);
	// 			evDispatch(EVENT.NET_STATUS, {connected: !1});
	// 		})
	// }, MISC.NET_STATUS_CHECK_DELAY);
};

const _DebouncerStore = {
    ids: [],
    index: -1,
    timeOut: [],
    callback: [],
    arguments: [],
    debounceDelay: [],
}

// input debouncer
const debounce = (cbk, argList, id, delay = MISC.DEBOUNCE_DELAY) => {
    if(notDefined(id) || isEmpty(id)) throw new Error('must pass an id');
    if(!isFunc(cbk)) throw new Error('Expected Function as first param!');
    if(!isArr(argList)) throw new Error('Expected Array as second param!');

    let i = _DebouncerStore.ids.findIndex(_id => rEqual(_id, id));
    
    if(i < 0) {
        i = ++_DebouncerStore.index;
        _DebouncerStore.ids.push(id);
        _DebouncerStore.callback.push(cbk);
        _DebouncerStore.arguments.push(argList);
        _DebouncerStore.debounceDelay.push(delay);
    }
    // stop previous timer if triggered before completion of the same. 
    clearTimeout(_DebouncerStore.timeOut[i]);
    log.i('debounce timer cleared for id: ' + id);
    // set and start new timer 
    _DebouncerStore.timeOut[i] = setTimeout(
        // if no input or trigger until threshold delay, call callback
        _ => {
            log.i('timer up! for id: ' + id + ' and i: ' + i);
            log.i('Debounce Store:', _DebouncerStore);
            _DebouncerStore.callback[i](..._DebouncerStore.arguments[i])
        }, 
        _DebouncerStore.debounceDelay[i]
    );
    
}

// one-level diff
const getTokenListDiff = (a, b) => {
    if(!isArr(a)) a = jObject(a);
    if(!isArr(b)) b = jObject(b);
    return a.filter(n => !b.filter(m => rEqual(m.addr, n.addr)).length);
}

const doPageReload = (delay=0) => delay ? setTimeout(_ => window.location.reload(), delay * 1000) : window.location.reload();

const toStr = v => isStr(v) ? v : isObj(v) ? jString(v) : `${v}`;

export {
    isNum,
    toStd,
    toStr,
    toDec,
    isNaNy,
    rEqual,
    isNull,
    isAddr,
    eHandle,
    isEmpty,
    notZero,
    jObject,
    notNull,
    jString,
    toFixed,
    raiseBy,
    notEqual,
    contains,
    nullFunc,
    tStampJs,
    notEmpty,
    toBigNum,
    debounce,
    tStampNix,
    isDefined,
    notDefined,
    isNumInput,
    truncForUI,
    stdRaiseBy,
    evDispatch,
    doPageReload,
    toDateTimeStr,
    isInvalidNumeric,
    getTokenListDiff,
    keepEyeOnInternetStatus,
}
