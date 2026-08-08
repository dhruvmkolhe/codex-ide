/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { getLanguageFooterLabel, getLanguageIcon } from '../languageUtils';
import { render } from '@testing-library/react';

jest.mock('../../languagesData', () => ({
  __esModule: true,
  getLangColor: () => '#f7df1e',
  languageConfig: {
    javascript: { label: 'JavaScript (ES6)', color: '#f7df1e' },
  },
}));

describe('languageUtils utility', () => {
  test('getLanguageFooterLabel should return mapped or configured version strings', () => {
    expect(getLanguageFooterLabel('python')).toBe('Python 3.10');
    expect(getLanguageFooterLabel('javascript')).toBe('JavaScript (ES6)');
    expect(getLanguageFooterLabel('cpp')).toBe('C++ 17');
    expect(getLanguageFooterLabel('custom_unknown_lang')).toBe('custom_unknown_lang');
  });

  test('getLanguageIcon should render brand image or fallback SVG icon', () => {
    const { container } = render(getLanguageIcon('javascript', 24));
    expect(container.firstChild).toBeInTheDocument();
  });
});
