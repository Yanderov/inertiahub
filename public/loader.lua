--[[
    ╔════════════════════════════════════════════════════════════════════════╗
    ║                     INERTIAHUB UNIVERSAL AUTO-LOADER                   ║
    ║                     Aesthetic: Matte Dark Charcoal / Zinc              ║
    ║                     Telemetry: Deduplicated Roblox UserId Hook         ║
    ╚════════════════════════════════════════════════════════════════════════╝
]]

local TweenService = game:GetService("TweenService")
local CoreGui = game:GetService("CoreGui")
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local MarketplaceService = game:GetService("MarketplaceService")

local LocalPlayer = Players.LocalPlayer
local PlaceId = game.PlaceId
local GameId = game.GameId

-- Configurable Base URL (Website Host)
local BASE_URL = "https://inertiahub.xyz"

-- Executor Identification
local executorName = "Potassium"
if identifyexecutor then
    executorName = tostring(identifyexecutor())
elseif KRNL_LOADED then
    executorName = "Volt"
elseif syn then
    executorName = "Velocity"
end

-- Telemetry Reporter (Deduplicated Roblox Account Analytics)
local function reportTelemetry(targetGame)
    task.spawn(function()
        pcall(function()
            local requestFunc = syn and syn.request or http_request or request or (http and http.request)
            if requestFunc and LocalPlayer then
                requestFunc({
                    Url = BASE_URL .. "/api/v1/telemetry/ping",
                    Method = "POST",
                    Headers = { ["Content-Type"] = "application/json" },
                    Body = HttpService:JSONEncode({
                        userId = tostring(LocalPlayer.UserId),
                        game = targetGame,
                        executor = executorName,
                        placeId = tostring(PlaceId),
                        timestamp = os.time()
                    })
                })
            end
        end)
    end)
end

