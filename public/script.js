// script.js
let activeTab = 'file';

function switchTab(tab) {
    activeTab = tab;

    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    const targetButton = document.querySelector(`button[onclick="switchTab('${tab}')"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    const targetContent = document.getElementById(`${tab}-tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

async function generateSummary() {
    const submitBtn = document.getElementById('submit-btn');
    const errorDiv = document.getElementById('error-message');
    const summarySection = document.getElementById('summary-section');
    const summaryText = document.getElementById('summary-text');

    // Reset states
    errorDiv.style.display = 'none';
    summarySection.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generating Summary...';

    try {
        let response;
        const summaryLength = document.getElementById('summary-length').value;

        if (activeTab === 'file') {
            const fileInput = document.getElementById('file-input');
            if (!fileInput.files[0]) {
                throw new Error('Please select a file');
            }

            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('summary_length', summaryLength);

            response = await fetch('http://localhost:8000/summarize', {
                method: 'POST',
                body: formData,
            });
        } else {
            const textInput = document.getElementById('text-input');
            if (!textInput.value.trim()) {
                throw new Error('Please enter some text');
            }

            response = await fetch('http://localhost:8000/summarize/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textInput.value,
                    summary_length: summaryLength,
                }),
            });
        }

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        summaryText.textContent = data.summary;
        summarySection.style.display = 'block';

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Summarize';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    switchTab('file');
});
