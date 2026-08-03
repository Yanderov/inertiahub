--[[
    â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
    â•‘             INERTIAHUB UNIVERSAL ROBLOX SCRIPT (MOBILE)                â•‘
    â•‘             Aesthetic: Matte Dark Charcoal / Zinc                      â•‘
    â•‘             Engine: Touch-Optimized Multi-Game Suite                   â•‘
    â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
]]

_G.INERTIA_MOBILE = true

if _G.Universal_Inertia_Script then
    pcall(function() _G.Universal_Inertia_Script:Destroy() end)
    _G.Universal_Inertia_Script = nil
end

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UIS = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local Lighting = game:GetService("Lighting")
local TeleportService = game:GetService("TeleportService")
local HttpService = game:GetService("HttpService")
local CoreGui = game:GetService("CoreGui")
local Workspace = game:GetService("Workspace")

local MOBILE = true
local LP = Players.LocalPlayer
if not LP then
    LP = Players:GetPropertyChangedSignal("LocalPlayer"):Wait() or Players.LocalPlayer
end
local Camera = Workspace.CurrentCamera or Workspace:WaitForChild("Camera")

-- State storage
local S = {
    Connections = {}, Cleanups = {},
    -- Visuals / ESP
    BoxESP = false, NameESP = false, DistanceESP = false, HealthESP = false,
    TracerESP = false, TracerOrigin = "Bottom",
    Chams = false, ChamsFill = Color3.fromRGB(90, 140, 255), ChamsOutline = Color3.fromRGB(255, 255, 255),
    ChamsFillTrans = 0.5, ChamsOutlineTrans = 0,
    ESPMaxDist = 1500, ESPTeamCheck = false, ESPShowSelf = false,
    
    -- Lighting / Shaders
    ActiveShader = "None",
    ShaderBrightness = 200, ShaderExposure = 4, ShaderBloom = 40, ShaderContrast = 12,
    ShaderSaturation = 18, ShaderCCBright = 0, ShaderTime = 14, ShaderBloomSize = 24,
    ShaderBloomThreshold = 155, ShaderSunRays = 8, ShaderSunSpread = 68,
    ShaderDOF = 0, ShaderDOFFocus = 45, ShaderDOFRadius = 70, ShaderDOFNear = 10, ShaderDOFFar = 8,
    ShaderBlur = 0, ShaderAtmo = 22, ShaderAtmoOffset = 20, ShaderAtmoHaze = 160, ShaderAtmoGlare = 15,
    ShaderTint = "Neutral", ShaderTintR = 255, ShaderTintG = 255, ShaderTintB = 255,
    ShaderAmbientR = 96, ShaderAmbientG = 100, ShaderAmbientB = 110,
    ShaderOutdoorR = 140, ShaderOutdoorG = 146, ShaderOutdoorB = 160,
    ShaderAtmoR = 210, ShaderAtmoG = 214, ShaderAtmoB = 222,
    ShaderDecayR = 120, ShaderDecayG = 142, ShaderDecayB = 190,
    ShaderDiffuse = 100, ShaderSpecular = 100, ShaderShadowSoftness = 55,
    ShaderLightingEnabled = true, ShaderCCEnabled = true, ShaderBloomEnabled = true,
    ShaderSunEnabled = true, ShaderDOFEnabled = false, ShaderBlurEnabled = false,
    ShaderAtmoEnabled = true, ShaderAutoApply = true, ShaderQuality = "Balanced", ShaderShadows = true,
    Fullbright = false, CustomFOV = false, FOVValue = 70,
    
    -- Movement & Character
    WalkSpeedEnabled = false, CustomWalkSpeed = 16,
    JumpPowerEnabled = false, CustomJumpPower = 50,
    InfiniteJump = false, Fly = false, FlySpeed = 50,
    NoClip = false, ClickTP = false, Spinbot = false, SpinSpeed = 20,
    AntiAFK = true,
    
    -- Combat / Aim
    SilentAim = false, AimPart = "Head", AimFOV = 120, AimHitChance = 100,
    AimWallCheck = false, ShowFOVCircle = false, CameraLock = false, CamLockSmoothness = 5,
    
    -- Utilities & HUD
    FPSUnlock = false,
    HUD_Watermark = true, HUD_FPS = true, HUD_Ping = true, HUD_Speed = false, HUD_Coords = false,
    UITheme = "Default", UITextScale = 1, HUDScale = 1, NotificationPosition = "Top Center",
}

local function trackConn(conn)
    table.insert(S.Connections, conn)
    return conn
end

