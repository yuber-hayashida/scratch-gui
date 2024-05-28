import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';

let assetHost = process.env.ASSET_HOST;
if (!assetHost || !assetHost.startsWith('http')) {
    assetHost = `${window.location.origin}/scratch_api/assets`;
}
let projectHost = process.env.PROJECT_HOST;
if (!projectHost || !projectHost.startsWith('http')) {
    projectHost = `${window.location.origin}/scratch_api/projects`;
}
// const assetHost = 'http://localhost:3000/assets';
// const projectHost = 'http://localhost:3000/projects';
// eslint-disable-next-line no-console
console.log('assetHost:', assetHost, ', projectHost:', projectHost);

const searchParams = new URLSearchParams(window.location.search);
const isPlayerOnly = searchParams.has('isPlayerOnly') && searchParams.get('isPlayerOnly') === 'true';
const isFullScreen = searchParams.has('isFullScreen') && searchParams.get('isFullScreen') === 'true';
const projectId = searchParams.has('projectId') ? searchParams.get('projectId') : 100;
const canSave = searchParams.has('canSave') ? (searchParams.get('canSave') !== 'false') : true;
const logo = searchParams.has('logo') ? searchParams.get('logo') : null;
const url = searchParams.has('url') ? searchParams.get('url') : 'https://scratch.mit.edu';

const onClickLogo = () => {
    // window.location = url;
    window.open(url, '_blank');
};

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        // HashParserHOC
    )(GUI);

    // TODO a hack for testing the backpack, allow backpack host to be set by url param
    const backpackHostMatches = window.location.href.match(/[?&]backpack_host=([^&]*)&?/);
    const backpackHost = backpackHostMatches ? backpackHostMatches[1] : null;

    const scratchDesktopMatches = window.location.href.match(/[?&]isScratchDesktop=([^&]+)/);
    let simulateScratchDesktop;
    if (scratchDesktopMatches) {
        try {
            // parse 'true' into `true`, 'false' into `false`, etc.
            simulateScratchDesktop = JSON.parse(scratchDesktopMatches[1]);
        } catch {
            // it's not JSON so just use the string
            // note that a typo like "falsy" will be treated as true
            simulateScratchDesktop = scratchDesktopMatches[1];
        }
    }

    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }


    ReactDOM.render(
        <WrappedGui
            isPlayerOnly={isPlayerOnly}
            isFullScreen={isFullScreen}
            canShare={false}
            canEditTitle
            canCreateNew={false}
            backpackVisible
            showComingSoon={false}
            backpackHost={backpackHost}
            canSave={canSave}
            projectId={projectId}
            assetHost={assetHost}
            projectHost={projectHost}
            onClickLogo={onClickLogo}
            logo={logo}
            canChangeTheme
        />,
        appTarget);
};
