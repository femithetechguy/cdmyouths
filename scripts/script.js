class DynamicFormGenerator {
    constructor() {
        this.formData = null;
        this.formElement = document.getElementById('youth-intake-form');
        this.sectionsContainer = document.getElementById('form-sections');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.successModal = document.getElementById('success-modal');
        
        // Formspree endpoint - replace with your actual Formspree form ID
        this.formspreeEndpoint = 'https://formspree.io/f/xnnzaqwq';
        
        this.sectionIcons = {
            'Personal Information': 'fas fa-user',
            'Address Information': 'fas fa-home',
            'Church Information': 'fas fa-church',
            'Emergency Contact': 'fas fa-phone-alt',
            'Additional Information': 'fas fa-info-circle',
            'Consent': 'fas fa-check-shield',
            'default': 'fas fa-list'
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Set dynamic copyright year
            this.setDynamicYear();
            
            await this.loadFormConfiguration();
            this.hideLoading();
            this.setupEventListeners();
            this.generateForm();
        } catch (error) {
            console.error('Error initializing form:', error);
            this.showError('Failed to load form configuration');
        }
    }
    
    setDynamicYear() {
        const currentYear = new Date().getFullYear();
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = currentYear;
        }
    }
    
    async loadFormConfiguration() {
        try {
            const response = await fetch('json/cdmyouthform.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.formData = await response.json();
        } catch (error) {
            console.error('Error loading form configuration:', error);
            throw error;
        }
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    showError(message) {
        this.hideLoading();
        document.body.innerHTML = `
            <div class="container">
                <div class="error-message">
                    <h2>Error Loading Form</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Retry</button>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Form submission
        this.formElement.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }
        
        // Dynamic field dependencies
        this.formElement.addEventListener('change', (e) => this.handleFieldChange(e));
    }
    
    generateForm() {
        // Set form title and description
        this.setFormHeader();
        
        // Generate form sections
        this.generateSections();
        
        // Set button texts
        this.setButtonTexts();
    }
    
    setFormHeader() {
        const titleElement = document.getElementById('form-title');
        const descriptionElement = document.getElementById('form-description');
        
        if (titleElement && this.formData.formTitle) {
            titleElement.textContent = this.formData.formTitle;
        }
        
        if (descriptionElement && this.formData.formDescription) {
            descriptionElement.textContent = this.formData.formDescription;
        }
    }
    
    generateSections() {
        this.sectionsContainer.innerHTML = '';
        
        this.formData.sections.forEach((section, index) => {
            const sectionElement = this.createSection(section, index);
            this.sectionsContainer.appendChild(sectionElement);
        });
    }
    
    createSection(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'form-section';
        sectionDiv.id = `section-${index}`;
        
        const iconClass = this.sectionIcons[section.title] || this.sectionIcons.default;
        
        sectionDiv.innerHTML = `
            <div class="section-header" onclick="toggleSection(${index})">
                <h2>
                    <div class="section-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    ${section.title}
                </h2>
                <i class="fas fa-chevron-down section-toggle" id="toggle-${index}"></i>
            </div>
            <div class="section-content" id="content-${index}">
                ${this.generateFields(section.fields)}
            </div>
        `;
        
        return sectionDiv;
    }
    
    generateFields(fields) {
        return fields.map(field => this.createField(field)).join('');
    }
    
    createField(field) {
        const isRequired = field.required ? '<span class="required">*</span>' : '';
        const fieldClass = field.type === 'textarea' ? 'form-field full-width' : 'form-field';
        const hiddenClass = field.dependsOn ? 'field-hidden' : '';
        
        let fieldInput = '';
        
        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'date':
                fieldInput = `<input type="${field.type}" id="${field.id}" name="${field.id}" 
                             class="field-input" placeholder="${field.placeholder || ''}" 
                             ${field.required ? 'required' : ''}>`;
                break;
                
            case 'textarea':
                fieldInput = `<textarea id="${field.id}" name="${field.id}" 
                             class="field-input" placeholder="${field.placeholder || ''}" 
                             ${field.required ? 'required' : ''}></textarea>`;
                break;
                
            case 'select':
                const options = field.options.map(option => 
                    `<option value="${option.value}">${option.label}</option>`
                ).join('');
                fieldInput = `<select id="${field.id}" name="${field.id}" 
                             class="field-input" ${field.required ? 'required' : ''}>
                             <option value="">Select an option...</option>
                             ${options}
                             </select>`;
                break;
                
            case 'radio':
                const radioOptions = field.options.map(option => `
                    <div class="radio-option">
                        <input type="radio" id="${field.id}_${option.value}" 
                               name="${field.id}" value="${option.value}" 
                               ${field.required ? 'required' : ''}>
                        <label for="${field.id}_${option.value}">${option.label}</label>
                    </div>
                `).join('');
                fieldInput = `<div class="radio-group">${radioOptions}</div>`;
                break;
                
            case 'checkbox':
                const checkboxOptions = field.options.map(option => `
                    <div class="checkbox-option">
                        <input type="checkbox" id="${field.id}_${option.value}" 
                               name="${field.id}" value="${option.value}">
                        <label for="${field.id}_${option.value}">${option.label}</label>
                    </div>
                `).join('');
                fieldInput = `<div class="checkbox-group">${checkboxOptions}</div>`;
                break;
                
            default:
                fieldInput = `<input type="text" id="${field.id}" name="${field.id}" 
                             class="field-input" placeholder="${field.placeholder || ''}" 
                             ${field.required ? 'required' : ''}>`;
        }
        
        return `
            <div class="${fieldClass} ${hiddenClass}" data-field-id="${field.id}" 
                 ${field.dependsOn ? `data-depends-on="${field.dependsOn.id}" data-depends-value="${field.dependsOn.value}"` : ''}>
                <label for="${field.id}" class="field-label">
                    ${field.label} ${isRequired}
                </label>
                ${fieldInput}
                <div class="field-error" id="error-${field.id}"></div>
            </div>
        `;
    }
    
    setButtonTexts() {
        const submitBtn = document.getElementById('submit-text');
        const resetBtn = document.getElementById('reset-text');
        
        if (submitBtn && this.formData.submitButtonText) {
            submitBtn.textContent = this.formData.submitButtonText;
        }
        
        if (resetBtn && this.formData.resetButtonText) {
            resetBtn.textContent = this.formData.resetButtonText;
        }
    }
    
    handleFieldChange(event) {
        const target = event.target;
        let fieldId = target.name || target.id;
        
        // For checkbox and radio inputs that are part of groups, get the base field ID
        if (fieldId.includes('_')) {
            fieldId = fieldId.split('_')[0];
        }
        
        // Handle conditional field visibility
        this.updateConditionalFields(fieldId, target.value);
        
        // Clear validation errors
        this.clearFieldError(fieldId);
    }
    
    updateConditionalFields(changedFieldId, value) {
        const dependentFields = document.querySelectorAll(`[data-depends-on="${changedFieldId}"]`);
        
        dependentFields.forEach(field => {
            const requiredValue = field.dataset.dependsValue;
            const shouldShow = value === requiredValue;
            
            if (shouldShow) {
                field.classList.remove('field-hidden');
            } else {
                field.classList.add('field-hidden');
                
                // Clear the field value when hidden
                const input = field.querySelector('.field-input');
                if (input) {
                    input.value = '';
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = false;
                    }
                }
                
                // Also clear checkbox and radio groups
                field.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                field.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
            }
        });
    }
    
    handleSubmit(event) {
        event.preventDefault();
        
        if (this.validateForm()) {
            this.submitForm();
        }
    }
    
    validateForm() {
        let isValid = true;
        const formData = new FormData(this.formElement);
        
        // Clear all previous errors
        document.querySelectorAll('.field-error').forEach(error => error.textContent = '');
        document.querySelectorAll('.field-input').forEach(input => input.classList.remove('error'));
        document.querySelectorAll('.checkbox-group').forEach(group => group.classList.remove('error'));
        document.querySelectorAll('.radio-group').forEach(group => group.classList.remove('error'));
        
        // Validate each section's fields
        this.formData.sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.required && !this.isFieldHidden(field.id)) {
                    const value = this.getFieldValue(field.id, formData);
                    
                    // Debug logging for consent fields
                    if (field.id.includes('Consent') || section.title === 'Consent') {
                        console.log(`Validating field: ${field.id}, value: "${value}", required: ${field.required}`);
                    }
                    
                    if (!value || value.trim() === '') {
                        this.showFieldError(field.id, 'This field is required');
                        isValid = false;
                    } else if (field.type === 'email' && !this.isValidEmail(value)) {
                        this.showFieldError(field.id, 'Please enter a valid email address');
                        isValid = false;
                    } else if (field.type === 'tel' && !this.isValidPhone(value)) {
                        this.showFieldError(field.id, 'Please enter a valid phone number');
                        isValid = false;
                    }
                }
            });
        });
        
        return isValid;
    }
    
    isFieldHidden(fieldId) {
        const field = document.querySelector(`[data-field-id="${fieldId}"]`);
        return field && field.classList.contains('field-hidden');
    }
    
    getFieldValue(fieldId, formData) {
        // Handle different field types
        const field = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!field) return '';
        
        // Check if this is a checkbox group
        const checkboxGroup = field.querySelector('.checkbox-group');
        if (checkboxGroup) {
            const checkboxes = field.querySelectorAll('input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(cb => cb.value).join(', ');
        }
        
        // Check if this is a radio group
        const radioGroup = field.querySelector('.radio-group');
        if (radioGroup) {
            const radio = field.querySelector('input[type="radio"]:checked');
            return radio ? radio.value : '';
        }
        
        // Handle regular inputs
        const input = field.querySelector('.field-input');
        if (!input) return '';
        
        if (input.type === 'checkbox') {
            return input.checked ? input.value : '';
        } else if (input.type === 'radio') {
            const radio = field.querySelector('input[type="radio"]:checked');
            return radio ? radio.value : '';
        } else {
            return input.value;
        }
    }
    
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`error-${fieldId}`);
        const field = document.querySelector(`[data-field-id="${fieldId}"]`);
        
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        if (field) {
            // For checkbox and radio groups, highlight the container
            const inputContainer = field.querySelector('.checkbox-group, .radio-group');
            if (inputContainer) {
                inputContainer.classList.add('error');
            } else {
                // For regular inputs
                const inputElement = field.querySelector('.field-input');
                if (inputElement) {
                    inputElement.classList.add('error');
                }
            }
        }
    }
    
    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`error-${fieldId}`);
        const field = document.querySelector(`[data-field-id="${fieldId}"]`);
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        if (field) {
            // Clear error from checkbox and radio groups
            const inputContainer = field.querySelector('.checkbox-group, .radio-group');
            if (inputContainer) {
                inputContainer.classList.remove('error');
            } else {
                // Clear error from regular inputs
                const inputElement = field.querySelector('.field-input');
                if (inputElement) {
                    inputElement.classList.remove('error');
                }
            }
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10;
    }
    
    async submitForm() {
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Submit to Formspree
            const response = await this.submitToFormspree(formData);
            
            if (response.ok) {
                console.log('Form submitted successfully to Formspree');
                this.showSuccessModal();
                this.formElement.reset();
                this.resetConditionalFields();
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('There was an error submitting the form. Please try again.');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async submitToFormspree(formData) {
        // Create FormData object for Formspree
        const formDataForSubmission = new FormData();
        
        // Add form fields to FormData
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                formDataForSubmission.append(key, formData[key]);
            }
        });
        
        // Add additional metadata
        formDataForSubmission.append('_subject', 'New Youth Registration - CDM Tower of Prayer');
        formDataForSubmission.append('_cc', ''); // Add CC emails if needed
        formDataForSubmission.append('_replyto', formData.email || '');
        
        // If you don't have a Formspree endpoint yet, we'll simulate the submission
        if (this.formspreeEndpoint.includes('YOUR_FORM_ID')) {
            console.log('Formspree endpoint not configured. Simulating submission...');
            console.log('Form data that would be submitted:', Object.fromEntries(formDataForSubmission));
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Return a mock successful response
            return { ok: true, status: 200 };
        }
        
        // Actual Formspree submission
        return await fetch(this.formspreeEndpoint, {
            method: 'POST',
            body: formDataForSubmission,
            headers: {
                'Accept': 'application/json'
            }
        });
    }
    
    resetConditionalFields() {
        // Reset conditional fields visibility
        document.querySelectorAll('[data-depends-on]').forEach(field => {
            field.classList.add('field-hidden');
        });
        
        // Clear all errors
        document.querySelectorAll('.field-error').forEach(error => error.textContent = '');
        document.querySelectorAll('.field-input').forEach(input => input.classList.remove('error'));
        document.querySelectorAll('.checkbox-group').forEach(group => group.classList.remove('error'));
        document.querySelectorAll('.radio-group').forEach(group => group.classList.remove('error'));
        
        // Manually clear all checkboxes and radio buttons
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    }
    
    showErrorMessage(message) {
        // Create and show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="close-error">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    collectFormData() {
        const formData = {};
        const form = new FormData(this.formElement);
        
        // Collect all form data including checkboxes
        this.formData.sections.forEach(section => {
            section.fields.forEach(field => {
                if (!this.isFieldHidden(field.id)) {
                    formData[field.id] = this.getFieldValue(field.id, form);
                }
            });
        });
        
        return formData;
    }
    
    showSuccessModal() {
        this.successModal.style.display = 'block';
    }
    
    resetForm() {
        if (confirm('Are you sure you want to clear all form data?')) {
            this.formElement.reset();
            
            // Clear all errors
            document.querySelectorAll('.field-error').forEach(error => error.textContent = '');
            document.querySelectorAll('.field-input').forEach(input => input.classList.remove('error'));
            document.querySelectorAll('.checkbox-group').forEach(group => group.classList.remove('error'));
            document.querySelectorAll('.radio-group').forEach(group => group.classList.remove('error'));
            
            // Manually clear all checkboxes and radio buttons (including in groups)
            document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
            document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
            
            // Reset conditional fields
            document.querySelectorAll('[data-depends-on]').forEach(field => {
                field.classList.add('field-hidden');
            });
        }
    }
}

// Global functions for section toggling and modal control
function toggleSection(index) {
    const content = document.getElementById(`content-${index}`);
    const toggle = document.getElementById(`toggle-${index}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'grid';
        toggle.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        toggle.style.transform = 'rotate(0deg)';
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicFormGenerator();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('success-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to first error field
    const style = document.createElement('style');
    style.textContent = `
        html {
            scroll-behavior: smooth;
        }
    `;
    document.head.appendChild(style);
});