-- =========================================================================
--  THEMES & STYLING
-- =========================================================================
local THEMES = {
    Default = {
        BG=Color3.fromRGB(15,15,18), Sidebar=Color3.fromRGB(12,12,15), Card=Color3.fromRGB(20,20,24), Elev=Color3.fromRGB(26,26,32),
        Hover=Color3.fromRGB(32,32,38), ActiveBg=Color3.fromRGB(40,40,48), Bd=Color3.fromRGB(39,39,45), Bd2=Color3.fromRGB(55,55,65),
        White=Color3.fromRGB(255,255,255), Tx=Color3.fromRGB(238,238,242), Tx2=Color3.fromRGB(180,180,190), Tx3=Color3.fromRGB(140,140,150),
        Accent=Color3.fromRGB(220,220,230), Glow=Color3.fromRGB(145,144,141),
        TgOff=Color3.fromRGB(30,30,36), TgOn=Color3.fromRGB(220,220,230),
        KnobOff=Color3.fromRGB(120,120,130), KnobOn=Color3.fromRGB(20,20,24)
    },
    Graphite = {
        BG=Color3.fromRGB(24,24,27), Sidebar=Color3.fromRGB(18,18,20), Card=Color3.fromRGB(32,32,36), Elev=Color3.fromRGB(39,39,44),
        Hover=Color3.fromRGB(48,48,54), ActiveBg=Color3.fromRGB(58,58,66), Bd=Color3.fromRGB(48,48,54), Bd2=Color3.fromRGB(68,68,76),
        White=Color3.fromRGB(255,255,255), Tx=Color3.fromRGB(244,244,245), Tx2=Color3.fromRGB(180,180,186), Tx3=Color3.fromRGB(130,130,138),
        Accent=Color3.fromRGB(228,228,231), Glow=Color3.fromRGB(161,161,170),
        TgOff=Color3.fromRGB(39,39,44), TgOn=Color3.fromRGB(228,228,231),
        KnobOff=Color3.fromRGB(130,130,138), KnobOn=Color3.fromRGB(24,24,27)
    },
    Ocean = {
        BG=Color3.fromRGB(10,18,30), Sidebar=Color3.fromRGB(8,14,24), Card=Color3.fromRGB(14,26,44), Elev=Color3.fromRGB(18,34,58),
        Hover=Color3.fromRGB(24,44,74), ActiveBg=Color3.fromRGB(30,56,92), Bd=Color3.fromRGB(26,48,80), Bd2=Color3.fromRGB(38,70,116),
        White=Color3.fromRGB(235,248,255), Tx=Color3.fromRGB(210,235,255), Tx2=Color3.fromRGB(150,190,225), Tx3=Color3.fromRGB(110,150,185),
        Accent=Color3.fromRGB(56,189,248), Glow=Color3.fromRGB(14,165,233),
        TgOff=Color3.fromRGB(18,34,58), TgOn=Color3.fromRGB(56,189,248),
        KnobOff=Color3.fromRGB(110,150,185), KnobOn=Color3.fromRGB(8,14,24)
    },
    Emerald = {
        BG=Color3.fromRGB(10,24,18), Sidebar=Color3.fromRGB(7,18,14), Card=Color3.fromRGB(14,34,26), Elev=Color3.fromRGB(18,44,34),
        Hover=Color3.fromRGB(24,56,44), ActiveBg=Color3.fromRGB(30,70,54), Bd=Color3.fromRGB(26,60,46), Bd2=Color3.fromRGB(38,86,66),
        White=Color3.fromRGB(235,255,244), Tx=Color3.fromRGB(210,250,230), Tx2=Color3.fromRGB(150,220,185), Tx3=Color3.fromRGB(110,175,145),
        Accent=Color3.fromRGB(52,211,153), Glow=Color3.fromRGB(16,185,129),
        TgOff=Color3.fromRGB(18,44,34), TgOn=Color3.fromRGB(52,211,153),
        KnobOff=Color3.fromRGB(110,175,145), KnobOn=Color3.fromRGB(7,18,14)
    },
    Violet = {
        BG=Color3.fromRGB(20,14,32), Sidebar=Color3.fromRGB(15,10,24), Card=Color3.fromRGB(28,20,46), Elev=Color3.fromRGB(36,26,58),
        Hover=Color3.fromRGB(46,34,74), ActiveBg=Color3.fromRGB(58,44,92), Bd=Color3.fromRGB(48,36,78), Bd2=Color3.fromRGB(68,52,110),
        White=Color3.fromRGB(248,240,255), Tx=Color3.fromRGB(230,215,250), Tx2=Color3.fromRGB(185,160,225), Tx3=Color3.fromRGB(145,120,185),
        Accent=Color3.fromRGB(168,85,247), Glow=Color3.fromRGB(147,51,234),
        TgOff=Color3.fromRGB(36,26,58), TgOn=Color3.fromRGB(168,85,247),
        KnobOff=Color3.fromRGB(145,120,185), KnobOn=Color3.fromRGB(15,10,24)
    },
    Amber = {
        BG=Color3.fromRGB(24,18,10), Sidebar=Color3.fromRGB(18,13,7), Card=Color3.fromRGB(34,26,14), Elev=Color3.fromRGB(44,34,18),
        Hover=Color3.fromRGB(56,44,24), ActiveBg=Color3.fromRGB(70,56,30), Bd=Color3.fromRGB(58,46,26), Bd2=Color3.fromRGB(82,66,38),
        White=Color3.fromRGB(255,250,235), Tx=Color3.fromRGB(250,235,210), Tx2=Color3.fromRGB(220,190,150), Tx3=Color3.fromRGB(175,145,110),
        Accent=Color3.fromRGB(245,158,11), Glow=Color3.fromRGB(217,119,6),
        TgOff=Color3.fromRGB(44,34,18), TgOn=Color3.fromRGB(245,158,11),
        KnobOff=Color3.fromRGB(175,145,110), KnobOn=Color3.fromRGB(18,13,7)
    }
}

local T = {}
local function applyPalette(name)
    local src = THEMES[name] or THEMES.Default
    for k in pairs(T) do T[k] = nil end
    for k, v in pairs(src) do T[k] = v end
    S.UITheme = THEMES[name] and name or "Default"
end
applyPalette(S.UITheme)

local F = Enum.Font.Gotham
local FM = Enum.Font.GothamMedium
local FB = Enum.Font.GothamBold

-- =========================================================================
--  CLEANUP / SCREEN GUI SETUP
-- =========================================================================
local parentGui = nil
pcall(function() parentGui = CoreGui end)
if not parentGui then parentGui = LP:WaitForChild("PlayerGui") end

local oldGui = parentGui:FindFirstChild("InertiaUniversalUI")
if oldGui then pcall(function() oldGui:Destroy() end) end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "InertiaUniversalUI"
ScreenGui.ResetOnSpawn = false
ScreenGui.DisplayOrder = 999
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.Parent = parentGui
_G.Universal_Inertia_Script = ScreenGui

-- UI Helpers
local function Corner(inst, radius)
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, radius or 6)
    c.Parent = inst
    return c
end

local function Stroke(inst, color, thickness, trans)
    local s = Instance.new("UIStroke")
    s.Color = color or T.Bd
    s.Thickness = thickness or 1
    s.Transparency = trans or 0
    s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    s.Parent = inst
    return s
end

local function Pad(inst, t, b, l, r)
    local p = Instance.new("UIPadding")
    p.PaddingTop = UDim.new(0, t or 0)
    p.PaddingBottom = UDim.new(0, b or 0)
    p.PaddingLeft = UDim.new(0, l or 0)
    p.PaddingRight = UDim.new(0, r or 0)
    p.Parent = inst
    return p
end

-- =========================================================================
--  MAIN WINDOW CONTAINER (MOBILE SIZED)
-- =========================================================================
local winW = 460
local winH = 290

local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.fromOffset(winW, winH)
MainFrame.Position = UDim2.new(0.5, -winW/2, 0.5, -winH/2)
MainFrame.BackgroundColor3 = T.BG
MainFrame.BorderSizePixel = 0
MainFrame.ClipsDescendants = true
MainFrame.Active = true
MainFrame.Parent = ScreenGui

Corner(MainFrame, 10)
local mainStroke = Stroke(MainFrame, T.Bd, 1, 0)

-- Dragging logic
local isDragging = false
local dragStartPos = Vector2.new()
local frameStartPos = UDim2.new()

MainFrame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        isDragging = true
        dragStartPos = Vector2.new(input.Position.X, input.Position.Y)
        frameStartPos = MainFrame.Position

        local connM, connE
        connM = UIS.InputChanged:Connect(function(moveInput)
            if moveInput.UserInputType == Enum.UserInputType.MouseMovement or moveInput.UserInputType == Enum.UserInputType.Touch then
                local delta = Vector2.new(moveInput.Position.X, moveInput.Position.Y) - dragStartPos
                MainFrame.Position = UDim2.new(
                    frameStartPos.X.Scale, frameStartPos.X.Offset + delta.X,
                    frameStartPos.Y.Scale, frameStartPos.Y.Offset + delta.Y
                )
            end
        end)
        connE = UIS.InputEnded:Connect(function(endInput)
            if endInput.UserInputType == Enum.UserInputType.MouseButton1 or endInput.UserInputType == Enum.UserInputType.Touch then
                isDragging = false
                if connM then connM:Disconnect() end
                if connE then connE:Disconnect() end
            end
        end)
    end
end)

