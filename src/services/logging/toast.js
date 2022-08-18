import {Toast as tt} from '../../Components/Common/Toast/Toast';

const toast = {
    s: (m, op={}) => {
        tt.success(m, op)
    },
    e: (m, op={}) => {
        tt.error(m, op)
    },
    i: (m, op={}) => {
        tt.info(m, op)
    },
    w: (m, op={}) => {
        tt.warn(m, op)
    },
    l: (m, op={}) => {
        tt.loading(m, op)
    },
}

export default toast;