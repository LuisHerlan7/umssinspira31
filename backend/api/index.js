export default async function handler(req, res) {
  try {
    let main;
    try {
      main = await import('../dist/main.js');
    } catch (importErr) {
      console.error('Failed to import ../dist/main.js:', importErr);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          error: 'MODULE_IMPORT_FAILED',
          message:
            'Could not load ../dist/main.js. Ensure the build command ran on Vercel.',
          details: String(importErr?.message || importErr),
          stack: importErr?.stack,
        }),
      );
    }

    const appHandler =
      typeof main === 'function'
        ? main
        : typeof main.default === 'function'
        ? main.default
        : typeof main.default?.default === 'function'
        ? main.default.default
        : null;

    if (!appHandler) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          error: 'HANDLER_NOT_FOUND',
          message: 'Handler function could not be extracted from ../dist/main.js',
          mainType: typeof main,
          mainDefaultType: typeof main.default,
        }),
      );
    }

    return await appHandler(req, res);
  } catch (err) {
    console.error('Serverless handler runtime error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        error: 'SERVERLESS_RUNTIME_ERROR',
        details: String(err?.message || err),
        stack: err?.stack,
      }),
    );
  }
}
