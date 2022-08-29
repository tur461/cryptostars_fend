const logTime = (d = (new Date()).toString().split(' ')) => `${d[2]}-${d[3]} ${d[4]}`;

const log = {
    i: function() {console.log(`[info @ ${logTime()}]`, ...arguments)},
    t: function() {console.trace(...arguments)},
    e: function() {console.error(`[error @ ${logTime()}]`, ...arguments)},
    w: function() {console.warn(`[warn @ ${logTime()}]`, ...arguments)},
    s: function(m) {console.log(...(typeof m == 'string' ? [`%c${m}`, 'color:lime'] : [m]))},
}

export default log;