import {Toast as tt} from '../../Components/Common/Toast/Toast';

const toast = {
    s: m => {
        tt.success(m)
    },
    e: m => {
        tt.error(m)
    },
    i: m => {
        tt.info(m)
    },
}

export default toast;