
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 05 — AUTHENTICATION
   File: 05-auth.js

   RESPONSIBILITY:
   - Supabase authentication
   - Login
   - Logout
   - Session checking
   - Current user retrieval
   - Authentication state changes

   THIS FILE DOES NOT:
   - Control navigation
   - Control sidebar
   - Load bookings
   - Render dashboard
   - Modify database records
   - Manage modals
   ========================================================= */

'use strict';


/* =========================================================
   1. AUTH MODULE STATE
   ========================================================= */

let RS_AUTH_INITIALIZED = false;

let RS_AUTH_LISTENER = null;


/* =========================================================
   2. SUPABASE CLIENT CHECK
   ========================================================= */

/**
 * Verify that the Supabase client exists.
 *
 * The actual client is created by 01-config.js.
 */

function getSupabaseClient() {

    if (
        typeof supabaseClient === 'undefined' ||
        !supabaseClient
    ) {

        throw new Error(
            'Supabase client is not initialized.'
        );

    }


    return supabaseClient;

}


/* =========================================================
   3. LOGIN
   ========================================================= */

/**
 * Sign in using email + password.
 *
 * Uses Supabase Auth v2:
 *
 * supabase.auth.signInWithPassword()
 */

async function loginUser(
    email,
    password
) {

    const normalizedEmail =
        normalizeEmail(email);


    if (!normalizedEmail) {

        return {

            success: false,

            error: 'Email address is required.'

        };

    }


    if (!password) {

        return {

            success: false,

            error: 'Password is required.'

        };

    }


    setAuthState({

        loading: true,

        error: null

    });


    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client.auth.signInWithPassword({

            email:
                normalizedEmail,

            password

        });


        if (error) {

            throw error;

        }


        /*
         * Supabase returns the authenticated session
         * and user.
         */

        setAuthState({

            authenticated:
                Boolean(data?.session),

            loading:
                false,

            user:
                data?.user || null,

            session:
                data?.session || null,

            error:
                null

        });


        notifyStateChange(
            'auth',
            {
                event: 'signed-in'
            }
        );


        return {

            success: true,

            user:
                data?.user || null,

            session:
                data?.session || null

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        setAuthState({

            authenticated: false,

            loading: false,

            user: null,

            session: null,

            error:
                normalizedError.message

        });


        debugError(
            'Login failed:',
            normalizedError
        );


        return {

            success: false,

            error:
                normalizedError.message,

            code:
                normalizedError.code

        };

    }

}


/* =========================================================
   4. GET CURRENT SESSION
   ========================================================= */

/**
 * Retrieve the current Supabase session.
 *
 * This is used during application startup and whenever
 * the application needs to know whether a session exists.
 */

async function getCurrentSession() {

    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client.auth.getSession();


        if (error) {

            throw error;

        }


        const session =
            data?.session || null;


        setAuthState({

            authenticated:
                Boolean(session),

            loading:
                false,

            session,

            user:
                session?.user || null,

            error:
                null

        });


        return {

            success: true,

            session,

            authenticated:
                Boolean(session)

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        setAuthState({

            authenticated: false,

            loading: false,

            session: null,

            user: null,

            error:
                normalizedError.message

        });


        debugError(
            'Session check failed:',
            normalizedError
        );


        return {

            success: false,

            session: null,

            authenticated: false,

            error:
                normalizedError.message

        };

    }

}


/* =========================================================
   5. GET AUTHENTICATED USER
   ========================================================= */

/**
 * Retrieve the authenticated user from Supabase.
 *
 * This is useful when we need authoritative user
 * information rather than relying only on locally held
 * application state.
 */

