/* Tamil/Sinhala dictionary, loaded on demand by lib/i18n.js. */
import t1 from '../data/translations/t1.js';
import t2 from '../data/translations/t2.js';
import t3 from '../data/translations/t3.js';
import t4 from '../data/translations/t4.js';
import t6 from '../data/translations/t6.js';
import t7 from '../data/translations/t7.js';
import t8 from '../data/translations/t8.js';

export function buildDict(norm) {
  const dict = { ta: new Map(), si: new Map() };
  for (const [en, ta, si] of [...t1, ...t2, ...t3, ...t4, ...t6, ...t7, ...t8]) {
    const key = norm(en);
    if (ta) dict.ta.set(key, ta);
    if (si) dict.si.set(key, si);
  }
  return dict;
}
