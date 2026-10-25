import { I18nProvider, useI18n } from './i18n'
import { SmoothScrollProvider } from './lib/scroll'
import { OrderProvider } from './lib/order'
import { DynamicIsland } from './components/DynamicIsland'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { MenuSection } from './components/MenuSection'
import { Booking } from './components/Booking'
import { Location } from './components/Location'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { OrderPanel } from './components/OrderPanel'
import { AddedToast } from './components/AddedToast'

function Shell() {
  const { copy } = useI18n()

  return (
    <>
      <a
        href="#main"
        className="absolute top-2 left-4 z-[100] -translate-y-24 rounded-xs bg-brass px-4 py-2 text-sm font-medium text-ink transition-transform focus-visible:translate-y-0"
      >
        {copy.nav.skip}
      </a>

      <DynamicIsland />

      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <MenuSection />
        <Booking />
        <Location />
        <Contact />
      </main>

      <Footer />
      <OrderPanel />
      <AddedToast />
    </>
  )
}

export function App() {
  return (
    <I18nProvider>
      <SmoothScrollProvider>
        <OrderProvider>
          <Shell />
        </OrderProvider>
      </SmoothScrollProvider>
    </I18nProvider>
  )
}
