import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import WorkOSProvider from '../integrations/workos/provider'
import ConvexProvider from '../integrations/convex/provider'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Multimedium — Visual Learning' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <WorkOSProvider>
          <ConvexProvider>
            {children}
          </ConvexProvider>
        </WorkOSProvider>
        <Scripts />
      </body>
    </html>
  )
}
