# Mesh Map 
Mesh Map is a web based application useful to view who are connected to the mesh and what is his node position in map,
it also shows additional information for each node.

# Requirements
The application requires at least a simple web server capable of host HTML doxcuments. For a live view the viewer must have access to the local mesh.

# How to install 
You can host this application on your prefered Web Server.

Please follow this general steps to install:
1. Clone the repository.
2. Install the supporting libraries using 'npm install'.
3. Build the application using 'npm run build'.
4. Copy the applications (which is now a simple group of static files) from the 'build' directory to your web server.

# Configuration
The application is configured by modifying the 'appConfig.json' file. The default configuraiton is for the Bay Area AREDN mesh.
To change the configuration:

1. Open 'public/appConfig.json'.
2. Edit the settings. The defaults look something like this:
```
{     
    "name" : "BayArea AREDN",
    "mapSettings": {
        "zoom": "10",
        "mapCenter": {
            "node": "kn6plv-brkoxfla-omni",
            "lat": "37.8880",
            "lon": "-122.2679"
        },
        "servers": [
            { "test": "http://kn6plv-tiles.local.mesh/tile/10/164/395.png", "url": "http://kn6plv-tiles.local.mesh/tile/{z}/{x}/{y}.png" },
            { "test": "https://c.tile.openstreetmap.org/10/162/395.png", "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }
        ]
    },
    "contactInfo": {
        "callsign" : "KN6PLV",
        "name": "Tim Wilkinson",
        "email": "tim.j.wilkinson@gmail.com"
    },
    "nodesFilter" : "[a-zA-z]+[0-9][a-zA-Z]+"
}
```

# About Developer 
Mesh Map was originally developed by KP4MSR but has been extensively rewritten by KN6PLV (tim.j.wilkinson@gmail.com)
