'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './header-navigation.css';

type NavigationItem = { label: string; description: string; href: string };
type NavigationEntry = { id: string; label: string } & (
  | { href: string; items?: never }
  | { items: readonly NavigationItem[]; href?: never }
);

// Reference menu structure, with live destinations in place of its placeholder links.
const navigation: readonly NavigationEntry[] = [
  { id: 'company', label: 'Компания', items: [
    { label: 'О Пассворке', description: 'Кто мы и как делаем продукт', href: '#company' },
    { label: 'Новости', description: 'События компании и рынка', href: 'https://passwork.ru/blog/tag/news/' },
    { label: 'Дорожная карта', description: 'Что разрабатываем сейчас', href: 'https://passwork.ru/blog/roadmap/' },
    { label: 'Релизы', description: 'История версий и изменения', href: 'https://passwork.ru/blog/release-notes/' },
  ] },
  { id: 'scenarios', label: 'Сценарии', href: '#features' },
  { id: 'resources', label: 'Ресурсы', items: [
    { label: 'Функциональность', description: 'Сейфы, права, аудит и секреты', href: '#features' },
    { label: 'Интеграции', description: 'LDAP, SSO, API и CLI', href: 'https://passwork.ru/manuals/api-integrations/api-overview/' },
    { label: 'Кейсы', description: 'Как внедряют крупные команды', href: 'https://passwork.ru/blog/tag/case-study/' },
    { label: 'Блог', description: 'Практика управления доступами', href: 'https://passwork.ru/blog/' },
  ] },
  { id: 'support', label: 'Поддержка', items: [
    { label: 'Техническая документация', description: 'Установка, API и администрирование', href: 'https://passwork.ru/docs/' },
    { label: 'Руководство пользователя', description: 'Как работать с паролями каждый день', href: 'https://passwork.ru/manuals/' },
    { label: 'Центр поддержки', description: 'Вопросы, заявки и сопровождение', href: 'https://passwork.ru/help/' },
  ] },
  { id: 'pricing', label: 'Цены', href: 'https://passwork.ru/#prices' },
];

export default function HeaderNavigation({
  mobile = false,
  homeHref = '',
  onNavigate,
}: { mobile?: boolean; homeHref?: string; onNavigate?: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<'first' | 'last' | null>(null);
  const id = useId();
  const reduced = useReducedMotion();
  const hrefFor = (href: string) => href.startsWith('#') ? homeHref + href : href;

  const focusLink = useCallback((entry: string, position: 'first' | 'last') => {
    const panel = document.getElementById(`${id}-${entry}-panel`);
    const links = panel?.querySelectorAll<HTMLAnchorElement>('a');
    links?.[position === 'first' ? 0 : links.length - 1]?.focus();
  }, [id]);

  useEffect(() => {
    if (active && pendingFocus.current) {
      focusLink(active, pendingFocus.current);
      pendingFocus.current = null;
    }
    if (!active) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setActive(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [active, focusLink]);

  const navigate = () => { setActive(null); onNavigate?.(); };
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !active) return;
    event.preventDefault();
    event.stopPropagation();
    document.getElementById(`${id}-${active}-trigger`)?.focus();
    setActive(null);
  };

  return <div
    ref={root}
    className={`fh-navigation${mobile ? ' fh-navigation--mobile' : ''}`}
    onKeyDown={handleEscape}
    onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setActive(null);
    }}
  >
    {navigation.map((entry) => !entry.items ? <a
      key={entry.id} className="fh-link fh-navigation-link"
      href={hrefFor(entry.href)} onClick={navigate}
    >{entry.label}</a> : <div className="fh-dropdown" key={entry.id} data-open={active === entry.id}>
      <button
        type="button" className="fh-link fh-dropdown-trigger"
        id={`${id}-${entry.id}-trigger`}
        aria-expanded={active === entry.id}
        aria-controls={`${id}-${entry.id}-panel`}
        onClick={() => setActive(active === entry.id ? null : entry.id)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          const position = event.key === 'ArrowDown' ? 'first' : 'last';
          if (active === entry.id) focusLink(entry.id, position);
          else { pendingFocus.current = position; setActive(entry.id); }
        }}
      >
        {entry.label}
        <svg className="fh-dropdown-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <motion.div
        id={`${id}-${entry.id}-panel`}
        className="fh-dropdown-panel"
        aria-labelledby={`${id}-${entry.id}-trigger`}
        aria-hidden={active !== entry.id}
        inert={active !== entry.id}
        initial={false}
        animate={active === entry.id
          ? { opacity: 1, y: 0, height: 'auto' }
          : { opacity: 0, y: mobile ? 0 : 8, height: mobile ? 0 : 'auto' }}
        transition={reduced ? { duration: 0 } : { duration: .22, ease: [.22, 1, .36, 1] }}
        onKeyDown={(event) => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>('a'));
          const index = links.indexOf(document.activeElement as HTMLAnchorElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
          links[next]?.focus();
        }}
      >
        <ul className="fh-dropdown-surface">
          {entry.items.map((item) => <li key={item.label}>
            <a className="fh-dropdown-link" href={hrefFor(item.href)} onClick={navigate}>
              <span>{item.label}</span>
              <span className="fh-dropdown-description">{item.description}</span>
            </a>
          </li>)}
        </ul>
      </motion.div>
    </div>)}
  </div>;
}
