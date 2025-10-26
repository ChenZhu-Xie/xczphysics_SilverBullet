
${generate_chessboard("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", "black", {"h1-g1", "h6-g6", "e2-d4", "a5-a8"}, {"a5", "h4", "e1", "b8"})}

${generate_chessboard("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", "black", {"h1-g1", "h6-g6", "e2-d4", "a5-a8"}, {"a5", "h4", "e1", "b8"})}

```space-lua
function parse_fen(fen)
    local pieces = {}
    local rows = {}
    local i = 1
    local row_start = 1
    
    while i <= #fen do
        local char = string.sub(fen, i, i)
        if char == "/" then
            table.insert(rows, string.sub(fen, row_start, i - 1))
            row_start = i + 1
        end
        i = i + 1
    end
    table.insert(rows, string.sub(fen, row_start, i))
    
    for j = 1, 8 do
        local current_row = {}
        local row = rows[j]
        local k = 1
        while k <= #row do
            local char = string.sub(row, k, k)
            if char >= "1" and char <= "8" then
                local empty_squares = tonumber(char)
                for _ = 1, empty_squares do
                    table.insert(current_row, "")
                end
            else
                table.insert(current_row, char)
            end
            k = k + 1
        end
        pieces[j] = current_row
    end
    
    return pieces
end
```

```space-lua
function parse_squares(fields, flip)
    local parsed_squares = {}
    for _, field in ipairs(fields) do
        local file, rank = field:match("(%a)(%d)")
        if file and rank then
            local x = string.byte(file:upper()) - string.byte("A") + 1
            local y = tonumber(rank)
            
            if flip then
                x = 9 - x
                y = 9 - y
            end
            
            table.insert(parsed_squares, {x, y})
        end
    end
    return parsed_squares
end
```

```space-lua
function parse_arrows(arrows, flip)
    local parsed_arrows = {}
    for _, arrow in ipairs(arrows) do
        local start_file, start_rank, end_file, end_rank = arrow:match("(%a)(%d)-(%a)(%d)")
        if start_file and start_rank and end_file and end_rank then
            local start_x = string.byte(start_file:upper()) - string.byte("A") + 1
            local start_y = tonumber(start_rank)
            local end_x = string.byte(end_file:upper()) - string.byte("A") + 1
            local end_y = tonumber(end_rank)
            
            if flip then
                start_x = 9 - start_x
                start_y = 9 - start_y
                end_x = 9 - end_x
                end_y = 9 - end_y
            end
            
            table.insert(parsed_arrows, {start_x, start_y, end_x, end_y})
        end
    end
    return parsed_arrows
end
```

```space-lua
function generate_chessboard(fen, side, arrows, circles)
    if fen == "start" then
        fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    end

    local pieces = parse_fen(fen)
    local flip = side == "black"
    local parsed_arrows = parse_arrows(arrows or {}, flip)
    local parsed_circles = parse_squares(circles or {}, flip)
    
    local html = "<div style='display: flex; flex-direction: column; align-items: center; position: relative;'>"
    
    -- Board container
    html = html .. "<div style='display: grid; grid-template-columns: repeat(8, 1fr) auto; grid-template-rows: repeat(8, 1fr) auto; width: 50vmin; height: 50vmin; border: 2px solid black; position: relative;'>"
    
    local files = {"A", "B", "C", "D", "E", "F", "G", "H"}
    local ranks = {8, 7, 6, 5, 4, 3, 2, 1}
    
    if flip then
        files = {"H", "G", "F", "E", "D", "C", "B", "A"}
        ranks = {1, 2, 3, 4, 5, 6, 7, 8}
    end
    
    local piece_urls = {
        P = "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
        R = "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
        N = "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
        B = "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
        Q = "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
        K = "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
        p = "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
        r = "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
        n = "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
        b = "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
        q = "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
        k = "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
    }
    
    for i = 1, 8 do
        local row = ranks[i]
        for j = 1, 8 do
            local col = flip and (9 - j) or j
            local isDark = ((row + col) % 2 == 1)
            local bgColor = isDark and "#6d4c41" or "#ffebcd"
            local piece = pieces[9 - row][col]
            local pieceHtml = ""
            if piece and piece ~= "" then
                pieceHtml = "<img src='" .. piece_urls[piece] .. "' style='width: 80%; height: 80%; object-fit: contain;'>"
            end
            html = html
                .. "<div style='display: flex; align-items: center; justify-content: center;"
                .. "background:" .. bgColor .. ";"
                .. "border: 1px solid black;"
                .. "font-size: 4vmin; line-height: 1;'>"
                .. pieceHtml
                .. "</div>"
        end
        -- Rank labels on the right with equal spacing to file labels
        html = html .. "<div style='display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 2vmin; margin-left: 0.5vmin;'>" .. row .. "</div>"
    end
    
    -- File labels at the bottom
    for _, file in ipairs(files) do
        html = html .. "<div style='display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 2vmin; margin-top: 0.5vmin;'>" .. file .. "</div>"
    end
    
    html = html .. "</div>" -- End board grid
    
  
    html = html .. "<div style='position: absolute; width: 48.25vmin; height: 46.75vmin; margin-left: -1.75vmin; margin-top: 0.25vmin; align-items: center; display: flex; justify-content: center'>"
    html = html .. "<svg viewBox='0 0 8 8' preserveAspectRatio='none' style='width: 100%; height: 100%;'>"
    
    for _, arrow in ipairs(parsed_arrows) do
        -- In the SVG viewBox, each square is 1 unit.
        -- The center of a square at column X and rank R is at (X - 0.5, (8 - R) + 0.5).
        local start_x = arrow[1] - 0.5
        local start_y = (8 - arrow[2]) + 0.5
        local end_x   = arrow[3] - 0.5
        local end_y   = (8 - arrow[4]) + 0.5
        html = html .. "<line x1='" .. start_x .. "' y1='" .. start_y .. "' x2='" .. end_x .. "' y2='" .. end_y .. "' stroke='rgba(0, 128, 0, 0.5)' stroke-width='0.1' stroke-linecap='round' marker-end='url(#arrowhead)' />"
    end

    if parsed_circles then
        for _, circle in ipairs(parsed_circles) do
            local cx = circle[1] - 0.5
            local cy = (8 - circle[2]) + 0.5
            html = html .. "<circle cx='" .. cx .. "' cy='" .. cy .. "' r='0.4' fill='none' stroke='rgba(0, 128, 0, 0.5)' stroke-width='0.1' />"
        end
    end
  
    html = html .. [[
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="4" refY="3.5"
              orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 5 3.5, 0 7" fill="rgba(0, 128, 0, 0.5)" />
      </marker>
    </defs>
    ]]
      
    html = html .. "</svg>"
    html = html .. "</div>" -- End arrow container

    html = html .. "</div>" -- End board container
    html = html .. "</div>" -- End main container

    return {
        html = html,
        display = "block",
        cssClasses = {"square-chessboard"}
    }
end
```
