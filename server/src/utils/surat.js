// server/src/utils/surat.js

function getNoUrut(noSuratStr) {
  if (!noSuratStr) {
    return { noUrut: null, message: 'format nomor surat tidak tepat' };
  }

  const dashCount = noSuratStr.split('-').length - 1;

  if (dashCount === 1) {
    const splitOne = noSuratStr.split('-')[1];
    const splitTwo = splitOne.split('.')[0];
    return { noUrut: splitTwo };
  } else if (dashCount > 1) {
    const splitOne = noSuratStr.split('-')[2];
    const match = splitOne.match(/^[a-zA-Z0-9]+/);
    return { noUrut: match ? match[0] : splitOne };
  }

  return { noUrut: null };
}

function replaceNoUrut(noSuratStr, newValue) {
  if (!noSuratStr) return null;

  const parts = noSuratStr.split('-');
  const dashCount = parts.length - 1;
  const newValStr = String(newValue);

  if (dashCount === 1) {
    const subParts = parts[1].split('.');
    subParts[0] = newValStr;
    parts[1] = subParts.join('.');
    return parts.join('-');
  } else if (dashCount > 1) {
    const suffix = parts[2].replace(/^[a-zA-Z0-9]+/, newValStr);
    parts[2] = suffix;
    return parts.join('-');
  }

  return noSuratStr;
}

module.exports = {
  getNoUrut,
  replaceNoUrut
};