-- Top Header
local Header = Instance.new("Frame")
Header.Name = "Header"
Header.Size = UDim2.new(1, 0, 0, 38)
Header.BackgroundColor3 = T.Sidebar
Header.BorderSizePixel = 0
Header.Parent = MainFrame

Corner(Header, 10)
local headerCover = Instance.new("Frame")
headerCover.Size = UDim2.new(1, 0, 0, 10)
headerCover.Position = UDim2.new(0, 0, 1, -10)
headerCover.BackgroundColor3 = T.Sidebar
headerCover.BorderSizePixel = 0
headerCover.Parent = Header

local TitleLabel = Instance.new("TextLabel")
TitleLabel.Position = UDim2.new(0, 14, 0, 0)
TitleLabel.Size = UDim2.new(0, 200, 1, 0)
TitleLabel.BackgroundTransparency = 1
TitleLabel.Text = "INERTIA <font color=\"#A1A1AA\">MOBILE</font>"
TitleLabel.TextColor3 = T.White
TitleLabel.TextSize = 12
TitleLabel.Font = FB
TitleLabel.RichText = true
TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
TitleLabel.Parent = Header

local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.fromOffset(24, 24)
CloseBtn.Position = UDim2.new(1, -30, 0.5, -12)
CloseBtn.BackgroundColor3 = T.Elev
CloseBtn.Text = "X"
CloseBtn.TextColor3 = T.Tx2
CloseBtn.Font = FB
CloseBtn.TextSize = 11
CloseBtn.AutoButtonColor = false
CloseBtn.Parent = Header
Corner(CloseBtn, 5)
CloseBtn.Activated:Connect(function()
    MainFrame.Visible = not MainFrame.Visible
end)

-- Sidebar Tabs & Content Area
local Sidebar = Instance.new("Frame")
Sidebar.Name = "Sidebar"
Sidebar.Size = UDim2.new(0, 110, 1, -38)
Sidebar.Position = UDim2.new(0, 0, 0, 38)
Sidebar.BackgroundColor3 = T.Sidebar
Sidebar.BorderSizePixel = 0
Sidebar.Parent = MainFrame

local ContentArea = Instance.new("Frame")
ContentArea.Name = "ContentArea"
ContentArea.Size = UDim2.new(1, -110, 1, -38)
ContentArea.Position = UDim2.new(0, 110, 0, 38)
ContentArea.BackgroundColor3 = T.BG
ContentArea.BorderSizePixel = 0
ContentArea.ClipsDescendants = true
ContentArea.Parent = MainFrame

local TabButtonsLayout = Instance.new("UIListLayout")
TabButtonsLayout.Padding = UDim.new(0, 4)
TabButtonsLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
TabButtonsLayout.Parent = Sidebar
Pad(Sidebar, 6, 6, 6, 6)

-- Tab system
local tabPages = {}
local activeTabBtn = nil

local function createTabPage(tabName)
    local page = Instance.new("ScrollingFrame")
    page.Name = tabName .. "Page"
    page.Size = UDim2.new(1, 0, 1, 0)
    page.BackgroundTransparency = 1
    page.BorderSizePixel = 0
    page.ScrollBarThickness = 3
    page.ScrollBarImageColor3 = T.Bd2
    page.CanvasSize = UDim2.new(0, 0, 0, 0)
    page.AutomaticCanvasSize = Enum.AutomaticSize.Y
    page.Visible = false
    page.Parent = ContentArea

    local layout = Instance.new("UIListLayout")
    layout.Padding = UDim.new(0, 6)
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Parent = page
    Pad(page, 8, 8, 10, 10)

    tabPages[tabName] = page
    return page
end

local function addTab(tabName)
    local btn = Instance.new("TextButton")
    btn.Name = tabName .. "Tab"
    btn.Size = UDim2.new(1, 0, 0, 28)
    btn.BackgroundColor3 = T.Elev
    btn.BackgroundTransparency = 0.5
    btn.Text = tabName
    btn.TextColor3 = T.Tx2
    btn.Font = FM
    btn.TextSize = 11
    btn.AutoButtonColor = false
    btn.Parent = Sidebar
    Corner(btn, 5)

    local page = createTabPage(tabName)

    btn.Activated:Connect(function()
        for name, p in pairs(tabPages) do
            p.Visible = (name == tabName)
        end
        for _, b in ipairs(Sidebar:GetChildren()) do
            if b:IsA("TextButton") then
                b.BackgroundColor3 = T.Elev
                b.BackgroundTransparency = 0.5
                b.TextColor3 = T.Tx2
            end
        end
        btn.BackgroundColor3 = T.ActiveBg
        btn.BackgroundTransparency = 0
        btn.TextColor3 = T.White
    end)

    if not activeTabBtn then
        activeTabBtn = btn
        btn.BackgroundColor3 = T.ActiveBg
        btn.BackgroundTransparency = 0
        btn.TextColor3 = T.White
        page.Visible = true
    end

    return page
end

-- =========================================================================
--  UI CONTROLS (Toggle, Slider, Dropdown, Button)
-- =========================================================================
local controlOrder = 0

