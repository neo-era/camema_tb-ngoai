import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for v in 'ABC':
          for th in ['light','dark']:
            for name,(w,h) in {'doc':(390,844),'ngang':(844,390)}.items():
              for sc in ['home','form']:
                if sc=='form' and (v!='A'): continue
                pg = await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=2)
                await pg.goto(f'file:///home/claude/tbngoai/ui/mock.html?v={v}&theme={th}&screen={sc}')
                await pg.screenshot(path=f'shots/{v}-{sc}-{name}-{th}.png')
                await pg.close()
        await b.close()
asyncio.run(main())
