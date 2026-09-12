
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   CORE CONNECTION FILE
   File: core/connections.js

   PURPOSE:
   - Central application connection configuration
   - Supabase client reference
   - Application environment information
   - Connection status
   - Dependency verification
   - Global application constants

   IMPORTANT:
   - No feature logic belongs here.
   - No booking logic.
   - No gallery logic.
   - No authentication logic.
   - No UI rendering.
   ========================================================= */

'use strict';


/* =========================================================
   1. APPLICATION CONNECTION CONFIG
   ========================================================= */

const RS_CONNECTIONS = Object.freeze({

    application: {

        name:
            'RS Photography Owner Dashboard',

        version:
            '1.0.0',

        environment:
            'production',

        platform:
            'web'

    },


    backend: {

        provider:
            'supabase',

        connected:
            false

    },


    storage: {

        provider:
            'supabase-storage',

        connected:
            false

    }

});


/* =========================================================
   2. CONNECTION STATE
   ========================================================= */

const RS_CONNECTION_STATE = {

    supabase:
        false,

    authentication:
        false,

    database:
        false,

    storage:
        false,

    ready:
        false

};


/* =========================================================
   3. CHECK SUPABASE CLIENT
   ========================================================= */

function checkSupabaseConnection() {

    /*
     * The Supabase client is expected to be created
     * by the authentication/configuration layer.
     *
     * We only verify that the global client exists.
     */

    if (
        typeof window.supabase === 'undefined'
    ) {

        RS_CONNECTION_STATE.supabase =
            false;

        debugLog(
            'Supabase client is not available.'
        );


        return false;

    }


    RS_CONNECTION_STATE.supabase =
        true;


    RS_CONNECTIONS.backend.connected =
        true;


    debugLog(
        'Supabase client detected.'
    );


    return true;

}


/* =========================================================
   4. GET SUPABASE CLIENT
   ========================================================= */

function getSupabaseClient() {

    if (
        typeof window.supabase === 'undefined'
    ) {

        debugError(
            'Supabase client is unavailable.'
        );


        return null;

    }


    return window.supabase;

}


/* =========================================================
   5. CHECK AUTH MODULE
   ========================================================= */

function checkAuthenticationModule() {

    const available =
        typeof isAuthenticated ===
        'function';


    RS_CONNECTION_STATE.authentication =
        available;


    return available;

}


/* =========================================================
   6. CHECK DATABASE ACCESS LAYER
   ========================================================= */

function checkDatabaseLayer() {

    /*
     * Database feature modules are responsible for
     * their own database operations.

     * This check only verifies that the application
     * has the required backend client available.
     */

    const available =
        checkSupabaseConnection();


    RS_CONNECTION_STATE.database =
        available;


    return available;

}


/* =========================================================
   7. CHECK STORAGE LAYER
   ========================================================= */

function checkStorageLayer() {

    /*
     * Storage will be connected when the final
     * Supabase Storage bucket architecture is confirmed.
     */

    const available =
        checkSupabaseConnection();


    RS_CONNECTION_STATE.storage =
        available;


    return available;

}


/* =========================================================
   8. CHECK CORE CONNECTIONS
   ========================================================= */

function checkCoreConnections() {

    const supabase =
        checkSupabaseConnection();


    const authentication =
        checkAuthenticationModule();


    const database =
        checkDatabaseLayer();


    const storage =
        checkStorageLayer();


    RS_CONNECTION_STATE.ready =
        supabase &&
        authentication &&
        database &&
        storage;


    return {

        ...RS_CONNECTION_STATE

    };

}


/* =========================================================
   9. CONNECTION STATUS
   ========================================================= */

function getConnectionStatus() {

    return {

        ...RS_CONNECTION_STATE

    };

}


/* =========================================================
   10. CONNECTION EVENT
   ========================================================= */

function dispatchConnectionStatus() {

    const status =
        getConnectionStatus();


    window.dispatchEvent(

        new CustomEvent(
            'rs:connection-status',
            {

                detail:
                    status

            }

        )

    );


    if (
        typeof notifyStateChange ===
        'function'
    ) {

        notifyStateChange(
            'connections',
            {

                event:
                    'connection-status',

                status

            }
        );

    }

}


/* =========================================================
   11. INITIALIZE CONNECTIONS
   ========================================================= */

function initializeConnections() {

    debugLog(
        'Initializing application connections...'
    );


    const status =
        checkCoreConnections();


    dispatchConnectionStatus();


    if (
        status.ready
    ) {

        debugLog(
            'All core connections are ready.'
        );

    } else {

        debugLog(
            'Core connections are partially initialized.'
        );

    }


    return status;

}


/* =========================================================
   12. RECHECK CONNECTIONS
   ========================================================= */

function refreshConnections() {

    return initializeConnections();

}


/* =========================================================
   13. SUPABASE AVAILABILITY
   ========================================================= */

function isSupabaseAvailable() {

    return Boolean(
        RS_CONNECTION_STATE.supabase
    );

}


/* =========================================================
   14. DATABASE AVAILABILITY
   ========================================================= */

function isDatabaseAvailable() {

    return Boolean(
        RS_CONNECTION_STATE.database
    );

}


/* =========================================================
   15. STORAGE AVAILABILITY
   ========================================================= */

function isStorageAvailable() {

    return Boolean(
        RS_CONNECTION_STATE.storage
    );

}


/* =========================================================
   16. CONNECTION ERROR MESSAGE
   ========================================================= */

function getConnectionErrorMessage() {

    if (
        !RS_CONNECTION_STATE.supabase
    ) {

        return (
            'Supabase connection is unavailable.'
        );

    }


    if (
        !RS_CONNECTION_STATE.authentication
    ) {

        return (
            'Authentication module is unavailable.'
        );

    }


    if (
        !RS_CONNECTION_STATE.database
    ) {

        return (
            'Database connection is unavailable.'
        );

    }


    if (
        !RS_CONNECTION_STATE.storage
    ) {

        return (
            'Storage connection is unavailable.'
        );

    }


    return '';

}


/* =========================================================
   17. GLOBAL CONNECTION LISTENER
   ========================================================= */

window.addEventListener(
    'online',
    () => {

        refreshConnections();

    }
);


window.addEventListener(
    'offline',
    () => {

        RS_CONNECTION_STATE.ready =
            false;


        dispatchConnectionStatus();

    }
);


/* =========================================================
   END OF CONNECTIONS.JS
   ========================================================= */
