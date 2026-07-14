# Stadar — web client

React + Vite single-page app for **Stadar**. For what the project is, the
architecture, and how the API and client fit together, see the root
[`README.md`](../README.md).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

In dev the client calls the API at `http://localhost:5068` (`API_BASE` in
[`src/utils/api.js`](src/utils/api.js)); override with `VITE_API_URL` if needed.
Start the API separately with `dotnet watch` from [`../Api`](../Api).

`npm run build` outputs to `dist/`, which the .NET API serves from `wwwroot`
in the production container.
