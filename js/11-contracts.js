
/* =========================================================
   RS PHOTOGRAPHY OWNER DASHBOARD
   JAVASCRIPT PART 11 — CONTRACTS
   File: 11-contracts.js

   RESPONSIBILITY:
   - Contract page
   - Contract list rendering
   - Contract search
   - Contract selection
   - Contract actions
   - Contract UI state

   IMPORTANT:
   No fake Supabase "contracts" table is assumed here.

   The database layer will be connected after the exact
   contract schema is finalized.

   DOES NOT:
   - Handle authentication
   - Handle navigation
   - Handle sidebar
   - Modify bookings
   - Manage gallery
   ========================================================= */

'use strict';


/* =========================================================
   1. MODULE STATE
   ========================================================= */

let RS_CONTRACTS_INITIALIZED = false;


/* =========================================================
   2. CONTRACT STATE
   ========================================================= */

const RS_CONTRACTS_STATE = {

    items: [],

    filteredItems: [],

    search: '',

    status: 'all',

    selectedId: null,

    loading: false

};


/* =========================================================
   3. CONTRACT CONFIGURATION
   ========================================================= */

const CONTRACTS_CONFIG = Object.freeze({

    defaultStatus:
        'draft',

    defaultSort:
        'newest'

});


/* =========================================================
   4. GET CONTRACT ELEMENTS
   ========================================================= */

function getContractElements() {

    return {

        page:
            domSelect(
                '[data-page-view="contracts"]'
            ),

        list:
            domSelect(
                '[data-contracts-list]'
            ),

        search:
            domSelect(
                '[data-contracts-search]'
            ),

        statusFilter:
            domSelect(
                '[data-contracts-status-filter]'
            ),

        resultCount:
            domSelect(
                '[data-contracts-result-count]'
            ),

        empty:
            domSelect(
                '[data-contracts-state="empty"]'
            ),

        loading:
            domSelect(
                '[data-contracts-state="loading"]'
            ),

        error:
            domSelect(
                '[data-contracts-state="error"]'
            ),

        newButton:
            domSelect(
                '[data-action="new-contract"]'
            )

    };

}


/* =========================================================
   5. NORMALIZE CONTRACT
   ========================================================= */

function normalizeContract(
    contract
) {

    if (!contract) {

        return null;

    }


    return {

        ...contract,

        id:
            contract.id ?? null,

        contract_number:
            contract.contract_number ?? '',

        customer_name:
            contract.customer_name ?? '',

        function_type:
            contract.function_type ?? '',

        booking_date:
            contract.booking_date ?? '',

        amount:
            contract.amount ?? '',

        status:
            contract.status ||
            CONTRACTS_CONFIG.defaultStatus,

        created_at:
            contract.created_at ?? null,

        updated_at:
            contract.updated_at ?? null

    };

}


/* =========================================================
   6. SET LOADING
   ========================================================= */

function setContractsLoading(
    loading
) {

    RS_CONTRACTS_STATE.loading =
        Boolean(loading);


    const elements =
        getContractElements();


    if (elements.loading) {

        elements.loading.hidden =
            !RS_CONTRACTS_STATE.loading;

    }


    if (elements.page) {

        elements.page.classList.toggle(
            'contracts-loading',
            RS_CONTRACTS_STATE.loading
        );

    }

}


/* =========================================================
   7. SET ERROR
   ========================================================= */

function setContractsError(
    message
) {

    const elements =
        getContractElements();


    if (!elements.error) {

        return;

    }


    elements.error.textContent =
        message || '';


    elements.error.hidden =
        !Boolean(message);

}


/* =========================================================
   8. CREATE DEMO CONTRACT FROM BOOKING
   ========================================================= */

function createContractPreviewFromBooking(
    booking
) {

    if (!booking) {

        return null;

    }


    return normalizeContract({

        id:
            `booking-${booking.id}`,

        contract_number:
            `DRAFT-${String(
                booking.id
            ).slice(
                0,
                8
            )}`,

        customer_name:
            booking.customer_name,

        function_type:
            booking.function_type,

        booking_date:
            booking.booking_date,

        amount:
            booking.expected_money,

        status:
            'draft',

        created_at:
            booking.created_at

    });

}


