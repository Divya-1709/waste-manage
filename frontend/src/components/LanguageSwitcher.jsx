import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', lang: 'English' },
  { code: 'hi', lang: 'हिंदी' },
  { code: 'ta', lang: 'தமிழ்' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {languages.map((lng) => (
        <button
          key={lng.code}
          style={{ background: i18n.resolvedLanguage === lng.code ? '#0f4c75' : 'transparent', color: i18n.resolvedLanguage === lng.code ? 'white' : '#333', border: '1px solid #0f4c75', borderRadius: '20px', padding: '5px 10px', cursor: 'pointer' }}
          onClick={() => changeLanguage(lng.code)}
          disabled={i18n.resolvedLanguage === lng.code}
        >
          {lng.lang}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;