'use client';

/* eslint-disable @next/next/no-img-element */

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DEMO_QUERY = 'sprint';

const dashboardRecords = [
  {
    id: 'emergency',
    name: 'Emergency Server User',
    detail: 'emergency@passwork.ru',
    path: 'Доступы к серверам',
    marker: 'E',
    tone: 'mint',
    login: 'emergency@passwork.ru',
    password: 'Emergency-demo-2026!',
    urls: ['https://vpn.passwork.ru/', 'https://admin.passwork.ru/emergency'],
    totp: '584 192',
    tags: ['Admin', 'SSH'],
    access: '1 отправленный пароль, 1 ссылка',
    favorite: false,
  },
  {
    id: 'site24x7',
    name: 'Site24x7 Monitoring',
    detail: 'monitoring@passwork.ru',
    path: 'Доступы к серверам',
    marker: '24',
    tone: 'green',
    login: 'monitoring@passwork.ru',
    password: 'Site24x7-demo-2026!',
    urls: ['https://site24x7.com/', 'https://www.site24x7.com/app/login.jsp'],
    totp: '184 650',
    tags: ['Monitoring', 'SaaS'],
    access: '3 отправленных пароля, 2 ссылки',
    favorite: false,
  },
  {
    id: 'perpy',
    name: 'Per.py',
    detail: 'deploy@passwork.ru',
    path: 'Доступы к серверам',
    marker: 'P',
    tone: 'purple',
    login: 'deploy@passwork.ru',
    password: 'Per.py-demo-2026!',
    urls: ['https://pypi.org/', 'https://pypi.org/account/login/'],
    totp: '326 418',
    tags: ['Deploy', 'Python'],
    access: '1 отправленный пароль, 1 ссылка, 2 ярлыка',
    favorite: false,
  },
  {
    id: 'sprinthost',
    name: 'Sprinthost',
    detail: 'user@passwork.ru',
    path: 'Доступы к серверам',
    marker: 'S',
    tone: 'orange',
    login: 'user@passwork.ru',
    password: 'Sprint-demo-2026!',
    urls: ['https://sprinthost.ru/', 'https://cp.sprinthost.ru/auth/login'],
    totp: '203 572',
    tags: ['Admin', 'GIT'],
    access: '2 отправленных пароля, 1 ссылка, 1 ярлык',
    favorite: true,
  },
  {
    id: 'astra',
    name: 'Astra Linux',
    detail: 'admin@passwork.ru',
    path: 'Доступы к серверам',
    marker: 'A',
    tone: 'blue',
    login: 'admin@passwork.ru',
    password: 'Astra-demo-2026!',
    urls: ['https://astralinux.ru/', 'https://lk.astralinux.ru/'],
    totp: '441 028',
    tags: ['Linux', 'Admin'],
    access: '2 отправленных пароля, 2 ссылки, 1 ярлык',
    favorite: false,
  },
] as const;

const AUTO_RECORD_IDS = [
  'emergency',
  'site24x7',
  'perpy',
  'astra',
  'sprinthost',
] as const;

type SearchPhase =
  | 'idle'
  | 'focus'
  | 'typing'
  | 'loading'
  | 'results'
  | 'active'
  | 'selected'
  | 'clearing';

type SearchRecord = (typeof dashboardRecords)[number];
type RecordId = SearchRecord['id'];
type Playback =
  | { kind: 'auto'; epoch: number }
  | { kind: 'record'; id: RecordId; epoch: number };
type CopyField = 'login' | 'password' | 'urlPrimary' | 'urlLogin' | 'totp';

type CopyFeedback = {
  field: CopyField;
} | null;

function resultLabel(count: number) {
  if (count === 1) return '1 результат';
  if (count > 1 && count < 5) return `${count} результата`;
  return `${count} результатов`;
}

function HighlightedName({ record, query }: { record: SearchRecord; query: string }) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const matchIndex = record.name.toLocaleLowerCase('ru').indexOf(normalizedQuery);

  if (!normalizedQuery || matchIndex < 0) return record.name;

  const matchEnd = matchIndex + normalizedQuery.length;

  return (
    <>
      {record.name.slice(0, matchIndex)}
      <mark>{record.name.slice(matchIndex, matchEnd)}</mark>
      {record.name.slice(matchEnd)}
    </>
  );
}

