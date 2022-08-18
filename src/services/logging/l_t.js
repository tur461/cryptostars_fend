import log from "./logger";
import toast from "./toast";

const l_t = {
    i: (m, p={}) => { log.i(m); toast.i(m, p); },
    e: (m, p={}) => { log.e(m); toast.e(m, p); },
    s: (m, p={}) => { log.i(m); toast.s(m, p); },
    w: (m, p={}) => { log.w(m); toast.w(m, p); },
}

export default l_t;