(() => {
const modules = [
  'polish14_runtime.js',
  'mission15_runtime.js',
  'city16_runtime.js',
  'branch17_runtime.js',
  'sector18_runtime.js',
  'traffic19_runtime.js',
  'traffic20_runtime.js',
  'traffic21_runtime.js',
  'traffic22_runtime.js',
  'traffic23_runtime.js',
  'traffic24_runtime.js',
  'sector25_runtime.js'
];
Promise.all(modules.map(name => fetch(name).then(r => {
  if (!r.ok) throw new Error(`${name} (${r.status})`);
  return r.text();
}))).then(codes => {
  const source = codes.join('\n\n');
  try {
    new Function(source);
  } catch (err) {
    throw new Error(`ordered Build 25 runtime bundle syntax: ${err.message}`);
  }
  eval(source);
}).catch(err => {
  console.error(err);
  const detail = document.getElementById('detail');
  if (detail) detail.textContent = `BUILD 25 RUNTIME BUNDLE ERROR\n${err.message}`;
});
})();
