/**
 * Dynamic ServiceGroup Admin Form Behavior
 *
 * Watches the gym dropdown and, when it changes, fetches the list of YoActiv
 * services for that gym using the gym's DB-stored branch_id (via
 * /api/api/gym-services/?gym_id=<id>), then repopulates the yoactiv_service_id
 * dropdown accordingly.
 */

(function () {
    'use strict';

    function initServiceGroupAdminForm() {
        console.log('[ServiceGroup Admin] Initializing dynamic gym → service form...');

        const gymField = document.getElementById('id_gym');
        const serviceField = document.getElementById('id_yoactiv_service_id');

        if (!gymField || !serviceField) {
            console.log('[ServiceGroup Admin] Required fields not found, skipping init');
            return;
        }

        const initialServiceId = serviceField.value;

        /**
         * Fetch services from YoActiv for the chosen gym and populate the dropdown.
         */
        function loadServicesForGym(gymId, options) {
            options = options || {};
            const preserveSelectedId = options.preserveSelectedId || '';

            if (!gymId) {
                serviceField.innerHTML = '<option value="">--- Select a gym first ---</option>';
                console.log('[ServiceGroup Admin] No gym selected, reset service dropdown');
                return;
            }

            serviceField.innerHTML = '<option value="">Loading…</option>';
            serviceField.disabled = true;

            const apiUrl = '/api/api/gym-services/?gym_id=' + gymId;
            console.log('[ServiceGroup Admin] Fetching services from:', apiUrl);

            fetch(apiUrl)
                .then(function (response) {
                    console.log('[ServiceGroup Admin] API response status:', response.status);
                    return response.json();
                })
                .then(function (data) {
                    console.log('[ServiceGroup Admin] API response data:', data);

                    if (data.success && data.services) {
                        serviceField.innerHTML = '<option value="">--- Select a service ---</option>';
                        var selectedFound = false;

                        data.services.forEach(function (svc) {
                            var option = document.createElement('option');
                            option.value = svc.id;
                            option.textContent = svc.display;
                            if (preserveSelectedId && svc.id === preserveSelectedId) {
                                option.selected = true;
                                selectedFound = true;
                            }
                            serviceField.appendChild(option);
                        });

                        // Keep the previously saved value if YoActiv no longer returns it.
                        if (preserveSelectedId && !selectedFound) {
                            var preserved = document.createElement('option');
                            preserved.value = preserveSelectedId;
                            preserved.textContent = 'Saved service (' + preserveSelectedId + ')';
                            preserved.selected = true;
                            serviceField.appendChild(preserved);
                        }

                        serviceField.disabled = false;
                        console.log('[ServiceGroup Admin] Loaded', data.services.length, 'services');
                    } else {
                        serviceField.innerHTML = '<option value="">Error loading services</option>';
                        if (data.error) {
                            console.error('[ServiceGroup Admin] API error:', data.error);
                        }
                        serviceField.disabled = false;
                    }
                })
                .catch(function (error) {
                    console.error('[ServiceGroup Admin] Fetch failed:', error);
                    serviceField.innerHTML = '<option value="">Error loading services</option>';
                    serviceField.disabled = false;
                });
        }

        // React to gym changes.
        gymField.addEventListener('change', function () {
            console.log('[ServiceGroup Admin] Gym changed to:', this.value);
            loadServicesForGym(this.value);
        });

        // On page load, if a gym is already selected (e.g. editing existing record),
        // refresh the service list while preserving the currently saved service id.
        if (gymField.value) {
            console.log('[ServiceGroup Admin] Initial gym value:', gymField.value);
            loadServicesForGym(gymField.value, { preserveSelectedId: initialServiceId });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initServiceGroupAdminForm);
    } else {
        initServiceGroupAdminForm();
    }
})();
