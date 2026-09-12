 id="f3m8qz"
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 15 — APPLICATION BOOTSTRAP
   File: 15-app.js

   RESPONSIBILITY:
   - Start the application
   - Initialize modules in dependency order
   - Handle global application errors
   - Handle application lifecycle
   - Provide final startup status

   THIS FILE DOES NOT:
   - Perform login itself
   - Load bookings itself
   - Render gallery itself
   - Control sidebar itself
   - Modify database records directly

   Each module remains responsible for its own feature.
   ========================================================= */

'use strict';


/* =========================================================
   1. APPLICATION STATE
   ========================================================= */

const RS_APP_STATE = {

    started:
        false,

    starting:
        false,

    ready:
        false,

    failed:
        false,

    startTime:
        null,

    modules:
        {},

    errors:
        []

};


/* =========================================================
   2. MODULE REGISTRY
   ========================================================= */

const RS_APP_MODULES = [

    {
        name:
            'config',

        initializer:
            'initializeConfig'

    },

    {
        name:
            'state',

        initializer:
            'initializeState'

    },

    {
        name:
            'dom',

        initializer:
            'initializeDOM'

    },

    {
        name:
            'auth',

        initializer:
            'initializeAuth'

    },

    {
        name:
            'navigation',

        initializer:
            'initializeNavigation'

    },

    {
        name:
            'sidebar',

        initializer:
            'initializeSidebar'

    },

    {
        name:
            'dashboard',

        initializer:
            'initializeDashboard'

    },

    {
        name:
            'bookings',

        initializer:
            'initializeBookings'

    },

    {
        name:
            'calendar',

        initializer:
            'initializeCalendar'

    },

    {
        name:
            'contracts',

        initializer:
            'initializeContracts'

    },

    {
        name:
            'gallery',

        initializer:
            'initializeGallery'

    },

    {
        name:
            'notifications',

        initializer:
            'initializeNotifications'

    },

    {
        name:
            'settings',

        initializer:
            'initializeSettings'

    }

];


/* =========================================================
   3. GLOBAL ERROR HANDLER
   ========================================================= */

function handleGlobalError(
    event
) {

    const error =
        event?.error ||
        event?.message ||
        event;


    RS_APP_STATE.errors.push({

        type:
            'runtime',

        error,

        time:
            new Date().toISOString()

    });


    debugError(
        'Global application error:',
        error
    );

}


/* =========================================================
   4. UNHANDLED PROMISE HANDLER
   ========================================================= */

function handleUnhandledRejection(
    event
) {

    const reason =
        event?.reason;


    RS_APP_STATE.errors.push({

        type:
            'promise',

        error:
            reason,

        time:
            new Date().toISOString()

    });


    debugError(
        'Unhandled promise rejection:',
        reason
    );

}


/* =========================================================
   5. REGISTER GLOBAL ERROR HANDLERS
   ========================================================= */

function initializeGlobalErrorHandling() {

    window.addEventListener(
        'error',
        handleGlobalError
    );


    window.addEventListener(
        'unhandledrejection',
        handleUnhandledRejection
    );


    debugLog(
        'Global error handling initialized.'
    );

}


/* =========================================================
   6. INITIALIZE ONE MODULE
   ========================================================= */

function initializeAppModule(
    module
) {

    if (!module) {

        return false;

    }


    const initializer =
        window[
            module.initializer
        ];


    if (
        typeof initializer !==
        'function'
    ) {

        debugError(
            `Missing initializer: ${module.initializer}`
        );


        RS_APP_STATE.modules[
            module.name
        ] = {

            initialized:
                false,

            error:
                'Initializer not found.'

        };


        return false;

    }


    try {

        const result =
            initializer();


        const successful =
            result !== false;


        RS_APP_STATE.modules[
            module.name
        ] = {

            initialized:
                successful,

            error:
                successful
                    ? null
                    : 'Initialization returned false.'

        };


        if (!successful) {

            debugError(
                `Module failed to initialize: ${module.name}`
            );

        } else {

            debugLog(
                `Module initialized: ${module.name}`
            );

        }


        return successful;


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        RS_APP_STATE.modules[
            module.name
        ] = {

            initialized:
                false,

            error:
                normalizedError.message

        };


        RS_APP_STATE.errors.push({

            type:
                'module',

            module:
                module.name,

            error:
                normalizedError,

            time:
                new Date().toISOString()

        });


        debugError(
            `Module initialization failed: ${module.name}`,
            normalizedError
        );


        return false;

    }

}


/* =========================================================
   7. INITIALIZE ALL MODULES
   ========================================================= */

function initializeAppModules() {

    let successCount =
        0;


    let failureCount =
        0;


    for (
        const module
        of RS_APP_MODULES
    ) {

        const success =
            initializeAppModule(
                module
            );


        if (success) {

            successCount++;

        } else {

            failureCount++;

        }

    }


    return {

        successCount,

        failureCount,

        total:
            RS_APP_MODULES.length

    };

}


/* =========================================================
   8. APPLICATION STATUS
   ========================================================= */

function getApplicationStatus() {

    return {

        started:
            RS_APP_STATE.started,

        starting:
            RS_APP_STATE.starting,

        ready:
            RS_APP_STATE.ready,

        failed:
            RS_APP_STATE.failed,

        startTime:
            RS_APP_STATE.startTime,

        modules:
            {
                ...RS_APP_STATE.modules
            },

        errors:
            [...RS_APP_STATE.errors]

    };

}


/* =========================================================
   9. APPLICATION READY EVENT
   ========================================================= */

