import main from '../dist/main.js';

export default async function handler(req, res) {
  const appHandler = main.default || main;
  return appHandler(req, res);
}
