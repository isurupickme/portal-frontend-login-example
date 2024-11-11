document.addEventListener("DOMContentLoaded", function() {

    // function to get the tenant name when tenant id is given
    // this will be a network call in a real application
    function getTenantName(tenantId) {
        switch (tenantId) {
            case 't0001':
                return 'PickMe';
            case 't0002':
                return 'Jum Jum';
            default:
                return 'Unknown Tenant';
        }
    }
    // Function to get query parameters
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Get tenant from query parameter
    const tenant = getQueryParam('tenant') || 'default';
    document.getElementById('tenantInfo').textContent = `Tenant: ${getTenantName(tenant)}`;

    // Initialize Keycloak with dynamic realm
    const keycloak = new Keycloak({
        url: 'http://keycloak.local:8080',
        realm: tenant,
        clientId: 'tenant-management-portal-client'
    });

    const outputTextarea = document.getElementById('output');

    function logToTextarea(message) {
        const now = new Date();
        const timestamp = now.toLocaleString();
        outputTextarea.value += `[${timestamp}] ${message}\n`;
    }

    keycloak.init({ 
        onLoad: 'check-sso' 
    }).then(function(authenticated) {
        logToTextarea(authenticated ? 'User is authenticated' : 'User is not authenticated');

        document.getElementById('loginBtn').addEventListener('click', function() {
            logToTextarea('Login button clicked');
            keycloak.login();
        });

        document.getElementById('logoutBtn').addEventListener('click', function() {
            logToTextarea('Logout button clicked');
            keycloak.logout();
        });

        document.getElementById('isLoggedInBtn').addEventListener('click', function() {
            const isLoggedInMessage = keycloak.authenticated ? 'User is logged in' : 'User is not logged in';
            logToTextarea('Is Logged In button clicked: ' + isLoggedInMessage);
            alert(isLoggedInMessage);
        });

        document.getElementById('accessTokenBtn').addEventListener('click', function() {
            if (keycloak.authenticated) {
                logToTextarea('Access Token button clicked: ' + keycloak.token);
                alert('Access Token: ' + keycloak.token);
            } else {
                const notLoggedInMessage = 'User is not logged in';
                logToTextarea('Access Token button clicked: ' + notLoggedInMessage);
                alert(notLoggedInMessage);
            }
        });

        document.getElementById('showParsedTokenBtn').addEventListener('click', function() {
            if (keycloak.authenticated) {
                const parsedToken = keycloak.tokenParsed;
                logToTextarea('Show Parsed Access Token button clicked: ' + JSON.stringify(parsedToken, null, 2));
                alert('Parsed Access Token: ' + JSON.stringify(parsedToken, null, 2));
            } else {
                const notLoggedInMessage = 'User is not logged in';
                logToTextarea('Show Parsed Access Token button clicked: ' + notLoggedInMessage);
                alert(notLoggedInMessage);
            }
        });

        document.getElementById('callApiBtn').addEventListener('click', function() {
            logToTextarea('Call API button clicked');
            if (keycloak.authenticated) {
                fetch('https://4b215443be964e33bc1ef0373940400c.api.mockbin.io/', {
                    headers: {
                        'Authorization': 'Bearer ' + keycloak.token
                    }
                })
                .then(response => response.json())
                .then(data => {
                    logToTextarea('API call successful: ' + JSON.stringify(data));
                    console.log(data);
                })
                .catch(error => {
                    logToTextarea('API call failed: ' + error);
                    console.error('Error:', error);
                });
            } else {
                const notLoggedInMessage = 'User is not logged in';
                logToTextarea('API call failed: ' + notLoggedInMessage);
                alert(notLoggedInMessage);
            }
        });
    }).catch(function() {
        console.log('Failed to initialize');
    });
});


