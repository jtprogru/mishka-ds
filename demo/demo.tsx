import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Badge,
  Breadcrumbs,
  BusinessCard,
  Deck,
  Callout,
  CodeBlock,
  Collapse,
  CompactCard,
  Container,
  CtaCard,
  Grid,
  Icon,
  Kbd,
  PageHeader,
  PostCard,
  ProjectCard,
  Prose,
  Quote,
  RefreshBanner,
  SectionTitle,
  SiteFooter,
  SiteHeader,
  SlideBullets,
  SlideCover,
  SlideFact,
  SlideOutro,
  SlideQuote,
  SlideSection,
  SlideStatement,
  SlideTwoCols,
  Tag,
  ThemeProvider,
  ThinPlace,
  type CalloutType,
  type Theme,
} from '../src/index';

const calloutTypes: CalloutType[] = ['note', 'tip', 'important', 'warn', 'danger'];

const sample = `apiVersion: v1
kind: Pod
metadata:
  name: mishka
spec:
  containers:
    - name: app
      image: ghcr.io/jtprogru/mishka:0.1.0`;

/** Одна колонка витрины. Рендерится дважды — в светлой и тёмной теме. */
function Showcase({ theme }: { theme: Theme }) {
  return (
    <ThemeProvider mode="scoped" theme={theme} className="showcase">
      <SiteHeader
        scrolled
        nav={[
          { label: 'Записи', href: '#', active: true },
          { label: 'Проекты', href: '#' },
          { label: 'Об авторе', href: '#' },
        ]}
      />
      <Container>
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '#' },
            { label: 'Дизайн-система', href: '#' },
            { label: theme === 'light' ? 'Светлая тема' : 'Тёмная тема' },
          ]}
        />

        <PageHeader
          kicker="mishka-ds 0.1.0"
          title="Мишка на сервере"
          lede="Токены, шрифты и компоненты одной системы: блог, резюме, презентации, схемы."
          meta={`тема: ${theme}`}
        />

        <RefreshBanner>Собрано из hugo-mishka, BRANDING 0.2.</RefreshBanner>

        <SectionTitle>Врезки</SectionTitle>
        {calloutTypes.map((type) => (
          <Callout key={type} type={type} title={type}>
            <p>
              Смысл несут иконка и заголовок, а не только цвет. Ссылка внутри — <a href="#">вот такая</a>, а
              команда — <code>kubectl get pods</code>.
            </p>
          </Callout>
        ))}

        <SectionTitle>Код и клавиши</SectionTitle>
        <CodeBlock lang="yaml" code={sample} />
        <Prose>
          <p>
            Свернуть панель — <Kbd keys="Cmd+Shift+P" />, режим чтения — <Kbd keys={['f']} />.
          </p>
        </Prose>
        <Collapse summary="Длинный вывод команды">
          <CodeBlock lang="bash" code="$ hugo --gc --minify\nStart building sites …\nTotal in 842 ms" copyable={false} />
        </Collapse>

        <SectionTitle>Цитаты</SectionTitle>
        <Prose>
          <Quote cite="из постмортема">
            <p>Митигируй раньше, чем чинишь. Root cause подождёт, пользователи — нет.</p>
          </Quote>
        </Prose>
        <ThinPlace author="«Трон», 1982">
          <p>Я сражаюсь за пользователей.</p>
        </ThinPlace>

        <SectionTitle>Пилюли</SectionTitle>
        <p style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Tag href="#">sre</Tag>
          <Tag href="#">kubernetes</Tag>
          <Tag variant="category" href="#" color="#d20f39">
            SRE
          </Tag>
          <Tag variant="category" href="#" color="#8839ef">
            DevOps
          </Tag>
          <Tag variant="cloud" href="#" count={14}>
            observability
          </Tag>
          <Badge variant="pinned">★</Badge>
        </p>

        <SectionTitle>Карточки постов</SectionTitle>
        <PostCard
          pinned
          title="Burn-rate — что тут не так"
          href="#"
          date="2026-03-14 · 9 минут"
          excerpt="Скорость сгорания бюджета ошибок — не скорость. Разбираем размерность и почему 14.4× это не «в 14 раз быстрее»."
          categories={[{ label: 'SRE', href: '#', color: '#d20f39' }]}
        />
        <PostCard
          title="Зрелость DIS без религии"
          href="#"
          date="2026-02-02 · 12 минут"
          excerpt="Модель зрелости полезна ровно до того момента, когда её начинают защищать вместо того, чтобы применять."
          categories={[{ label: 'DevOps', href: '#', color: '#8839ef' }]}
        />

        <SectionTitle>Проекты</SectionTitle>
        <Grid>
          <ProjectCard name="srekit" href="#" lang="Go" status="featured" description="CLI для SRE-артефактов: постмортемы, runbook'и, SLO." />
          <ProjectCard name="hostsctl" href="#" lang="Rust" description="Управление /etc/hosts из терминала." />
          <ProjectCard name="old-thing" href="#" lang="Python" status="maintenance" description="Живёт, но новых фич не будет." />
          <ProjectCard name="dead-thing" href="#" lang="Perl" status="archived" description="Закрыт, оставлен для истории." />
        </Grid>

        <SectionTitle>Свежее</SectionTitle>
        <Grid variant="two">
          <CompactCard title="Как я перестал бояться и полюбил error budget" href="#" meta="2026-01-20" />
          <CompactCard title="IndexNow за один вечер" href="#" meta="2025-12-11" />
        </Grid>

        <SectionTitle>Палитра графиков</SectionTitle>
        <Prose>
          <p>
            Восемь серий, порядок посчитан на максимум различимости соседей. Цвет всегда дублируется
            подписью: одной яркости тут недостаточно.
          </p>
        </Prose>
        <div style={{ display: 'flex', gap: 'var(--gap-xs)', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              style={{
                flex: '1 1 60px',
                padding: 'var(--gap-xs) var(--gap-sm)',
                borderRadius: 'var(--radius-sm)',
                background: `var(--chart-${i})`,
                color: 'var(--bg)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-xs)',
                textAlign: 'center',
              }}
            >
              {i}
            </div>
          ))}
        </div>

        <SectionTitle>Display-шкала для слайдов</SectionTitle>
        <Prose>
          <p>Эти три ступени существуют только для проекции. В вёрстке страницы их не применять.</p>
        </Prose>
        <p style={{ fontSize: 'var(--fs-display-sm)', lineHeight: 'var(--lh-tight)', fontWeight: 700, margin: 0 }}>
          Заголовок раздела
        </p>
        <p
          style={{
            fontSize: 'var(--fs-display-lg)',
            lineHeight: 'var(--lh-tight)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--accent-600)',
          }}
        >
          14.4×
        </p>

        <SectionTitle>Слайды</SectionTitle>
        <Prose>
          <p>Холст 16:9, лейауты повторяют slidev-theme-bear по именам и поведению.</p>
        </Prose>
        <Deck layout="storyboard">
          <SlideCover title="Burn-rate — что тут не так" subtitle="SRE-митап, 20 минут" />
          <SlideSection kicker="акт первый" title="Как было устроено" page="2" />
          <SlideFact value="14.4×" caption="скорость сгорания бюджета за час" page="3" />
          <SlideBullets
            title="Что ломается"
            items={['Размерность метрики теряется', 'Алерт срабатывает поздно', 'Дежурный не понимает порог']}
            page="4"
          />
          <SlideQuote author="из постмортема" page="5">
            <p>Митигируй раньше, чем чинишь.</p>
          </SlideQuote>
          <SlideTwoCols
            title="Было и стало"
            left={<p>Порог на абсолютном числе ошибок. Срабатывает на всплеске и молчит на медленной утечке.</p>}
            right={<p>Порог на скорости сгорания. Одинаково ловит и всплеск, и утечку.</p>}
            page="6"
          />
          <SlideStatement page="7">Надёжность — это фича, а не отдел</SlideStatement>
          <SlideOutro title="Куда дальше" links={['jtprog.ru/burn-rate', 't.me/jtprogru']} page="8" />
        </Deck>

        <SectionTitle>Визитка</SectionTitle>
        <div style={{ display: 'flex', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
          <BusinessCard guides name="Михаил Савин" role="SRE · «Мишка на сервере»" />
          <BusinessCard
            guides
            side="back"
            contacts={['jtprog.ru', 'savinmi.ru', 't.me/jtprogru', 'jtprogru@gmail.com']}
          />
        </div>

        <SectionTitle>Призыв к действию</SectionTitle>
        <CtaCard
          icon={<Icon name="send" size={20} />}
          title="Канал «Мишка на сервере»"
          text="Короткие заметки между постами."
          actionLabel="Подписаться"
          href="#"
        />

      </Container>
      <SiteFooter
        copyright={<>© 2026 Михаил Савин. Тексты — CC BY-NC-SA 4.0.</>}
        commit={{ sha: '2673c50', href: '#' }}
        powered={<>Собрано Hugo и темой mishka</>}
        nav={{ heading: 'Разделы', items: [{ label: 'Архив', href: '#' }, { label: 'Теги', href: '#' }, { label: 'RSS', href: '#' }] }}
        social={{
          heading: 'Связь',
          links: [
            { icon: <Icon name="send" size={20} />, label: 'Telegram', href: '#' },
            { icon: <Icon name="link" size={20} />, label: 'GitHub', href: '#' },
          ],
        }}
      />
    </ThemeProvider>
  );
}

/* По умолчанию обе темы рядом. #light / #dark в адресе оставляют одну —
   так удобнее снимать скриншоты и смотреть тему на узком экране. */
const only = window.location.hash.replace('#', '');
const themes: Theme[] = only === 'light' || only === 'dark' ? [only] : ['light', 'dark'];
window.addEventListener('hashchange', () => window.location.reload());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="split">
      {themes.map((theme) => (
        <Showcase key={theme} theme={theme} />
      ))}
    </div>
  </StrictMode>,
);
