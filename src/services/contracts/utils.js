import log from "../logging/logger";
import { toStd } from "../utils";


function getThresholdAmountFromTolerance(amount, tolerance, xactIn, dec) {
    // isExactIn true means subtract (tolerance from output amount) from output amount
    // to get threshold amount
    // isExactIn false means add (tolerance from input amount) to input amount
    // to get threshold amount
    let th = 0;
    amount = amount.toString() / 10**dec;
    log.i('th amount:', amount.toString(), tolerance, xactIn);
    if(xactIn) th = amount - (amount * tolerance/100);
    else th = amount + (amount * tolerance/100)
    return `${toStd(th*10**dec)}`;   
}

function getDeadline(min) {
    min = parseFloat(min);
    return Math.floor((Date.now() + min * 60 * 1000)/1000); 
}

export {
    getDeadline,
    getThresholdAmountFromTolerance,
}