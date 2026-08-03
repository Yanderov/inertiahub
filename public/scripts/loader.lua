local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local MarketplaceService = game:GetService("MarketplaceService")
local UIS = game:GetService("UserInputService")
local PlaceId = game.PlaceId
local BASE = "https://inertiahub.xyz"

local function fetch(url)
    local ok, body = pcall(function() return game:HttpGet(url) end)
    if ok and body and #body > 10 then return body end
    return nil
end

-- Game detection
local MM2_PLACES = { [142823291] = true, [335132309] = true, [66654135] = true }
local PRESSURE_PLACES = { [12411473842] = true, [14120361937] = true }
local DEMONOLOGY_PLACES = { [15886981881] = true, [18451885664] = true }

local scriptSlug = "universal"
if MM2_PLACES[PlaceId] then scriptSlug = "mm2"
elseif PRESSURE_PLACES[PlaceId] then scriptSlug = "pressure"
elseif DEMONOLOGY_PLACES[PlaceId] then scriptSlug = "demonology"
else
    local pName = ""
    pcall(function() pName = string.lower(MarketplaceService:GetProductInfo(PlaceId).Name or "") end)
    if string.find(pName, "murder") or string.find(pName, "mm2") then scriptSlug = "mm2"
    elseif string.find(pName, "pressure") then scriptSlug = "pressure"
    elseif string.find(pName, "demon") then scriptSlug = "demonology"
    end
end

-- Mobile detection
local isMobile = UIS.TouchEnabled and not UIS.KeyboardEnabled
if isMobile then scriptSlug = scriptSlug .. "_mobile" end

-- Download and execute
local tokenBody = fetch(BASE .. "/api/v1/script/token?game=" .. scriptSlug)
if tokenBody then
    local tokenData = HttpService:JSONDecode(tokenBody)
    if tokenData and tokenData.token then
        local payload = fetch(BASE .. "/api/v1/script/" .. scriptSlug .. "?token=" .. tokenData.token .. "&exp=" .. tokenData.exp)
        if payload then
            task.spawn(function()
                local ok, err = pcall(function() loadstring(payload)() end)
                if not ok then warn("[Inertia] " .. tostring(err)) end
            end)
        end
    end
end
