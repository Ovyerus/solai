import { initTheme } from './theme.js';

const status = document.querySelector('#downloads-status');
const variantLabels = [...document.querySelectorAll('[data-download-variant]')];
const formatLinks = [...document.querySelectorAll('[data-download-format]')];
const webLinks = [...document.querySelectorAll('[data-download-web]')];
const selectedLinks = [...formatLinks, ...webLinks];
const fixedLinks = selectedLinks.map(link => ({ link, href: link.getAttribute('href') }));
const fixedName = variantLabels[0].textContent;
const fixedFileLabels = [...document.querySelectorAll('[data-download-file-label]')].map(label => ({ label, text: label.textContent }));

function showUnavailable() {
  for (const { link, href } of fixedLinks) link.setAttribute('href', href);
  for (const label of variantLabels) label.textContent = fixedName;
  for (const { label, text } of fixedFileLabels) label.textContent = text;
  status.textContent = 'Appearance controls are unavailable. Selected-file links remain fixed to Tide Dark, regardless of the page’s appearance. All-theme packages still contain every flavour and mode.';
}

try {
  const manifest = JSON.parse(document.querySelector('#download-manifest').textContent);

  initTheme({
    onChange({ flavour, mode }) {
      const variant = manifest.variants.find(item => item.flavor === flavour && item.mode === mode);
      const files = formatLinks.map(link => {
        const format = manifest.formats.find(item => item.id === link.dataset.downloadFormat);
        const file = format.variants.find(item => item.flavor === flavour && item.mode === mode);
        const label = link.querySelector('[data-download-file-label]');
        return { link, href: file.href, label, text: file.label || label.dataset.downloadLabelFallback };
      });
      const webFiles = webLinks.map(link => ({ link, href: variant.downloads[link.dataset.downloadWeb] }));

      for (const { link, href } of [...files, ...webFiles]) link.setAttribute('href', href);
      for (const { label, text } of files) label.textContent = text ? ` · ${text}` : '';
      for (const label of variantLabels) label.textContent = variant.name;
      status.textContent = 'Selected-file links match the appearance controls. Choose a flavour and Light or Dark in the header; all-theme packages always contain every variant.';
    },
    onError: showUnavailable,
  });
} catch (error) {
  showUnavailable();
}