-- GUI Builder
local function createLoaderUI()
    local parentTarget = nil
    pcall(function() parentTarget = CoreGui end)
    if not parentTarget then
        parentTarget = LocalPlayer:WaitForChild("PlayerGui")
    end

    -- Remove existing loader
    local existing = parentTarget:FindFirstChild("InertiaLoaderUI")
    if existing then existing:Destroy() end

    local ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "InertiaLoaderUI"
    ScreenGui.ResetOnSpawn = false
    ScreenGui.DisplayOrder = 99999
    ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    ScreenGui.Parent = parentTarget

    -- Main Container
    local MainFrame = Instance.new("Frame")
    MainFrame.Name = "MainFrame"
    MainFrame.AnchorPoint = Vector2.new(0.5, 0.5)
    MainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
    MainFrame.Size = UDim2.new(0, 360, 0, 160)
    MainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 17)
    MainFrame.BorderSizePixel = 0
    MainFrame.ClipsDescendants = true
    MainFrame.BackgroundTransparency = 1
    MainFrame.Parent = ScreenGui

    local MainCorner = Instance.new("UICorner")
    MainCorner.CornerRadius = UDim.new(0, 14)
    MainCorner.Parent = MainFrame

    local MainStroke = Instance.new("UIStroke")
    MainStroke.Color = Color3.fromRGB(39, 39, 42)
    MainStroke.Thickness = 1
    MainStroke.Transparency = 1
    MainStroke.Parent = MainFrame

    -- Header / Title
    local Header = Instance.new("Frame")
    Header.Name = "Header"
    Header.Size = UDim2.new(1, 0, 0, 48)
    Header.BackgroundTransparency = 1
    Header.Parent = MainFrame

    local LogoIcon = Instance.new("ImageLabel")
    LogoIcon.Size = UDim2.new(0, 24, 0, 24)
    LogoIcon.Position = UDim2.new(0, 18, 0, 12)
    LogoIcon.BackgroundTransparency = 1
    LogoIcon.Image = "rbxassetid://10723345518" -- Diamond / Shield icon
    LogoIcon.ImageColor3 = Color3.fromRGB(240, 240, 240)
    LogoIcon.Parent = Header

    local TitleLabel = Instance.new("TextLabel")
    TitleLabel.Position = UDim2.new(0, 50, 0, 10)
    TitleLabel.Size = UDim2.new(0, 160, 0, 16)
    TitleLabel.BackgroundTransparency = 1
    TitleLabel.Text = "INERTIA HUB"
    TitleLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    TitleLabel.TextSize = 13
    TitleLabel.Font = Enum.Font.GothamBold
    TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
    TitleLabel.Parent = Header

    local SubtitleLabel = Instance.new("TextLabel")
    SubtitleLabel.Position = UDim2.new(0, 50, 0, 26)
    SubtitleLabel.Size = UDim2.new(0, 160, 0, 12)
    SubtitleLabel.BackgroundTransparency = 1
    SubtitleLabel.Text = "Universal Execution Engine"
    SubtitleLabel.TextColor3 = Color3.fromRGB(113, 113, 122)
    SubtitleLabel.TextSize = 10
    SubtitleLabel.Font = Enum.Font.GothamMedium
    SubtitleLabel.TextXAlignment = Enum.TextXAlignment.Left
    SubtitleLabel.Parent = Header

    -- Badge
    local Badge = Instance.new("Frame")
    Badge.Size = UDim2.new(0, 72, 0, 20)
    Badge.Position = UDim2.new(1, -90, 0, 14)
    Badge.BackgroundColor3 = Color3.fromRGB(24, 24, 27)
    Badge.BorderSizePixel = 0
    Badge.Parent = Header

    local BadgeCorner = Instance.new("UICorner")
    BadgeCorner.CornerRadius = UDim.new(0, 6)
    BadgeCorner.Parent = Badge

    local BadgeLabel = Instance.new("TextLabel")
    BadgeLabel.Size = UDim2.new(1, 0, 1, 0)
    BadgeLabel.BackgroundTransparency = 1
    BadgeLabel.Text = executorName
    BadgeLabel.TextColor3 = Color3.fromRGB(161, 161, 170)
    BadgeLabel.TextSize = 9
    BadgeLabel.Font = Enum.Font.GothamBold
    BadgeLabel.Parent = Badge

    -- Status Text
    local StatusLabel = Instance.new("TextLabel")
    StatusLabel.Name = "StatusLabel"
    StatusLabel.Position = UDim2.new(0, 18, 0, 62)
    StatusLabel.Size = UDim2.new(1, -36, 0, 20)
    StatusLabel.BackgroundTransparency = 1
    StatusLabel.Text = "Detecting environment..."
    StatusLabel.TextColor3 = Color3.fromRGB(212, 212, 216)
    StatusLabel.TextSize = 11
    StatusLabel.Font = Enum.Font.GothamMedium
    StatusLabel.TextXAlignment = Enum.TextXAlignment.Left
    StatusLabel.Parent = MainFrame

    -- Progress Bar Track
    local ProgressTrack = Instance.new("Frame")
    ProgressTrack.Name = "ProgressTrack"
    ProgressTrack.Position = UDim2.new(0, 18, 0, 92)
    ProgressTrack.Size = UDim2.new(1, -36, 0, 6)
    ProgressTrack.BackgroundColor3 = Color3.fromRGB(24, 24, 27)
    ProgressTrack.BorderSizePixel = 0
    ProgressTrack.Parent = MainFrame

    local ProgressCorner = Instance.new("UICorner")
    ProgressCorner.CornerRadius = UDim.new(0, 3)
    ProgressCorner.Parent = ProgressTrack

    local ProgressBar = Instance.new("Frame")
    ProgressBar.Name = "ProgressBar"
    ProgressBar.Size = UDim2.new(0, 0, 1, 0)
    ProgressBar.BackgroundColor3 = Color3.fromRGB(220, 220, 225)
    ProgressBar.BorderSizePixel = 0
    ProgressBar.Parent = ProgressTrack

    local BarCorner = Instance.new("UICorner")
    BarCorner.CornerRadius = UDim.new(0, 3)
    BarCorner.Parent = ProgressBar

    -- Footer / Info
    local FooterLabel = Instance.new("TextLabel")
    FooterLabel.Position = UDim2.new(0, 18, 0, 114)
    FooterLabel.Size = UDim2.new(1, -36, 0, 16)
    FooterLabel.BackgroundTransparency = 1
    FooterLabel.Text = "t.me/+QXgW7cwKsPc3MjA1 • v2.9"
    FooterLabel.TextColor3 = Color3.fromRGB(82, 82, 91)
    FooterLabel.TextSize = 9
    FooterLabel.Font = Enum.Font.Gotham
    FooterLabel.TextXAlignment = Enum.TextXAlignment.Right
    FooterLabel.Parent = MainFrame

    -- Fade In Animation
    TweenService:Create(MainFrame, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        BackgroundTransparency = 0
    }):Play()
    TweenService:Create(MainStroke, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        Transparency = 0
    }):Play()

    local function setProgress(pct, text)
        StatusLabel.Text = text
        TweenService:Create(ProgressBar, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
            Size = UDim2.new(math.clamp(pct, 0, 1), 0, 1, 0)
        }):Play()
    end

    local function dismiss()
        local tween = TweenService:Create(MainFrame, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
            BackgroundTransparency = 1,
            Position = UDim2.new(0.5, 0, 0.48, 0)
        })
        TweenService:Create(MainStroke, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In), {
            Transparency = 1
        }):Play()
        tween:Play()
        tween.Completed:Connect(function()
            ScreenGui:Destroy()
        end)
    end

    return { setProgress = setProgress, dismiss = dismiss }
