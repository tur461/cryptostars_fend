import log from "./logger";
import toast from "./toast";

const l_t = {
    i: m => { log.i(m); toast.i(m); },
    e: m => { log.e(m); toast.e(m); },
    s: m => { log.i(m); toast.s(m); },
    w: m => { log.w(m); toast.w(m); },
}

export default l_t;