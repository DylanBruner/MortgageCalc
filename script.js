// Constants
const MONTHLY_INTEREST_RATE = 0.0625 / 12;
const DOWN_PAYMENT_PERCENT = 0.03;
const LOAN_YEARS = 30;
const TAXES_PER_YEAR = 3600;
const INSURANCE_PER_YEAR = 1200;
const MI_TAX_PERCENTAGE = 0.0055;

// DOM Elements
const homePriceInput = document.getElementById('homePrice');
const interestRateInput = document.getElementById('interestRate');
const downPaymentPercentInput = document.getElementById('downPaymentPercent');
const loanYearsInput = document.getElementById('loanYears');
const taxesPerYearInput = document.getElementById('taxesPerYear');
const insurancePerYearInput = document.getElementById('insurancePerYear');
const miTaxPercentageInput = document.getElementById('miTaxPercentage');
const numberOfPeopleInput = document.getElementById('numberOfPeople');
const piOverrideEnabledInput = document.getElementById('piOverrideEnabled');
const piOverrideInput = document.getElementById('piOverride');
const piResult = document.getElementById('piResult');
const totalResult = document.getElementById('totalResult');
const shareButton = document.getElementById('shareButton');
const shareLink = document.getElementById('shareLink');
const additionalCostsToggle = document.getElementById('additionalCostsToggle');
const additionalCostsContent = document.getElementById('additionalCostsContent');
const loanDetailsToggle = document.getElementById('loanDetailsToggle');
const loanDetailsContent = document.getElementById('loanDetailsContent');
const resultsContainer = document.querySelector('.results');
let individualShareSection = document.querySelector('.individual-share');

// Store the individual share section HTML for later use
const individualShareHTML = individualShareSection.outerHTML;

// Error message display
function showError(element, message) {
    element.textContent = message;
    element.classList.add('error');
}

function clearError(element) {
    element.classList.remove('error');
}

// Validate inputs
function validateInputs() {
    const errors = [];
    
    if (!homePriceInput.value || homePriceInput.value <= 0) {
        errors.push('Please enter a valid home price');
    }
    
    if (!interestRateInput.value || interestRateInput.value <= 0) {
        errors.push('Please enter a valid interest rate');
    }
    
    if (!downPaymentPercentInput.value || downPaymentPercentInput.value < 0) {
        errors.push('Please enter a valid down payment percentage');
    }
    
    if (!loanYearsInput.value || loanYearsInput.value <= 0) {
        errors.push('Please enter a valid loan term');
    }
    
    if (!numberOfPeopleInput.value || numberOfPeopleInput.value <= 0) {
        errors.push('Please enter a valid number of people');
    }
    
    return errors;
}

// Load saved values from localStorage or URL parameters
function loadSavedValues() {
    const urlParams = new URLSearchParams(window.location.search);
    const inputs = [
        'homePrice',
        'interestRate',
        'downPaymentPercent',
        'loanYears',
        'taxesPerYear',
        'insurancePerYear',
        'miTaxPercentage',
        'numberOfPeople',
        'piOverride'
    ];

    inputs.forEach(input => {
        const savedValue = urlParams.get(input) || localStorage.getItem(input);
        if (savedValue) {
            document.getElementById(input).value = savedValue;
        }
    });

    // Load P&I override checkbox state
    const piOverrideEnabled = urlParams.get('piOverrideEnabled') || localStorage.getItem('piOverrideEnabled');
    if (piOverrideEnabled === 'true') {
        piOverrideEnabledInput.checked = true;
        piOverrideInput.disabled = false;
    }

    // Load dropdown states
    const additionalCostsExpanded = localStorage.getItem('additionalCostsExpanded') === 'true';
    const loanDetailsExpanded = localStorage.getItem('loanDetailsExpanded') !== 'false'; // Default to true

    if (additionalCostsExpanded) {
        additionalCostsToggle.classList.add('active');
        additionalCostsContent.classList.add('show');
    }

    if (loanDetailsExpanded) {
        loanDetailsToggle.classList.add('active');
        loanDetailsContent.classList.add('show');
    }

    // Update individual share visibility
    updateIndividualShareVisibility();
}