end

-- Initialization Flow
local loader = createLoaderUI()
task.wait(0.2)

loader.setProgress(0.25, "Matching Game Universe...")

local MM2_PLACES = { [142823291] = true, [335132309] = true, [66654135] = true }
local PRESSURE_PLACES = { [12411473842] = true, [14120361937] = true }
local DEMONOLOGY_PLACES = { [15886981881] = true, [18451885664] = true }

local targetGame = "MM2"
local scriptEndpoint = "/scripts/mm2.lua"

if MM2_PLACES[PlaceId] then
    targetGame = "MM2"
    scriptEndpoint = "/scripts/mm2.lua"
elseif PRESSURE_PLACES[PlaceId] then
    targetGame = "Pressure"
    scriptEndpoint = "/scripts/pressure.lua"
elseif DEMONOLOGY_PLACES[PlaceId] then
    targetGame = "Demonology"
    scriptEndpoint = "/scripts/demonology.lua"
else
    -- Match by product name
    local pName = ""
    pcall(function()
        pName = string.lower(MarketplaceService:GetProductInfo(PlaceId).Name or "")
    end)
    if string.find(pName, "pressure") then
        targetGame = "Pressure"
        scriptEndpoint = "/scripts/pressure.lua"
    elseif string.find(pName, "demon") then
        targetGame = "Demonology"
        scriptEndpoint = "/scripts/demonology.lua"
    else
        targetGame = "MM2"
        scriptEndpoint = "/scripts/mm2.lua"
    end
end

loader.setProgress(0.55, "Identified Module: " .. targetGame)
reportTelemetry(targetGame)
task.wait(0.3)

loader.setProgress(0.85, "Downloading Payload from Hub...")

local targetUrl = BASE_URL .. scriptEndpoint
local fetchSuccess, scriptPayload = pcall(function()
    return game:HttpGet(targetUrl)
end)

-- Fallback if local server unreachable, fetch local cache or repo
if not fetchSuccess or not scriptPayload or #scriptPayload < 50 then
    local fallbackUrl = "https://raw.githubusercontent.com/Yanderov/lib/refs/heads/main/" .. string.lower(targetGame) .. ".lua"
    pcall(function()
        scriptPayload = game:HttpGet(fallbackUrl)
        fetchSuccess = true
    end)
end

