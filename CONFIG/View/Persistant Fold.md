

## New ver

1. [persistent folding](https://community.silverbullet.md/t/persistent-folding/1945/8?u=chenzhu-xie) #community #silverbullet

```lua
persFold = persFold or {} -- define namespace for persistent fold supporting functions

persFold.marker = "⬇️"

function persFold.lineStart(pageText, pos)
    -- Return the starting position of the line of the current page containing position pos
  
    -- Get the content of the page text up to pos  
    local pageTextToPos = string.sub(pageText, 1, pos)
    -- Reverse it
    local pageTextToPosReversed = string.reverse(pageTextToPos)
    -- Find the number of characters before the first new line character
    local posPositionInLine, _ = string.find(pageTextToPosReversed, "\n")
    
    -- Subtract that number from pos
    --local startOfLine = pos - posPositionInLine

    if posPositionInLine then
      return pos - (posPositionInLine - 2)
    else 
      return 1
    end
  
end

function persFold.lineLength(pageText, startOfLine)

    local pageTextFromStartOfLine = string.sub(pageText, startOfLine)
    local lineLength, _ = string.find(pageTextFromStartOfLine, "\n") - 1

    return lineLength
end

function persFold.lineText(pageText, pos)
    -- Return the text of the line of the current page containing position pos

    -- Find the end of the current line, or the end of the page if it's the last line
    local startOfLine = persFold.lineStart(pageText, pos)
    local lineLength = persFold.lineLength(pageText, startOfLine)

  
    if lineLength == -1 then
        lineLength = string.len(pageText) - startOfLine + 1
    end

    local lineText = string.sub(pageText, startOfLine, startOfLine + lineLength - 1)
  
    return lineText  
end

function persFold.togglerMarker(toggleOn)
    local pageText = editor.getText()
    if not pageText then
      return
    end

    local cursorPositionInPage = editor.getCursor()

    -- Get the text, starting position and length of the current line
    local currentLineText = persFold.lineText(pageText, cursorPositionInPage)
    local currentLineStart = persFold.lineStart(pageText,cursorPositionInPage)
    local currentLineLength = persFold.lineLength(pageText,currentLineStart)
    local nextLineStart = currentLineStart + currentLineLength

    local marked = string.sub(currentLineText,currentLineLength - string.len(persFold.marker) + 1, currentLineLength) == persFold.marker
  
    if toggleOn == 1 and not marked then
      -- add marker
      editor.insertAtPos(persFold.marker, nextLineStart - 1)
    elseif toggleOn == 0 and marked then
      -- If yes, remove marker
      editor.replaceRange(nextLineStart - 1 - string.len(persFold.marker), nextLineStart - 1, "")
    end 
  
end

-- add marker when folding (Ctl-. Ctl-.)
event.listen{
  name = "editor:fold",
  run = function()
    persFold.togglerMarker(1)
  end  
}

-- remove marker when folding (Ctl-. Ctl-.)
event.listen{
  name = "editor:unfold",
  run = function()
    persFold.togglerMarker(0)
  end  
}

-- Event listener to fold up marked bullets on page load
event.listen{
  name = "editor:pageLoaded",
  run = function()
    local text = editor.getText()
    if not text then
      return
    end
  
    -- Save cursor position
    local originalCursor = await editor.getCursor()
  
    local lineNum = 0
    for line in (text .. "\n"):gmatch("(.-)\n") do
      lineNum = lineNum + 1
  
      -- Simple substring match
      if line:find(persFold.marker .. "$", 1) then
        -- Move cursor to the line so the folding can be done
        editor.moveCursorToLine(lineNum, 1, false)
        
        -- Fold the block at cursor
        editor.fold()
      end
    end

    -- Restore cursor
    if originalCursor != nil then
      editor.setCursor(originalCursor)
    end
  end
}
```

## Pervious ver

1. [persistent folding](https://community.silverbullet.md/t/persistent-folding/1945?u=chenzhu-xie) #community #silverbullet
2. [persistent folding how to use space style to hide a particular attribute](https://community.silverbullet.md/t/persistent-folding-how-to-use-space-style-to-hide-a-particular-attribute/3663?u=chenzhu-xie) #community #silverbullet

```lua
persFold = persFold or {} -- define namespace for persistent fold supporting functions

persFold.marker = "⬇️"

function persFold.lineStart(pageText, pos)
    -- Return the starting position of the line of the current page containing position pos
  
        -- Get the content of the page text up to pos  
    local pageTextToPos = string.sub(pageText, 1, pos)
        -- Reverse it
    local pageTextToPosReversed = string.reverse(pageTextToPos)
        -- Find the number of characters before the first new line character
    local posPositionInLine, _ = string.find(pageTextToPosReversed, "\n") - 2
        -- Subtract that number from pos
    local startOfLine = pos - posPositionInLine
  
    return startOfLine
  
end

function persFold.lineLength(pageText, startOfLine)

    local pageTextFromStartOfLine = string.sub(pageText, startOfLine)
    local lineLength, _ = string.find(pageTextFromStartOfLine, "\n") - 1

    return lineLength
  
end

function persFold.lineText(pageText, pos)
    -- Return the text of the line of the current page containing position pos

    --local startOfLine = persFold.currentLineStart(pageText, pos)    
    --local pageTextFromStartOfLine = string.sub(pageText, startOfLine)
        -- Find the end of the current line, or the end of the page if it's the last line
    local startOfLine = persFold.lineStart(pageText, pos)
    local lineLength = persFold.lineLength(pageText, startOfLine)

  
    if lineLength == -1 then
        lineLength = string.len(pageText) - startOfLine + 1
    end

    local lineText = string.sub(pageText, startOfLine, startOfLine + lineLength - 1)
  
    return lineText
  
end
```

```lua
command.define {
  name = "togglePersistentFold",
  key = "ctrl-alt-q",
  run = function()

    local pageText = editor.getText()
    local cursorPositionInPage = editor.getCursor()

    -- Get the text, starting position and length of the current line
    local currentLineText = persFold.lineText(pageText, cursorPositionInPage)
    local currentLineStart = persFold.lineStart(pageText,cursorPositionInPage)
    local currentLineLength = persFold.lineLength(pageText,currentLineStart)
    
    -- Search in current line for the first instance of `* `
    local bulletPositionInLine, _ = string.find(currentLineText, "\\* ")
    
        if (bulletPositionInLine != nil) and (currentLineLength != -1) then
          -- If there is a bullet point in this line and this is not the last line
          -- Find start, length and text of next line
          local nextLineStart = currentLineStart + currentLineLength
          local nextLineLength = persFold.lineLength(pageText,nextLineStart)
          local nextLineText = persFold.lineText(pageText,nextLineStart)

          -- Find bullet position in next line
          local bulletPositionInNextLine, _ = string.find(nextLineText, "\\* ")
          -- Is it indented further than the current line's bullet, if there is a bullet at all? (If there isn't, string.find returns 0, so the same expression tests for both cases.)
          if bulletPositionInNextLine > bulletPositionInLine then
            -- Now we are sure we are on a line which has a bullet point and has a sub-bullet in the next line.
            -- Check if this line has the fold marker at the end
            
            if string.sub(currentLineText,currentLineLength - string.len(persFold.marker) + 1, currentLineLength) == persFold.marker then
              -- If yes, remove marker
              editor.replaceRange(nextLineStart - 1 - string.len(persFold.marker), nextLineStart - 1, "")
            else
              -- If no, add marker
              editor.insertAtPos(persFold.marker, nextLineStart - 1)
            end

            editor.toggleFold()
            
          end
        end
  end
}

-- Event listener to fold up marked bullets on page load
event.listen {
  name = "editor:pageLoaded",
  run = function()

    -- move backward through the page looking for the fold marker at the end of a line, and fold whenever you find it
    -- (it might work going forward, but it was easier to write it this way than to test.)
    -- repeat until you can't find the fold marker at the end of any more lines

    local markerNewline = persFold.marker .. "\n"
    local pageText = editor.getText()
    pageTextReversed = string.reverse(pageText)
    nextFold, _ = string.find(pageTextReversed, string.reverse(markerNewline))

    while nextFold > 0 do

      editor.moveCursor(string.len(pageText)-nextFold, false)
      editor.toggleFold()
      nextFold, _ = string.find(pageTextReversed, string.reverse(markerNewline), nextFold + 1)
      
    end

    editor.moveCursor(0) -- put the cursor back at the top of the page
    
  end
}
```


