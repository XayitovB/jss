document.addEventListener('DOMContentLoaded', function() {
    // Initialize Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    tgApp.expand(); // Expand the web app to take the full screen height
    
    // Apply Telegram theme
    document.documentElement.style.setProperty('--tg-theme-bg-color', tgApp.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tgApp.themeParams.text_color || '#222222');
    document.documentElement.style.setProperty('--tg-theme-button-color', tgApp.themeParams.button_color || '#5288c1');
    
    // Elements
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');
    const statusMessage = document.getElementById('status-message');
    
    // Get recipient ID from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const recipientId = urlParams.get('to');
    
    // API endpoint - this should be configured in a production environment
    // You can also set this dynamically using a <meta> tag in your HTML
    let API_URL = 'https://xayitovb.github.io/jss//api/send';
    const apiUrlMeta = document.querySelector('meta[name="api-url"]');
    if (apiUrlMeta) {
        API_URL = apiUrlMeta.getAttribute('content');
    }
    
    console.log(`API URL: ${API_URL}`);
    console.log(`Recipient ID: ${recipientId}`);
    
    // Character counter
    const MAX_MESSAGE_LENGTH = 1000;
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.innerHTML = `0/${MAX_MESSAGE_LENGTH}`;
    messageInput.parentNode.insertBefore(charCounter, messageInput.nextSibling);
    
    messageInput.addEventListener('input', function() {
        const length = this.value.length;
        charCounter.innerHTML = `${length}/${MAX_MESSAGE_LENGTH}`;
        
        if (length > MAX_MESSAGE_LENGTH) {
            this.value = this.value.substring(0, MAX_MESSAGE_LENGTH);
            charCounter.innerHTML = `${MAX_MESSAGE_LENGTH}/${MAX_MESSAGE_LENGTH}`;
        }
    });
    
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
                    message: message,
                    tg_data: tgApp.initData // For verification on server side
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const data = JSON.parse(errorText);
                    showError(data.error || `Error ${response.status}: ${response.statusText}`);
                } catch (e) {
                    showError(`Error ${response.status}: ${response.statusText}`);
                }
                return;
            }
            
            const data = await response.json();
            
            showSuccess('✅ Message sent successfully!');
            messageForm.reset();
            charCounter.innerHTML = `0/${MAX_MESSAGE_LENGTH}`;
            
            // Close the WebApp after a delay
            setTimeout(() => {
                tgApp.close();
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please try again.');
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