if fetchSuccess and scriptPayload and #scriptPayload > 50 then
    loader.setProgress(1.0, "Executing " .. targetGame .. " Core...")
    task.wait(0.25)
    loader.dismiss()

    task.spawn(function()
        local executeSuccess, executeErr = pcall(function()
            loadstring(scriptPayload)()
        end)
        if not executeSuccess then
            warn("[InertiaHub Execution Error]: " .. tostring(executeErr))
        end
    end)

    -- ═══════════════════════════════════════════════════════
    --  OVERHEAD HUB USER TAG SYSTEM
    --  Every InertiaHub user sees a subtle tag above other hub users
    -- ═══════════════════════════════════════════════════════
    task.spawn(function()
        local RunService = game:GetService("RunService")
        local CollectionService = game:GetService("CollectionService")

        local HUB_TAG = "InertiaHubUser"
        local TAG_GUI_NAME = "InertiaOverheadTag"

        -- Mark self as hub user via CollectionService tag
        pcall(function()
            CollectionService:AddTag(LocalPlayer, HUB_TAG)
        end)

        -- Also set an attribute on the character's head for cross-client visibility
        local function markLocalCharacter()
            local char = LocalPlayer.Character
            if char then
                local head = char:FindFirstChild("Head")
                if head then
                    pcall(function()
                        head:SetAttribute(HUB_TAG, true)
                    end)
                end
            end
        end

        markLocalCharacter()
        LocalPlayer.CharacterAdded:Connect(function(char)
            task.wait(0.5)
            markLocalCharacter()
        end)

        -- Create overhead tag for a given player
        local function createOverheadTag(player)
            if player == LocalPlayer then return end

            local char = player.Character
            if not char then return end
            local head = char:FindFirstChild("Head")
            if not head then return end

            -- Don't duplicate
            if head:FindFirstChild(TAG_GUI_NAME) then return end

            -- Check if they have the hub attribute
            local isHubUser = false
            pcall(function()
                isHubUser = head:GetAttribute(HUB_TAG) == true
            end)
            if not isHubUser then return end

            local bb = Instance.new("BillboardGui")
            bb.Name = TAG_GUI_NAME
            bb.Adornee = head
            bb.Size = UDim2.new(0, 120, 0, 24)
            bb.StudsOffset = Vector3.new(0, 2.5, 0)
            bb.AlwaysOnTop = true
            bb.MaxDistance = 60

            local tag = Instance.new("TextLabel")
            tag.Size = UDim2.new(1, 0, 1, 0)
            tag.BackgroundColor3 = Color3.fromRGB(18, 18, 20)
            tag.BackgroundTransparency = 0.25
            tag.Text = "INERTIA HUB"
            tag.TextColor3 = Color3.fromRGB(210, 210, 215)
            tag.TextSize = 10
            tag.Font = Enum.Font.GothamBold
            tag.TextTransparency = 0
            tag.Parent = bb

            local corner = Instance.new("UICorner")
            corner.CornerRadius = UDim.new(0, 6)
            corner.Parent = tag

            local stroke = Instance.new("UIStroke")
            stroke.Color = Color3.fromRGB(50, 50, 55)
            stroke.Thickness = 1
            stroke.Parent = tag

            local padding = Instance.new("UIPadding")
            padding.PaddingLeft = UDim.new(0, 6)
            padding.PaddingRight = UDim.new(0, 6)
            padding.Parent = tag

            bb.Parent = head
        end

        -- Scan all current and future players
        local function scanPlayers()
            for _, player in ipairs(Players:GetPlayers()) do
                if player ~= LocalPlayer and player.Character then
                    pcall(function()
                        createOverheadTag(player)
                    end)
                end
            end
        end

        Players.PlayerAdded:Connect(function(player)
            player.CharacterAdded:Connect(function()
                task.wait(1)
                createOverheadTag(player)
            end)
        end)

        for _, player in ipairs(Players:GetPlayers()) do
            if player ~= LocalPlayer then
                player.CharacterAdded:Connect(function()
                    task.wait(1)
                    createOverheadTag(player)
                end)
            end
        end

        -- Poll every 3 seconds to pick up new hub users
        task.spawn(function()
            while task.wait(3) do
                pcall(scanPlayers)
            end
        end)

        -- Initial scan after a short delay
        task.wait(2)
        scanPlayers()
    end)
else
    loader.setProgress(1.0, "Failed to load script payload.")
    task.wait(1.5)
    loader.dismiss()
end