// Calculate mortgage
function calculateMortgage() {
    const errors = validateInputs();
    if (errors.length > 0) {
        return { error: errors[0] };
    }

    try {
        const homePrice = parseFloat(homePriceInput.value);
        const monthlyInterestRate = parseFloat(interestRateInput.value) / 100 / 12;
        const downPaymentPercent = parseFloat(downPaymentPercentInput.value) / 100;
        const loanYears = parseFloat(loanYearsInput.value);
        const taxesPerYear = parseFloat(taxesPerYearInput.value) || 0;
        const insurancePerYear = parseFloat(insurancePerYearInput.value) || 0;
        const miTaxPercentage = parseFloat(miTaxPercentageInput.value) / 100 || 0;
        const numberOfPeople = parseFloat(numberOfPeopleInput.value);
        const piOverrideEnabled = piOverrideEnabledInput.checked;
        const piOverride = parseFloat(piOverrideInput.value) || 0;

        let pi;
        if (piOverrideEnabled && piOverride > 0) {
            // Use the override value
            pi = piOverride;
        } else {
            // Calculate P&I normally
            const pp = homePrice * (1 - downPaymentPercent);
            const totalPayments = loanYears * 12;
            pi = pp * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
                 (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
        }

        const taxes = taxesPerYear / 12;
        const insurance = insurancePerYear / 12;
        const pp = homePrice * (1 - downPaymentPercent);
        const miTaxes = (pp * miTaxPercentage) / 12;

        const total = pi + taxes + miTaxes + insurance;
        const individual = total / numberOfPeople;

        return {
            pi: pi.toFixed(2),
            total: total.toFixed(2),
            individual: individual.toFixed(2)
        };
    } catch (error) {
        return { error: 'Unable to calculate mortgage. Please check your inputs.' };
    }
}

// Update results display
function updateResults() {
    const results = calculateMortgage();
    
    if (results.error) {
        showError(piResult, results.error);
        showError(totalResult, '—');
        const individualResult = document.getElementById('individualResult');
        if (individualResult) {
            showError(individualResult, '—');
        }
        return;
    }
    
    clearError(piResult);
    clearError(totalResult);
    piResult.textContent = `$${results.pi}`;
    totalResult.textContent = `$${results.total}`;
    
    // Update individual share if it exists
    const individualResult = document.getElementById('individualResult');
    if (individualResult) {
        clearError(individualResult);
        individualResult.textContent = `$${results.individual}`;
    }
    
    updateIndividualShareVisibility();
}

// Update individual share visibility
function updateIndividualShareVisibility() {
    const numberOfPeople = parseFloat(numberOfPeopleInput.value);
    const existingIndividualShare = document.querySelector('.individual-share');
    const results = calculateMortgage();
    
    if (numberOfPeople > 1) {
        if (!existingIndividualShare) {
            resultsContainer.insertAdjacentHTML('beforeend', individualShareHTML);
            const newIndividualResult = document.getElementById('individualResult');
            if (results.error) {
                showError(newIndividualResult, '—');
            } else {
                newIndividualResult.textContent = `$${results.individual}`;
            }
        }
    } else {
        if (existingIndividualShare) {
            existingIndividualShare.remove();
        }
    }
}

// Save to localStorage
function saveToLocalStorage() {
    const inputs = [
        'homePrice',
        'interestRate',
        'downPaymentPercent',
        'loanYears',
        'taxesPerYear',
        'insurancePerYear',
        'miTaxPercentage',
        'numberOfPeople',
        'piOverride'
    ];

    inputs.forEach(input => {
        localStorage.setItem(input, document.getElementById(input).value);
    });

    // Save P&I override checkbox state
    localStorage.setItem('piOverrideEnabled', piOverrideEnabledInput.checked.toString());
}

// Generate share link
function generateShareLink() {
    const url = new URL(window.location.href);
    const inputs = [
        'homePrice',
        'interestRate',
        'downPaymentPercent',
        'loanYears',
        'taxesPerYear',
        'insurancePerYear',
        'miTaxPercentage',
        'numberOfPeople',
        'piOverride'
    ];

    inputs.forEach(input => {
        url.searchParams.set(input, document.getElementById(input).value);
    });

    // Add P&I override checkbox state to URL
    url.searchParams.set('piOverrideEnabled', piOverrideEnabledInput.checked.toString());

    return url.toString();
}

// Toggle dropdown sections
function toggleDropdown(toggle, content, storageKey) {
    toggle.classList.toggle('active');
    content.classList.toggle('show');
    localStorage.setItem(storageKey, content.classList.contains('show'));
}

// Event Listeners
const inputs = [
    homePriceInput,
    interestRateInput,
    downPaymentPercentInput,
    loanYearsInput,
    taxesPerYearInput,
    insurancePerYearInput,
    miTaxPercentageInput,
    numberOfPeopleInput,
    piOverrideInput
];

inputs.forEach(input => {
    input.addEventListener('input', () => {
        updateResults();
        saveToLocalStorage();
    });
});

// P&I Override checkbox event listener
piOverrideEnabledInput.addEventListener('change', () => {
    piOverrideInput.disabled = !piOverrideEnabledInput.checked;
    if (piOverrideEnabledInput.checked && !piOverrideInput.value) {
        // If enabling override but no value set, calculate current P&I and set it
        const results = calculateMortgage();
        if (!results.error) {
            piOverrideInput.value = results.pi;
        }
    }
    updateResults();
    saveToLocalStorage();
});

additionalCostsToggle.addEventListener('click', () => {
    toggleDropdown(additionalCostsToggle, additionalCostsContent, 'additionalCostsExpanded');
});

loanDetailsToggle.addEventListener('click', () => {
    toggleDropdown(loanDetailsToggle, loanDetailsContent, 'loanDetailsExpanded');
});

shareButton.addEventListener('click', () => {
    const shareUrl = generateShareLink();
    navigator.clipboard.writeText(shareUrl).then(() => {
        const originalText = shareButton.textContent;
        shareButton.textContent = 'Copied!';
        setTimeout(() => {
            shareButton.textContent = originalText;
        }, 2000);
    });
});

// Initialize
loadSavedValues();
updateResults();

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const basePath = '/MortgageCalc/';
        navigator.serviceWorker.register('sw.js', {
            scope: basePath
        })
        .then(registration => {
            console.log('ServiceWorker registration successful with scope:', registration.scope);
        })
        .catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
} 