local function createToggle(page, labelText, defaultVal, callback)
    controlOrder = controlOrder + 1
    local row = Instance.new("Frame")
    row.Name = "Toggle_" .. labelText
    row.Size = UDim2.new(1, 0, 0, 32)
    row.BackgroundColor3 = T.Card
    row.LayoutOrder = controlOrder
    row.Parent = page
    Corner(row, 6)
    Stroke(row, T.Bd, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.new(1, -54, 1, 0)
    lbl.Position = UDim2.new(0, 10, 0, 0)
    lbl.BackgroundTransparency = 1
    lbl.Text = labelText
    lbl.TextColor3 = T.Tx
    lbl.Font = FM
    lbl.TextSize = 11
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = row

    local track = Instance.new("TextButton")
    track.Size = UDim2.fromOffset(36, 18)
    track.Position = UDim2.new(1, -44, 0.5, -9)
    track.BackgroundColor3 = defaultVal and T.TgOn or T.TgOff
    track.Text = ""
    track.AutoButtonColor = false
    track.Parent = row
    Corner(track, 9)

    local knob = Instance.new("Frame")
    knob.Size = UDim2.fromOffset(12, 12)
    knob.Position = defaultVal and UDim2.new(1, -15, 0.5, -6) or UDim2.new(0, 3, 0.5, -6)
    knob.BackgroundColor3 = defaultVal and T.KnobOn or T.KnobOff
    knob.Parent = track
    Corner(knob, 6)

    local state = defaultVal
    track.Activated:Connect(function()
        state = not state
        local targetKnobPos = state and UDim2.new(1, -15, 0.5, -6) or UDim2.new(0, 3, 0.5, -6)
        local targetTrackCol = state and T.TgOn or T.TgOff
        local targetKnobCol = state and T.KnobOn or T.KnobOff

        TweenService:Create(knob, TweenInfo.new(0.18, Enum.EasingStyle.Quad), {
            Position = targetKnobPos,
            BackgroundColor3 = targetKnobCol
        }):Play()
        TweenService:Create(track, TweenInfo.new(0.18, Enum.EasingStyle.Quad), {
            BackgroundColor3 = targetTrackCol
        }):Play()

        callback(state)
    end)
end

local function createSlider(page, labelText, minVal, maxVal, defaultVal, callback)
    controlOrder = controlOrder + 1
    local row = Instance.new("Frame")
    row.Name = "Slider_" .. labelText
    row.Size = UDim2.new(1, 0, 0, 44)
    row.BackgroundColor3 = T.Card
    row.LayoutOrder = controlOrder
    row.Parent = page
    Corner(row, 6)
    Stroke(row, T.Bd, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.new(1, -70, 0, 18)
    lbl.Position = UDim2.new(0, 10, 0, 4)
    lbl.BackgroundTransparency = 1
    lbl.Text = labelText
    lbl.TextColor3 = T.Tx
    lbl.Font = FM
    lbl.TextSize = 11
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = row

    local valLbl = Instance.new("TextLabel")
    valLbl.Size = UDim2.new(0, 50, 0, 18)
    valLbl.Position = UDim2.new(1, -58, 0, 4)
    valLbl.BackgroundTransparency = 1
    valLbl.Text = tostring(defaultVal)
    valLbl.TextColor3 = T.Tx2
    valLbl.Font = FM
    valLbl.TextSize = 10
    valLbl.TextXAlignment = Enum.TextXAlignment.Right
    valLbl.Parent = row

    local track = Instance.new("Frame")
    track.Size = UDim2.new(1, -20, 0, 6)
    track.Position = UDim2.new(0, 10, 0, 28)
    track.BackgroundColor3 = T.Elev
    track.Parent = row
    Corner(track, 3)

    local fillPct = math.clamp((defaultVal - minVal) / (maxVal - minVal), 0, 1)
    local fill = Instance.new("Frame")
    fill.Size = UDim2.new(fillPct, 0, 1, 0)
    fill.BackgroundColor3 = T.Accent
    fill.Parent = track
    Corner(fill, 3)

    local dragging = false
    local function updateFromPos(x)
        local rel = math.clamp((x - track.AbsolutePosition.X) / track.AbsoluteSize.X, 0, 1)
        local rawVal = minVal + rel * (maxVal - minVal)
        local finalVal = math.floor(rawVal + 0.5)
        fill.Size = UDim2.new(rel, 0, 1, 0)
        valLbl.Text = tostring(finalVal)
        callback(finalVal)
    end

    track.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            updateFromPos(input.Position.X)
            local connM, connE
            connM = UIS.InputChanged:Connect(function(mi)
                if mi.UserInputType == Enum.UserInputType.MouseMovement or mi.UserInputType == Enum.UserInputType.Touch then
                    updateFromPos(mi.Position.X)
                end
            end)
            connE = UIS.InputEnded:Connect(function(ei)
                if ei.UserInputType == Enum.UserInputType.MouseButton1 or ei.UserInputType == Enum.UserInputType.Touch then
                    dragging = false
                    if connM then connM:Disconnect() end
                    if connE then connE:Disconnect() end
                end
            end)
        end
    end)
end

local function createDropdown(page, labelText, options, defaultVal, callback)
    controlOrder = controlOrder + 1
    local row = Instance.new("Frame")
    row.Name = "Dropdown_" .. labelText
    row.Size = UDim2.new(1, 0, 0, 32)
    row.BackgroundColor3 = T.Card
    row.LayoutOrder = controlOrder
    row.Parent = page
    Corner(row, 6)
    Stroke(row, T.Bd, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.new(1, -120, 1, 0)
    lbl.Position = UDim2.new(0, 10, 0, 0)
    lbl.BackgroundTransparency = 1
    lbl.Text = labelText
    lbl.TextColor3 = T.Tx
    lbl.Font = FM
    lbl.TextSize = 11
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = row

    local cycleBtn = Instance.new("TextButton")
    cycleBtn.Size = UDim2.new(0, 105, 0, 22)
    cycleBtn.Position = UDim2.new(1, -112, 0.5, -11)
    cycleBtn.BackgroundColor3 = T.Elev
    cycleBtn.Text = tostring(defaultVal)
    cycleBtn.TextColor3 = T.Tx
    cycleBtn.Font = FM
    cycleBtn.TextSize = 10
    cycleBtn.AutoButtonColor = false
    cycleBtn.Parent = row
    Corner(cycleBtn, 4)
    Stroke(cycleBtn, T.Bd2, 1, 0)

    local curIdx = 1
    for i, opt in ipairs(options) do
        if opt == defaultVal then curIdx = i break end
    end

    cycleBtn.Activated:Connect(function()
        curIdx = curIdx + 1
        if curIdx > #options then curIdx = 1 end
        local choice = options[curIdx]
        cycleBtn.Text = choice
        callback(choice)
    end)
end

local function createButton(page, labelText, btnText, callback)
    controlOrder = controlOrder + 1
    local row = Instance.new("Frame")
    row.Name = "Action_" .. labelText
    row.Size = UDim2.new(1, 0, 0, 32)
    row.BackgroundColor3 = T.Card
    row.LayoutOrder = controlOrder
    row.Parent = page
    Corner(row, 6)
    Stroke(row, T.Bd, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.new(1, -110, 1, 0)
    lbl.Position = UDim2.new(0, 10, 0, 0)
    lbl.BackgroundTransparency = 1
    lbl.Text = labelText
    lbl.TextColor3 = T.Tx
    lbl.Font = FM
    lbl.TextSize = 11
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = row

    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(0, 90, 0, 22)
    btn.Position = UDim2.new(1, -98, 0.5, -11)
    btn.BackgroundColor3 = T.Elev
    btn.Text = btnText
    btn.TextColor3 = T.Tx
    btn.Font = FM
    btn.TextSize = 10
    btn.AutoButtonColor = true
    btn.Parent = row
    Corner(btn, 4)
    Stroke(btn, T.Bd2, 1, 0)

    btn.Activated:Connect(callback)
end

-- =========================================================================
--  PAGES CONSTRUCTION
-- =========================================================================
local VisualsPage = addTab("Visuals")
local ShadersPage = addTab("Shaders")
local MovementPage = addTab("Movement")
local CombatPage = addTab("Combat")
local UtilityPage = addTab("Utility")
local SettingsPage = addTab("Settings")

-- =========================================================================
--  PAGE: VISUALS / ESP
-- =========================================================================
createToggle(VisualsPage, "Box ESP (2D Boxes)", S.BoxESP, function(v) S.BoxESP = v end)
createToggle(VisualsPage, "Name ESP", S.NameESP, function(v) S.NameESP = v end)
createToggle(VisualsPage, "Distance ESP", S.DistanceESP, function(v) S.DistanceESP = v end)
createToggle(VisualsPage, "Health ESP", S.HealthESP, function(v) S.HealthESP = v end)
createToggle(VisualsPage, "Tracer ESP", S.TracerESP, function(v) S.TracerESP = v end)
createDropdown(VisualsPage, "Tracer Origin", {"Bottom", "Center"}, S.TracerOrigin, function(v) S.TracerOrigin = v end)
createToggle(VisualsPage, "Chams (Highlights)", S.Chams, function(v) S.Chams = v end)
createSlider(VisualsPage, "ESP Max Distance", 100, 4000, S.ESPMaxDist, function(v) S.ESPMaxDist = v end)
createToggle(VisualsPage, "Team Check", S.ESPTeamCheck, function(v) S.ESPTeamCheck = v end)

-- ESP Render Loop
local espGuis = {}
local function removeEsp(player)
    if espGuis[player] then
        pcall(function() espGuis[player]:Destroy() end)
        espGuis[player] = nil
    end
    local char = player.Character
    if char then
        local hl = char:FindFirstChild("InertiaChams")
        if hl then pcall(function() hl:Destroy() end) end
    end
end

Players.PlayerRemoving:Connect(removeEsp)

trackConn(RunService.RenderStepped:Connect(function()
    local myChar = LP.Character
    local myHrp = myChar and myChar:FindFirstChild("HumanoidRootPart")

    for _, player in ipairs(Players:GetPlayers()) do
        if player == LP and not S.ESPShowSelf then
            removeEsp(player)
            continue
        end

        local char = player.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        local head = char and char:FindFirstChild("Head")

        if not (char and hrp and head and hum and hum.Health > 0) then
            removeEsp(player)
            continue
        end

        if S.ESPTeamCheck and player.Team and LP.Team and player.Team == LP.Team then
            removeEsp(player)
            continue
        end

        local dist = myHrp and (hrp.Position - myHrp.Position).Magnitude or 0
        if dist > S.ESPMaxDist then
            removeEsp(player)
            continue
        end

        -- Chams
        if S.Chams then
            local hl = char:FindFirstChild("InertiaChams")
            if not hl then
                hl = Instance.new("Highlight")
                hl.Name = "InertiaChams"
                hl.Adornee = char
                hl.FillColor = S.ChamsFill
                hl.OutlineColor = S.ChamsOutline
                hl.FillTransparency = S.ChamsFillTrans
                hl.OutlineTransparency = S.ChamsOutlineTrans
                hl.Parent = char
            end
        else
            local hl = char:FindFirstChild("InertiaChams")
            if hl then pcall(function() hl:Destroy() end) end
        end

        -- 2D Screen Projection
        local rootPos, onScreen = Camera:WorldToViewportPoint(hrp.Position)
        local headPos = Camera:WorldToViewportPoint(head.Position + Vector3.new(0, 0.5, 0))
        local legPos = Camera:WorldToViewportPoint(hrp.Position - Vector3.new(0, 3, 0))

        if onScreen and (S.BoxESP or S.NameESP or S.DistanceESP or S.HealthESP or S.TracerESP) then
            local gui = espGuis[player]
            if not gui then
                gui = Instance.new("ScreenGui")
                gui.Name = "InertiaESP_" .. player.Name
                gui.ResetOnSpawn = false
                gui.DisplayOrder = 500
                gui.Parent = ScreenGui
                espGuis[player] = gui
            end

            local boxH = math.abs(headPos.Y - legPos.Y)
            local boxW = boxH * 0.65

            -- Box
            local box = gui:FindFirstChild("Box")
            if S.BoxESP then
                if not box then
                    box = Instance.new("Frame")
                    box.Name = "Box"
                    box.BackgroundTransparency = 1
                    box.BorderSizePixel = 0
                    box.Parent = gui
                    Stroke(box, Color3.fromRGB(240, 240, 245), 1, 0)
                end
                box.Visible = true
                box.Size = UDim2.fromOffset(boxW, boxH)
                box.Position = UDim2.fromOffset(rootPos.X - boxW/2, headPos.Y)
            elseif box then
                box.Visible = false
            end

            -- Name & Distance & Health Label
            local label = gui:FindFirstChild("Label")
            if S.NameESP or S.DistanceESP or S.HealthESP then
                if not label then
                    label = Instance.new("TextLabel")
                    label.Name = "Label"
                    label.BackgroundTransparency = 1
                    label.Font = FB
                    label.TextSize = 10
                    label.TextColor3 = Color3.fromRGB(255, 255, 255)
                    label.Parent = gui
                    Stroke(label, Color3.fromRGB(0, 0, 0), 1, 0.2)
                end
                label.Visible = true
                local textParts = {}
                if S.NameESP then table.insert(textParts, player.Name) end
                if S.DistanceESP then table.insert(textParts, string.format("[%dm]", math.floor(dist))) end
                if S.HealthESP then table.insert(textParts, string.format("(%d HP)", math.floor(hum.Health))) end
                label.Text = table.concat(textParts, " ")
                label.Position = UDim2.fromOffset(rootPos.X - 100, headPos.Y - 14)
                label.Size = UDim2.fromOffset(200, 12)
            elseif label then
                label.Visible = false
            end

            -- Tracer
            local tracer = gui:FindFirstChild("Tracer")
            if S.TracerESP then
                if not tracer then
                    tracer = Instance.new("Frame")
                    tracer.Name = "Tracer"
                    tracer.BackgroundColor3 = Color3.fromRGB(200, 200, 210)
                    tracer.BorderSizePixel = 0
                    tracer.AnchorPoint = Vector2.new(0.5, 0.5)
                    tracer.Parent = gui
                end
                tracer.Visible = true
                local startX, startY = Camera.ViewportSize.X / 2, Camera.ViewportSize.Y
                if S.TracerOrigin == "Center" then
                    startY = Camera.ViewportSize.Y / 2
                end

                local deltaX = rootPos.X - startX
                local deltaY = rootPos.Y - startY
                local length = math.sqrt(deltaX^2 + deltaY^2)
                local angle = math.deg(math.atan2(deltaY, deltaX))

                tracer.Size = UDim2.fromOffset(length, 1)
                tracer.Position = UDim2.fromOffset(startX + deltaX/2, startY + deltaY/2)
                tracer.Rotation = angle
            elseif tracer then
                tracer.Visible = false
            end
        else
            removeEsp(player)
        end
    end
end))

-- =========================================================================
--  PAGE: SHADERS & ATMOSPHERE
-- =========================================================================
local SHADER_PRESETS = {
    ["None"] = { Brightness=2, Exposure=0, Bloom=false, CC=false, Atmo=false, Sun=false },
    ["RTX Enhanced"] = { Brightness=2.4, Exposure=0.2, Bloom=true, BloomInt=0.6, BloomSize=28, CC=true, Sat=0.25, Con=0.18, Bright=0.02, Atmo=true, AtmoDens=0.28, AtmoHaze=1.8, Sun=true, SunInt=0.15 },
    ["Cyberpunk Vivid"] = { Brightness=2.6, Exposure=0.3, Bloom=true, BloomInt=1.2, BloomSize=36, CC=true, Sat=0.55, Con=0.32, Bright=0.04, Atmo=true, AtmoDens=0.35, AtmoHaze=2.4, Sun=true, SunInt=0.22 },
    ["Midnight Noir"] = { Brightness=1.2, Exposure=-0.4, Bloom=true, BloomInt=0.3, BloomSize=18, CC=true, Sat=-0.7, Con=0.38, Bright=-0.05, Atmo=true, AtmoDens=0.42, AtmoHaze=2.8, Sun=false },
    ["Pastel Dream"] = { Brightness=2.8, Exposure=0.4, Bloom=true, BloomInt=0.8, BloomSize=32, CC=true, Sat=0.35, Con=-0.1, Bright=0.08, Atmo=true, AtmoDens=0.2, AtmoHaze=1.2, Sun=true, SunInt=0.12 },
    ["Sunset Warmth"] = { Brightness=2.2, Exposure=0.15, Bloom=true, BloomInt=0.7, BloomSize=30, CC=true, Sat=0.38, Con=0.2, Bright=0.02, Atmo=true, AtmoDens=0.32, AtmoHaze=2.0, Sun=true, SunInt=0.25 },
    ["Vintage 90s"] = { Brightness=2.0, Exposure=0.0, Bloom=true, BloomInt=0.4, BloomSize=20, CC=true, Sat=-0.15, Con=0.22, Bright=-0.02, Atmo=true, AtmoDens=0.25, AtmoHaze=1.5, Sun=false },
    ["Horror Dark"] = { Brightness=0.8, Exposure=-0.6, Bloom=false, CC=true, Sat=-0.45, Con=0.45, Bright=-0.1, Atmo=true, AtmoDens=0.6, AtmoHaze=4.0, Sun=false },
    ["Soft Bloom"] = { Brightness=2.2, Exposure=0.1, Bloom=true, BloomInt=0.9, BloomSize=34, CC=true, Sat=0.15, Con=0.05, Bright=0.04, Atmo=true, AtmoDens=0.22, AtmoHaze=1.4, Sun=true, SunInt=0.1 },
    ["Neutral Balanced"] = { Brightness=2.0, Exposure=0.05, Bloom=true, BloomInt=0.35, BloomSize=24, CC=true, Sat=0.12, Con=0.1, Bright=0.01, Atmo=true, AtmoDens=0.25, AtmoHaze=1.6, Sun=true, SunInt=0.08 },
    ["Dynamic Cinematic"] = { Brightness=2.5, Exposure=0.25, Bloom=true, BloomInt=0.75, BloomSize=30, CC=true, Sat=0.3, Con=0.25, Bright=0.03, Atmo=true, AtmoDens=0.3, AtmoHaze=2.1, Sun=true, SunInt=0.18 },
}

local function applyShaders(presetName)
    S.ActiveShader = presetName
    local p = SHADER_PRESETS[presetName] or SHADER_PRESETS["None"]

    pcall(function()
        Lighting.Brightness = p.Brightness or 2
        Lighting.ExposureCompensation = p.Exposure or 0

        local bloom = Lighting:FindFirstChild("InertiaBloom") or Instance.new("BloomEffect")
        bloom.Name = "InertiaBloom"
        bloom.Enabled = p.Bloom == true
        if p.Bloom then
            bloom.Intensity = p.BloomInt or 0.5
            bloom.Size = p.BloomSize or 24
            bloom.Threshold = 0.8
        end
        bloom.Parent = Lighting

        local cc = Lighting:FindFirstChild("InertiaCC") or Instance.new("ColorCorrectionEffect")
        cc.Name = "InertiaCC"
        cc.Enabled = p.CC == true
        if p.CC then
            cc.Saturation = p.Sat or 0
            cc.Contrast = p.Con or 0
            cc.Brightness = p.Bright or 0
        end
        cc.Parent = Lighting

        local atmo = Lighting:FindFirstChild("InertiaAtmo") or Instance.new("Atmosphere")
        atmo.Name = "InertiaAtmo"
        if p.Atmo then
            atmo.Density = p.AtmoDens or 0.3
            atmo.Haze = p.AtmoHaze or 1.5
            atmo.Glare = 0.2
            atmo.Offset = 0.25
        end
        atmo.Parent = Lighting

        local sun = Lighting:FindFirstChild("InertiaSun") or Instance.new("SunRaysEffect")
        sun.Name = "InertiaSun"
        sun.Enabled = p.Sun == true
        if p.Sun then
            sun.Intensity = p.SunInt or 0.1
            sun.Spread = 0.7
        end
        sun.Parent = Lighting
    end)
end

createDropdown(ShadersPage, "Shader Preset", {
    "None", "RTX Enhanced", "Cyberpunk Vivid", "Midnight Noir", "Pastel Dream",
    "Sunset Warmth", "Vintage 90s", "Horror Dark", "Soft Bloom", "Neutral Balanced", "Dynamic Cinematic"
}, S.ActiveShader, applyShaders)

createToggle(ShadersPage, "Fullbright", S.Fullbright, function(v)
    S.Fullbright = v
    if v then
        Lighting.Ambient = Color3.fromRGB(255, 255, 255)
        Lighting.OutdoorAmbient = Color3.fromRGB(255, 255, 255)
        Lighting.Brightness = 2.5
    else
        applyShaders(S.ActiveShader)
    end
end)

createSlider(ShadersPage, "Time of Day (Hours)", 0, 24, 14, function(v)
    Lighting.ClockTime = v
end)

createToggle(ShadersPage, "Custom FOV", S.CustomFOV, function(v)
    S.CustomFOV = v
    if not v then Camera.FieldOfView = 70 end
end)

createSlider(ShadersPage, "FOV Value", 50, 120, S.FOVValue, function(v)
    S.FOVValue = v
    if S.CustomFOV then Camera.FieldOfView = v end
end)

trackConn(RunService.RenderStepped:Connect(function()
    if S.CustomFOV then Camera.FieldOfView = S.FOVValue end
end))

-- =========================================================================
--  PAGE: MOVEMENT & PHYSICS
-- =========================================================================
createToggle(MovementPage, "WalkSpeed Override", S.WalkSpeedEnabled, function(v)
    S.WalkSpeedEnabled = v
    local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
    if hum and not v then hum.WalkSpeed = 16 end
end)

createSlider(MovementPage, "WalkSpeed Value", 16, 250, S.CustomWalkSpeed, function(v)
    S.CustomWalkSpeed = v
    local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
    if hum and S.WalkSpeedEnabled then hum.WalkSpeed = v end
end)

createToggle(MovementPage, "JumpPower Override", S.JumpPowerEnabled, function(v)
    S.JumpPowerEnabled = v
    local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
    if hum and not v then hum.JumpPower = 50 end
end)

createSlider(MovementPage, "JumpPower Value", 50, 300, S.CustomJumpPower, function(v)
    S.CustomJumpPower = v
    local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
    if hum and S.JumpPowerEnabled then hum.JumpPower = v end
end)

createToggle(MovementPage, "Infinite Jump", S.InfiniteJump, function(v) S.InfiniteJump = v end)
UIS.JumpRequest:Connect(function()
    if S.InfiniteJump then
        local hum = LP.Character and LP.Character:FindFirstChildOfClass("Humanoid")
        if hum then hum:ChangeState(Enum.HumanoidStateType.Jumping) end
    end
end)

createToggle(MovementPage, "Noclip (Walk Through Walls)", S.NoClip, function(v) S.NoClip = v end)
trackConn(RunService.Stepped:Connect(function()
    if S.NoClip and LP.Character then
        for _, part in ipairs(LP.Character:GetDescendants()) do
            if part:IsA("BasePart") and part.CanCollide then
                part.CanCollide = false
            end
        end
    end
    if S.WalkSpeedEnabled and LP.Character then
        local hum = LP.Character:FindFirstChildOfClass("Humanoid")
        if hum and hum.WalkSpeed ~= S.CustomWalkSpeed then
            hum.WalkSpeed = S.CustomWalkSpeed
        end
    end
    if S.JumpPowerEnabled and LP.Character then
        local hum = LP.Character:FindFirstChildOfClass("Humanoid")
        if hum and hum.JumpPower ~= S.CustomJumpPower then
            hum.JumpPower = S.CustomJumpPower
        end
    end
end))

-- Fly system
local flyBodyGyro, flyBodyVel
createToggle(MovementPage, "Fly", S.Fly, function(v)
    S.Fly = v
    local char = LP.Character
    local hrp = char and char:FindFirstChild("HumanoidRootPart")
    if not hrp then return end

    if v then
        flyBodyGyro = Instance.new("BodyGyro")
        flyBodyGyro.P = 9e4
        flyBodyGyro.MaxTorque = Vector3.new(9e9, 9e9, 9e9)
        flyBodyGyro.CFrame = hrp.CFrame
        flyBodyGyro.Parent = hrp

        flyBodyVel = Instance.new("BodyVelocity")
        flyBodyVel.Velocity = Vector3.new(0, 0, 0)
        flyBodyVel.MaxForce = Vector3.new(9e9, 9e9, 9e9)
        flyBodyVel.Parent = hrp
    else
        if flyBodyGyro then pcall(function() flyBodyGyro:Destroy() end) end
        if flyBodyVel then pcall(function() flyBodyVel:Destroy() end) end
    end
end)

createSlider(MovementPage, "Fly Speed", 10, 200, S.FlySpeed, function(v) S.FlySpeed = v end)

trackConn(RunService.RenderStepped:Connect(function()
    if S.Fly and flyBodyVel and flyBodyGyro and LP.Character then
        local hrp = LP.Character:FindFirstChild("HumanoidRootPart")
        if not hrp then return end

        flyBodyGyro.CFrame = Camera.CFrame
        local hum = LP.Character:FindFirstChildOfClass("Humanoid")
        if hum and hum.MoveDirection.Magnitude > 0 then
            flyBodyVel.Velocity = Camera.CFrame.LookVector * S.FlySpeed
        else
            flyBodyVel.Velocity = Vector3.new(0, 0, 0)
        end
    end
end))

createToggle(MovementPage, "Spinbot", S.Spinbot, function(v) S.Spinbot = v end)
createSlider(MovementPage, "Spinbot Speed", 5, 100, S.SpinSpeed, function(v) S.SpinSpeed = v end)
trackConn(RunService.RenderStepped:Connect(function()
    if S.Spinbot and LP.Character then
        local hrp = LP.Character:FindFirstChild("HumanoidRootPart")
        if hrp then
            hrp.CFrame = hrp.CFrame * CFrame.Angles(0, math.rad(S.SpinSpeed), 0)
        end
    end
end))

-- Anti-AFK
LP.Idled:Connect(function()
    if S.AntiAFK then
        pcall(function()
            local vu = game:GetService("VirtualUser")
            vu:CaptureController()
            vu:ClickButton2(Vector2.new())
        end)
    end
end)

-- =========================================================================
--  PAGE: COMBAT / AIMBOT
-- =========================================================================
createToggle(CombatPage, "Silent Aim / Target Lock", S.SilentAim, function(v) S.SilentAim = v end)
createDropdown(CombatPage, "Target Part", {"Head", "HumanoidRootPart", "Torso"}, S.AimPart, function(v) S.AimPart = v end)
createSlider(CombatPage, "FOV Radius", 30, 400, S.AimFOV, function(v) S.AimFOV = v end)
createSlider(CombatPage, "Hit Chance (%)", 10, 100, S.AimHitChance, function(v) S.AimHitChance = v end)
createToggle(CombatPage, "Camera Lock (Smooth)", S.CameraLock, function(v) S.CameraLock = v end)
createSlider(CombatPage, "CamLock Smoothness", 1, 20, S.CamLockSmoothness, function(v) S.CamLockSmoothness = v end)

-- FOV Circle
local fovCircleGui = Instance.new("ScreenGui")
fovCircleGui.Name = "InertiaFOVCircle"
fovCircleGui.ResetOnSpawn = false
fovCircleGui.DisplayOrder = 99
fovCircleGui.Parent = ScreenGui

local fovFrame = Instance.new("Frame")
fovFrame.Name = "Circle"
fovFrame.AnchorPoint = Vector2.new(0.5, 0.5)
fovFrame.BackgroundTransparency = 1
fovFrame.Visible = false
fovFrame.Parent = fovCircleGui
Corner(fovFrame, 999)
Stroke(fovFrame, Color3.fromRGB(220, 220, 230), 1, 0.4)

createToggle(CombatPage, "Show FOV Circle", S.ShowFOVCircle, function(v)
    S.ShowFOVCircle = v
    fovFrame.Visible = v
end)

local function getClosestPlayerToCenter()
    local center = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y / 2)
    local closestPlayer = nil
    local shortestDist = S.AimFOV

    for _, p in ipairs(Players:GetPlayers()) do
        if p ~= LP and p.Character then
            local targetPart = p.Character:FindFirstChild(S.AimPart) or p.Character:FindFirstChild("Head") or p.Character:FindFirstChild("HumanoidRootPart")
            local hum = p.Character:FindFirstChildOfClass("Humanoid")
            if targetPart and hum and hum.Health > 0 then
                local screenPos, onScreen = Camera:WorldToViewportPoint(targetPart.Position)
                if onScreen then
                    local dist = (Vector2.new(screenPos.X, screenPos.Y) - center).Magnitude
                    if dist < shortestDist then
                        shortestDist = dist
                        closestPlayer = p
                    end
                end
            end
        end
    end
    return closestPlayer
end

trackConn(RunService.RenderStepped:Connect(function()
    local center = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y / 2)
    if S.ShowFOVCircle then
        fovFrame.Position = UDim2.fromOffset(center.X, center.Y)
        fovFrame.Size = UDim2.fromOffset(S.AimFOV * 2, S.AimFOV * 2)
    end

    if S.CameraLock then
        local target = getClosestPlayerToCenter()
        if target and target.Character then
            local targetPart = target.Character:FindFirstChild(S.AimPart) or target.Character:FindFirstChild("Head")
            if targetPart then
                local targetCFrame = CFrame.new(Camera.CFrame.Position, targetPart.Position)
                Camera.CFrame = Camera.CFrame:Lerp(targetCFrame, 1 / math.max(1, S.CamLockSmoothness))
            end
        end
    end
end))

-- =========================================================================
--  PAGE: UTILITY
-- =========================================================================
createButton(UtilityPage, "Rejoin Current Server", "Rejoin", function()
    pcall(function()
        TeleportService:TeleportToPlaceInstance(game.PlaceId, game.JobId, LP)
    end)
end)

createButton(UtilityPage, "Server Hop (Random Server)", "Hop", function()
    pcall(function()
        TeleportService:Teleport(game.PlaceId, LP)
    end)
end)

createButton(UtilityPage, "Unlock FPS Cap", "Unlock", function()
    pcall(function()
        if setfpscap then setfpscap(999) end
    end)
end)

createButton(UtilityPage, "Copy Telegram Link", "Copy", function()
    pcall(function()
        if setclipboard then setclipboard("https://t.me/+QXgW7cwKsPc3MjA1") end
    end)
end)

createButton(UtilityPage, "Copy Website Link", "Copy", function()
    pcall(function()
        if setclipboard then setclipboard("https://inertiahub.xyz") end
    end)
end)

-- =========================================================================
--  PAGE: SETTINGS & HUD
-- =========================================================================
createDropdown(SettingsPage, "UI Color Theme", {"Default", "Graphite", "Ocean", "Emerald", "Violet", "Amber"}, S.UITheme, function(themeName)
    applyPalette(themeName)
    MainFrame.BackgroundColor3 = T.BG
    mainStroke.Color = T.Bd
    Header.BackgroundColor3 = T.Sidebar
    headerCover.BackgroundColor3 = T.Sidebar
    Sidebar.BackgroundColor3 = T.Sidebar
    ContentArea.BackgroundColor3 = T.BG
    for _, btn in ipairs(Sidebar:GetChildren()) do
        if btn:IsA("TextButton") then
            if btn.Text == activeTabBtn.Text then
                btn.BackgroundColor3 = T.ActiveBg
            else
                btn.BackgroundColor3 = T.Elev
            end
        end
    end
end)

createToggle(SettingsPage, "Watermark HUD", S.HUD_Watermark, function(v) S.HUD_Watermark = v end)
createToggle(SettingsPage, "FPS & Ping HUD", S.HUD_FPS, function(v) S.HUD_FPS = v end)

-- Watermark / Stats HUD
local HudGui = Instance.new("ScreenGui")
HudGui.Name = "InertiaUniversalHUD"
HudGui.ResetOnSpawn = false
HudGui.DisplayOrder = 90
HudGui.Parent = ScreenGui

local HudFrame = Instance.new("Frame")
HudFrame.Name = "HudBar"
HudFrame.Size = UDim2.fromOffset(240, 24)
HudFrame.Position = UDim2.new(0, 12, 0, 12)
HudFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 18)
HudFrame.BackgroundTransparency = 0.2
HudFrame.BorderSizePixel = 0
HudFrame.Parent = HudGui
Corner(HudFrame, 6)
Stroke(HudFrame, Color3.fromRGB(45, 45, 55), 1, 0.3)