/* =========================================================
   9. LOAD CONTRACTS
   ========================================================= */

async function loadContracts() {

    if (
        !isAuthenticated()
    ) {

        debugLog(
            'Contracts loading skipped: user is not authenticated.'
        );


        return;

    }


    setContractsLoading(
        true
    );


    setContractsError(
        ''
    );


    try {

        /*
         * Until the contracts database schema is finalized,
         * derive contract previews from existing bookings.
         *
         * This does NOT write anything to Supabase.
         */

        const bookings =
            Array.isArray(
                RS_STATE.bookings?.items
            )
                ? RS_STATE.bookings.items
                : [];


        RS_CONTRACTS_STATE.items =
            bookings
                .map(
                    createContractPreviewFromBooking
                )
                .filter(Boolean);


        applyContractFilters();


        renderContracts();


    } catch (error) {

        const normalizedError =
            normalizeError(
                error
            );


        setContractsError(
            normalizedError.message ||
            'Unable to load contracts.'
        );


        debugError(
            'Contracts loading failed:',
            normalizedError
        );

    } finally {

        setContractsLoading(
            false
        );

    }

}


/* =========================================================
   10. CONTRACT SEARCH
   ========================================================= */

function contractMatchesSearch(
    contract,
    search
) {

    if (!search) {

        return true;

    }


    const searchableText = [

        contract.contract_number,

        contract.customer_name,

        contract.function_type,

        contract.status

    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();


    return searchableText.includes(
        search
    );

}


/* =========================================================
   11. CONTRACT STATUS FILTER
   ========================================================= */

function contractMatchesStatus(
    contract,
    status
) {

    if (
        !status ||
        status === 'all'
    ) {

        return true;

    }


    return (
        String(
            contract.status || ''
        )
            .toLowerCase()
        ===
        String(
            status
        )
            .toLowerCase()
    );

}


/* =========================================================
   12. APPLY CONTRACT FILTERS
   ========================================================= */

function applyContractFilters() {

    const search =
        String(
            RS_CONTRACTS_STATE.search || ''
        )
            .trim()
            .toLowerCase();


    const status =
        RS_CONTRACTS_STATE.status;


    const filtered =
        RS_CONTRACTS_STATE.items.filter(
            (contract) => {

                return (

                    contractMatchesSearch(
                        contract,
                        search
                    )

                    &&

                    contractMatchesStatus(
                        contract,
                        status
                    )

                );

            }
        );


    RS_CONTRACTS_STATE.filteredItems =
        filtered;


    return filtered;

}


/* =========================================================
   13. CREATE CONTRACT CARD
   ========================================================= */

function createContractCard(
    contract
) {

    const article =
        document.createElement(
            'article'
        );


    article.className =
        'contract-card';


    article.dataset.contractId =
        contract.id || '';


    const status =
        formatContractStatus(
            contract.status
        );


    article.innerHTML = `

        <div class="contract-card-header">

            <div>

                <span class="contract-number">

                    ${escapeHtml(
                        contract.contract_number ||
                        'No Contract Number'
                    )}

                </span>

                <h3>

                    ${escapeHtml(
                        contract.customer_name ||
                        'Unknown Customer'
                    )}

                </h3>

            </div>


            <span class="booking-status booking-status-${slugify(status)}">

                ${escapeHtml(status)}

            </span>

        </div>


        <div class="contract-card-details">

            <div>

                <span>
                    Event
                </span>

                <strong>

                    ${escapeHtml(
                        contract.function_type ||
                        'Photography Event'
                    )}

                </strong>

            </div>


            <div>

                <span>
                    Date
                </span>

                <strong>

                    ${escapeHtml(
                        formatContractDate(
                            contract.booking_date
                        )
                    )}

                </strong>

            </div>


            <div>

                <span>
                    Amount
                </span>

                <strong>

                    ${escapeHtml(
                        formatContractMoney(
                            contract.amount
                        )
                    )}

                </strong>

            </div>

        </div>


        <div class="contract-card-actions">

            <button
                type="button"
                class="btn btn-secondary"
                data-action="view-contract"
                data-contract-id="${escapeHtml(
                    String(contract.id || '')
                )}">

                View

            </button>


            <button
                type="button"
                class="btn btn-secondary"
                data-action="edit-contract"
                data-contract-id="${escapeHtml(
                    String(contract.id || '')
                )}">

                Edit

            </button>


            <button
                type="button"
                class="btn btn-secondary"
                data-action="download-contract"
                data-contract-id="${escapeHtml(
                    String(contract.id || '')
                )}">

                Download

            </button>

        </div>

    `;


    return article;

}


/* =========================================================
   14. RENDER CONTRACTS
   ========================================================= */

function renderContracts() {

    const elements =
        getContractElements();


    const contracts =
        RS_CONTRACTS_STATE.filteredItems;


    if (elements.list) {

        elements.list.innerHTML =
            '';


        contracts.forEach(
            (contract) => {

                elements.list.appendChild(
                    createContractCard(
                        contract
                    )
                );

            }
        );

    }


    if (elements.resultCount) {

        elements.resultCount.textContent =
            String(
                contracts.length
            );

    }


    if (elements.empty) {

        elements.empty.hidden =
            contracts.length !== 0;

    }

}


/* =========================================================
   15. FORMAT CONTRACT DATE
   ========================================================= */

function formatContractDate(
    value
) {

    if (!value) {

        return 'Not scheduled';

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        'en-IN',
        {

            day:
                '2-digit',

            month:
                'short',

            year:
                'numeric'

        }
    );

}


/* =========================================================
   16. FORMAT CONTRACT MONEY
   ========================================================= */

function formatContractMoney(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {

        return '₹0';

    }


    const amount =
        Number(
            String(value)
                .replace(
                    /[₹,\s]/g,
                    ''
                )
        );


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return '₹0';

    }


    return new Intl.NumberFormat(
        'en-IN',
        {

            style:
                'currency',

            currency:
                'INR',

            maximumFractionDigits:
                0

        }
    ).format(
        amount
    );

}


