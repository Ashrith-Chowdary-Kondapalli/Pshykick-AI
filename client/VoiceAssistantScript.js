const sphere = document.querySelector('.sphere');
const cutCallBtn = document.getElementById('cut-btn');
const interfaceTrigger = document.getElementById('interface-trigger');
const muteBtn = document.getElementById('mute-btn');

sphere.addEventListener('mouseenter', () => {
    sphere.setAttribute('data-hovered', 'true');
});

sphere.addEventListener('mouseleave', () => {
    sphere.removeAttribute('data-hovered');
});

cutCallBtn.addEventListener('click', backToMainPage);
muteBtn.addEventListener('click', changeButton);

function backToMainPage() {
    interfaceTrigger.checked = false;
}

function changeButton() {
    const isMuted = muteBtn.getAttribute('data-muted') === 'true';

    if (!isMuted) {
        // --- SWITCH TO MUTED STATE ---
        muteBtn.setAttribute('data-muted', 'true');
        muteBtn.style.backgroundColor = '#5f6368'; // Turn dark grey
        
        // Swap icon to a Muted Microphone (with a slash line)
        muteBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17L12 8.19V5c0-1.66-1.34-3-3-3-.31 0-.6.05-.88.13l6.86 6.86c.02.06.02.12.02.18zm-10.6-8.9L3.11 3.54 7.6 8.03V11c0 2.76 2.24 5 5 5 .74 0 1.43-.16 2.05-.43l3.41 3.41 1.27-1.27L4.38 2.27zM11 21h2c0 .55-.45 1-1 1s-1-.45-1-1zm-6-10H3c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c-3.39-.49-6-3.39-6-6.92z"/>
            </svg>
        `;
    } else {
        // --- SWITCH BACK TO ACTIVE STATE ---
        muteBtn.setAttribute('data-muted', 'false');
        muteBtn.style.backgroundColor = ''; // Resets to original light charcoal CSS color
        
        // Swap icon back to the Standard Microphone
        muteBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 9h2c0 .55-.45 1-1 1s-1-.45-1-1zm6-12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        `;
    }
}