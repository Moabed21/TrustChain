import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'default' }) => {
  const { isDark, toggleTheme } = useTheme();

  const styles = {
    default: {
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: 'var(--text-primary)',
    },
    navbar: {
      background: 'rgba(255,255,255,0.1)',
      color: 'var(--hero-text)',
    },
    sidebar: {
      background: 'transparent',
      color: 'var(--sidebar-text)',
      width: '100%',
      justifyContent: 'flex-start',
      borderRadius: '6px',
      padding: '10px 16px',
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: 'none',
        borderRadius: '999px',
        padding: '8px 14px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'all 0.2s',
        ...styles[variant]
      }}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;
