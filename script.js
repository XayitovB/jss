document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    tgApp.expand(); // Expand the web app to take the full screen height
    
    // Elements
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');
    
    // Get recipient ID from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const recipientId = urlParams.get('to');
    
    // API endpoint
    const API_URL = 'https://yourdomain.com/api/send';
    
    // Check if recipient ID exists
    if (!recipientId) {
        showError('Invalid request: Missing recipient ID');
        messageInput.disabled = true;
        submitBtn.disabled = true;
        return;
    }
    
    // Handle form submission
    messageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        
        if (!message) {
            showError('Please enter a message');
            return;
        }
        
        // Disable form during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: recipientId,
                    message: message
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('✅ Message sent successfully!');
                messageForm.reset();
                
                // Close the WebApp after a delay
                setTimeout(() => {
                    tgApp.close();
                }, 2000);
            } else {
                showError(data.error || 'Failed to send message');
            }
        } catch (error) {
            showError('Network error. Please try again.');
            console.error('Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
    
    // Helper function to show error message
    function showError(message) {
        statusMessage.textContent = message;
        statusMessage.className = 'error';
        statusMessage.classList.remove('hidden');
    }
    
    // Helper function to show success message
    function showSuccess(message) {
        statusMessage.textContent = message;
        statusMessage.className = 'success';
        statusMessage.classList.remove('hidden');
    }
});