local HudLabel = Instance.new("TextLabel")
HudLabel.Size = UDim2.new(1, -14, 1, 0)
HudLabel.Position = UDim2.new(0, 7, 0, 0)
HudLabel.BackgroundTransparency = 1
HudLabel.Font = FM
HudLabel.TextSize = 10
HudLabel.TextColor3 = Color3.fromRGB(220, 220, 230)
HudLabel.TextXAlignment = Enum.TextXAlignment.Left
HudLabel.RichText = true
HudLabel.Text = "INERTIA MOBILE â€¢ 60 FPS â€¢ 45ms"
HudLabel.Parent = HudFrame

local lastFpsTime = tick()
local frameCount = 0
local currentFps = 60

trackConn(RunService.RenderStepped:Connect(function()
    frameCount = frameCount + 1
    local now = tick()
    if now - lastFpsTime >= 0.5 then
        currentFps = math.floor(frameCount / (now - lastFpsTime))
        frameCount = 0
        lastFpsTime = now

        local ping = 0
        pcall(function()
            ping = math.floor(game:GetService("Stats").Network.ServerStatsItem["Data Ping"]:GetValue())
        end)

        HudFrame.Visible = S.HUD_Watermark or S.HUD_FPS
        HudLabel.Text = string.format("<b>INERTIA</b> <font color=\"#71717A\">v2.9</font> â€¢ <font color=\"#38BDF8\">%d FPS</font> â€¢ <font color=\"#A1A1AA\">%dms</font>", currentFps, ping)
    end
end))

