const SET_PROJECT_CAN_DELETE = 'projectCanDelete/SET_PROJECT_CAN_DELETE';

const initialState = true;

const reducer = function (state, action) {
    if (typeof state === 'undefined') {
        state = initialState;
    }
    switch (action.type) {
    case SET_PROJECT_CAN_DELETE:
        return action.can_delete_;
    default:
        return state;
    }
};
const setProjectCanDelete = can_delete_ => ({
    type: SET_PROJECT_CAN_DELETE,
    can_delete_: can_delete_
});

export {
    reducer as default,
    initialState as projectCanDeleteInitialState,
    setProjectCanDelete
};
