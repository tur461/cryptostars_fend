function getThresholdAmountFromTolerance(amount, tolerance) {
    console.log('amount:', amount, 'tol:', tolerance);
    amount = parseFloat(amount);
    tolerance = parseFloat(tolerance);
    return `${amount * (tolerance / 100) + amount}`;
}

function getDeadline(min) {
    min = parseFloat(min);
    return Math.floor((Date.now() + min * 60 * 1000)/1000); 
}

export {
    getDeadline,
    getThresholdAmountFromTolerance,
}