async function getAuthenticatedUser() {

    try {

        const client =
            getSupabaseClient();


        const {
            data,
            error
        } = await client.auth.getUser();


        if (error) {

            throw error;

        }


        const user =
            data?.user || null;


        if (!user) {

            resetAuthState();

            return {

                success: true,

                user: null,

                authenticated: false

            };

        }


        setAuthState({

            authenticated: true,

            loading: false,

            user,

            error: null

        });


        return {

            success: true,

            user,

            authenticated: true

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        setAuthState({

            authenticated: false,

            loading: false,

            user: null,

            error:
                normalizedError.message

        });


        debugError(
            'User retrieval failed:',
            normalizedError
        );


        return {

            success: false,

            user: null,

            authenticated: false,

            error:
                normalizedError.message

        };

    }

}


/* =========================================================
   6. LOGOUT
   ========================================================= */

/**
 * Sign out the current Supabase user.
 */

async function logoutUser() {

    setAuthState({

        loading: true,

        error: null

    });


    try {

        const client =
            getSupabaseClient();


        const {
            error
        } = await client.auth.signOut();


        if (error) {

            throw error;

        }


        resetAuthState();


        notifyStateChange(
            'auth',
            {
                event: 'signed-out'
            }
        );


        return {

            success: true

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        setAuthState({

            loading: false,

            error:
                normalizedError.message

        });


        debugError(
            'Logout failed:',
            normalizedError
        );


        return {

            success: false,

            error:
                normalizedError.message,

            code:
                normalizedError.code

        };

    }

}


/* =========================================================
   7. AUTH STATE CHANGE LISTENER
   ========================================================= */

/**
 * Listen for Supabase authentication changes.
 *
 * Examples:
 *
 * SIGNED_IN
 * SIGNED_OUT
 * TOKEN_REFRESHED
 * USER_UPDATED
 */

function initializeAuthListener() {

    if (RS_AUTH_LISTENER) {

        return RS_AUTH_LISTENER;

    }


    const client =
        getSupabaseClient();


    const {
        data
    } = client.auth.onAuthStateChange(
        (event, session) => {

            /*
             * Keep this callback lightweight.
             *
             * Other modules react through the application
             * state event rather than doing everything here.
             */

            const authenticated =
                Boolean(session);


            setAuthState({

                authenticated,

                session:
                    session || null,

                user:
                    session?.user || null,

                loading: false,

                error: null

            });


            notifyStateChange(
                'auth',
                {

                    event,

                    authenticated

                }
            );

        }
    );


    RS_AUTH_LISTENER =
        data?.subscription || null;


    RS_AUTH_INITIALIZED = true;


    return RS_AUTH_LISTENER;

}


/* =========================================================
   8. REMOVE AUTH LISTENER
   ========================================================= */

function removeAuthListener() {

    if (
        !RS_AUTH_LISTENER
    ) {

        return;

    }


    try {

        RS_AUTH_LISTENER.unsubscribe();

    } catch (error) {

        debugError(
            'Unable to remove auth listener:',
            error
        );

    }


    RS_AUTH_LISTENER = null;

    RS_AUTH_INITIALIZED = false;

}


/* =========================================================
   9. AUTHENTICATION CHECK
   ========================================================= */

/**
 * Performs a complete authentication check.
 *
 * 1. Get session
 * 2. If session exists, retrieve user
 * 3. Update application state
 */

async function checkAuthentication() {

    setAuthState({

        loading: true,

        error: null

    });


    const sessionResult =
        await getCurrentSession();


    if (
        !sessionResult.success
    ) {

        return {

            authenticated: false,

            user: null,

            session: null,

            error:
                sessionResult.error

        };

    }


    if (
        !sessionResult.session
    ) {

        resetAuthState();


        return {

            authenticated: false,

            user: null,

            session: null

        };

    }


    const userResult =
        await getAuthenticatedUser();


    if (
        !userResult.success
    ) {

        return {

            authenticated: false,

            user: null,

            session:
                sessionResult.session,

            error:
                userResult.error

        };

    }


    return {

        authenticated:
            userResult.authenticated,

        user:
            userResult.user,

        session:
            sessionResult.session

    };

}


/* =========================================================
   10. AUTH ERROR MESSAGE
   ========================================================= */

function getFriendlyAuthError(error) {

    const message =
        getErrorMessage(error);


    const normalized =
        message.toLowerCase();


    if (
        normalized.includes(
            'invalid login credentials'
        )
    ) {

        return 'Incorrect email or password.';

    }


    if (
        normalized.includes(
            'email not confirmed'
        )
    ) {

        return 'Your email address has not been confirmed.';

    }


    if (
        normalized.includes(
            'too many requests'
        )
    ) {

        return 'Too many login attempts. Please try again later.';

    }


    if (
        normalized.includes(
            'network'
        )
    ) {

        return 'Network connection problem.';

    }


    return (
        message ||
        'Unable to authenticate.'
    );

}


/* =========================================================
   11. LOGIN FORM VALIDATION
   ========================================================= */

function validateLoginCredentials(
    email,
    password
) {

    const errors = [];


    if (!isRequired(email)) {

        errors.push(
            'Email address is required.'
        );

    } else if (
        !isValidEmail(email)
    ) {

        errors.push(
            'Enter a valid email address.'
        );

    }


    if (!isRequired(password)) {

        errors.push(
            'Password is required.'
        );

    }


    return {

        valid:
            errors.length === 0,

        errors

    };

}


/* =========================================================
   12. GET AUTH USER DISPLAY NAME
   ========================================================= */

function getAuthUserDisplayName(
    user = RS_STATE.auth.user
) {

    if (!user) {

        return 'Owner';

    }


    const metadata =
        user.user_metadata || {};


    return (

        metadata.full_name ||

        metadata.name ||

        metadata.display_name ||

        user.email ||

        'Owner'

    );

}


/* =========================================================
   13. GET AUTH USER EMAIL
   ========================================================= */

function getAuthUserEmail(
    user = RS_STATE.auth.user
) {

    return (
        user?.email ||
        ''
    );

}


/* =========================================================
   14. AUTH STATUS
   ========================================================= */

function isAuthenticated() {

    return (
        RS_STATE.auth.authenticated === true
    );

}


/* =========================================================
   15. AUTH LOADING STATUS
   ========================================================= */

function isAuthLoading() {

    return (
        RS_STATE.auth.loading === true
    );

}


/* =========================================================
   16. AUTH INITIALIZATION
   ========================================================= */

async function initializeAuthentication() {

    if (
        RS_AUTH_INITIALIZED
    ) {

        return {

            success: true,

            authenticated:
                isAuthenticated()

        };

    }


    try {

        initializeAuthListener();


        const result =
            await checkAuthentication();


        return {

            success: true,

            authenticated:
                result.authenticated,

            user:
                result.user,

            session:
                result.session,

            error:
                result.error || null

        };

    } catch (error) {

        const normalizedError =
            normalizeError(error);


        setAuthState({

            authenticated: false,

            loading: false,

            user: null,

            session: null,

            error:
                normalizedError.message

        });


        debugError(
            'Authentication initialization failed:',
            normalizedError
        );


        return {

            success: false,

            authenticated: false,

            error:
                normalizedError.message

        };

    }

}


/* =========================================================
   17. AUTH STATE EVENT HELPERS
   ========================================================= */

/**
 * Listen for application authentication events.
 *
 * Other modules can use:
 *
 * window.addEventListener(
 *     'rs:state-changed',
 *     ...
 * );
 *
 * This module itself does not control navigation.
 */


/* =========================================================
   18. AUTH CLEANUP
   ========================================================= */

function destroyAuthentication() {

    removeAuthListener();

    resetAuthState();

}


/* =========================================================
   END OF 05-AUTH.JS
   ========================================================= */
