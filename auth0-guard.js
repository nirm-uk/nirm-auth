// auth0-guard.js

(async () => {
  try {
    // Initialize Auth0 client
    const auth0 = await createAuth0Client({
      domain: "nirm.uk.auth0.com",
      client_id: "nPJ9Ks5rLkanZ4D6C3Qud5gu5vIkopm6",
      redirect_uri: "https://callback.nirm.uk/"
    });

    // Guard: prevent users from typing Auth0 URLs directly
    if (window.location.hostname.includes("auth0.com")) {
      window.location.href = "https://nirm.uk";
      return;
    }

    // Try to silently get a token if a session exists
    try {
      const token = await auth0.getTokenSilently();
      localStorage.setItem('auth_token', token);
    } catch(err) {
      console.warn("No active session yet — buttons still clickable.");
    }

    // Optional: Add a small indicator for logged-in user (like initials)
    const authButtons = document.querySelectorAll('#auth0-login-buttons a');
    authButtons.forEach(btn => {
      btn.style.pointerEvents = 'auto'; // always clickable
      btn.addEventListener('click', async () => {
        // Optional: can show a small "Redirecting..." tooltip
        btn.textContent = 'Redirecting...';
      });
    });

  } catch (err) {
    console.error("Auth0 client error:", err);
  }
})();
