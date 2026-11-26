# React + TypeScript + Vite + ui.shadcn.com + Tailwind + Routes + Axios + Built-in DarkMode

This template provides a minimal setup to get React working in Vite with more library on pack


# Features
- can be refresh in github Pages and not return 404 page not found
- built in loader but you can change it here https://10015.io/tools/css-loader-generator
- custom not found page
- built in axios,tailwind, dark mode theme and many more kapoy explain kalimot nako


## Installation Steps Process

1. clone this repo
2. cd ./repo name
3. npm install
4. npm run dev

## Deployment Step using github
1. show hidden folder
2. delete the .git folder
3. create a repo in github
5. push everything on github
6. In the vite.config.js file add this line before plugins: [react()],
base: "/YOUR_REPOSITORY_NAME", main.tsx paths to "/YOUR_REPOSITORY_NAME", notFound Link to "/YOUR_REPOSITORY_NAME"
7. In terminal type " npm run deploy"

## Run the complete ETMS system on Windows

Start MySQL first if the backend uses its default MySQL configuration. From the
repository root, run:

```powershell
.\Start-ETMS.ps1
```

The script starts the Django API and Vite frontend in separate terminals, and
reuses either service if it is already listening on its expected port. Open
http://localhost:5173 when both services report ready. If you start the
services manually, run `python manage.py runserver 127.0.0.1:8000` from
`Back-end-Template` and `npm run dev -- --host 127.0.0.1` from
`react-vite-supreme`.