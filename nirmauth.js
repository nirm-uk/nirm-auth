<script src="https://cdn.auth0.com/js/auth0-spa-js/1.31/auth0-spa-js.production.js"></script>
<script>
const WEBHOOK_URL = 'https://hook.eu2.make.com/5yvsvcd5lhfj0fedokmkn8wh39pq9vau';
const INDIVIDUAL_FORM = "https://nirm.uk/formindividual";
const BUSINESS_FORM = "https://nirm.uk/formbusiness";
const HOME_PAGE = "https://nirm.uk";
const INDIVIDUAL_DASH = "https://sapphire.nirm.uk";
const BUSINESS_DASH = "https://business.nirm.uk";

// Tagline teleprompter
const TAGLINE_LINES = [
  "Connecting You to the Best",
  "Your Vision, Our Tech",
  "Your Event, Your Way",
  "Built for You",
  "Powered by SapphireAI, Backed by OpenAI",
  "The Clear Path for Seamless Execution",
  "Your Sourcing Solution",
  "Where Events Meet Innovation"
];
const teleprompter = document.getElementById("teleprompter");
let currentLine = 0;
const TIME_LIMIT = 2 * 60 * 1000;
const lineDuration = TIME_LIMIT / TAGLINE_LINES.length;
function showLine() {
  teleprompter.textContent = TAGLINE_LINES[currentLine];
  currentLine = (currentLine + 1) % TAGLINE_LINES.length;
  setTimeout(showLine, lineDuration);
}
showLine();

// Initialize Auth0 SPA Client
let auth0Client;
async function initAuth0() {
  auth0Client = await createAuth0Client({
    domain: "nirm.uk.auth0.com",
    client_id: "nPJ9Ks5rLkanZ4D6C3Qud5gu5vIkopm6"
  });
}
initAuth0();

// Wait for Auth0 user to be available
async function waitForUser(maxWait = 5000) {
  const interval = 100;
  let waited = 0;
  return new Promise((resolve, reject) => {
    const check = setInterval(async () => {
      if (auth0Client) {
        const user = await auth0Client.getUser();
        if (user && user.sub) {
          clearInterval(check);
          resolve(user);
          return;
        }
      }
      if (waited >= maxWait) {
        clearInterval(check);
        reject('No user found after wait');
      }
      waited += interval;
    }, interval);
  });
}

waitForUser()
  .then(user => initChooserole(user))
  .catch(() => { window.location.href = HOME_PAGE; });

// Main chooserole logic
function initChooserole(user) {
  const existingRole = localStorage.getItem('user_role');
  if (existingRole) {
    if (existingRole === 'individual') window.location.href = INDIVIDUAL_DASH;
    else if (existingRole === 'business') window.location.href = BUSINESS_DASH;
    return;
  }

  if (window.location.search.includes('no_role=true')) {
    sessionStorage.setItem('no_role_redirect', '1');
  }

  if (sessionStorage.getItem('no_role_redirect')) {
    const toast = document.createElement('div');
    toast.textContent = "Hey! Looks like you haven't picked your role yet. Please select one to continue.";
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#001b3e';
    toast.style.color = '#fffcf0';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    toast.style.fontFamily = "'Bricolage Grotesque', sans-serif";
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '1'; }, 100);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 600); }, 5000);
    sessionStorage.removeItem('no_role_redirect');
  }

  function updateRole(role) {
    localStorage.setItem('user_role', role);
    // Send role + user_id to Make.com webhook
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.sub,
        role: role
      })
    })
    .finally(() => {
      window.location.href = (role === 'individual') ? INDIVIDUAL_DASH : BUSINESS_DASH;
    });
  }

  document.getElementById('individual-btn').addEventListener('click', () => updateRole('individual'));
  document.getElementById('business-btn').addEventListener('click', () => updateRole('business'));

  setTimeout(() => console.log("Chooserole page TIME_LIMIT reached."), TIME_LIMIT);
}
</script>
