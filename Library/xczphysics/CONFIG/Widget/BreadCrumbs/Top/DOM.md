


1. [edge lua widgets now require using widget new](https://community.silverbullet.md/t/edge-lua-widgets-now-require-using-widget-new/1971?u=chenzhu-xie) #community #silverbullet
```space-lua
function myButton(text)
  return widget.new {
    html = "<button>" .. text .. "</button>",
    events = {
      click = function()
        editor.flashNotification("Clicked " .. text)
      end
    }
  }
end
```

${myButton("Button 1")}
${myButton("Button 2")}

3. [hint needed for dom api and tables](https://community.silverbullet.md/t/hint-needed-for-dom-api-and-tables/3408/2?u=chenzhu-xie) #community #silverbullet
4. [external libraries from sb community](https://community.silverbullet.md/t/external-libraries-from-sb-community/3414/15?u=chenzhu-xie) #community #silverbullet
   - [issues](https://github.com/silverbulletmd/silverbullet/issues/1654#issuecomment-3460370420) #github
5. [add Buttons to (Top)Widgets](https://community.silverbullet.md/t/is-there-a-navigate-to-page-command-in-v2/3258/7?u=chenzhu-xie) #community #silverbullet
   - pretty much like: Tana’s botton appied to nodes !!
   - [is there a navigate to page command in v2](https://community.silverbullet.md/t/is-there-a-navigate-to-page-command-in-v2/3258/18?u=chenzhu-xie) #community #silverbullet

1. [Library](https://silverbullet.md/Library/Std/Infrastructure/Library) #silverbullet
2. [Widgets](https://silverbullet.md/Library/Std/Widgets/Widgets) #silverbullet
