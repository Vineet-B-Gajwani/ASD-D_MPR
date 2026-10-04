const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.view-section');
const toast = document.getElementById('toast');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForms();
    loadDashboardStats();
});

// --- Navigation Logic ---
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active classes
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.add('hidden'));

            // Add active class
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');

            // View specific logic
            if (targetId === 'home-section') loadDashboardStats();
            if (targetId === 'create-shipment-section') loadCustomersForSelect();
            if (targetId === 'view-shipments-section') loadAllShipments();
        });
    });
}

// --- API Helpers ---
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'API Error');
        return data;
    } catch (err) {
        showToast(err.message, true);
        throw err;
    }
}

// --- Forms Initialization ---
function initForms() {
    // Add Customer
    document.getElementById('add-customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('c-name').value,
            address: document.getElementById('c-address').value,
            phone_no: document.getElementById('c-phone').value,
        };
        try {
            await fetchAPI('/customer', 'POST', body);
            showToast('Customer added successfully!');
            e.target.reset();
        } catch(e) {}
    });

    // Create Shipment
    document.getElementById('create-shipment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            user_id: document.getElementById('s-customer').value,
            weight: parseFloat(document.getElementById('s-weight').value),
            shipping_date: document.getElementById('s-date').value,
            status: document.getElementById('s-status').value,
        };
        try {
            const data = await fetchAPI('/shipment', 'POST', body);
            // Additionally add an initial tracking event
            await fetchAPI('/tracking', 'POST', {
                shipment_id: data.shipment_id,
                status_update: 'Shipment Created: ' + body.status
            });
            showToast('Shipment created successfully!');
            e.target.reset();
        } catch(e) {}
    });

    // Track Search Handlers
    document.getElementById('btn-track-search').addEventListener('click', trackShipment);
    document.getElementById('track-id-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') trackShipment();
    });

    // Add Tracking Event
    document.getElementById('add-tracking-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const shipmentId = document.getElementById('tu-shipment-id').value;
        const body = {
            shipment_id: shipmentId,
            status_update: document.getElementById('tu-status').value,
        };
        try {
            await fetchAPI('/tracking', 'POST', body);
            showToast('Tracking event added!');
            e.target.reset();
            // Refresh Tracking View
            await loadTrackingData(shipmentId);
        } catch(e) {}
    });
}

// --- Data Loaders ---

async function loadCustomersForSelect() {
    try {
        const customers = await fetchAPI('/customers');
        const select = document.getElementById('s-customer');
        select.innerHTML = '<option value="" disabled selected>Select a customer...</option>';
        customers.forEach(c => {
            select.innerHTML += `<option value="${c.user_id}">${c.name}</option>`;
        });
    } catch(e) {}
}

async function loadAllShipments() {
    try {
        const shipments = await fetchAPI('/shipments');
        const tbody = document.getElementById('shipments-tbody');
        tbody.innerHTML = '';
        
        shipments.forEach(s => {
            const date = new Date(s.shipping_date).toLocaleDateString();
            const badgeClass = getBadgeClass(s.status);
            
            tbody.innerHTML += `
                <tr>
                    <td>#${s.shipment_id}</td>
                    <td>${s.customer_name}</td>
                    <td>${s.weight}</td>
                    <td>${date}</td>
                    <td><span class="badge ${badgeClass}">${s.status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="goToTrack(${s.shipment_id})">Track</button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {}
}

async function trackShipment() {
    const id = document.getElementById('track-id-input').value;
    if (!id) return;
    await loadTrackingData(id);
}

async function loadTrackingData(id) {
    try {
        const data = await fetchAPI(`/shipment/${id}`);
        document.getElementById('tracking-result').classList.remove('hidden');
        
        // Update summary
        document.getElementById('ts-customer').innerText = `Customer: ${data.shipment.customer_name}`;
        document.getElementById('ts-phone').innerText = `Phone: ${data.shipment.phone_no}`;
        
        const weightSpan = document.getElementById('ts-weight');
        if(weightSpan) weightSpan.innerText = `${data.shipment.weight} kg`;
        
        const dateSpan = document.getElementById('ts-date');
        if(dateSpan) {
            const dateObj = new Date(data.shipment.shipping_date);
            dateSpan.innerText = dateObj.toLocaleDateString();
        }

        updateProgressTrack(data.shipment.status);

        const badgeSpan = document.getElementById('ts-status');
        badgeSpan.innerText = data.shipment.status;
        badgeSpan.className = `badge ${getBadgeClass(data.shipment.status)}`;
        
        // Update hidden id
        document.getElementById('tu-shipment-id').value = data.shipment.shipment_id;

        // Render Timeline
        const timeline = document.getElementById('tracking-timeline');
        timeline.innerHTML = '';
        
        data.events.forEach((event, index) => {
            const dateStr = new Date(event.event_time).toLocaleString();
            timeline.innerHTML += `
                <div class="timeline-item">
                    <div class="timeline-dot" ${index === 0 ? 'style="background-color: var(--primary-color)"' : ''}></div>
                    <div class="timeline-content">
                        <div class="time">${dateStr}</div>
                        <div class="desc">${event.status_update}</div>
                    </div>
                </div>
            `;
        });
        
        if (window.lucide) window.lucide.createIcons();

    } catch(e) {
        document.getElementById('tracking-result').classList.add('hidden');
    }
}

async function loadDashboardStats() {
    try {
        const shipments = await fetchAPI('/shipments');
        let transit = 0;
        let delivered = 0;
        
        shipments.forEach(s => {
            const statusStr = s.status.toLowerCase();
            if (statusStr.includes('transit')) transit++;
            if (statusStr.includes('delivered')) delivered++;
        });
        
        document.getElementById('total-shipments-count').innerText = shipments.length;
        document.getElementById('transit-shipments-count').innerText = transit;
        document.getElementById('delivered-shipments-count').innerText = delivered;
    } catch(e) {}
}

// --- Utility Functions ---

function updateProgressTrack(status) {
    const s = status.toLowerCase();
    
    document.querySelectorAll('.progress-step').forEach(el => el.className = 'progress-step');
    document.querySelectorAll('.progress-line').forEach(el => el.className = 'progress-line');

    const steps = document.querySelectorAll('.progress-step');
    const lines = document.querySelectorAll('.progress-line');
    if (!steps.length) return;

    let currentStep = 1;
    if (s.includes('delivered')) currentStep = 4;
    else if (s.includes('transit')) currentStep = 3;
    else if (s.includes('picked up') || s.includes('courier')) currentStep = 2;
    else currentStep = 1;

    for(let i=0; i<steps.length; i++) {
        if (i < currentStep - 1) {
            steps[i].classList.add('completed');
            if(lines[i]) lines[i].classList.add('completed');
        } else if (i === currentStep - 1) {
            steps[i].classList.add('active');
            if (currentStep === 4) steps[i].classList.add('completed');
        }
    }
}


function showToast(msg, isError = false) {
    toast.innerText = msg;
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function getBadgeClass(status) {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'delivered';
    if (s.includes('transit')) return 'transit';
    if (s.includes('pending')) return 'pending';
    return 'default';
}

function goToTrack(id) {
    // Switch to track section
    document.querySelector('.nav-item[data-target="track-shipment-section"]').click();
    document.getElementById('track-id-input').value = id;
    trackShipment();
}