/* =========================================================
   17. FORMAT CONTRACT STATUS
   ========================================================= */

function formatContractStatus(
    status
) {

    const normalized =
        String(
            status ||
            'draft'
        )
            .trim()
            .toLowerCase();


    const labels = {

        draft:
            'Draft',

        sent:
            'Sent',

        signed:
            'Signed',

        completed:
            'Completed',

        cancelled:
            'Cancelled',

        canceled:
            'Cancelled'

    };


    return (
        labels[normalized]
        ||
        capitalizeWords(
            normalized
        )
    );

}


/* =========================================================
   18. FIND CONTRACT
   ========================================================= */

function findContractById(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;

    }


    return (
        RS_CONTRACTS_STATE.items.find(
            (contract) =>
                String(
                    contract.id
                )
                ===
                String(id)
        )
        ||
        null
    );

}


/* =========================================================
   19. UPDATE SEARCH
   ========================================================= */

function updateContractSearch(
    value
) {

    RS_CONTRACTS_STATE.search =
        String(
            value || ''
        );


    applyContractFilters();

    renderContracts();

}


/* =========================================================
   20. UPDATE STATUS
   ========================================================= */

function updateContractStatus(
    value
) {

    RS_CONTRACTS_STATE.status =
        value || 'all';


    applyContractFilters();

    renderContracts();

}


/* =========================================================
   21. FILTER EVENTS
   ========================================================= */

function initializeContractFilterEvents() {

    const elements =
        getContractElements();


    if (elements.search) {

        elements.search.addEventListener(
            'input',
            (event) => {

                updateContractSearch(
                    event.target.value
                );

            }
        );

    }


    if (
        elements.statusFilter
    ) {

        elements.statusFilter.addEventListener(
            'change',
            (event) => {

                updateContractStatus(
                    event.target.value
                );

            }
        );

    }

}


/* =========================================================
   22. CONTRACT ACTION HANDLER
   ========================================================= */

