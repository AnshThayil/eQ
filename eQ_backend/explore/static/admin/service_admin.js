/**
 * Dynamic Service Admin Form Behavior
 * 
 * Handles:
 * 1. Loading service variations when service_group is selected
 * 2. Auto-populating name, price, and access_type when variation is selected
 */

(function() {
    'use strict';

    function initServiceAdminForm() {
        console.log('[Service Admin] Initializing dynamic form...');
        
        const serviceGroupField = document.getElementById('id_service_group');
        const variationField = document.getElementById('id_yoactiv_service_variation_id');
        const nameField = document.getElementById('id_name');
        const priceField = document.getElementById('id_price');
        const accessTypeField = document.getElementById('id_access_type');
        const numSessionsField = document.getElementById('id_num_sessions');
        const initialVariationId = variationField ? variationField.value : '';

        if (!serviceGroupField || !variationField) {
            console.log('[Service Admin] Fields not found, skipping dynamic init');
            return;
        }

        console.log('[Service Admin] All fields found, setting up event listeners');

        // Store variation data for later use
        window.variationData = {};

        // Error message element shown below the variation dropdown
        let errorEl = document.getElementById('service-admin-variation-error');
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.id = 'service-admin-variation-error';
            errorEl.style.cssText = 'color:#ba2121;margin-top:4px;font-size:0.9em;';
            variationField.parentNode.insertBefore(errorEl, variationField.nextSibling);
        }

        function showError(msg) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }

        function clearError() {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }

        /**
         * Fetch variations from API and populate the variation dropdown
         */
        function loadVariations(serviceGroupId, options = {}) {
            console.log('[Service Admin] loadVariations called with ID:', serviceGroupId);
            const preserveSelectedId = options.preserveSelectedId || '';
            
            if (!serviceGroupId) {
                // Reset if no service group selected
                variationField.innerHTML = '<option value="">--- Select a service group first ---</option>';
                window.variationData = {};
                clearError();
                console.log('[Service Admin] No service group selected, reset dropdown');
                return;
            }

            // Show loading state
            variationField.innerHTML = '<option value="">Loading...</option>';
            variationField.disabled = true;

            // Fetch variations from API
            const apiUrl = '/api/api/variations/?service_group_id=' + serviceGroupId;
            
            console.log('[Service Admin] Fetching variations from:', apiUrl);
            
            fetch(apiUrl)
                .then(response => {
                    console.log('[Service Admin] API response status:', response.status);
                    if (!response.ok) {
                        console.error('[Service Admin] Non-2xx response:', response.status, response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('[Service Admin] API response data:', data);
                    
                    if (data.success && data.variations) {
                        clearError();
                        // Clear dropdown
                        variationField.innerHTML = '<option value="">--- Select a variation ---</option>';
                        let selectedIdFound = false;

                        // Populate with new variations
                        data.variations.forEach(variation => {
                            const option = document.createElement('option');
                            option.value = variation.id;
                            option.textContent = variation.display;
                            if (preserveSelectedId && variation.id === preserveSelectedId) {
                                option.selected = true;
                                selectedIdFound = true;
                            }
                            variationField.appendChild(option);

                            // Store variation data for auto-fill
                            window.variationData[variation.id] = {
                                name: variation.name,
                                amount: variation.amount,
                                serviceId: variation.serviceId
                            };
                        });

                        // Keep previously saved value even if it's no longer returned by YoActiv.
                        if (preserveSelectedId && !selectedIdFound) {
                            const preservedOption = document.createElement('option');
                            preservedOption.value = preserveSelectedId;
                            preservedOption.textContent = `Saved variation (${preserveSelectedId})`;
                            preservedOption.selected = true;
                            variationField.appendChild(preservedOption);
                        }

                        variationField.disabled = false;
                        console.log('[Service Admin] Loaded', data.variations.length, 'variations');
                    } else {
                        const errorMsg = data.error || 'Unknown error from server';
                        console.error('[Service Admin] API error:', errorMsg);
                        showError('Failed to load variations: ' + errorMsg);
                        variationField.innerHTML = '<option value="">--- Error loading variations ---</option>';
                        variationField.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('[Service Admin] Failed to fetch variations:', error);
                    showError('Network error loading variations: ' + error.message);
                    variationField.innerHTML = '<option value="">--- Error loading variations ---</option>';
                    variationField.disabled = false;
                });
        }

        /**
         * Auto-populate fields based on selected variation
         */
        function populateFromVariation(variationId) {
            console.log('[Service Admin] populateFromVariation called with ID:', variationId);
            
            if (!variationId || !window.variationData[variationId]) {
                console.log('[Service Admin] No variation data found');
                return;
            }

            const variation = window.variationData[variationId];
            console.log('[Service Admin] Auto-filling with variation data:', variation);

            // Auto-fill name if empty
            if (nameField && !nameField.value) {
                nameField.value = variation.name;
                console.log('[Service Admin] Set name to:', variation.name);
            }

            // Auto-fill price
            if (priceField && !priceField.value) {
                priceField.value = variation.amount;
                console.log('[Service Admin] Set price to:', variation.amount);
            }

            // Auto-set access_type to "unlimited" if not set
            if (accessTypeField && !accessTypeField.value) {
                accessTypeField.value = 'unlimited';
                console.log('[Service Admin] Set access_type to: unlimited');
            }

            // Clear num_sessions if access_type is unlimited
            if (
                numSessionsField &&
                accessTypeField &&
                accessTypeField.value === 'unlimited' &&
                !numSessionsField.value
            ) {
                numSessionsField.value = '';
                console.log('[Service Admin] Cleared num_sessions');
            }
        }

        // Event listeners
        serviceGroupField.addEventListener('change', function() {
            console.log('[Service Admin] Service group changed to:', this.value);
            loadVariations(this.value);
        });

        variationField.addEventListener('change', function() {
            console.log('[Service Admin] Variation changed to:', this.value);
            populateFromVariation(this.value);
        });

        // Load variations on page load if service_group is already selected
        if (serviceGroupField.value) {
            console.log('[Service Admin] Initial service group value:', serviceGroupField.value);
            loadVariations(serviceGroupField.value, {
                preserveSelectedId: initialVariationId,
            });
        } else {
            console.log('[Service Admin] No initial service group value');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initServiceAdminForm);
    } else {
        initServiceAdminForm();
    }
})();
