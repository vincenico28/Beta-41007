/**
 * High-fidelity print utility for Workforce Management Pro.
 * Renders printables in an isolated, high-contrast print context to guarantee
 * 100% fidelity with no modal overlays, dark-mode clipping, or backdrop interference.
 */

export interface PrintOptions {
  title?: string
  pageStyle?: string
  landscape?: boolean
  scale?: number
}

export function printHtmlElement(
  element: HTMLElement | string,
  options?: PrintOptions
) {
  const contentHtml = typeof element === 'string' ? element : element.outerHTML
  const title = options?.title || 'WorkForce Pro Document'

  // Collect all link stylesheets and style tags
  const styleNodes: string[] = []
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    styleNodes.push(node.outerHTML)
  })

  // Create isolated hidden iframe
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.zIndex = '-9999'
  iframe.setAttribute('title', title)
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    window.print()
    return
  }

  const customPageStyle = options?.pageStyle || `
    @page {
      size: ${options?.landscape ? 'landscape' : 'portrait'};
      margin: 8mm;
    }
  `

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${styleNodes.join('\n')}
        <style>
          ${customPageStyle}
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          .no-print, button, nav, header, aside, dialog {
            display: none !important;
          }
          .print-area {
            display: block !important;
            margin: 0 auto !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        </style>
      </head>
      <body class="bg-white text-black p-0 m-0">
        <div id="print-root">
          ${contentHtml}
        </div>
      </body>
    </html>
  `

  doc.open()
  doc.write(fullHtml)
  doc.close()

  const executePrint = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch (err) {
      console.error('Error invoking iframe print:', err)
      window.print()
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 2000)
    }
  }

  // Ensure styles & fonts render cleanly
  if (iframe.contentWindow) {
    setTimeout(executePrint, 300)
  } else {
    iframe.onload = () => setTimeout(executePrint, 250)
  }
}