-- Mobile Floating Open Button
local MobileToggleBtn = Instance.new("TextButton")
MobileToggleBtn.Name = "InertiaMobileToggle"
MobileToggleBtn.Size = UDim2.fromOffset(50, 28)
MobileToggleBtn.Position = UDim2.new(0, 10, 0, 110)
MobileToggleBtn.BackgroundColor3 = Color3.fromRGB(15, 15, 18)
MobileToggleBtn.BackgroundTransparency = 0.2
MobileToggleBtn.BorderSizePixel = 0
MobileToggleBtn.Text = "HUB"
MobileToggleBtn.TextColor3 = Color3.fromRGB(240, 240, 245)
MobileToggleBtn.Font = FB
MobileToggleBtn.TextSize = 12
MobileToggleBtn.Active = true
MobileToggleBtn.ZIndex = 50
MobileToggleBtn.Parent = ScreenGui
Corner(MobileToggleBtn, 6)
Stroke(MobileToggleBtn, Color3.fromRGB(60, 60, 75), 1, 0.2)

local mbDragging = false
local mbStart = Vector2.new()
local mbPos = UDim2.new()
local mbMoved = false

MobileToggleBtn.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.Touch or input.UserInputType == Enum.UserInputType.MouseButton1 then
        mbDragging = true
        mbMoved = false
        mbStart = Vector2.new(input.Position.X, input.Position.Y)
        mbPos = MobileToggleBtn.Position

        local connM, connE
        connM = UIS.InputChanged:Connect(function(moveInput)
            if moveInput.UserInputType == Enum.UserInputType.Touch or moveInput.UserInputType == Enum.UserInputType.MouseMovement then
                local delta = Vector2.new(moveInput.Position.X, moveInput.Position.Y) - mbStart
                if delta.Magnitude > 6 then mbMoved = true end
                if mbMoved then
                    MobileToggleBtn.Position = UDim2.new(mbPos.X.Scale, mbPos.X.Offset + delta.X, mbPos.Y.Scale, mbPos.Y.Offset + delta.Y)
                end
            end
        end)
        connE = UIS.InputEnded:Connect(function(endInput)
            if endInput.UserInputType == Enum.UserInputType.Touch or endInput.UserInputType == Enum.UserInputType.MouseButton1 then
                mbDragging = false
                if connM then connM:Disconnect() end
                if connE then connE:Disconnect() end
            end
        end)
    end
end)

MobileToggleBtn.Activated:Connect(function()
    if not mbMoved then
        MainFrame.Visible = not MainFrame.Visible
    end
end)