function handleContractAction(
    event
) {

    const button =
        event.target.closest(
            '[data-action]'
        );


    if (!button) {

        return;

    }


    const action =
        button.getAttribute(
            'data-action'
        );


    const contractId =
        button.getAttribute(
            'data-contract-id'
        );


    switch (action) {

        case 'view-contract':

            if (!contractId) {

                return;

            }


            handleContractRequest(
                'view-requested',
                contractId
            );

            break;


        case 'edit-contract':

            if (!contractId) {

                return;

            }


            handleContractRequest(
                'edit-requested',
                contractId
            );

            break;


        case 'download-contract':

            if (!contractId) {

                return;

            }


            handleContractRequest(
                'download-requested',
                contractId
            );

            break;


        case 'new-contract':

            handleContractRequest(
                'new-requested',
                null
            );

            break;


        default:

            break;

    }

}


/* =========================================================
   23. CONTRACT REQUEST EVENT
   ========================================================= */

function handleContractRequest(
    requestType,
    contractId
) {

    const contract =
        contractId
            ? findContractById(
                contractId
            )
            : null;


    notifyStateChange(
        'contracts',
        {

            event:
                requestType,

            contract

        }
    );

}


/* =========================================================
   24. NAVIGATION EVENT
   ========================================================= */

function handleContractNavigation(
    event
) {

    const detail =
        event?.detail;


    if (!detail) {

        return;

    }


    if (
        detail.section !== 'navigation'
    ) {

        return;

    }


    if (
        detail.event !== 'page-changed'
    ) {

        return;

    }


    if (
        detail.page !== 'contracts'
    ) {

        return;

    }


    loadContracts();

}


/* =========================================================
   25. BOOKING CHANGE EVENT
   ========================================================= */

function handleContractBookingChange(
    event
) {

    const detail =
        event?.detail;


    if (!detail) {

        return;

    }


    if (
        detail.section !== 'bookings'
    ) {

        return;

    }


    if (
        detail.event !== 'created' &&
        detail.event !== 'updated' &&
        detail.event !== 'deleted'
    ) {

        return;

    }


    const elements =
        getContractElements();


    if (
        elements.page &&
        elements.page.hidden === false
    ) {

        loadContracts();

    }

}


/* =========================================================
   26. INITIALIZE CONTRACTS
   ========================================================= */

function initializeContracts() {

    if (
        RS_CONTRACTS_INITIALIZED
    ) {

        return true;

    }


    const elements =
        getContractElements();


    if (!elements.page) {

        debugError(
            'Contracts page element was not found.'
        );


        return false;

    }


    initializeContractFilterEvents();


    document.addEventListener(
        'click',
        handleContractAction
    );


    window.addEventListener(
        'rs:state-changed',
        handleContractNavigation
    );


    window.addEventListener(
        'rs:state-changed',
        handleContractBookingChange
    );


    RS_CONTRACTS_INITIALIZED =
        true;


    debugLog(
        'Contracts module initialized.'
    );


    if (
        elements.page.hidden === false &&
        isAuthenticated()
    ) {

        loadContracts();

    }


    return true;

}


/* =========================================================
   27. REFRESH CONTRACTS
   ========================================================= */

async function refreshContracts() {

    return loadContracts();

}


/* =========================================================
   28. CLEAR FILTERS
   ========================================================= */

function clearContractFilters() {

    RS_CONTRACTS_STATE.search =
        '';

    RS_CONTRACTS_STATE.status =
        'all';


    const elements =
        getContractElements();


    if (elements.search) {

        elements.search.value =
            '';

    }


    if (elements.statusFilter) {

        elements.statusFilter.value =
            'all';

    }


    applyContractFilters();

    renderContracts();

}


/* =========================================================
   29. CLEANUP
   ========================================================= */

function destroyContracts() {

    RS_CONTRACTS_INITIALIZED =
        false;


    RS_CONTRACTS_STATE.items =
        [];

    RS_CONTRACTS_STATE.filteredItems =
        [];

    RS_CONTRACTS_STATE.selectedId =
        null;


}


/* =========================================================
   END OF 11-CONTRACTS.JS
   ========================================================= */