function dispatchApplicationReady() {

    notifyStateChange(
        'application',
        {

            event:
                'app-ready',

            status:
                getApplicationStatus()

        }
    );


    window.dispatchEvent(
        new CustomEvent(
            'rs:app-ready',
            {

                detail:
                    getApplicationStatus()

            }
        )
    );

}


/* =========================================================
   10. APPLICATION FAILED EVENT
   ========================================================= */

function dispatchApplicationFailure(
    error
) {

    notifyStateChange(
        'application',
        {

            event:
                'app-failed',

            error

        }
    );


    window.dispatchEvent(
        new CustomEvent(
            'rs:app-failed',
            {

                detail: {

                    error,

                    status:
                        getApplicationStatus()

                }

            }
        )
    );

}


/* =========================================================
   11. START APPLICATION
   ========================================================= */

function startRSPhotographyApp() {

    if (
        RS_APP_STATE.starting
    ) {

        debugLog(
            'Application startup already running.'
        );


        return false;

    }


    if (
        RS_APP_STATE.ready
    ) {

        debugLog(
            'Application already started.'
        );


        return true;

    }


    RS_APP_STATE.starting =
        true;

    RS_APP_STATE.started =
        false;

    RS_APP_STATE.failed =
        false;

    RS_APP_STATE.startTime =
        new Date().toISOString();


    debugLog(
        'Starting RS Photography Owner Dashboard...'
    );


    try {

        initializeGlobalErrorHandling();


        const result =
            initializeAppModules();


        if (
            result.failureCount > 0
        ) {

            RS_APP_STATE.failed =
                true;


            RS_APP_STATE.starting =
                false;


            const error = {

                message:
                    'One or more application modules failed to initialize.',

                details:
                    result

            };


            dispatchApplicationFailure(
                error
            );


            debugError(
                'Application startup completed with errors.',
                result
            );


            return false;

        }


        RS_APP_STATE.started =
            true;

        RS_APP_STATE.ready =
            true;

        RS_APP_STATE.starting =
            false;


        debugLog(
            'RS Photography Owner Dashboard is ready.'
        );


        dispatchApplicationReady();


        return true;


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        RS_APP_STATE.started =
            false;

        RS_APP_STATE.ready =
            false;

        RS_APP_STATE.failed =
            true;

        RS_APP_STATE.starting =
            false;


        RS_APP_STATE.errors.push({

            type:
                'startup',

            error:
                normalizedError,

            time:
                new Date().toISOString()

        });


        debugError(
            'Application startup failed:',
            normalizedError
        );


        dispatchApplicationFailure(
            normalizedError
        );


        return false;

    }

}


/* =========================================================
   12. DESTROY APPLICATION
   ========================================================= */

function destroyRSPhotographyApp() {

    debugLog(
        'Destroying RS Photography Owner Dashboard...'
    );


    const destroyFunctions = [

        'destroySettings',

        'destroyNotifications',

        'destroyGallery',

        'destroyContracts',

        'destroyCalendar',

        'destroyBookings',

        'destroyDashboard',

        'destroySidebar',

        'destroyNavigation',

        'destroyAuth',

        'destroyDOM',

        'destroyState'

    ];


    destroyFunctions.forEach(
        (functionName) => {

            const destroyFunction =
                window[
                    functionName
                ];


            if (
                typeof destroyFunction !==
                'function'
            ) {

                return;

            }


            try {

                destroyFunction();

            } catch (error) {

                debugError(
                    `Cleanup failed: ${functionName}`,
                    error
                );

            }

        }
    );


    RS_APP_STATE.started =
        false;

    RS_APP_STATE.starting =
        false;

    RS_APP_STATE.ready =
        false;

    RS_APP_STATE.failed =
        false;

    RS_APP_STATE.modules =
        {};

    RS_APP_STATE.errors =
        [];


    debugLog(
        'Application destroyed.'
    );

}


/* =========================================================
   13. RESTART APPLICATION
   ========================================================= */

function restartRSPhotographyApp() {

    destroyRSPhotographyApp();


    return startRSPhotographyApp();

}


/* =========================================================
   14. PAGE VISIBILITY HANDLER
   ========================================================= */

function handleApplicationVisibility() {

    if (
        document.visibilityState ===
        'visible'
    ) {

        debugLog(
            'Application returned to foreground.'
        );

        return;

    }


    debugLog(
        'Application moved to background.'
    );

}


/* =========================================================
   15. BROWSER ONLINE/OFFLINE HANDLER
   ========================================================= */

function handleApplicationConnectivity() {

    const online =
        navigator.onLine;


    notifyStateChange(
        'application',
        {

            event:
                online
                    ? 'online'
                    : 'offline',

            online

        }
    );


    debugLog(
        online
            ? 'Network connection restored.'
            : 'Network connection unavailable.'
    );

}


/* =========================================================
   16. INITIALIZE LIFECYCLE EVENTS
   ========================================================= */

function initializeApplicationLifecycle() {

    document.addEventListener(
        'visibilitychange',
        handleApplicationVisibility
    );


    window.addEventListener(
        'online',
        handleApplicationConnectivity
    );


    window.addEventListener(
        'offline',
        handleApplicationConnectivity
    );


    debugLog(
        'Application lifecycle initialized.'
    );

}


/* =========================================================
   17. DOM READY
   ========================================================= */

function handleDOMReady() {

    initializeApplicationLifecycle();

    startRSPhotographyApp();

}


/* =========================================================
   18. START WHEN DOM IS READY
   ========================================================= */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        handleDOMReady,
        {
            once: true
        }
    );

} else {

    handleDOMReady();

}


/* =========================================================
   END OF 15-APP.JS
   ========================================================= */
