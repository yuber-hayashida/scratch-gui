const SET_PROJECT_CAN_UPLOAD = 'projectCanUpload/SET_PROJECT_CAN_UPLOAD';

const initialState = false;

const reducer = function (state, action) {
    if (typeof state === 'undefined') {
        state = initialState;
    }
    switch (action.type) {
    case SET_PROJECT_CAN_UPLOAD:
        return action.can_upload_;
    default:
        return state;
    }
};
const setProjectCanUpload = can_upload_ => ({
    type: SET_PROJECT_CAN_UPLOAD,
    can_upload_: can_upload_
});

export {
    reducer as default,
    initialState as projectCanUploadInitialState,
    setProjectCanUpload
};
