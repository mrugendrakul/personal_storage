## Setup.

1. Clone the repo on your old hardware.
2. `cd ./express-backend` in the repo to start the server.
3. do `npm run deploy` to start the backent.
4. `cd ..` to go back
5. `cd ./react-frontend` to go to frontend UI.
6. `npm run build` to build the UI. It will be static and in the dist folder with all index.html and assets.
7. For deploying UI with nginx copy this files to the `/usr/share/nginx/html`
```bash
sudo cp -r dist/* /usr/share/nginx/html
```
8. To remove old ones if any.
```bash
cd /usr/share/nginx/html
sudo rm ./* -rf
```
9. Now setup proxy to call our backend from UI.

### /etc/nginx/conf.d/my-app.conf
```C#
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

# ---- HTTP API Proxy ----
    # Proxies requests from /personal-cloud to your backend
    location /personal-cloud/ {
        # The trailing slash on proxy_pass is crucial.
        # It removes '/personal-cloud' from the path before forwarding.
        proxy_pass http://localhost:3000/;

        # Headers to pass client information to the backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_request_buffering off;
    }

    # ---- WebSocket Proxy ----
    # Proxies requests from /personal-live-cloud for WebSocket connections
    location /personal-live-cloud/ {
        # The trailing slash on proxy_pass also handles the rewrite here.
        proxy_pass http://localhost:3000/;

        # Headers required to upgrade the connection to a WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

10. You can setup https if you want.