function DashboardStrip({
  sourceY,
  tail = false,
  children,
}: {
  sourceY: number;
  tail?: boolean;
  children?: ReactNode;
}) {
  const style = {
    '--strip-offset': `${-(sourceY / 25.4)}cqi`,
  } as CSSProperties;

  return (
    <div
      className={`dashboard-vault-tree__strip${
        tail ? ' dashboard-vault-tree__strip--tail' : ''
      }`}
      style={style}
    >
      <img
        src="/assets/dashboard.png"
        alt=""
        width="2540"
        height="1530"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

function CopyVisual({
  field,
  feedback,
}: {
  field: CopyField;
  feedback: CopyFeedback;
}) {
  const state = feedback?.field === field ? 'demo' : 'idle';

  return (
    <span className={`dashboard-copy dashboard-copy--${field}`} data-state={state}>
      <span className="dashboard-copy__glyph" />
      <span className="dashboard-copy__tooltip">Копирование…</span>
    </span>
  );
}

export default function DashboardDemo() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SearchPhase>('idle');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [rootOpen, setRootOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>(null);
  const [selectedId, setSelectedId] = useState<RecordId>('sprinthost');
  const [selectionPulseKey, setSelectionPulseKey] = useState(0);
  const [manualAnnouncement, setManualAnnouncement] = useState('');
  const [playback, setPlayback] = useState<Playback>({ kind: 'auto', epoch: 0 });

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');
    if (!normalizedQuery) return [];

    return dashboardRecords.filter((record) =>
      `${record.name} ${record.detail} ${record.path}`
        .toLocaleLowerCase('ru')
        .includes(normalizedQuery),
    );
  }, [query]);

  const visibleMatches = useMemo(() => matches.slice(0, 3), [matches]);
  const selectedRecord = useMemo(
    () =>
      dashboardRecords.find((record) => record.id === selectedId) ??
      dashboardRecords[3],
    [selectedId],
  );
  const showResults =
    query.trim().length > 0 && (phase === 'results' || phase === 'active');
  const isSearchActive =
    phase !== 'idle' && phase !== 'selected' && phase !== 'clearing';

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactQuery = window.matchMedia('(max-width: 720px)');

    const syncPreferences = () => {
      setReduceMotion(motionQuery.matches);
      setIsCompact(compactQuery.matches);

      if (motionQuery.matches || compactQuery.matches) {
        setQuery('');
        setActiveIndex(-1);
        setPhase('idle');
        setRootOpen(true);
        setAdminOpen(true);
        setAuthOpen(true);
        setPasswordVisible(false);
        setCopyFeedback(null);
        setSelectedId('sprinthost');
        setSelectionPulseKey(0);
        setPlayback((current) => ({ kind: 'auto', epoch: current.epoch + 1 }));
      }
    };

    syncPreferences();
    motionQuery.addEventListener('change', syncPreferences);
    compactQuery.addEventListener('change', syncPreferences);

    return () => {
      motionQuery.removeEventListener('change', syncPreferences);
      compactQuery.removeEventListener('change', syncPreferences);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIsInView = entry.intersectionRatio >= 0.15;
        setIsInView(nextIsInView);

        if (!nextIsInView) {
          setPasswordVisible(false);
          setCopyFeedback(null);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => {
      setIsPageVisible(!document.hidden);
      if (document.hidden) {
        setPasswordVisible(false);
        setCopyFeedback(null);
      }
    };

    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    if (!isInView || !isPageVisible) return;
    if ((reduceMotion || isCompact) && playback.kind === 'auto') return;

    let cancelled = false;
    const pendingWaits = new Set<{ timer: number; resolve: () => void }>();

    const wait = (duration: number) =>
      new Promise<void>((resolve) => {
        const pending = { timer: 0, resolve };
        pending.timer = window.setTimeout(() => {
          pendingWaits.delete(pending);
          resolve();
        }, duration);
        pendingWaits.add(pending);
      });

    const selectRecord = (recordId: RecordId) => {
      setSelectedId(recordId);
      setSelectionPulseKey((current) => current + 1);
      setPasswordVisible(false);
      setCopyFeedback(null);
    };

    const playRecord = async (recordId: RecordId) => {
      setSelectedId(recordId);
      setQuery('');
      setActiveIndex(-1);
      setPhase('idle');
      setRootOpen(true);
      setAdminOpen(true);
      setAuthOpen(true);
      setPasswordVisible(false);
      setCopyFeedback(null);

      if (reduceMotion || isCompact) return;

      await wait(650);
      if (cancelled) return;

      setPasswordVisible(true);
      await wait(1250);
      if (cancelled) return;

      setCopyFeedback({ field: 'password' });
      await wait(1050);
      if (cancelled) return;

      setCopyFeedback(null);
      setPasswordVisible(false);
      await wait(650);
      if (cancelled) return;

      setPlayback((current) =>
        current.epoch === playback.epoch
          ? { kind: 'auto', epoch: current.epoch + 1 }
          : current,
      );
    };

    const playAuto = async () => {
      while (!cancelled) {
        setQuery('');
        setActiveIndex(-1);
        setPhase('idle');
        setRootOpen(true);
        setAdminOpen(true);
        setAuthOpen(true);
        setPasswordVisible(false);
        setCopyFeedback(null);
        await wait(700);
        if (cancelled) break;

        setPhase('focus');
        await wait(250);
        if (cancelled) break;

        setPhase('typing');
        for (let index = 1; index <= DEMO_QUERY.length; index += 1) {
          setQuery(DEMO_QUERY.slice(0, index));
          await wait(145);
          if (cancelled) break;
        }
        if (cancelled) break;

        setPhase('loading');
        await wait(220);
        if (cancelled) break;

        setPhase('results');
        await wait(950);
        if (cancelled) break;

        setActiveIndex(0);
        setPhase('active');
        await wait(300);
        if (cancelled) break;

        selectRecord('sprinthost');
        setPhase('selected');
        await wait(1150);
        if (cancelled) break;

        for (const recordId of AUTO_RECORD_IDS) {
          selectRecord(recordId);
          await wait(recordId === 'sprinthost' ? 950 : 820);
          if (cancelled) break;
        }
        if (cancelled) break;

        setAuthOpen(false);
        await wait(600);
        if (cancelled) break;

        setAdminOpen(false);
        await wait(600);
        if (cancelled) break;

        setRootOpen(false);
        await wait(700);
        if (cancelled) break;

        setRootOpen(true);
        await wait(450);
        if (cancelled) break;

        setAdminOpen(true);
        await wait(500);
        if (cancelled) break;

        setAuthOpen(true);
        await wait(800);
        if (cancelled) break;

        setPasswordVisible(true);
        await wait(1300);
        if (cancelled) break;

        setCopyFeedback({ field: 'password' });
        await wait(1150);
        if (cancelled) break;

        setCopyFeedback(null);
        setPasswordVisible(false);
        await wait(450);
        if (cancelled) break;

        setPhase('clearing');
        for (let index = DEMO_QUERY.length - 1; index >= 0; index -= 1) {
          setQuery(DEMO_QUERY.slice(0, index));
          await wait(70);
          if (cancelled) break;
        }
        if (cancelled) break;

        setPhase('idle');
        setActiveIndex(-1);
        await wait(900);
      }
    };

    if (playback.kind === 'record') void playRecord(playback.id);
    else void playAuto();

    return () => {
      cancelled = true;
      pendingWaits.forEach((pending) => {
        window.clearTimeout(pending.timer);
        pending.resolve();
      });
      pendingWaits.clear();
    };
  }, [isCompact, isInView, isPageVisible, playback, reduceMotion]);

  const searchStyle = {
    '--search-length': query.length,
  } as CSSProperties;

  const handleRecordSelect = (recordId: RecordId) => {
    const record = dashboardRecords.find((item) => item.id === recordId);

    setSelectedId(recordId);
    setSelectionPulseKey((current) => current + 1);
    setManualAnnouncement(
      record ? `Открыта запись ${record.name}` : 'Открыта выбранная запись',
    );
    setQuery('');
    setActiveIndex(-1);
    setPhase('idle');
    setPasswordVisible(false);
    setCopyFeedback(null);
    setPlayback((current) => ({
      kind: 'record',
      id: recordId,
      epoch: current.epoch + 1,
    }));
  };

  return (
    <div id="demo" className="dashboard" aria-label="Интерфейс Пассворк">
      <div className="dashboard__backdrop" aria-hidden="true" />
      <div className="dashboard__glass" aria-hidden="true" />
      <div className="dashboard__viewport">
        <div ref={sceneRef} className="dashboard__surface">
          <img
            src="/assets/dashboard.png"
            alt="Интерфейс управления корпоративными доступами в Пассворк"
            width="2540"
            height="1530"
          />

          <div className="dashboard__animation-layer" aria-hidden="true" inert>
            <span className="dashboard-vault-heading-toggle" data-open={rootOpen}>
              <span className="dashboard-vault-chevron" />
            </span>

            <div className="dashboard-vault-tree">
              <div className="dashboard-vault-collapse" data-open={rootOpen}>
                <div className="dashboard-vault-collapse__inner">
                  <DashboardStrip sourceY={784}>
                    <span
                      className="dashboard-vault-row-toggle dashboard-vault-row-toggle--admin"
                      data-open={adminOpen}
                    >
                      <span className="dashboard-vault-chevron" />
                    </span>
                  </DashboardStrip>

                  <div className="dashboard-vault-collapse" data-open={adminOpen}>
                    <div className="dashboard-vault-collapse__inner">
                      <DashboardStrip sourceY={842}>
                        <span
                          className="dashboard-vault-row-toggle dashboard-vault-row-toggle--auth"
                          data-open={authOpen}
                        >
                          <span className="dashboard-vault-chevron" />
                        </span>
                      </DashboardStrip>

                      <div className="dashboard-vault-collapse" data-open={authOpen}>
                        <div className="dashboard-vault-collapse__inner">
                          <DashboardStrip sourceY={900} />
                          <DashboardStrip sourceY={958} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DashboardStrip sourceY={1016} />
                </div>
              </div>

              <DashboardStrip sourceY={1074} tail />
            </div>

            <div className="dashboard-secret">
              {passwordVisible ? (
                <span className="dashboard-secret__value">
                  {selectedRecord.password}
                </span>
              ) : (
                <span className="dashboard-secret__dots">
                  {Array.from({ length: 15 }, (_, index) => (
                    <span key={index} />
                  ))}
                </span>
              )}
            </div>

            <span
              className="dashboard-password-toggle"
              data-visible={passwordVisible}
            >
              <span className="dashboard-password-toggle__eye" />
            </span>

            <CopyVisual field="login" feedback={copyFeedback} />
            <CopyVisual field="password" feedback={copyFeedback} />
            <CopyVisual field="urlPrimary" feedback={copyFeedback} />
            <CopyVisual field="urlLogin" feedback={copyFeedback} />
            <CopyVisual field="totp" feedback={copyFeedback} />

            <div
              className={`dashboard-search dashboard-search--${phase} dashboard-search--autoplay`}
              style={searchStyle}
            >
              <span className="dashboard-search__icon" />
              <input
                className="dashboard-search__input"
                type="search"
                value={query}
                placeholder="Поиск"
                readOnly
                tabIndex={-1}
              />

              {isSearchActive && <span className="dashboard-search__caret" />}
              {phase === 'loading' && <span className="dashboard-search__loader" />}

              {query && phase !== 'loading' && (
                <span className="dashboard-search__clear">
                  <span />
                </span>
              )}

              <div className="dashboard-search__results" hidden={!showResults}>
                <div className="dashboard-search__result-count">
                  {resultLabel(matches.length)}
                </div>

                <div className="dashboard-search__options">
                  {matches.length > 0 ? (
                    visibleMatches.map((record, index) => (
                      <div
                        key={record.id}
                        className="dashboard-search__result"
                        data-active={activeIndex === index}
                      >
                        <span
                          className={`dashboard-search__marker dashboard-search__marker--${record.tone}`}
                        >
                          {record.marker}
                        </span>
                        <span className="dashboard-search__record-copy">
                          <strong>
                            <HighlightedName record={record} query={query} />
                          </strong>
                          <span>{record.detail}</span>
                        </span>
                        <span className="dashboard-search__record-path">
                          {record.path}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-search__empty">Ничего не найдено</div>
                  )}
                </div>

                <div className="dashboard-search__result-footer">
                  <kbd>Enter</kbd>
                  <span>Открыть запись</span>
                </div>
              </div>
            </div>

            <div
              className="dashboard-search__row-pulse"
              data-active={phase === 'selected'}
            />
          </div>

          <div className="dashboard-record-detail-layer" aria-hidden="true">
            <div className="dashboard-record-mask dashboard-record-mask--header">
              <div
                key={`header-${selectedRecord.id}`}
                className="dashboard-record-mask__content dashboard-record-header"
              >
                <div className="dashboard-record-header__title-row">
                  <span
                    className={`dashboard-record-icon dashboard-record-icon--${selectedRecord.tone} dashboard-record-header__icon`}
                  >
                    {selectedRecord.marker}
                  </span>
                  <strong>{selectedRecord.name}</strong>
                  {selectedRecord.favorite && (
                    <span className="dashboard-record-header__favorite">★</span>
                  )}
                </div>
                <div className="dashboard-record-header__access">
                  <strong>Дополнительный доступ:</strong>
                  <span>{selectedRecord.access}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-record-mask dashboard-record-mask--login">
              <span
                key={`login-${selectedRecord.id}`}
                className="dashboard-record-mask__content dashboard-record-value"
              >
                {selectedRecord.login}
              </span>
            </div>

            <div className="dashboard-record-mask dashboard-record-mask--urls">
              <span
                key={`urls-${selectedRecord.id}`}
                className="dashboard-record-mask__content dashboard-record-urls"
              >
                {selectedRecord.urls.map((url) => (
                  <span key={url}>{url}</span>
                ))}
              </span>
            </div>

            <div className="dashboard-record-mask dashboard-record-mask--totp">
              <span
                key={`totp-${selectedRecord.id}`}
                className="dashboard-record-mask__content dashboard-record-value"
              >
                {selectedRecord.totp}
              </span>
            </div>

            <div className="dashboard-record-mask dashboard-record-mask--tags">
              <span
                key={`tags-${selectedRecord.id}`}
                className="dashboard-record-mask__content dashboard-record-tags"
              >
                {selectedRecord.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
            </div>
          </div>

          <div
            className="dashboard-record-picker"
            role="group"
            aria-label="Записи доступов"
          >
            {dashboardRecords.map((record) => {
              const isSelected = selectedId === record.id;

              return (
                <button
                  key={record.id}
                  className="dashboard-record-row"
                  type="button"
                  aria-label={`Открыть запись ${record.name}`}
                  aria-pressed={isSelected}
                  aria-controls="dashboard-record-details"
                  onClick={() => handleRecordSelect(record.id)}
                >
                  {isSelected && (
                    <span
                      key={`${record.id}-${selectionPulseKey}`}
                      className="dashboard-record-row__pulse"
                    />
                  )}
                  <span
                    className={`dashboard-record-icon dashboard-record-icon--${record.tone} dashboard-record-row__icon`}
                    aria-hidden="true"
                  >
                    {record.marker}
                  </span>
                  <span className="dashboard-record-row__name">{record.name}</span>
                </button>
              );
            })}
          </div>

          <span id="dashboard-record-details" className="sr-only">
            Запись {selectedRecord.name}. Логин {selectedRecord.login}. Адреса{' '}
            {selectedRecord.urls.join(', ')}. TOTP {selectedRecord.totp}.
          </span>

          <span className="sr-only" role="status" aria-live="polite">
            {manualAnnouncement}
          </span>
        </div>
      </div>
    </div>
  );
}
