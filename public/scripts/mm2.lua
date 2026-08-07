--[[
    murder mystery 2 — legacy imgui ui
    UI ONLY. никакие функции не подключены, контролы просто хранят состояние.
]]

local UIS     = game:GetService("UserInputService")
local CoreGui = game:GetService("CoreGui")

local hex = Color3.fromHex

--============================ drawing lib ============================--
-- Родной Drawing экзекутора всегда лучше: он рисуется его собственным
-- рендером, вне дерева GUI, и игра его не видит. Шим на Frame'ах ниже нужен
-- только там, где нативного нет. Раньше локальный Drawing перекрывал нативный
-- безусловно, и на Potassium всё уходило в медленный путь.
local NATIVE_DRAWING = nil
pcall(function()
    local d = rawget(getfenv(), "Drawing") or (getgenv and getgenv().Drawing) or _G.Drawing
    if type(d) == "table" and type(d.new) == "function" then NATIVE_DRAWING = d end
end)

local Drawing = NATIVE_DRAWING or {}
local DRAW_CACHE = {}

local DrawContainer = nil
local function getDrawContainer()
    if DrawContainer and DrawContainer.Parent then return DrawContainer end
    local parent = nil
    if gethui then
        pcall(function() parent = gethui() end)
    end
    if not parent then
        pcall(function() parent = CoreGui end)
    end
    if not parent then
        local lp = game:GetService("Players").LocalPlayer
        if lp then parent = lp:FindFirstChildOfClass("PlayerGui") end
    end
    local sg = Instance.new("ScreenGui")
    sg.Name = "InertiaDrawings"
    sg.ResetOnSpawn = false
    sg.IgnoreGuiInset = true
    sg.DisplayOrder = 999999
    pcall(function()
        if syn and syn.protect_gui then syn.protect_gui(sg) end
    end)
    sg.Parent = parent
    DrawContainer = sg
    return DrawContainer
end

local function isrenderobj(obj)
    return type(obj) == "table" and obj._isDrawing == true
end

local function getrenderproperty(obj, prop)
    if isrenderobj(obj) then
        return obj[prop]
    end
    return nil
end

local function setrenderproperty(obj, prop, val)
    if isrenderobj(obj) then
        obj[prop] = val
    end
end

local function cleardrawcache()
    for obj in pairs(DRAW_CACHE) do
        pcall(function() obj:Destroy() end)
    end
    table.clear(DRAW_CACHE)
end

if not NATIVE_DRAWING then

Drawing.Fonts = {
    UI = 0,
    System = 1,
    Plex = 2,
    Monospace = 3,
}

local FONT_MAP = {
    [0] = Enum.Font.SourceSans,
    [1] = Enum.Font.Gotham,
    [2] = Enum.Font.Roboto,
    [3] = Enum.Font.Code,
}

function Drawing.new(drawType)
    local container = getDrawContainer()
    local props = {
        _isDrawing = true,
        _type = drawType,
        Visible = true,
        ZIndex = 1,
        Transparency = 1,
        Color = Color3.new(1, 1, 1),
    }

    local obj = {}
    local instances = {}

    local function track(inst)
        instances[#instances + 1] = inst
        return inst
    end

    local function cleanup()
        for _, inst in ipairs(instances) do
            pcall(function() inst:Destroy() end)
        end
        table.clear(instances)
        DRAW_CACHE[obj] = nil
    end

    props.Destroy = cleanup
    props.Remove = cleanup

    if drawType == "Line" then
        props.From = Vector2.new(0, 0)
        props.To = Vector2.new(0, 0)
        props.Thickness = 1

        local frame = track(Instance.new("Frame"))
        frame.Name = "DrawLine"
        frame.AnchorPoint = Vector2.new(0.5, 0.5)
        frame.BorderSizePixel = 0
        frame.Parent = container

        local function update()
            if not frame.Parent then return end
            local from, to = props.From, props.To
            local dist = (to - from).Magnitude
            local center = (from + to) / 2
            local angle = math.deg(math.atan2(to.Y - from.Y, to.X - from.X))
            local th = math.max(1, props.Thickness)

            frame.Size = UDim2.fromOffset(dist, th)
            frame.Position = UDim2.fromOffset(center.X, center.Y)
            frame.Rotation = angle
            frame.BackgroundColor3 = props.Color
            frame.BackgroundTransparency = 1 - props.Transparency
            frame.Visible = props.Visible
            frame.ZIndex = props.ZIndex
        end
        props._update = update
        update()

    elseif drawType == "Circle" then
        props.Position = Vector2.new(0, 0)
        props.Radius = 0
        props.Thickness = 1
        props.Filled = false
        props.NumSides = 0

        local frame = track(Instance.new("Frame"))
        frame.Name = "DrawCircle"
        frame.BorderSizePixel = 0
        frame.Parent = container

        local corner = track(Instance.new("UICorner"))
        corner.CornerRadius = UDim.new(1, 0)
        corner.Parent = frame

        local stroke = track(Instance.new("UIStroke"))
        stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
        stroke.Parent = frame

        local function update()
            if not frame.Parent then return end
            local pos = props.Position
            local r = props.Radius
            local d = r * 2
            frame.Size = UDim2.fromOffset(d, d)
            frame.Position = UDim2.fromOffset(pos.X - r, pos.Y - r)
            frame.Visible = props.Visible
            frame.ZIndex = props.ZIndex

            if props.Filled then
                frame.BackgroundColor3 = props.Color
                frame.BackgroundTransparency = 1 - props.Transparency
                stroke.Enabled = false
            else
                frame.BackgroundTransparency = 1
                stroke.Enabled = true
                stroke.Color = props.Color
                stroke.Thickness = math.max(1, props.Thickness)
                stroke.Transparency = 1 - props.Transparency
            end
        end
        props._update = update
        update()

    elseif drawType == "Square" then
        props.Position = Vector2.new(0, 0)
        props.Size = Vector2.new(0, 0)
        props.Thickness = 1
        props.Filled = false

        local frame = track(Instance.new("Frame"))
        frame.Name = "DrawSquare"
        frame.BorderSizePixel = 0
        frame.Parent = container

        local stroke = track(Instance.new("UIStroke"))
        stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
        stroke.Parent = frame

        local function update()
            if not frame.Parent then return end
            local pos, sz = props.Position, props.Size
            frame.Size = UDim2.fromOffset(sz.X, sz.Y)
            frame.Position = UDim2.fromOffset(pos.X, pos.Y)
            frame.Visible = props.Visible
            frame.ZIndex = props.ZIndex

            if props.Filled then
                frame.BackgroundColor3 = props.Color
                frame.BackgroundTransparency = 1 - props.Transparency
                stroke.Enabled = false
            else
                frame.BackgroundTransparency = 1
                stroke.Enabled = true
                stroke.Color = props.Color
                stroke.Thickness = math.max(1, props.Thickness)
                stroke.Transparency = 1 - props.Transparency
            end
        end
        props._update = update
        update()

    elseif drawType == "Triangle" then
        props.PointA = Vector2.new(0, 0)
        props.PointB = Vector2.new(0, 0)
        props.PointC = Vector2.new(0, 0)
        props.Thickness = 1
        props.Filled = false

        local l1 = track(Instance.new("Frame"))
        local l2 = track(Instance.new("Frame"))
        local l3 = track(Instance.new("Frame"))
        for _, l in ipairs({ l1, l2, l3 }) do
            l.Name = "DrawTriLine"
            l.AnchorPoint = Vector2.new(0.5, 0.5)
            l.BorderSizePixel = 0
            l.Parent = container
        end

        local function setLine(frame, from, to)
            local dist = (to - from).Magnitude
            local center = (from + to) / 2
            local angle = math.deg(math.atan2(to.Y - from.Y, to.X - from.X))
            local th = math.max(1, props.Thickness)

            frame.Size = UDim2.fromOffset(dist, th)
            frame.Position = UDim2.fromOffset(center.X, center.Y)
            frame.Rotation = angle
            frame.BackgroundColor3 = props.Color
            frame.BackgroundTransparency = 1 - props.Transparency
            frame.Visible = props.Visible
            frame.ZIndex = props.ZIndex
        end

        local function update()
            if not l1.Parent then return end
            setLine(l1, props.PointA, props.PointB)
            setLine(l2, props.PointB, props.PointC)
            setLine(l3, props.PointC, props.PointA)
        end
        props._update = update
        update()

    elseif drawType == "Quad" then
        props.PointA = Vector2.new(0, 0)
        props.PointB = Vector2.new(0, 0)
        props.PointC = Vector2.new(0, 0)
        props.PointD = Vector2.new(0, 0)
        props.Thickness = 1
        props.Filled = false

        local l1 = track(Instance.new("Frame"))
        local l2 = track(Instance.new("Frame"))
        local l3 = track(Instance.new("Frame"))
        local l4 = track(Instance.new("Frame"))
        for _, l in ipairs({ l1, l2, l3, l4 }) do
            l.Name = "DrawQuadLine"
            l.AnchorPoint = Vector2.new(0.5, 0.5)
            l.BorderSizePixel = 0
            l.Parent = container
        end

        local function setLine(frame, from, to)
            local dist = (to - from).Magnitude
            local center = (from + to) / 2
            local angle = math.deg(math.atan2(to.Y - from.Y, to.X - from.X))
            local th = math.max(1, props.Thickness)

            frame.Size = UDim2.fromOffset(dist, th)
            frame.Position = UDim2.fromOffset(center.X, center.Y)
            frame.Rotation = angle
            frame.BackgroundColor3 = props.Color
            frame.BackgroundTransparency = 1 - props.Transparency
            frame.Visible = props.Visible
            frame.ZIndex = props.ZIndex
        end

        local function update()
            if not l1.Parent then return end
            setLine(l1, props.PointA, props.PointB)
            setLine(l2, props.PointB, props.PointC)
            setLine(l3, props.PointC, props.PointD)
            setLine(l4, props.PointD, props.PointA)
        end
        props._update = update
        update()

    elseif drawType == "Text" then
        props.Text = ""
        props.Size = 14
        props.Center = false
        props.Outline = false
        props.OutlineColor = Color3.new(0, 0, 0)
        props.Position = Vector2.new(0, 0)
        props.Font = 0

        local label = track(Instance.new("TextLabel"))
        label.Name = "DrawText"
        label.BackgroundTransparency = 1
        label.BorderSizePixel = 0
        label.Text = ""
        label.Size = UDim2.fromOffset(0, 0)
        label.AutomaticSize = Enum.AutomaticSize.XY
        label.Parent = container

        local stroke = track(Instance.new("UIStroke"))
        stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual
        stroke.Thickness = 1
        stroke.Parent = label

        local function update()
            if not label.Parent then return end
            label.Text = props.Text
            label.TextSize = props.Size
            label.TextColor3 = props.Color
            label.TextTransparency = 1 - props.Transparency
            label.Visible = props.Visible
            label.ZIndex = props.ZIndex
            label.Font = FONT_MAP[props.Font] or Enum.Font.SourceSans

            if props.Center then
                label.AnchorPoint = Vector2.new(0.5, 0)
            else
                label.AnchorPoint = Vector2.new(0, 0)
            end
            label.Position = UDim2.fromOffset(props.Position.X, props.Position.Y)

            if props.Outline then
                stroke.Enabled = true
                stroke.Color = props.OutlineColor
                stroke.Transparency = 1 - props.Transparency
            else
                stroke.Enabled = false
            end
        end
        props._update = update
        update()

    elseif drawType == "Image" then
        props.Data = ""
        props.Uri = ""
        props.Size = Vector2.new(0, 0)
        props.Position = Vector2.new(0, 0)
        props.Rounding = 0

        local img = track(Instance.new("ImageLabel"))
        img.Name = "DrawImage"
        img.BackgroundTransparency = 1
        img.BorderSizePixel = 0
        img.Parent = container

        local corner = track(Instance.new("UICorner"))
        corner.Parent = img

        local function update()
            if not img.Parent then return end
            local pos, sz = props.Position, props.Size
            img.Size = UDim2.fromOffset(sz.X, sz.Y)
            img.Position = UDim2.fromOffset(pos.X, pos.Y)
            img.ImageColor3 = props.Color
            img.ImageTransparency = 1 - props.Transparency
            img.Visible = props.Visible
            img.ZIndex = props.ZIndex

            if props.Rounding and props.Rounding > 0 then
                corner.CornerRadius = UDim.new(0, props.Rounding)
            else
                corner.CornerRadius = UDim.new(0, 0)
            end

            if props.Data and props.Data ~= "" then
                img.Image = props.Data
            elseif props.Uri and props.Uri ~= "" then
                img.Image = props.Uri
            end
        end
        props._update = update
        update()
    else
        error("Invalid Drawing type: " .. tostring(drawType))
    end

    setmetatable(obj, {
        __index = function(_, k)
            if k == "TextBounds" and drawType == "Text" then
                local label = instances[1]
                return label and label.TextBounds or Vector2.new(0, 0)
            end
            return props[k]
        end,
        __newindex = function(_, k, v)
            props[k] = v
            if props._update then props._update() end
        end,
        __tostring = function()
            return "Drawing[" .. drawType .. "]"
        end,
    })

    DRAW_CACHE[obj] = true
    return obj
end

end   -- конец шима: с нативным Drawing он не собирается вовсе

-- Export globally for any script / executor environment
if typeof(getgenv) == "function" then
    local env = getgenv()
    env.Drawing = env.Drawing or Drawing
    env.isrenderobj = env.isrenderobj or isrenderobj
    env.getrenderproperty = env.getrenderproperty or getrenderproperty
    env.setrenderproperty = env.setrenderproperty or setrenderproperty
    env.cleardrawcache = env.cleardrawcache or cleardrawcache
end
_G.Drawing = _G.Drawing or Drawing
_G.isrenderobj = _G.isrenderobj or isrenderobj
_G.getrenderproperty = _G.getrenderproperty or getrenderproperty
_G.setrenderproperty = _G.setrenderproperty or setrenderproperty
_G.cleardrawcache = _G.cleardrawcache or cleardrawcache

--=============================== paths ===============================--
-- Всё своё живёт в Inertia/games/<игра>/: конфиги, кэш ассетов, тела, небо.
-- Другая игра — своя папка рядом, ничего не смешивается.
local GAME_NAMES = {
    [142823291] = "Murder Mystery 2",
}
local GAME_DIR = "Inertia/games/" .. (GAME_NAMES[game.PlaceId] or ("Place " .. game.PlaceId))

-- Текстуры грузятся в максимальном тире качества. Ставится до того, как хоть
-- одна картинка загружена: флаг влияет только на новые текстуры, поэтому
-- позже в сессии он уже ничего не изменит.
pcall(function()
    local setf = setfflag or setfastflag
    if not setf then return end
    pcall(setf, "DFFlagTextureQualityOverrideEnabled", "True")
    pcall(setf, "DFIntTextureQualityOverride", "3")
end)

do
    if isfolder and makefolder then
        local acc
        for part in GAME_DIR:gmatch("[^/]+") do
            acc = acc and (acc .. "/" .. part) or part
            if not isfolder(acc) then pcall(makefolder, acc) end
        end
        -- всё, что скрипт умеет читать с диска, заводится сразу: пустая папка
        -- сама подсказывает, что туда можно положить
        for _, sub in ipairs({ "configs", "cache", "bodies", "gif", "skyboxes", "hitsounds" }) do
            local p = GAME_DIR .. "/" .. sub
            if not isfolder(p) then pcall(makefolder, p) end
        end

        -- короткая памятка рядом с папками, чтобы не гадать про формат файлов
        local readme = GAME_DIR .. "/README.txt"
        if writefile and isfile and not isfile(readme) then
            pcall(writefile, readme, table.concat({
                "Inertia - " .. GAME_DIR,
                "",
                "bodies/<name>/   R6-меши тела. Файлы: torso.mesh, leftarm.mesh,",
                "                 rightarm.mesh, leftleg.mesh, rightleg.mesh.",
                "                 Кладёшь папку -> Visuals > Custom Body > Refresh List.",
                "",
                "gif/<name>/      анимация для меню. Roblox не читает .gif, нужны кадры:",
                "                 001.png, 002.png, ... по порядку имён.",
                "                 Рядом можно положить fps.txt с числом кадров в секунду.",
                "                 Settings > Menu GIF > Refresh List.",
                "",
                "skyboxes/<name>/ шесть граней неба: bk, dn, ft, lf, rt, up.",
                "                 Имя файла любое, лишь бы кончалось гранью:",
                "                 bk.png, sky512_bk.tex, skybox-back.jpg — всё подойдёт.",
                "                 Visuals > Customs > Sky.",
                "",
                "configs/         именованные конфиги и autosave.json. Трогать не нужно.",
                "cache/           скачанные курсоры и фоны. Можно удалять, скачается заново.",
                "",
                "Небо и модели персонажей берутся по id ассета Roblox прямо в меню,",
                "файлы для них не нужны.",
            }, "\n"))
        end
    end
end

--=============================== themes ===============================--
-- accent — акцент (заливка слайдеров, чекбоксы, подчёркивание вкладок)
-- outer  — внешняя рамка окна
-- bg     — фон окна / неактивных вкладок
-- group  — фон групбокса
-- frame  — фон контролов (слайдер, дропдаун, чекбокс)
-- border — рамка групбоксов и контролов
local THEMES = {
    { name = "Fatality",   accent="cf1257", outer="9a9aae", bg="121218", group="0d0d12", frame="191920", border="45454f", text="ffffff", dim="a5a5b2" },
    { name = "NeverLose",  accent="7a5cff", outer="5a5a72", bg="0f0f14", group="0c0c11", frame="16161d", border="282833", text="e4e4f0", dim="86869a" },
    { name = "Onetap",     accent="ff8a00", outer="6e6960", bg="121210", group="0e0e0c", frame="1a1a17", border="2e2e29", text="ececdf", dim="93938a" },
    { name = "Gamesense",  accent="8dbf3f", outer="63705a", bg="101210", group="0d0f0d", frame="171a17", border="2a2f29", text="e6ece2", dim="8a9385" },
    { name = "Midnight",   accent="3b82f6", outer="55617a", bg="0d1017", group="0a0d13", frame="141922", border="252d3a", text="e2e8f2", dim="828d9e" },
    { name = "Monochrome", accent="c9c9d2", outer="6a6a6a", bg="111111", group="0e0e0e", frame="181818", border="2b2b2b", text="e8e8e8", dim="8c8c8c" },
}

local T                -- текущая тема (уже Color3)
local repaint = {}     -- всё, что нужно перекрасить при смене темы

local function useTheme(entry)
    T = {}
    for k, v in pairs(entry) do T[k] = (k == "name") and v or hex(v) end
    for _, f in ipairs(repaint) do pcall(f) end
end

local function themeByName(n)
    for _, t in ipairs(THEMES) do if t.name == n then return t end end
    return THEMES[1]
end

-- тема по умолчанию из default.txt
local defaultTheme = "Fatality"
if isfile and isfile("default.txt") then
    local ok, v = pcall(readfile, "default.txt")
    if ok and v then defaultTheme = (v:gsub("%s+$", "")) end
end
useTheme(themeByName(defaultTheme))

--=============================== helpers ===============================--
local FONT, SIZE = Enum.Font.Code, 14

local function new(class, props, parent)
    local i = Instance.new(class)
    for k, v in pairs(props) do i[k] = v end
    i.Parent = parent
    return i
end

-- красит свойство ключом темы и запоминает для перекраски. Тост может быть
-- уже уничтожен, когда тема меняется: умерший инстанс не трогаем.
local function tint(inst, prop, key)
    local f = function() if inst.Parent then inst[prop] = T[key] end end
    repaint[#repaint + 1] = f
    f()
end

-- перекрас, где цвет зависит от состояния
local function dyn(f)
    repaint[#repaint + 1] = f
    f()
end

local function list(parent, pad)
    return new("UIListLayout", {
        SortOrder = Enum.SortOrder.LayoutOrder,
        Padding   = UDim.new(0, pad or 3),
    }, parent)
end

local function label(parent, text, opts)
    opts = opts or {}
    local l = new("TextLabel", {
        BackgroundTransparency = 1,
        Font = FONT, TextSize = SIZE, Text = text,
        TextXAlignment = opts.center and Enum.TextXAlignment.Center or Enum.TextXAlignment.Left,
        Size = opts.size or UDim2.new(1, 0, 1, 0),
        Position = opts.pos or UDim2.new(),
        ZIndex = opts.z or 2,
    }, parent)
    tint(l, "TextColor3", opts.dim and "dim" or "text")
    return l
end

-- F — состояние всех фич, ключ = flag контрола. FLAG_SET нужен конфигам,
-- чтобы вернуть контролы в вид, записанный в файле. Объявлено до окна:
-- перетаскивание тоже помечает конфиг грязным.
local F, FLAG_SET = {}, {}
local cfgDirty = false
local function touch() cfgDirty = true end
-- Пока идёт восстановление из конфига, выбор в списках не должен сам включать
-- фичу: иначе сохранённый выключенным курсор/небо/тело поднимались включёнными.
local applyingConfig = false

--=============================== notify ===============================--
-- свои тосты вместо роблоксовских: в стиле меню, красятся темой, позиция
-- выбирается в настройках
local notifyHost, notifyLayout

local function Notify(title, text, kind)
    if not notifyHost then return end
    local accentFor = { warn = Color3.fromRGB(255, 170, 40), bad = Color3.fromRGB(255, 70, 70) }

    local card = new("Frame", {
        Size = UDim2.new(1, 0, 0, 40), BorderSizePixel = 1, BackgroundTransparency = 0,
    }, notifyHost)
    tint(card, "BackgroundColor3", "group")
    tint(card, "BorderColor3", "border")

    local bar = new("Frame", { Size = UDim2.new(0, 3, 1, -2), Position = UDim2.fromOffset(1, 1), BorderSizePixel = 0 }, card)
    bar.BackgroundColor3 = accentFor[kind] or T.accent

    local head = label(card, title, { size = UDim2.new(1, -14, 0, 18), pos = UDim2.fromOffset(11, 3) })
    head.TextColor3 = accentFor[kind] or T.accent
    -- label() уже зарегистрировал перекрас в T.text; свой поверх него, иначе
    -- warn/bad-тост при смене темы теряет свой цвет
    dyn(function() if head.Parent then head.TextColor3 = accentFor[kind] or T.accent end end)
    local body = label(card, text or "", { size = UDim2.new(1, -14, 0, 16), pos = UDim2.fromOffset(11, 20), dim = true })
    body.TextTruncate = Enum.TextTruncate.AtEnd

    task.delay(3.5, function()
        for i = 1, 10 do
            card.BackgroundTransparency = i / 10
            head.TextTransparency, body.TextTransparency, bar.BackgroundTransparency = i / 10, i / 10, i / 10
            task.wait(0.03)
        end
        card:Destroy()
    end)
end

--=============================== window ===============================--
local host = (gethui and gethui()) or CoreGui
if host:FindFirstChild("mm2_ui") then host.mm2_ui:Destroy() end

-- IgnoreGuiInset обязателен: UIS:GetMouseLocation() отдаёт сырые экранные
-- координаты, а ScreenGui с инсетом сдвинут на 36px — курсор и клик расходились
local gui = new("ScreenGui", {
    Name = "mm2_ui", ResetOnSpawn = false, DisplayOrder = 9999,
    IgnoreGuiInset = true,
    ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
}, host)

local win = new("Frame", {
    Size = UDim2.fromOffset(600, 620),
    Position = UDim2.new(0.5, -300, 0.5, -310),
    BorderSizePixel = 1,
}, gui)
tint(win, "BackgroundColor3", "bg")
tint(win, "BorderColor3", "outer")

-- title bar
local title = new("Frame", { Size = UDim2.new(1, -2, 0, 24), Position = UDim2.fromOffset(1, 1), BorderSizePixel = 0 }, win)
tint(title, "BackgroundColor3", "group")
label(title, "Inertia", { center = true })
local brand = label(title, "Murder Mystery 2", { size = UDim2.new(0, 180, 1, 0), pos = UDim2.new(1, -188, 0, 0) })
brand.TextXAlignment = Enum.TextXAlignment.Right
dyn(function() brand.TextColor3 = T.accent end)
local titleLine = new("Frame", { Size = UDim2.new(1, 0, 0, 1), Position = UDim2.new(0, 0, 1, 0), BorderSizePixel = 0 }, title)
tint(titleLine, "BackgroundColor3", "border")

-- Окно едет за курсором сразу. Дельта считается от точки захвата, а не абсолют —
-- так расхождения систем координат (инсет, scale в Position) сокращаются.
-- всё, что таскается мышью, регистрируется здесь и уезжает в автосейв
local DRAGGABLE = {}

local function attachDrag(frame, handle, id)
    local dragging, grabAt, startPos
    if id then DRAGGABLE[id] = frame end

    handle.InputBegan:Connect(function(i)
        if i.UserInputType ~= Enum.UserInputType.MouseButton1 and i.UserInputType ~= Enum.UserInputType.Touch then return end
        dragging = true
        grabAt   = Vector2.new(i.Position.X, i.Position.Y)
        startPos = frame.Position
    end)

    UIS.InputChanged:Connect(function(i)
        if not dragging then return end
        if i.UserInputType ~= Enum.UserInputType.MouseMovement and i.UserInputType ~= Enum.UserInputType.Touch then return end
        local d = Vector2.new(i.Position.X, i.Position.Y) - grabAt
        frame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + d.X,
                                   startPos.Y.Scale, startPos.Y.Offset + d.Y)
    end)

    UIS.InputEnded:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
            if dragging then touch() end   -- позиция ушла в автосейв
            dragging = false
        end
    end)
end

attachDrag(win, title, "window")

--=============================== tabs ===============================--
-- контейнер тостов живёт в том же ScreenGui, но вне окна: он не должен
-- прятаться вместе с меню
notifyHost = new("Frame", {
    Name = "Notifications", Size = UDim2.fromOffset(260, 400),
    Position = UDim2.new(1, -270, 0, 10), BackgroundTransparency = 1, ZIndex = 50,
}, gui)
notifyLayout = new("UIListLayout", {
    Padding = UDim.new(0, 4), SortOrder = Enum.SortOrder.LayoutOrder,
    VerticalAlignment = Enum.VerticalAlignment.Top,
}, notifyHost)

local NOTIFY_POS = {
    ["Top Right"]    = { UDim2.new(1, -270, 0, 10),   Enum.VerticalAlignment.Top },
    ["Top Left"]     = { UDim2.fromOffset(10, 10),    Enum.VerticalAlignment.Top },
    ["Bottom Right"] = { UDim2.new(1, -270, 1, -410), Enum.VerticalAlignment.Bottom },
    ["Bottom Left"]  = { UDim2.new(0, 10, 1, -410),   Enum.VerticalAlignment.Bottom },
}
local function setNotifyPos(name)
    local p = NOTIFY_POS[name] or NOTIFY_POS["Top Right"]
    notifyHost.Position, notifyLayout.VerticalAlignment = p[1], p[2]
end

local tabBar = new("Frame", { Size = UDim2.new(1, -12, 0, 22), Position = UDim2.fromOffset(6, 30), BackgroundTransparency = 1 }, win)
new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 2),
    SortOrder = Enum.SortOrder.LayoutOrder }, tabBar)

local body = new("Frame", { Size = UDim2.new(1, -12, 1, -62), Position = UDim2.fromOffset(6, 55), BackgroundTransparency = 1 }, win)

local tabs, activeTab = {}, nil

local function setTab(t)
    activeTab = t
    for _, x in ipairs(tabs) do
        x.page.Visible         = (x == t)
        x.btn.BackgroundColor3 = (x == t) and T.frame  or T.bg
        x.btn.TextColor3       = (x == t) and T.text   or T.dim
        x.btn.BorderColor3     = (x == t) and T.accent or T.border
    end
end
repaint[#repaint + 1] = function() if activeTab then setTab(activeTab) end end

local function Tab(name)
    local btn = new("TextButton", {
        Size = UDim2.fromOffset(#name * 8 + 18, 22), AutoButtonColor = false,
        Font = FONT, TextSize = SIZE, Text = name, BorderSizePixel = 1,
    }, tabBar)

    local page = new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, Visible = false }, body)
    local cols = {}
    for c = 0, 1 do
        local col = new("ScrollingFrame", {
            Size = UDim2.new(0.5, -3, 1, 0), Position = UDim2.new(0.5 * c, c * 3, 0, 0),
            BackgroundTransparency = 1, BorderSizePixel = 0, ScrollBarThickness = 0,
            CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y,
        }, page)
        list(col, 4)
        cols[c + 1] = col
    end

    local t = { btn = btn, page = page, left = cols[1], right = cols[2] }
    tabs[#tabs + 1] = t
    btn.MouseButton1Click:Connect(function() setTab(t) end)
    setTab(activeTab or t)   -- перекрасить ВСЕ вкладки, иначе новые остаются дефолтно-серыми
    return t
end

--=============================== groupbox ===============================--
-- titles: строка, либо {"silent aim","aimbot"} для суб-вкладок
-- возвращает body-фрейм (или таблицу фреймов)
local function Group(parent, titles)
    local single = type(titles) == "string"
    if single then titles = { titles } end

    local root = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BorderSizePixel = 1 }, parent)
    tint(root, "BackgroundColor3", "group")
    tint(root, "BorderColor3", "border")
    list(root, 0)

    local head = new("Frame", { Size = UDim2.new(1, 0, 0, 22), BorderSizePixel = 0, BackgroundTransparency = 1 }, root)
    new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, SortOrder = Enum.SortOrder.LayoutOrder }, head)

    local shell = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1 }, root)
    local pages, heads = {}, {}

    local active = 1
    local function select(i)
        active = i
        for n, h in ipairs(heads) do
            h.txt.TextColor3        = (n == i) and T.text   or T.dim
            h.line.BackgroundColor3 = (n == i) and T.accent or T.border
            h.btn.BackgroundColor3  = (n == i) and T.frame  or T.group
            -- скрытая страница всё равно тянет AutomaticSize у shell, поэтому схлопываем её
            pages[n].Visible = (n == i)
            pages[n].AutomaticSize = (n == i) and Enum.AutomaticSize.Y or Enum.AutomaticSize.None
            if n ~= i then pages[n].Size = UDim2.new(1, 0, 0, 0) end
        end
    end
    repaint[#repaint + 1] = function() select(active) end

    for i, name in ipairs(titles) do
        local btn = new("TextButton", {
            Size = UDim2.new(1 / #titles, 0, 1, 0), Text = "", AutoButtonColor = false, BorderSizePixel = 0,
        }, head)
        local txt  = label(btn, name, { center = true })
        local line = new("Frame", { Size = UDim2.new(1, 0, 0, 1), Position = UDim2.new(0, 0, 1, -1), BorderSizePixel = 0 }, btn)
        heads[i] = { btn = btn, txt = txt, line = line }

        local page = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y,
            BackgroundTransparency = 1, Visible = false }, shell)
        list(page, 3)
        new("UIPadding", { PaddingTop = UDim.new(0, 4), PaddingBottom = UDim.new(0, 5),
            PaddingLeft = UDim.new(0, 5), PaddingRight = UDim.new(0, 5) }, page)
        pages[i] = page

        btn.MouseButton1Click:Connect(function() select(i) end)
    end
    select(1)

    return single and pages[1] or pages
end

--=============================== controls ===============================--
local function bind(flag, value, setter)
    if not flag then return end
    F[flag] = value
    FLAG_SET[flag] = setter
end

-- Биндится ЛЮБАЯ клавиша на ЛЮБОЙ тумблер: ПКМ по строке — режим ожидания,
-- следующее нажатие становится биндом. Delete в этом режиме снимает бинд.
-- ЛКМ по чипу бинда — выбор Always / Toggle / Hold.
local BINDS, BIND_NAME, BIND_UI, BIND_ACTION = {}, {}, {}, {}
local listening = nil

local function bindLabel(b)
    return b.key .. " [" .. b.mode:sub(1, 1) .. "]"
end

local function refreshBind(flag)
    local ui = BIND_UI[flag]
    if not ui then return end
    local b = BINDS[flag]
    ui.chip.Visible = (b ~= nil) or (listening == flag)
    -- у кнопок режима нет, показываем только клавишу
    ui.text.Text = listening == flag and "..."
        or (b and (ui.press and b.key or bindLabel(b)) or "")
    local w = #ui.text.Text * 8 + 12
    ui.chip.Size = UDim2.fromOffset(w, ui.press and 14 or 15)
    ui.chip.Position = UDim2.new(1, -(w + (ui.press and 2 or 0)), 0, ui.press and 3 or 1)
end

-- opts: { key = "MB2", colors = 3, default = true, flag = "SheriffSilentAim" }
local function Toggle(parent, text, opts)
    opts = opts or {}
    local state = opts.default or false

    local row = new("TextButton", { Size = UDim2.new(1, 0, 0, 17), Text = "", BackgroundTransparency = 1, AutoButtonColor = false }, parent)
    local box = new("Frame", { Size = UDim2.fromOffset(12, 12), Position = UDim2.fromOffset(0, 3), BorderSizePixel = 1 }, row)
    tint(box, "BorderColor3", "border")
    label(row, text, { size = UDim2.new(1, -19, 1, 0), pos = UDim2.fromOffset(19, 0) })

    dyn(function() box.BackgroundColor3 = state and T.accent or T.frame end)
    local function set(v)
        state = v and true or false
        box.BackgroundColor3 = state and T.accent or T.frame
        if opts.flag then F[opts.flag] = state; touch() end
        if opts.callback then opts.callback(state) end
    end
    bind(opts.flag, state, set)
    row.MouseButton1Click:Connect(function() set(not state) end)

    if opts.flag then
        BIND_NAME[opts.flag] = text
        local chip = new("Frame", { Size = UDim2.fromOffset(40, 15), Position = UDim2.new(1, -40, 0, 1),
            BorderSizePixel = 1, Visible = false, ZIndex = 4 }, row)
        tint(chip, "BackgroundColor3", "frame")
        tint(chip, "BorderColor3", "border")
        local chipTxt = label(chip, "", { center = true, z = 5 })
        dyn(function() chipTxt.TextColor3 = T.accent end)
        BIND_UI[opts.flag] = { chip = chip, text = chipTxt }

        row.MouseButton2Click:Connect(function()
            local prev = listening
            listening = (listening == opts.flag) and nil or opts.flag
            if prev then refreshBind(prev) end
            refreshBind(opts.flag)
        end)

        -- ЛКМ по чипу: смена режима по кругу Always → Toggle → Hold
        local hit = new("TextButton", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1,
            Text = "", AutoButtonColor = false, ZIndex = 6 }, chip)
        hit.MouseButton1Click:Connect(function()
            local b = BINDS[opts.flag]
            if not b then return end
            local order = { Always = "Toggle", Toggle = "Hold", Hold = "Always" }
            b.mode = order[b.mode] or "Toggle"
            -- Always означает «включено всегда», а не «клавиша ничего не делает»
            if b.mode == "Always" then set(true) end
            refreshBind(opts.flag)
            touch()
            Notify("Keybind", text .. " -> " .. b.mode)
        end)
        hit.MouseButton2Click:Connect(function()
            local prev = listening
            listening = (listening == opts.flag) and nil or opts.flag
            if prev then refreshBind(prev) end
            refreshBind(opts.flag)
        end)
    end

    -- правый край: чип бинда либо цветовые квадраты (чистый визуал).
    -- Если слева уже стоит чип бинда (40px + отступ) — сдвигаем свой влево,
    -- иначе оба чипа рисовались друг на друге.
    local reserve = opts.flag and 43 or 0
    if opts.key then
        local w = #opts.key * 8 + 10
        local chip = new("Frame", { Size = UDim2.fromOffset(w, 15), Position = UDim2.new(1, -(w + reserve), 0, 1), BorderSizePixel = 1 }, row)
        tint(chip, "BackgroundColor3", "frame")
        tint(chip, "BorderColor3", "border")
        label(chip, opts.key, { center = true, dim = true })
    elseif opts.colors then
        for i = 1, opts.colors do
            local sw = new("Frame", { Size = UDim2.fromOffset(24, 14), BorderSizePixel = 1,
                Position = UDim2.new(1, -(opts.colors - i + 1) * 26 - reserve, 0, 2) }, row)
            dyn(function() sw.BackgroundColor3 = T.accent end)
            tint(sw, "BorderColor3", "border")
        end
    end

    return { get = function() return state end, set = set }
end

local function Slider(parent, text, min, max, default, suffix, flag, callback)
    local value = default
    suffix = suffix or ""

    local bar = new("Frame", { Size = UDim2.new(1, 0, 0, 17), BorderSizePixel = 1 }, parent)
    tint(bar, "BorderColor3", "border")
    local fill = new("Frame", { Size = UDim2.new(0, 0, 1, 0), BorderSizePixel = 0 }, bar)
    local txt  = label(bar, "", { center = true, z = 3 })
    -- обводка: текст идёт и по заливке, и по жёлобу, на светлом акценте белым
    -- по светлому его не видно
    txt.TextStrokeColor3 = Color3.fromRGB(8, 8, 10)
    txt.TextStrokeTransparency = 0.15

    local function render()
        -- жёлоб — приглушённый акцент, как в оригинальном меню
        bar.BackgroundColor3 = T.accent:Lerp(T.bg, 0.84)
        fill.BackgroundColor3 = T.accent
        fill.Size = UDim2.fromScale((value - min) / (max - min), 1)
        txt.Text = ("%s: %s%s"):format(text, (value % 1 == 0) and tostring(math.floor(value)) or ("%.2f"):format(value), suffix)
        if flag then F[flag] = value; touch() end
    end
    dyn(render)
    -- сеттер обязан дёргать callback: иначе восстановленный из конфига размер
    -- курсора или плотность сетки останутся только цифрой на ползунке
    bind(flag, value, function(v)
        value = math.clamp(tonumber(v) or default, min, max)
        render()
        if callback then callback(value) end
    end)

    local dragging = false
    local function grab(x)
        local a = math.clamp((x - bar.AbsolutePosition.X) / bar.AbsoluteSize.X, 0, 1)
        local raw = min + a * (max - min)
        value = (max - min <= 5) and math.floor(raw * 100 + 0.5) / 100 or math.floor(raw + 0.5)
        render()
        if callback then callback(value) end
    end
    bar.InputBegan:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
            dragging = true; grab(i.Position.X)
        end
    end)
    UIS.InputChanged:Connect(function(i)
        if dragging and (i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch) then
            grab(i.Position.X)
        end
    end)
    UIS.InputEnded:Connect(function(i)
        if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then dragging = false end
    end)

    return { get = function() return value end, frame = bar }
end

local function Dropdown(parent, text, options, default, flag, callback)
    local holder = new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1 }, parent)
    list(holder, 2)

    if text then
        local cap = label(holder, text, { dim = true, size = UDim2.new(1, 0, 0, 15) })
        cap.LayoutOrder = 1
    end

    local box = new("TextButton", { Size = UDim2.new(1, 0, 0, 20), Text = "", BorderSizePixel = 1,
        AutoButtonColor = false, LayoutOrder = 2 }, holder)
    tint(box, "BackgroundColor3", "frame")
    tint(box, "BorderColor3", "border")
    local sel   = label(box, default or options[1], { size = UDim2.new(1, -20, 1, 0), pos = UDim2.fromOffset(6, 0) })
    local arrow = label(box, "v", { size = UDim2.fromOffset(16, 20), pos = UDim2.new(1, -17, 0, 0), dim = true, center = true })

    local menu = new("Frame", { Size = UDim2.new(1, 0, 0, 0), BorderSizePixel = 1, Visible = false,
        LayoutOrder = 3, ClipsDescendants = true }, holder)
    tint(menu, "BackgroundColor3", "frame")
    tint(menu, "BorderColor3", "border")
    list(menu, 0)

    local function close()
        menu.Visible = false
        menu.AutomaticSize = Enum.AutomaticSize.None
        menu.Size = UDim2.new(1, 0, 0, 0)
        arrow.Text = "v"
    end

    -- выбранный пункт видно в самом списке: белый и с маркером, остальные тусклые
    local items = {}
    local function paintItems()
        for opt, lbl in pairs(items) do
            local on = (sel.Text == opt)
            lbl.TextColor3 = on and T.text or T.dim
            lbl.Text = (on and "> " or "   ") .. opt
        end
    end
    repaint[#repaint + 1] = paintItems

    local function addItem(opt)
        local item = new("TextButton", { Size = UDim2.new(1, 0, 0, 18), Text = "", BackgroundTransparency = 1, AutoButtonColor = false }, menu)
        local it = label(item, "   " .. opt, { size = UDim2.new(1, -12, 1, 0), pos = UDim2.fromOffset(6, 0), dim = true })
        items[opt] = it
        item.MouseEnter:Connect(function() it.TextColor3 = T.accent end)
        item.MouseLeave:Connect(function() paintItems() end)
        item.MouseButton1Click:Connect(function()
            sel.Text = opt
            paintItems()
            if flag then F[flag] = opt; touch() end
            close()
            if callback then callback(opt) end
        end)
    end

    for _, opt in ipairs(options) do addItem(opt) end
    paintItems()
    -- сеттер дёргает callback: иначе восстановленная из конфига тема меняла бы
    -- только подпись в списке
    bind(flag, sel.Text, function(v)
        sel.Text = tostring(v)
        paintItems()
        if flag then F[flag] = v; touch() end
        if callback then callback(v) end
    end)

    box.MouseButton1Click:Connect(function()
        if menu.Visible then close() return end
        menu.Visible = true
        menu.AutomaticSize = Enum.AutomaticSize.Y
        arrow.Text = "^"
    end)

    -- список можно пересобрать на лету: папку с моделью кинули уже после запуска
    local function setOptions(list)
        for _, child in ipairs(menu:GetChildren()) do
            if child:IsA("TextButton") then child:Destroy() end
        end
        table.clear(items)
        for _, opt in ipairs(list) do addItem(opt) end
        if not items[sel.Text] then
            local v = list[1] or ""
            if sel.Text ~= v then
                sel.Text = v
                if flag then F[flag] = v; touch() end
                if callback then callback(v) end
            end
        end
        paintItems()
    end

    return {
        get = function() return sel.Text end,
        set = function(v) sel.Text = v end,
        setOptions = setOptions,
    }
end

local function Input(parent, placeholder)
    local box = new("TextBox", {
        Size = UDim2.new(1, 0, 0, 20), BorderSizePixel = 1, Text = "", PlaceholderText = placeholder,
        Font = FONT, TextSize = SIZE, ClearTextOnFocus = false, TextXAlignment = Enum.TextXAlignment.Left,
    }, parent)
    new("UIPadding", { PaddingLeft = UDim.new(0, 6), PaddingRight = UDim.new(0, 6) }, box)
    tint(box, "BackgroundColor3", "frame")
    tint(box, "BorderColor3", "border")
    tint(box, "TextColor3", "text")
    tint(box, "PlaceholderColor3", "dim")
    return box
end

-- прокручиваемый список с одиночным выбором
local function List(parent, height)
    local frame = new("ScrollingFrame", {
        Size = UDim2.new(1, 0, 0, height or 96), BorderSizePixel = 1, ScrollBarThickness = 2,
        CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y,
    }, parent)
    tint(frame, "BackgroundColor3", "frame")
    tint(frame, "BorderColor3", "border")
    list(frame, 0)

    local rows, selected = {}, nil
    local function paint()
        for _, r in ipairs(rows) do
            r.TextColor3 = (r.Text == selected) and T.accent or T.dim
        end
    end
    repaint[#repaint + 1] = paint

    local api = {}
    function api.fill(names)
        for _, r in ipairs(rows) do r:Destroy() end
        rows = {}
        if selected and not table.find(names, selected) then selected = nil end
        for _, n in ipairs(names) do
            local r = new("TextButton", {
                Size = UDim2.new(1, 0, 0, 18), Text = n, Font = FONT, TextSize = SIZE,
                BackgroundTransparency = 1, AutoButtonColor = false,
                TextXAlignment = Enum.TextXAlignment.Left,
            }, frame)
            new("UIPadding", { PaddingLeft = UDim.new(0, 6) }, r)
            r.MouseButton1Click:Connect(function() selected = n; paint() end)
            rows[#rows + 1] = r
        end
        paint()
    end
    function api.get() return selected end
    return api
end

-- список игроков с мультивыбором: пишет прямо в переданный set
local function PlayerList(parent, height, set)
    local frame = new("ScrollingFrame", {
        Size = UDim2.new(1, 0, 0, height or 120), BorderSizePixel = 1, ScrollBarThickness = 2,
        CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y,
    }, parent)
    tint(frame, "BackgroundColor3", "frame")
    tint(frame, "BorderColor3", "border")
    list(frame, 0)

    local rows = {}
    -- выбор виден не только цветом: слева стоит галочка, иначе на светлых
    -- темах непонятно, кого именно ты отметил
    local function paint()
        for name, r in pairs(rows) do
            local on = set[name] == true
            r.TextColor3 = on and T.accent or T.dim
            r.Text = (on and "[x] " or "[  ] ") .. name
        end
    end
    repaint[#repaint + 1] = paint

    local function rebuild()
        for _, r in pairs(rows) do r:Destroy() end
        rows = {}
        for _, p in ipairs(game:GetService("Players"):GetPlayers()) do
            if p ~= game:GetService("Players").LocalPlayer then
                local name = p.Name
                local r = new("TextButton", {
                    Size = UDim2.new(1, 0, 0, 18), Text = name, Font = FONT, TextSize = SIZE,
                    BackgroundTransparency = 1, AutoButtonColor = false,
                    TextXAlignment = Enum.TextXAlignment.Left,
                }, frame)
                new("UIPadding", { PaddingLeft = UDim.new(0, 6) }, r)
                r.MouseButton1Click:Connect(function()
                    set[name] = (not set[name]) or nil
                    paint()
                end)
                rows[name] = r
            end
        end
        paint()
    end

    rebuild()
    game:GetService("Players").PlayerAdded:Connect(rebuild)
    game:GetService("Players").PlayerRemoving:Connect(rebuild)
    return { rebuild = rebuild }
end

-- bindId делает кнопку биндируемой: у действий нет состояния, поэтому режим
-- всегда Press и выбора Always/Toggle/Hold для них нет
local function Button(parent, text, callback, bindId)
    local b = new("TextButton", { Size = UDim2.new(1, 0, 0, 20), Text = "", BorderSizePixel = 1, AutoButtonColor = false }, parent)
    tint(b, "BackgroundColor3", "frame")
    tint(b, "BorderColor3", "border")
    local t = label(b, text, { center = true })
    b.MouseEnter:Connect(function() t.TextColor3 = T.accent end)
    b.MouseLeave:Connect(function() t.TextColor3 = T.text end)
    if callback then b.MouseButton1Click:Connect(callback) end

    if bindId and callback then
        BIND_NAME[bindId], BIND_ACTION[bindId] = text, callback
        local chip = new("Frame", { Size = UDim2.fromOffset(40, 14), Position = UDim2.new(1, -42, 0, 3),
            BorderSizePixel = 1, Visible = false, ZIndex = 4 }, b)
        tint(chip, "BackgroundColor3", "group")
        tint(chip, "BorderColor3", "border")
        local chipTxt = label(chip, "", { center = true, z = 5 })
        dyn(function() chipTxt.TextColor3 = T.accent end)
        BIND_UI[bindId] = { chip = chip, text = chipTxt, press = true }

        b.MouseButton2Click:Connect(function()
            local prev = listening
            listening = (listening == bindId) and nil or bindId
            if prev then refreshBind(prev) end
            refreshBind(bindId)
        end)
    end
    return b
end

-- items = { {"Create", fn}, ... } — кнопки в строку, равной ширины
local function ButtonRow(parent, items)
    local row = new("Frame", { Size = UDim2.new(1, 0, 0, 20), BackgroundTransparency = 1 }, parent)
    new("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 4),
        SortOrder = Enum.SortOrder.LayoutOrder }, row)
    local n = #items
    for _, it in ipairs(items) do
        Button(row, it[1], it[2]).Size = UDim2.new(1 / n, -4 * (n - 1) / n, 1, 0)
    end
    return row
end

--=============================== engine ===============================--
-- боевой движок, порт из старого хаба: роли, предсказание, выбор цели,
-- wallbang и перехват FireServer. Всё внутри do-блоков — регистры главного
-- чанка ограничены ~200, локали блока освобождаются на выходе.
local Players    = game:GetService("Players")
local RunService = game:GetService("RunService")
local LP = Players.LocalPlayer

local E, conns, dead = {}, {}, false
E.Drawing = Drawing
-- собственный перевыпуск FireServer (хук silent aim и force shoot) идёт под
-- этим флагом: защита checkcaller не всегда видит спawned-потоки, и без флага
-- такой вызов попадал бы в свой же хук бесконечной рекурсией
local reemit = false
local function tc(c) conns[#conns + 1] = c; return c end

E.notify = Notify

E.roleColor = {
    Murderer = Color3.fromRGB(255, 60, 60),    -- красный
    Sheriff  = Color3.fromRGB(70, 140, 255),   -- синий
    Hero     = Color3.fromRGB(255, 200, 60),   -- золотой
    Innocent = Color3.fromRGB(90, 220, 120),   -- зелёный
}

gui.Destroying:Connect(function()
    dead = true
    for _, c in ipairs(conns) do pcall(function() c:Disconnect() end) end
end)

-- роли -----------------------------------------------------------------
do
    local RoleCache, OriginalSheriff, CurrentHero, roleRound = {}, nil, nil, false

    local function isRoundActive()
        if roleRound then return true end
        if workspace:FindFirstChild("GunDrop") or workspace:FindFirstChild("Normal") then return true end
        for _, p in ipairs(Players:GetPlayers()) do
            local r = RoleCache[p.Name]
            if r and r ~= "Innocent" and r ~= "Dead" then return true end
            local c, bp = p.Character, p:FindFirstChildOfClass("Backpack")
            if (c and (c:FindFirstChild("Knife") or c:FindFirstChild("Gun") or c:FindFirstChild("Revolver")))
                or (bp and (bp:FindFirstChild("Knife") or bp:FindFirstChild("Gun") or bp:FindFirstChild("Revolver"))) then
                return true
            end
        end
        return false
    end
    E.isRoundActive = isRoundActive

    local function processData(data)
        if type(data) ~= "table" then return end
        for pn, pd in pairs(data) do
            if type(pd) == "table" then
                if pd.Dead == true or pd.Alive == false or pd.Role == "Dead" then
                    RoleCache[pn] = nil
                    if OriginalSheriff == pn then OriginalSheriff = nil end
                    if CurrentHero == pn then CurrentHero = nil end
                elseif pd.Role then
                    RoleCache[pn] = pd.Role
                    roleRound = true
                    if pd.Role == "Sheriff" and not OriginalSheriff then OriginalSheriff = pn end
                    if pd.Role == "Hero" then CurrentHero = pn end
                end
            end
        end
    end

    local rs = game:GetService("ReplicatedStorage")
    local changed = rs:FindFirstChild("PlayerDataChanged", true)
    if changed and changed:IsA("RemoteEvent") then
        tc(changed.OnClientEvent:Connect(processData))
    end

    task.spawn(function()
        local rem = rs:FindFirstChild("GetCurrentPlayerData", true) or rs:FindFirstChild("GetPlayerData", true)
        if not rem then return end
        local ok, data = pcall(function() return rem:InvokeServer() end)
        if ok then processData(data) end
    end)

    task.spawn(function()
        local mod = rs:FindFirstChild("CurrentRoundClient", true)
        if not mod then return end
        local ok, crc = pcall(require, mod)
        if not ok or type(crc) ~= "table" then return end
        local function pull()
            if type(crc.PlayerData) == "table" then RoleCache = {}; processData(crc.PlayerData) end
        end
        pull()
        if crc.PlayerDataChanged and crc.PlayerDataChanged.Event then
            tc(crc.PlayerDataChanged.Event:Connect(pull))
        end
        while not dead do task.wait(0.25); pcall(pull) end
    end)

    -- Быстрая очистка ролей при завершении раунда
    tc(RunService.Heartbeat:Connect(function()
        if not isRoundActive() then
            if roleRound then
                RoleCache = {}
                OriginalSheriff, CurrentHero = nil, nil
                roleRound = false
            end
        end
    end))

    -- Определение роли: живой скан оружия в руках/рюкзаке + кэш сетевых данных
    E.getRole = function(player)
        if not (player and player.Parent) then return "Innocent" end
        local c = player.Character
        local hum = c and c:FindFirstChildOfClass("Humanoid")
        if not (hum and hum.Health > 0) then return "Innocent" end

        -- 1. Скан инвентаря и персонажа на наличие оружия (наивысшая надежность)
        for _, box in ipairs({ c, player:FindFirstChildOfClass("Backpack") }) do
            if box then
                for _, item in ipairs(box:GetChildren()) do
                    if item:IsA("Tool") then
                        local n = item.Name:lower()
                        if n:find("knife") or item:FindFirstChild("KnifeServer") or item:FindFirstChild("Stab") then
                            RoleCache[player.Name] = "Murderer"
                            roleRound = true
                            return "Murderer"
                        elseif n:find("gun") or n:find("revolver") or n:find("luger") or item:FindFirstChild("Shoot") then
                            roleRound = true
                            if player.Name == CurrentHero then return "Hero" end
                            if not OriginalSheriff or OriginalSheriff == player.Name then
                                OriginalSheriff = player.Name
                                return "Sheriff"
                            end
                            return "Hero"
                        end
                    end
                end
            end
        end

        -- 2. Кэш сетевых данных
        local cached = RoleCache[player.Name]
        if cached == "Murderer" or cached == "Sheriff" or cached == "Hero" then
            return cached
        end

        return "Innocent"
    end
end

-- предсказание ---------------------------------------------------------
do
    local PRESETS = {
        Off    = 0,
        Low    = 0.5,
        Normal = 1.0,
        High   = 1.8,
    }
    E.PredictNames = { "Off", "Low", "Normal", "High" }

    local function getPingSeconds()
        local ping = 0.05
        pcall(function()
            local raw = LP:GetNetworkPing()
            if typeof(raw) == "number" and raw > 0 then
                ping = raw
            end
        end)
        return math.clamp(ping, 0.02, 0.4)
    end
    E.getPingSeconds = getPingSeconds

    local function getVelocity(char)
        if not char then return Vector3.zero end
        local hrp = char:FindFirstChild("HumanoidRootPart")
        if not hrp then return Vector3.zero end
        local vel = hrp.AssemblyLinearVelocity or hrp.Velocity or Vector3.zero
        if vel.Magnitude > 150 then
            vel = vel.Unit * 150
        end
        return vel
    end

    local function predictPos(char, partName, factor, projectileSpeed)
        local hrp = char:FindFirstChild("HumanoidRootPart")
        local part = (partName and char:FindFirstChild(partName))
            or char:FindFirstChild("Head")
            or char:FindFirstChild("UpperTorso")
            or char:FindFirstChild("Torso")
            or hrp
        if not (part and hrp) then return Vector3.zero end
        if factor == 0 then return part.Position end

        local vel = getVelocity(char)
        if vel.Magnitude < 0.2 then return part.Position end

        local ping = getPingSeconds()
        local totalTime = ping * factor

        -- Если задана скорость снаряда (например, для броска ножа): учитываем время полёта
        if projectileSpeed and projectileSpeed > 0 then
            local myHrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
            local myPos = myHrp and myHrp.Position or part.Position
            local dist = (part.Position - myPos).Magnitude
            totalTime = totalTime + (dist / projectileSpeed) * factor
        end

        local lead = vel * totalTime

        -- Учёт вертикального перемещения в прыжке/падении
        local hum = char:FindFirstChildOfClass("Humanoid")
        if hum and hum.FloorMaterial == Enum.Material.Air and vel.Y ~= 0 then
            lead = lead + Vector3.new(0, vel.Y * totalTime * 0.5, 0)
        end

        return part.Position + lead
    end

    E.predict = function(char, partName, presetName, factor, projectileSpeed)
        local mult = factor
        if mult == nil then
            if type(presetName) == "number" then
                mult = presetName
            else
                mult = PRESETS[presetName] or PRESETS.Normal
            end
        end
        return predictPos(char, partName, mult, projectileSpeed)
    end
end

-- пинг в секундах: им меряют и упреждение, и глубину бэктрака
E.pingSeconds = function()
    local ping = 0
    pcall(function() ping = LP:GetNetworkPing() end)
    return math.clamp(ping, 0.02, 0.5)
end

-- resolver ---------------------------------------------------------------
do
    local track = setmetatable({}, { __mode = "k" })
    local RING = 24

    E.resolverModes = { "Off", "Backtrack", "Predict", "Auto" }

    tc(RunService.Heartbeat:Connect(function()
        if (F.Resolver or "Off") == "Off" and not F.Backtrack then return end
        local now = os.clock()
        for _, p in ipairs(Players:GetPlayers()) do
            local hrp = p ~= LP and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
            if hrp then
                local ring = track[p]
                if not ring then ring = { n = 0 }; track[p] = ring end
                ring.n = (ring.n % RING) + 1
                ring[ring.n] = { t = now, p = hrp.Position, v = hrp.AssemblyLinearVelocity or hrp.Velocity or Vector3.zero }
            end
        end
    end))

    local function backtracked(player, depth)
        local ring = track[player]
        if not ring then return nil end
        local want, best, bestDt = os.clock() - depth, nil, math.huge
        for i = 1, RING do
            local e = ring[i]
            if e then
                local dt = math.abs(e.t - want)
                if dt < bestDt then bestDt, best = dt, e end
            end
        end
        return best and best.p or nil
    end

    E.resolve = function(player, char, part)
        local base = part.Position
        local mode = F.Resolver or "Off"
        if mode == "Off" then return base end

        local hrp = char:FindFirstChild("HumanoidRootPart")
        local vel = hrp and (hrp.AssemblyLinearVelocity or hrp.Velocity) or Vector3.zero
        local speed = Vector3.new(vel.X, 0, vel.Z).Magnitude
        local ping = E.getPingSeconds()
        local strength = (F.ResolverStrength or 100) / 100

        local function predictPoint()
            local capped = vel
            if capped.Magnitude > 120 then capped = capped.Unit * 120 end
            return base + capped * (ping * strength)
        end

        local function backtrackPoint()
            local past = backtracked(player, ping * strength)
            if not past or not hrp then return base end
            return base + (past - hrp.Position)
        end

        if mode == "Backtrack" then return backtrackPoint() end
        if mode == "Predict" then return predictPoint() end

        if speed < 3 then return base end
        if hrp then
            local past = backtracked(player, ping)
            if past then
                local actual = (hrp.Position - past).Magnitude
                local expected = speed * ping
                if math.abs(actual - expected) > 3 then return backtrackPoint() end
            end
        end
        return predictPoint()
    end
end

-- выбор цели -----------------------------------------------------------
E.targetChar = function(mode, wallCheck, aimPartName)
    local mine = LP.Character and (LP.Character:FindFirstChild("HumanoidRootPart")
        or LP.Character:FindFirstChild("Head"))
    if not mine then return nil end
    local best, bestScore = nil, math.huge

    local rp
    if wallCheck then
        rp = RaycastParams.new()
        rp.FilterType = Enum.RaycastFilterType.Exclude
    end

    for _, p in ipairs(Players:GetPlayers()) do
        if p ~= LP and p.Character then
            local hum = p.Character:FindFirstChildOfClass("Humanoid")
            local head = p.Character:FindFirstChild("Head") or p.Character:FindFirstChild("UpperTorso")
                or p.Character:FindFirstChild("Torso") or p.Character:FindFirstChild("HumanoidRootPart")
            if hum and hum.Health > 0 and head then
                local r = E.getRole(p)
                local ok = (mode == "Nearest")
                    or (mode == "SheriffOrHero" and (r == "Sheriff" or r == "Hero"))
                    or (mode == r)

                if ok and wallCheck and rp and LP.Character and LP.Character:FindFirstChild("Head") then
                    rp.FilterDescendantsInstances = { LP.Character, p.Character }
                    local from = LP.Character.Head.Position
                    local ray = workspace:Raycast(from, head.Position - from, rp)
                    if ray and ray.Instance then ok = false end
                end

                if ok then
                    local part = (aimPartName and p.Character:FindFirstChild(aimPartName)) or head
                    local d = (part.Position - mine.Position).Magnitude
                    if d < bestScore then bestScore, best = d, p.Character end
                end
            end
        end
    end
    return best
end

-- стрельба: анти-десинк, wallbang, разрешение выстрела ------------------
do
    local MAX_STEP, STALE_AFTER = 200, 2.5
    local lastSeen = setmetatable({}, { __mode = "k" })

    local function sanePos(char, hrp)
        local raw = hrp.Position
        if not F.SheriffAntiDesync then return raw end
        local myHrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        local origin = myHrp and myHrp.Position or raw
        local now, prev = tick(), lastSeen[char]

        local inBounds = (raw - origin).Magnitude <= 600 and math.abs(raw.Y - origin.Y) <= 400
        local plausible = true
        if inBounds and prev then
            plausible = (raw - prev.p).Magnitude <= MAX_STEP * math.max(now - prev.t, 1 / 60)
        end

        if inBounds and plausible then
            local vel = hrp.AssemblyLinearVelocity or hrp.Velocity or Vector3.zero
            if vel.Magnitude > MAX_STEP then
                vel = prev and (raw - prev.p) / math.max(now - prev.t, 1 / 60) or Vector3.zero
            end
            lastSeen[char] = { p = raw, v = vel, t = now }
            return raw
        end

        if not prev then return raw end
        local age = now - prev.t
        if age > STALE_AFTER then lastSeen[char] = nil; return raw end
        local step = prev.v * age
        if step.Magnitude > MAX_STEP * age then step = step.Unit * (MAX_STEP * age) end
        return prev.p + step
    end

    local function wallbangOrigin(hitPos, char)
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local vel = hrp and (hrp.AssemblyLinearVelocity or hrp.Velocity) or Vector3.zero
        local back = (vel.Magnitude > 1.5) and (-vel.Unit * 1.5) or Vector3.new(0, 0.8, 0)
        return CFrame.lookAt(hitPos + back, hitPos)
    end

    local function gunTarget()
        return E.targetChar("Murderer", F.SheriffWallCheck, "Head")
    end

    local function bestAimPart(char, from)
        local best, bestScore
        for _, name in ipairs({ "UpperTorso", "Torso", "Head", "LowerTorso" }) do
            local part = char:FindFirstChild(name)
            if part and part:IsA("BasePart") then
                local score = part.Size.X * part.Size.Y * part.Size.Z
                if from then
                    local rp = RaycastParams.new()
                    rp.FilterType = Enum.RaycastFilterType.Exclude
                    rp.FilterDescendantsInstances = { LP.Character, char }
                    if workspace:Raycast(from, part.Position - from, rp) then score = score * 0.01 end
                end
                if not bestScore or score > bestScore then bestScore, best = score, part end
            end
        end
        return best or (char and char:FindFirstChild("Head"))
    end

    E.resolveGunShot = function()
        local char = gunTarget()
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        if not hrp then return nil end

        local mode = F.SheriffPiercing and "Point Blank" or "Muzzle"
        local from
        if mode == "Muzzle" then
            local myHrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
            local att = myHrp and myHrp:FindFirstChild("GunRaycastAttachment")
            from = (att and att.WorldPosition) or (myHrp and myHrp.Position)
        end

        local aimPart = bestAimPart(char, from) or hrp
        local pos

        if (F.Resolver or "Off") ~= "Off" and F.Resolver ~= "Off" then
            local player = Players:GetPlayerFromCharacter(char)
            if player then
                local ok, p = pcall(E.resolve, player, char, aimPart)
                if ok and typeof(p) == "Vector3" then pos = p end
            end
        end
        if not pos and F.GunPredict and F.GunPredict ~= "Off" then
            local ok, p = pcall(E.predict, char, aimPart.Name, F.GunPredict)
            if ok and typeof(p) == "Vector3" then pos = p end
        end
        pos = pos or aimPart.Position
        if F.SheriffAntiDesync then pos = sanePos(char, hrp) + (pos - hrp.Position) end
        if pos ~= pos then pos = aimPart.Position end

        local originCF = (mode == "Point Blank") and wallbangOrigin(pos, char) or nil
        return pos, originCF
    end

    local function spots(args, n)
        local idx = {}
        for i = 1, n do
            local t = typeof(args[i])
            if t == "CFrame" or t == "Vector3" then idx[#idx + 1] = i end
        end
        return idx
    end

    local function writeSpot(args, i, pos)
        args[i] = (typeof(args[i]) == "Vector3") and pos or CFrame.new(pos)
    end

    local announced = false
    local function handleFire(self, ...)
        local n = select("#", ...)
        local args = table.pack(...)
        args.n = nil

        local rname = tostring(self and self.Name or "")

        -- 1. Выстрел из пистолета (Gun / Revolver)
        if rname == "Shoot" or rname:lower():find("shoot") then
            if E.playGunSound then pcall(E.playGunSound) end
            if F.SheriffSilentAim or F.SheriffPiercing then
                local pos, origin = E.resolveGunShot()
                if not pos then return nil end

                local idx = spots(args, n)
                if #idx == 0 then return nil end

                writeSpot(args, idx[#idx], pos)
                if origin and #idx > 1 then
                    args[idx[1]] = origin
                end

                if not announced then
                    announced = true
                    Notify("Silent Aim", "Shot redirected")
                    task.delay(1, function() announced = false end)
                end
                return args, n
            end
        end

        -- 2. Бросок ножа (Knife / Throw)
        if rname == "KnifeThrown" or rname:lower():find("throw") then
            if F.KnifeSilentAim then
                local char = (F.KnifePrioritize and E.targetChar("SheriffOrHero", F.KnifeWallCheck, "Head"))
                    or E.targetChar("Nearest", F.KnifeWallCheck, "Head")
                if not char then
                    char = E.targetChar("Nearest", false, "Head")
                end
                if not char then return nil end

                local part = char:FindFirstChild("Head") or char:FindFirstChild("UpperTorso")
                    or char:FindFirstChild("Torso") or char:FindFirstChild("HumanoidRootPart")
                if not part then return nil end

                local mode = F.KnifePredict or "Off"
                local pos
                if (F.Resolver or "Off") ~= "Off" and F.Resolver ~= "Off" then
                    local player = Players:GetPlayerFromCharacter(char)
                    if player then
                        local okR, p = pcall(E.resolve, player, char, part)
                        if okR and typeof(p) == "Vector3" then pos = p end
                    end
                end
                if not pos then
                    local knifeSpeed = (F.FlightSpeedControl and F.KnifeFlightSpeed) or 120
                    pos = (mode == "Off") and part.Position or E.predict(char, part.Name, mode, nil, knifeSpeed)
                end

                local idx = spots(args, n)
                if #idx == 0 then return nil end
                writeSpot(args, idx[#idx], pos)

                if not announced then
                    announced = true
                    Notify("Silent Aim", "Throw redirected")
                    task.delay(1, function() announced = false end)
                end
                return args, n
            end
        end

        return nil
    end

    -- Визуальная коррекция выстрела для шерифа
    if getconnections and hookfunction then
        task.spawn(function()
            local hooked = {}
            for _ = 1, 12 do
                local ok, event = pcall(function()
                    local rs = game:GetService("ReplicatedStorage")
                    local cs = rs:FindFirstChild("ClientServices", true)
                    return cs and cs:FindFirstChild("GunFired", true)
                end)
                if ok and event then
                    local okC, list = pcall(getconnections, event.OnClientEvent)
                    if okC and type(list) == "table" then
                        for _, conn in ipairs(list) do
                            local fn = conn and conn.Function
                            if fn and not hooked[fn] then
                                local old
                                local wrap = function(...)
                                    if F.SheriffPiercing then
                                        local n = select("#", ...)
                                        local args = table.pack(...)
                                        for i = 1, n do
                                            local t = typeof(args[i])
                                            if t == "Vector3" or t == "CFrame" then
                                                local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
                                                local att = hrp and hrp:FindFirstChild("GunRaycastAttachment")
                                                if att then
                                                    args[i] = att.WorldPosition
                                                    return old(table.unpack(args, 1, n))
                                                end
                                                break
                                            end
                                        end
                                    end
                                    return old(...)
                                end
                                if newcclosure then wrap = newcclosure(wrap) end
                                if pcall(function() old = hookfunction(fn, wrap) end) and old then
                                    hooked[fn] = true
                                end
                            end
                        end
                    end
                end
                if next(hooked) then return end
                task.wait(0.5)
            end
        end)
    end

    -- Универсальный перехват FireServer (__namecall + hookfunction)
    if hookmetamethod then
        local oldNamecall
        oldNamecall = hookmetamethod(game, "__namecall", newcclosure(function(self, ...)
            if not dead and not (checkcaller and checkcaller()) then
                local okName, name = pcall(getnamecallmethod)
                if okName and name == "FireServer" then
                    local ok, args, count = pcall(handleFire, self, ...)
                    if ok and type(args) == "table" then
                        -- Только self.FireServer. Через oldNamecall вызов в MM2
                        -- молча не доходит до сервера — это и есть «силент не
                        -- работает вообще».
                        return self.FireServer(self, table.unpack(args, 1, count or #args))
                    end
                end
            end
            return oldNamecall(self, ...)
        end))
    end

    -- Запасной путь: нужен, только если hookmetamethod недоступен. Держать оба
    -- сразу нельзя — один выстрел уходил бы на сервер дважды.
    if hookfunction and not hookmetamethod then
        pcall(function()
            local rawFire = Instance.new("RemoteEvent").FireServer
            local oldFire
            oldFire = hookfunction(rawFire, newcclosure(function(self, ...)
                if not dead and not (checkcaller and checkcaller()) then
                    local ok, args, count = pcall(handleFire, self, ...)
                    if ok and type(args) == "table" then
                        return oldFire(self, table.unpack(args, 1, count or #args))
                    end
                end
                return oldFire(self, ...)
            end))
        end)
    end
end

-- force shoot ----------------------------------------------------------
do
    local function heldGun()
        local function pick(box)
            if not box then return nil end
            for _, t in ipairs(box:GetChildren()) do
                if t:IsA("Tool") and t:FindFirstChild("Shoot") then return t end
            end
        end
        return pick(LP.Character), pick(LP:FindFirstChildOfClass("Backpack"))
    end

    local function mouseCF()
        local cam = workspace.CurrentCamera
        if not cam then return nil end
        local m = UIS:GetMouseLocation()
        local ray = cam:ViewportPointToRay(m.X, m.Y)
        local params = RaycastParams.new()
        params.FilterType = Enum.RaycastFilterType.Exclude
        params.FilterDescendantsInstances = { LP.Character }
        local hit = workspace:Raycast(ray.Origin, ray.Direction * 300, params)
        return CFrame.new(hit and hit.Position or (ray.Origin + ray.Direction * 300))
    end

    task.spawn(function()
        while not dead do
            if not F.ForceShoot then
                task.wait(0.2)
            else
                pcall(function()
                    local held, stowed = heldGun()
                    local gun = held or stowed
                    if not gun then return end
                    if not held then
                        local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
                        if hum then hum:EquipTool(stowed) end
                        return
                    end
                    if gun.Enabled == false then gun.Enabled = true end

                    local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
                    local att = hrp and hrp:FindFirstChild("GunRaycastAttachment")
                    if not att then return end

                    local originCF, targetCF = att.WorldCFrame, nil
                    if (F.ForceShootMode or "Target") == "Target" then
                        local pos, origin = E.resolveGunShot()
                        if not pos then return end
                        if origin then originCF = origin end
                        targetCF = CFrame.new(pos)
                    else
                        targetCF = mouseCF()
                    end
                    if targetCF then
                        reemit = true
                        pcall(gun.Shoot.FireServer, gun.Shoot, originCF, targetCF)
                        reemit = false
                        if E.playGunSound then E.playGunSound() end
                    end
                end)
                -- клиент отказывается стрелять по далёкой цели, поэтому дёргаем
                -- remote напрямую; 60 мс — просто чтобы не заваливать сервер,
                -- свой кулдаун у него всё равно есть
                task.wait(0.06)
            end
        end
    end)
end

-- kill suite -----------------------------------------------------------
do
    -- Пока нож в руках/рюкзаке — берём его ремоуты и запоминаем. После броска
    -- ножа в инвентаре нет, и без кэша аура летящего ножа и Kill Aura просто
    -- переставали что-либо делать.
    local lastStab, lastTouched = nil, nil
    local function knifeEvents()
        local c = LP.Character
        local knife = (c and c:FindFirstChild("Knife"))
            or (LP:FindFirstChildOfClass("Backpack") and LP.Backpack:FindFirstChild("Knife"))
        local ev = knife and knife:FindFirstChild("Events")
        if ev then
            local stab = ev:FindFirstChild("KnifeStabbed")
            local touched = ev:FindFirstChild("HandleTouched")
            if stab and touched then
                lastStab, lastTouched = stab, touched
                return stab, touched
            end
        end
        if lastStab and lastStab.Parent and lastTouched and lastTouched.Parent then
            return lastStab, lastTouched
        end
        return nil, nil
    end
    E.knifeEvents = knifeEvents

    -- нож работает прямо из рюкзака, экипировать не нужно
    local function killInstant(p)
        if not (p and p ~= LP and p.Character) then return false end
        local hum = p.Character:FindFirstChildOfClass("Humanoid")
        if not (hum and hum.Health > 0) then return false end
        local stab, touched = knifeEvents()
        if not (stab and touched) then return false end
        pcall(function() stab:FireServer() end)
        for _, part in ipairs(p.Character:GetChildren()) do
            if part:IsA("BasePart") then pcall(function() touched:FireServer(part) end) end
        end
        if E.playKillSound then E.playKillSound() end
        return true
    end
    E.killInstant = killInstant

    local killing = false
    local function murdererKill(p)
        if killing or not (p and p ~= LP and p.Character) then return false end
        local hum = p.Character:FindFirstChildOfClass("Humanoid")
        if not (hum and hum.Health > 0) then return false end
        local stab, touched = knifeEvents()
        if not (stab and touched) then return false end

        killing = true
        task.spawn(function()
            local myRoot = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
            local vRoot = p.Character:FindFirstChild("HumanoidRootPart")
            local saved
            if myRoot and vRoot and (myRoot.Position - vRoot.Position).Magnitude > 10 then
                saved = myRoot.CFrame
                pcall(function() myRoot.CFrame = vRoot.CFrame * CFrame.new(0, 0, 3) end)
                task.wait(0.2)
            end
            pcall(function() stab:FireServer() end)
            if p.Character then
                for _, part in ipairs(p.Character:GetChildren()) do
                    if part:IsA("BasePart") then pcall(function() touched:FireServer(part) end) end
                end
            end
            if saved then task.wait(0.2); pcall(function() myRoot.CFrame = saved end) end
            killing = false
        end)
        return true
    end
    E.murdererKill = murdererKill

    E.nearestPlayer = function()
        local myRoot = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        if not myRoot then return nil end
        local best, bestD
        for _, p in ipairs(Players:GetPlayers()) do
            local r = p ~= LP and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
            local hum = r and p.Character:FindFirstChildOfClass("Humanoid")
            if r and hum and hum.Health > 0 then
                local d = (r.Position - myRoot.Position).Magnitude
                if not bestD or d < bestD then bestD, best = d, p end
            end
        end
        return best
    end

    E.killAll = function()
        task.spawn(function()
            for _, p in ipairs(Players:GetPlayers()) do
                local hum = p ~= LP and p.Character and p.Character:FindFirstChildOfClass("Humanoid")
                if hum and hum.Health > 0 then killInstant(p) end
            end
        end)
    end

    local function isArmed(p)
        if not (p and p.Character) then return false end
        return p.Character:FindFirstChild("Gun") ~= nil
            or (p:FindFirstChildOfClass("Backpack") and p.Backpack:FindFirstChild("Gun") ~= nil)
    end

    local lastNear, lastSheriff, lastAura = 0, 0, 0
    tc(RunService.Heartbeat:Connect(function()
        if not (F.AutoKillSheriff or F.AutoKillNearest or F.KillAura) then return end
        if not knifeEvents() then return end
        local now = tick()

        if F.AutoKillSheriff and (now - lastSheriff) >= 0.25 then
            lastSheriff = now
            for _, p in ipairs(Players:GetPlayers()) do
                if p ~= LP and isArmed(p) then pcall(murdererKill, p) end
            end
        end
        if F.AutoKillNearest and (now - lastNear) >= 0.25 then
            lastNear = now
            local n = E.nearestPlayer()
            if n then pcall(murdererKill, n) end
        end
        if F.KillAura and (now - lastAura) >= 0.15 then
            lastAura = now
            local myRoot = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
            if myRoot then
                local range = F.KillAuraRange or 18
                for _, p in ipairs(Players:GetPlayers()) do
                    local hum = p ~= LP and p.Character and p.Character:FindFirstChildOfClass("Humanoid")
                    local r = hum and p.Character:FindFirstChild("HumanoidRootPart")
                    -- мёртвых и вайтлист пропускаем: без этого аура молотила по
                    -- трупам и выглядела «криво»
                    if r and hum.Health > 0 and not E.isWhitelisted(p)
                        and (r.Position - myRoot.Position).Magnitude <= range then
                        pcall(killInstant, p)
                    end
                end
            end
        end
    end))

    tc(UIS.InputBegan:Connect(function(i, gp)
        if gp or not F.ClickKill or i.UserInputType ~= Enum.UserInputType.MouseButton1 then return end
        local m = LP:GetMouse()
        local ch = m and m.Target and m.Target:FindFirstAncestorWhichIsA("Model")
        local victim = ch and Players:GetPlayerFromCharacter(ch)
        -- killInstant, а не murdererKill: последний подъезжает к жертве, а
        -- клик-килл должен убивать с места
        if victim then pcall(killInstant, victim) end
    end))
end

-- knife throw ----------------------------------------------------------
do
    local CollSvc = game:GetService("CollectionService")
    local origWindup, sites = nil, nil

    local function currentKnife()
        local c = LP.Character
        local k = c and c:FindFirstChild("Knife")
        if k then return k end
        local b = LP:FindFirstChildOfClass("Backpack")
        return b and b:FindFirstChild("Knife") or nil
    end

    -- замыкание анимаций ножа узнаём по апвалю-таблице с ThrowCharge/ThrowKnife
    local function isKnifeAnimTable(v)
        return type(v) == "table"
            and typeof(rawget(v, "ThrowCharge")) == "Instance"
            and typeof(rawget(v, "ThrowKnife")) == "Instance"
    end
    local function near(a, b) return type(a) == "number" and math.abs(a - b) < 1e-3 end

    -- No Swing Animation должен именно УБРАТЬ ожидание, а не просто спрятать
    -- анимацию: без правки виндапа бросок всё равно ждёт замах
    local function targetWindup()
        if F.FastThrow or F.NoThrowAnim then return 0.03 end
        if F.ThrowSpeedControl then return math.max((10 - (F.ThrowWindup or 6)) / 10, 0.03) end
        return origWindup
    end

    -- getgc(true) сканируем ОДИН раз и запоминаем адреса апвалей: полный скан
    -- на каждый эквип ножа морозил клиент на десятки секунд
    local function findSites()
        if not (getgc and debug and debug.getupvalues and debug.setupvalue) then return nil end
        local ok, gc = pcall(getgc, true)
        if not ok or type(gc) ~= "table" then return nil end

        local found = {}
        for _, fn in ipairs(gc) do
            if type(fn) == "function" then
                local okU, ups = pcall(debug.getupvalues, fn)
                if okU and type(ups) == "table" then
                    local isKnife = false
                    for _, v in pairs(ups) do
                        if isKnifeAnimTable(v) then isKnife = true break end
                    end
                    if isKnife then
                        for i, v in pairs(ups) do
                            if type(v) == "number" then
                                if near(v, origWindup) then
                                    found[#found + 1] = { fn = fn, idx = i, mul = 1 }
                                elseif near(v, origWindup * 2) then
                                    found[#found + 1] = { fn = fn, idx = i, mul = 2 }
                                end
                            end
                        end
                    end
                end
            end
        end
        return (#found > 0) and found or nil
    end

    local function applyWindup()
        if not (F.FastThrow or F.NoThrowAnim or F.ThrowSpeedControl) then return end
        local k = currentKnife()
        if not k then return end
        local attr = k:GetAttribute("ThrowSpeed")
        if type(attr) ~= "number" then return end
        origWindup = origWindup or attr
        local target = targetWindup()

        -- атрибут самого ножа: часть логики читает его напрямую
        pcall(function() k:SetAttribute("ThrowSpeed", target) end)

        sites = sites or findSites()
        if not sites then return end

        -- Замыкания анимации ножа пересоздаются вместе с персонажем и раундом,
        -- старые адреса апвалей становятся мусором — отсюда «сначала работает,
        -- потом нет». Проверяем, что патч лёг, и при промахе сканируем заново.
        local applied = 0
        for _, s in ipairs(sites) do
            pcall(debug.setupvalue, s.fn, s.idx, target * s.mul)
            local okRead, ups = pcall(debug.getupvalues, s.fn)
            if okRead and type(ups) == "table" and near(ups[s.idx], target * s.mul) then
                applied = applied + 1
            end
        end
        if applied == 0 then
            sites = findSites()
            for _, s in ipairs(sites or {}) do
                pcall(debug.setupvalue, s.fn, s.idx, target * s.mul)
            end
        end
    end
    E.applyWindup = function() task.spawn(applyWindup) end

    -- новый персонаж — новые замыкания: кэш сайтов сбрасываем
    tc(LP.CharacterAdded:Connect(function()
        sites = nil
        task.delay(2, applyWindup)
    end))

    -- нож появляется в руках/рюкзаке не сразу — ждём его, но без скана
    local function watch(container)
        if not container then return end
        if container:FindFirstChild("Knife") then task.spawn(applyWindup) end
        tc(container.ChildAdded:Connect(function(child)
            if child.Name == "Knife" then task.spawn(applyWindup) end
        end))
    end
    if LP.Character then watch(LP.Character) end
    tc(LP.CharacterAdded:Connect(watch))
    watch(LP:FindFirstChildOfClass("Backpack"))
    tc(LP.ChildAdded:Connect(function(c) if c:IsA("Backpack") then watch(c) end end))

    -- анимация броска ---------------------------------------------------
    local function isThrowTrack(track)
        local anim = track and track.Animation
        local label = tostring(track and track.Name or "") .. " "
            .. tostring(anim and anim.Name or "") .. " "
            .. tostring(anim and anim.AnimationId or "")
        return label:lower():find("throw", 1, true) ~= nil
    end
    local function hookAnimator(char)
        local hum = char and (char:FindFirstChildOfClass("Humanoid") or char:WaitForChild("Humanoid", 5))
        local animator = hum and (hum:FindFirstChildOfClass("Animator") or hum:WaitForChild("Animator", 5))
        if not animator then return end
        tc(animator.AnimationPlayed:Connect(function(track)
            if (F.FastThrow or F.NoThrowAnim) and isThrowTrack(track) then
                pcall(function() track:Stop(0) end)
            end
        end))
    end
    if LP.Character then task.defer(hookAnimator, LP.Character) end
    tc(LP.CharacterAdded:Connect(function(ch) task.defer(hookAnimator, ch) end))

    -- летящий нож: скорость и аура --------------------------------------
    local function dressKnife(part)
        if not (part and part:IsA("BasePart")) then return end

        if F.FlightSpeedControl then
            local speed = math.clamp(tonumber(F.KnifeFlightSpeed) or 100, 20, 400)
            pcall(function() part:SetAttribute("ThrowSpeed", speed) end)
        end

        if F.ThrowAura and not part:GetAttribute("AuraArmed") then
            pcall(function() part:SetAttribute("AuraArmed", true) end)
            task.spawn(function()
                -- нож живёт секунды, ремоуты уже в кэше knifeEvents
                while part.Parent and F.ThrowAura and not dead do
                    local range = math.clamp(tonumber(F.ThrowAuraRange) or 12, 1, 60)
                    for _, p in ipairs(Players:GetPlayers()) do
                        local hum = p ~= LP and p.Character and p.Character:FindFirstChildOfClass("Humanoid")
                        local r = hum and p.Character:FindFirstChild("HumanoidRootPart")
                        if r and hum.Health > 0 and not E.isWhitelisted(p)
                            and (r.Position - part.Position).Magnitude <= range then
                            pcall(E.killInstant, p)
                        end
                    end
                    RunService.Heartbeat:Wait()
                end
            end)
        end
    end

    local function onThrown(obj)
        if not (F.FlightSpeedControl or F.ThrowAura) then return end
        task.spawn(function()
            for _ = 1, 30 do
                if not obj.Parent then return end
                local vis = obj:FindFirstChild("KnifeVisual")
                if vis then
                    dressKnife(vis)
                    task.wait(0.05)
                    if vis.Parent then dressKnife(vis) end
                    return
                end
                task.wait(0.03)
            end
        end)
    end
    tc(CollSvc:GetInstanceAddedSignal("ThrowingKnife"):Connect(onThrown))
    E.reapplyFlight = function()
        for _, obj in ipairs(CollSvc:GetTagged("ThrowingKnife")) do onThrown(obj) end
    end
end

-- gun recovery ---------------------------------------------------------
-- Чистый пакетный подбор пистолета (Zero Teleport / Instant Touch Packet Replication):
-- 1. Никакого физического перемещения/телепортации персонажа (координаты игрока не меняются).
-- 2. Мгновенная детекция GunDrop через ChildAdded, DescendantAdded и Heartbeat.
-- 3. Пакетная отправка firetouchinterest всеми частями тела (HRP, Torso, Limbs, Head) 
--    напрямую во все BasePart дропа пистолета в 0ms.
-- 4. Автоматическая экипировка при падении оружия в инвентарь.
do
    local notify = E.notify
    local cached, isGrabbing = nil, false

    local function hasGun()
        local c, bp = LP.Character, LP:FindFirstChild("Backpack")
        return (c and (c:FindFirstChild("Gun") or c:FindFirstChild("Revolver")))
            or (bp and (bp:FindFirstChild("Gun") or bp:FindFirstChild("Revolver"))) and true or false
    end

    local function getGunTool()
        local c, bp = LP.Character, LP:FindFirstChild("Backpack")
        if c then
            local g = c:FindFirstChild("Gun") or c:FindFirstChild("Revolver")
            if g then return g end
        end
        if bp then
            local g = bp:FindFirstChild("Gun") or bp:FindFirstChild("Revolver")
            if g then return g end
        end
        return nil
    end

    local function findDrop()
        if cached and cached.Parent then return cached end
        cached = workspace:FindFirstChild("GunDrop")
        if cached then return cached end
        cached = workspace:FindFirstChild("GunDrop", true)
        return cached
    end

    local function getDropParts(drop)
        local parts = {}
        if not (drop and drop.Parent) then return parts end
        if drop:IsA("BasePart") then
            table.insert(parts, drop)
        end
        for _, obj in ipairs(drop:GetDescendants()) do
            if obj:IsA("BasePart") then
                table.insert(parts, obj)
            end
        end
        return parts
    end

    local function getAllLimbs(char)
        local limbs = {}
        if not char then return limbs end
        for _, v in ipairs(char:GetChildren()) do
            if v:IsA("BasePart") and not v.Name:lower():find("gun") and not v.Name:lower():find("knife") then
                table.insert(limbs, v)
            end
        end
        return limbs
    end

    local function sendTouchPackets(drop)
        if hasGun() then return true end
        local char = LP.Character
        if not char then return false end
        local limbs = getAllLimbs(char)
        local parts = getDropParts(drop)
        if #limbs == 0 or #parts == 0 then return false end

        if firetouchinterest then
            for _, dropPart in ipairs(parts) do
                for _, limb in ipairs(limbs) do
                    pcall(firetouchinterest, limb, dropPart, 0)
                    pcall(firetouchinterest, limb, dropPart, 1)
                end
            end
        end

        for _, prompt in ipairs(drop:GetDescendants()) do
            if prompt:IsA("ProximityPrompt") and fireproximityprompt then
                pcall(fireproximityprompt, prompt, 0)
            end
        end

        return hasGun()
    end

    local function turboGrab(drop, silent)
        if hasGun() then
            if not silent then notify("Grab Gun", "You already have the gun") end
            return true
        end
        if isGrabbing then return false end
        isGrabbing = true

        local d = drop or findDrop()
        if not d then
            isGrabbing = false
            if not silent then notify("Grab Gun", "No dropped gun found") end
            return false
        end

        -- Мгновенная отправка пачки пакетов в 0ms (без движения персонажа)
        local grabbed = false
        for _ = 1, 15 do
            if hasGun() then grabbed = true; break end
            sendTouchPackets(d)
            if hasGun() then grabbed = true; break end
        end

        if not grabbed then
            -- Краткий асинхронный цикл на 0.2s для сетевого подтверждения
            local start = os.clock()
            while not hasGun() and (os.clock() - start < 0.25) and d and d.Parent do
                sendTouchPackets(d)
                RunService.Heartbeat:Wait()
            end
            grabbed = hasGun()
        end

        if grabbed and F.AutoEquipGun then
            task.spawn(function()
                task.wait(0.02)
                local g = getGunTool()
                local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
                if g and g.Parent == LP:FindFirstChild("Backpack") and hum and hum.Parent then
                    hum:EquipTool(g)
                end
            end)
        end

        isGrabbing = false
        if grabbed and not silent then
            notify("Grab Gun", "Gun grabbed successfully!")
        end
        return grabbed
    end

    E.grabGun = function(silent)
        return turboGrab(findDrop(), silent)
    end

    -- Мгновенная детекция появления GunDrop через все события движка
    local function onGunDropDetected(drop)
        if not (drop and drop.Name == "GunDrop") then return end
        cached = drop
        if F.GunNotify then notify("Gun Dropped", "Sheriff died, gun on floor!") end
        if F.AutoGrabGun and not hasGun() then
            task.spawn(function()
                turboGrab(drop, true)
            end)
        end
    end

    tc(workspace.ChildAdded:Connect(onGunDropDetected))
    tc(workspace.DescendantAdded:Connect(onGunDropDetected))
    tc(workspace.DescendantRemoving:Connect(function(ch)
        if ch == cached then cached = nil end
    end))

    -- Real-time watcher: проверяет наличие GunDrop каждый Heartbeat при включенном AutoGrabGun
    tc(RunService.Heartbeat:Connect(function()
        if F.AutoGrabGun and not hasGun() and not isGrabbing then
            local d = findDrop()
            if d and d.Parent then
                task.spawn(function()
                    turboGrab(d, true)
                end)
            end
        end
    end))
end



-- movement -------------------------------------------------------------
-- всё в одном Heartbeat: десяток отдельных циклов на каждую фичу и был
-- источником постоянного лага в старом хабе
do
    local origZoom = LP.CameraMaxZoomDistance
    local xrayOrig = {}
    local bhopSpeed, spinY, spinOff = 16, 0, false
    local voidFloor = -400
    local safeCF, safeAt = nil, 0

    -- fly
    local function killFly()
        local c = LP.Character
        local hrp = c and c:FindFirstChild("HumanoidRootPart")
        if hrp then
            for _, n in ipairs({ "FlyBV", "FlyBG" }) do
                local x = hrp:FindFirstChild(n)
                if x then x:Destroy() end
            end
            hrp.AssemblyLinearVelocity, hrp.AssemblyAngularVelocity = Vector3.zero, Vector3.zero
        end
        local h = c and c:FindFirstChildOfClass("Humanoid")
        if h then h.PlatformStand = false end
    end
    E.stopFly = killFly

    -- noclip: CanCollide обязательно возвращаем, иначе проваливаемся сквозь пол
    local function setCollide(on)
        local c = LP.Character
        if not c then return end
        for _, p in ipairs(c:GetDescendants()) do
            if p:IsA("BasePart") and p.CanCollide ~= on then p.CanCollide = on end
        end
    end
    E.restoreCollide = function() setCollide(true) end

    tc(RunService.Stepped:Connect(function()
        if F.NoClip then setCollide(false) end
    end))

    local function airborne(hum)
        local st = hum:GetState()
        return st == Enum.HumanoidStateType.Freefall or st == Enum.HumanoidStateType.Jumping
    end

    tc(RunService.Heartbeat:Connect(function()
        local c = LP.Character
        local hum = c and c:FindFirstChildOfClass("Humanoid")
        local hrp = c and c:FindFirstChild("HumanoidRootPart")
        if not (hum and hrp) then return end

        local ws = F.WalkSpeed or 16
        if hum.WalkSpeed ~= ws then hum.WalkSpeed = ws end
        local jp = F.JumpPower or 50
        if hum.JumpPower ~= jp then hum.UseJumpPower = true; hum.JumpPower = jp end

        if F.AntiRagdoll and not E.busy then
            pcall(function()
                for _, st in ipairs({ Enum.HumanoidStateType.FallingDown, Enum.HumanoidStateType.Ragdoll,
                                      Enum.HumanoidStateType.Physics }) do
                    hum:SetStateEnabled(st, false)
                end
                if hum.PlatformStand and not F.Fly then hum.PlatformStand = false end
                local s = hum:GetState()
                if s == Enum.HumanoidStateType.FallingDown or s == Enum.HumanoidStateType.Ragdoll
                    or s == Enum.HumanoidStateType.Physics then
                    hum:ChangeState(Enum.HumanoidStateType.GettingUp)
                end
            end)
        end

        if F.AntiVoid and hrp.Position.Y <= voidFloor + 50 and hrp.AssemblyLinearVelocity.Y < -10 then
            hrp.AssemblyLinearVelocity = Vector3.new(hrp.AssemblyLinearVelocity.X, 250, hrp.AssemblyLinearVelocity.Z)
        end

        -- Анти-флинг: каждый кадр (импульс прилетает за один кадр, опрос на 10 Гц
        -- его пропускает). Просто обнулить скорость мало — тебя уже унесло,
        -- поэтому держим последнюю «нормальную» точку и возвращаемся на неё.
        -- Свой флинг не трогаем, иначе защита душит собственную атаку.
        if F.AntiFling and not (E.busy or F.Fly or F.Spinbot) then
            local speed = hrp.AssemblyLinearVelocity.Magnitude
            local spin = hrp.AssemblyAngularVelocity.Magnitude
            local now = tick()

            if speed > 120 or spin > 65 then
                hrp.AssemblyLinearVelocity, hrp.AssemblyAngularVelocity = Vector3.zero, Vector3.zero
                if safeCF and now - safeAt <= 2.5 then
                    hrp.CFrame = safeCF
                end
                if hum.PlatformStand then hum.PlatformStand = false end
            elseif speed < 65 and spin < 25 and hum.FloorMaterial ~= Enum.Material.Air
                and now - safeAt >= 0.12 then
                safeCF, safeAt = hrp.CFrame, now
            end

            for _, p in ipairs(Players:GetPlayers()) do
                local r = p ~= LP and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
                if r and (r.Position - hrp.Position).Magnitude <= 25 then
                    for _, v in ipairs(p.Character:GetChildren()) do
                        if v:IsA("BasePart") and v.CanCollide then v.CanCollide = false end
                    end
                end
            end
        end

        if F.Fly then
            if not hrp:FindFirstChild("FlyBV") then
                local bv = Instance.new("BodyVelocity")
                bv.Name, bv.MaxForce, bv.Velocity, bv.Parent = "FlyBV", Vector3.new(1e9, 1e9, 1e9), Vector3.zero, hrp
                local bg = Instance.new("BodyGyro")
                bg.Name, bg.MaxTorque, bg.D, bg.P, bg.CFrame, bg.Parent =
                    "FlyBG", Vector3.new(1e9, 1e9, 1e9), 100, 10000, hrp.CFrame, hrp
            end
            local bv, bg = hrp:FindFirstChild("FlyBV"), hrp:FindFirstChild("FlyBG")
            local cam = workspace.CurrentCamera
            if bv and bg and cam then
                local dir = Vector3.zero
                if UIS:IsKeyDown(Enum.KeyCode.W) then dir = dir + cam.CFrame.LookVector end
                if UIS:IsKeyDown(Enum.KeyCode.S) then dir = dir - cam.CFrame.LookVector end
                if UIS:IsKeyDown(Enum.KeyCode.A) then dir = dir - cam.CFrame.RightVector end
                if UIS:IsKeyDown(Enum.KeyCode.D) then dir = dir + cam.CFrame.RightVector end
                if UIS:IsKeyDown(Enum.KeyCode.Space) then dir = dir + Vector3.yAxis end
                if UIS:IsKeyDown(Enum.KeyCode.LeftShift) then dir = dir - Vector3.yAxis end
                if dir.Magnitude > 0 then dir = dir.Unit end
                bv.Velocity = bv.Velocity:Lerp(dir * (F.FlySpeed or 50), 0.15)
                bg.CFrame = bg.CFrame:Lerp(CFrame.new(hrp.Position, hrp.Position + cam.CFrame.LookVector), 0.15)
                hum.PlatformStand = true
            end
        end

        if F.SpeedGlitch or F.Bhop then
            local move, vel = hum.MoveDirection, hrp.AssemblyLinearVelocity
            if F.SpeedGlitch then
                if airborne(hum) and move.Magnitude > 0.05 then
                    hrp.AssemblyLinearVelocity = move * (F.AirSpeed or 50) + Vector3.new(0, vel.Y, 0)
                end
            elseif move.Magnitude > 0.05 then
                local maxS = math.max(F.BhopMax or 28, 16)
                if not airborne(hum) then
                    bhopSpeed = math.min(math.max(bhopSpeed, hum.WalkSpeed) + 5, maxS)
                end
                if airborne(hum) or UIS:IsKeyDown(Enum.KeyCode.Space) then
                    hrp.AssemblyLinearVelocity = move * bhopSpeed + Vector3.new(0, vel.Y, 0)
                end
            else
                bhopSpeed = hum.WalkSpeed
            end
        else
            bhopSpeed = 16
        end

        if F.Spinbot then
            if hum.AutoRotate then pcall(function() hum.AutoRotate = false end) end
            spinOff = true
            spinY = (spinY + (F.SpinSpeed or 20)) % 360
            pcall(function() hrp.CFrame = CFrame.new(hrp.Position) * CFrame.Angles(0, math.rad(spinY), 0) end)
        elseif spinOff then
            pcall(function() hum.AutoRotate = true end)
            spinOff = false
        end
    end))

    tc(UIS.JumpRequest:Connect(function()
        if not F.InfiniteJump then return end
        local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
        if hum and hum.Health > 0 then hum:ChangeState(Enum.HumanoidStateType.Jumping) end
    end))

    local okVU, VU = pcall(function() return game:GetService("VirtualUser") end)
    if okVU and VU then
        tc(LP.Idled:Connect(function()
            if F.AntiAFK then
                pcall(function() VU:CaptureController(); VU:ClickButton2(Vector2.new()) end)
            end
        end))
    end

    ------------------------------------------------------------------ камера
    E.setXray = function(on)
        for _, pt in ipairs(workspace:GetDescendants()) do
            if pt:IsA("BasePart") and pt.Name ~= "Baseplate"
                and pt.Parent and not pt.Parent:FindFirstChildOfClass("Humanoid") then
                if on then
                    if xrayOrig[pt] == nil then xrayOrig[pt] = pt.Transparency end
                    pt.Transparency = 0.7
                elseif xrayOrig[pt] then
                    pt.Transparency = xrayOrig[pt]
                end
            end
        end
        if not on then table.clear(xrayOrig) end
    end

    E.setCamClip = function(on)
        LP.DevCameraOcclusionMode = on and Enum.DevCameraOcclusionMode.Invisicam
            or Enum.DevCameraOcclusionMode.Zoom
    end
    E.setZoom = function(on) LP.CameraMaxZoomDistance = on and 100000 or origZoom end

    E.noBlackout = function()
        task.spawn(function()
            while F.NoBlackout and not dead do
                pcall(function()
                    local pg = LP:FindFirstChildOfClass("PlayerGui")
                    local fade = pg and pg:FindFirstChild("Fade")
                    local frame = fade and fade:FindFirstChild("Frame")
                    if frame and frame.BackgroundTransparency < 1 then frame.BackgroundTransparency = 1 end
                end)
                RunService.RenderStepped:Wait()
            end
        end)
    end

    -- ponytail: обратно не откатывается, как и в оригинале — вернуть текстуры
    -- и тени можно только перезаходом
    local lagged = false
    E.antiLag = function()
        if lagged then return end
        lagged = true
        pcall(function()
            local Lighting = game:GetService("Lighting")
            local terrain = workspace:FindFirstChildWhichIsA("Terrain")
            if terrain then
                terrain.WaterWaveSize, terrain.WaterWaveSpeed = 0, 0
                terrain.WaterReflectance, terrain.WaterTransparency = 0, 1
            end
            Lighting.GlobalShadows = false
            Lighting.FogEnd, Lighting.FogStart = 9e9, 9e9
            settings().Rendering.QualityLevel = 1
            for _, v in ipairs(workspace:GetDescendants()) do
                if v:IsA("BasePart") then
                    v.CastShadow, v.Material, v.Reflectance = false, Enum.Material.Plastic, 0
                elseif v:IsA("Decal") or v:IsA("Texture") then
                    v.Transparency = 1
                elseif v:IsA("ParticleEmitter") or v:IsA("Trail") then
                    v.Lifetime = NumberRange.new(0)
                elseif v:IsA("Smoke") or v:IsA("Fire") or v:IsA("Sparkles") then
                    v.Enabled = false
                end
            end
            for _, e in ipairs(Lighting:GetDescendants()) do
                if e:IsA("PostEffect") then e.Enabled = false end
            end
        end)
        E.notify("Anti Lag", "Graphics reduced. Undo only by rejoining.")
    end

    gui.Destroying:Connect(function()
        setCollide(true)
        killFly()
        E.setXray(false)
        LP.CameraMaxZoomDistance = origZoom
        local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
        if hum then hum.WalkSpeed, hum.JumpPower, hum.AutoRotate = 16, 50, true end
    end)
end

-- targets --------------------------------------------------------------
E.targets, E.whitelist = {}, {}
E.isWhitelisted = function(p) return p ~= nil and E.whitelist[p.Name] == true end

-- fling ----------------------------------------------------------------
-- порт 187 Reset Player v3 один в один: тот же void-reset, те же константы,
-- те же ретраи. Меняется только источник ролей — берём свой кэш вместо
-- отдельного запроса GetPlayerData.
do
    local activeResets, MAX_CONCURRENT = {}, 6
    -- пока идёт сброс, наши же защиты обязаны молчать: Anti-Fling гасил
    -- -200000 по Y, а Anti-Ragdoll снимал PlatformStand — флинг просто не
    -- успевал начаться
    E.busy = false
    local function setBusy()
        local n = 0
        for _ in pairs(activeResets) do n = n + 1 end
        E.busy = n > 0
    end

    local function touch(a, b)
        pcall(function()
            for _ = 1, 3 do
                firetouchinterest(a, b, 0)
                firetouchinterest(a, b, 1)
            end
        end)
    end

    local function restoreSelf(char, saved, origHeight)
        workspace.FallenPartsDestroyHeight = origHeight
        if not (char and saved) then return end
        local hum = char:FindFirstChildOfClass("Humanoid")
        local root = char:FindFirstChild("HumanoidRootPart")
        if not (hum and root) then return end

        root.CFrame = saved.cframe
        root.AssemblyLinearVelocity, root.AssemblyAngularVelocity = Vector3.zero, Vector3.zero
        root.Velocity, root.RotVelocity = Vector3.zero, Vector3.zero
        hum.PlatformStand = false
        hum:ChangeState(Enum.HumanoidStateType.GettingUp)
        if hum.Health < hum.MaxHealth then hum.Health = hum.MaxHealth end
        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") then part.CanCollide = true end
        end
    end

    local function countActive()
        local n = 0
        for _ in pairs(activeResets) do n = n + 1 end
        return n
    end

    local function voidReset(target, retry)
        if target == LP or E.isWhitelisted(target) or dead then return end
        if activeResets[target.UserId] then return end
        retry = retry or 0

        if countActive() >= MAX_CONCURRENT then
            task.defer(function()
                task.wait(0.05 * (retry + 1))
                voidReset(target, retry)
            end)
            return
        end

        local char = LP.Character
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        local root = hum and hum.RootPart
        local tChar = target.Character
        if not (hum and root and tChar) then return end

        local tRoot = tChar:FindFirstChild("HumanoidRootPart")
        local tHead = tChar:FindFirstChild("Head")
        if not tRoot then return end

        local touchParts = {}
        for _, name in ipairs({ "HumanoidRootPart", "Head", "UpperTorso", "Torso" }) do
            local p = tChar:FindFirstChild(name)
            if p then touchParts[#touchParts + 1] = p end
        end
        if #touchParts == 0 then
            for _, p in ipairs(tChar:GetChildren()) do
                if p:IsA("BasePart") then touchParts[#touchParts + 1] = p end
            end
        end

        local saved = { cframe = root.CFrame }
        local origHeight = workspace.FallenPartsDestroyHeight
        workspace.FallenPartsDestroyHeight = -math.huge
        hum.PlatformStand = true

        local bv = Instance.new("BodyVelocity")
        bv.MaxForce = Vector3.new(math.huge, math.huge, math.huge)
        bv.Velocity = Vector3.new(0, -200000, 0)
        bv.Parent = root

        local bg = Instance.new("BodyGyro")
        bg.MaxTorque = Vector3.new(math.huge, math.huge, math.huge)
        bg.P = 9e8
        bg.Parent = root

        local startAt, done, obj = tick(), false, { bv = bv, bg = bg }
        activeResets[target.UserId] = obj
        setBusy()

        local function cleanup(success)
            if done then return end
            done = true
            activeResets[target.UserId] = nil
            setBusy()
            if obj.conn then obj.conn:Disconnect(); obj.conn = nil end
            pcall(function() bv:Destroy() end)
            pcall(function() bg:Destroy() end)
            restoreSelf(char, saved, origHeight)

            if not success and retry < (F.FlingRetries or 3) then
                task.delay((F.FlingRetryDelay or 2) * 0.1, function()
                    if target.Parent and not E.isWhitelisted(target) then voidReset(target, retry + 1) end
                end)
            end
        end

        local frames = 0
        obj.conn = RunService.Heartbeat:Connect(function()
            frames = frames + 1

            if not target.Character or not tRoot.Parent then cleanup(true) return end
            if tick() - startAt >= 1.5 then cleanup(false) return end
            if not char.Parent or not root.Parent then cleanup(true) return end

            local headPos = (tHead and tHead.Position) or (tRoot.Position + Vector3.new(0, 2.5, 0))
            root.CFrame = CFrame.new(headPos)
            root.AssemblyLinearVelocity = Vector3.new(0, -200000, 0)
            root.AssemblyAngularVelocity = Vector3.new(15000, 15000, 15000)

            if frames % 2 == 1 then
                for _ = 1, 5 do
                    for _, part in ipairs(touchParts) do touch(root, part) end
                end
            else
                for _ = 1, 3 do
                    touch(root, tRoot)
                    if tHead then touch(root, tHead) end
                end
            end

            pcall(sethiddenproperty, root, "PhysicsRepRootPart", tRoot)
            if hum.Health < hum.MaxHealth * 0.5 then
                pcall(function() hum.Health = hum.MaxHealth end)
            end
        end)
    end
    E.voidReset = function(p) task.spawn(voidReset, p) end

    -- шериф ищется сначала по стволу в руках, потом по кэшу ролей
    E.findSheriff = function()
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP and not E.isWhitelisted(p) then
                local c, bp = p.Character, p:FindFirstChildOfClass("Backpack")
                if (c and c:FindFirstChild("Gun")) or (bp and bp:FindFirstChild("Gun")) then return p end
            end
        end
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP and not E.isWhitelisted(p) then
                local r = E.getRole(p)
                if r == "Sheriff" or r == "Hero" then return p end
            end
        end
    end

    E.findMurderer = function()
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP and not E.isWhitelisted(p) and E.getRole(p) == "Murderer" then return p end
        end
    end

    E.flingAll = function()
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP and not E.isWhitelisted(p) then E.voidReset(p) end
        end
    end

    E.flingSelected = function()
        for _, p in ipairs(Players:GetPlayers()) do
            if E.targets[p.Name] and not E.isWhitelisted(p) then E.voidReset(p) end
        end
    end

    -- авто-циклы: один поток на всё, тикает по самому частому интервалу
    task.spawn(function()
        while not dead do
            if F.AutoFlingSheriff then
                local t = E.findSheriff()
                if t then E.voidReset(t) end
            end
            if F.AutoFlingMurderer then
                local t = E.findMurderer()
                if t then E.voidReset(t) end
            end
            if F.LoopFlingSelected then E.flingSelected() end
            if F.LoopFlingAll then E.flingAll() end

            if F.FlingAura then
                local root = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
                if root then
                    local range = F.FlingAuraRange or 15
                    for _, p in ipairs(Players:GetPlayers()) do
                        local r = p ~= LP and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
                        if r and not E.isWhitelisted(p) and (root.Position - r.Position).Magnitude <= range then
                            E.voidReset(p)
                        end
                    end
                end
            end
            task.wait(0.25)
        end
    end)

    -- Touch Fling: никакого телепорта к жертве. Каждый кадр корню задаётся
    -- огромная скорость и тут же возвращается прежняя — сам стоишь на месте,
    -- но у любого, кого коснёшься, физика забирает этот импульс и уносит его.
    tc(RunService.Heartbeat:Connect(function()
        if not F.TouchFling then return end
        local char = LP.Character
        local root = char and char:FindFirstChild("HumanoidRootPart")
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if not (root and hum and hum.Health > 0) then return end

        local savedVel, savedRot = root.AssemblyLinearVelocity, root.AssemblyAngularVelocity
        local savedCF = root.CFrame
        root.AssemblyLinearVelocity = Vector3.new(9e4, 9e4, 9e4)
        root.AssemblyAngularVelocity = Vector3.new(0, 9e4, 0)
        task.defer(function()
            if root.Parent then
                root.AssemblyLinearVelocity = savedVel
                root.AssemblyAngularVelocity = savedRot
                root.CFrame = savedCF
            end
        end)
    end))

    tc(UIS.InputBegan:Connect(function(i, processed)
        if processed or not F.ClickFling then return end
        if i.UserInputType ~= Enum.UserInputType.MouseButton1 and i.UserInputType ~= Enum.UserInputType.Touch then return end
        local m = LP:GetMouse()
        local model = m and m.Target and m.Target:FindFirstAncestorWhichIsA("Model")
        local p = model and Players:GetPlayerFromCharacter(model)
        if p and p ~= LP and not E.isWhitelisted(p) then E.voidReset(p) end
    end))

    gui.Destroying:Connect(function()
        for _, r in pairs(activeResets) do
            if r.conn then r.conn:Disconnect() end
            pcall(function() r.bv:Destroy() end)
            pcall(function() r.bg:Destroy() end)
        end
        table.clear(activeResets)
    end)
end

-- bang / orbit ---------------------------------------------------------
-- Bang стоит вплотную к цели на месте и играет эмоцию дельфина, Orbit
-- держит дистанцию и крутится вокруг. Цель — первый отмеченный в Targets,
-- иначе ближайший игрок.
do
    local angle = 0
    local bangEmoteOn = false

    local function pickTarget()
        local myHrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        if not myHrp then return nil end
        for _, p in ipairs(Players:GetPlayers()) do
            local r = E.targets[p.Name] and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
            if r then return r end
        end
        local best, bestD
        for _, p in ipairs(Players:GetPlayers()) do
            local r = p ~= LP and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
            local hum = r and p.Character:FindFirstChildOfClass("Humanoid")
            if r and hum and hum.Health > 0 then
                local d = (r.Position - myHrp.Position).Magnitude
                if not bestD or d < bestD then best, bestD = r, d end
            end
        end
        return best
    end

    tc(RunService.Heartbeat:Connect(function(dt)
        if not (F.BangTarget or F.OrbitTarget) then
            bangEmoteOn = false
            return
        end
        local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        local target = hrp and pickTarget()
        if not target then return end

        local height = F.TargetHeight or 0
        if F.BangTarget then
            -- стоим на месте у цели, без кручения и дёрганья; эмоция
            -- дельфина играет один раз при включении
            if not bangEmoteOn then
                bangEmoteOn = true
                E.playEmote("Dolphin Dance")
            end
            hrp.CFrame = CFrame.new(target.Position + Vector3.new(0, height, 0))
        else
            bangEmoteOn = false
            angle = angle + dt * (F.OrbitSpeed or 3)
            local dist = F.TargetDistance or 6
            local pos = target.Position + Vector3.new(math.cos(angle) * dist, height, math.sin(angle) * dist)
            hrp.CFrame = CFrame.lookAt(pos, target.Position)
        end
        hrp.AssemblyLinearVelocity = Vector3.zero
    end))
end


-- invisible ------------------------------------------------------------
-- Сидячий метод: персонаж уезжает вверх, там к торсу приваривается невидимый
-- неанкоренный Seat, после чего Seat возвращают на исходную точку — он тянет
-- тело обратно, но сервер продолжает считать нас у сиденья. Себе показываем
-- полупрозрачным, чтобы было видно, где стоишь.
do
    local running, chair, savedTransparency = false, nil, {}

    local function setTransparency(char, value)
        if not char then return end
        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") or part:IsA("Decal") then
                if value then
                    if savedTransparency[part] == nil then savedTransparency[part] = part.Transparency end
                    part.Transparency = value
                elseif savedTransparency[part] ~= nil then
                    part.Transparency = savedTransparency[part]
                end
            end
        end
        if not value then table.clear(savedTransparency) end
    end

    local function dropChair()
        if chair then pcall(function() chair:Destroy() end); chair = nil end
        local stray = workspace:FindFirstChild("invischair")
        if stray then pcall(function() stray:Destroy() end) end
    end

    E.stopInvisible = function()
        if not running then return end
        running = false
        dropChair()
        setTransparency(LP.Character, nil)
    end

    E.startInvisible = function()
        if running then return end
        local char = LP.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local torso = char and (char:FindFirstChild("Torso") or char:FindFirstChild("UpperTorso"))
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if not (hrp and torso and hum and hum.Health > 0) then
            E.notify("Invisible", "No character", "warn")
            return
        end
        running = true

        -- saved держим вне pcall: при провале тело уже улетело на +500 по Y,
        -- и без сохранённой позиции обратно его не вернуть
        local saved = hrp.CFrame
        local far = saved.Position + Vector3.new(0, 500, 0)

        local ok = pcall(function()
            char:MoveTo(far)
            task.wait(0.15)

            dropChair()
            chair = Instance.new("Seat")
            chair.Name = "invischair"
            chair.Anchored, chair.CanCollide, chair.Transparency = false, false, 1
            chair.Position = far
            chair.Parent = workspace

            local weld = Instance.new("Weld")
            weld.Part0, weld.Part1 = chair, torso
            weld.Parent = chair
            task.wait()

            chair.CFrame = saved      -- сиденье утаскивает тело обратно
            setTransparency(char, 0.5)
        end)

        if not ok then
            running = false
            dropChair()
            setTransparency(char, nil)
            pcall(function() char:MoveTo(saved.Position) end)
            E.notify("Invisible", "Failed", "bad")
        else
            E.notify("Invisible", "Active")
        end
    end

    tc(LP.CharacterAdded:Connect(function()
        if not running then return end
        running = false
        table.clear(savedTransparency)
        dropChair()
        F.Invisible = false
    end))

    gui.Destroying:Connect(E.stopInvisible)
end

-- anti-coin ------------------------------------------------------------
-- на Heartbeat отодвигаем корень от монеты, на RenderStep возвращаем: сервер
-- видит нас в стороне и не засчитывает подбор
do
    local RADIUS = 3.2
    local savedCF, applied = nil, false

    local function restore()
        if not applied then return end
        applied = false
        local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        if hrp and savedCF then hrp.CFrame = savedCF end
        savedCF = nil
    end

    tc(RunService.Heartbeat:Connect(function()
        restore()
        if not F.AntiCoin then return end
        local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        if not hrp then return end

        local container = workspace:FindFirstChild("CoinContainer", true)
        if not container then return end
        local best, bestD
        for _, c in ipairs(container:GetChildren()) do
            if c:IsA("BasePart") and c.CanTouch then
                local d = (c.Position - hrp.Position).Magnitude
                if d < RADIUS and (not bestD or d < bestD) then best, bestD = c, d end
            end
        end
        if not best then return end

        local away = hrp.Position - best.Position
        away = Vector3.new(away.X, 0, away.Z)
        if away.Magnitude < 0.05 then away = hrp.CFrame.RightVector end

        savedCF, applied = hrp.CFrame, true
        hrp.CFrame = savedCF + away.Unit * ((RADIUS - bestD) + 0.6)
    end))

    local bindName = "InertiaAntiCoin_" .. math.random(1, 1e9)
    RunService:BindToRenderStep(bindName, Enum.RenderPriority.First.Value - 1, restore)
    gui.Destroying:Connect(function()
        pcall(function() RunService:UnbindFromRenderStep(bindName) end)
        restore()
    end)
end

-- desync ---------------------------------------------------------------
-- Продвинутый высокочастотный десинк: на Heartbeat/PostSimulation выбрасывает
-- серверную позицию и скорость по сложным траекториям (джиттер, гипер-орбита,
-- фликер-блинк, скай/войд, хаос), а на первом приоритете RenderStep мгновенно
-- возвращает на место. Для сервера и врагов моделька бешено мечется, а у
-- локального игрока ходьба и камера остаются идеально плавными.
do
    local lastCF, lastVel, lastAng, appliedTo = nil, nil, nil, nil
    local tickCount = 0
    local ghostPart = nil

    E.desyncModes = { "Ultra Jitter", "Hyper Orbit", "Teleport Blink", "Sky/Void Blink", "Random Chaos", "Sine Phase" }
    E.desyncAngles = { "Hyper Spin", "Random Chaos", "Inverted", "None" }
    E.velDesyncModes = { "Break Predict", "Sky Launch", "Random Chaos", "Tornado" }

    local function cleanupGhost()
        if ghostPart and ghostPart.Parent then
            pcall(function() ghostPart:Destroy() end)
        end
        ghostPart = nil
    end

    local function updateGhost(fakeCF)
        if not F.DesyncGhost then
            cleanupGhost()
            return
        end
        if not (fakeCF and typeof(fakeCF) == "CFrame") then return end
        if not (ghostPart and ghostPart.Parent) then
            local p = Instance.new("Part")
            p.Name = "DesyncServerGhost"
            p.Size = Vector3.new(2, 5, 1)
            p.CanCollide = false
            p.CanTouch = false
            p.CanQuery = false
            p.Anchored = true
            p.Material = Enum.Material.ForceField
            p.Color = Color3.fromRGB(255, 50, 130)
            p.Transparency = 0.45
            local box = Instance.new("SelectionBox")
            box.Adornee = p
            box.Color3 = Color3.fromRGB(255, 80, 220)
            box.LineThickness = 0.04
            box.Parent = p
            p.Parent = workspace
            ghostPart = p
        end
        if ghostPart then
            ghostPart.CFrame = fakeCF
        end
    end

    local function restoreNow()
        local hrp = appliedTo
        if not hrp then return end
        appliedTo = nil
        if hrp.Parent and lastCF then
            hrp.CFrame = lastCF
            if lastVel then hrp.AssemblyLinearVelocity = lastVel end
            if lastAng then hrp.AssemblyAngularVelocity = lastAng end
        end
        lastCF, lastVel, lastAng = nil, nil, nil
    end

    tc(RunService.Heartbeat:Connect(function()
        restoreNow()
        if not (F.Desync or F.VelDesync) then
            cleanupGhost()
            return
        end
        local char = LP.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if not (hrp and hum and hum.Health > 0) then
            cleanupGhost()
            return
        end

        local rnd = math.random
        local range = tonumber(F.DesyncRange) or 500
        local speed = tonumber(F.DesyncSpeed) or 20
        local mode = F.DesyncMode or "Ultra Jitter"
        local angMode = F.DesyncAngles or "Hyper Spin"
        local vMode = F.VelDesyncMode or "Break Predict"
        local vMult = tonumber(F.VelDesyncMult) or 10000

        lastCF = hrp.CFrame
        lastVel = hrp.AssemblyLinearVelocity
        lastAng = hrp.AssemblyAngularVelocity
        appliedTo = hrp
        tickCount = (tickCount + 1) % 1000000

        local fakeOffset = Vector3.zero

        if F.Desync then
            local t = os.clock() * speed
            if mode == "Ultra Jitter" then
                -- Бешеный мгновенный джиттер по всем осям каждый сетевой тик
                local step = tickCount % 6
                if step == 0 then
                    fakeOffset = Vector3.new(range, (rnd() - 0.5) * range * 0.4, 0)
                elseif step == 1 then
                    fakeOffset = Vector3.new(-range, (rnd() - 0.5) * range * 0.4, 0)
                elseif step == 2 then
                    fakeOffset = Vector3.new(0, (rnd() - 0.5) * range * 0.4, range)
                elseif step == 3 then
                    fakeOffset = Vector3.new(0, (rnd() - 0.5) * range * 0.4, -range)
                elseif step == 4 then
                    fakeOffset = Vector3.new(range * 0.75, range * 0.5, range * 0.75)
                else
                    fakeOffset = Vector3.new(-range * 0.75, -range * 0.3, -range * 0.75)
                end
            elseif mode == "Hyper Orbit" then
                -- Сверхбыстрое круговое и вертикальное вращение
                local angle = t * 6
                local r = range * (0.6 + 0.4 * math.sin(t * 3))
                fakeOffset = Vector3.new(math.cos(angle) * r, math.sin(t * 4) * (range * 0.35), math.sin(angle) * r)
            elseif mode == "Teleport Blink" then
                -- Мгновенный прыжок в противоположные точки карты
                if tickCount % 2 == 0 then
                    fakeOffset = Vector3.new(range, 0, range)
                else
                    fakeOffset = Vector3.new(-range, 0, -range)
                end
            elseif mode == "Sky/Void Blink" then
                -- Вылет в космос / бездну (убийство ножом физически невозможно)
                if tickCount % 2 == 0 then
                    fakeOffset = Vector3.new((rnd() - 0.5) * 50, math.clamp(range, 150, 3000), (rnd() - 0.5) * 50)
                else
                    fakeOffset = Vector3.new((rnd() - 0.5) * 50, -math.clamp(range * 0.5, 40, 400), (rnd() - 0.5) * 50)
                end
            elseif mode == "Random Chaos" then
                -- Полный 3D хаос во всех направлениях
                fakeOffset = Vector3.new(
                    (rnd() * 2 - 1) * range,
                    (rnd() * 2 - 1) * (range * 0.5),
                    (rnd() * 2 - 1) * range
                )
            elseif mode == "Sine Phase" then
                -- Сложные гармоники Лиссажу
                fakeOffset = Vector3.new(
                    math.sin(t * 1.8) * range,
                    math.cos(t * 3.0) * (range * 0.4),
                    math.cos(t * 2.2) * range
                )
            end

            -- Углы вращения модели
            local rot = CFrame.identity
            if angMode == "Hyper Spin" then
                local spin = (tickCount * 2.1) % 6.2832
                rot = CFrame.Angles(0, spin, 0) * CFrame.Angles(spin * 0.4, 0, spin * 0.2)
            elseif angMode == "Random Chaos" then
                rot = CFrame.Angles(rnd() * 6.2832, rnd() * 6.2832, rnd() * 6.2832)
            elseif angMode == "Inverted" then
                rot = CFrame.Angles(math.pi, 0, math.pi)
            end

            local fakeCF = (lastCF + fakeOffset) * rot
            hrp.CFrame = fakeCF
            updateGhost(fakeCF)
        else
            cleanupGhost()
        end

        -- Velocity Desync (разрушение чужих аимботов и систем упреждения)
        if F.VelDesync then
            local currentVel = lastVel or Vector3.zero
            if vMode == "Break Predict" then
                -- Инверсия скорости с огромным множителем (аимботы целятся в пустоту)
                if currentVel.Magnitude > 0.5 then
                    hrp.AssemblyLinearVelocity = -currentVel.Unit * vMult
                else
                    local rDir = Vector3.new(rnd() * 2 - 1, 0, rnd() * 2 - 1).Unit
                    hrp.AssemblyLinearVelocity = rDir * vMult
                end
            elseif vMode == "Sky Launch" then
                -- Скорость направлена вертикально вверх на миллионы единиц
                hrp.AssemblyLinearVelocity = Vector3.new(0, vMult * 5, 0)
            elseif vMode == "Random Chaos" then
                -- Дикий разброс скорости
                hrp.AssemblyLinearVelocity = Vector3.new(
                    (rnd() * 2 - 1) * vMult,
                    (rnd() * 2 - 1) * vMult,
                    (rnd() * 2 - 1) * vMult
                )
            elseif vMode == "Tornado" then
                -- Вихревая скорость
                local t = os.clock() * speed
                hrp.AssemblyLinearVelocity = Vector3.new(math.cos(t) * vMult, (rnd() - 0.5) * vMult, math.sin(t) * vMult)
                hrp.AssemblyAngularVelocity = Vector3.new(0, vMult, 0)
            end
        end
    end))

    local bindName = "InertiaDesync_" .. math.random(1, 1e9)
    RunService:BindToRenderStep(bindName, Enum.RenderPriority.First.Value - 1, restoreNow)
    gui.Destroying:Connect(function()
        pcall(function() RunService:UnbindFromRenderStep(bindName) end)
        cleanupGhost()
        restoreNow()
    end)
end

-- sound mutes ----------------------------------------------------------
do
    local WORDS = {
        MuteGun       = { "gun", "revolver", "fire", "shoot", "shot", "bang", "pistol", "luger" },
        MuteReload    = { "reload", "cock", "clip", "magazine", "chamber" },
        MuteCoin      = { "coin", "pickup", "collect", "ding", "cash", "gem", "bag" },
        MuteKill      = { "death", "die", "dead", "stab", "slash", "knife", "hit", "hurt", "splat", "kill",
                          "blood", "gib", "corpse", "thud", "squish", "scream", "grunt", "pain", "damage" },
        MuteNotify    = { "gameover", "roundover", "results", "win", "victory", "lose", "defeat", "timer" },
        MuteEffect    = { "ghost", "laser", "teddy", "slasher", "ice", "freeze", "vampire", "glitch",
                          "radioactive", "ninja", "portal", "blackhole", "tornado", "gold", "crystal",
                          "skull", "skeleton", "reaper", "effect", "shatter", "burn" },
        MuteFootsteps = { "step", "foot", "walk", "run", "jump", "land" },
        MuteAmbience  = { "ambience", "wind", "rain", "music", "bgm", "background", "loop" },
    }
    local muted = {}

    local function anyOn()
        for cat in pairs(WORDS) do if F[cat] then return true end end
        return false
    end

    local function catOf(s)
        local hay = (s.Name .. " " .. tostring(s.SoundId))
        local a = s.Parent
        for _ = 1, 4 do
            if not a then break end
            hay = hay .. " " .. a.Name
            a = a.Parent
        end
        hay = hay:lower()
        for cat, words in pairs(WORDS) do
            if F[cat] then
                for _, w in ipairs(words) do
                    if hay:find(w, 1, true) then return cat end
                end
            end
        end
        return nil
    end

    local function apply(s)
        if not s:IsA("Sound") then return end
        if catOf(s) then
            if muted[s] == nil then muted[s] = s.Volume end
            s.Volume = 0
        elseif muted[s] ~= nil then
            pcall(function() s.Volume = muted[s] end)
            muted[s] = nil
        end
    end

    E.refreshMutes = function()
        for _, root in ipairs({ workspace, game:GetService("SoundService"),
                                game:GetService("ReplicatedStorage"),
                                game:GetService("Lighting"),
                                Players.LocalPlayer and Players.LocalPlayer:FindFirstChild("PlayerGui") }) do
            if root then
                pcall(function()
                    for _, v in ipairs(root:GetDescendants()) do
                        if v:IsA("Sound") then apply(v) end
                    end
                end)
            end
        end
    end

    tc(game.DescendantAdded:Connect(function(v)
        if v:IsA("Sound") and anyOn() then
            task.defer(apply, v)
        end
    end))

    gui.Destroying:Connect(function()
        for s, vol in pairs(muted) do
            pcall(function() if s.Parent then s.Volume = vol end end)
        end
        table.clear(muted)
    end)
end

-- customs ---------------------------------------------------------------
local ASSETS = {
    Cursors = {
        "Custom 1=1028d1c250054253/main.png", "Custom 4=32cbd02f14954ef4/main.png",
        "Custom 7=4f4c9a87c01e490f/roblox.png", "Custom 9=6a87bfc524424853/main.png",
        "Custom 10=6b7e55af48664167/main.png", "Custom 13=85f59b6a10814324/main.png",
        "Custom 16=97a65223a9314414/main.png", "Custom 18=9ff8471710a94f43/main.png",
        "Custom 19=a0b0c3bdbdd14544/main.png", "Custom 20=a72e9f78c84b4f0c/roblox.png",
        "Custom 21=aeff2bbd3f074fa2/main.png", "Custom 22=c2146c1049964208/main.png",
        "Custom 24=e0f853686555455a/main.png",
    },
    Backgrounds = {
        "Background 1=036a6ebbf0134bb8/main.jpg", "Background 2=0430bc42c1e84854/main.jpg", "Background 3=0a494facc0b0473c/main.jpg",
        "Background 4=109861c68b3b4b60/main.jpg", "Background 5=11430ae3c33d45a8/main.jpg", "Background 6=125492efa56f478a/main.jpg",
        "Background 7=136624855f594aa7/main.jpg", "Background 8=1ad01966fa394d32/main.jpg", "Background 9=1b1ceb413323486b/main.png",
        "Background 10=1efd9eac64be4b83/main.jpg", "Background 11=211b907558584d82/main.jpg", "Background 12=265bfae499c54ed2/main.jpg",
        "Background 13=2911e41820024380/main.jpg", "Background 14=2a4a726f0b8e4cd2/main.jpg", "Background 15=2aadaecf64c6428c/main.jpg",
        "Background 16=2d859228c0244ddb/main.jpg", "Background 17=2ec6857c265b4b26/main.jpg", "Background 18=31c2b6deb4e64693/main.mp4",
        "Background 19=31ec1d8655b94d3d/main.jpg", "Background 20=382c7a9dbbf24402/main.jpg", "Background 21=3da893e204d249bf/main.jpg",
        "Background 22=3ea03c3306154ec9/main.jpg", "Background 23=3f35ba28a2e34470/main.jpg", "Background 24=4466ee9528974dac/main.jpg",
        "Background 25=45aefe3d14a042b3/main.png", "Background 26=4626758a277f4e68/main.jpg", "Background 27=476bbbf3ac94470e/main.jpg",
        "Background 28=49f0147d27234fad/main.jpg", "Background 29=4a1d97540d5a4c27/main.mp4", "Background 30=4a8e86f8ecf64cbc/main.jpg",
        "Background 31=4f8a4ac63c6e4880/main.jpg", "Background 32=4fcbcece6e014078/main.jpg", "Background 33=53c299e7bb5d44c4/main.png",
        "Background 34=54ea0309da674018/main.jpg", "Background 35=555dd8dfc7234657/main.png", "Background 36=59dfaaa93afc4ce9/main.jpg",
        "Background 37=5b50b18d8ef54ed5/main.jpg", "Background 38=5ddc1d6d6ce24f2d/main.jpg", "Background 39=5e005068d065482f/main.gif",
        "Background 40=60b6c5e23e6e46b8/main.jpg", "Background 41=627057fac7ee4ceb/main.jpg", "Background 42=641b48428a3b4b55/main.gif",
        "Background 43=6459c8d023b34f38/main.jpg", "Background 44=670c0e5b43a54acf/main.jpg", "Background 45=6759e17b0ae74b3f/main.jpg",
        "Background 46=6a039ee4176f41ce/main.jpg", "Background 47=6f90043495a64bc9/main.jpg", "Background 48=766ff813284d4334/main.gif",
        "Background 49=79720cfcf663420f/main.jpg", "Background 50=7ae6e2c206e94f76/main.jpg", "Background 51=816b7eb784564a63/main.png",
        "Background 52=85a6535e86ba4ae9/main.png", "Background 53=8808b916cf5944dc/main.jpg", "Background 54=8ae39a3855b14d6e/main.jpg",
        "Background 55=8b1b61e58e014195/main.jpg", "Background 56=8e56c34a02c747c4/main.jpg", "Background 57=8f622404e8be413b/main.jpg",
        "Background 58=8f830f3929f74482/main.png", "Background 59=8fa9df42183a4fd8/main.png", "Background 60=901875fdaa55426a/main.jpg",
        "Background 61=91560fac95d64458/main.webp", "Background 62=9670affa3ede480c/main.jpg", "Background 63=96d91eb8dacb40d3/main.mp4",
        "Background 64=9ae1bb42adf04778/main.png", "Background 65=9ea23a9677254d55/main.gif", "Background 66=a5fc360334804355/main.jpg",
        "Background 67=a794b35bdf7e4abe/main.png", "Background 68=a7d1619308804b44/main.mp4", "Background 69=a7f6d545ca72429e/main.png",
        "Background 70=aa241b3fd12e444e/main.jpg", "Background 71=b28fd7bfd8a94088/main.png", "Background 72=b69c18a42b9d4ee2/main.jpg",
        "Background 73=bbe054e9bce84f80/main.gif", "Background 74=bf3b1b07f36a40ef/main.jpg", "Background 75=c0ec8ce327994317/main.png",
        "Background 76=c550f4240da240a7/main.webp", "Background 77=c74d477fca59448e/main.mp4", "Background 78=c8e9d96d9321453b/main.jpg",
        "Background 79=ca1ccd6496a94c8e/main.jpg", "Background 80=ce24f659181041b0/main.jpg", "Background 81=cee0b8acb5b54681/main.jpg",
        "Background 82=cfeb2f1365c54bf8/main.jpg", "Background 83=d2925ac2d76d4676/main.jpg", "Background 84=d5706e75e51c4ab0/main.jpg",
        "Background 85=d731039e3e2f41fd/main.jpg", "Background 86=da9a6846fe304eb7/main.gif", "Background 87=dc0537d29d7c4c91/main.jpg",
        "Background 88=e3328d68234b4c18/main.jpg", "Background 89=e6e9a127b0344a67/main.jpg", "Background 90=e6eda2460f6f4c44/main.jpg",
        "Background 91=e7b9e192a81d48d0/main.jpg", "Background 92=f2083194618b4e90/main.gif", "Background 93=f50dab9bdb6044a7/main.jpg",
        "Background 94=f8087f04912c472f/main.jpg", "Background 95=f8828b9e96774479/main.jpg", "Background 96=fb13d21beada4df9/main.jpg",
        "Background 97=fc22006599e44644/main.gif", "Background 98=ff093ec6e1bb44a2/main.jpg",
    },
}

do
    local BASE = "https://raw.githubusercontent.com/Yanderov/lib/main/assets/"
    local CACHE = GAME_DIR .. "/cache"

    local function catalog(list, sep)
        local names, byName = {}, {}
        for _, entry in ipairs(list) do
            local name, rest = entry:match("^(.-)" .. sep .. "(.+)$")
            if name then
                names[#names + 1] = name
                byName[name] = rest
            end
        end
        return names, byName
    end

    E.assetNames, E.assetPaths = {}, {}

    local HITSOUNDS_DIR = GAME_DIR .. "/hitsounds"
    local HITSOUND_EXTS = { mp3 = true, wav = true, ogg = true }

    local PRESET_SOUNDS = {
        ["Neverlose"]      = "rbxassetid://6534948092",
        ["Skeet"]          = "rbxassetid://5442046069",
        ["Rust Headshot"]  = "rbxassetid://5043539486",
        ["Bell"]           = "rbxassetid://6534947240",
        ["Bubble"]         = "rbxassetid://6534947588",
        ["COD"]            = "rbxassetid://160432334",
        ["Minecraft Bow"]  = "rbxassetid://1053297525",
        ["Stapler"]        = "rbxassetid://6534947842",
        ["Primordial"]     = "rbxassetid://7339504786",
        ["Crowbar"]        = "rbxassetid://9114725049",
        ["Agpa2"]          = "rbxassetid://7141383794",
        ["Zingtrio"]       = "rbxassetid://6534947588",
        ["Bonk"]           = "rbxassetid://3941421689",
        ["Pop"]            = "rbxassetid://198598793",
        ["Hitmarker"]      = "rbxassetid://160432334",
    }

    local HITSOUND_FILES = {
        "agpa2.mp3", "bell.wav", "bubble.wav", "cod.wav", "connectpacanoff.mp3",
        "crowbar.wav", "mcbow.wav", "neverlose.wav", "primordial.wav",
        "rust_headshot.wav", "skeet.wav", "stapler.wav", "zingtrio.wav",
    }

    local function soundName(file)
        local stem, ext = file:match("^(.+)%.(%w+)$")
        if not stem or not ext then return nil end
        return HITSOUND_EXTS[ext:lower()] and stem or nil
    end

    E.soundNames = {
        "Default", "Neverlose", "Skeet", "Rust Headshot", "Bell", "Bubble",
        "COD", "Minecraft Bow", "Stapler", "Primordial", "Crowbar", "Bonk", "Pop", "Hitmarker"
    }
    E.hitsoundPaths = {}

    local function scanHitsounds()
        local seen = {}
        for _, n in ipairs(E.soundNames) do seen[n] = true end
        E.hitsoundPaths = {}
        if listfiles and isfolder and isfolder(HITSOUNDS_DIR) then
            for _, full in ipairs(listfiles(HITSOUNDS_DIR)) do
                local file = full:match("[\\/]([^\\/]+)$") or full
                local okN, name = pcall(soundName, file)
                if okN and name and not E.hitsoundPaths[name] then
                    E.hitsoundPaths[name] = full
                    if not seen[name] then
                        seen[name] = true
                        E.soundNames[#E.soundNames + 1] = name
                    end
                end
            end
        end
    end

    E.syncHitsounds = function(cb)
        task.spawn(function()
            if isfolder and makefolder and isfile and writefile then
                if not isfolder(GAME_DIR) then pcall(makefolder, GAME_DIR) end
                if not isfolder(HITSOUNDS_DIR) then pcall(makefolder, HITSOUNDS_DIR) end
                if isfolder(HITSOUNDS_DIR) then
                    for _, file in ipairs(HITSOUND_FILES) do
                        local full = HITSOUNDS_DIR .. "/" .. file
                        if not isfile(full) then
                            local got, body = pcall(function() return game:HttpGet(BASE .. "hitsounds/" .. file) end)
                            if got and type(body) == "string" and #body > 0 then
                                pcall(writefile, full, body)
                            end
                        end
                        task.wait()
                    end
                end
            end
            scanHitsounds()
            if E.onHitsounds then E.onHitsounds(E.soundNames) end
            if cb then cb() end
        end)
    end

    E.refreshHitsounds = function()
        scanHitsounds()
        if E.onHitsounds then E.onHitsounds(E.soundNames) end
    end
    pcall(scanHitsounds)

    -- Имя из списка или свой ID -> готовый SoundId
    local function resolveSound(name, customId)
        local manual = tostring(customId or ""):match("%d+")
        if manual and #manual >= 5 then return "rbxassetid://" .. manual end
        if name and name ~= "Default" then
            local path = E.hitsoundPaths[name]
            if path then
                local asset = getcustomasset or getsynasset
                if asset then
                    local okId, id = pcall(asset, path)
                    if okId and id ~= "" then return id end
                end
            end
            if PRESET_SOUNDS[name] then
                return PRESET_SOUNDS[name]
            end
            -- Поиск без учёта регистра
            for k, v in pairs(PRESET_SOUNDS) do
                if k:lower() == name:lower() or k:lower():gsub("%s+", "") == name:lower():gsub("%s+", "") then
                    return v
                end
            end
        end
        return "rbxassetid://5387431201"
    end
    E.resolveSound = resolveSound

    E.assetNames.Cursors, E.assetPaths.Cursors = catalog(ASSETS.Cursors, "=")
    E.assetNames.Backgrounds, E.assetPaths.Backgrounds = catalog(ASSETS.Backgrounds, "=")

    local SKY_DIR = GAME_DIR .. "/skyboxes"

    E.listSkyboxes = function()
        local out = {}
        if not (isfolder and listfiles) then return out end
        if not isfolder(SKY_DIR) then
            pcall(makefolder, SKY_DIR)
            return out
        end
        for _, entry in ipairs(listfiles(SKY_DIR)) do
            local name = entry:match("[\\/]([^\\/]+)$")
            if name and not name:find("%.") then
                out[#out + 1] = name
            end
        end
        table.sort(out)
        return out
    end

    E.assetNames.Skies = E.listSkyboxes()

    -- качаем один раз, дальше только читаем локальный файл
    local function fetch(path, sub)
        local asset = getcustomasset or getsynasset
        if not (path and path ~= "" and asset and isfolder and makefolder and isfile and writefile) then
            return ""
        end
        local dir = CACHE .. "/" .. (sub or "misc")
        -- Имя обязано быть уникальным на весь воркспейс: getcustomasset
        -- различает файлы только по имени, а headshot.mp3 лежит ещё и в кэше
        -- старого хаба — играл чужой файл вместо скачанного.
        local file = dir .. "/" .. ((sub or "misc") .. "_" .. path):gsub("[/\]", "_")

        local ok = pcall(function()
            if not isfolder(CACHE) then makefolder(CACHE) end
            if not isfolder(dir) then makefolder(dir) end
        end)
        if not ok then return "" end

        if not isfile(file) then
            local got, body = pcall(function() return game:HttpGet(BASE .. (sub or "misc") .. "/" .. path) end)
            if not (got and type(body) == "string" and #body > 0) then return "" end
            if not pcall(writefile, file, body) then return "" end
        end
        local okId, id = pcall(asset, file)
        return okId and id or ""
    end
    E.fetchAsset = fetch

    ------------------------------------------------------------------ курсор
    local cursorToken = 0
    E.applyCursor = function()
        cursorToken = cursorToken + 1
        local mine = cursorToken
        local path = F.CursorAsset and E.assetPaths.Cursors[F.CursorAsset]

        if not (F.CustomCursor and path) then
            if E.cursorImage then
                E.cursorImage.Image = "rbxasset://textures/Cursors/KeyboardMouse/ArrowCursor.png"
                E.cursorImage.ImageColor3 = T.accent
            end
            return
        end
        task.spawn(function()
            local id = fetch(path, "cursors")
            -- пока качали, могли выбрать другой курсор: старый ответ игнорируем
            if mine ~= cursorToken then return end
            if id ~= "" and E.cursorImage then
                E.cursorImage.Image = id
                E.cursorImage.ImageColor3 = Color3.new(1, 1, 1)
            elseif id == "" then
                Notify("Cursor", "Download failed", "warn")
            end
        end)
    end

    ----------------------------------------------------------------- скайбокс
    local origSky = nil

    local function findSkyFaceFile(folderPath, face)
        if not (listfiles and isfolder and isfolder(folderPath)) then return nil end
        local files = listfiles(folderPath)

        -- 1) точное совпадение имени: bk.png, bk.tex, bk.jpg и т.д.
        for _, f in ipairs(files) do
            local filename = f:match("[\\/]([^\\/]+)$") or f
            local nameNoExt, ext = filename:match("^(.+)%.(%w+)$")
            if nameNoExt and ext then
                local lowerName = nameNoExt:lower()
                if lowerName == face then return f end
            end
        end

        -- 2) суффикс: name_bk.png, sky512_bk.tex, etc.
        for _, f in ipairs(files) do
            local filename = f:match("[\\/]([^\\/]+)$") or f
            local lower = filename:lower()
            if lower:match("_" .. face .. "%.%w+$") or lower:match("%-" .. face .. "%.%w+$") then
                return f
            end
        end

        -- 3) синонимы: back, down/bottom, front, left, right, up/top
        local aliasMap = {
            bk = { "back" },
            dn = { "down", "bottom", "bot" },
            ft = { "front" },
            lf = { "left" },
            rt = { "right" },
            up = { "top", "up" },
        }
        local aliases = aliasMap[face] or {}
        for _, f in ipairs(files) do
            local filename = f:match("[\\/]([^\\/]+)$") or f
            local lower = filename:lower()
            for _, al in ipairs(aliases) do
                if lower:match("^" .. al .. "%.%w+$") or lower:match("_" .. al .. "%.%w+$") or lower:match("%-" .. al .. "%.%w+$") then
                    return f
                end
            end
        end

        return nil
    end

    E.applySkybox = function()
        local lighting = game:GetService("Lighting")
        if not F.CustomSky then
            local mine = lighting:FindFirstChild("InertiaSky")
            if mine then mine:Destroy() end
            if origSky then origSky.Parent = lighting; origSky = nil end
            return
        end
        local choice = F.SkyAsset
        local list = E.listSkyboxes()
        if #list == 0 then
            Notify("Sky", "skyboxes folder is empty", "warn")
            return
        end
        if not choice or not isfolder(SKY_DIR .. "/" .. choice) then
            choice = list[1]
            F.SkyAsset = choice
        end

        local folderPath = SKY_DIR .. "/" .. choice
        local asset = getcustomasset or getsynasset
        if not asset then
            Notify("Sky", "getcustomasset not supported", "warn")
            return
        end

        local bkFile = findSkyFaceFile(folderPath, "bk")
        local dnFile = findSkyFaceFile(folderPath, "dn")
        local ftFile = findSkyFaceFile(folderPath, "ft")
        local lfFile = findSkyFaceFile(folderPath, "lf")
        local rtFile = findSkyFaceFile(folderPath, "rt")
        local upFile = findSkyFaceFile(folderPath, "up")

        -- getcustomasset различает файлы ТОЛЬКО по имени, игнорируя папку.
        -- У всех наборов грани называются одинаково (sky512_bk.tex), поэтому
        -- разные сеты схлопывались в одну текстуру и небо не менялось.
        -- Плюс .tex движок за картинку не считает, хотя внутри это PNG.
        -- Решение: один раз копируем грань под уникальным именем с .png.
        local function toUri(f, face)
            if not f or f == "" then return "" end
            if not (isfile and readfile and writefile) then
                local ok, id = pcall(asset, f)
                return (ok and id) and id or ""
            end

            local unique = folderPath .. "/" .. choice:gsub("[^%w]", "_") .. "_" .. face .. ".png"
            if not isfile(unique) then
                local okRead, body = pcall(readfile, f)
                if not (okRead and body and #body > 0) then return "" end
                if not pcall(writefile, unique, body) then return "" end
            end
            local ok, id = pcall(asset, unique)
            return (ok and id) and id or ""
        end

        local bk, dn, ft = toUri(bkFile, "bk"), toUri(dnFile, "dn"), toUri(ftFile, "ft")
        local lf, rt, up = toUri(lfFile, "lf"), toUri(rtFile, "rt"), toUri(upFile, "up")

        if bk == "" and dn == "" and ft == "" and lf == "" and rt == "" and up == "" then
            Notify("Sky", "No sky textures in " .. choice, "warn")
            return
        end

        local fallback = (bk ~= "" and bk) or (ft ~= "" and ft) or (up ~= "" and up) or (rt ~= "" and rt) or (lf ~= "" and lf) or dn
        bk = (bk ~= "") and bk or fallback
        dn = (dn ~= "") and dn or fallback
        ft = (ft ~= "") and ft or fallback
        lf = (lf ~= "") and lf or fallback
        rt = (rt ~= "") and rt or fallback
        up = (up ~= "") and up or fallback

        local existing = lighting:FindFirstChildOfClass("Sky")
        if existing and existing.Name ~= "InertiaSky" then
            origSky = existing
            existing.Parent = nil
        end
        local mine = lighting:FindFirstChild("InertiaSky") or Instance.new("Sky")
        mine.Name = "InertiaSky"
        mine.SkyboxBk, mine.SkyboxDn, mine.SkyboxFt = bk, dn, ft
        mine.SkyboxLf, mine.SkyboxRt, mine.SkyboxUp = lf, rt, up
        mine.CelestialBodiesShown = false
        mine.SunAngularSize, mine.MoonAngularSize = 0, 0
        mine.Parent = lighting
    end

    -------------------------------------------------------------------- звуки
    local function gunSoundInstances()
        local out = {}
        for _, box in ipairs({ LP.Character, LP:FindFirstChildOfClass("Backpack") }) do
            if box then
                for _, tool in ipairs(box:GetChildren()) do
                    if tool:IsA("Tool") and tool:FindFirstChild("Shoot") then
                        for _, s in ipairs(tool:GetDescendants()) do
                            if s:IsA("Sound") then out[#out + 1] = s end
                        end
                    end
                end
            end
        end
        return out
    end

    local function playOnce(id, volume)
        if not id or id == "" then return end
        local soundId = tostring(id)
        if not (soundId:find("^rbxasset") or soundId:find("^http")) then
            local digits = soundId:match("%d+")
            if digits then soundId = "rbxassetid://" .. digits end
        end
        task.spawn(function()
            local s = Instance.new("Sound")
            s.SoundId = soundId
            s.Volume = math.clamp(tonumber(volume) or 0.8, 0, 5)
            s.Parent = game:GetService("SoundService")
            s:Play()
            task.delay(4, function()
                pcall(function() s:Destroy() end)
            end)
        end)
    end

    E.previewSound = function(kind)
        local vol = (F.KillSoundVolume or 70) / 100
        if kind == "kill" then
            playOnce(E.resolveSound(F.KillSoundAsset, F.KillSoundId), vol)
        else
            playOnce(E.resolveSound(F.GunSoundAsset, F.GunSoundId), vol)
        end
    end

    E.playKillSound = function()
        if not F.CustomKillSound then return end
        playOnce(E.resolveSound(F.KillSoundAsset, F.KillSoundId), (F.KillSoundVolume or 70) / 100)
    end

    E.playGunSound = function()
        if not F.CustomGunSound then return end
        playOnce(E.resolveSound(F.GunSoundAsset, F.GunSoundId), (F.KillSoundVolume or 70) / 100)
    end

    -- Авто-детекция убийств для воспроизведения Kill Sound
    task.spawn(function()
        local deadPlayers = {}
        while not dead do
            if F.CustomKillSound then
                for _, p in ipairs(Players:GetPlayers()) do
                    if p ~= LP and p.Character then
                        local hum = p.Character:FindFirstChildOfClass("Humanoid")
                        if hum then
                            if hum.Health <= 0 and not deadPlayers[p.Name] then
                                deadPlayers[p.Name] = true
                                E.playKillSound()
                            elseif hum.Health > 0 and deadPlayers[p.Name] then
                                deadPlayers[p.Name] = nil
                            end
                        end
                    end
                end
            end
            task.wait(0.2)
        end
    end)

    local DEFAULT_SHOT = "rbxassetid://5387431201"
    local SHOT_HINTS = { "fire", "shoot", "shot", "gunshot", "bang", "blast" }
    local originalIds = setmetatable({}, { __mode = "k" })
    local watched = setmetatable({}, { __mode = "k" })
    local wantedId = nil

    local function isLocalGunSound(sound)
        local char, bp = LP.Character, LP:FindFirstChildOfClass("Backpack")
        local mine = (char and sound:IsDescendantOf(char)) or (bp and sound:IsDescendantOf(bp))
        if not mine then return false end
        local tool = sound:FindFirstAncestorWhichIsA("Tool")
        return tool ~= nil and (tool.Name:lower():find("gun", 1, true) ~= nil or tool.Name:lower():find("revolver", 1, true) ~= nil)
    end

    local function looksLikeShot(sound)
        local n = sound.Name:lower()
        for _, hint in ipairs(SHOT_HINTS) do
            if n:find(hint, 1, true) then return true end
        end
        return false
    end

    local function retarget(sound)
        if not (sound:IsA("Sound") and sound.SoundId ~= "") then return end
        local original = originalIds[sound]
        if not original then
            if sound.SoundId == DEFAULT_SHOT or (isLocalGunSound(sound) and looksLikeShot(sound)) then
                original = sound.SoundId
                originalIds[sound] = original
            else
                return
            end
        end
        if wantedId and wantedId ~= "" then
            if sound.SoundId ~= wantedId then sound.SoundId = wantedId end
        elseif sound.SoundId ~= original then
            sound.SoundId = original
        end
    end

    local function watch(inst)
        if not (inst:IsA("Sound") and not watched[inst]) then return end
        watched[inst] = true
        retarget(inst)
        tc(inst:GetPropertyChangedSignal("SoundId"):Connect(function() retarget(inst) end))
    end

    tc(game.DescendantAdded:Connect(function(inst)
        if inst:IsA("Sound") then task.defer(watch, inst) end
    end))

    E.applyGunSound = function()
        if not F.CustomGunSound then
            wantedId = nil
            for sound in pairs(originalIds) do
                if sound.Parent then retarget(sound) end
            end
            return
        end
        local id = E.resolveSound(F.GunSoundAsset, F.GunSoundId)
        wantedId = id or DEFAULT_SHOT
        for _, root in ipairs({ workspace, LP.Character, LP:FindFirstChildOfClass("Backpack") }) do
            if root then
                for _, d in ipairs(root:GetDescendants()) do
                    if d:IsA("Sound") then watch(d) end
                end
            end
        end
        for sound in pairs(originalIds) do
            if sound.Parent then retarget(sound) end
        end
    end

    task.spawn(function()
        while not dead do
            if F.CustomGunSound and wantedId then
                for sound in pairs(originalIds) do
                    if sound.Parent then retarget(sound) end
                end
            end
            task.wait(1.5)
        end
    end)

    ----------------------------------------------------------------- фон меню
    E.applyBackground = function()
        local img = win:FindFirstChild("InertiaBackground")
        if not F.MenuBackground then
            if img then img:Destroy() end
            return
        end
        local path = F.BackgroundAsset and E.assetPaths.Backgrounds[F.BackgroundAsset]
        if not path then return end
        task.spawn(function()
            local id = fetch(path, "backgrounds")
            if id == "" then Notify("Background", "Download failed", "warn") return end
            img = win:FindFirstChild("InertiaBackground")
            if not img then
                img = new("ImageLabel", {
                    Name = "InertiaBackground", BackgroundTransparency = 1, ZIndex = 0,
                    Size = UDim2.new(1, -2, 1, -2), Position = UDim2.fromOffset(1, 1),
                    ImageTransparency = 0.85, ScaleType = Enum.ScaleType.Crop,
                }, win)
            end
            img.Image = id
        end)
    end
end

-- teleport ---------------------------------------------------------------
do
    local TeleportService = game:GetService("TeleportService")

    -- телепорт с гашением инерции: без этого после прыжка тебя утаскивает
    local function safeTP(cf)
        local char = LP.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        if not hrp then return false end
        if typeof(cf) == "Vector3" then cf = CFrame.new(cf) end

        local function zero()
            hrp.AssemblyLinearVelocity, hrp.AssemblyAngularVelocity = Vector3.zero, Vector3.zero
        end
        zero()
        hrp.CFrame = cf
        zero()
        task.spawn(function()
            local deadline = tick() + 0.32
            while tick() < deadline and hrp.Parent do
                zero()
                RunService.Heartbeat:Wait()
            end
        end)
        return true
    end
    E.safeTP = safeTP

    E.gotoRole = function(want)
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP and p.Character then
                local r = E.getRole(p)
                local ok = (want == "Murderer" and r == "Murderer")
                    or (want == "Sheriff" and (r == "Sheriff" or r == "Hero"))
                local pr = ok and p.Character:FindFirstChild("HumanoidRootPart")
                if pr then
                    safeTP(pr.CFrame * CFrame.new(0, 0, 3))
                    Notify("Teleport", "> " .. p.Name)
                    return
                end
            end
        end
        Notify("Teleport", want .. " not found", "warn")
    end

    E.gotoPlayer = function(name)
        if not name or name == "" then return end
        local needle = name:lower()
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP and p.Name:lower():sub(1, #needle) == needle then
                local pr = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
                if pr then
                    safeTP(pr.CFrame * CFrame.new(0, 0, 3))
                    Notify("Teleport", "> " .. p.Name)
                    return
                end
            end
        end
        Notify("Teleport", "Player not found", "warn")
    end

    E.gotoLobby = function()
        local lb = workspace:FindFirstChild("Lobby") or workspace:FindFirstChild("RegularLobby")
        local spawnPart = lb and (lb:FindFirstChildOfClass("SpawnLocation") or lb:FindFirstChildWhichIsA("BasePart", true))
        if not spawnPart then
            for _, v in ipairs(workspace:GetDescendants()) do
                if v:IsA("SpawnLocation") then spawnPart = v break end
            end
        end
        if spawnPart then
            safeTP(spawnPart.CFrame + Vector3.new(0, 3, 0))
            Notify("Teleport", "Lobby")
        else
            Notify("Teleport", "Lobby not found", "warn")
        end
    end

    -- карта опознаётся как самая большая плоская анкоренная деталь вне лобби
    E.gotoMap = function()
        if not E.isRoundActive() then
            Notify("Teleport", "Still in lobby", "warn")
            return
        end
        local lobby = workspace:FindFirstChild("RegularLobby") or workspace:FindFirstChild("Lobby")
        local best, bestVol = nil, 0
        for _, v in ipairs(workspace:GetDescendants()) do
            if v:IsA("BasePart") and v.Anchored and v ~= workspace.Terrain
                and not (lobby and v:IsDescendantOf(lobby)) then
                local isChar = false
                for _, p in ipairs(Players:GetPlayers()) do
                    if p.Character and v:IsDescendantOf(p.Character) then isChar = true break end
                end
                local sz = v.Size
                local vol = sz.X * sz.Y * sz.Z
                if not isChar and vol > bestVol and sz.X > 8 and sz.Z > 8 and sz.Y < 20 then
                    best, bestVol = v, vol
                end
            end
        end
        if best then
            safeTP(CFrame.new(best.Position + Vector3.new(0, best.Size.Y / 2 + 5, 0)))
            Notify("Teleport", "Map (" .. best.Name .. ")")
            return
        end

        local sum, count = Vector3.zero, 0
        for _, p in ipairs(Players:GetPlayers()) do
            local pr = p ~= LP and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
            if pr then sum, count = sum + pr.Position, count + 1 end
        end
        if count > 0 then
            safeTP(CFrame.new(sum / count + Vector3.new(0, 5, 0)))
            Notify("Teleport", "Map center")
        else
            Notify("Teleport", "No reference point", "warn")
        end
    end

    -- Click TP по E
    tc(UIS.InputBegan:Connect(function(i, gp)
        if gp or not F.ClickTP or i.KeyCode ~= Enum.KeyCode.E then return end
        if UIS:GetFocusedTextBox() then return end
        local m = LP:GetMouse()
        if m and m.Hit then safeTP(m.Hit + Vector3.new(0, 3, 0)) end
    end))

    E.rejoin = function()
        pcall(function() TeleportService:TeleportToPlaceInstance(game.PlaceId, game.JobId, LP) end)
    end

    E.serverHop = function()
        Notify("Server", "Searching for a server...")
        task.spawn(function()
            local ok, body = pcall(function()
                return game:HttpGet("https://games.roblox.com/v1/games/" .. game.PlaceId
                    .. "/servers/Public?sortOrder=Asc&limit=100")
            end)
            if ok and type(body) == "string" then
                local decoded, data = pcall(function()
                    return game:GetService("HttpService"):JSONDecode(body)
                end)
                if decoded and type(data) == "table" and data.data then
                    for _, srv in ipairs(data.data) do
                        if type(srv) == "table" and srv.playing and srv.maxPlayers
                            and srv.playing < srv.maxPlayers and srv.id ~= game.JobId then
                            pcall(function() TeleportService:TeleportToPlaceInstance(game.PlaceId, srv.id, LP) end)
                            return
                        end
                    end
                end
            end
            Notify("Server", "No server found, plain teleport", "warn")
            pcall(function() TeleportService:Teleport(game.PlaceId, LP) end)
        end)
    end

    -- автофарм монет: прыгаем по монетам с настраиваемой скоростью
    local function eachCoin()
        local out = {}
        local root = workspace:FindFirstChild("CoinContainer", true) or workspace:FindFirstChild("Normal")
        if not root then return out end
        for _, v in ipairs(root:GetDescendants()) do
            if v:IsA("BasePart") and v.CanTouch and v.Transparency < 1 then out[#out + 1] = v end
        end
        return out
    end

    task.spawn(function()
        while not dead do
            if not F.FastAutofarm then
                task.wait(0.3)
            else
                local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
                local coins = hrp and eachCoin() or {}
                if #coins == 0 then
                    task.wait(0.5)
                else
                    local step = 1 / math.max(F.AutofarmSpeed or 20, 1)
                    for _, coin in ipairs(coins) do
                        if not (F.FastAutofarm and coin.Parent and hrp.Parent) then break end
                        hrp.CFrame = coin.CFrame + Vector3.new(0, 2, 0)
                        hrp.AssemblyLinearVelocity = Vector3.zero
                        task.wait(step)
                    end
                end
            end
        end
    end)

    -- vote farm: точки голосования за карту + серия ресетов
    local VOTE_SLOTS = {
        ["1"] = Vector3.new(-8, -64, -94),
        ["2"] = Vector3.new(0, -64, -96),
        ["3"] = Vector3.new(10, -64, -93),
    }
    -- Auto Vote: кнопки голосования живут в PlayerGui и пересоздаются каждый
    -- раз, поэтому не ищем один раз, а сканируем и жмём Activate по кругу.
    local lastButton, lastAt, nextScan = nil, 0, 0

    local function voteCandidates()
        local pg = LP:FindFirstChildOfClass("PlayerGui")
        if not pg then return {} end
        local found = {}
        for _, obj in ipairs(pg:GetDescendants()) do
            if obj:IsA("GuiButton") and obj.Visible and obj.Active and not obj:IsDescendantOf(gui) then
                local text = ""
                pcall(function() text = tostring(obj.Text or "") end)
                local ctx = (obj.Name .. " " .. text):lower()
                local parent = obj.Parent
                for _ = 1, 4 do
                    if not parent then break end
                    ctx = ctx .. " " .. parent.Name:lower()
                    parent = parent.Parent
                end
                if ctx:find("vote", 1, true) or ctx:find("map", 1, true) then
                    found[#found + 1] = {
                        button = obj,
                        slot = tonumber(ctx:match("[^%d](%d)[^%d]")) or tonumber(ctx:match("(%d)$")),
                        x = obj.AbsolutePosition.X,
                    }
                end
            end
        end
        table.sort(found, function(a, b)
            if a.slot and b.slot and a.slot ~= b.slot then return a.slot < b.slot end
            if a.slot and not b.slot then return true end
            if b.slot and not a.slot then return false end
            return a.x < b.x
        end)
        return found
    end

    local function tryVote()
        if not F.AutoVote then return end
        local list = voteCandidates()
        if #list == 0 then lastButton = nil return end

        local want = math.clamp(tonumber(F.VoteSlot) or 1, 1, 3)
        local picked
        for _, item in ipairs(list) do
            if item.slot == want then picked = item.button break end
        end
        picked = picked or (list[want] and list[want].button) or list[1].button
        if picked and picked ~= lastButton and tick() - lastAt > 0.08 then
            if pcall(function() picked:Activate() end) then
                lastButton, lastAt = picked, tick()
            end
        end
    end

    tc(RunService.Heartbeat:Connect(function()
        if not F.AutoVote then lastButton = nil return end
        if tick() < nextScan then return end
        nextScan = tick() + 0.05
        tryVote()
    end))

    task.spawn(function()
        local pg = LP:WaitForChild("PlayerGui", 10)
        if pg then
            tc(pg.DescendantAdded:Connect(function()
                if F.AutoVote then task.defer(tryVote) end
            end))
        end
    end)

    E.voteFarm = function()
        task.spawn(function()
            local slot = VOTE_SLOTS[tostring(F.VoteSlot or "1")] or VOTE_SLOTS["1"]
            local count = math.max(tonumber(F.VoteResets) or 5, 1)
            for i = 1, count do
                local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
                if not hum then break end
                safeTP(CFrame.new(slot))
                task.wait(0.35)
                pcall(function() hum.Health = 0 end)
                task.wait(2.5)
                LP.CharacterAdded:Wait()
                task.wait(1)
            end
            Notify("Vote Farm", "Done")
        end)
    end
end

-- menu gif ---------------------------------------------------------------
-- Roblox не умеет проигрывать .gif, поэтому анимация это папка кадров:
-- Inertia/games/<игра>/gif/<имя>/*.png, опционально fps.txt рядом.
do
    local ROOT = GAME_DIR .. "/gif"
    local frames, holder, playing = {}, nil, nil

    E.listGifs = function()
        local out = {}
        if not (isfolder and listfiles and isfolder(ROOT)) then return out end
        for _, entry in ipairs(listfiles(ROOT)) do
            local name = entry:match("[\\/]([^\\/]+)$")
            if name and not name:find("%.") then out[#out + 1] = name end
        end
        table.sort(out)
        return out
    end

    local function loadFrames(folder)
        local asset = getcustomasset or getsynasset
        local out, fps = {}, 12
        if not (asset and listfiles and isfolder and isfolder(ROOT .. "/" .. folder)) then return out, fps end

        local files = {}
        for _, path in ipairs(listfiles(ROOT .. "/" .. folder)) do
            local name = (path:match("[\\/]([^\\/]+)$") or ""):lower()
            if name == "fps.txt" and readfile then
                local ok, body = pcall(readfile, path)
                if ok then fps = tonumber((body:gsub("%s", ""))) or 12 end
            elseif name:match("%.png$") or name:match("%.jpg$") then
                files[#files + 1] = path
            end
        end
        table.sort(files)
        for _, path in ipairs(files) do
            local ok, id = pcall(asset, path)
            if ok and id ~= "" then out[#out + 1] = id end
        end
        return out, math.clamp(fps, 1, 60)
    end

    E.applyGif = function()
        if playing then task.cancel(playing); playing = nil end
        if holder then holder:Destroy(); holder = nil end
        if not F.MenuGif then return end

        local folder = F.GifAsset
        if not folder then return end
        local fps
        frames, fps = loadFrames(folder)
        if #frames == 0 then
            Notify("GIF", "No frames in gif/" .. folder, "warn")
            return
        end

        local size = math.clamp(F.GifSize or 110, 40, 260)
        holder = new("ImageLabel", {
            Name = "InertiaGif", BackgroundTransparency = 1, ZIndex = 3,
            Size = UDim2.fromOffset(size, size),
            Position = UDim2.new(1, -size - 8, 1, -size - 8),
            Image = frames[1],
        }, win)

        playing = task.spawn(function()
            local i, step = 1, 1 / fps
            while holder and holder.Parent do
                holder.Image = frames[i]
                i = (i % #frames) + 1
                task.wait(step)
            end
        end)
    end

    gui.Destroying:Connect(function()
        if playing then pcall(task.cancel, playing) end
    end)
end

-- emotes -----------------------------------------------------------------
-- каталог эмоций: имя=id, 961 штука
local EMOTES = {
    "(NEW) Hip Tech Dance=104994360979567", "(NEW) Random Moves=76674565725011", "(Original) Gangnam Style=116468071022853", "/e cheer (r6 emote)=106682948056131",
    "/e dance2=124072098165199", "/e fly=93406374070484", "/e fly=93511411593120", "/e Fly - Accurate Admin Flyð¤=97830214926142",
    "/e sit=129668542320076", "/headless /koblox .... kind of=110170230382247", "1=75330453965878", "10 count=138362690766127",
    "15 MINUTES=118573552398400", "2=75501302834546", "2 Baddies Dance Move - NCT 127=12259890638", "2 Phut Hon Dance=115319301809339",
    "21 1=138774321105507", "360 (when im in the mirror)=93570316567872", "6-7=106367055475970", "67=120007956256550",
    "67=136415352218982", "67=79159574589173", "7 Rings Dance=127478024269658", ": adorable kitty knee sit ♡︎=88274669494826",
    ";fly me=137899803446725", ";invisible me=94292601332790", "[ OG ] BADDIE BOUNCE=116938844814178", "[ OG â¡ ] brooklyn pop - kawaii hip swing d=104060042886647",
    "[ OG â¡ ] bunny party dance=104922087218459", "[Aura Farm] Wall Lean Idle {ORIGINAL}=110537281410647", "[AURA FARM] YN Wall Lean=71556328869803", "[BEST SLOWED] I got the feeling dance V2=98488342645730",
    "[BEST SLOWED] Just Know Dance=92676800418557", "[BEST SLOWED] Scuba Dance=98332617932354", "[Best] All Might Victory Pose R6=100416618991324", "[BEST] Chinese Military Dance Pose=131258378669186",
    "[BEST] Dougie (Everybody Loves Me)=114756515400742", "[BEST] Got That Feeling 🔥=137045511520813", "[BEST] I Got That Feeling=83925966568178", "[BEST] I got that feeling Dance=91177384524165",
    "[BEST] Invisibility Wall Glitch=107922324638876", "[BEST] Invisiblity=130371895389423", "[BEST] It's Gangnam Style!=121223586546974", "[BEST] It's Gangnam Style!=104142334418357",
    "[BEST] KATSEYE - PINKY UP DANCE=72284155020920", "[BEST] Keep The Money Flipping=106656731585855", "[BEST] Not Cute Anymore - KPop Dance (ILLIT)=107753335763254", "[BEST] Passinho do Jamal=131293771681795",
    "[BEST] Punch Combo=127192517089060", "[BEST] Rakai Emote=88486801093777", "[BEST] Scuba Dance=140083870341460", "[BEST] Sit-Jumper=115629030075322",
    "[BEST] Soda Pop=87905326034362", "[BEST] Trip Out=139278351784422", "[BEST] Tung Tung Sahur Bombaye Dance=78585018949326", "[BEST] Ya Ya Sing=84762479563427",
    "[BEST] 🔥 Baby You Buggin Top Rock Trend Danc=84270764109827", "[BEST] 🔥 Baddie Sass Drop 🔥=75909220861652", "[BEST] 🔥 Haskell - Four Lokos Dance 🔥=136151917677622", "[BEST] 🔥 King Isnar Dance 🔥=112498786926254",
    "[BEST] 🔥 MM2 Wall Phase Noclip (GLITCH) 🔥=122460691096914", "[BEST] 🔥 POP DAT THANG Dance V2=112643042257327", "[BEST] 🔥 SCUBA NICK WILDE DANCE TREND 🔥=126480010196225", "[BEST] 🔥 Teach Me How to Dougie 🔥=80048857252163",
    "[BEST] 🔥got that feeling 3🔥=139509988678284", "[CHEAPð¥] Needy Night Out=73823025897559", "[Code: flipping] Only 1 copy!=89658327801488", "[FAST] No Handed Push ups 💪⚡=104225534458715",
    "[FAST] One Handed Push ups 💪⚡=90833671651187", "[FREE] Hips Sway Arms Crossed Emote=126712277617528", "[HOTð¥] Spinning Cat=75739251269771", "[LIMITED] Infinite Reset=126940183819468",
    "[MIRA] Kicking Feet Sit=78758922757947", "[NEW] Art of Goofball=118176162713872", "[NEW] I never seen=85676292123288", "[NEW] Jump on Back=113474578054385",
    "[NEW] Mr Beast Dance=77900349005535", "[NEW] Runway Diva!=110724441263151", "[OG BEST] Missed and needy=74359676673985", "[OG BEST] Spicy bounce=87377941256447",
    "[OG] Cute Anime Idle=126358668270842", "[OG] Douyin Guy Satal cix=102754986553717", "[OG] ME! ME! ME! Daoko Dance â¡=111603027132774", "[OG] Military Dance=79318911527752",
    "[ORIGINAL] I Want Money / What You Want - EM=128258195574116", "[ORIGINAL] It's Gangnam Style!=130998336536045", "[R15] Bang Bang Bang Chainsaw man=117688975624403", "[R15] Hatsune Miku Idle Pose Emote=74402735640939",
    "[R6] Nyan Cat Meme=79483479695611", "[R6] Otsukare Summer=82461557511288", "[RAPID FIRE] ð« Gun Morph=73562814360939", "[SALE] Last Call 🤑=90095742177780",
    "[UNIQUE] Structure of Happiness=120019464845025", "[â] Stranger Things Vecna Kill Emote=80981189893654", "[â³LIMITED] Head Spin & Chill Aura Float=109006665341377", "[ð] Kayah's Cute Pose=124031351335869",
    "[ð«]Finger-Gun=138671863009472", "[⌛Limited] Foreign Shuffle=84871896646504", "[⏳LIMITED] Fake Dead MM2=94542601997222", "[⏳LIMITED] Fake Dead MM2 Emote🗡️=118504382528651",
    "[🎀 CUTE] I got that feeling=90736706394189", "[🕷️]Spiderweb Hang=108837170716382", "a=134361640329403", "a=75223225232320",
    "a=80331155278038", "a little timid, a lot cute - kneeling sit=77582970600812", "A peanut butter house=103452027936100", "A Rose?ð¹=91739079549341",
    "Absolute Sadness=92893440808720", "ACELERADA=84204365810397", "Admin Fly Troll=88118041598329", "adorable dolly profile pose=98302948822188",
    "Adorable Hands Up Profile Idle Pose=132689882451910", "Aerial Silk Floating Ballerina Carol of the =88521791290140", "aespa - Switchblade=98748386206029", "AFK Aura Farm=124573843932871",
    "AFK Sit / Meditate=131175721599127", "After Dark Shuffle=116160296872083", "After Hours=79016049926984", "Agnes Tachyon's Low Cortisol Dance (In Tempo=112396548575695",
    "Agree=4849487550", "Air Dance=4646302011", "Air Guitar=3696761354", "Alex Pereira Walkout UFC=123908266311137",
    "Alo Yoga Pose - Lotus Position=12507097350", "Alo Yoga Pose - Triangle=12507120275", "Alo Yoga Pose - Warrior II=12507106431", "alter ego=115663920639904",
    "Alter Ego=95944231654385", "Alter Ego Emote=119773754522786", "ALTÃGO - Couldnât Care Less=92859581691366", "Amazing Spiderman 🕷️=116668784951335",
    "Angel Flying=102256275785620", "Angry Idle=91186219015918", "Angry Idle=91171596265030", "Angry Jumping Dog=102379086280208",
    "Angry Rage Goku SSJ=72810322391921", "Angry Rage Goku SSJ=100234359104572", "Angry Snake=118102737243919", "ANIMAL - KATSEYE=84738808889601",
    "Animation=100264059771272", "Animation=131423890085017", "Animation=110041196455928", "Animation=109812676259041",
    "Animation=119545529905712", "Animation=126762975462317", "Animation=78573841753931", "Animation=74100363920320",
    "Animation=75777497646274", "Animation=99254281101022", "Animation=139326908828324", "Animation=134363122324804",
    "Animation=104752028381977", "Animation 2=118146240064424", "Animation 4=117201589072317", "Animation 5=140534568333127",
    "AnimationAppa=126013831082574", "AnimationBatoruPozu=89598501872518", "AnimationGado=104825653434747", "AnimationKiku=127958924107320",
    "AnimationPunti=92502316238079", "AnimationRoliKiku=107505875917907", "AnimationTest1=94436060366762", "Anime Girl Shoujo Idle Pose=138713126859553",
    "Annyeong (안녕)=9528286240", "Anxiety Dance ⭐=105261650562148", "AOE bee=86163347048599", "AOE stealth bee test animation=111552494345723",
    "AOK - Tai Verdes=7942960760", "Applaud=5915779043", "apple store girl (do you want me)=136290878980267", "apple store girl (do you want me)=86591723458333",
    "Apple Store Girl Goofy Dance (do you want me=114202552805537", "Arm Hip Sway Baddie Dance=120197512440871", "Arm Wave=5915773155", "Arms Legs Dances=95391134173221",
    "Arona Dance Meme=113818946774721", "Around the Head=114502615688717", "Around Town=3576747102", "Arthur Morgan Coughing=84293478473291",
    "Asian Squat=87939646671209", "Ask Me=75978589861541", "Attitude Moves Bounce=132514953046792", "Attraction=82295125969466",
    "Auf die Knie=98860968502468", "aura=88650036269188", "Aura Chill Floating Anime Emote=110849529361439", "Aura Farm - Conquest=106602091102038",
    "Aura Farm - Flight=105394372010718", "Aura Farm Chill Sit=106055025301059", "Aura Farming=133113167814737", "aura farming wall lean (hands in pockets) [F=74668781837561",
    "Aura Flight Profile Pose=104620931556134", "Aura floating emote=73100418080632", "Aura Fly Sitting=72450410210932", "Aura Gainer=125717501705233",
    "aura headless=118311196026401", "Aura Idle=82096188761745", "AURA IDLE (Menacing)=88770227865095", "Aura Lionel Messi Argentina Celebration=120625978802353",
    "Aura Posing=93043556902763", "Aura RNG Fly Idle â¨=78755795767408", "AURA SLEEP=137106811952386", "Aura Wall Lean=101814077003743",
    "Auraful Sitting Pose [IDLE]=74840313444216", "Automatic Save=111148436028076", "avatar=106169125750872", "Ay-Yo Dance Move - NCT 127=12804173616",
    "baby boo dance=78428722915978", "Baby Boo Head Shake=106259138660626", "Baby Dance=4272484885", "Baby Queen - Air Guitar & Knee Slide=14353417553",
    "Baby Queen - Bouncy Twirl=87312099492828", "Baby Queen - Bouncy Twirl=14353423348", "Baby Queen - Dramatic Bow=14353419229", "Baby Queen - Face Frame=14353421343",
    "Baby Queen - Strut=14353425085", "Baby Queen – Bounce & Twirl=102010414372452", "Baby You Buggin=98905241971820", "Baby You Buggin=135697293498216",
    "Back Dance Trend=80242782087423", "backbend 2=90221431610087", "Backflip Emote [CHANNELS]=95449040742908", "Backflip Slow Motion Aura=90683400429800",
    "Backup Dancer💃=99992481934705", "BAD - ATEEZ=119564917117433", "BAD - Ateez dance=111003986858991", "baddie=125699260461610",
    "Baddie Hips=74731877336606", "BADDIE Mirror Pose ð=74621691174733", "Baddie Pic Profile Pose=104253691368899", "Baddie Shake=134817530495903",
    "baddie shake=114943261868976", "Baddie Shake Shake Shake Dance=129594937997401", "Baddie Shake ✅=133827405660930", "Baddie Spin Rotate Dance=81111148654971",
    "Baddie Summer Hip Sway=75891343612769", "Baddie Sway=136349903831061", "Baddies Pic=81773345255689", "Ballet Spin=114322312849971",
    "Bangladesh Bop=102113951456734", "Barking Dog Pet=98130875587194", "Basketball Head=107282826166809", "Basketball with head=112284503948911",
    "Be Not Afraid=70635223083942", "Be tall creature=87939300658851", "Be tall creature 😱=73111862035155", "Be Your Sun=128869257708988",
    "Bear Running 🐻=126158254491068", "Beat Da Koto Nai=130655908439646", "Beauty Touchdown=16303091119", "Beckon=5230615437",
    "Becky G's Heart Hands Profile pose 3.0=83624435024187", "Belly Dancing=121899062503943", "Belly Dancing=131939729732240", "BEST Box emote=100623240807463",
    "best fake mm2 death=72157807942903", "Biblically Accurate Emote=133596366979822", "Biblically Accurate Emote=88416001739999", "Big Back Baby Boo=122461225964217",
    "Big Bad Wolf=114173131467040", "Big G Bounce=70975021709810", "Big G Rilla Step=78512766320761", "Big Guy (Fortnite Version)=72107059892795",
    "Big Guy - ð¥ Ice Spice x Spongebob=107708114415320", "Big Hand Wave=105209959441169", "Big Papa Squat=114443541753616", "BIGGEST TALLEST Ancient Robloxian (GLITCH)=94689356387761",
    "Bike Aura Lean Pose=109802432984402", "Billy Bounce=126516908191316", "Billy Bounce=93450937830334", "Billy Bounce Dance=138356541199997",
    "bird=80558714583846", "bird=109183899811338", "Bird=99462582536377", "Bird 🦅=109457991636445",
    "BLACK PINK JUMP - LOOP=97881883432866", "BLACKHOLE - IVE=109032209212356", "BLACKPINK - Get em Get em Get em=131561465960751", "BLACKPINK - How You Like That=16874596971",
    "BLACKPINK - Lovesick Girls=16874600526", "BLACKPINK As If It's Your Last=18855603653", "BLACKPINK Boombayah Emote=16553259683", "BLACKPINK DDU-DU DDU-DU=16553262614",
    "BLACKPINK Don't know what to do=18855609889", "BLACKPINK Ice Cream=16181840356", "BLACKPINK JENNIE You and Me=15439457146", "BLACKPINK JISOO Flower=15439454888",
    "BLACKPINK Kill This Love=16181843366", "BLACKPINK LISA Money=15679957363", "BLACKPINK Pink Venom - Get em Get em Get em=14548709888", "BLACKPINK Pink Venom - I Bring the Pain Like=14548710952",
    "BLACKPINK Pink Venom - Straight to Ya Dome=14548711723", "BLACKPINK ROSÉ On The Ground=15679958535", "BLACKPINK Shut Down - Part 1=14901369589", "BLACKPINK Shut Down - Part 2=14901371589",
    "bleb=71413837943618", "BlocBoy Jb Shoot Dance=98767907548145", "Block Partier=6865011755", "Blue Shirt SEIZURE Meme=116351464528973",
    "Blue Top Rock=103438127343286", "Body assembly=122844127161903", "Body Phone=95714033584938", "Body Phone (Check Description)=110262668561006",
    "Bodybuilder=3994130516", "Bone Chillin' Bop=15123050663", "Boo'd Up Groove=97963621965605", "Boogie Down=139570238573569",
    "Boom Boom Clap - George Ezra=10370934040", "Bored=5230661597", "Borock's Rage=3236848555", "Bottle flip=98347386570831",
    "Bottom to Top=107514516548284", "Bouncy Cute Girl Anime Idle=74193679388896", "Bouncy Hornet's Spider=113196149430995", "Bouncy Shake=90034439780643",
    "bow bow bounce Dance [OG]=77568709550148", "box=113770017294035", "Box=73500261613116", "Box Hide=123138113380445",
    "Box Pet=101460910804544", "Boxing=117648669357990", "Boxing Punch - KSI=7202896732", "Brainrot Bop=108904511048972",
    "Brasil Funk FootWork Groove Dance Viral⭐=92608223580101", "Brawler Raiden Punching=122341302749280", "Brazil Dance=126046375141676", "Brazilian Dance Trend=128075615137194",
    "Brazilian Funk Footwork=88693910954718", "Brazilian groove=110680247578279", "Brazilian Groove Dance=114415639163891", "Brazillian Vibe=112528616743393",
    "Break Dance=5915773992", "broken=111723088913691", "Bruh Death Sleep=77457963046179", "Bubbly Nonchalant Sit=126968132958068",
    "Bubbly Sit=112758073578333", "Bubbly Sit [3.0]=82070133181200", "Bug In The System=79962090865577", "Bunny Hop=4646296016",
    "BURBERRY LOLA ATTITUDE - BLOOM=10147919199", "BURBERRY LOLA ATTITUDE - GEM=10147916560", "BURBERRY LOLA ATTITUDE - HYDRO=10147926081", "BURBERRY LOLA ATTITUDE - NIMBUS=10147924028",
    "BURBERRY LOLA ATTITUDE - REFLEX=10147921916", "burmal brazil dance=73249537027300", "Buss It! [OG]=131407261984740", "Bust It Down!=88164107371806",
    "by sheiki=97132700051405", "BYE BYE BYE Dance=74955072464298", "California Girl Dance [OG]=132074413582912", "California Girls=130248288787333",
    "California Girls=86036504023673", "candy cookie chocolate miku teto=121463501824419", "Candy Emote=75773776265985", "cant catch my tail.. ( ;Â´ - `;) (klees idle=90177445015685",
    "cantando voleros=124368048579814", "Car=115407270129592", "Car Pose: Tokyo Lean=118859160373597", "Car Transforming=79360981055415",
    "Caramell=85936805522788", "Caramelldansen=86982022610765", "Caramelldansen=85361710130557", "Caramelldansen (Caramell) Kawaii Dance=97847706148165",
    "Caramelldansen [R6]=79453875591488", "Caramelldansen Dance Original=87440273279654", "carry=136417689128121", "carry 3=99047592039555",
    "Cartwheel - George Ezra=10370929905", "Casual Sitting=113039466758343", "Cat Emote 😺=91598702172187", "Cat Girl Foot Clap Sitting=131868095579237",
    "Cat Grooming 😺=140097644434889", "cat loaf=70978791982917", "Cat Nap=107159807702245", "Cat Nap=105016815489641",
    "Catch Catch Setalcix=129411309930167", "Catch My Heart=132879048937858", "Catgirl Sitting Down ð»=124682757478598", "Catwalk Walk=120380776076922",
    "Catwalk Walk=87739743400914", "Catwalk Walk Emote (FIRST,OG)=138140141577966", "Ceiling Glitch=73655169247699", "Celebrate=3994127840",
    "Cha Cha=6865013133", "Cha-Cha=3696764866", "Chappell Roan HOT TO GO!=79312439851071", "Charli XCX '360'=123630248572645",
    "Charming Cute Look Pose=101275066718933", "CHAT - GIRLSET=113211129156693", "Che Che Che Dance=74002733575110", "Check shop for new=108531062573860",
    "Cheer=507770677", "chf=108772963486730", "Chicken Dance=4849493309", "Child's Tantrum=104628550103800",
    "Childish Tantrum=130575801528647", "Chill Aura farm=71273990949899", "Chill Bounce=132112297758791", "Chill Float=85327895983217",
    "Chill Floating Anime=134492157991014", "Chill Floating Fly Aura (Blinking)=127195099938159", "Chill Floating Sit=87661174035490", "Chill Sit=127101022183249",
    "Chill Vibes - George Ezra=10370918044", "chilling sit emote pose=117355002473830", "China Aura Dance=115428631276525", "Chinese Boy Dance=103644566717754",
    "Chinese Cat Dance=122362042526692", "Chinese Dance=118173710190948", "Chinese Dance: Da Koto Nai [BEST]=127347315450314", "Chinese Dance: Da Koto Nai [BEST]=104539498095025",
    "Chinese Napoleon Dance=91805216545300", "chiwawa Ï - ï» -Ï â¸â¸ (just dance)=81562978486917", "Chk Chk Boom - STRAY KIDS [DANCEBREAK]=98718871207695", "Choso=119042829278898",
    "Chubibi Dance=76881316748390", "Cinematic Dog Running🎬🐶=89754702842783", "Circle Pilates Flow=71611833171371", "circus clown 🎪=104994115753905",
    "Clapping 👏=108719455289393", "Classic Sitting=110132556035101", "Clear Now - Gerald Lamb (tema)=82765561795011", "Click!=89709691143346",
    "Cobra Arms - Tai Verdes=7942964447", "Coffin Walkout=117302755748327", "Coinflip Hand emote=99811523478828", "Come dance at Speed 5=114851183424512",
    "Company - Justin Bieber=105396688041026", "Confess Dance=81671884508244", "Confess to Me=105722319548703", "Confident Needy Hip Shake Dance=85115037529002",
    "Confused=4940592718", "Contagious jumping emote, back and forth=111557185865331", "cool chill anxious sit=136503300882093", "cool dance=131907978927306",
    "Cool That Setalcix=79471736553300", "Corrupted Entity=104321872987170", "CORTIS - GO!=99897707960183", "Cortis Nervy Dance=118101048943468",
    "Cortis Nervy Dance=81861600654300", "Cortisol Down=111809919877260", "CoryxKenshin Dance! [OG]=122820761438927", "Country Line Dance - Lil Nas X (LNX)=5915780563",
    "Courtly bow=72613272882226", "Courtly Thank You Bow=102471671733889", "Cowboy Pose Holding Hat=84435808840758", "Cowboy Pose Remade (HOLDING HAT)=127471694385754",
    "Cower=4940597758", "Crazy Shake=73133888729746", "Crazy Spin 😂=112632768579050", "Creepy Ventriloquist Puppet=95800106960533",
    "Crossed Arm Hip Sway=122545939134570", "Crumble=107058556707413", "Cry Baited=117039516163584", "Cry For Me [OG]=98263064912190",
    "crying emote=114429333924667", "Crying in a Ball 🥺=82649058816245", "Cuco - Levitate=15698511500", "Cupid's Arrow=106786457611134",
    "Curtsy=4646306583", "Cut Water Summer Dance!=71825767065274", "cute=91267209754224", "cute adorable confused pose=95929389642144",
    "cute adorable kitty pose=115126347696369", "Cute Angry=135296934122751", "Cute Angry Idle ð¡ [Dynamic Head]=136895816311970", "Cute anime bounce=97233973386966",
    "Cute Baddie Profile Idle Pose=136040668407140", "cute bossy girl pose â¡à­¨à­§=135078245258688", "cute bossy sassy girl pose ♡=136675249584046", "Cute Bouncy Anime Needy Dance=82868637999546",
    "Cute Bouncy Dance=88013941626468", "Cute Bouncy Hip Shake Dance=87963462118126", "Cute Bouncy Needy Moves=112516279308262", "Cute Bouncy Needy Shake Dance=126039728937933",
    "Cute Bouncy Needy Shake Dance=70434485915160", "Cute crouch=120224229260879", "Cute Dainty Princess Flowy Profile Idle Pose=88832089129573", "cute dancy dance=83917238288783",
    "cute doll ballerina music box spin=111332667359868", "cute douyin dance=126477484553048", "cute dramatic gyaru profile pose for the pic=138512426644456", "Cute Dynamic Angry Animation=138052559243581",
    "Cute Excited Sitð¦=73743026563647", "Cute Feet Kicking=78224683906191", "Cute Floating Fly=138591023414678", "cute floating headless head aura emote=98728517497209",
    "cute gasp ð±=132029163919678", "Cute Girly Sway Animation (LOOPED)=103080659223876", "cute hand heart profile idle pose=137512787140008", "cute hand on hip pose=101215005876552",
    "cute heart symbol idle emote=102082125671883", "Cute Hips Profile Pose=86039610121898", "Cute Hug [Loop]=83919932459167", "Cute Jiggly Shake Dance=125559311512014",
    "Cute Jiggly Sway Dance=93191923241352", "Cute Kawaii Anime Chibi Dance Cheer PFP=132718307830156", "Cute Kawaii Bouncy Shake Dance=94110060546495", "Cute Kawaii Chibi Dance Break Cheer Anime Pf=97376767323518",
    "Cute kawaii girly idle Profile pose=138515241510970", "Cute kawaii girly magical idle Profile pose=128174269567586", "Cute Kawaii Kitty Cat Swing=73762423381362", "Cute Kawaii Legs Up Shy Kicking Feet Cat Lay=103155280474275",
    "Cute Kawaii Matching Hug=122985387070331", "Cute Kawaii Posing >-<=94064805002669", "Cute Kawaii Sitting Idle Pose=124674379179873", "cute kawaii wave=85223117427239",
    "Cute kicking Feet Sit=130253041293561", "cute kitty paws idle profile pose=122733281249170", "Cute Knee Sit 🌺=73700854073067", "Cute Kpop Poses - Profile Poses=90929823390861",
    "Cute lay ♡=119346717795992", "cute laying down pose=125522668023169", "cute leg up pose=120964090971175", "cute levitating=101601077005248",
    "Cute Loving Hug 💖🤗=82239175710536", "Cute Meow Cat Anime Kawaii E-Girl Idle Pose=125528240607684", "Cute Needy Girly Pop Shake Hip Sway Dance=95386286646909", "Cute Needy Hip Bounce=120297764741811",
    "Cute Playful Pose=91703507053002", "cute ponpon dance og=114462336086965", "Cute Pose Leaning Forward [Dynamic]=135363548138894", "cute pose🎀=82262526320739",
    "Cute Pretty Girly Girl Fierce Slay Idle Pose=135853357333509", "Cute Resting Arms Sitting=76858547973173", "Cute Sakura Pose=89545727195433", "cute shy baby doll tilting head idle pose=136935335849446",
    "Cute Shy Girly Kawaii Idle Pose=135548043388513", "Cute Sit=94733778591624", "Cute Sit=72947568152049", "cute sit=131875333242836",
    "Cute Sit=90244178386698", "Cute Sit=116578970554242", "Cute Sit=82167506755506", "Cute Sit=129575609080331",
    "cute siting=137248045647582", "cute sitting with legs out=139076155588413", "cute sitting with resting arms=109293426945524", "Cute Slay Girl Idle Pose=136621048905499",
    "cute sway animation=104612504371741", "Cute Sway Sit=120453841445635", "cute thinking emote=116848705297063", "cute uppies jump=135794743776459",
    "Cutesey Dance=96559691182568", "cutest=110975413706273", "cutest haiii waving profile idle pose=132187706679340", "Cutesy Cat Sit Profile Pose=72185261708093",
    "cutesy idle=135969877864472", "Cutesy Idle Waving (BEST)=83308318889530", "cutesy sway sit=103880384169159", "cutesy thumbnail pose=124322556880942",
    "Cutie Floating=140014568209050", "Cutie Roblox Kawaii Profile Pose=100764909050610", "Cyrene Fairy Swing Intro Idle | Honkai HSR=130027779038512", "d=116977114346435",
    "da hood stomp=73079617350165", "Da Hood Stomp=92237689732858", "Dab=2445521505", "DaBaby – POP DAT THANG=104785570361803",
    "Dai Dai - Shakira, Burna Boy [BEST]=119364127769838", "Dai Dai Intro - Shakira, Burna Boy [BEST]=104268900355290", "Dance=507771019", "dance 1=97158667344450",
    "Dance 2=507776043", "Dance 3=507777268", "Dance All Night=97139559228653", "Dance If You're The Best - Dia Delicia Dance=117033010486869",
    "Dance If You're The Best Dia Delicia Dance=78271776483517", "Dance of The Summer=107843110469229", "Dance Until Dawn=85598892098086", "Dancin' Shoes - Twenty One Pilots=7405123844",
    "Dancing Kitty Shuffle=86234505318869", "Dancing Like a Classic Zombie=71905341620227", "Dancing with your eyes closed=129637389787927", "Dani's BIRDBRAIN=105730788757021",
    "Danza Kuduro Dance=139473172371904", "Dança Comigo Nenem=109355143756364", "Dançando por ai=126600088866546", "DARE - Gorillaz=88840501982686",
    "DARE - Gorillaz=136648387080677", "dare gorillaz=74166306641909", "Dauntless Montagem Dance=137849475062296", "Dave's Spin Move - Glass Animals=16276501655",
    "dead=137787982979286", "dead=126381369864982", "DEAD 💀=124991428277077", "DearALICE - Ariana=133765015173412",
    "Death pose=106121156984133", "Default Dance | OG=80877772569772", "Deltarune - Tenna Dance=102492229412911", "Dembow - De Lado=111531137576108",
    "Die Lit=121001502815813", "Diego Brando=136636305071594", "Disagree=4849495710", "Discombobulated=129916107176034",
    "Diva Aura=118846519181951", "Divine Backflip & Fly=73095267834850", "Dizzy=121329275473626", "Dizzy=3934986896",
    "DJ_Baile=103608208606484", "Do That Thang=98064631733787", "DOD Walk (improved)=134060027924531", "Doflamingo Walk=73751044855331",
    "dog=125463572323823", "Dog=84198855496510", "dog emote=83232582155001", "Dog Poop=113218611625559",
    "doll cute sitting pose=121828376803746", "Dolphin Dance=5938365243", "DON'T KILL THE PARTY - Ty Dolla=111324222414386", "Donk X Kitty Kat Beyonce - Remix DJ Vic=115204310107224",
    "Dorky Dance=4212499637", "Dougie=93675237485386", "Dougie Famous Dance Emote=84427546283197", "Dougie Meme Dance=119256963154827",
    "Douyin Asian Guy=115761826385332", "Douyin Chinese Boy Dance [AGRESSIVE VERSION]=107454824997030", "Douyin Chinese Viral Man Dance=122775480517179", "Douyin Dance=105737333016655",
    "Douyin Guy=119012483329740", "Douyin Guy=124411737427634", "Douyin Guy Dance=111663419976150", "Douyin Guy Setalcix=102500878362997",
    "Down Bad Worm=109245410766185", "Down Bad Worm [FAST]=75775222230757", "Dr Livesey's Walk Meme=80961481347243", "Dropkick=127764273000599",
    "Drum Master - Royal Blood=6531538868", "Drum Solo - Royal Blood=6532844183", "Drummer Moves - Twenty One Pilots=7422838770", "dud=83428913127377",
    "DYW Dance Michael Jackson=76895302918187", "e f;y=119498316585659", "E-Girl Moves=100231457514753", "Effortless Aura=119406722637131",
    "Effortless Aura Pose=101573394483995", "Effortless One Handed Push Up=77362329954257", "El Sobrado=95352324467930", "Electro Shuffle=96426537876059",
    "Electro Swing=105851216004006", "Elegant Fashion Hand Pose=134166935067224", "Elegant Idol Side Laying Pose=105017212227265", "Elevation=134928834792631",
    "Elton John - Cat Man=11435175895", "Elton John - Elevate=11394056822", "Elton John - Heart Shuffle=17748346932", "Elton John - Heart Skip=11309263077",
    "Elton John - Rock Out=11753545334", "Elton John - Still Standing=11435177473", "Emote=132178563937410", "Emote Loading. Please Wait... | spinning Rob=84511772437190",
    "emote stance=77771071891819", "Emperor Aura Float=101708243738900", "Emperor Aura Floating [Invincible] ⭐ORIGINAL=90650499524891", "Emperor of Aura=92190286089143",
    "Emperor Of The Auraverse [[Aura]]=133594786690861", "Endless Aura Floating=106708015414624", "Endless Worm Floating=93296121617273", "Enlightened Cultivator Meditation=112182102798987",
    "ericdoa - dance=15698510244", "Erling Haaland Knee Slide=137703093752400", "essence - Slay Bestie=100055506817628", "Ethereal Angelic Fairy Anime Girl Idle Pose=85504179919459",
    "Evil Intimidating Aura=104748329844450", "ewawe=113516943322552", "Excited Spinning Dog (Proxima Creatura)=109779894589589", "Exhausted Swordsman=91739402687899",
    "Exotic : APEX Emote [Sol's RNG]=106674068664046", "exovator=125967915808193", "Exploded Kill Effect Emote=107165018229698", "f=101500045977445",
    "Face Calisthenics=9830731012", "Faceless Aura=103981563274328", "Fairs Emote=124614970968335", "Fairy sit floating anime girl pose=132152702263080",
    "Fake Admin Fly=132151404432207", "fake dead 3=75954983685501", "fake dead mm2 BEST=86597225379347", "Fake Death [MM2🔪]=109101011761126",
    "FAKE DEATH MM2=102215968306945", "fake death murder mystery 2 #4=124878337935477", "fake death murder mystery 2 #5=80861670699523", "fake death murder mystery 2 №3=84797909950107",
    "Fake Fly MM2=137678452431381", "Fake Lag / Disconnect=103481554792616", "Fake Lag/Disconnect (TROLL)=97523498583729", "Fake MM2 Death=104672020789315",
    "Fake MM2 Death=107498554725527", "Fake MM2 Death 💀=80010217545846", "Fake MM2 Death 💀=129698592331362", "Falayoo=117840550539974",
    "fall=115377337152285", "Fall in love=91990853568233", "Fall in love=101536662350734", "Fall in love=115998886326560",
    "fallen=71975920859194", "fallen=135196527272227", "falling over=95418335689608", "Family Man Death Pose=78459263478161",
    "Fancy Feet=3934988903", "FaSHioN - CORTIS=118850907110385", "Fashion Doll Back Pose=126744802309631", "Fashion Roadkill=73683655527605",
    "Fashion Spin=130046968468383", "Fashionable=3576745472", "Fashionable [CHEAP]=93285483814710", "Fast Hands=4272351660",
    "Fast Handstand Push Ups=110110406385078", "fast rhythm=122138258762974", "Feel the music ! Aura Pose vive=139782812297837", "Feel This Way=94098763496054",
    "feelin in circles=86487761943620", "feelin myself sway=74941409284905", "Feeling Cute=112540347880956", "feeling groovy=70995707567998",
    "feeling myself=90456357265054", "Feeling Unapologetic=75577243143875", "Feeling Unapologetic=131458535533272", "Feeling Unapologetic Emote=124791993199177",
    "Festive Dance=15679955281", "FF Push Up=73630423562709", "Fight=109616526514218", "Fight Boxing=88062234501785",
    "Fight with your hands=117953805097873", "Fighting Punch=79488579401132", "Final Boss Levitate=110914756664020", "Final Form Levitate / Float=88112242629386",
    "Finger Emoji Dance=71927818405362", "Fireball - Pitbull [OG] [BEST]=93298430995886", "Fish=84497409209637", "Fishing=3994129128",
    "Fl=101550126821889", "Flat Sitting Pose=81180825463784", "flawless feels=75916083282765", "Flex Walk=15506506103",
    "Flex Your UGC Muscles Emote=74248485441791", "Fling emote=79026423023159", "Flip Rose Gift=126610179765952", "float=139167995053534",
    "float=126449112074818", "Float In Solace=97303674099286", "Float In Solace (Unlimited)=94923470490754", "Floating=84052327668385",
    "Floating=139058906415119", "Floating=70615023659736", "floating aura=85958304502119", "Floating Aura=115204755015886",
    "Floating Aura=79795305221612", "Floating Aura Emote â¨ Power Anime Pose=115793885897101", "Floating Goddess (Matching Floating Adonis) =106454952665088", "Floating Idle animation=117134539591727",
    "Floating in Love=101872758167312", "Floating in Love ð¥°=97164262994588", "Floating Island [BEST]=93309961450177", "Floating Lying Down: Metro Man=107758711296968",
    "Floating on clouds=111426928948833", "Floating Princess=120160563346972", "Floating Sit=83475540437708", "Floating sitting=83186041767510",
    "Floating Throne Aura Pose=93443111556634", "Floating Upside Down Aura Emote Idle=121050123933712", "Floating Upside-Down!=95999178112240", "floating with aura=125223578668595",
    "floor=127932648810256", "Floor Rock Freeze - Tommy Hilfiger=10214411646", "Floor Sitting Diva Fashion Model Idle Pose=84729007134399", "Flopping Fish=133142324349281",
    "Floss=2452938820", "Floss Dance=5917570207", "flot=94596689811587", "Flowery Battle Intro - DELTARUNE=86100559986654",
    "Flowery Idle - DELTARUNE=92612802470532", "Flowery's Jarona - DELTARUNE=83299883706152", "Flowing Breeze=7466047578", "fly=130646530611798",
    "fly=122861459999007", "fly=115452022185234", "Fly fly=103424204186271", "Fly fly without stopping=101746498500091",
    "Fly Hover Punch=127380988379156", "Fly towards=88212788846630", "flying=107029514008359", "Flying Bird=122266803916394",
    "Flying Celestial Dunhuang Feitian Apsara Imm=134683696656199", "Flying Chill Pose=82048966112086", "Flying Superhero Emote=71574925787532", "Football Header Hero=136995756243866",
    "Football Slide Tackle=111778994080644", "FORSAKEN John Doe Pose=104072580597361", "Fotball Head Juggle (realistic)=113103187571665", "FREAKED OUT - Fat papi, prodshushy=70548019911724",
    "Freddy Animatronic=119641716125198", "FREE EMOTE : CODE - KICK67=128118777898011", "FreeStyle=77492339942654", "Friendly Sneaking Steve=113349392045510",
    "Frosty Flair - Tommy Hilfiger=10214406616", "Fry Dance=124799741487022", "FULL BODY JUGGLE=81925807197468", "FULL BODY JUGGLING=81303842806993",
    "Full Body Swing=100455443855023", "Fumo Bounce=104867919682063", "funny=81517527125855", "funny emote=93984696664855",
    "Funny Flapping Fly Emote=80891165180537", "Funny Goofy Dance=102443953796685", "Funny Goofy Wiggle=74277551575520", "Funny Parrot Dance🐦=113852525194571",
    "Funny Troll Dance=107354883481459", "Furry Kicking Feet🐾=75614716334035", "Furry Looking Around 🐺🐾=137203736014223", "Furry Pawing 🐾=123267438494575",
    "Furry Scratching 🐾=138698453633224", "G&B Lamplighter Zombie Idle Animation=121934341376727", "GAG IT DEATH DROP=134737246939931", "Gameboy - Katseye=117453574553102",
    "Gangnam style=80923445784018", "Gangnam Style (BEST)=84057470268736", "Gangnam Style - Psy=119625475831198", "Gap x Katseye - Better Than yours (Milkshake=136084484696445",
    "Garry's Dance=92853367837757", "Garry's Dance (GMOD)=129861012882037", "Gashina - SUNMI=9528294735", "Get Out=3934984583",
    "Get Sturdy=120896030393583", "Get Sturdy Groove=77149861255259", "Get that feeling=129534192778892", "Get that feeling=83093482575788",
    "Get The Money=73264759706085", "getting stomped=96836130678500", "Ghost Floating=75911227509248", "giant=103112955497118",
    "girl like me - PINK PANTHERESS=108776396433026", "Girly Outfit-Check=115584191221260", "Glitch through walls (phase)=132366431744296", "Glitch Through Walls [GLITCH]=102873765734282",
    "Go through Wall (GLITCH)=83217929726234", "Godlike=3823158750", "Godly Aura floating Pose=102392888934746", "Godly Aura fly pose idle=106723128417054",
    "Godly Aura fly pose idle=76361248833307", "Godly Aura Flying Pose=116792047740903", "Godly Aura Pose=134388005886833", "Gojo Floating Aura Idle Pose=98255491096624",
    "Gojo Floating JJK/ The Honored One=91085159191582", "Gojo Floating JJK/ The Honored One=103040723950430", "Gojo Floating The Honored One=100953557187752", "Gojo Infinite Aura Farm Floating=131929828165556",
    "Gojo Levitating Aura Pose=77494393065077", "Gojo levitation=108317182353594", "Goku SSJ Aura Charge=136120096854220", "Goku Super Sayin=76679085057459",
    "Goku's Warmup=108013663975520", "Golden dance [best]=77945789109199", "Good Boy Dog Emote=100737291015384", "Goofy dance=98837010227521",
    "Goofy Dory Dance (Silly + Funny)=114332364947196", "Goofy Slap/Punch=135672296324140", "Gorilla Dance - Layo=110439046840214", "got me heated=79431159116507",
    "got that feelin (Male Version)=71096672138893", "got that feeling=72453955072371", "Got that feeling=106607364123945", "got that feeling=140012846594641",
    "Got that feeling! [BEST PART ONLY]=71679825797938", "Got that good feeling vibes=137624471550613", "Got This Feel=97020144501466", "Graceful idle stand=121368094576793",
    "Greatest=3762654854", "Green=87402454392468", "griddy=129149402922241", "GRIMES - Oblivion=78660312825816",
    "Groovy Idle=111477517484684", "Grounded=99187574272185", "Guap=88127985049600", "Guap=98205525026652",
    "guardianhug=83745540015601", "guardianhugger=140141266157300", "guardianidle=108671825043990", "Gubby Sing=93378321106426",
    "gun body=70471095170046", "Hab Hop Dance=91920854735258", "Haha=4102315500", "Hakari Dance=115380777754385",
    "Hakari Dance=131013239122616", "Hakari Dance=122147154162464", "Hakari Dance V2=77666131363559", "Halloween Headless Effortless Aura=94684994062212",
    "hands down hip sway=104660720214070", "Hands Together Sit=102604681518169", "Handstand Push-Up=123573396413002", "Happy=130356414280539",
    "Happy=4849499887", "Happy Bouncing Emote=71837024721828", "Happy Catgirl Dance=72029452283345", "happy hula=113863828896103",
    "Happy Snake=92510136312766", "Harley Dance=119258520125004", "hate that i made you 🫀 me [CAT IA]=75857944636937", "Hatsune Miku PoPiPo Dance=117049534170476",
    "Head Banger [Travis Scott]=81621254772462", "Head Banging=5915779725", "Head in Hand Aura Float EMote=119715203795983", "head levitating cool pose=111474274315212",
    "Head Pat High [Matching Set]=120833029935011", "Head Pat 💕 (scratching / petting)=113044189546962", "Head Petting 💕=110302681327859", "head spin=140466682449054",
    "Headless=2513664073", "headless 67 aura=113673946512104", "Headless Emote=101151842500262", "HEADLESS HOOPER - basketball=80436375269036",
    "Headless horseman=112632315719430", "headless kawaii cute tilt doll idle pose=84638946504072", "Headless Profile Pose=117363570280767", "Headlock=140252879267563",
    "Headpats=90616273346906", "Hear Me Now=113116746603315", "Hear Me Now!=91110020647774", "Heart=84396003438766",
    "Heavy Sword Stance=109863797124787", "Heisman Pose=3696763549", "Helicopter=84321149996096", "Helicopter=108796779511342",
    "Helicopter=140547238892659", "Helicopter=119431985170060", "Helicopter=110553756436163", "Helicopter Helicopter Emote=140219028605312",
    "Helicopter Spin=84555218084038", "Helicopter Split=136605935903045", "Hello=3576686446", "hello cat=92728469265870",
    "Hello Kitty Dance [OG]=92504533520053", "Hero Kneel=121070246722198", "Hero Landing=5104377791", "Hey Ya Move=104338766814874",
    "Hide=121167704249654", "Hide=84868707350198", "Hide/Fly Glitch=77536221090796", "High Hands=9710994651",
    "High School Squat Sit=84329030116145", "High Wave=5915776835", "Hip Bounce=139271706064778", "Hip Dance with Head=129055652754828",
    "Hip Groove=138830530374838", "hip sway=80963950541052", "Hip TechDance=88339078036914", "HIPMOTION - Amaarae=16572756230",
    "Hips Poppin' - Zara Larsson=6797919579", "Hit the Woah=139011929320151", "hjfuiasddfghyasdhsadhu=123369156668835", "hold=98880978664608",
    "hold split=129446149629687", "hold split=77035047549450", "HOLIDAY Dance - Lil Nas X (LNX)=5938396308", "Honor Knight Kneel Dark Souls=89198573930777",
    "hooray=83928811096856", "Hot N Cold Dance=106375633787719", "Hotel Transylvania macarena dance=81808860196321", "how did he hit every beat=134311528115559",
    "Hug Close ❤️=90022047867593", "Hug ð¤â¤ï¸=102822553233176", "Hug ❤️=99919046918338", "hugginmiz=131144161117655",
    "HUGO Let's Drive!=17360720445", "Hugs ❤️=126037302076713", "Hugð=88712283515515", "Hwaiting (화이팅)=9528291779",
    "Hype Boy - NewJeans=105324347192111", "Hype Boy - NewJeans=122829513155529", "Hype Dance=3696757129", "Hype dance á¦=81224179573920",
    "HYPER SHAKE DANCE=96799693994077", "HYPER SHAKE DANCE=101067588642194", "Hyperfast 5G Dance Move=9408642191", "Hypnotize - XG=108696364245824",
    "i ain't never seen=136979399303626", "I can FLY!! ð¦=90844099582284", "I don't feel so good=127283392400274", "I don't know=124172438095044",
    "i got that feeling=79902378027500", "I Got That Feeling=95960657397439", "I Got That Feeling=122930965417558", "i got that feeling=79290962635267",
    "I got that feeling=86879884813226", "i got that feeling=72388969601943", "i got that feeling=123807848932065", "I Got That Feeling=130934310064133",
    "I Got that feeling=79874623974348", "I got that feeling 2=113463960360067", "I got that feeling MM2=132700699496242", "I got that feeling ⭐ORIGINAL⭐=123079807585481",
    "I Got That Groove=117155814725884", "I Got The Feeling=70610865058353", "I Got This Feeling=115152488953631", "I GOT YOUR BACK=136764463730111",
    "I had this feeling vibe💫=74514941873334", "I Just Get So Nervy Viral Emote=121895427940372", "I Like it - STRAY KIDS=85536157811992", "I Never Seen=113584649324281",
    "I Never Seen 🎵=127535552656282", "i see kareem Dance=101876768339112", "I SEE KAREEM DANCE (ICE CREAM)=90293723561810", "I see Kareem Groove=132225863298755",
    "I see Kareem Groove=123920578914875", "I see Kareem Groove=85913309003871", "I see Kareem Groove=114386008104939", "i see karem dance=85524199938016",
    "I WANNA RUN AWAY=135431679610889", "I Want Money=89114994401113", "I Want Money (Prince of egypt)=133751526608969", "I Want You Back - NSYNC=129472766589515",
    "I Want You Back - Tiktok=135081782884380", "I'm dead 💀=122488937431217", "I'm Talm 'Bout Innit (OG)=117301403779781", "ice spice floor dance=115136416525330",
    "Ice Spice Groove=110133518718437", "Iconic By Mistake Emote=87153712593219", "Iconic Fashion Model Idle Pose=80004965633316", "Iconic Pose=107391441166760",
    "Idle Pursuer=73779897793967", "Idol=4102317848", "iii got that feeling=105884850015240", "ILLIT - I Got Your Back=83585083224362",
    "ILLIT - It's Me=93790616190498", "ILLIT - Magnetic=92903522317071", "Im Sorry Emote=101148034474532", "Ima sit back | Baddie Emote=74726067041025",
    "Imagine Dragons - âBonesâ Dance=15689314578", "Imported Animation Clip=94243287840140", "In Love Hip Sway Idle ❤️=86006110561182", "Inch By Inch Worm Crawl=81914477196073",
    "inchworm=95339769038863", "Inchworm Dance=132042594189942", "Infinite Aura Snap=78844343094893", "Intimidating Aura 💀=110795958424873",
    "intrusive awkward wave=85665834724929", "Invincible=118682320059485", "Invisible [BEST]=79967693686630", "Invoking Powers=85812956825556",
    "Iroha Trend=134031572489482", "IShowSpeed Bounce Dance=140269876098643", "It Ain't My Fault - Zara Larsson=6797948622", "It's me dance=85218200064297",
    "Iuno Moon Goddess Intro Idle | Wuthering WuW=117373445253902", "IYKYK - ILLIT=114925244385016", "Jacks=3570649048", "jajhhasdhkajsdhkjashdkjashkjdasd=120085354663409",
    "Jamal Br=109327620027832", "Jamal Brasil Groove Viral ⭐=120102472825596", "Jamal Brazil Groove=124974166841116", "Jamal Brazil Groove=119792778048093",
    "Jamal Brazil Groove=88616893380739", "Jamal Brazil Groove=71067479205358", "Jamal Brazil Groove=117119421748582", "Jamal Brazil Groove=104131847054135",
    "Jamal Brazil Groove Dance=102068081381181", "Jamal Brazil Groove Emote=95221956174322", "Jamal Brazil Groove Six Seven Trend Dance=95845928824549", "Jamal Brazilian Groove=132636680214197",
    "Jamal Brazilian Groove=130435860407803", "Jamal dance=124846951256849", "Jamal Dance=124626450518670", "Jamal Dance=72213123467340",
    "Jamal's Passinho (TikTok dance)=75125571025711", "Japan Photoshoot=99756493156359", "Jason Vorhess Emote=81482996473944", "Jawny - Stomp=16392120020",
    "Jax Toy - Digital Circus=111491569569071", "Jax Toy Dance Emote=112261955997468", "Jelly Dance! (Insp. by Jellyous - ILLIT)=131421601916582", "Jester Dance=124057206061364",
    "Jinu Pose - Saja Boys=130641944883645", "jojo aura=106248380370788", "Jojo Torture Dance=82910305160190", "JoJos | Jonathan's Pose=84195923658292",
    "jorgeous carried=85976022611007", "joseph poses from jojo=84567942990044", "Jotaro Pose (aura)=104330991197585", "JOYRIDE LEFT=106015503327885",
    "JOYRIDE RIGHT=103149155540509", "juicy 2.5=139459115641421", "Jump - BLACKPINK=106977382414370", "Jump - BLACKPINK [BEST]=123831614665513",
    "JUMP - BP (KPOP)=122404842843791", "jump jump pole stick leg=120588354935546", "JUMP K-POP Dance Choreo=111481711726876", "Jumping Cheer=5895009708",
    "Jumping Dogeza ジャンピング土下座=129538976878064", "Jumping Hornet's Spider=120994500567089", "Jumping Wave=4940602656", "Jumpstyle dance=133248139921782",
    "Jumpstyle Dance=89614983665331", "Just be competent=124041369408613", "Just Chilling=124198501259675", "Just sitting=123403317287994",
    "Just Your Doll=78724951673945", "Kaiser Pose=108247640429096", "KATSEYE - Animal=126971515640229", "KATSEYE - Animal=113522520917158",
    "KATSEYE - Animal Dance=73621459884617", "KATSEYE - Better in Denim (GAP)=86184456144623", "KATSEYE - Gabriela (Megan)=98012296914799", "KATSEYE - GAP (Better in Denim)=109226193867459",
    "KATSEYE - GNARLY=133685484220846", "KATSEYE - Gnarly (Dance Break)=115663351458368", "KATSEYE - Gnarly Obvi Obvi Dance=138475808336349", "Katseye - Gnarly Pop Dance Emote=100829635809504",
    "KATSEYE - Touch=139021427684680", "KATSEYE Animal Part 1=118101736410308", "KATSEYE Animal Part 2=116192933453907", "KATSEYE TOUCH (CHEAP)=75916539353418",
    "kawai shy sit idle pose=105933851371838", "kawaii=113926002018277", "kawaii chibi pose=91333024824710", "kawaii cute cat girl pose idle=138487798883208",
    "kawaii cute wave=78924668256199", "Kawaii Groove=94792423330715", "Kawaii Happy Steps=92187550229200", "Kawaii Headless Holding Head Idle Emote=101446789686277",
    "kawaii kitty pawing idle profile pose=117744369529739", "kawaii kitty pose=86937835549103", "Kawaii Pangya Animation=111017712720432", "kawaii shy cute hip sway idle=109880666674090",
    "kawaii thumbnail pose=138621340634338", "kawaii whimsy airplane profile pose Êâ¡É=122803615354190", "Keeping Time=4646306072", "kennedy walkover=106420298716402",
    "Kick It Dance Move - NCT 127=12259888240", "Kicking Flavors=129757708678758", "kicking your feet=70788193750089", "Kid Club Dancing=74968050780162",
    "Kid Crying Tantrum (BEST)=87200383940394", "Kinji Hakari Dance Jujutsu Kaisen=103612146839392", "KISS N TELL - AESPA=121192981751559", "KISS N TELL AESPA=74769762812035",
    "Kissy Roblox Profile Pose=120479164818740", "Kissy Roblox Profile Pose=73398162799786", "Kitty Paw Dance=84118047701599", "KLYN SUPER SLOWED - Hubazane=140494995227212",
    "Knock Knock, It’s Me!=109061869196188", "Korean Dance=135900897045399", "Korean Greeting! (Annyeong / ìë )=135719167611495", "Koto Nai Meme Dance=91927498467600",
    "L Lawliet=139435106875573", "L Lawliet Sit=140187771377253", "L sit=125986463757209", "La Bachata=135471002061000",
    "La Detone - Dance=103768845612667", "La Salsa=91442631640229", "ladies look at this..=93069056374193", "Lady Gaga - Abracadabra=71245818535880",
    "Lasso Turn - Tai Verdes=7942972744", "Late Night Shuffle=99156671946474", "Laugh=507770818", "Laugh it up MM2 Ragebait=135366517287502",
    "Laughing Emote 😂=101552034348992", "Lawnmower Original Emote (Aura)=106220093597313", "Lay down Aura Farm=140452259654428", "Laying Down MM2=80649129157666",
    "laying down sideways=72673254120420", "Laying Face Down=80425649436515", "Laying on clouds=80422524668416", "LE SSERAFIM - Spaghetti=81216108771843",
    "Leaning Against Wall Arms Crossed=77806145358673", "Ledge/Railing Sit=129389629031100", "Legend Aura Fly Emote=75134843312906", "Legendary Lovers=116256886592834",
    "LEMONADE - aespa=76893619673311", "Lethal Dance=102053362762765", "Lets Get Sturdy=119341017234649", "levitate=87826892596287",
    "Levitated Lounge=100081021028089", "Like Jennie Dance from JENNIE=92224509275999", "Lily Braids=75503857471233", "Line Dance=4049646104",
    "Little Catgirl Dance=100933577956831", "little fight with punches=140635953527818", "Little jumping spider=113184956127341", "Little Obbyist=134584040095037",
    "loksjdoisajdoijiwoqoqo=103019256916074", "Long monster=134239948871817", "Lose Control Majorette [OG]=88404387488886", "Louder=3576751796",
    "Louisiana Jigg=75625820126017", "Love Letter=138103601878406", "Love Nebula - Rym=106278431744586", "Love Options - BESTie=98870296572322",
    "Love Options - BESTie (Second Version)=79917934067491", "Low Cortisol=74477507917814", "Low Cortisol=89957022802046", "Low Cortisol Dance=71517831094574",
    "Low Cortisol Dance Pill=125822752810863", "Low Cortisol hip sway=138149876527113", "Low got that faaling (Dance)=118866184082755", "lush life=120265739360576",
    "Lush Life=82727664018494", "Lying on Side Floating=81963551668548", "M3GAN's Dance=127271798262177", "Macarena=73946479113094",
    "Mae Stephens - Piano Hands=16553249658", "Mae Stephens â Arm Wave=16584496781", "Make You Mine=104485625389237", "Make You Mine=130214067086591",
    "Make You Mine=97092824850945", "Making Faces=89535391366809", "Man City Backflip=13694140956", "Man City Bicycle Kick=13422286833",
    "Man City Scorpion Kick=13694139364", "Manchild - Sabrina Carpenter=82280596019898", "MANIAC - Stray Kids=11309309359", "Manifest | Hileli Dance=100413635529380",
    "Mannrobics (TF2)=83702306317443", "MASSIVE POOP=83417429144154", "Mean Girls Dance Break=15963348695", "Mean Mug - Tommy Hilfiger=10214415687",
    "MECCHA CHAMELEON - Static Pose 04=136842640754284", "MECCHA CHAMELEON - Static Pose 05=114949436517814", "MECCHA CHAMELEON - Static Pose 06=121540717461152", "meditate=134073586402456",
    "meditate=110392276709619", "Meditating state=97271458550328", "Meditating Zen Aura=96840786935717", "Meow Meow=71666111389227",
    "Mesmerizer=92707348383277", "Metro Man arm swings=136271269847411", "mia combo=96802160483786", "Michael Jackson=140440735589603",
    "Michael Jackson=122773107025712", "Michael Jackson [BEST]=78058324703968", "Michael Jackson [R6]=74694797137796", "Michael Jackson Don't You Wanna Dance?=108689081325917",
    "Michael Jackson's Moonwalk=117122778628254", "Michael Myers Bounce=102592510788385", "Micheal Jackson Billie Jean Shuffle=118775787227492", "Mii Height Swing Setalcix=95276923919374",
    "Mini Character Flying=113802715921687", "Mini Kong=17000058939", "Miss Wanna Dance=139794934138721", "Missy Alt Idle=75934234099196",
    "Mister DJ ALOY Dance 🎧=119498910445357", "Mizi and Sua Zombie Stage Dance=125345050090053", "Mizzyilde2=135830891114268", "MJ - P.Y.T. Pretty Young Thing=137234266130963",
    "MJ - P.Y.T. Pretty Young Thing Emote=75357856215825", "MJ WBSS Pose=70824540467936", "MM2 Dead=139859849852362", "MM2 Death Fake 💀=133100143612300",
    "MM2 Death Pose #18=128887547620452", "MM2 Death Pose #19=129607060980306", "mm2 fake dead animation=118924291179144", "MM2 Fake Dead Pose ⭐ORIGINAL⭐=112012240287101",
    "MM2 Fake Dead Pose!=83548980186247", "MM2 Fake Dead 💀=135577679359629", "MM2 Fake Dead 😂 [ORIGINAL!]=129174200931713", "mm2 fake dead💀🩸=97009468170837",
    "MM2 fake death=105211692745701", "MM2 FAKE DEATH=91610146158808", "MM2 FAKE DEATH=95359175468519", "MM2 Fake Death #2 💀=86737199460577",
    "MM2 Fake Death #67=120770612024540", "mm2 Fake Death Aura=79752732725361", "MM2 Fake Death 💀=82652818997998", "Mm2 Fake/Troll Death Pose Face Down [Best!]=115826426132733",
    "Mm2 Fake/Troll Death Pose Face Down Looped [=120297569833211", "MM2 Fly Troll=77225083864173", "MM2 HIDE EMOTE 💀=72645929642362", "mm2 moonwalk=73044186255618",
    "mm2 sit=114073840953498", "mm2 zen emote=84844011970846", "MM2 🗿😂💀=98470833910652", "mne=130306491160500",
    "Model Girl Chit Chat (LOOP)=138474797040170", "Money Hop Spin=126821507055878", "money hop switch=90527893708410", "Money Hop Switch=134222090358172",
    "Monkey=3716636630", "Montagem Dauntless=75781447447869", "Montagem Dauntless Emote=107543760791741", "Montagem Dauntless 🔥=87207067574749",
    "Montagem Rugada Dance=90799337175813", "MONTAGEM RUGADA Dance=102042670532753", "Moon Walk=79127989560307", "Moonwalk=111378664166805",
    "Moonwalk (Wall Glitch working!!)=94145237216111", "Moonwalk - Michael Jackson=106492757940057", "Moonwalk Emote=109935174914875", "Moonwalk 🌑=112949441447038",
    "MoonWalk 🕺💃=76651483970313", "Moonwalking=133893578023173", "MOSH=118307905798773", "Moves In Circles=116542843064087",
    "Moves3=122992192594911", "MrBeast Dance=112959569569176", "murder drone J singing=137167235854534", "Murder Mystery=110697733932236",
    "Music Bop Sit=78680722382383", "My leg!=106009758901150", "Mysterious Aura Floating=107637958424933", "Nagi Seishiro's Celebration=94925651501842",
    "NBA Monster Dunk=82163305721376", "Neck Roll=93641632427451", "Neck Roller=85798169379866", "Neck Rolling=102721286990911",
    "needahug=136351164174649", "Needy Baddie Hip Sway Shake=88930291814081", "Needy Balance=132847325726583", "Needy Big Jump Split (OG) 🔮=77105631563435",
    "Needy Bounce Circle Vibes=123385411558042", "Needy Cartwheel Split=91490872407594", "Needy Chinese Split Shake Bounce=135925982490201", "Needy Floor Kicks (OG) 🔮=72836415850583",
    "Needy Floor Leg Split Clacks (OG) 🔮=97849575131852", "Needy Handstand Shake👑=82362333393434", "Needy hip shake=109160317354326", "Needy hitting Drums (OG) 🔮=128470030678347",
    "Needy Kitty Paw Clean=116788859391617", "Needy Leg Splits!! (OG) ð=137064024843676", "needy me=137894800082618", "Needy Playful Cat Girl=96622556579696",
    "Needy Scary Floor Backbend (OG) 🔮=116237678043598", "Needy Shoulder Bounce=136906891464248", "NEEDY STRETCH=90916169735130", "Needy Summersalt Flip (OG) 🔮=105218245488037",
    "Needy V sit Split Drop (OG) ð®=111539333518905", "Nerdy Gangster Walk Emote=137387756852651", "Nervous Shake=138158511759177", "Nervous What?=72418307955912",
    "Nervy Dance=125328720114284", "Nervy Dance [Endlessly]=139272278121427", "Nervy Dance Viral⭐=130014783641205", "Nervy Dance ⭐ORIGINAL⭐=120460625087186",
    "Never Seen=83282485878936", "New Jeans - NewJeans=95717405852618", "NewJeans - ETA=94694691436126", "NEWJEANS - HAERIN FOOTWORK (BEST)=129768963987399",
    "NEWJEANS - HOW SWEET (BEST)=139708788204374", "Newmoney=74802164510104", "Nicki Minaj Anaconda=15571539403", "Nicki Minaj Boom Boom Boom=15571538346",
    "Nicki Minaj Starships=15571540519", "Nicki Minaj That's That Super Bass Emote=15571536896", "Nightrave=71396075562679", "Ninja Pon Pon Dance=93017756144935",
    "Ninja Rest=2431864798", "NO HANDS=95664256018756", "NO NA - HONK!=85081207670974", "no na - honk!=99211668237091",
    "Nonchalant Aura=113420186823258", "Nonchalant Sleep=107847025239513", "Nope Finger (emote)=77206866044608", "Not my problem!=106231308583489",
    "Nuh Uh! (Finger Wiggle)=91380965860245", "Nya San=118688124889191", "Nyan Nyan!=73796726960568", "O Cavaleiro sem cabeça=89996714362912",
    "obby body=89513877372187", "Obbylicous=93830421556048", "OH WHO IS YOU=91023138078288", "Old Town Road Dance - Lil Nas X (LNX)=5938394742",
    "Oliver Tree - Miss You=119770855180935", "Olivia Rodrigo Fall Back to Float=15554016057", "Olivia Rodrigo good 4 u=15554013003", "Olivia Rodrigo Head Bop=15554010118",
    "Olivia Rodrigo Head Bop [CHEAP]=79580284786292", "Olympic Dismount=18666650035", "OMG Dauntless Setalcix=132148363993807", "On The Outside - Twenty One Pilots=7422841700",
    "ONCE HOP HOP!=104304182344567", "One-legged Snare Trap=108644020480886", "Onion=123015710605336", "Onion=113890289455724",
    "oof=102375342410006", "Open Cute Halloween Kawaii Girl Door Dance=91004743359923", "Oppa Gangnam=83912764513888", "opqkeoqwjfbskwqe=130158035529697",
    "Orange Justice=77533922015432", "Orange Justice=110064349530772", "Originalton - Ali Beats=88078657170986", "Otsukare Summer (R6 Dance)=92841912466001",
    "Overhead Sword Swing+Trail=135651574315379", "P.B.J.T.=88721672617892", "pa=120851600820942", "pain and suffering=93195109588878",
    "Painty Hip=98390285414324", "Pangako - Kyle Echarri=80610306024248", "Pangya Dance (HQ)=135495405058646", "PangYa Dance 3.0=95926267112611",
    "Pangya Danceð=89439360145889", "Panic Run=79338722896418", "Panini Dance - Lil Nas X (LNX)=5915781665", "paparazzi dance ð=107080697327035",
    "PARROT PARTY DANCE=121067808279598", "Party Funk - Young Madz=75260305088958", "Party Rock Anthem=105248382902194", "Party Rock Athem=110003971983203",
    "party rockaew=112117423429986", "Pasinho do Jamal=71286446361487", "Passionate Hug ❤️=104195305137770", "Patrick Big Guy Dance=125195309818879",
    "Patrick Big Guy Shake=112985632617474", "Pebble Sway=96553028084936", "Perfect Landing=102908638418793", "Pet Scratching=91636971804870",
    "Peter Griffin's Death Pose=99005087791705", "PFP image 🖼️ Profile picture=105154865533725", "pfp pose 1=118012099685185", "Phase=79653736088166",
    "Phibz=95386318624540", "Phibz [OG]=128729212388115", "Phut On=139830733782518", "Piggyback Ride V1 [MATCHING]=123355126614341",
    "Pilates Yoga=132211170497861", "Pink Blush [REAL OG]=118810107277204", "Plane=119746055344304", "Plane=134913783169182",
    "Play Dead Troll Trick Emote mm2 pose fake ra=89115363544461", "Playful Sitting Pose=99717843920931", "Plushie Silly Sit Bounce=95364656613882", "Point2=3576823880",
    "Pointer=113762665979807", "Pointer (fix)=102550757379728", "pointing=74165627596519", "Police Holding Vest Pose 3=129808432573291",
    "PomPom Kawaii=119965361722451", "Pony Boy Dance=103221702057073", "Pop Dat Thang=118324930828218", "POP DAT THANG=113910843410865",
    "Popstar Dance=72782116826779", "Popstar Moves=84189016835389", "Popstar Moves=87757463565936", "Popular=71302743123422",
    "pose bonita 2=130507772007856", "Pose for the Pic ð¸=108922782921118", "pose on the haters=117710397544137", "Possessed=102610758906338",
    "Possessed Glitcher=106370760824973", "Possessed Soul=70968361335871", "Power Blast=4849497510", "pretty pose=100183082366263",
    "prime bee alt mode=111462700846699", "profile pose=90738176929949", "Propeller=118475047823955", "PROTOTYPE RID BEE EMOTE=96627083094284",
    "Proxima Creatura=76503754262527", "psycho teddy=76331646003885", "Psycho Teddy=95325218641213", "Psycho Teddy (NEW)=83253526640613",
    "Psycho Teddy (QT)=106573644247725", "Psycho Teddy [R6]=96274144760859", "Psycho Teddy Dance=102677636691916", "Psycho Teddy QT Dance - FNF=123322597221249",
    "Psycho teddy QT: Rewired=90016241596086", "pu=137246750222800", "puedo ir al bano por favor=85312000287799", "Pulo legal=119666172316930",
    "pump it up! che che dance=138048539904497", "Pumpkin Legend ð¥=132315093859677", "Punch=89232537815457", "punch=90514350912025",
    "Punch Spam=110217467718237", "Puppy Paws Sitting=82732155086058", "PUSH UPS=117393814539242", "Queen Runway Model=108683274449989",
    "Quiet Waves=7466046574", "R15 Death (Accurate)=114899970878842", "R6 Califorina Girls [Forsaken]=84430246447182", "R6 Cheer [REMASTERED]=96797913078430",
    "R6 Clap Walk👏🚶=137224865650526", "R6 Fairy Angel Wings Dance Cheer loop PfP=102554539472135", "R6 Fairy emote hands emote=126138255391227", "R6 headless=140228280803943",
    "r6 headless=137914114762121", "R6 Universal L Troll emote PFP=122493602769059", "R6StandingWithArmsCrossed=136193209603529", "ra=79341764384279",
    "Rabbit Hole - Miku=133481721436918", "Race Car=121936817462716", "Rafa Polinesio Baile=133047022806044", "Ragdoll Pose=119835367491047",
    "Ragdoll Push=91452077708399", "Rage (Travis Scott Dance)=88039852624605", "Rage Emote 🔥=71458368369800", "Raiden Combat Fighter Punch=79754714365703",
    "Raiden Fighting Armstrong [OG]=91875205749975", "Raiden Punching Armstrong Loop=77038149201681", "Raiden Punching Emote=132765228709724", "Rakai Dance=132617851151069",
    "Rakai Emote=135686271244127", "ram=130518325581743", "Ram Thai (Traditional Thai Dance)=125287781119035", "Rambunctious=108128682361404",
    "Rambunctious=112084325910222", "Rambunctious=75528418031928", "Rampage=103619409581335", "Rampage Dance=98700489297135",
    "Random Moves=107591912237291", "Random Switch Remix - Carpe Diem=73869872008828", "Ransom (Lil Tecca)=85374633601516", "Ransom - Lil Tecca [BEST]=124545355827898",
    "Rapid combat punching loop=89923862224536", "Rat Dance=94083401455021", "Rat Dance=105515769832740", "Rat dance=121838903053629",
    "Rat Dance=98603994713783", "Rat Dance=85364777159340", "Rat Dance=83606297144428", "Rat Dance (BEST)=135116358532087",
    "Rat Dance Meme=79460913196046", "rebel pose II=75209018358928", "reggeton dembow=117178268034885", "Relax Flying Anime (Floating Emote)=131950236025472",
    "Relax sit wave=76192412060228", "Relaxed Aura Float=102302509981176", "Relaxed Sit=115335565370028", "Relaxed Sit=99568437064777",
    "Relaxed sitting posture=121916986514584", "Relaxing=109841917283898", "Reze Dance (HQ)=87471384477488", "Reze Dance (Iris Out)=91032553512904",
    "Richard Dance=132398612239363", "RiRiRi Happy Halloween=98464793617142", "Rise Above - The Chainsmokers=13071993910", "Robot=3576721660",
    "Robot M3GAN=90569436057900", "Rock Guitar - Royal Blood=6532155086", "Rock n Roll=15506496093", "Rock On=5915782672",
    "Rock Out=136905358266269", "Rock Out - Bebe Rexha=18225077553", "Rock Star - Royal Blood=6533100850", "Rocket Punch 🚀 [WORKS]=77826212344574",
    "Rodeo Dance - Lil Nas X (LNX)=5938397555", "Roll Out=118445737906352", "rollie=124522011862575", "rolling crybaby=130726889233022",
    "Rolling Stones Guitar Strum=18148839527", "Ronaldo bicycle kick (realistic head movemen=118651779459759", "Rose Giftð¹=132380943956928", "Roy Purdy Dance=92960627078693",
    "Royal Bow=129069699443329", "Royale High Kawaii Dance=109892068975068", "RUDE! - Hearts2Hearts=72594018128577", "run=124451433069238",
    "Run R15 (Fake lag)=100297498958164", "RunAnim=119172367728184", "runway model barbie it-girl idle pose=76959071826369", "Russian Dance=74608751145756",
    "Russian Kick=106851183602665", "Sad=4849502101", "Sad Cute Sit=136907560483746", "Sad Depressed Crying Sit / Sitting=95339652051393",
    "Sad Depressed Crying Sit Emote=137381941513487", "sai bua=124641416554132", "Salsa=125245328507670", "Salsa Dance🎆=103097439770467",
    "SaludoChino=105046834079140", "Salute=3360689775", "Samba=6869813008", "Sandwich Dance=4390121879",
    "Sass Drop=101087800376306", "Sass Drop=123256605275082", "sass sdrop=128626168461002", "Sassy Fashion Twirl=103924340632445",
    "Sassy Squat=80389959183615", "Sassy Sturdy=84398123079247", "Saturday Dance - Twenty One Pilots=7422833723", "Scared Balance 😨=119595740405354",
    "Scared Fighter 😨🥊=133770293534495", "Scary tall creature transformation=93875137466223", "Scenario Viral Fortnite Emote=87265477934018", "Scene Cat Emo Pose=109911959040260",
    "scene girl hair flip profile pose idle stanc=128747538975384", "Scene Pose=139344101676103", "Scene Profile Idle Pose Y2K=125386993330077", "Scene roblox profile pose=96118122806813",
    "Scene Roblox Profile Pose=108221503648290", "scp 096 comix rage panic idk=74093388615627", "Scuba=137082666948441", "scuba=117850836515726",
    "SCUBA (special kid edition)=98181109918778", "Scuba dance=134000932573586", "Scuba Dance=122593180858012", "Scuba Dive=85383168035717",
    "Scuba Nick Wilde=70919402339484", "Scuba Scuba=127673093401267", "Scuba Trend=133781849142726", "Scuba Trend=135211326811898",
    "Scuba Ttk Dance 🦊=116038754021133", "searching for things!=92385700908111", "Seated arm swinging=86838882867566", "Secret Handshake Dance=120642514156293",
    "Secret Handshake Dance 2 - Wicked Official=134373057501582", "SHAKE=132367660388476", "shake it in a Circle=104077918384157", "Shake That=129424335541851",
    "Shake, shake your body=90892258346326", "sharp's Bloodpop Jo Slide=124987679420663", "sharp's French Confidence=113927348020837", "Shattered=124305244640379",
    "shigureui cute hip sway=96768816121605", "Shinobi Ninja Stance🥷⚔️=123667222918352", "Shots Body Roll (OG LOOPED)=93323817610021", "Shoulder Brush=94383973025946",
    "Show Dem Wrists - KSI=7202898984", "Shrek Roar=18524331128", "Shrug=3576968026", "Shuffle=4391208058",
    "Shuffling=115925652377890", "shy=139049781286625", "Shy=3576717965", "Shy Cute Dance=123171730178868",
    "Shy Cutie Wave Pose=72919273788837", "Shy Doll Cute Idle Profile Pose=119594957300817", "Shy Doll Pose=124669544231060", "shy doll profile pose=76371388857067",
    "shy emote=120633748793137", "shy girl ditzy profile idle pose=105105422180908", "Shy Guy Pose=128719506590628", "Shy hip sway=100107749035207",
    "Shy Idle=125769442119170", "shy kawaii leg up pose=138865147288909", "Side Shuffle=122127591991917", "Side Sit=85370173309996",
    "Side To Side=124500753391312", "Side to Side=3762641826", "Sidekicks - George Ezra=10370922566", "Sigma Boy Dance=111665668810578",
    "Signature Series #7: Panther Dance Pose=78728641812280", "Signature Shuffle=81442470330880", "Silent Hill Nurse Walk=126273142521762", "Silly Animals Dance=70888470847518",
    "silly jumping spider dance=89157328525577", "Silly R6 Claps 👏=108329930056599", "Simple Float=122186955446776", "Sincere Apology 心からの謝罪=138976199888095",
    "sit=125309249510299", "Sit=2431845940", "Sit=139621472081340", "Sit=101743582461626",
    "Sit=93262662842394", "Sit Comfy Idle=91223337249721", "Sit sad=90380593733717", "Sitting Afloat Aura Farm Emote=119198740654266",
    "Sitting Curiously And Waiting=105485454801300", "sitting down sideways=129388203904067", "Sitting idle relaxing emote=81269233597629", "Sitting paw pose=82546941818518",
    "sitting squat idle pose=113960239878969", "Skadoosh Emote - Kung Fu Panda 4=16371235025", "Skibidi Toilet - Titan Speakerman Laser Spin=103102322875221", "sky cotl respectful pianist emote=128076869727982",
    "Sky Kneel Idle=138420761747634", "Skydive Float=117450301345937", "Sleep=4689362868", "Sleeping [😴💤]=70545360034629",
    "Sleeping Angel=100885431049593", "Sleeping kitty=99890419467599", "Sleeping Sideways=113546798537900", "Sleeping Soundly=104024961010344",
    "Slide Animation=76472102421522", "Slide Stride=84755954692013", "Slow Aura Run=104785408689451", "Slow Body Move (TRY IT)=126460079003784",
    "Slow Dembow=73236219340808", "Slow Transformation=80772558169667", "Slow-Mo Backflip | IShowSpeed Flip [NEW]=86617727183442", "Smacking Taunt=108362621864338",
    "Smitten=114733835193725", "Smooth Criminalð´ï¸ Michael Jackson Dance=94226046885073", "Smooth Dance Shake=85218380139701", "SMOOTH FLOW=90734983525350",
    "Smooth Recovery=72381346508195", "Smooth Rizz Rose=83362314681140", "Smooth Strut=75265738131190", "snail=90921832503687",
    "Sneaky=3576754235", "Snow angels=135922662345048", "Soccer Celebration=96036241973571", "Soda Pop - Saja Boys=88398357963696",
    "Sol de Janeiro - Samba=16276506814", "Somebody To Love - Justin Bieber=109185409632841", "Sonic Adventure Profile Pose=104721659176603", "Sonic Rizzing Meme=117718592141337",
    "Sonic Super Smash Bro Profile Pose=108881021586001", "sorry ^6^=122602533016356", "Spartan Kneeling Pose=104540126896834", "Spartan Last Stand Pose=108135257848773",
    "Speed Mirage=108946079729323", "Spice Floor Call=103399717097173", "Spice Happy Jumping=133319600812587", "Spice Jersey Bounce=126529053628312",
    "Spice Keep Bouncing=121347449465835", "Spice Nâ Slide=103814076459025", "Spice On Floor=126837474178236", "Spice Queen of Da Place=126468010841883",
    "Spicy Flow Vibes=124212021234700", "Spicy Life Dance=106381695975693", "Spider Hero Backflip Fail=110170834848186", "Spider Perch=83900510950349",
    "SpiderMan [Original]=130987133773478", "Spiderman Flip=76917397850049", "Spiderman Hang=108635834286627", "Spiderman Hang Emote=122982084924015",
    "Spiderman Hanging Emote=124867800260244", "SpiderMan Hanging Pose [Original]=110511723808460", "Spiderman Swing=92720180811246", "Spidey=125345657979494",
    "spin=94010518849749", "Spin=138343476996773", "Spin Around with a Friend Matching=74809337211634", "Spin Around With A Friend Matching=70617440339521",
    "Spinning Cat 🐈=136395667208956", "Spinning Kick=133180711707319", "Spinning Seal 🔥=138876073749015", "Sponge Dance=137261874619072",
    "Spongebob=123043305808890", "SpongeBob Dance=18443271885", "SpongeBob Imaginaaation ð=18443268949", "Spongebob Shuffle Dance ð§½=107899954696611",
    "Springtrap Dance=132007669525235", "Springtrapped (Face Animated)=125974779288821", "Sprite Party=73035330017773", "Stadium=3360686498",
    "standing=104174864618812", "Standing Idle=90335941430298", "Standing Idle III=109728966289331", "Standing With Arms Crossed (R6)=123268587568376",
    "Stateside - ð¥ PinkPantheress + Zara Larss=85028685451071", "Sticker Dance Move - NCT 127=12259885838", "Stink Bop=72354096919765", "Stop Yapping=79486674621177",
    "Stray Kids - Do It=95256633886548", "Stray Kids Walkin On Water=100773414188482", "Street Flow Bounce=91773089278851", "Street Glide=137284968787523",
    "Streetcat Dance | FLAVOR FOLEY=126617188194420", "strong fit gym athlete=124463853222965", "Strongest Core (Pushups)=82751689885144", "STURDY=120302905807132",
    "Sturdy Dance - Ice Spice=17746270218", "Sturdy Dance - Ice Spice [CHEAP]=72333659132786", "Sturdy NYC Dance=122687759897103", "Sturdy R6=92335786854446",
    "Stylish Floating=88425531063616", "Stylish Sit=112035743224829", "Subject Three Dance=124074854102911", "SUIIIIII=72049728640815",
    "Sukuna Aura Idle=89424059240713", "Sukuna Aura Pose=138453007205351", "summer beach cool lay down rizz pose=83561362524410", "Summer Shuffle=88400685038212",
    "Super Angry Emote=129703461555600", "Super Angry Rage=123442021331017", "Super Charge=10478368365", "Super Dance 'n Pose=131562289148988",
    "Super Hero Fly=138837045519342", "Super Neck Roll=103059747180830", "Superhero Reveal=3696759798", "Supervillain Aura=86210123167301",
    "Swag Walk=10478377385", "Swan Dance=7466048475", "Swaying Sit=120565455646158", "Sweet But Savage Rhythm Doll=111800051354629",
    "Sweet Fluffy Bunny Dance ORIGINAL=85587917792339", "Sweet Hug Pose V1 [MATCHING]=100597438247721", "Sweet Hug Pose V2 [MATCHING]=79076692213299", "Sweet Sit Pose (Ledge sitting)=103541659586127",
    "sweetest angel sit=108687337953057", "Sweetest Angel Sit Pose=124094235516309", "sweetest ditzy girl mwa kisses profile idle =114166751987965", "Swing it Back=90830856441098",
    "Swinging Around=96772271267910", "Swish=3821527813", "Swordsman Shine=121265516142907", "T=3576719440",
    "T Pose Lagging=71439920304486", "Tail Wag Happy Idle=71980669913244", "Take Me Under - Zara Larsson=6797938823", "Take The L=73593666217037",
    "Take The L=133005847117851", "Take The L=75633408126191", "Take The L Emote=124573621747512", "Take The L â=82405492529515",
    "Taladro=90904431476925", "Talk Now!=124515602705816", "Tall Scary Creature=79216795769647", "TALL TROLL EMOTE (BEST)=99690697597724",
    "Tank=85076031433488", "Tank Transformation=132382355371060", "Tantrum=5104374556", "Teaching my Brother Self Defense - Fight Dan=109374935882471",
    "Team USA Breaking Emote=18526338976", "Telekinesis Head Floating Aura=81666519067619", "Teleportation=90747070082228", "Tell Me, Tell Me! - Wonder Girls=112118419325053",
    "test=93697082930253", "test=95661496666230", "Teto Territory=97263450325496", "Thai Curtsey (Thon sai bua)=108147658741833",
    "Thai Pran Boon Emote - Taloong Nora=89690816094308", "thank u, next - Ariana Grande (eternal sunsh=104513810861811", "Thank You Bow Ladies and Gentlemen=132566708912466", "Thanos Happy Jump=76228547293788",
    "that girl (pharah walk)=135589431456520", "that girl - tyla=137465570063539", "THAT OR THAT - MEGAN KATSEYE TREND=83974162258933", "That or that KATSEYE cat meme ai [loop versi=110166756329600",
    "That's RED RED - Cortis=78868540419185", "The Brazilian Dance Trend=90200513472556", "The Conductor - George Ezra=10370926562", "The coolest standing pose in the world=110330632237517",
    "The Face TWO=108017532227717", "The Feels - TWICE=109978563428648", "The Hype Dance=113706374899354", "The Rick Dance=96163949804727",
    "The Run Around=88834614877886", "The Tylil Dance [Kai Cenat Dance]=107010273569673", "The Weeknd Starboy Strut=130245358716273", "The Whistle Occurence 3=73371232180986",
    "There she goes (Needoh)=110888199011090", "This Is How We Do It - Montell Jordan=108800811844906", "Thragg=110942922785464", "throw IT around=102233912630939",
    "Throw it in a Circle=100762605566096", "Throw That Mafa Setalcix=116626107611887", "Tidy Viral Fortnite Dance=139288586561705", "Tilt=3360692915",
    "TMNT Dance=18665886405", "Toga Cute Pose=82588172109343", "Toki Yo Tomare - ILLIT=112471658649848", "Tommy - Archer=13823339506",
    "Tommy K-Pop Mic Drop=14024722653", "Tomodachi Mii Hip Sway=105909453197841", "Too Embarrassed=119799073993790", "Too Much Aura 😂🤣=115251688861139",
    "Too Nonchalant 2=89786279593734", "Top Rock=3570535774", "Tornado=82995540773684", "Torture Dance=81780730637211",
    "Toxic - Britney Spears=100220887298229", "TrackMaker Dance=75541759268466", "Tractor Tipped=98545982432499", "Tree=4049634387",
    "Trendy Nicki Leg Pose=92846015938931", "True Heart=103168660352906", "Tuf Pof Dance=89516674251215", "Tunnel Vision Dance - Melanie Martinez=91384946379246",
    "TV Time Dance=75017857395637", "TWICE - The Feels=79194689807074", "TWICE - The Feels=76353656697104", "TWICE - What Is Love=91811386043367",
    "TWICE - What is Love Dance=124496001910000", "TWICE Fancy=13520623514", "TWICE Feel Special=14900153406", "TWICE I GOT YOU part 1=16215060261",
    "TWICE I GOT YOU part 2=16256253954", "TWICE Like Ooh-Ahh=14124050904", "TWICE LIKEY=14900151704", "TWICE Moonlight Sunrise=12715393154",
    "TWICE Pop by Nayeon=13768975574", "TWICE Set Me Free - Dance 2=12715397488", "TWICE Takedown pt 1 from Kpop Demon Hunters=94796833553521", "TWICE The Feels=12874468267",
    "TWICE What Is Love=13344121112", "Twirl=3716633898", "twisttwist=115864274997641", "TYLA - CHANEL (TIKTOK DANCE)=131260558736428",
    "TYLA Chanel - Kpop Trendy Dance=80341701361363", "Tyla Dance=89145613574909", "Tyler the Creator Thought I Was Dead Dance (=80284215658652", "Tyranno=100749476356724",
    "Tyranno=82026568595380", "Ud'zal's Summoning=3307604888", "Uh-Oh=123709994654098", "UHIHUAIHDUIASDHandisan=82821122917790",
    "Umamusume Dance=130838810836830", "Unbothered Aura Floating Sitting=82207766385627", "Untitled Animation Clip=134427194669196", "UNTITLED_EMOTE=87449999054282",
    "Up and Down - Twenty One Pilots=7422843994", "Up n Down=102321242614268", "Uprise - Tommy Hilfiger=10275057230", "Upside down floating AURA=89468381929192",
    "Upside Down Flying Aura Emote=128466542605588", "Upside Down Leg Trap=104746315279105", "Urban Dance=89466407313325", "V Pose - Tommy Hilfiger=10214418283",
    "vampire aura=98895703748412", "Vampire Pose [ORIGINAL]=113919169704818", "Vans Ollie=18305539673", "Vecna Stranger Things Fly Animation Emote Bo=90555063826230",
    "Vergil sitting=127472995585735", "VERITY DANCE=117213198692804", "Vibing / Community Animation Aura Idle=70508706371253", "Vibing / Community Animation Idle=123355872827206",
    "Victory - 24kGoldn=9178397781", "Victory Dance=15506503658", "Vogue Dip=110881393097630", "Vroom Vroom=18526410572",
    "w Zesty Sturdy [OG]=102116140919792", "waaaawwaw=101267408955187", "Wake Up Call - KSI=7202900159", "Wall Aura Farm Pose=118853736905967",
    "wall glitch=117371244220009", "Wall Glitch=134959614315079", "Wall Glitch [MM2]=94640602162016", "Wall Lean=88969192102242",
    "Wall Lean Sleep=81634873942889", "Wall Leaning Pose=116339791267842", "Wall Noclip V2 (GLITCH) 🔥=129502648783018", "Wall Phase (GLITCH)=79017619155911",
    "Wall Phase / Phase thru a wall=83940125449271", "Wall Phase mm2=128291598423779", "Wally cube=113525364964938", "Wally Speedster Run=133948663586698",
    "Wally's Pose=131961970776128", "Wanna play?=16646438742", "WANNA RUN AWAY!=113981851317990", "Wave=507770239",
    "wave dance=109187325296825", "weaweawea=113193855301349", "wewewewe=133908514354521", "What is love - TWICE=108822762796917",
    "Where my hug at?=126072355993454", "Whoop Dat=90128625469549", "Will has power!!! STRANGER THINGS 5=93772541546815", "Wind-up Doll=84672536279912",
    "Windmill Hands (Spinning)=123918756206905", "WISH NLE=125783279336153", "Wisp - air guitar=17370797454", "Wizard101 Funky=91070333048655",
    "Wobbly Zesty Sturdy Dance=77880729614024", "WOOF BARK WOOF=88859617281337", "Work Shuffle=113639659954023", "Worm=108956933782219",
    "Worm Floating Endless=125154823571632", "Worm Wiggle=139965300109140", "www dance=75161093536449", "x=89267240986916",
    "Xaviersobased Emote=131763631172236", "Y=4391211308", "Y2K Pop Star Pose=137550880705793", "Ya Ya Ying Dance=130850357238599",
    "Ya Ya Ying Dance [OG]=114457468919031", "yamal=122621053646570", "Yanagi walking=134222958219878", "YANKEE SQUAT - ONE OR EIGHT=97852187875656",
    "yayuhh=84463648474285", "Yeah!!! DANCE=133744907381184", "yellow autobird alt mode=71235379895362", "yes, and? pose - Ariana Grande=123649334918282",
    "Yip Man Squat=140242258489541", "You Buggin=128590528820587", "You can't sit with us - Sunmi=9983549160", "You Really Want To=99678693283000",
    "YOUNG BADDIE SWAY=140060490329742", "Young Baddie Sway Emote=123302231375866", "Your Bias - ILLIT=120644976120955", "Your Psycho Teddy Setalcix=137735729555450",
    "yu=116892243401304", "Yugi Aura float=86328482557854", "Yuji Jumping Edit=113702736944973", "Yuji Jumping Slowed Ver=138319492354914",
    "Yungblud Happier Jump=15610015346", "YUNGBLUD â HIGH KICK=14022978026", "z=91395202196297", "z sturdy (actual original)=120702604995324",
    "Zen=2431812646", "Zen MM2=110684746976061", "Zero Two Dance V2=95385842020103", "Zesty Dip=119065867783612",
    "Zesty Sit=126714950219869", "Zesty Study Gangster Dance=135546574918527", "zesty sturdy=116184219636020", "Zesty Sturdy Dance=84248182445472",
    "Zesty V Dip=71765019355373", "Zombie=4212496830", "Zombie=2513692312", "Zombie Run=138431313591911",
    "Zombie Run Lag=100868777466223", "~cute pose animation~=74005144985537", "à­¨à­§ Sweetest Angel Sit Pose=129766891082557", "à­¨à­§: tadaa headless showoff profile pose!=119934579718052",
    "â³[LIMITED] Kicking Feet=80365921763329", "â³[LIMITED] Vibing Sit=126847889432485", "â curiously cute sitting pose=76261461321661", "â ï¸ Myspace Cute Scene Pose XD â ï¸=73002781025226",
    "â ï¸MM2 FAKE DEATH=75278921479463", "â ï¸MM2 FAKE DEATH 2=138181827835887", "â Honor Knight Kneel=103663987050338", "â¡ (BEST) sassy model catwalk diva=137435098987579",
    "â¡ : cute kawaii hugging and kicking feet=117617643410205", "â¡ : cute pop-pop hip sway dance=113455601219440", "â¡ : cute sitting idle pose=139828710607670", "â¡ : Shy Doll Cute Standing Idle Profile Po=115140876718590",
    "â¡ : super shy girly idle pose=132436768198498", "â¡ cute bossy sassy girl idle pose=137909901344953", "â¡ cute bouncy anime dance=108845097487486", "â¡ cute dolly girl idle pose=91771584024127",
    "â¡ cute halloween magical witch aura idle p=80094678034288", "â¡ cute halloween magical witch idle pose=96252923654843", "â¡ Cute Heart Hands Emote Profile Pose=89791686345950", "â¡ cute kawaii girly idle pose 2=90831367043789",
    "â¡ Cute Kawaii Shy Doll Stance=78712622250645", "â¡ Cute n shy Idle Emote Profile Pose=135994700702758", "â¡ cute shy withdrawn sit=81204065393762", "â¡ Cute Wave Pose â¡=102370555981017",
    "â¡ cutesie shy idle !!=120389512169914", "â¡ ICONIC BY MISTAKE [CHORUS]=128402456731579", "â¡ kawaii magical girl kpop idle pose=126228947948058", "â¡ Magical Float=87526114329356",
    "â¡ soft elegant stance !!=90478555055303", "â¡ ê° Cute Shy Pose=136701250296230", "â¡: Kawaii Bouncy Anime Girl Dance [OG]=130855166586798", "â¥ï¸Otsukare summer=111032510525800",
    "â¡ Raiden Punching Armstrong Loop=115203580644128", "â Obby - Emote=76394392186917", "â Obby Head - Emote [ORIGINAL]=122814100170962", "â¤ï¸ Catch Catch=122758585008323",
    "â¸¸ê± cute knee sit idle pose=72753598082403", "Êâ¡É Cute shy avatar pose (LOOPED)=126684112484206", "ð Princess Hip Sway Dance=105626165333309", "ð Creepy Scene Halloween Zombie Holding H=139460224769900",
    "ðPumpkin Kingð=105381637724646", "ð Distraction Dance=112248683157717", "ð MM2 Fake Dead Emote=114368587461466", "ðMM2 Fake Dead=132384701706046",
    "ðMM2 Fake Dead - 2=95407766746448", "ðMM2 Fake Dead - 3=79297779614324", "ð Hug [Player 1]=102303622774230", "ð Pangya Dance 3.0 !!=136504778836355",
    "ð© MEGA POOP SNIFF ð [AURA]=82904146092287", "ð©MEGA POOPING ð© [AURA] ð=106880906271071", "ðµ Dahood Dance=123783725600432", "ð¥ Godly Floating Sleeping Aura Pose ð¥=122498540377510",
    "ð¥Big Guy - Ice Spice/Spongebob Emote=88312828363279", "ð¥I came to GROOVEð¥[A peanut butter hou=85913265750993", "ð·ï¸ Hornet's Spider Dance ð·ï¸=74716792202343", "ð·ï¸ Peter Parker Dance=101033489367553",
    "ð·ï¸ Realy strange Hornet's Spider=114530046828576", "ð·ï¸ Spiderman Hanging=82370885440550", "ð Default Dance=133158580522571", "ð L Dance=73039500693145",
    "ð¤ cute n timid idle profile pose=110252467018810", "ð¤£ GOOFY FLAP FLY ANIME=120904242187887", "ð¤ªSkibidi Shakeâ¡=80115988215727", "ð¥ª Flat Sandwich=93321486801164",
    "ðª Relax Coin Flip=128000234046934", "Û¶à§ doll cutely sitting pose=125243870523332", "ʚ shy sweet girl idle pose ɞ=80284764090065", "‿ ♡ cute popular girl leg up idle pose=108534441679766",
    "⋆. 𐙚 ˚ cute really shy moe anime figurine id=95677566088665", "⋆. 𐙚 ˚ cute shy moe anime figurine idle 2=100007364792545", "⋆. 𐙚 ˚ cute shy moe anime figurine sit=107582066125638", "⏳ Crazy Spin 🤣=92917225057505",
    "⏳[LIMITED] Anime Floating Pose=136958459748672", "⏳[LIMITED] Fake Death MM2 Troll (Play Dead)⌛=108303540623500", "⏳Cute Sit🩷=85592619802883", "★Cute Angel Floating Sleeping Pose★=86362559796788",
    "♡ - cute cat sway=130604582792860", "♡ - cute idol pose=111702931159158", "♡ : cutest sitting kitty idle pose=99518025887215", "♡ adorable kawaii kitty pose=96429511107553",
    "♡ adorable nervous doll stance=109325363646232", "♡ Adorable Sitting Idle Animation ♡=76017477441387", "♡ cute idle sitting pose=75667716778971", "♡ cute knee hug kicking sit=74401672672268",
    "♡ cute kneel=136111916873624", "♡ cute shy doll sitting pose=113191191612860", "♡ cute shy sway=86647826566501", "♡ cute sitting hunch holding knees=122653699693096",
    "♡ dreamy kawaii pose=105862323709646", "♡ kawaii shy blushing cute princess pose idl=79868601009380", "♡ needy playful beg kitty cute idle emote ♡=114268323820491", "♡ Shy Kawaii Sit Emote Profile Pose=97812358910519",
    "♡ Surfin’ Boy - Red Velvet=119949449986980", "♡ sweet shy idle pose=75144499106881", "♡ tell me | dance=96913856511428", "♡ | cute doll sitting pose=89514814416698",
    "♡ ꒰ kawaii scaredy cat ꒱ ♡=71111376690206", "♡ ꒰ little paw pose ꒱ ♡=120269830518800", "♡ ꒰ look at my outfit pose ꒱ ♡=102460718210746", "♡ ꒰ so vein pose ꒱ ♡=129817040947248",
    "♡: (OG) Convéncete Cutesy Girly Dance Trend=75956230643865", "♡┊cute cat sitting pose=81667177201128", "♡┊cute shy girly pose=100879224498501", "♡┊cute sitting pose girl=113395513116333",
    "♡⸝⸝ [OG] skittl bouncy emote pop ა=81357343246605", "♡⸝⸝ skittl psycho teddy kitty dance ა=133841468648398", "♡꒰Cute kneeling idle while gently swaying=116461502113567", "♡꒰Cute laid back cross-legged sitting idle=115001638642783",
    "✅ faceless aura=140517993580237", "✅ ICONIC BY MISTAKE - KATSEYE=108948405177918", "✨ Effortless Aura Idle=139564397681096", "❤ hip shake dance ❤=139652031550619",
    "❤️ Cute Sit=81290503655908", "⭐ [R6] Kemusan (Subject Three) Chinese Dance=73558460178012", "Ⳋ : city girl idle pose=78656128914215", "Ⳋ : cute girl idle pose=100032266752613",
    "Ⳋ : cute kawaii girl idle pose=138010055738117", "Ⳋ : cute kitty girl idle pose=138041243085599", "⸝⸝♡ loveit - cute kawaii dance=126249664690607", "𑣲 : bashful cute girl idle pose=105216006499052",
    "𑣲 : calm lovely girl idle pose=134612610419821", "𑣲 : shy adorable girl idle pose=75522753867313", "𖹭 Besties Hugging Cute Sit - Right 𖹭=97818939129535", "𖹭 Clingy Hugging Idle Sit (left)=77581606977247",
    "🍰Jump Scare=86776319417391", "🍰Liquid Hopper=123331029620037", "🍰Sidestep Surfer=94954032122075", "🎮 GG EZ=135347992401400",
    "🐍 Snake Walk=118280724147624", "🐍 Snake Walk=88364882947161", "🐕 Dog Running=75428340774834", "🐵Monkey Swing🍌=125560102325933",
    "🐶 Dog Emote=103741238050600", "🐶 Dog Marking Territory 🐕=100245228535805", "🐶 Doggy Hop!=140446908446198", "🐶 Excited Dog 🐕=78371370698825",
    "🐺 BIG BAD WOLF WALK 🐺 [BEST]=127933956258501", "🐼 Soft Kawaii Sitting=81005927168365", "👽Drift Bounce=99521988400195", "👽Prank Bounce=122023612653635",
    "👽Ripple Hop=86050260033750", "💀 Fake Dead MM2 💀=134152779103070", "💀 MM2 Fake Death=86376184597685", "💀MM2 Fake Dead=118311197700838",
    "💀MM2 Fake Dead 2 Emote=140012602400466", "💀MM2 Fake Death Pose [OG]=136423312746068", "💅 Shy Look Back=106763068099163", "💖cute to hold in hand (girl)=80230534251142",
    "💖cute to hold in hand (man)=123539217444716", "💤Relax on anything💤=103788107074255", "💩 POOP AURA 😂=98423524002247", "💩 POOP MEME EMOTE 😂=127093264307685",
    "📦 Box=86715986499504", "🔥 [FIRE] Minigun=125697457284727", "🔥 Crazy Needy Zesty Baddie Neck Roll 🔥=122075097724053", "🔥 I got that feeling 🔥=96908245529644",
    "🔥 IT'S TV TIME! TENNA DELTARUNE CABBAGE DANC=101376308247871", "🔥 JAMAICA BOUNCE GROOVE=95101377291705", "🔥 Scuba Nick Wilde Dance Trend V2 🔥=70704448977709", "🔥Cartoon Dance=105891694561834",
    "🔥i got that feeling OG 🔥=89037395231275", "🔥super aura flying pose idle🔥=99598322490746", "🕷️ Spider-man Hanging Emote=131459647865786", "🕷️ Spiderman Hanging ⭐ORIGINAL⭐=75244648112729",
    "🕷️ Spiderman Stance ⭐ORIGINAL⭐=82168391287550", "🕸️ Spider Man Pose [OG]=76425296597756", "🖤 Needy stretch=74323946292413", "😂 CHICKEN WALK! 🐔 FUNNY EMOTE DANCE=105957813790869",
    "😈 Sukuna Ryomen Godly Idle 😈 Jujutsu Kaisen=130037833933057", "😌 Relaxing Emote=87543093495527", "😭 Crying Emote.=76669505780630", "😱 Screaming Emote.=106126238069740",
    "🤣 FLAILING TO KEEP FLYING=118697592487621", "🤫 Quiet on the Creek=86896136309601", "🥋 Sumo Palm Strike 💥=73461797245955", "🥋 Sumo Slap Frenzy Emote 💥=128261868540861",
    "🦇 Vampire Hanging 🧛🏻=118270008348416", "🦊 Animal Marking Territory=118755133636650", "🦒 Giraffe Mode=83597001174340", "🦸 Super Hero FLYING [BEST]=102496329287916",
    "🧸 PSYCHO TEDDY DANCE [BLISSFUL FNF QT]=111884482804705", "🩷kitten cuteness bouncy dance=90218815699313",
}

do
    local currentTrack, currentAnim = nil, nil
    E.emoteNames, E.emoteIds = {}, {}
    for _, entry in ipairs(EMOTES) do
        local name, id = entry:match("^(.-)=(%d+)$")
        -- имя встречается в каталоге по нескольку раз: без проверки emoteIds
        -- хранил только последний id, и оба пункта списка играли одно и то же
        if name and not E.emoteIds[name] then
            E.emoteNames[#E.emoteNames + 1] = name
            E.emoteIds[name] = tonumber(id)
        end
    end

    E.stopEmote = function()
        if currentTrack then pcall(function() currentTrack:Stop(0.15) end); currentTrack = nil end
        if currentAnim then pcall(function() currentAnim:Destroy() end); currentAnim = nil end
    end

    -- Loop Emote: эмоция перезапускается как зацикленный трек с приоритетом
    -- Idle. Ходьба тогда подмешивается сверху и не обрывает анимацию.
    E.playEmote = function(name)
        local id = E.emoteIds[name] or tonumber(name)
        local char = LP.Character
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if not (id and hum) then return end

        local animator = hum:FindFirstChildOfClass("Animator")
        if not animator then
            animator = Instance.new("Animator")
            animator.Parent = hum
        end
        E.stopEmote()

        local before = {}
        for _, t in ipairs(hum:GetPlayingAnimationTracks()) do before[t] = true end
        if not pcall(function() return hum:PlayEmoteAndGetAnimTrackById(tostring(id)) end) then
            Notify("Emote", "Blocked in this place", "warn")
            return
        end

        local track
        for _ = 1, 14 do
            for _, t in ipairs(hum:GetPlayingAnimationTracks()) do
                if not before[t] then track = t break end
            end
            if track then break end
            task.wait(0.05)
        end
        if not track then
            Notify("Emote", "Blocked here: " .. tostring(name), "warn")
            return
        end
        currentTrack = track
        pcall(function() track:AdjustSpeed(F.EmoteSpeed or 1) end)

        if F.LoopEmote then
            local resolved = track.Animation and track.Animation.AnimationId
            if resolved and resolved ~= "" then
                local a = Instance.new("Animation")
                a.Name, a.AnimationId, a.Parent = "InertiaEmote", resolved, gui
                local ok, loop = pcall(function() return animator:LoadAnimation(a) end)
                if ok and loop then
                    pcall(function() track:Stop(0.1) end)
                    loop.Priority, loop.Looped = Enum.AnimationPriority.Idle, true
                    pcall(function() loop:Play(0.12, 1, F.EmoteSpeed or 1) end)
                    currentAnim, currentTrack = a, loop
                else
                    a:Destroy()
                end
            end
        end
    end

    -- зацикленную эмоцию сбивает смена оружия или прыжок: возвращаем обратно
    tc(RunService.Heartbeat:Connect(function()
        if not (F.LoopEmote and currentTrack) then return end
        if not currentTrack.IsPlaying then
            pcall(function() currentTrack:Play(0.1, 1, F.EmoteSpeed or 1) end)
        end
    end))

    gui.Destroying:Connect(E.stopEmote)
end

-- animation packs --------------------------------------------------------
-- Меняем id прямо в Character.Animate: игра сама подхватывает новые движения.
-- Полный набор слотов (Walk/Run/Jump/Fall/Climb/Swim/SwimIdle + два idle) и
-- копия STATIC_PACKS из mm2.txt, поэтому пак применяется целиком, а не только
-- run/walk. Оригинальные анимации запоминаются при первом применении и
-- возвращаются паком Default.
do
    local slots = {
        { name = "Idle",     group = "idle",     children = { "Animation1", "Animation2" } },
        { name = "Walk",     group = "walk",     children = { "WalkAnim" } },
        { name = "Run",      group = "run",      children = { "RunAnim" } },
        { name = "Jump",     group = "jump",     children = { "JumpAnim" } },
        { name = "Fall",     group = "fall",     children = { "FallAnim" } },
        { name = "Climb",    group = "climb",    children = { "ClimbAnim" } },
        { name = "Swim",     group = "swim",     children = { "Swim" } },
        { name = "SwimIdle", group = "swimidle", children = { "SwimIdle" } },
    }
    local slotToKey = { Walk = "WalkAnim", Run = "RunAnim", Jump = "JumpAnim", Fall = "FallAnim", Climb = "ClimbAnim", Swim = "Swim", SwimIdle = "SwimIdle" }

    local STATIC_PACKS = {
        ["Adidas Aura"] = { Animation1 = 110211186840347, Animation2 = 114191137265065, WalkAnim = 83842218823011, RunAnim = 118320322718866, JumpAnim = 109996626521204, FallAnim = 95603166884636, ClimbAnim = 97824616490448, Swim = 134530128383903, SwimIdle = 94922130551805 },
        ["Adidas Community"] = { Animation1 = 122257458498464, Animation2 = 102357151005774, WalkAnim = 122150855457006, RunAnim = 82598234841035, JumpAnim = 75290611992385, FallAnim = 98600215928904, ClimbAnim = 88763136693023, Swim = 133308483266208, SwimIdle = 109346520324160 },
        ["Adidas Sports"] = { Animation1 = 18537376492, Animation2 = 18537371272, WalkAnim = 18537392113, RunAnim = 18537384940, JumpAnim = 18537380791, FallAnim = 18537367238, ClimbAnim = 18537363391, Swim = 18537389531, SwimIdle = 18537387180 },
        ["Amazon Unboxed"] = { Animation1 = 98281136301627, WalkAnim = 90478085024465, RunAnim = 134824450619865, JumpAnim = 121454505477205, FallAnim = 94788218468396, ClimbAnim = 121145883950231, Swim = 105962919001086, SwimIdle = 129126268464847 },
        ["Astronaut"] = { Animation1 = 10921034824, Animation2 = 10921036806, WalkAnim = 10921046031, RunAnim = 10921039308, JumpAnim = 10921042494, FallAnim = 10921040576, ClimbAnim = 10921032124, Swim = 10921044000, SwimIdle = 10921045006 },
        ["Bubbly"] = { Animation1 = 910004836, Animation2 = 910009958, WalkAnim = 910034870, RunAnim = 910025107, JumpAnim = 910016857, FallAnim = 910001910, ClimbAnim = 909997997, Swim = 910028158, SwimIdle = 910030921 },
        ["Cartoon"] = { Animation1 = 742637544, Animation2 = 742638445, WalkAnim = 742640026, RunAnim = 742638842, JumpAnim = 742637942, FallAnim = 742637151, ClimbAnim = 742636889, Swim = 742639220, SwimIdle = 742639812 },
        ["Catwalk Glam"] = { Animation1 = 133806214992291, Animation2 = 94970088341563, WalkAnim = 109168724482748, RunAnim = 81024476153754, JumpAnim = 116936326516985, FallAnim = 92294537340807, ClimbAnim = 119377220967554, Swim = 134591743181628, SwimIdle = 98854111361360 },
        ["Elder"] = { Animation1 = 10921101664, Animation2 = 10921102574, WalkAnim = 10921111375, RunAnim = 10921104374, JumpAnim = 10921107367, FallAnim = 10921105765, ClimbAnim = 10921100400, Swim = 10921108971, SwimIdle = 10921110146 },
        ["Levitation"] = { Animation1 = 616006778, Animation2 = 616008087, WalkAnim = 616013216, RunAnim = 616010382, JumpAnim = 616008936, FallAnim = 616005863, ClimbAnim = 616003713, Swim = 616011509, SwimIdle = 616012453 },
        ["Mage"] = { Animation1 = 10921144709, Animation2 = 10921145797, WalkAnim = 10921152678, RunAnim = 10921148209, JumpAnim = 10921149743, FallAnim = 10921148939, ClimbAnim = 10921143404, Swim = 10921150788, SwimIdle = 10921151661 },
        ["NFL"] = { Animation1 = 92080889861410, Animation2 = 74451233229259, WalkAnim = 110358958299415, RunAnim = 117333533048078, JumpAnim = 119846112151352, FallAnim = 129773241321032, ClimbAnim = 134630013742019, Swim = 132697394189921, SwimIdle = 79090109939093 },
        ["Ninja"] = { Animation1 = 656117400, Animation2 = 656118341, WalkAnim = 656121766, RunAnim = 656118852, JumpAnim = 656117878, FallAnim = 656115606, ClimbAnim = 656114359, Swim = 656119721, SwimIdle = 656121397 },
        ["R6 (Classic)"] = { Animation1 = 180435571, WalkAnim = 180426354, RunAnim = 180426354, JumpAnim = 125750702, FallAnim = 180436148, ClimbAnim = 180436334, Swim = 180426354, SwimIdle = 180435571 },
        ["Pirate"] = { Animation1 = 837024662, WalkAnim = 837023892, RunAnim = 837023444, JumpAnim = 837024350, FallAnim = 837024147, ClimbAnim = 837025325, Swim = 837025054, SwimIdle = 837025054 },
        ["No Boundaries"] = { Animation1 = 18747067405, Animation2 = 18747063918, WalkAnim = 18747074203, RunAnim = 18747070484, JumpAnim = 18747069148, FallAnim = 18747062535, ClimbAnim = 18747060903, Swim = 18747073181, SwimIdle = 18747071682 },
        ["Robot"] = { Animation1 = 616088211, Animation2 = 616089559, WalkAnim = 616095330, RunAnim = 616091570, JumpAnim = 616090535, FallAnim = 616087089, ClimbAnim = 616086039, Swim = 616092998, SwimIdle = 616094091 },
        ["Stylish"] = { Animation1 = 616136790, Animation2 = 616138447, WalkAnim = 616146177, RunAnim = 616140816, JumpAnim = 616139451, FallAnim = 616134815, ClimbAnim = 616133594, Swim = 616143378, SwimIdle = 616144772 },
        ["Superhero"] = { Animation1 = 10921288909, Animation2 = 10921290167, WalkAnim = 10921298616, RunAnim = 10921291831, JumpAnim = 10921294559, FallAnim = 10921293373, ClimbAnim = 10921286911, Swim = 10921295495, SwimIdle = 10921297391 },
        ["Toy"] = { Animation1 = 10921301576, WalkAnim = 10921312010, RunAnim = 10921306285, JumpAnim = 10921308158, FallAnim = 10921307241, ClimbAnim = 10921300839, Swim = 10921309319, SwimIdle = 10921310341 },
        ["Vampire"] = { Animation1 = 10921315373, WalkAnim = 10921326949, RunAnim = 10921320299, JumpAnim = 10921322186, FallAnim = 10921321317, ClimbAnim = 10921314188, Swim = 10921324408, SwimIdle = 10921325443 },
        ["Werewolf"] = { Animation1 = 10921330408, Animation2 = 10921333667, WalkAnim = 10921342074, RunAnim = 10921336997, FallAnim = 10921337907, ClimbAnim = 10921329322, Swim = 10921340419, SwimIdle = 10921341319 },
        ["Wicked \"Dancing Through Life\""] = { Animation1 = 92849173543269, Animation2 = 132238900951109, WalkAnim = 73718308412641, RunAnim = 135515454877967, JumpAnim = 78508480717326, FallAnim = 78147885297412, ClimbAnim = 129447497744818, Swim = 110657013921774, SwimIdle = 129183123083281 },
        ["Wicked Popular"] = { Animation1 = 118832222982049, Animation2 = 76049494037641, WalkAnim = 92072849924640, RunAnim = 72301599441680, JumpAnim = 104325245285198, FallAnim = 121152442762481, ClimbAnim = 131326830509784, Swim = 99384245425157, SwimIdle = 113199415118199 },
        ["Zombie"] = { Animation1 = 10921344533, Animation2 = 10921345304, WalkAnim = 10921355261, RunAnim = 616163682, JumpAnim = 10921351278, FallAnim = 10921350320, ClimbAnim = 10921343576, Swim = 10921352344, SwimIdle = 10921353442 },
    }

    E.packNames = { "Default", "Astronaut", "Bubbly", "Cartoon", "Elder", "Levitation", "Mage",
                    "Ninja", "Pirate", "R6 (Classic)", "Robot", "Stylish", "Superhero", "Toy",
                    "Vampire", "Werewolf", "Zombie", "Adidas Aura", "Adidas Community",
                    "Adidas Sports", "Amazon Unboxed", "Catwalk Glam", "NFL", "No Boundaries",
                    "Wicked \"Dancing Through Life\"", "Wicked Popular" }

    local origAnims = {}

    local function getAnimateGroup(groupName)
        local c = LP.Character
        local anim = c and c:FindFirstChild("Animate")
        if not anim then return nil end
        -- папки в Animate могут быть и Idle, и idle: ищем без учёта регистра
        local direct = anim:FindFirstChild(groupName)
        if direct then return direct end
        for _, f in ipairs(anim:GetChildren()) do
            if f.Name:lower() == groupName then return f end
        end
        return nil
    end

    local function ensureSlotAnim(grp, childName)
        local a = grp:FindFirstChild(childName)
        if not a then
            a = Instance.new("Animation")
            a.Name = childName
            a.Parent = grp
        end
        return a
    end

    local function toAnimationId(value)
        local text = tostring(value or ""):match("^%s*(.-)%s*$")
        local digits = text:match("(%d+)")
        if not digits or tonumber(digits) == 0 then return nil end
        if text:find("rbxassetid://", 1, true) or text:find("roblox.com/asset", 1, true) then
            return text
        end
        return "rbxassetid://" .. digits
    end

    -- оригиналы снимаем и с Animate, и с AppliedDescription — R15 живёт на
    -- описании, и без него восстановление вернёт старые id
    local function captureDefaults(hum, animate)
        local descFields = {
            Idle = "IdleAnimation", Walk = "WalkAnimation", Run = "RunAnimation",
            Jump = "JumpAnimation", Fall = "FallAnimation", Climb = "ClimbAnimation",
            Swim = "SwimAnimation", SwimIdle = "SwimAnimation",
        }
        local descValues = {}
        if hum then
            pcall(function()
                local desc = hum:GetAppliedDescription()
                for slotName, field in pairs(descFields) do descValues[slotName] = desc[field] end
            end)
        end
        for _, slot in ipairs(slots) do
            local group = animate and animate:FindFirstChild(slot.group)
            for _, childName in ipairs(slot.children) do
                local child = group and group:FindFirstChild(childName)
                local id = child and toAnimationId(child.AnimationId)
                if not id then id = toAnimationId(descValues[slot.name]) end
                if id and origAnims[slot.group .. "/" .. childName] == nil then
                    origAnims[slot.group .. "/" .. childName] = id
                end
            end
        end
    end

    local function applyToSlot(slot, id)
        local animationId = toAnimationId(id)
        if not animationId then return false end
        local grp = getAnimateGroup(slot.group)
        if not grp then return false end
        for _, childName in ipairs(slot.children) do
            local child = ensureSlotAnim(grp, childName)
            local key = slot.group .. "/" .. childName
            if origAnims[key] == nil then
                local originalId = toAnimationId(child.AnimationId)
                if originalId then origAnims[key] = originalId end
            end
            child.AnimationId = animationId
        end
        return true
    end

    local function kickReload(hum, animate)
        pcall(function() for _, t in ipairs(hum:GetPlayingAnimationTracks()) do t:Stop(0) end end)
        pcall(function() animate.Disabled = true end)
        task.wait(0.06)
        pcall(function() animate.Disabled = false end)
        pcall(function()
            hum:ChangeState(Enum.HumanoidStateType.Landed)
            task.wait(0.03)
            hum:ChangeState(Enum.HumanoidStateType.Running)
        end)
    end

    E.applyPack = function()
        local c = LP.Character
        local hum = c and c:FindFirstChildOfClass("Humanoid")
        local animate = c and c:FindFirstChild("Animate")
        if not (hum and animate) then return end

        local name = F.AnimPack or "Default"
        if name == "Default" then
            if next(origAnims) == nil then return end
            for key, id in pairs(origAnims) do
                local grpName, childName = key:match("^(.-)/(.+)$")
                local g = grpName and animate:FindFirstChild(grpName)
                local ch = g and g:FindFirstChild(childName)
                local animationId = toAnimationId(id)
                if ch and animationId then ch.AnimationId = animationId end
            end
            origAnims = {}
            kickReload(hum, animate)
            Notify("Animations", "Default animations restored", 2)
            return
        end

        local pack = STATIC_PACKS[name]
        if not pack then return end
        captureDefaults(hum, animate)
        local applied = 0
        for _, slot in ipairs(slots) do
            if slot.name == "Idle" then
                local a1, a2 = pack.Animation1, pack.Animation2
                local id1 = toAnimationId(a1) or toAnimationId(a2)
                local id2 = toAnimationId(a2) or toAnimationId(a1)
                if id1 and applyToSlot(slot, id1) then applied = applied + 1 end
                if id2 and id2 ~= id1 then
                    local grp = getAnimateGroup(slot.group)
                    if grp then
                        local an2 = ensureSlotAnim(grp, "Animation2")
                        local key = slot.group .. "/Animation2"
                        if origAnims[key] == nil then
                            local originalId = toAnimationId(an2.AnimationId)
                            if originalId then origAnims[key] = originalId end
                        end
                        an2.AnimationId = id2
                    end
                end
            else
                if applyToSlot(slot, pack[slotToKey[slot.name]]) then applied = applied + 1 end
            end
        end
        kickReload(hum, animate)
        Notify("Animations", name .. " applied (" .. applied .. " animations)", 3)
    end

    -- Пак прямо из каталога: по id бандла тянем состав и раскладываем анимации
    -- по слотам, опознавая их по названию (Run/Walk/Idle/...).
    local KEYWORD = {
        { "swimidle", "SwimIdle" }, { "swim", "Swim" }, { "climb", "Climb" },
        { "fall", "Fall" }, { "jump", "Jump" }, { "run", "Run" }, { "walk", "Walk" },
        { "idle", "Idle" }, { "pose", "Idle" },
    }

    E.applyCatalogPack = function(idText)
        local id = tostring(idText or ""):match("%d+")
        if not id then Notify("Animations", "Enter a bundle id", "warn") return end

        task.spawn(function()
            local ok, body = pcall(function()
                return game:HttpGet("https://catalog.roblox.com/v1/bundles/" .. id .. "/details")
            end)
            if not (ok and type(body) == "string") then
                Notify("Animations", "Catalog request failed", "bad")
                return
            end
            local decoded, data = pcall(function()
                return game:GetService("HttpService"):JSONDecode(body)
            end)
            if not (decoded and type(data) == "table" and type(data.items) == "table") then
                Notify("Animations", "Not an animation bundle", "warn")
                return
            end

            local bySlot = {}
            for _, item in ipairs(data.items) do
                local name = tostring(item.name or ""):lower()
                for _, pair in ipairs(KEYWORD) do
                    if name:find(pair[1], 1, true) and not bySlot[pair[2]] then
                        bySlot[pair[2]] = item.id
                        break
                    end
                end
            end
            if not next(bySlot) then
                Notify("Animations", "No animations in that bundle", "warn")
                return
            end

            local c = LP.Character
            local hum = c and c:FindFirstChildOfClass("Humanoid")
            local animate = c and c:FindFirstChild("Animate")
            if not (hum and animate) then return end

            captureDefaults(hum, animate)
            local applied = 0
            for _, slot in ipairs(slots) do
                local assetId = bySlot[slot.name]
                if assetId and applyToSlot(slot, assetId) then applied = applied + 1 end
            end
            kickReload(hum, animate)
            Notify("Animations", applied > 0
                and ("Catalog pack applied (" .. applied .. " slots)")
                or "Nothing applied", applied > 0 and nil or "warn")
        end)
    end

    tc(LP.CharacterAdded:Connect(function()
        if F.AnimPack and F.AnimPack ~= "Default" then task.delay(1.5, E.applyPack) end
    end))
end

-- anti trap ----------------------------------------------------------------
-- Ловушку целиком отрабатывает клиент: TrapSystem.TrapHitLocal ставит
-- WalkSpeed 0.01 на 4 секунды и сам сообщает серверу. Глушим это соединение —
-- тогда нет ни замедления, ни доклада серверу.
do
    local function setConnections(disable)
        local rs = game:GetService("ReplicatedStorage")
        local sys = rs:FindFirstChild("TrapSystem")
        local ev = sys and sys:FindFirstChild("TrapHitLocal")
        if not (ev and getconnections) then return false end
        local any = false
        for _, conn in ipairs(getconnections(ev.OnClientEvent)) do
            local ok = pcall(function()
                if disable then conn:Disable() else conn:Enable() end
            end)
            any = any or ok
        end
        return any
    end

    E.setAntiTrap = function(on)
        if not setConnections(on) and on then
            Notify("Anti Trap", "Speed guard only", "warn")
        end
    end

    -- фолбэк, если отключать соединение нечем: сразу возвращаем скорость
    tc(RunService.Heartbeat:Connect(function()
        if not F.AntiTrap then return end
        local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
        if hum and hum.WalkSpeed <= 0.5 then
            hum.WalkSpeed = F.WalkSpeed or 16
            hum.JumpPower = F.JumpPower or 50
        end
    end))

    -- ловушки живут в раунде: после респавна соединения новые
    tc(LP.CharacterAdded:Connect(function()
        if F.AntiTrap then task.delay(1.5, function() setConnections(true) end) end
    end))
end


-- custom body ----------------------------------------------------------
-- Меши в наборах R6-шные (torso/leftarm/...), а персонаж в MM2 R15. Поэтому
-- оригинальные части не заменяются, а прячутся, и поверх вешаются свои детали
-- с этими мешами. Размер и высота — слайдерами: на R15 такие наборы
-- один-в-один не садятся.
do
    local ROOT = GAME_DIR .. "/bodies"

    -- Наборы нарисованы строго под R6: торс 2x2x1, конечность 1x2x1, и UV у
    -- них тоже R6-шные — поэтому шаблон рубашки/штанов ложится на них ровно.
    -- Персонаж в MM2 R15, поэтому собираем локальный R6-скелет: свои пять
    -- деталей нужного размера крепим к костям R15, а весь оригинал прячем.
    local MAP = {
        {
            file = "torso.mesh", part = "Torso", anchor = "UpperTorso",
            size = Vector3.new(2, 2, 1), off = Vector3.new(0, -0.2, 0), cloth = "shirt",
        },
        {
            file = "leftarm.mesh", part = "Left Arm", anchor = "LeftUpperArm",
            size = Vector3.new(1, 2, 1), off = Vector3.new(0, -0.4, 0), cloth = "shirt",
        },
        {
            file = "rightarm.mesh", part = "Right Arm", anchor = "RightUpperArm",
            size = Vector3.new(1, 2, 1), off = Vector3.new(0, -0.4, 0), cloth = "shirt",
        },
        {
            file = "leftleg.mesh", part = "Left Leg", anchor = "LeftUpperLeg",
            size = Vector3.new(1, 2, 1), off = Vector3.new(0, -0.4, 0), cloth = "pants",
        },
        {
            file = "rightleg.mesh", part = "Right Leg", anchor = "RightUpperLeg",
            size = Vector3.new(1, 2, 1), off = Vector3.new(0, -0.4, 0), cloth = "pants",
        },
    }

    -- всё R15-тело кроме головы и корня: иначе сквозь меши торчат родные руки
    local HIDE_R15 = {
        "UpperTorso", "LowerTorso",
        "LeftUpperArm", "LeftLowerArm", "LeftHand",
        "RightUpperArm", "RightLowerArm", "RightHand",
        "LeftUpperLeg", "LeftLowerLeg", "LeftFoot",
        "RightUpperLeg", "RightLowerLeg", "RightFoot",
    }

    local built, hidden = {}, {}

    E.listBodies = function()
        local out = {}
        if not (isfolder and listfiles and isfolder(ROOT)) then return out end
        for _, entry in ipairs(listfiles(ROOT)) do
            local name = entry:match("[\\/]([^\\/]+)$")
            if name and not name:find("%.") then out[#out + 1] = name end
        end
        table.sort(out)
        return out
    end

    E.clearBody = function()
        for _, p in ipairs(built) do pcall(function() p:Destroy() end) end
        table.clear(built)
        for part, t in pairs(hidden) do
            if part.Parent then pcall(function() part.Transparency = t end) end
        end
        table.clear(hidden)
    end

    E.applyBody = function()
        E.clearBody()
        if not F.CustomBody then return end

        local folder = F.BodyAsset
        local char = LP.Character
        local asset = getcustomasset or getsynasset
        if not (folder and char and asset and isfile and readfile and writefile) then return end

        if not isfile(ROOT .. "/" .. folder .. "/torso.mesh") then
            local list = E.listBodies()
            if #list == 0 then return end
            folder = list[1]
            F.BodyAsset = folder
        end
        local key = folder:gsub("[^%w]", "_")
        local scale = (F.BodyScale or 100) / 100
        local lift = F.BodyOffset or 0

        -- одежда: шаблоны Shirt/Pants — обычные картинки с R6-развёрткой,
        -- поэтому кладутся прямо на меш через TextureId
        local shirt, pants = "", ""
        if F.BodyClothing ~= false then
            local sh = char:FindFirstChildOfClass("Shirt")
            local pn = char:FindFirstChildOfClass("Pants")
            shirt = (sh and sh.ShirtTemplate) or ""
            pants = (pn and pn.PantsTemplate) or ""
        end

        for _, name in ipairs(HIDE_R15) do
            local part = char:FindFirstChild(name)
            if part and hidden[part] == nil then
                hidden[part] = part.Transparency
                part.Transparency = 1
            end
        end

        for _, entry in ipairs(MAP) do
            local path = ROOT .. "/" .. folder .. "/" .. entry.file
            local anchor = char:FindFirstChild(entry.anchor)
            if anchor and isfile(path) then
                -- getcustomasset различает файлы только по имени, а torso.mesh
                -- лежит в каждом наборе: делаем копию с уникальным именем
                local unique = ROOT .. "/" .. folder .. "/" .. key .. "_" .. entry.file
                if not isfile(unique) then
                    local okRead, body = pcall(readfile, path)
                    if okRead and body then pcall(writefile, unique, body) end
                end
                local okId, id = pcall(asset, isfile(unique) and unique or path)
                if okId and id ~= "" then
                    local shell = Instance.new("Part")
                    shell.Name = entry.part
                    shell.Size = entry.size
                    shell.CanCollide, shell.CanQuery, shell.CanTouch = false, false, false
                    shell.Massless = true
                    shell.Color = F.BodyTint and Color3.fromHSV((F.BodyHue or 0) / 360, 0.55, 0.95)
                        or anchor.Color
                    shell.Material = anchor.Material

                    local mesh = Instance.new("SpecialMesh")
                    mesh.MeshType = Enum.MeshType.FileMesh
                    mesh.MeshId = id
                    mesh.Scale = Vector3.new(scale, scale, scale)
                    local template = (entry.cloth == "pants") and pants or shirt
                    if template ~= "" then mesh.TextureId = template end
                    mesh.Parent = shell

                    shell.CFrame = anchor.CFrame * CFrame.new(entry.off + Vector3.new(0, lift, 0))
                    shell.Parent = char

                    local weld = Instance.new("WeldConstraint")
                    weld.Part0, weld.Part1 = shell, anchor
                    weld.Parent = shell

                    built[#built + 1] = shell
                end
            end
        end

        if #built == 0 then
            E.clearBody()
            E.notify("Body", "No meshes in " .. ROOT .. "/" .. tostring(folder), "warn")
        end
    end

    -- одежду игра выдаёт не мгновенно: как появилась, перекладываем на меши
    tc(LP.CharacterAdded:Connect(function(char)
        if not F.CustomBody then return end
        char.ChildAdded:Connect(function(c)
            if (c:IsA("Shirt") or c:IsA("Pants")) and F.CustomBody then
                task.delay(0.3, E.applyBody)
            end
        end)
    end))

    ------------------------------------------------- модель из каталога Roblox
    -- game:GetObjects тянет публичный ассет прямо на клиенте. Если внутри
    -- риг с Humanoid — играем его анимации, если просто меш — вешаем как есть.
    local catalog, catalogAnim = nil, nil

    E.clearCatalog = function()
        -- теперь это Heartbeat-соединение, а не трек анимации
        if catalogAnim then pcall(function() catalogAnim:Disconnect() end); catalogAnim = nil end
        if catalog then pcall(function() catalog:Destroy() end); catalog = nil end
        for part, t in pairs(hidden) do
            if part.Parent then pcall(function() part.Transparency = t end) end
        end
        table.clear(hidden)
    end

    E.applyCatalogModel = function()
        E.clearCatalog()
        if not F.CatalogModel then return end
        local id = tostring(F.CatalogId or ""):match("%d+")
        if not id then Notify("Model", "Enter an asset id", "warn") return end

        local char = LP.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local myHum = char and char:FindFirstChildOfClass("Humanoid")
        if not (hrp and myHum) then return end

        task.spawn(function()
            local ok, objects = pcall(function() return game:GetObjects("rbxassetid://" .. id) end)
            if not (ok and objects and objects[1]) then
                Notify("Model", "Asset not loadable on client", "bad")
                return
            end
            local obj = objects[1]
            local scale = (F.BodyScale or 100) / 100

            for _, part in ipairs(char:GetChildren()) do
                if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
                    if hidden[part] == nil then hidden[part] = part.Transparency end
                    part.Transparency = 1
                end
            end

            local anchorPart
            if obj:IsA("BasePart") then
                obj.CanCollide, obj.CanQuery, obj.CanTouch, obj.Massless = false, false, false, true
                obj.Size = obj.Size * scale
                obj.CFrame = hrp.CFrame
                obj.Parent = char
                anchorPart = obj
                catalog = obj
                Notify("Model", "Static mesh - nothing to animate", "warn")
            else
                obj.Parent = workspace
                local rig = obj:FindFirstChildOfClass("Humanoid")
                local prim = obj.PrimaryPart or (rig and rig.RootPart)
                    or obj:FindFirstChild("HumanoidRootPart") or obj:FindFirstChildWhichIsA("BasePart", true)
                if not prim then
                    obj:Destroy()
                    Notify("Model", "Model has no parts", "warn")
                    return
                end

                for _, d in ipairs(obj:GetDescendants()) do
                    if d:IsA("BasePart") then
                        d.CanCollide, d.CanQuery, d.CanTouch, d.Massless = false, false, false, true
                    end
                end
                pcall(function() obj:PivotTo(hrp.CFrame) end)
                anchorPart = prim
                catalog = obj

                -- Не приваренные детали болтались отдельными телами и тормозили
                -- ходьбу: жёстко скрепляем всё с корнем модели. Кости рига
                -- (Motor6D) не трогаем, иначе анимация перестанет двигать модель.
                for _, d in ipairs(obj:GetDescendants()) do
                    if d:IsA("BasePart") and d ~= prim and not d:FindFirstChildWhichIsA("Motor6D")
                        and not (rig and d.Parent:FindFirstChildOfClass("Motor6D")) then
                        local hasJoint = false
                        for _, j in ipairs(obj:GetDescendants()) do
                            if j:IsA("Motor6D") and (j.Part0 == d or j.Part1 == d) then hasJoint = true break end
                        end
                        if not hasJoint then
                            local w = Instance.new("WeldConstraint")
                            w.Part0, w.Part1 = d, prim
                            w.Parent = d
                        end
                    end
                end

                if rig then
                    -- чужой Humanoid пытается ходить и падать сам: глушим его
                    rig.PlatformStand = true
                    pcall(function() rig:SetStateEnabled(Enum.HumanoidStateType.Physics, true) end)
                    pcall(function() rig:ChangeState(Enum.HumanoidStateType.Physics) end)
                    rig.WalkSpeed, rig.JumpPower = 0, 0
                end

                -- Риг с Motor6D можно анимировать: гоняем те же анимации, что и
                -- у своего персонажа, по состоянию собственного Humanoid.
                local hasJoints = false
                for _, d in ipairs(obj:GetDescendants()) do
                    if d:IsA("Motor6D") then hasJoints = true break end
                end

                if rig and hasJoints then
                    local animator = rig:FindFirstChildOfClass("Animator") or Instance.new("Animator", rig)
                    local animate = char:FindFirstChild("Animate")
                    local function idOf(group, fallback)
                        local folder = animate and animate:FindFirstChild(group)
                        local value = folder and folder:FindFirstChildWhichIsA("StringValue")
                        return (value and value.Value ~= "" and value.Value) or fallback
                    end

                    local tracks = {}
                    for group, fallback in pairs({
                        idle = "rbxassetid://507766388", walk = "rbxassetid://913402848",
                        run = "rbxassetid://913376220", jump = "rbxassetid://125750702",
                        fall = "rbxassetid://180436148",
                    }) do
                        local a = Instance.new("Animation")
                        a.AnimationId = idOf(group, fallback)
                        a.Parent = obj
                        local okT, track = pcall(function() return animator:LoadAnimation(a) end)
                        if okT and track then
                            track.Looped = (group ~= "jump")
                            track.Priority = Enum.AnimationPriority.Core
                            tracks[group] = track
                        end
                    end

                    local playing
                    local function switch(name)
                        if playing == name then return end
                        if playing and tracks[playing] then pcall(function() tracks[playing]:Stop(0.15) end) end
                        playing = name
                        if tracks[name] then pcall(function() tracks[name]:Play(0.15) end) end
                    end

                    catalogAnim = RunService.Heartbeat:Connect(function()
                        if not (obj.Parent and myHum.Parent) then return end
                        local state = myHum:GetState()
                        if state == Enum.HumanoidStateType.Jumping then switch("jump")
                        elseif state == Enum.HumanoidStateType.Freefall then switch("fall")
                        elseif myHum.MoveDirection.Magnitude > 0.05 then
                            switch(myHum.WalkSpeed > 18 and "run" or "walk")
                        else switch("idle") end
                    end)
                    Notify("Model", "Rig loaded, animations follow you")
                else
                    Notify("Model", "No rig inside - static model", "warn")
                end
            end

            local weld = Instance.new("WeldConstraint")
            weld.Part0, weld.Part1 = anchorPart, hrp
            weld.Parent = anchorPart
        end)
    end

    tc(LP.CharacterAdded:Connect(function()
        if F.CustomBody then task.delay(1.5, E.applyBody) end
        if F.CatalogModel then task.delay(1.5, E.applyCatalogModel) end
    end))
    gui.Destroying:Connect(function()
        E.clearBody()
        E.clearCatalog()
    end)
end

-- local cosmetics -------------------------------------------------------
-- Headless и Korblox локально, без покупки ассета: меши тянутся прямо по id
-- и видны только на твоём клиенте. Ничего не переносится в инвентарь.
do
    local headlessSaved, korbloxSaved = nil, nil

    -- скрываем голову вместе с лицом и шляпами, висящими на ней
    local function applyHeadless(char)
        local head = char:FindFirstChild("Head")
        if not head then return end
        if headlessSaved then
            for part, t in pairs(headlessSaved) do
                if part.Parent then part.Transparency = t end
            end
        end
        headlessSaved = {}
        local hidden = {}
        for _, d in ipairs(head:GetDescendants()) do
            if d:IsA("Decal") or d:IsA("SurfaceGui") or d:IsA("Texture") then
                hidden[#hidden + 1] = d
            end
        end
        if head:IsA("MeshPart") then hidden[#hidden + 1] = head end
        for _, d in ipairs(hidden) do
            headlessSaved[d] = d.Transparency
            d.Transparency = 1
        end
        -- шляпы/аксессуары, прикреплённые к голове, тоже прячем
        for _, acc in ipairs(char:GetChildren()) do
            if acc:IsA("Accessory") then
                local m6 = acc:FindFirstChildOfClass("Motor6D")
                local handle = acc:FindFirstChild("Handle")
                if m6 and m6.Part0 == head and handle and handle:IsA("BasePart") then
                    if headlessSaved[handle] == nil then
                        headlessSaved[handle] = handle.Transparency
                        handle.Transparency = 1
                    end
                end
            end
        end
    end

    -- Korblox Deathwalker правая нога. Классический трюк: верхний сегмент
    -- ноги получает меш с протезом, остальные два прозрачнеют. Ровно так,
    -- как в mm2.txt. Если какой-то меш не отрисуется, pcall не даст упасть.
    local function applyKorblox(char)
        local legNames = char:FindFirstChild("RightUpperLeg")
            and { "RightUpperLeg", "RightLowerLeg", "RightFoot" } or { "Right Leg" }
        local anchor = char:FindFirstChild(legNames[1])
        if not anchor then return end
        if korbloxSaved then
            for part, s in pairs(korbloxSaved) do
                if part.Parent then
                    pcall(function()
                        part.Transparency = s.trans or 0
                        if part:IsA("MeshPart") and s.meshId then
                            part.MeshId = s.meshId
                            part.TextureID = s.textureId
                        end
                        if s.size then part.Size = s.size end
                    end)
                end
            end
        end
        korbloxSaved = {}
        for i, name in ipairs(legNames) do
            local part = char:FindFirstChild(name)
            if part and part:IsA("BasePart") then
                if korbloxSaved[part] == nil then
                    korbloxSaved[part] = {
                        trans = part.Transparency,
                        size = part.Size,
                        meshId = part:IsA("MeshPart") and part.MeshId or nil,
                        textureId = part:IsA("MeshPart") and part.TextureID or nil,
                    }
                end
                if i == 1 and part:IsA("MeshPart") then
                    pcall(function()
                        part.Transparency = 0
                        part.MeshId = "rbxassetid://902942096"
                        part.TextureID = "rbxassetid://902843398"
                        part.Size = Vector3.new(1, 1.5, 1)
                    end)
                else
                    part.Transparency = 1
                end
            end
        end
    end

    E.applyCosmetics = function()
        local char = LP.Character
        if not char then return end
        if F.LocalHeadless then applyHeadless(char) else E.clearHeadless() end
        if F.LocalKorblox then applyKorblox(char) else E.clearKorblox() end
    end

    E.clearHeadless = function()
        if headlessSaved then
            for part, t in pairs(headlessSaved) do
                if part.Parent then part.Transparency = t end
            end
            headlessSaved = nil
        end
    end

    E.clearKorblox = function()
        if korbloxSaved then
            for part, s in pairs(korbloxSaved) do
                if part.Parent then
                    pcall(function()
                        part.Transparency = s.trans or 0
                        if part:IsA("MeshPart") and s.meshId then
                            part.MeshId = s.meshId
                            part.TextureID = s.textureId
                        end
                        if s.size then part.Size = s.size end
                    end)
                end
            end
            korbloxSaved = nil
        end
    end

    E.clearCosmetics = function()
        E.clearHeadless()
        E.clearKorblox()
    end

    tc(LP.CharacterAdded:Connect(function()
        if F.LocalHeadless or F.LocalKorblox then task.delay(1.5, E.applyCosmetics) end
    end))
    gui.Destroying:Connect(function() E.clearCosmetics() end)
end


-- item chams -----------------------------------------------------------
-- Подсвечивается ЛЮБОЙ предмет в руках любого игрока — нож, ствол, мороженое,
-- что угодно — плюс дроп на полу. Раньше список был жёстко из двух имён.
do
    local HL = "InertiaItemCham"
    local COLORS = {
        White = Color3.fromRGB(245, 245, 245), Black = Color3.fromRGB(15, 15, 15),
        Red = Color3.fromRGB(255, 60, 60), Pink = Color3.fromRGB(255, 120, 200),
        Magenta = Color3.fromRGB(255, 60, 170), Orange = Color3.fromRGB(255, 150, 40),
        Yellow = Color3.fromRGB(255, 230, 80), Green = Color3.fromRGB(90, 220, 120),
        Cyan = Color3.fromRGB(60, 220, 255), Blue = Color3.fromRGB(70, 140, 255),
        Purple = Color3.fromRGB(170, 100, 255),
    }
    E.itemChamColors = { "White", "Cyan", "Pink", "Magenta", "Purple", "Blue",
                         "Green", "Yellow", "Orange", "Red", "Black" }
    E.itemChamModes = { "Highlight", "Outline", "Solid", "Crystal", "Neon", "ForceField" }

    local function currentColor()
        if F.ItemChamsRainbow then return Color3.fromHSV(tick() * 0.25 % 1, 0.85, 1) end
        return COLORS[F.ItemChamsColor or "White"] or COLORS.White
    end

    local function strip(inst)
        if not inst or not inst.Parent then return end
        local hl = inst:FindFirstChild(HL)
        if hl then pcall(function() hl:Destroy() end) end
    end

    local function dress(inst, color, mode)
        local hl = inst:FindFirstChild(HL)
        if not (hl and hl:IsA("Highlight")) then
            hl = Instance.new("Highlight")
            hl.Name, hl.Adornee, hl.Parent = HL, inst, inst
        end
        hl.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
        hl.FillColor, hl.OutlineColor = color, color
        if mode == "Outline" then
            hl.FillTransparency, hl.OutlineTransparency = 1, 0
        elseif mode == "Solid" then
            hl.FillTransparency, hl.OutlineTransparency = 0, 0
        elseif mode == "Neon" then
            hl.FillTransparency, hl.OutlineTransparency = 0.75, 0.15
        elseif mode == "ForceField" then
            hl.FillTransparency, hl.OutlineTransparency = 0.5, 0.25
        elseif mode == "Crystal" then
            hl.FillTransparency, hl.OutlineTransparency = 0.6, 1
        else
            hl.FillTransparency, hl.OutlineTransparency = 0.4, 0
        end
    end

    local tracked, nextScan = {}, 0
    tc(RunService.Heartbeat:Connect(function()
        if not F.ItemChams then
            if next(tracked) then
                for inst in pairs(tracked) do strip(inst) end
                table.clear(tracked)
            end
            return
        end
        if tick() < nextScan then return end
        nextScan = tick() + 0.2

        local found = {}

        -- всё, что держат в руках: Tool лежит прямо в модели персонажа
        for _, p in ipairs(Players:GetPlayers()) do
            local char = p.Character
            local mine = (p == LP)
            if char and (F.ItemChamsSelf ~= false or not mine) then
                for _, t in ipairs(char:GetChildren()) do
                    if t:IsA("Tool") then found[t] = true end
                end
            end
        end

        -- и дроп на полу
        if F.ItemChamsDrops ~= false then
            local drop = workspace:FindFirstChild("GunDrop") or workspace:FindFirstChild("GunDrop", true)
            if drop and drop.Parent then found[drop] = true end
            for _, v in ipairs(workspace:GetChildren()) do
                if v:IsA("Tool") or v.Name == "Knife" or v.Name == "ThrowingKnife"
                    or v.Name == "NormalKnife" then
                    found[v] = true
                end
            end
        end

        local color, mode = currentColor(), F.ItemChamsMode or "Highlight"
        for inst in pairs(found) do
            pcall(dress, inst, color, mode)
            tracked[inst] = true
        end
        for inst in pairs(tracked) do
            if not found[inst] or not inst.Parent then
                strip(inst)
                tracked[inst] = nil
            end
        end
    end))

    gui.Destroying:Connect(function()
        for inst in pairs(tracked) do strip(inst) end
    end)
end

-- shaders -----------------------------------------------------------------
-- Полноценная постобработка: свои Bloom, Blur, DepthOfField, ColorCorrection,
-- SunRays и Atmosphere плюс параметры самого Lighting. Игровые эффекты не
-- трогаем — создаём собственные и удаляем их при выключении, а изменённые
-- свойства Lighting запоминаем и возвращаем.
do
    local Lighting = game:GetService("Lighting")

    -- Каждый пресет это законченная картинка, а не одна крутилка.
    -- bloom{intensity, size, threshold} | dof{focus, inFocus, near, far}
    -- cc{brightness, contrast, saturation, tint} | atm{density, haze, glare, color, decay}
    -- light{brightness, exposure, clock, fogEnd, shadowSoftness, ambient, colorShift}
    local PRESETS = {
        Cinematic = {
            bloom = { 1.2, 26, 0.95 }, blur = 0,
            dof = { 70, 55, 0.15, 0.5 },
            cc = { 0.03, 0.18, 0.12, Color3.fromRGB(255, 244, 230) },
            atm = { 0.18, 0.6, 0.1, Color3.fromRGB(215, 222, 235), Color3.fromRGB(125, 135, 150) },
            rays = { 0.1, 0.07 },
            light = { brightness = 2.2, exposure = 0.12, shadowSoftness = 0.5 },
        },
        Vibrant = {
            bloom = { 1.8, 24, 0.85 }, blur = 0,
            cc = { 0.06, 0.28, 0.5, Color3.fromRGB(255, 244, 235) },
            atm = { 0.12, 0.3, 0.2, Color3.fromRGB(225, 235, 255), Color3.fromRGB(120, 135, 160) },
            rays = { 0.15, 0.06 },
            light = { brightness = 3, exposure = 0.25, shadowSoftness = 0.2 },
        },
        Noir = {
            bloom = { 0.5, 14, 1.25 }, blur = 0,
            cc = { -0.03, 0.55, -1, Color3.fromRGB(235, 240, 255) },
            atm = { 0.3, 1.2, 0, Color3.fromRGB(150, 150, 160), Color3.fromRGB(65, 65, 75) },
            light = { brightness = 1.7, exposure = -0.05, clock = 6, shadowSoftness = 0.7,
                      ambient = Color3.fromRGB(90, 90, 95), colorShiftTop = Color3.fromRGB(120, 120, 125), colorShiftBottom = Color3.fromRGB(45, 45, 50) },
        },
        Midnight = {
            bloom = { 1.6, 30, 0.8 }, blur = 2,
            cc = { -0.1, 0.25, 0.05, Color3.fromRGB(140, 165, 255) },
            atm = { 0.6, 2, 0.4, Color3.fromRGB(60, 80, 160), Color3.fromRGB(25, 35, 80) },
            light = { brightness = 0.9, exposure = -0.2, clock = 0, shadowSoftness = 0.9,
                      ambient = Color3.fromRGB(35, 45, 80), colorShiftTop = Color3.fromRGB(70, 90, 180), colorShiftBottom = Color3.fromRGB(15, 20, 45) },
        },
        Sunset = {
            bloom = { 1.4, 30, 0.85 }, blur = 0,
            dof = { 110, 85, 0.08, 0.4 },
            cc = { 0.05, 0.18, 0.3, Color3.fromRGB(255, 190, 130) },
            atm = { 0.5, 2.6, 0.5, Color3.fromRGB(255, 170, 110), Color3.fromRGB(190, 95, 45) },
            rays = { 0.35, 0.12 },
            light = { brightness = 2.6, exposure = 0.22, clock = 17.4, shadowSoftness = 0.7,
                      colorShiftTop = Color3.fromRGB(255, 160, 90), colorShiftBottom = Color3.fromRGB(120, 60, 45) },
        },
        Clarity = {
            bloom = { 0.5, 14, 1.35 }, blur = 0,
            cc = { 0.08, 0.24, 0.2, Color3.fromRGB(240, 247, 255) },
            atm = { 0, 0, 0, Color3.fromRGB(255, 255, 255) },
            light = { brightness = 3.4, exposure = 0.35, fogEnd = 1e5, shadowSoftness = 0 },
        },
        Dreamy = {
            bloom = { 2.6, 45, 0.6 }, blur = 8,
            dof = { 30, 20, 0.35, 0.8 },
            cc = { 0.1, -0.02, 0.3, Color3.fromRGB(255, 220, 245) },
            atm = { 0.6, 3, 0.6, Color3.fromRGB(255, 210, 245), Color3.fromRGB(170, 125, 175) },
            rays = { 0.25, 0.15 },
            light = { brightness = 2.8, exposure = 0.25, shadowSoftness = 1,
                      ambient = Color3.fromRGB(200, 170, 200), colorShiftTop = Color3.fromRGB(255, 200, 235), colorShiftBottom = Color3.fromRGB(150, 110, 160) },
        },
        Horror = {
            bloom = { 0.3, 14, 1.5 }, blur = 3,
            dof = { 25, 18, 0.4, 0.85 },
            cc = { -0.08, 0.35, -0.5, Color3.fromRGB(180, 200, 190) },
            atm = { 0.7, 3, 0, Color3.fromRGB(50, 60, 60), Color3.fromRGB(22, 28, 28) },
            light = { brightness = 1.2, exposure = -0.15, clock = 1, fogEnd = 220, shadowSoftness = 1,
                      ambient = Color3.fromRGB(45, 55, 50) },
        },
        Neon = {
            bloom = { 3, 42, 0.5 }, blur = 0,
            dof = { 90, 70, 0, 0.3 },
            cc = { 0.04, 0.4, 0.6, Color3.fromRGB(205, 185, 255) },
            atm = { 0.5, 1.8, 0.9, Color3.fromRGB(130, 90, 255), Color3.fromRGB(55, 35, 120) },
            rays = { 0.3, 0.2 },
            light = { brightness = 2.4, exposure = 0.15, clock = 2, shadowSoftness = 0.3,
                      ambient = Color3.fromRGB(90, 70, 140), colorShiftTop = Color3.fromRGB(190, 120, 255), colorShiftBottom = Color3.fromRGB(40, 25, 90) },
        },
        Realistic = {
            bloom = { 0.6, 20, 1.15 }, blur = 0,
            dof = { 150, 120, 0.03, 0.25 },
            cc = { 0.02, 0.12, 0.05, Color3.fromRGB(255, 255, 255) },
            atm = { 0.22, 0.9, 0.12, Color3.fromRGB(199, 210, 225), Color3.fromRGB(105, 115, 130) },
            rays = { 0.08, 0.05 },
            light = { brightness = 2, exposure = 0.1, shadowSoftness = 0.45 },
        },
        Frost = {
            bloom = { 1.3, 25, 0.9 }, blur = 1,
            cc = { 0.06, 0.22, -0.05, Color3.fromRGB(190, 225, 255) },
            atm = { 0.55, 2.2, 0.35, Color3.fromRGB(185, 215, 255), Color3.fromRGB(105, 135, 185) },
            rays = { 0.15, 0.1 },
            light = { brightness = 2.8, exposure = 0.2, shadowSoftness = 0.8,
                      ambient = Color3.fromRGB(150, 175, 205), colorShiftTop = Color3.fromRGB(200, 235, 255), colorShiftBottom = Color3.fromRGB(90, 115, 150) },
        },
    }

    E.shaderNames = { "Cinematic", "Realistic", "Vibrant", "Clarity", "Neon",
                      "Midnight", "Sunset", "Dreamy", "Frost", "Noir", "Horror" }

    local NAME = "Inertia"
    local made = {}
    local savedLight = nil

    local function grab(class)
        local inst = made[class]
        if inst and inst.Parent then return inst end
        inst = Instance.new(class)
        inst.Name = NAME .. class
        inst.Parent = Lighting
        made[class] = inst
        return inst
    end

    local function rememberLighting()
        if savedLight then return end
        savedLight = {
            Brightness = Lighting.Brightness,
            ExposureCompensation = Lighting.ExposureCompensation,
            ClockTime = Lighting.ClockTime,
            FogEnd = Lighting.FogEnd,
            FogStart = Lighting.FogStart,
            ShadowSoftness = Lighting.ShadowSoftness,
            GlobalShadows = Lighting.GlobalShadows,
            EnvironmentDiffuseScale = Lighting.EnvironmentDiffuseScale,
            EnvironmentSpecularScale = Lighting.EnvironmentSpecularScale,
            Ambient = Lighting.Ambient,
            OutdoorAmbient = Lighting.OutdoorAmbient,
            ColorShift_Top = Lighting.ColorShift_Top,
            ColorShift_Bottom = Lighting.ColorShift_Bottom,
        }
    end

    E.clearShaders = function()
        for _, inst in pairs(made) do pcall(function() inst:Destroy() end) end
        table.clear(made)
        if savedLight then
            for key, value in pairs(savedLight) do
                pcall(function() Lighting[key] = value end)
            end
            savedLight = nil
        end
    end

    E.applyShader = function()
        if not F.Shaders then
            E.clearShaders()
            return
        end
        local preset = PRESETS[F.ShaderPreset or "Cinematic"] or PRESETS.Cinematic
        rememberLighting()

        -- ползунки идут поверх пресета: 100% = как в пресете
        local k = (F.ShaderStrength or 100) / 100

        local bloom = grab("BloomEffect")
        bloom.Intensity = (preset.bloom[1] or 1) * k * ((F.ShaderBloom or 100) / 100)
        bloom.Size = preset.bloom[2] or 20
        bloom.Threshold = preset.bloom[3] or 1
        bloom.Enabled = bloom.Intensity > 0.01

        local blurAmount = (preset.blur or 0) * k + (F.ShaderBlur or 0)
        local blur = grab("BlurEffect")
        blur.Size = blurAmount
        blur.Enabled = blurAmount > 0.05

        local cc = grab("ColorCorrectionEffect")
        cc.Brightness = (preset.cc[1] or 0) * k
        cc.Contrast = (preset.cc[2] or 0) * k * ((F.ShaderContrast or 100) / 100)
        cc.Saturation = (preset.cc[3] or 0) * k * ((F.ShaderSaturation or 100) / 100)
        cc.TintColor = preset.cc[4] or Color3.new(1, 1, 1)
        cc.Enabled = true

        local dof = grab("DepthOfFieldEffect")
        if preset.dof and F.ShaderDOF ~= false then
            dof.FocusDistance = preset.dof[1]
            dof.InFocusRadius = preset.dof[2]
            dof.NearIntensity = math.clamp(preset.dof[3] or 0, 0, 1)
            dof.FarIntensity = math.clamp(preset.dof[4] or 0.4, 0, 1)
            dof.Enabled = true
        else
            dof.Enabled = false
        end

        local rays = grab("SunRaysEffect")
        if preset.rays then
            rays.Intensity = preset.rays[1] * k
            rays.Spread = preset.rays[2]
            rays.Enabled = true
        else
            rays.Enabled = false
        end

        local atm = grab("Atmosphere")
        if preset.atm and F.ShaderFog ~= false then
            atm.Density = (preset.atm[1] or 0) * k
            atm.Haze = (preset.atm[2] or 0) * k
            atm.Glare = (preset.atm[3] or 0) * k
            atm.Color = preset.atm[4] or Color3.fromRGB(199, 199, 199)
            atm.Decay = preset.atm[5] or Color3.fromRGB(106, 112, 125)
            atm.Offset = 0.25
        else
            atm.Density = 0
            atm.Haze = 0
            atm.Glare = 0
        end

        local light = preset.light or {}
        Lighting.Brightness = light.brightness or savedLight.Brightness
        Lighting.ExposureCompensation = light.exposure or 0
        Lighting.ShadowSoftness = light.shadowSoftness or 0.2
        Lighting.GlobalShadows = true
        Lighting.EnvironmentDiffuseScale = 1
        Lighting.EnvironmentSpecularScale = 1
        if light.clock then Lighting.ClockTime = light.clock end
        if light.fogEnd then Lighting.FogEnd = light.fogEnd end
        if light.fogStart then Lighting.FogStart = light.fogStart end
        if light.ambient then Lighting.Ambient = light.ambient end
        if light.outdoorAmbient then Lighting.OutdoorAmbient = light.outdoorAmbient end
        if light.colorShiftTop then Lighting.ColorShift_Top = light.colorShiftTop end
        if light.colorShiftBottom then Lighting.ColorShift_Bottom = light.colorShiftBottom end
    end

    gui.Destroying:Connect(E.clearShaders)
end

-- esp (drawing) -----------------------------------------------------------
-- Всё рисуется через Drawing: на Potassium это родной рендер экзекутора, вне
-- дерева GUI, поэтому игра его не видит и он не грузит интерфейс. Объекты
-- создаются один раз на игрока и переиспользуются — пересоздавать их каждый
-- кадр значит утечь память за минуту.
do
    local COLORS = {
        White = Color3.fromRGB(245, 245, 245), Cyan = Color3.fromRGB(60, 220, 255),
        Pink = Color3.fromRGB(255, 120, 200), Purple = Color3.fromRGB(170, 100, 255),
        Blue = Color3.fromRGB(70, 140, 255), Green = Color3.fromRGB(90, 220, 120),
        Yellow = Color3.fromRGB(255, 230, 80), Orange = Color3.fromRGB(255, 150, 40),
        Red = Color3.fromRGB(255, 60, 60), Black = Color3.fromRGB(15, 15, 15),
    }
    E.espColors = { "Role", "Accent", "Cyan", "Pink", "Purple", "Blue",
                    "Green", "Yellow", "Orange", "Red", "White", "Black" }
    E.espBoxStyles = { "Corner", "Full", "Off" }
    E.espTracerFrom = { "Bottom", "Center", "Top", "Mouse" }

    local pool = {}

    local function makeSet()
        local set = { lines = {}, texts = {} }

        set.box = Drawing.new("Square")
        set.box.Filled, set.box.Thickness, set.box.Visible = false, 1, false
        set.boxOutline = Drawing.new("Square")
        set.boxOutline.Filled, set.boxOutline.Thickness, set.boxOutline.Visible = false, 3, false
        set.boxOutline.Color = Color3.new(0, 0, 0)
        set.boxOutline.Transparency = 0.5

        -- восемь отрезков под угловой бокс
        for i = 1, 8 do
            local ln = Drawing.new("Line")
            ln.Thickness, ln.Visible = 1, false
            set.lines[i] = ln
        end

        set.tracer = Drawing.new("Line")
        set.tracer.Thickness, set.tracer.Visible = 1, false

        set.healthBg = Drawing.new("Square")
        set.healthBg.Filled, set.healthBg.Visible = true, false
        set.healthBg.Color = Color3.new(0, 0, 0)
        set.healthBg.Transparency = 0.6
        set.health = Drawing.new("Square")
        set.health.Filled, set.health.Visible = true, false

        for i = 1, 3 do
            local txt = Drawing.new("Text")
            txt.Size, txt.Center, txt.Outline, txt.Visible = 13, true, true, false
            txt.Font = 2
            set.texts[i] = txt
        end
        return set
    end

    local function hide(set)
        set.box.Visible, set.boxOutline.Visible = false, false
        set.tracer.Visible = false
        set.healthBg.Visible, set.health.Visible = false, false
        for _, ln in ipairs(set.lines) do ln.Visible = false end
        for _, txt in ipairs(set.texts) do txt.Visible = false end
    end

    local function destroySet(p)
        local set = pool[p]
        if not set then return end
        local function kill(o) pcall(function() o:Remove() end) end
        kill(set.box); kill(set.boxOutline); kill(set.tracer)
        kill(set.healthBg); kill(set.health)
        for _, ln in ipairs(set.lines) do kill(ln) end
        for _, txt in ipairs(set.texts) do kill(txt) end
        pool[p] = nil
    end
    E.clearESP = function()
        for p in pairs(pool) do destroySet(p) end
    end

    local function espColor(role)
        local pick = F.ESPColor or "Role"
        if pick == "Role" then return E.roleColor[role] or E.roleColor.Innocent end
        if pick == "Accent" then return T.accent end
        return COLORS[pick] or T.accent
    end

    local wasOn = false
    tc(RunService.RenderStepped:Connect(function()
        local on = F.ESPBox or F.ESPName or F.ESPDistance or F.ESPRole
            or F.ESPHealth or F.ESPTracer
        if not on then
            if wasOn then
                for _, set in pairs(pool) do hide(set) end
                wasOn = false
            end
            return
        end
        wasOn = true

        local cam = workspace.CurrentCamera
        local myHrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        if not cam then return end
        local vp = cam.ViewportSize

        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LP then
                local set = pool[p]
                if not set then set = makeSet(); pool[p] = set end

                local char = p.Character
                local hrp = char and char:FindFirstChild("HumanoidRootPart")
                local head = char and (char:FindFirstChild("Head") or hrp)
                local hum = char and char:FindFirstChildOfClass("Humanoid")
                local dist = (myHrp and hrp) and (myHrp.Position - hrp.Position).Magnitude or 0

                if not (hrp and head and hum and hum.Health > 0 and dist <= (F.ESPMaxDist or 1000)) then
                    hide(set)
                else
                    local top, topOn = cam:WorldToViewportPoint(head.Position + Vector3.new(0, 0.6, 0))
                    local bottom = cam:WorldToViewportPoint(hrp.Position - Vector3.new(0, 3, 0))

                    if not topOn then
                        hide(set)
                    else
                        local role = E.getRole(p)
                        local color = espColor(role)
                        local h = math.abs(bottom.Y - top.Y)
                        local w = h * 0.55
                        local x, y = top.X - w / 2, top.Y

                        -- бокс
                        local style = F.ESPBoxStyle or "Corner"
                        set.box.Visible = false
                        set.boxOutline.Visible = false
                        for _, ln in ipairs(set.lines) do ln.Visible = false end

                        if F.ESPBox and style == "Full" then
                            set.boxOutline.Position = Vector2.new(x, y)
                            set.boxOutline.Size = Vector2.new(w, h)
                            set.boxOutline.Visible = true
                            set.box.Position = Vector2.new(x, y)
                            set.box.Size = Vector2.new(w, h)
                            set.box.Color = color
                            set.box.Visible = true
                        elseif F.ESPBox and style == "Corner" then
                            local seg = math.min(w, h) * 0.28
                            local pts = {
                                { x, y, x + seg, y }, { x, y, x, y + seg },
                                { x + w, y, x + w - seg, y }, { x + w, y, x + w, y + seg },
                                { x, y + h, x + seg, y + h }, { x, y + h, x, y + h - seg },
                                { x + w, y + h, x + w - seg, y + h }, { x + w, y + h, x + w, y + h - seg },
                            }
                            for i, ln in ipairs(set.lines) do
                                local pt = pts[i]
                                ln.From = Vector2.new(pt[1], pt[2])
                                ln.To = Vector2.new(pt[3], pt[4])
                                ln.Color = color
                                ln.Thickness = 2
                                ln.Visible = true
                            end
                        end

                        -- полоса здоровья слева от бокса
                        if F.ESPHealth then
                            local ratio = math.clamp(hum.Health / math.max(hum.MaxHealth, 1), 0, 1)
                            set.healthBg.Position = Vector2.new(x - 6, y)
                            set.healthBg.Size = Vector2.new(3, h)
                            set.healthBg.Visible = true
                            set.health.Position = Vector2.new(x - 6, y + h * (1 - ratio))
                            set.health.Size = Vector2.new(3, h * ratio)
                            set.health.Color = Color3.fromRGB(255 - 195 * ratio, 60 + 160 * ratio, 60)
                            set.health.Visible = true
                        else
                            set.healthBg.Visible, set.health.Visible = false, false
                        end

                        -- трейсер
                        if F.ESPTracer then
                            local from = F.ESPTracerFrom or "Bottom"
                            local origin
                            if from == "Top" then origin = Vector2.new(vp.X / 2, 0)
                            elseif from == "Center" then origin = Vector2.new(vp.X / 2, vp.Y / 2)
                            elseif from == "Mouse" then
                                local m = UIS:GetMouseLocation()
                                origin = Vector2.new(m.X, m.Y)
                            else origin = Vector2.new(vp.X / 2, vp.Y) end
                            set.tracer.From = origin
                            set.tracer.To = Vector2.new(bottom.X, bottom.Y)
                            set.tracer.Color = color
                            set.tracer.Visible = true
                        else
                            set.tracer.Visible = false
                        end

                        -- подписи: имя сверху, роль и дистанция снизу
                        local lines = {}
                        if F.ESPName then lines[#lines + 1] = { p.Name, y - 16 } end
                        local below = {}
                        if F.ESPRole then below[#below + 1] = role end
                        if F.ESPDistance then below[#below + 1] = math.floor(dist) .. "m" end
                        if #below > 0 then
                            lines[#lines + 1] = { table.concat(below, "  "), y + h + 2 }
                        end

                        for i, txt in ipairs(set.texts) do
                            local entry = lines[i]
                            if entry then
                                txt.Text = entry[1]
                                txt.Position = Vector2.new(top.X, entry[2])
                                txt.Color = color
                                txt.Visible = true
                            else
                                txt.Visible = false
                            end
                        end
                    end
                end
            end
        end
    end))

    tc(Players.PlayerRemoving:Connect(destroySet))
    gui.Destroying:Connect(E.clearESP)
end

-- self chams --------------------------------------------------------------
-- Шесть стилей, каждый со своим смыслом. Мигающие радуги убраны: они мешают
-- смотреть на игру. Красится всё тело вместе с волосами и аксессуарами.
do
    local HL = "InertiaSelfCham"
    local COLORS = {
        White = Color3.fromRGB(245, 245, 245), Red = Color3.fromRGB(255, 60, 60),
        Pink = Color3.fromRGB(255, 120, 200), Orange = Color3.fromRGB(255, 150, 40),
        Yellow = Color3.fromRGB(255, 230, 80), Green = Color3.fromRGB(90, 220, 120),
        Cyan = Color3.fromRGB(60, 220, 255), Blue = Color3.fromRGB(70, 140, 255),
        Purple = Color3.fromRGB(170, 100, 255), Black = Color3.fromRGB(15, 15, 15),
    }
    E.selfColors = { "Accent", "Cyan", "Pink", "Purple", "Blue", "Green",
                     "Red", "Orange", "Yellow", "White", "Black" }
    E.selfStyles = { "Crystal", "Ice", "Glow", "Ghost", "Outline", "Solid" }

    -- material: чем красим сами детали; fill/outline: как настроен Highlight
    local STYLE = {
        Crystal = { material = Enum.Material.Glass,      alpha = 0.35, fill = 0.55, outline = 0 },
        Ice     = { material = Enum.Material.Glass,      alpha = 0.55, fill = 0.75, outline = 0.1 },
        Glow    = { material = Enum.Material.Neon,       alpha = 0.15, fill = 0.85, outline = 0 },
        Ghost   = { material = Enum.Material.ForceField, alpha = 0.5,  fill = 1,    outline = 0.3 },
        Outline = { fill = 1, outline = 0 },
        Solid   = { fill = 0, outline = 0 },
    }

    local saved = setmetatable({}, { __mode = "k" })
    local appliedKey = nil
    -- один Highlight на видимую часть, а не один на весь персонаж: Highlight
    -- с Adornee = char подсвечивает и прозрачные детали, и у Korblox из-под
    -- протеза снова вылезала нижняя часть ноги
    local hls = setmetatable({}, { __mode = "k" })

    local function clearHls()
        for part, hl in pairs(hls) do
            pcall(function() hl:Destroy() end)
            hls[part] = nil
        end
    end

    local function restore()
        for part, was in pairs(saved) do
            if part.Parent then
                part.Material, part.Color, part.Transparency = was[1], was[2], was[3]
            end
        end
        table.clear(saved)
    end

    E.clearSelfChams = function()
        clearHls()
        local char = LP.Character
        local found = char and char:FindFirstChild(HL)
        if found then pcall(function() found:Destroy() end) end
        appliedKey = nil
        restore()
    end

    local function baseColor()
        return COLORS[F.SelfChamsColor or "Accent"] or T.accent
    end

    -- Всё видимое тело, включая хендлы аксессуаров. Детали, спрятанные другими
    -- фичами (Korblox прячет родную ногу, Headless — голову), пропускаем:
    -- иначе чамс делал их снова видимыми и из-под протеза торчала половина ноги.
    local function bodyParts(char)
        local out = {}
        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
                -- Korblox прячет ногу и прозрачностью, и клиентским модификатором
                -- (Transparency остаётся 0, а деталь не видна): учитываем оба.
                -- Смотрим текущее значение, а не сохранённое — иначе спрятанная
                -- уже ПОСЛЕ включения чамса деталь всё равно получала подсветку.
                if part.Transparency + part.LocalTransparencyModifier < 1 then out[#out + 1] = part end
            end
        end
        return out
    end

    tc(RunService.Heartbeat:Connect(function()
        if not F.SelfChams then
            if appliedKey then E.clearSelfChams() end
            return
        end
        local char = LP.Character
        if not char then return end

        local name = F.SelfChamsStyle or "Crystal"
        local style = STYLE[name] or STYLE.Crystal
        local color = baseColor()
        -- Opacity 100% = стиль как задуман, ниже — прозрачнее
        local k = 1 - math.clamp((F.SelfChamsOpacity or 70) / 100, 0, 1)
        -- Blur доступен только у Crystal: глушит сам материал, чтобы внутри
        -- стеклянного тела не мельтешили собственные части
        local blur = (name == "Crystal") and math.clamp((F.SelfChamsBlur or 0) / 100, 0, 1) or 0
        local alpha = math.clamp(((style.alpha or 0) + k * 0.7) * (1 - blur), 0, 0.95)
        local key = name .. tostring(color) .. tostring(math.floor(alpha * 100))

        local parts = bodyParts(char)

        if appliedKey ~= key then
            if appliedKey and appliedKey:match("^[^|]+") ~= name then restore() end
            appliedKey = key

            if style.material then
                for _, part in ipairs(parts) do
                    if not saved[part] then
                        saved[part] = { part.Material, part.Color, part.Transparency }
                    end
                    part.Material, part.Color, part.Transparency = style.material, color, alpha
                end
            else
                restore()
            end
        elseif style.material then
            -- новые аксессуары появляются на ходу: докрашиваем их
            for _, part in ipairs(parts) do
                if not saved[part] then
                    saved[part] = { part.Material, part.Color, part.Transparency }
                    part.Material, part.Color, part.Transparency = style.material, color, alpha
                end
            end
        end

        -- подсветка живёт по частям, а не на весь персонаж: так прозрачная
        -- нога под Korblox не получает ни заливки, ни обводки
        local fill = (style.fill ~= nil) and style.fill or 1
        local outline = style.outline or 0
        local seen = {}
        for _, part in ipairs(parts) do
            seen[part] = true
            local hl = hls[part]
            if not (hl and hl.Parent) then
                hl = Instance.new("Highlight")
                hl.Name, hl.Adornee, hl.Parent = HL, part, part
                hls[part] = hl
            end
            hl.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
            hl.FillColor, hl.OutlineColor = color, color
            hl.FillTransparency = fill
            hl.OutlineTransparency = outline
        end
        for part, hl in pairs(hls) do
            if not seen[part] then
                pcall(function() hl:Destroy() end)
                hls[part] = nil
            end
        end
    end))

    tc(LP.CharacterAdded:Connect(function()
        appliedKey = nil
        clearHls()
        table.clear(saved)
    end))
    gui.Destroying:Connect(E.clearSelfChams)
end



-- backtrack ---------------------------------------------------------------
-- Призрак самого персонажа там, где его видит сервер. Клон строится один раз,
-- дальше каждый кадр копируются CFrame реальных частей со сдвигом назад по
-- скорости на глубину пинга — поза и анимация сохраняются. Инстансы локальные,
-- другим игрокам ничего не видно.
do
    local COLORS = {
        White = Color3.fromRGB(245, 245, 245), Cyan = Color3.fromRGB(60, 220, 255),
        Pink = Color3.fromRGB(255, 120, 200), Purple = Color3.fromRGB(170, 100, 255),
        Blue = Color3.fromRGB(70, 140, 255), Green = Color3.fromRGB(90, 220, 120),
        Yellow = Color3.fromRGB(255, 230, 80), Orange = Color3.fromRGB(255, 150, 40),
        Red = Color3.fromRGB(255, 60, 60), Black = Color3.fromRGB(15, 15, 15),
    }
    E.backtrackColors = { "Accent", "Cyan", "Pink", "Purple", "Blue", "Green",
                          "Yellow", "Orange", "Red", "White", "Black" }
    E.backtrackStyles = { "Ghost", "Crystal", "Neon", "Outline", "Solid" }
    E.backtrackTargets = { "Others", "Me", "All" }

    local STYLE = {
        Ghost   = { material = Enum.Material.ForceField, alpha = 0.35, outline = false },
        Crystal = { material = Enum.Material.Glass,      alpha = 0.4,  outline = true },
        Neon    = { material = Enum.Material.Neon,       alpha = 0.45, outline = false },
        Solid   = { material = Enum.Material.SmoothPlastic, alpha = 0.2, outline = true },
        Outline = { material = Enum.Material.SmoothPlastic, alpha = 1,  outline = true },
    }

    local ghosts = setmetatable({}, { __mode = "k" })

    local function clearGhost(p)
        local g = ghosts[p]
        if g then pcall(function() g.model:Destroy() end) end
        ghosts[p] = nil
    end

    local function ghostColor()
        return COLORS[F.BacktrackColor or "Accent"] or T.accent
    end

    local function buildGhost(p, char)
        local model = Instance.new("Model")
        model.Name = "InertiaGhost_" .. p.Name

        local map = {}
        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") and part.Transparency < 1 and part.Name ~= "HumanoidRootPart" then
                local copy = Instance.new("Part")
                copy.Name = part.Name
                copy.Size = part.Size
                copy.CFrame = part.CFrame
                copy.Anchored, copy.CanCollide, copy.CanQuery, copy.CanTouch = true, false, false, false
                copy.CastShadow = false

                if part:IsA("MeshPart") and part.MeshId ~= "" then
                    local mesh = Instance.new("SpecialMesh")
                    mesh.MeshType = Enum.MeshType.FileMesh
                    mesh.MeshId = part.MeshId
                    mesh.Scale = part.Size / (part.MeshSize or part.Size)
                    mesh.Parent = copy
                end
                copy.Parent = model
                map[#map + 1] = { real = part, copy = copy }
            end
        end

        -- обводка силуэта поверх, если стиль её просит
        local hl = Instance.new("Highlight")
        hl.Name = "GhostOutline"
        hl.Adornee = model
        hl.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
        hl.FillTransparency = 1
        hl.Parent = model

        -- BasePart внутри ScreenGui не рендерится: место призрака в workspace
        model.Parent = workspace
        return { model = model, map = map, char = char, hl = hl }
    end

    local function wanted(p)
        local mode = F.BacktrackTarget or "Others"
        if mode == "All" then return true end
        if mode == "Me" then return p == LP end
        return p ~= LP
    end

    tc(RunService.RenderStepped:Connect(function(dt)
        if not F.Backtrack then
            for p in pairs(ghosts) do clearGhost(p) end
            return
        end

        local depth = (F.BacktrackDepth or 0) / 1000
        if depth <= 0 then depth = E.pingSeconds and E.pingSeconds() or 0.08 end
        local smooth = math.clamp(dt * 18, 0, 1)
        local style = STYLE[F.BacktrackStyle or "Ghost"] or STYLE.Ghost
        local color = ghostColor()
        local alpha = math.clamp(style.alpha + (1 - (F.BacktrackOpacity or 65) / 100) * 0.6, 0, 1)

        for _, p in ipairs(Players:GetPlayers()) do
            local char = wanted(p) and p.Character
            local hrp = char and char:FindFirstChild("HumanoidRootPart")
            local hum = hrp and char:FindFirstChildOfClass("Humanoid")

            if not (hrp and hum and hum.Health > 0) then
                if ghosts[p] then clearGhost(p) end
            else
                local g = ghosts[p]
                if not g or g.char ~= char or not g.model.Parent then
                    clearGhost(p)
                    g = buildGhost(p, char)
                    ghosts[p] = g
                end

                local shift = -hrp.AssemblyLinearVelocity * depth
                for _, pair in ipairs(g.map) do
                    if pair.real.Parent then
                        pair.copy.CFrame = pair.copy.CFrame:Lerp(pair.real.CFrame + shift, smooth)
                        pair.copy.Material = style.material
                        pair.copy.Color = color
                        pair.copy.Transparency = alpha
                    else
                        pair.copy.Transparency = 1
                    end
                end
                g.hl.Enabled = style.outline
                g.hl.OutlineColor = color
                g.hl.OutlineTransparency = 0
            end
        end
    end))

    tc(Players.PlayerRemoving:Connect(clearGhost))
    gui.Destroying:Connect(function()
        for p in pairs(ghosts) do clearGhost(p) end
    end)
end

-- chams ----------------------------------------------------------------
-- Стили должны РАЗЛИЧАТЬСЯ, а не быть четырьмя значениями прозрачности одного
-- Highlight: Neon/ForceField меняют материал самих частей, WireFrame рисует
-- настоящую сетку меша.
do
    local AS = game:GetService("AssetService")
    local HL, WIRE = "InertiaCham", "InertiaWire"

    -- Те же стили, что и у Self Chams: у каждого свой материал, плотность тела
    -- и настройка Highlight, а не одна прозрачность на всех.
    local STYLE = {
        Crystal    = { material = Enum.Material.Glass,      alpha = 0.35, fill = 0.5,  outline = 0 },
        Ice        = { material = Enum.Material.Glass,      alpha = 0.55, fill = 0.4,  outline = 0.1 },
        Glow       = { material = Enum.Material.Neon,       alpha = 0.15, fill = 0.15, outline = 0 },
        Neon       = { material = Enum.Material.Neon,       alpha = 0,    fill = 0.05, outline = 0 },
        ForceField = { material = Enum.Material.ForceField, alpha = 0.4,  fill = 0.35, outline = 0.2 },
        Ghost      = { material = Enum.Material.ForceField, alpha = 0.5,  fill = 0.6,  outline = 0.3 },
        Highlight  = { fill = nil, outline = 0 },
        Outline    = { fill = 1,   outline = 0 },
        Solid      = { fill = 0,   outline = 0 },
    }
    local MATERIAL = {}
    for name, def in pairs(STYLE) do
        if def.material then MATERIAL[name] = def.material end
    end

    ----------------------------------------------------------------- highlight
    local function applyHighlight(char, color, outlineOnly)
        local hl = char:FindFirstChild(HL)
        if not (hl and hl:IsA("Highlight")) then
            hl = Instance.new("Highlight")
            hl.Name, hl.Adornee, hl.Parent = HL, char, char
        end
        hl.DepthMode = (F.ChamsThroughWalls == false)
            and Enum.HighlightDepthMode.Occluded or Enum.HighlightDepthMode.AlwaysOnTop
        hl.FillColor, hl.OutlineColor = color, color

        local base = 1 - (F.ChamsOpacity or 50) / 100
        local style = F.ChamsStyle or "Crystal"
        local def = STYLE[style] or STYLE.Highlight
        local fill = outlineOnly and 1 or (def.fill ~= nil and def.fill or base)
        hl.FillTransparency, hl.OutlineTransparency = fill, def.outline or 0
    end

    local function clearHighlight(char)
        local hl = char and char:FindFirstChild(HL)
        if hl then pcall(function() hl:Destroy() end) end
    end

    ------------------------------------------------------------------ материал
    local saved = setmetatable({}, { __mode = "k" })   -- [part] = {Material, Color}

    -- alpha = nil означает «прозрачность не трогаем»
    local function dressParts(char, color, material, alpha)
        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") then
                local was = saved[part]
                -- спрятанное другими фичами (Korblox-нога и т.п.) не воскрешаем:
                -- смотрим текущую видимость, включая клиентский модификатор
                local hidden = part.Transparency + part.LocalTransparencyModifier >= 1
                if not hidden then
                    if not was then saved[part] = { part.Material, part.Color, part.Transparency } end
                    part.Material, part.Color = material, color
                    if alpha then part.Transparency = alpha end
                end
            end
        end
    end

    local function undressParts(char)
        if not char then return end
        for _, part in ipairs(char:GetDescendants()) do
            local was = saved[part]
            if was then
                part.Material, part.Color = was[1], was[2]
                if was[3] then part.Transparency = was[3] end
                saved[part] = nil
            end
        end
    end

    ----------------------------------------------------------------- wireframe
    -- рёбра меша читаются один раз на MeshId и кэшируются: тело R15 это ~4200
    -- граней, пересобирать их каждый кадр нельзя
    local edgeCache, pending = {}, {}

    local function requestMesh(meshId)
        if edgeCache[meshId] ~= nil or pending[meshId] then return end
        pending[meshId] = true
        task.spawn(function()
            local ok, em = pcall(function() return AS:CreateEditableMeshAsync(Content.fromUri(meshId)) end)
            if not ok or not em then
                edgeCache[meshId], pending[meshId] = false, nil
                return
            end
            local seen, list = {}, {}
            for i, fid in ipairs(em:GetFaces()) do
                local okF, vs = pcall(function() return em:GetFaceVertices(fid) end)
                if okF and vs then
                    for k = 1, 3 do
                        local a, b = vs[k], vs[k % 3 + 1]
                        -- общее ребро двух треугольников не рисуем дважды
                        local key = (a < b) and (a * 1e7 + b) or (b * 1e7 + a)
                        if not seen[key] then
                            seen[key] = true
                            local pa, pb = em:GetPosition(a), em:GetPosition(b)
                            list[#list + 1] = { pa, pb, (pa - pb).Magnitude }
                        end
                    end
                end
                if i % 400 == 0 then task.wait() end   -- не морозим кадр
            end
            -- длинные рёбра первыми: рисуя только их начало, получаем каркас, а
            -- не мелкую сетку, которая с дистанции читается сплошной заливкой
            table.sort(list, function(x, y) return x[3] > y[3] end)
            edgeCache[meshId], pending[meshId] = list, nil
        end)
    end

    -- ponytail: не больше двух частей за кадр. Тело целиком это ~6000 отрезков,
    -- разом они дают заметный фриз. Надо быстрее — держать пул адорнментов по
    -- MeshId и клонировать их.
    local budget = 0

    -- В CS2 при wireframe тело не видно вовсе — светится только сетка.
    -- Поэтому детали гасим, а рёбра рисуем поверх стен.
    local hiddenBody = setmetatable({}, { __mode = "k" })

    local function hideBody(char, hide)
        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
                if hide then
                    if hiddenBody[part] == nil and part.Transparency < 1 then
                        hiddenBody[part] = part.Transparency
                        part.LocalTransparencyModifier = 1
                        part.Transparency = 1
                    end
                else
                    local was = hiddenBody[part]
                    if was then
                        part.Transparency = was
                        part.LocalTransparencyModifier = 0
                        hiddenBody[part] = nil
                    end
                end
            end
        end
    end
    E.showBodyAgain = function(char) hideBody(char, false) end

    local wired = setmetatable({}, { __mode = "k" })   -- [character] = { [part] = adornment }

    local function dropWire(char)
        if char then hideBody(char, false) end
        local set = char and wired[char]
        if not set then return end
        for _, w in pairs(set) do pcall(function() w:Destroy() end) end
        wired[char] = nil
    end

    local function wireChar(char, color)
        local set = wired[char]
        if not set then set = {}; wired[char] = set end
        local through = F.ChamsThroughWalls ~= false
        if F.WireHideBody ~= false then hideBody(char, true) end

        for _, part in ipairs(char:GetDescendants()) do
            if part:IsA("MeshPart") and part.MeshId ~= "" and part.Transparency < 1 then
                local w = set[part]
                if w and w.Parent then
                    w.Color3, w.AlwaysOnTop, w.Visible = color, through, true
                elseif budget > 0 then
                    local edges = edgeCache[part.MeshId]
                    if edges == nil then
                        requestMesh(part.MeshId)
                    elseif edges then
                        budget = budget - 1
                        local a = Instance.new("WireframeHandleAdornment")
                        a.Name, a.Adornee = WIRE, part
                        a.Color3, a.AlwaysOnTop = color, through
                        local scale = part.Size / part.MeshSize
                        -- лимит на КАЖДУЮ часть, а не доля от общего числа: у
                        -- головы и стоп меш мелкий и плотный, и любой процент
                        -- от него всё равно давал сплошную кашу
                        local keep = math.min(#edges, math.clamp(F.WireDensity or 3, 1, 10) * 15)
                        for i = 1, keep do
                            local e = edges[i]
                            a:AddLine(e[1] * scale, e[2] * scale)
                        end
                        a.Parent = part
                        set[part] = a
                    end
                end
            end
        end
    end

    --------------------------------------------------------------------- цикл
    local function wantedColor(p)
        local role = E.getRole(p)
        if not F["Chams" .. role] then return nil end
        return E.roleColor[role] or E.roleColor.Innocent
    end

    local function cleanup(char)
        clearHighlight(char)
        undressParts(char)
        dropWire(char)
    end

    -- что уже применено на персонажа: без этого dressParts/wireChar дёргали
    -- GetDescendants каждый кадр на каждого игрока — отсюда и были лаги
    local applied = setmetatable({}, { __mode = "k" })

    local wasOn, nextRun = false, 0
    tc(RunService.Heartbeat:Connect(function()
        if not F.Chams then
            if wasOn then
                for _, p in ipairs(Players:GetPlayers()) do cleanup(p.Character) end
                table.clear(applied)
                wasOn = false
            end
            return
        end
        -- Highlight и адорнменты сами следуют за частями, пересчитывать их
        -- каждый кадр незачем
        if tick() < nextRun then return end
        nextRun = tick() + 0.2
        wasOn = true
        budget = 4

        local style = F.ChamsStyle or "Highlight"
        local material = MATERIAL[style]
        local opacity = F.ChamsOpacity or 50
        local through = F.ChamsThroughWalls ~= false

        for _, p in ipairs(Players:GetPlayers()) do
            local char = (p ~= LP) and p.Character
            local hum = char and char:FindFirstChildOfClass("Humanoid")
            local color = (hum and hum.Health > 0) and wantedColor(p) or nil

            if not color then
                if char and applied[char] then cleanup(char); applied[char] = nil end
            else
                -- плотность обязана быть в ключе, иначе смена слайдера не
                -- вызывала пересборку и выглядела как «ползунок не работает»
                local key = style .. tostring(color) .. tostring(through) .. opacity
                    .. "|" .. tostring(F.WireDensity or 3)
                    .. "|" .. tostring(F.WireHideBody)
                local prev = applied[char]

                if style == "WireFrame" then
                    if prev ~= key then
                        clearHighlight(char)
                        undressParts(char)
                        if prev then dropWire(char) end   -- сменились цвет или стиль
                    end
                    wireChar(char, color)                 -- дособерёт недостающие части
                    applied[char] = key
                elseif prev ~= key then
                    if material then
                        dropWire(char)
                        local def = STYLE[style] or {}
                        local alpha = def.alpha
                        if alpha then
                            alpha = math.clamp(alpha + (1 - (F.ChamsOpacity or 50) / 100) * 0.5, 0, 0.95)
                        end
                        dressParts(char, color, material, alpha)
                        applyHighlight(char, color)
                    else
                        dropWire(char)
                        undressParts(char)
                        applyHighlight(char, color)
                    end
                    applied[char] = key
                end
            end
        end
    end))

    -- смена плотности требует пересборки адорнментов: линии в них статичны
    E.rebuildWire = function()
        for _, p in ipairs(Players:GetPlayers()) do dropWire(p.Character) end
    end

    tc(Players.PlayerRemoving:Connect(function(p) cleanup(p.Character) end))
    gui.Destroying:Connect(function()
        for _, p in ipairs(Players:GetPlayers()) do cleanup(p.Character) end
    end)
end


-- hud ------------------------------------------------------------------
-- всё в стиле меню: плоско, рамка 1px, акцентная черта. Каждая панель
-- таскается отдельно, цвета живут в теме через tint/dyn.
do
    local hudGui = new("ScreenGui", {
        Name = "mm2_hud", ResetOnSpawn = false, IgnoreGuiInset = true, DisplayOrder = 900,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
    }, host)
    gui.Destroying:Connect(function() pcall(function() hudGui:Destroy() end) end)

    local function hex6(c)
        return ("#%02X%02X%02X"):format(
            math.floor(c.R * 255 + 0.5), math.floor(c.G * 255 + 0.5), math.floor(c.B * 255 + 0.5))
    end
    local function tag(text, color)
        return ('<font color="%s">%s</font>'):format(hex6(color), text)
    end

    -- панель с шапкой: для многострочного содержимого
    local function panel(name, pos, size)
        local f = new("Frame", { Size = size, Position = pos, BorderSizePixel = 1, Visible = false }, hudGui)
        tint(f, "BackgroundColor3", "group")
        tint(f, "BorderColor3", "border")

        local head = new("Frame", { Size = UDim2.new(1, 0, 0, 18), BorderSizePixel = 0 }, f)
        tint(head, "BackgroundColor3", "frame")
        label(head, name, { center = true })
        local line = new("Frame", { Size = UDim2.new(1, 0, 0, 1), Position = UDim2.new(0, 0, 1, -1), BorderSizePixel = 0 }, head)
        dyn(function() line.BackgroundColor3 = T.accent end)

        local body = new("TextLabel", {
            BackgroundTransparency = 1, Font = FONT, TextSize = SIZE, Text = "", RichText = true,
            Position = UDim2.fromOffset(7, 22), Size = UDim2.new(1, -14, 1, -28),
            TextXAlignment = Enum.TextXAlignment.Left, TextYAlignment = Enum.TextYAlignment.Top,
        }, f)
        tint(body, "TextColor3", "text")

        attachDrag(f, head, "hud_" .. name)
        return f, body
    end

    -- чип: одна строка «ТЕГ значение», как стат-худы старого хаба
    local function chip(name, slot)
        local f = new("Frame", {
            Size = UDim2.fromOffset(150, 22), Position = UDim2.new(1, -160, 0, 10 + slot * 26),
            BorderSizePixel = 1, Visible = false,
        }, hudGui)
        tint(f, "BackgroundColor3", "group")
        tint(f, "BorderColor3", "border")
        local bar = new("Frame", { Size = UDim2.new(0, 2, 1, -2), Position = UDim2.fromOffset(1, 1), BorderSizePixel = 0 }, f)
        dyn(function() bar.BackgroundColor3 = T.accent end)
        label(f, name, { size = UDim2.new(0, 60, 1, 0), pos = UDim2.fromOffset(9, 0), dim = true })
        local val = label(f, "", { size = UDim2.new(1, -75, 1, 0), pos = UDim2.fromOffset(69, 0) })
        attachDrag(f, f, "chip_" .. name)
        return f, val
    end

    ------------------------------------------------------------- watermark
    local mark = new("Frame", {
        Size = UDim2.fromOffset(0, 24), Position = UDim2.fromOffset(10, 10),
        AutomaticSize = Enum.AutomaticSize.X, BorderSizePixel = 1, Visible = false,
    }, hudGui)
    tint(mark, "BackgroundColor3", "group")
    tint(mark, "BorderColor3", "border")
    local markBar = new("Frame", { Size = UDim2.new(0, 3, 1, -2), Position = UDim2.fromOffset(1, 1), BorderSizePixel = 0 }, mark)
    dyn(function() markBar.BackgroundColor3 = T.accent end)
    local markTxt = new("TextLabel", {
        BackgroundTransparency = 1, Font = FONT, TextSize = SIZE, Text = "", RichText = true,
        AutomaticSize = Enum.AutomaticSize.X, Size = UDim2.new(0, 0, 1, 0),
        Position = UDim2.fromOffset(11, 0), TextXAlignment = Enum.TextXAlignment.Left,
    }, mark)
    tint(markTxt, "TextColor3", "text")
    new("UIPadding", { PaddingRight = UDim.new(0, 11) }, markTxt)
    attachDrag(mark, mark, "hud_watermark")

    local roundPanel, roundTxt = panel("Round", UDim2.fromOffset(10, 42), UDim2.fromOffset(240, 104))
    local gunPanel, gunTxt = panel("Gun", UDim2.fromOffset(10, 154), UDim2.fromOffset(240, 76))
    local feedPanel, feedTxt = panel("Kill Feed", UDim2.fromOffset(10, 238), UDim2.fromOffset(240, 120))

    local chips = {}
    for i, name in ipairs({ "FPS", "PING", "COORDS", "SPEED", "SESSION" }) do
        local f, v = chip(name, i - 1)
        chips[name] = { frame = f, value = v }
    end

    ------------------------------------------------------------- kill feed
    -- Humanoid.Died прилетал пачкой на смене раунда, когда персонажей просто
    -- уносят с карты — отсюда «все умерли, хотя все живы». Смотрим переход
    -- живой -> мёртвый опросом и только когда тело ещё на месте.
    local feed, aliveState = {}, {}
    task.spawn(function()
        local warmUntil = tick() + 3          -- стартовое состояние не событие
        while not dead do
            local roundOn = E.isRoundActive()
            for _, p in ipairs(Players:GetPlayers()) do
                local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
                local alive = (hum ~= nil) and hum.Health > 0
                if aliveState[p] == true and not alive
                    and hum and hum.Parent and roundOn and tick() > warmUntil then
                    local role = E.getRole(p)
                    table.insert(feed, 1, {
                        name = p.Name,
                        color = E.roleColor[role] or E.roleColor.Innocent,
                    })
                    for i = #feed, 7, -1 do feed[i] = nil end
                    if F.NotifyKills then Notify("Kill", p.Name .. " killed") end
                end
                aliveState[p] = alive
            end
            task.wait(0.4)
        end
    end)
    tc(Players.PlayerRemoving:Connect(function(p) aliveState[p] = nil end))

    -- keybind hud
    local bindPanel, bindTxt = panel("Keybinds", UDim2.fromOffset(10, 366), UDim2.fromOffset(240, 120))

    -- события раунда
    local lastMurderer, hadDrop = nil, false

    ----------------------------------------------------------------- цикл
    local frames, fps, acc = 0, 0, 0
    tc(RunService.RenderStepped:Connect(function(dt)
        frames, acc = frames + 1, acc + dt
        if acc >= 0.5 then fps, frames, acc = math.floor(frames / acc + 0.5), 0, 0 end
    end))

    local startedAt, nextTick = tick(), 0
    tc(RunService.Heartbeat:Connect(function()
        mark.Visible = F.HUD_Watermark == true
        roundPanel.Visible = F.HUD_Round == true
        gunPanel.Visible = F.HUD_Gun == true
        feedPanel.Visible = F.HUD_Feed == true
        for name, c in pairs(chips) do c.frame.Visible = F["HUD_" .. name] == true end

        if tick() < nextTick then return end
        nextTick = tick() + 0.25

        local ping = 0
        pcall(function() ping = math.floor(LP:GetNetworkPing() * 1000 + 0.5) end)
        local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")

        if mark.Visible then
            markTxt.Text = ("%s  %s  %s fps  %s ms  %s"):format(
                tag("Inertia", T.accent), "Murder Mystery 2",
                tag(tostring(fps), T.accent), tag(tostring(ping), T.accent),
                os.date("%H:%M"))
        end

        if chips.FPS.frame.Visible then chips.FPS.value.Text = tostring(fps) end
        if chips.PING.frame.Visible then chips.PING.value.Text = ping .. " ms" end
        if chips.COORDS.frame.Visible then
            chips.COORDS.value.Text = hrp and ("%d, %d, %d"):format(hrp.Position.X, hrp.Position.Y, hrp.Position.Z) or "-"
        end
        if chips.SPEED.frame.Visible then
            local v = hrp and hrp.AssemblyLinearVelocity or Vector3.zero
            chips.SPEED.value.Text = ("%d"):format(Vector3.new(v.X, 0, v.Z).Magnitude)
        end
        if chips.SESSION.frame.Visible then
            local s = math.floor(tick() - startedAt)
            chips.SESSION.value.Text = ("%02d:%02d"):format(math.floor(s / 60), s % 60)
        end

        if feedPanel.Visible then
            local lines = {}
            for _, e in ipairs(feed) do lines[#lines + 1] = tag(e.name, e.color) .. " killed" end
            feedTxt.Text = #lines > 0 and table.concat(lines, "\n") or "no kills yet"
        end

        bindPanel.Visible = F.HUD_Binds == true
        if bindPanel.Visible then
            local lines = {}
            for flag, b in pairs(BINDS) do
                lines[#lines + 1] = tag(b.key, T.accent) .. "  " .. (BIND_NAME[flag] or flag)
                    .. "  [" .. b.mode .. "]"
            end
            table.sort(lines)
            bindTxt.Text = #lines > 0 and table.concat(lines, "\n") or "no binds"
        end

        if not (roundPanel.Visible or gunPanel.Visible or F.NotifyRound) then return end

        local murderer, gunner, gunnerRole, alive, total = "None", nil, nil, 0, 0
        for _, p in ipairs(Players:GetPlayers()) do
            local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
            local role = (hum and hum.Health > 0) and E.getRole(p) or "Dead"
            if role == "Murderer" then murderer = p.Name
            elseif role == "Sheriff" or role == "Hero" then gunner, gunnerRole = p.Name, role
            elseif role == "Innocent" then alive = alive + 1 end
            if role ~= "Dead" then total = total + 1 end
        end

        local drop = workspace:FindFirstChild("GunDrop") or workspace:FindFirstChild("GunDrop", true)

        if F.NotifyRound then
            if murderer ~= "None" and murderer ~= lastMurderer then
                lastMurderer = murderer
                Notify("Round", "Murderer: " .. murderer .. (gunner and (" | Gun: " .. gunner) or ""), "warn")
            elseif murderer == "None" then
                lastMurderer = nil
            end
            local hasDrop = (drop and drop.Parent) and true or false
            if hasDrop and not hadDrop then Notify("Gun", "Dropped on the floor") end
            hadDrop = hasDrop
        end

        if roundPanel.Visible then
            roundTxt.Text = table.concat({
                "Murderer: " .. tag(murderer, E.roleColor.Murderer),
                "Gun: " .. (gunner and tag(gunner, E.roleColor[gunnerRole]) or "None"),
                "Innocents: " .. tag(tostring(alive), E.roleColor.Innocent) .. " / " .. total,
                "Alive: " .. total,
            }, "\n")
        end

        if gunPanel.Visible then
            local where = "None"
            if drop and drop.Parent then
                local part = drop:IsA("BasePart") and drop or drop:FindFirstChildWhichIsA("BasePart", true)
                local d = (part and hrp) and math.floor((part.Position - hrp.Position).Magnitude) or 0
                where = tag("on floor", E.roleColor.Hero) .. " (" .. d .. " studs)"
            elseif gunner then
                where = tag(gunner, E.roleColor[gunnerRole])
            end
            gunTxt.Text = "Holder: " .. where .. "\nRole: " .. (gunnerRole or "-")
        end
    end))
end

--=============================== configs ===============================--
-- конфиг = json в папке экзекутора; тема лежит в flags под ключом Theme
local HttpService = game:GetService("HttpService")
local DIR = GAME_DIR .. "/configs"

local function fsOK()
    return isfolder and makefolder and writefile and readfile and listfiles and delfile
end

-- позиции окна и всех HUD-панелей: тоже часть конфига
local function dumpLayout()
    local out = {}
    for id, frame in pairs(DRAGGABLE) do
        if frame.Parent then
            local p = frame.Position
            out[id] = { p.X.Scale, p.X.Offset, p.Y.Scale, p.Y.Offset }
        end
    end
    return out
end

local function applyLayout(data)
    if type(data) ~= "table" then return end
    for id, v in pairs(data) do
        local frame = DRAGGABLE[id]
        if frame and type(v) == "table" and #v == 4 then
            frame.Position = UDim2.new(v[1], v[2], v[3], v[4])
        end
    end
end

local function cfgList()
    if not fsOK() then return {} end
    if not isfolder(DIR) then makefolder(DIR) end
    local out = {}
    for _, f in ipairs(listfiles(DIR)) do
        local n = f:match("([^\\/]+)%.json$")
        if n then out[#out + 1] = n end
    end
    table.sort(out)
    return out
end

local function cfgSave(name)
    if not fsOK() or not name or name == "" then return false end
    if not isfolder(DIR) then makefolder(DIR) end
    -- тема лежит в flags под ключом Theme, отдельного поля не нужно
    return pcall(writefile, DIR .. "/" .. name .. ".json", HttpService:JSONEncode({ flags = F, binds = BINDS, layout = dumpLayout() }))
end

local function cfgRead(name)
    if not fsOK() or not name then return nil end
    local ok, raw = pcall(readfile, DIR .. "/" .. name .. ".json")
    if not ok then return nil end
    local good, data = pcall(function() return HttpService:JSONDecode(raw) end)
    return good and data or nil
end

--=============================== layout ===============================--
do
    local t = Tab("Main")

    local aim = Group(t.left, { "Sheriff", "Murder" })
    Toggle(aim[1], "Silent Aim", { flag = "SheriffSilentAim" })
    Toggle(aim[1], "Wall Bang", { flag = "SheriffPiercing" })
    Toggle(aim[1], "Wall Check", { flag = "SheriffWallCheck" })
    Toggle(aim[1], "Anti-Desync", { flag = "SheriffAntiDesync" })
    Dropdown(aim[1], "Prediction", E.PredictNames, "Off", "GunPredict")
    Dropdown(aim[1], "Resolver", E.resolverModes, "Off", "Resolver")
    Slider(aim[1], "Resolver Strength", 10, 200, 100, "%", "ResolverStrength")

    Toggle(aim[1], "Force Shoot", { flag = "ForceShoot" })
    Dropdown(aim[1], "Force Shoot Mode", { "Target", "Mouse" }, "Target", "ForceShootMode")

    Toggle(aim[2], "Silent Aim", { flag = "KnifeSilentAim" })
    Toggle(aim[2], "Wall Check", { flag = "KnifeWallCheck" })
    Toggle(aim[2], "Prioritize Sheriff / Hero", { flag = "KnifePrioritize", default = true })
    -- по умолчанию Off: предсказание уводило точку броска вперёд цели и
    -- силент попросту мазал
    Dropdown(aim[2], "Prediction", E.PredictNames, "Off", "KnifePredict")

    local throw = Group(t.right, "Knife Throw")
    Toggle(throw, "Fast Throw", { flag = "FastThrow", callback = function() E.applyWindup() end })
    Toggle(throw, "No Throw Animation", { flag = "NoThrowAnim", callback = function() E.applyWindup() end })
    Toggle(throw, "Thrown Knife Kill Aura", { flag = "ThrowAura" })
    Slider(throw, "Throw Windup Speed", 1, 10, 6, "", "ThrowWindup", function()
        F.ThrowSpeedControl = true
        E.applyWindup()
    end)
    Slider(throw, "Knife Flight Speed", 20, 400, 100, "", "KnifeFlightSpeed", function()
        F.FlightSpeedControl = true
        E.reapplyFlight()
    end)
    Slider(throw, "Throw Aura Range", 1, 60, 12, " studs", "ThrowAuraRange")

    local kill = Group(t.right, "Murderer")
    Toggle(kill, "Auto Kill Sheriff / Hero", { flag = "AutoKillSheriff" })
    Toggle(kill, "Auto Kill Nearest", { flag = "AutoKillNearest" })
    Toggle(kill, "Kill Aura", { flag = "KillAura" })
    Toggle(kill, "Click To Kill", { flag = "ClickKill" })
    Slider(kill, "Kill Aura Range", 5, 60, 18, " studs", "KillAuraRange")
    ButtonRow(kill, {
        { "Kill Nearest", function()
            local n = E.nearestPlayer()
            if n then E.murdererKill(n) end
        end },
        { "Kill All", function() E.killAll() end },
    })

    local gun = Group(t.right, "Gun Recovery")
    Toggle(gun, "Auto Grab Gun", { flag = "AutoGrabGun", callback = function(v)
        if v then E.grabGun(true) end
    end })
    Toggle(gun, "Auto Equip Gun", { flag = "AutoEquipGun", default = true })
    Toggle(gun, "Gun Drop Notify", { flag = "GunNotify" })
    Button(gun, "Grab Gun Now", function() E.grabGun(false) end, "act_grabgun")
end

do
    local t = Tab("Visuals")

    -- Chams разбиты по цели: игроки, своё тело, предметы. Раньше всё это
    -- лежало вперемешку в одной карточке.
    local chams = Group(t.right, { "Players", "Self", "Items" })

    Toggle(chams[1], "Enabled", { flag = "Chams" })
    Toggle(chams[1], "Through Walls", { flag = "ChamsThroughWalls", default = true })
    Toggle(chams[1], "Murderer", { flag = "ChamsMurderer", default = true })
    Toggle(chams[1], "Sheriff", { flag = "ChamsSheriff" })
    Toggle(chams[1], "Hero", { flag = "ChamsHero" })
    Toggle(chams[1], "Innocent", { flag = "ChamsInnocent" })
    Dropdown(chams[1], "Style",
        { "Crystal", "Ice", "Glow", "Neon", "ForceField", "Ghost", "Highlight", "Outline", "Solid", "WireFrame" },
        "Crystal", "ChamsStyle")
    Toggle(chams[1], "Wire Hides Body", { flag = "WireHideBody", default = true })
    Slider(chams[1], "Opacity", 0, 100, 50, "%", "ChamsOpacity")
    Slider(chams[1], "Wire Density", 1, 10, 3, "", "WireDensity", function() E.rebuildWire() end)

    Toggle(chams[2], "Self Chams", { flag = "SelfChams" })
    local blurSlider
    local function refreshBlurSlider(v)
        if blurSlider and blurSlider.frame then
            blurSlider.frame.Visible = (v or F.SelfChamsStyle or "Crystal") == "Crystal"
        end
    end
    Dropdown(chams[2], "Style", E.selfStyles, "Crystal", "SelfChamsStyle", function(v) refreshBlurSlider(v) end)
    Dropdown(chams[2], "Color", E.selfColors, "Cyan", "SelfChamsColor")
    Slider(chams[2], "Opacity", 0, 100, 70, "%", "SelfChamsOpacity")
    blurSlider = Slider(chams[2], "Blur", 0, 100, 0, "%", "SelfChamsBlur")
    refreshBlurSlider(F.SelfChamsStyle)

    Toggle(chams[3], "Item Chams", { flag = "ItemChams" })
    Toggle(chams[3], "Include Mine", { flag = "ItemChamsSelf", default = true })
    Toggle(chams[3], "Include Drops", { flag = "ItemChamsDrops", default = true })
    Dropdown(chams[3], "Mode", E.itemChamModes, "Highlight", "ItemChamsMode")
    Dropdown(chams[3], "Color", E.itemChamColors, "Cyan", "ItemChamsColor")
    Toggle(chams[3], "Rainbow", { flag = "ItemChamsRainbow" })

    local bt = Group(t.right, "Backtrack")
    Toggle(bt, "Enabled", { flag = "Backtrack" })
    Dropdown(bt, "Show For", E.backtrackTargets, "Others", "BacktrackTarget")
    Dropdown(bt, "Style", E.backtrackStyles, "Ghost", "BacktrackStyle")
    Dropdown(bt, "Color", E.backtrackColors, "Accent", "BacktrackColor")
    Slider(bt, "Depth", 0, 500, 0, "ms", "BacktrackDepth")
    Slider(bt, "Opacity", 10, 100, 65, "%", "BacktrackOpacity")

    -- выбор из списка сам включает фичу: отдельно щёлкать тумблер незачем
    local function autoOn(flag, apply)
        return function()
            if applyingConfig then apply() return end
            local set = FLAG_SET[flag]
            if set and not F[flag] then set(true) else apply() end
        end
    end

    local esp = Group(t.left, "ESP")
    Toggle(esp, "Box", { flag = "ESPBox", default = true })
    Dropdown(esp, "Box Style", E.espBoxStyles, "Corner", "ESPBoxStyle")
    Toggle(esp, "Name", { flag = "ESPName", default = true })
    Toggle(esp, "Role", { flag = "ESPRole" })
    Toggle(esp, "Distance", { flag = "ESPDistance" })
    Toggle(esp, "Health Bar", { flag = "ESPHealth", default = true })
    Toggle(esp, "Tracers", { flag = "ESPTracer" })
    Dropdown(esp, "Tracer From", E.espTracerFrom, "Bottom", "ESPTracerFrom")
    Dropdown(esp, "Color", E.espColors, "Role", "ESPColor")
    Slider(esp, "Max Distance", 100, 3000, 1000, " studs", "ESPMaxDist")

    local sh = Group(t.left, "Shaders")
    Toggle(sh, "Enabled", { flag = "Shaders", callback = function() E.applyShader() end })
    Dropdown(sh, "Preset", E.shaderNames, "Cinematic", "ShaderPreset", function() E.applyShader() end)
    Slider(sh, "Strength", 0, 200, 100, "%", "ShaderStrength", function() E.applyShader() end)
    Slider(sh, "Bloom", 0, 300, 100, "%", "ShaderBloom", function() E.applyShader() end)
    Slider(sh, "Blur", 0, 24, 0, "", "ShaderBlur", function() E.applyShader() end)
    Slider(sh, "Contrast", 0, 300, 100, "%", "ShaderContrast", function() E.applyShader() end)
    Slider(sh, "Saturation", 0, 300, 100, "%", "ShaderSaturation", function() E.applyShader() end)
    Toggle(sh, "Depth Of Field", { flag = "ShaderDOF", default = true, callback = function() E.applyShader() end })
    Toggle(sh, "Atmosphere", { flag = "ShaderFog", default = true, callback = function() E.applyShader() end })

    local cust = Group(t.left, "Customs")
    Toggle(cust, "Custom Cursor", { flag = "CustomCursor", callback = function() E.applyCursor() end })
    Dropdown(cust, "Cursor", E.assetNames.Cursors, E.assetNames.Cursors[1], "CursorAsset",
        autoOn("CustomCursor", E.applyCursor))
    Slider(cust, "Cursor Size", 16, 160, 64, "px", "CursorSize", function(v) E.setCursorSize(v) end)
    Toggle(cust, "Custom Sky", { flag = "CustomSky", callback = function() E.applySkybox() end })
    local skies = E.listSkyboxes()
    local skyBox = Dropdown(cust, "Sky", skies, skies[1], "SkyAsset",
        autoOn("CustomSky", E.applySkybox))
    Button(cust, "Refresh Skies", function()
        local list = E.listSkyboxes()
        skyBox.setOptions(list)
        Notify("Sky", #list > 0 and (#list .. " skyboxes found") or "skyboxes folder is empty", #list > 0 and nil or "warn")
    end)
    Toggle(cust, "Menu Background", { flag = "MenuBackground", callback = function() E.applyBackground() end })
    Dropdown(cust, "Background", E.assetNames.Backgrounds, E.assetNames.Backgrounds[1], "BackgroundAsset",
        autoOn("MenuBackground", E.applyBackground))

    local body = Group(t.right, "Custom Body")
    do
        -- ничего не зашито: что лежит в папке, то и в списке
        local found = E.listBodies()
        Toggle(body, "Custom Body", { flag = "CustomBody", callback = function() E.applyBody() end })
        local box = Dropdown(body, "Body", found, found[1], "BodyAsset", autoOn("CustomBody", E.applyBody))
        Button(body, "Refresh List", function()
            local list = E.listBodies()
            box.setOptions(list)
            Notify("Body", #list > 0 and (#list .. " packs found") or "bodies folder is empty", #list > 0 and nil or "warn")
        end)
        Slider(body, "Scale", 50, 250, 100, "%", "BodyScale", function() E.applyBody() end)
        Slider(body, "Height Offset", -4, 4, 0, "", "BodyOffset", function() E.applyBody() end)
        Toggle(body, "Clothing", { flag = "BodyClothing", default = true, callback = function() E.applyBody() end })
        Toggle(body, "Custom Color", { flag = "BodyTint", callback = function() E.applyBody() end })
        Slider(body, "Hue", 0, 360, 0, "", "BodyHue", function() E.applyBody() end)

        local cat = Group(t.right, "Catalog Model")
        local idBox = Input(cat, "Asset id, e.g. 138151705692565")
        local function syncId()
            F.CatalogId = idBox.Text
            touch()
        end
        idBox.FocusLost:Connect(syncId)
        -- раньше id из конфига не возвращался ни в F, ни в поле: тумблер
        -- включался с пустым idBox, и модель просто не грузилась
        FLAG_SET.CatalogId = function(v)
            if v == nil then return end
            F.CatalogId = v
            idBox.Text = tostring(v)
            if F.CatalogModel then pcall(E.applyCatalogModel) end
        end
        Toggle(cat, "Enabled", { flag = "CatalogModel", callback = function(v)
            syncId()
            if v then E.applyCatalogModel() else E.clearCatalog() end
        end })
        Button(cat, "Load", function()
            syncId()
            local set = FLAG_SET.CatalogModel
            if set and not F.CatalogModel then set(true) else E.applyCatalogModel() end
        end)
    end

    -- анимации и локальные косметики в одной карточке: раньше это были две
    -- почти пустые
    local anim = Group(t.left, "Animations & Cosmetics")
    Dropdown(anim, "Pack", E.packNames, "Default", "AnimPack", function() E.applyPack() end)
    ButtonRow(anim, {
        { "Reapply", function() E.applyPack() end },
        { "Default", function()
            local set = FLAG_SET.AnimPack
            if set then set("Default") end
        end },
    })
    local bundleBox = Input(anim, "Catalog bundle id...")
    Button(anim, "Apply Catalog Pack", function() E.applyCatalogPack(bundleBox.Text) end, "act_catalog_pack")
    Toggle(anim, "Headless", { flag = "LocalHeadless", callback = function() E.applyCosmetics() end })
    Toggle(anim, "Korblox", { flag = "LocalKorblox", callback = function() E.applyCosmetics() end })

    -- Emotes: поиск по каталогу, ЛКМ играет, ПКМ пинит. Пины живут в конфиге.
    do
        local em = Group(t.left, "Emotes")
        Toggle(em, "Loop Emote", { flag = "LoopEmote" })
        Slider(em, "Speed", 0.1, 3, 1, "x", "EmoteSpeed")
        local search = Input(em, "Search emote...")

        local listFrame = new("ScrollingFrame", {
            Size = UDim2.new(1, 0, 0, 110), BorderSizePixel = 1, ScrollBarThickness = 2,
            CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y,
        }, em)
        tint(listFrame, "BackgroundColor3", "frame")
        tint(listFrame, "BorderColor3", "border")
        list(listFrame, 0)

        F.EmotePins = F.EmotePins or {}
        FLAG_SET.EmotePins = function(v) if type(v) == "table" then F.EmotePins = v end end

        -- пустой список пинов раньше всегда занимал 70px дырой под поиском
        local pinFrame = new("ScrollingFrame", {
            Size = UDim2.new(1, 0, 0, 0), BorderSizePixel = 1, ScrollBarThickness = 2,
            Visible = false, CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y,
        }, em)
        tint(pinFrame, "BackgroundColor3", "frame")
        tint(pinFrame, "BorderColor3", "border")
        list(pinFrame, 0)

        local renderPins
        local function row(parent, name, pinned)
            local b = new("TextButton", {
                Size = UDim2.new(1, 0, 0, 18), Font = FONT, TextSize = SIZE,
                Text = (pinned and "* " or "  ") .. name, BackgroundTransparency = 1,
                AutoButtonColor = false, TextXAlignment = Enum.TextXAlignment.Left,
            }, parent)
            new("UIPadding", { PaddingLeft = UDim.new(0, 6) }, b)
            tint(b, "TextColor3", "dim")
            b.MouseEnter:Connect(function() b.TextColor3 = T.accent end)
            b.MouseLeave:Connect(function() b.TextColor3 = T.dim end)
            b.MouseButton1Click:Connect(function() E.playEmote(name) end)
            b.MouseButton2Click:Connect(function()
                F.EmotePins[name] = (not F.EmotePins[name]) or nil
                touch()
                renderPins()
            end)
            return b
        end

        local function renderList()
            for _, c in ipairs(listFrame:GetChildren()) do
                if c:IsA("TextButton") then c:Destroy() end
            end
            local needle = search.Text:lower()
            local shown = 0
            for _, name in ipairs(E.emoteNames) do
                if needle == "" or name:lower():find(needle, 1, true) then
                    row(listFrame, name, F.EmotePins[name])
                    shown = shown + 1
                    if shown >= 60 then break end   -- 961 строка разом это лаг
                end
            end
        end

        renderPins = function()
            for _, c in ipairs(pinFrame:GetChildren()) do
                if c:IsA("TextButton") then c:Destroy() end
            end
            local n = 0
            for name in pairs(F.EmotePins) do
                row(pinFrame, name, true)
                n = n + 1
            end
            pinFrame.Visible = n > 0
            pinFrame.Size = UDim2.new(1, 0, 0, math.min(n, 4) * 18 + (n > 0 and 2 or 0))
        end

        search:GetPropertyChangedSignal("Text"):Connect(renderList)
        renderList()
        renderPins()

        Button(em, "Stop Emote", function() E.stopEmote() end, "act_stop_emote")
    end
end

-- movement -------------------------------------------------------------
do
    local t = Tab("Movement")

    local sj = Group(t.left, "Speed & Jump")
    Slider(sj, "Walk Speed", 16, 200, 16, "", "WalkSpeed")
    Slider(sj, "Jump Power", 50, 300, 50, "", "JumpPower")
    Toggle(sj, "Infinite Jump", { flag = "InfiniteJump" })

    local mv = Group(t.left, "Movement")
    Toggle(mv, "No Clip", { flag = "NoClip", callback = function(v)
        if not v then E.restoreCollide() end
    end })
    Toggle(mv, "Fly", { flag = "Fly", callback = function(v)
        if not v then E.stopFly() end
    end })
    Slider(mv, "Fly Speed", 10, 250, 50, "", "FlySpeed")

    local mo = Group(t.right, "Momentum")
    Toggle(mo, "Bhop", { flag = "Bhop" })
    Slider(mo, "Bhop Max Speed", 16, 200, 28, "", "BhopMax")
    Toggle(mo, "Speed Glitch", { flag = "SpeedGlitch" })
    Slider(mo, "Air Speed", 20, 150, 50, "", "AirSpeed")

    local tr = Group(t.right, "Tricks")
    Toggle(tr, "Spinbot", { flag = "Spinbot" })
    Slider(tr, "Spin Speed", 5, 200, 20, "", "SpinSpeed")
end

-- target ---------------------------------------------------------------
do
    local t = Tab("Target")

    -- слева «кого», справа «что делаем»
    local sel = Group(t.left, "Selected Players")
    PlayerList(sel, 150, E.targets)
    Button(sel, "Clear Selection", function() table.clear(E.targets) end)

    local wl = Group(t.left, "Whitelist")
    PlayerList(wl, 150, E.whitelist)
    Button(wl, "Clear Whitelist", function() table.clear(E.whitelist) end)

    local acts = Group(t.left, "Actions")
    Button(acts, "Teleport To Target", function()
        local hrp = LP.Character and LP.Character:FindFirstChild("HumanoidRootPart")
        if not hrp then return end
        for _, p in ipairs(Players:GetPlayers()) do
            local r = E.targets[p.Name] and p.Character and p.Character:FindFirstChild("HumanoidRootPart")
            if r then hrp.CFrame = r.CFrame * CFrame.new(0, 0, 3) return end
        end
        E.notify("Targets", "No target selected")
    end)
    Button(acts, "Kill Targets", function()
        for _, p in ipairs(Players:GetPlayers()) do
            if E.targets[p.Name] then E.killInstant(p) end
        end
    end)
    Button(acts, "Fling Targets", function() E.flingSelected() end)

    local fling = Group(t.right, "Fling")
    Button(fling, "Steal Gun (Fling Sheriff)", function()
        local p = E.findSheriff()
        if p then E.voidReset(p) else E.notify("Fling", "No sheriff / gun holder") end
    end)
    Button(fling, "Fling Murderer", function()
        local p = E.findMurderer()
        if p then E.voidReset(p) else E.notify("Fling", "No murderer") end
    end)
    Button(fling, "Fling Selected", function() E.flingSelected() end)
    Button(fling, "Fling All", function() E.flingAll() end)

    local auto = Group(t.right, "Auto Fling")
    Toggle(auto, "Auto Fling Sheriff", { flag = "AutoFlingSheriff" })
    Toggle(auto, "Auto Fling Murderer", { flag = "AutoFlingMurderer" })
    Toggle(auto, "Loop Fling Selected", { flag = "LoopFlingSelected" })
    Toggle(auto, "Loop Fling All", { flag = "LoopFlingAll" })
    Toggle(auto, "Click Fling", { flag = "ClickFling" })
    Toggle(auto, "Touch Fling", { flag = "TouchFling" })
    Toggle(auto, "Fling Aura", { flag = "FlingAura" })
    Slider(auto, "Aura Range", 5, 50, 15, " studs", "FlingAuraRange")
    Slider(auto, "Max Retries", 0, 5, 3, "", "FlingRetries")
    Slider(auto, "Retry Delay", 1, 10, 2, " x0.1s", "FlingRetryDelay")

    local move = Group(t.right, "Movement")
    Toggle(move, "Bang Target", { flag = "BangTarget" })
    Toggle(move, "Orbit Target", { flag = "OrbitTarget" })
    Slider(move, "Orbit Speed", 1, 20, 3, "", "OrbitSpeed")
    Slider(move, "Distance", 1, 30, 6, " studs", "TargetDistance")
    Slider(move, "Height", -10, 20, 0, " studs", "TargetHeight")
end

-- teleport ---------------------------------------------------------------
do
    local t = Tab("Teleport")

    local roles = Group(t.left, "Roles")
    Button(roles, "Go To Murderer", function() E.gotoRole("Murderer") end, "act_tp_murderer")
    Button(roles, "Go To Sheriff", function() E.gotoRole("Sheriff") end, "act_tp_sheriff")

    local loc = Group(t.left, "Location")
    Button(loc, "Go To Lobby", function() E.gotoLobby() end, "act_tp_lobby")
    Button(loc, "Go To Map", function() E.gotoMap() end, "act_tp_map")
    Toggle(loc, "Click TP (press E)", { flag = "ClickTP" })

    local byName = Group(t.left, "Go To Player")
    local nameBox = Input(byName, "Player name...")
    Button(byName, "Teleport", function() E.gotoPlayer(nameBox.Text) end, "act_tp_name")

    local srv = Group(t.right, "Server")
    Button(srv, "Rejoin Server", function() E.rejoin() end)
    Button(srv, "Server Hop", function() E.serverHop() end)

    local auto = Group(t.right, "Automated")
    Toggle(auto, "Fast Autofarm", { flag = "FastAutofarm" })
    Slider(auto, "Autofarm Speed", 1, 120, 20, "", "AutofarmSpeed")

    local vote = Group(t.right, "Vote Farm")
    Dropdown(vote, "Map Slot", { "1", "2", "3" }, "1", "VoteSlot")
    Toggle(vote, "Auto Vote (spam)", { flag = "AutoVote" })
    Slider(vote, "Reset Count", 1, 20, 5, "", "VoteResets")
    Button(vote, "Run Vote Farm", function() E.voteFarm() end)
end

-- misc -----------------------------------------------------------------
do
    local t = Tab("Misc")

    local pr = Group(t.left, "Protection")
    Toggle(pr, "Anti-Fling", { flag = "AntiFling" })
    Toggle(pr, "Anti-Void", { flag = "AntiVoid" })
    Toggle(pr, "Anti-AFK", { flag = "AntiAFK" })
    Toggle(pr, "Anti-Ragdoll", { flag = "AntiRagdoll" })
    Toggle(pr, "Anti-Trap", { flag = "AntiTrap", callback = function(v) E.setAntiTrap(v) end })

    local cam = Group(t.left, "Camera")
    Toggle(cam, "X-Ray Map", { flag = "XRay", callback = function(v) E.setXray(v) end })
    Toggle(cam, "Camera Clip", { flag = "CamClip", callback = function(v) E.setCamClip(v) end })
    Toggle(cam, "No Camera Limit", { flag = "NoCamLimit", callback = function(v) E.setZoom(v) end })
    Toggle(cam, "No Blackout", { flag = "NoBlackout", callback = function(v)
        if v then E.noBlackout() end
    end })

    local pf = Group(t.left, "Performance")
    Toggle(pf, "Anti Lag", { flag = "AntiLag", callback = function(v)
        if v then E.antiLag() end
    end })

    local inv = Group(t.left, "Invisible")
    Toggle(inv, "Invisible (FE)", { flag = "Invisible", callback = function(v)
        if v then E.startInvisible() else E.stopInvisible() end
    end })

    local ds = Group(t.left, "Desync")
    Toggle(ds, "Desync (Fake Position)", { flag = "Desync" })
    Dropdown(ds, "Desync Mode", E.desyncModes, "Ultra Jitter", "DesyncMode")
    Slider(ds, "Teleport Range", 10, 3000, 500, " studs", "DesyncRange")
    Slider(ds, "Desync Speed", 1, 50, 20, "x", "DesyncSpeed")
    Dropdown(ds, "Spin Angles", E.desyncAngles, "Hyper Spin", "DesyncAngles")
    Toggle(ds, "Velocity Desync", { flag = "VelDesync" })
    Dropdown(ds, "Velocity Mode", E.velDesyncModes, "Break Predict", "VelDesyncMode")
    Slider(ds, "Velocity Power", 500, 50000, 10000, "", "VelDesyncMult")
    Toggle(ds, "Show Server Ghost", { flag = "DesyncGhost" })
    Toggle(ds, "Anti-Coin", { flag = "AntiCoin" })

    local cs = Group(t.right, "Custom Sounds")
    Toggle(cs, "Custom Gun Sound", { flag = "CustomGunSound", callback = function() E.applyGunSound() end })
    local gunSoundBox = Dropdown(cs, "Gun Sound", E.soundNames, "Default", "GunSoundAsset", function() E.applyGunSound() end)
    local gunIdBox = Input(cs, "Or paste sound id...")
    gunIdBox.FocusLost:Connect(function()
        F.GunSoundId = gunIdBox.Text
        touch()
        E.applyGunSound()
    end)
    FLAG_SET.GunSoundId = function(v)
        F.GunSoundId = v
        gunIdBox.Text = tostring(v or "")
    end
    Button(cs, "Preview Gun Sound", function() E.previewSound("gun") end)

    Toggle(cs, "Custom Murder Sound", { flag = "CustomKillSound" })
    local killSoundBox = Dropdown(cs, "Murder Sound", E.soundNames, "Default", "KillSoundAsset")
    local killIdBox = Input(cs, "Or paste sound id...")
    killIdBox.FocusLost:Connect(function()
        F.KillSoundId = killIdBox.Text
        touch()
    end)
    FLAG_SET.KillSoundId = function(v)
        F.KillSoundId = v
        killIdBox.Text = tostring(v or "")
    end
    Button(cs, "Preview Murder Sound", function() E.previewSound("kill") end)
    Slider(cs, "Sound Volume", 0, 100, 70, "%", "KillSoundVolume")
    Button(cs, "Sync Sounds", function() E.syncHitsounds() end)
    label(cs, "Custom: drop a .mp3/.wav in hitsounds/", { dim = true })
    E.onHitsounds = function(list)
        gunSoundBox.setOptions(list)
        killSoundBox.setOptions(list)
        if F.CustomGunSound then E.applyGunSound() end
    end
    E.syncHitsounds()

    local snd = Group(t.right, "Sound Mutes")
    local function mute(text, flag)
        Toggle(snd, text, { flag = flag, callback = function() E.refreshMutes() end })
    end
    mute("Mute Gun", "MuteGun")
    mute("Mute Reload", "MuteReload")
    mute("Mute Coin", "MuteCoin")
    mute("Mute Kill", "MuteKill")
    mute("Mute Kill Effect", "MuteEffect")
    mute("Mute Round Notify", "MuteNotify")
    mute("Mute Footsteps", "MuteFootsteps")
    mute("Mute Ambience / Music", "MuteAmbience")
    Button(snd, "Refresh Mutes", function()
        E.refreshMutes()
        Notify("Mute", "Audio state re-applied")
    end)
end

-- settings -------------------------------------------------------------
do
    local t = Tab("Settings")
    local u = Group(t.left, "Interface")

    local names = {}
    for i, x in ipairs(THEMES) do names[i] = x.name end
    Dropdown(u, "Theme", names, T.name, "Theme", function(n)
        useTheme(themeByName(n))
        if writefile then pcall(writefile, "default.txt", n) end
    end)

    local gifBox
    local gif = Group(t.left, "Menu GIF")
    Toggle(gif, "Enabled", { flag = "MenuGif", callback = function() E.applyGif() end })
    do
        -- список читается с диска один раз, а не по вызову на аргумент
        local gifs = E.listGifs()
        gifBox = Dropdown(gif, "Animation", gifs, gifs[1], "GifAsset", function()
            local set = FLAG_SET.MenuGif
            if set and not F.MenuGif then set(true) else E.applyGif() end
        end)
    end
    Slider(gif, "Size", 40, 260, 110, "px", "GifSize", function() E.applyGif() end)
    Button(gif, "Refresh List", function()
        local list = E.listGifs()
        gifBox.setOptions(list)
        Notify("GIF", #list > 0 and (#list .. " found") or "gif folder is empty", #list > 0 and nil or "warn")
    end)

    local hud = Group(t.left, "HUD")
    Toggle(hud, "Watermark", { flag = "HUD_Watermark" })
    Toggle(hud, "Round Info", { flag = "HUD_Round" })
    Toggle(hud, "Gun Status", { flag = "HUD_Gun" })
    Toggle(hud, "Kill Feed", { flag = "HUD_Feed" })
    Toggle(hud, "Keybind List", { flag = "HUD_Binds" })

    local nf = Group(t.right, "Notifications")
    Dropdown(nf, "Position", { "Top Right", "Top Left", "Bottom Right", "Bottom Left" }, "Top Right",
        "NotifyPos", function(v) setNotifyPos(v) end)
    Toggle(nf, "Round Events", { flag = "NotifyRound", default = true })
    Toggle(nf, "Kills", { flag = "NotifyKills" })

    local stats = Group(t.right, "HUD Stats")
    Toggle(stats, "FPS", { flag = "HUD_FPS" })
    Toggle(stats, "Ping", { flag = "HUD_PING" })
    Toggle(stats, "Coords", { flag = "HUD_COORDS" })
    Toggle(stats, "Speed", { flag = "HUD_SPEED" })
    Toggle(stats, "Session", { flag = "HUD_SESSION" })

    Button(u, "Unload", function() gui:Destroy() end)

    local c = Group(t.right, "Config")
    local nameBox = Input(c, "Config Name")
    local files   = List(c, 96)

    local function refresh() files.fill(cfgList()) end

    ButtonRow(c, {
        { "Create", function()
            local n = nameBox.Text:match("^%s*(.-)%s*$")
            if cfgSave(n) then nameBox.Text = ""; refresh() end
        end },
        { "Delete", function()
            local n = files.get()
            if n and fsOK() then pcall(delfile, DIR .. "/" .. n .. ".json"); refresh() end
        end },
        { "Overwrite", function()
            cfgSave(files.get() or nameBox.Text:match("^%s*(.-)%s*$"))
            refresh()
        end },
        { "Apply", function()
            local data = cfgRead(files.get())
            if not data then Notify("Config", "Nothing to load", "warn") return end
            applyingConfig = true
            for flag, v in pairs(data.flags or {}) do
                local setter = FLAG_SET[flag]
                if setter then pcall(setter, v) end
            end
            applyingConfig = false
            for flag, b in pairs(data.binds or {}) do
                if type(b) == "table" and b.key then
                    BINDS[flag] = { key = b.key, mode = b.mode or "Toggle" }
                    refreshBind(flag)
                end
            end
            applyLayout(data.layout)
            Notify("Config", (files.get() or "config") .. " applied")
        end },
    })

    refresh()
end

--=============================== autosave ===============================--
-- отдельный от именованных конфигов файл: состояние подхватывается при каждом
-- инжекте без нажатия Apply
do
    local FILE = DIR .. "/autosave.json"

    if fsOK() and isfile and isfile(FILE) then
        local ok, raw = pcall(readfile, FILE)
        local good, data = false, nil
        if ok then good, data = pcall(function() return HttpService:JSONDecode(raw) end) end
        if good and type(data) == "table" then
            applyingConfig = true
            for flag, v in pairs(data.flags or {}) do
                local set = FLAG_SET[flag]
                if set then pcall(set, v) end
            end
            applyingConfig = false
            for flag, b in pairs(data.binds or {}) do
                if type(b) == "table" and b.key then
                    BINDS[flag] = { key = b.key, mode = b.mode or "Toggle" }
                    refreshBind(flag)
                end
            end
            applyLayout(data.layout)
        end
    end

    -- пишем по факту изменения, а не по таймеру. Дебаунс 0.25 с нужен только
    -- чтобы протяжка слайдера не превратилась в сотню записей на диск.
    local function flush()
        if not fsOK() then return end
        if not isfolder(DIR) then makefolder(DIR) end
        local ok, json = pcall(function() return HttpService:JSONEncode({ flags = F, binds = BINDS, layout = dumpLayout() }) end)
        if ok then pcall(writefile, FILE, json) end
    end

    if fsOK() then
        task.spawn(function()
            while not dead do
                if cfgDirty then
                    cfgDirty = false
                    task.wait(0.25)
                    flush()
                else
                    task.wait(0.1)
                end
            end
        end)
        gui.Destroying:Connect(flush)   -- на выгрузке дописываем то, что не успело
    end
end

--=============================== cursor ===============================--
-- родная текстура курсора вместо треугольников Drawing: она сглажена, а
-- ImageColor3 красит её в акцент темы. Roblox рисует MouseIcon по центру
-- картинки, поэтому AnchorPoint 0.5 даёт ровно ту же точку клика.
do
    local RS = game:GetService("RunService")

    local cursor = new("ImageLabel", {
        Name = "cursor", Size = UDim2.fromOffset(64, 64), AnchorPoint = Vector2.new(0.5, 0.5),
        BackgroundTransparency = 1, Active = false, Visible = false, ZIndex = 10000,
        Image = "rbxasset://textures/Cursors/KeyboardMouse/ArrowCursor.png",
    }, gui)
    E.cursorImage = cursor
    -- автосейв восстанавливается раньше, чем существует этот ImageLabel,
    -- поэтому сохранённый курсор применяем здесь же
    if F.CustomCursor then task.defer(E.applyCursor) end
    if F.CursorSize then task.defer(function() E.setCursorSize(F.CursorSize) end) end
    -- AnchorPoint 0.5 держит остриё в центре картинки, поэтому размер можно
    -- менять свободно — точка клика не уедет
    E.setCursorSize = function(px)
        local s = math.clamp(tonumber(px) or 64, 16, 160)
        cursor.Size = UDim2.fromOffset(s, s)
    end
    -- кастомный курсор красить темой нельзя, он и так цветной
    dyn(function()
        if not F.CustomCursor then cursor.ImageColor3 = T.accent end
    end)

    local conn
    conn = RS.RenderStepped:Connect(function()
        local showCustom = win.Visible or F.CustomCursor
        if showCustom then
            if UIS.MouseIconEnabled then UIS.MouseIconEnabled = false end
            cursor.Visible = true

            local isLocked = (UIS.MouseBehavior == Enum.MouseBehavior.LockCenter)
            local cam = workspace.CurrentCamera
            local pos
            if isLocked and cam then
                local vs = cam.ViewportSize
                pos = Vector2.new(vs.X / 2, vs.Y / 2)
            else
                pos = UIS:GetMouseLocation()
            end
            cursor.Position = UDim2.fromOffset(pos.X, pos.Y)
        else
            if not UIS.MouseIconEnabled then UIS.MouseIconEnabled = true end
            cursor.Visible = false
        end
    end)

    -- без disconnect цикл продолжит гасить системный курсор после unload
    gui.Destroying:Connect(function()
        conn:Disconnect()
        UIS.MouseIconEnabled = true
    end)
end

--=============================== keys ===============================--
local function keyNameOf(i)
    if i.KeyCode and i.KeyCode ~= Enum.KeyCode.Unknown then return i.KeyCode.Name end
    local t = i.UserInputType.Name
    if t:sub(1, 5) == "Mouse" then return t end
    return nil
end

UIS.InputBegan:Connect(function(i, gpe)
    local key = keyNameOf(i)

    -- режим ожидания: следующая клавиша становится биндом, Delete снимает
    if listening then
        if not key then return end
        local flag = listening
        listening = nil
        if key == "Delete" or key == "Backspace" then
            BINDS[flag] = nil
            Notify("Keybind", (BIND_NAME[flag] or flag) .. " unbound")
        else
            local ui = BIND_UI[flag]
            BINDS[flag] = { key = key, mode = (ui and ui.press) and "Press" or "Toggle" }
            Notify("Keybind", (BIND_NAME[flag] or flag) .. " -> " .. key)
        end
        refreshBind(flag)
        touch()
        return
    end

    if not key then return end

    if key == "RightShift" or key == "Insert" then
        if gpe then return end
        win.Visible = not win.Visible
        return
    end

    -- gameProcessedEvent тут намеренно игнорируется: цифры забирает рюкзак,
    -- а часть клавиш — CoreGui, и бинды на них просто не срабатывали.
    -- От ввода в поля защищает проверка сфокусированного текстбокса.
    if UIS:GetFocusedTextBox() then return end
    for flag, b in pairs(BINDS) do
        if b.key == key and b.mode ~= "Always" then
            if b.mode == "Press" then
                local action = BIND_ACTION[flag]
                if action then task.spawn(action) end
            else
                local setter = FLAG_SET[flag]
                if setter then
                    local v = (b.mode == "Hold") and true or (not F[flag])
                    setter(v)
                    Notify("Keybind", (BIND_NAME[flag] or flag) .. (v and ": on" or ": off"))
                end
            end
        end
    end
end)

UIS.InputEnded:Connect(function(i)
    local key = keyNameOf(i)
    if not key then return end
    for flag, b in pairs(BINDS) do
        if b.key == key and b.mode == "Hold" then
            local setter = FLAG_SET[flag]
            if setter then setter(false) end
        end
    end
end)
