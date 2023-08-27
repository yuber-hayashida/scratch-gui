const SET_PROJECT_PROTECTED = 'projectProtected/SET_PROJECT_PROTECTED';

const initialState = false;

const reducer = function (state, action) {
    if (typeof state === 'undefined') {
        state = initialState;
    }
    switch (action.type) {
    case SET_PROJECT_PROTECTED:
        return action.protected_;
    default:
        return state;
    }
};
const setProjectProtected = protected_ => ({
    type: SET_PROJECT_PROTECTED,
    protected_: protected_
});

export {
    reducer as default,
    initialState as projectProtectedInitialState,
    setProjectProtected
};
