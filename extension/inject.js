(function() {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const url = args[0] instanceof Request ? args[0].url : args[0];

        if (url.includes('backend-api/conversation')) {
            try {
                const clone = response.clone();
                const data = await clone.json();

                if (data && (data.mapping || data.message || data.title)) {
                    console.log("🔥 [V2-ROCKET] Data Detected on URL:", url);
                    window.postMessage({ 
                        type: 'V2_ROCKET_INTERCEPTED', 
                        payload: data 
                    }, '*');
                }
            } catch (err) {}
        }

        return response;
    };

    console.log("🔥 [V2-ROCKET] Interceptor V2.1 ACTIVE");
})();
